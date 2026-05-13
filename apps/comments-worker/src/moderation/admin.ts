import type { CommentStatus } from "@emtech/comments-shared";
import { getSessionUser } from "../auth/session";
import { publicCommentFromRow } from "../db/comments";
import type { AppContext, CommentRow } from "../types";
import { randomId } from "../utils/crypto";
import { json } from "../utils/http";
import { adminStatusSchema } from "../utils/validation";

const ADMIN_GITHUB_LOGIN = "elvisdragonmao";

export async function requireAdminUser(ctx: AppContext): Promise<Response | null> {
	const user = await getSessionUser(ctx.request, ctx.env);
	if (!user) {
		return json({ error: "Unauthorized" }, { status: 401 }, ctx.corsHeaders);
	}

	if (user.login !== ADMIN_GITHUB_LOGIN) {
		return json({ error: "Forbidden" }, { status: 403 }, ctx.corsHeaders);
	}

	return null;
}

export async function listAdminComments(ctx: AppContext): Promise<Response> {
	const unauthorized = await requireAdminUser(ctx);
	if (unauthorized) return unauthorized;

	const parsed = adminStatusSchema.safeParse({ status: ctx.url.searchParams.get("status") ?? "pending" });
	if (!parsed.success) {
		return json({ error: "Invalid status" }, { status: 400 }, ctx.corsHeaders);
	}

	const { results } = await ctx.env.COMMENTS_DB.prepare(
		`SELECT id, page_path, parent_id, body, author_type, author_name, email_hash, github_user_id, github_login, github_avatar_url, status, device_label, browser_label, location_label, created_at, updated_at
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
	const unauthorized = await requireAdminUser(ctx);
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

	await ctx.env.COMMENTS_DB.prepare("INSERT INTO moderation_log (id, comment_id, action, reason, created_at) VALUES (?, ?, ?, ?, ?)").bind(randomId(), commentId, action, null, now).run();

	return json({ ok: true, id: commentId, status }, {}, ctx.corsHeaders);
}
