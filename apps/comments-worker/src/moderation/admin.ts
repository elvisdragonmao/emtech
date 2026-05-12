import type { CommentStatus } from "@emtech/comments-shared";
import type { AppContext, CommentRow } from "../types";
import { publicCommentFromRow } from "../db/comments";
import { randomId } from "../utils/crypto";
import { json } from "../utils/http";
import { adminStatusSchema } from "../utils/validation";

export function requireAdminToken(ctx: AppContext): Response | null {
	const auth = ctx.request.headers.get("Authorization");
	const token = auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : null;
	if (!token || token !== ctx.env.ADMIN_TOKEN) {
		return json({ error: "Unauthorized" }, { status: 401 }, ctx.corsHeaders);
	}
	return null;
}

export async function listAdminComments(ctx: AppContext): Promise<Response> {
	const unauthorized = requireAdminToken(ctx);
	if (unauthorized) return unauthorized;

	const parsed = adminStatusSchema.safeParse({ status: ctx.url.searchParams.get("status") ?? "pending" });
	if (!parsed.success) {
		return json({ error: "Invalid status" }, { status: 400 }, ctx.corsHeaders);
	}

	const { results } = await ctx.env.COMMENTS_DB.prepare(
		`SELECT id, page_path, parent_id, body, author_type, author_name, email_hash, github_user_id, github_login, github_avatar_url, status, created_at, updated_at
		 FROM comments
		 WHERE status = ?
		 ORDER BY created_at DESC
		 LIMIT 100`
	)
		.bind(parsed.data.status)
		.all<CommentRow>();

	return json(
		{
			comments: results.map(row => ({
				...publicCommentFromRow(row),
				status: row.status,
				githubLogin: row.github_login
			}))
		},
		{},
		ctx.corsHeaders
	);
}

export async function moderateComment(ctx: AppContext, commentId: string, action: "approve" | "reject" | "delete"): Promise<Response> {
	const unauthorized = requireAdminToken(ctx);
	if (unauthorized) return unauthorized;

	const statusByAction = {
		approve: "approved",
		delete: "deleted",
		reject: "rejected"
	} satisfies Record<typeof action, CommentStatus>;

	const status = statusByAction[action];
	const now = new Date().toISOString();
	const result = await ctx.env.COMMENTS_DB.prepare("UPDATE comments SET status = ?, updated_at = ? WHERE id = ?").bind(status, now, commentId).run();
	if (result.meta.changes === 0) {
		return json({ error: "Comment not found" }, { status: 404 }, ctx.corsHeaders);
	}

	await ctx.env.COMMENTS_DB.prepare("INSERT INTO moderation_log (id, comment_id, action, reason, created_at) VALUES (?, ?, ?, ?, ?)")
		.bind(randomId(), commentId, action, null, now)
		.run();

	return json({ ok: true, id: commentId, status }, {}, ctx.corsHeaders);
}
