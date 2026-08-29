import { escapeHtml, gravatarUrlFromHash, sanitizeCommentBody, type CommentReaction, type CommentStatus, type PublicComment } from "@emtech/comments-shared";
import type { CommentRow, Env, SessionUser } from "../types";

type CommentReactionRow = {
	comment_id: string;
	emoji: string;
	count: number;
};

type PublicCommentOptions = {
	currentGithubUserId?: number | null;
	redactDeleted?: boolean;
};

export function publicCommentFromRow(row: CommentRow, reactions: CommentReaction[] = [], options: PublicCommentOptions = {}): PublicComment {
	const deleted = row.status === "deleted";
	const redactDeleted = deleted && options.redactDeleted;
	const isGithub = row.author_type === "github";
	const name = redactDeleted ? "已刪除的留言" : (row.github_login ?? row.author_name ?? "Anonymous");
	const avatarUrl = redactDeleted ? null : isGithub ? row.github_avatar_url : row.email_hash ? gravatarUrlFromHash(row.email_hash) : null;

	return {
		id: row.id,
		pagePath: row.page_path,
		parentId: row.parent_id,
		body: redactDeleted ? "此留言已由作者刪除。" : sanitizeCommentBody(row.body),
		deleted,
		author: {
			type: redactDeleted ? "anonymous" : row.author_type,
			name: escapeHtml(name),
			avatarUrl
		},
		meta: {
			device: redactDeleted ? null : row.device_label ? escapeHtml(row.device_label) : null,
			browser: redactDeleted ? null : row.browser_label ? escapeHtml(row.browser_label) : null,
			location: redactDeleted ? null : row.location_label ? escapeHtml(row.location_label) : null
		},
		reactions: redactDeleted ? [] : reactions,
		capabilities: {
			canDelete: !deleted && options.currentGithubUserId != null && row.github_user_id === options.currentGithubUserId
		},
		createdAt: row.created_at
	};
}

export async function listApprovedComments(env: Env, pagePath: string, currentGithubUserId: number | null = null): Promise<PublicComment[]> {
	const { results } = await env.COMMENTS_DB.prepare(
		`SELECT id, page_path, parent_id, body, author_type, author_name, email_hash, github_user_id, github_login, github_avatar_url, status, device_label, browser_label, location_label, created_at, updated_at
		 FROM comments
		 WHERE page_path = ? AND status IN ('approved', 'deleted')
		 ORDER BY created_at ASC`
	)
		.bind(pagePath)
		.all<CommentRow>();
	const visibleRows = visibleCommentRows(results);

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

	return visibleRows.map(row =>
		publicCommentFromRow(row, reactionsByComment.get(row.id), {
			currentGithubUserId,
			redactDeleted: true
		})
	);
}

export function visibleCommentRows(rows: CommentRow[]): CommentRow[] {
	const rowsById = new Map(rows.map(row => [row.id, row]));
	const visibleIds = new Set(rows.filter(row => row.status === "approved").map(row => row.id));

	for (const row of rows) {
		if (row.status !== "approved") continue;
		let parentId = row.parent_id;
		const visited = new Set<string>();
		while (parentId && !visited.has(parentId)) {
			visited.add(parentId);
			const parent = rowsById.get(parentId);
			if (!parent || parent.status !== "deleted") break;
			visibleIds.add(parent.id);
			parentId = parent.parent_id;
		}
	}

	return rows.filter(row => visibleIds.has(row.id));
}

export async function deleteCommentOwnedBy(env: Env, commentId: string, githubUserId: number): Promise<boolean> {
	const result = await env.COMMENTS_DB.prepare("UPDATE comments SET status = 'deleted', updated_at = ? WHERE id = ? AND github_user_id = ? AND status != 'deleted'")
		.bind(new Date().toISOString(), commentId, githubUserId)
		.run();
	return result.meta.changes > 0;
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
		notificationEmailCiphertext: string | null;
		status: CommentStatus;
		ipHash: string | null;
		userAgentHash: string | null;
		deviceLabel: string | null;
		browserLabel: string | null;
		locationLabel: string | null;
		user: SessionUser | null;
	}
): Promise<string> {
	const now = new Date().toISOString();
	const authorType = data.user ? "github" : data.emailHash ? "gravatar" : data.name ? "named" : "anonymous";

	await env.COMMENTS_DB.prepare(
		`INSERT INTO comments (
			id, page_path, parent_id, body, author_type, author_name, email_hash,
			notification_email_ciphertext, github_user_id, github_login, github_avatar_url, status, ip_hash,
			user_agent_hash, device_label, browser_label, location_label, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	)
		.bind(
			data.id,
			data.pagePath,
			data.parentId,
			data.body,
			authorType,
			data.user ? data.user.login : data.name,
			data.emailHash,
			data.notificationEmailCiphertext,
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
	return now;
}
