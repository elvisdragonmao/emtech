import type { Env } from "../types";

export function publicBlogOrigin(env: Env): string {
	const configured = parseHttpOrigin(env.BLOG_ORIGIN ?? "");
	if (configured) return configured;

	const origins = env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim());
	const publicOrigin = origins.map(parseHttpOrigin).find(origin => origin && !isLoopbackHostname(new URL(origin).hostname));
	if (publicOrigin) return publicOrigin;
	return origins.map(parseHttpOrigin).find((origin): origin is string => Boolean(origin)) ?? "https://emtech.cc";
}

export function publicApiOrigin(env: Env): string {
	return parseHttpOrigin(env.GITHUB_REDIRECT_URI) ?? "https://api.emtech.cc";
}

function parseHttpOrigin(origin: string): string | null {
	if (!origin) return null;
	try {
		const url = new URL(origin);
		if (url.protocol !== "http:" && url.protocol !== "https:") return null;
		return url.origin;
	} catch {
		return null;
	}
}

function isLoopbackHostname(hostname: string): boolean {
	return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
}
