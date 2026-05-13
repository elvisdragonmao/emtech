import type { Env, GithubUser } from "../types";
import { randomId, secretHash } from "../utils/crypto";
import { redirect, sanitizeOAuthReturnTo } from "../utils/http";
import { createSession } from "./session";

const STATE_TTL_SECONDS = 60 * 10;

export async function startGithubOAuth(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const returnTo = sanitizeOAuthReturnTo(url.searchParams.get("returnTo"), env.ALLOWED_ORIGINS ?? "");
	const state = randomId();
	const stateHash = await secretHash(state, env.SESSION_SECRET);
	const now = new Date();
	const expiresAt = new Date(now.getTime() + STATE_TTL_SECONDS * 1000).toISOString();

	await env.COMMENTS_DB.prepare("INSERT INTO oauth_states (state_hash, return_to, expires_at, created_at) VALUES (?, ?, ?, ?)").bind(stateHash, returnTo, expiresAt, now.toISOString()).run();

	const authorize = new URL("https://github.com/login/oauth/authorize");
	authorize.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
	authorize.searchParams.set("redirect_uri", env.GITHUB_REDIRECT_URI);
	authorize.searchParams.set("state", state);
	authorize.searchParams.set("scope", "read:user");

	return redirect(authorize.toString());
}

export async function handleGithubCallback(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	if (!code || !state) {
		return redirect("/?commentAuth=failed");
	}

	const stateHash = await secretHash(state, env.SESSION_SECRET);
	const stateRow = await env.COMMENTS_DB.prepare("SELECT return_to AS returnTo FROM oauth_states WHERE state_hash = ? AND expires_at > ?")
		.bind(stateHash, new Date().toISOString())
		.first<{ returnTo: string }>();

	await env.COMMENTS_DB.prepare("DELETE FROM oauth_states WHERE state_hash = ?").bind(stateHash).run();

	if (!stateRow) {
		return redirect("/?commentAuth=invalid-state");
	}

	const token = await exchangeCodeForToken(code, env);
	const user = await fetchGithubUser(token);
	await upsertGithubAccount(env, user);
	const cookie = await createSession(request, env, user.id);

	return redirect(stateRow.returnTo, { "Set-Cookie": cookie });
}

async function exchangeCodeForToken(code: string, env: Env): Promise<string> {
	const response = await fetch("https://github.com/login/oauth/access_token", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"User-Agent": "emtech-comments-worker"
		},
		body: JSON.stringify({
			client_id: env.GITHUB_CLIENT_ID,
			client_secret: env.GITHUB_CLIENT_SECRET,
			code,
			redirect_uri: env.GITHUB_REDIRECT_URI
		})
	});

	const data = (await response.json()) as { access_token?: string; error?: string };
	if (!response.ok || !data.access_token) {
		throw new Error(data.error ?? "GitHub OAuth token exchange failed");
	}

	return data.access_token;
}

async function fetchGithubUser(token: string): Promise<GithubUser> {
	const response = await fetch("https://api.github.com/user", {
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${token}`,
			"User-Agent": "emtech-comments-worker"
		}
	});

	if (!response.ok) {
		throw new Error("GitHub user fetch failed");
	}

	return response.json<GithubUser>();
}

async function upsertGithubAccount(env: Env, user: GithubUser): Promise<void> {
	const now = new Date().toISOString();
	await env.COMMENTS_DB.prepare(
		`INSERT INTO github_accounts (github_user_id, github_login, avatar_url, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?)
		 ON CONFLICT(github_user_id) DO UPDATE SET
		 github_login = excluded.github_login,
		 avatar_url = excluded.avatar_url,
		 updated_at = excluded.updated_at`
	)
		.bind(user.id, user.login, user.avatar_url, now, now)
		.run();
}
