import { escapeHtml, gravatarUrlFromHash, sanitizeCommentBody, type CommentStatus, type PublicComment } from "@emtech/comments-shared";
import type { CommentRow, Env, SessionUser } from "../types";

export function publicCommentFromRow(row: CommentRow): PublicComment {
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

	return results.map(publicCommentFromRow);
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
