import { listAdminComments, moderateComment } from "./moderation/admin";
import { adminUi } from "./routes/admin-ui";
import { authMe, githubCallback, githubStart, logout } from "./routes/auth";
import { createComment, listComments } from "./routes/comments";
import type { AppContext, Env } from "./types";
import { corsHeaders, json, routeNotFound } from "./utils/http";

export default {
	fetch(request: Request, env: Env, executionCtx: ExecutionContext): Promise<Response> {
		return Promise.resolve(handleFetch(request, env, executionCtx));
	}
};

async function handleFetch(request: Request, env: Env, executionCtx: ExecutionContext): Promise<Response> {
	const headers = corsHeaders(request, env.ALLOWED_ORIGINS ?? "");

	if (request.method === "OPTIONS") {
		return new Response(null, { status: 204, headers });
	}

	const url = new URL(request.url);
	const ctx: AppContext = { request, env, url, corsHeaders: headers, executionCtx };

	try {
		return await route(ctx);
	} catch (error) {
		if (error instanceof Response) {
			const responseHeaders = new Headers(error.headers);
			for (const [key, value] of Object.entries(headers)) {
				responseHeaders.set(key, value);
			}
			return new Response(error.body, { status: error.status, statusText: error.statusText, headers: responseHeaders });
		}

		console.error(error);
		return json({ error: "Internal server error" }, { status: 500 }, headers);
	}
}

async function route(ctx: AppContext): Promise<Response> {
	const { pathname } = ctx.url;
	const method = ctx.request.method;

	if (method === "GET" && pathname === "/") {
		return json({ ok: true, service: "emtech-comments-worker" }, {}, ctx.corsHeaders);
	}

	if (method === "GET" && pathname === "/admin") return adminUi(ctx);

	if (method === "GET" && pathname === "/api/comments") return listComments(ctx);
	if (method === "POST" && pathname === "/api/comments") return createComment(ctx);

	if (method === "GET" && pathname === "/api/auth/github/start") return githubStart(ctx);
	if (method === "GET" && pathname === "/api/auth/github/callback") return githubCallback(ctx);
	if (method === "GET" && pathname === "/api/auth/me") return authMe(ctx);
	if (method === "POST" && pathname === "/api/auth/logout") return logout(ctx);

	if (method === "GET" && pathname === "/api/admin/comments") return listAdminComments(ctx);

	const moderationMatch = pathname.match(/^\/api\/admin\/comments\/([^/]+)\/(approve|reject|delete)$/);
	if (method === "POST" && moderationMatch) {
		const id = moderationMatch[1];
		const action = moderationMatch[2];
		if (!id || !isModerationAction(action)) {
			return routeNotFound(ctx);
		}
		return moderateComment(ctx, decodeURIComponent(id), action);
	}

	return routeNotFound(ctx);
}

function isModerationAction(action: string | undefined): action is "approve" | "reject" | "delete" {
	return action === "approve" || action === "reject" || action === "delete";
}
