import { handleGithubCallback, startGithubOAuth } from "../auth/github";
import { clearSessionCookie, getSessionUser } from "../auth/session";
import type { AppContext } from "../types";
import { json } from "../utils/http";

export async function githubStart(ctx: AppContext): Promise<Response> {
	return startGithubOAuth(ctx.request, ctx.env);
}

export async function githubCallback(ctx: AppContext): Promise<Response> {
	return handleGithubCallback(ctx.request, ctx.env);
}

export async function authMe(ctx: AppContext): Promise<Response> {
	const user = await getSessionUser(ctx.request, ctx.env);
	if (!user) {
		return json({ authenticated: false }, {}, ctx.corsHeaders);
	}

	return json(
		{
			authenticated: true,
			user: {
				type: "github",
				githubUserId: user.githubUserId,
				login: user.login,
				avatarUrl: user.avatarUrl
			}
		},
		{},
		ctx.corsHeaders
	);
}

export function logout(ctx: AppContext): Response {
	return json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie() } }, ctx.corsHeaders);
}
