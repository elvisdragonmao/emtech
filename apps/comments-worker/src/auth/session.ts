import type { Env, SessionUser } from "../types";
import { randomId, secretHash, signedValue, verifySignedValue } from "../utils/crypto";
import { parseCookies, serializeCookie, shouldUseSecureCookie } from "../utils/http";

const COOKIE_NAME = "emtech_comments_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export async function createSession(request: Request, env: Env, githubUserId: number): Promise<string> {
	const sessionId = randomId();
	const sessionHash = await secretHash(sessionId, env.SESSION_SECRET);
	const now = new Date();
	const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000).toISOString();

	await env.COMMENTS_DB.prepare("INSERT INTO sessions (id, session_hash, github_user_id, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
		.bind(randomId(), sessionHash, githubUserId, expiresAt, now.toISOString())
		.run();

	return serializeCookie(COOKIE_NAME, await signedValue(sessionId, env.SESSION_SECRET), { maxAge: SESSION_TTL_SECONDS, secure: shouldUseSecureCookie(request) });
}

export async function getSessionUser(request: Request, env: Env): Promise<SessionUser | null> {
	const signed = parseCookies(request).get(COOKIE_NAME) ?? null;
	const sessionId = await verifySignedValue(signed, env.SESSION_SECRET);
	if (!sessionId) return null;

	const sessionHash = await secretHash(sessionId, env.SESSION_SECRET);
	const row = await env.COMMENTS_DB.prepare(
		`SELECT github_accounts.github_user_id AS githubUserId, github_accounts.github_login AS login, github_accounts.avatar_url AS avatarUrl
		 FROM sessions
		 JOIN github_accounts ON github_accounts.github_user_id = sessions.github_user_id
		 WHERE sessions.session_hash = ? AND sessions.expires_at > ?`
	)
		.bind(sessionHash, new Date().toISOString())
		.first<SessionUser>();

	return row ?? null;
}

export function clearSessionCookie(request: Request): string {
	return serializeCookie(COOKIE_NAME, "", { maxAge: 0, secure: shouldUseSecureCookie(request) });
}
