import { escapeHtml, gravatarUrlFromHash, sanitizeCommentBody, type CommentReaction, type CommentStatus, type PublicComment } from "@emtech/comments-shared";
import type { CommentRow, Env, SessionUser } from "../types";

type CommentReactionRow = {
	comment_id: string;
	emoji: string;
	count: number;
};

export function publicCommentFromRow(row: CommentRow, reactions: CommentReaction[] = []): PublicComment {
	const isGithub = row.author_type === "github";
	const name = row.github_login ?? row.author_name ?? "Anonymous";
	const avatarUrl = isGithub ? row.github_avatar_url : row.email_hash ? gravatarUrlFromHash(row.email_hash) : null;

	return {
		id: row.id,
		pagePath: row.page_path,
		parentId: row.parent_id,
		body: sanitizeCommentBody(row.body),
		author: {
			type: row.author_type,
			name: escapeHtml(name),
			avatarUrl
		},
		meta: {
			device: row.device_label ? escapeHtml(row.device_label) : null,
			browser: row.browser_label ? escapeHtml(row.browser_label) : null,
			location: row.location_label ? escapeHtml(row.location_label) : null
		},
		reactions,
		createdAt: row.created_at
	};
}

export async function listApprovedComments(env: Env, pagePath: string): Promise<PublicComment[]> {
	const { results } = await env.COMMENTS_DB.prepare(
		`SELECT id, page_path, parent_id, body, author_type, author_name, email_hash, github_user_id, github_login, github_avatar_url, status, device_label, browser_label, location_label, created_at, updated_at
		 FROM comments
		 WHERE page_path = ? AND status = 'approved'
		 ORDER BY created_at ASC`
	)
		.bind(pagePath)
		.all<CommentRow>();

	const reactionsByComment = new Map<string, CommentReaction[]>();
	const { results: reactionRows } = await env.COMMENTS_DB.prepare(
		`SELECT comment_id, emoji, COUNT(*) AS count
		 FROM comment_reactions
		 WHERE comment_id IN (
			 SELECT id FROM comments WHERE page_path = ? AND status = 'approved'
		 )
		 GROUP BY comment_id, emoji
		 ORDER BY MIN(created_at) ASC, emoji ASC`
	)
		.bind(pagePath)
		.all<CommentReactionRow>();

	for (const reaction of reactionRows) {
		const commentReactions = reactionsByComment.get(reaction.comment_id) ?? [];
		commentReactions.push({ emoji: reaction.emoji, count: Number(reaction.count) });
		reactionsByComment.set(reaction.comment_id, commentReactions);
	}

	return results.map(row => publicCommentFromRow(row, reactionsByComment.get(row.id)));
}

export async function setCommentReaction(env: Env, data: { commentId: string; visitorHash: string; emoji: string; active: boolean }): Promise<CommentReaction[] | null> {
	const comment = await env.COMMENTS_DB.prepare("SELECT id FROM comments WHERE id = ? AND status = 'approved'").bind(data.commentId).first();
	if (!comment) return null;

	if (data.active) {
		await env.COMMENTS_DB.prepare("INSERT OR IGNORE INTO comment_reactions (comment_id, visitor_hash, emoji, created_at) VALUES (?, ?, ?, ?)")
			.bind(data.commentId, data.visitorHash, data.emoji, new Date().toISOString())
			.run();
	} else {
		await env.COMMENTS_DB.prepare("DELETE FROM comment_reactions WHERE comment_id = ? AND visitor_hash = ? AND emoji = ?").bind(data.commentId, data.visitorHash, data.emoji).run();
	}

	const { results } = await env.COMMENTS_DB.prepare(
		`SELECT comment_id, emoji, COUNT(*) AS count
		 FROM comment_reactions
		 WHERE comment_id = ?
		 GROUP BY comment_id, emoji
		 ORDER BY MIN(created_at) ASC, emoji ASC`
	)
		.bind(data.commentId)
		.all<CommentReactionRow>();

	return results.map(reaction => ({ emoji: reaction.emoji, count: Number(reaction.count) }));
}

export async function parentExists(env: Env, parentId: string, pagePath: string): Promise<boolean> {
	const row = await env.COMMENTS_DB.prepare("SELECT id FROM comments WHERE id = ? AND page_path = ? AND status != 'deleted'").bind(parentId, pagePath).first();
	return Boolean(row);
}

export async function insertComment(
	env: Env,
	data: {
		id: string;
		pagePath: string;
		parentId: string | null;
		body: string;
		name: string | null;
		emailHash: string | null;
		status: CommentStatus;
		ipHash: string | null;
		userAgentHash: string | null;
		deviceLabel: string | null;
		browserLabel: string | null;
		locationLabel: string | null;
		user: SessionUser | null;
	}
): Promise<void> {
	const now = new Date().toISOString();
	const authorType = data.user ? "github" : data.emailHash ? "gravatar" : data.name ? "named" : "anonymous";

	await env.COMMENTS_DB.prepare(
		`INSERT INTO comments (
			id, page_path, parent_id, body, author_type, author_name, email_hash,
			github_user_id, github_login, github_avatar_url, status, ip_hash,
			user_agent_hash, device_label, browser_label, location_label, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	)
		.bind(
			data.id,
			data.pagePath,
			data.parentId,
			data.body,
			authorType,
			data.user ? data.user.login : data.name,
			data.emailHash,
			data.user?.githubUserId ?? null,
			data.user?.login ?? null,
			data.user?.avatarUrl ?? null,
			data.status,
			data.ipHash,
			data.userAgentHash,
			data.deviceLabel,
			data.browserLabel,
			data.locationLabel,
			now,
			now
		)
		.run();
}
