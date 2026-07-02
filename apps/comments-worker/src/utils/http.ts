import type { AppContext } from "../types";

export function allowedOrigin(request: Request, allowedOrigins: string): string | null {
	const origin = request.headers.get("Origin");
	if (!origin) return null;
	const allowed = allowedOrigins
		.split(",")
		.map(item => item.trim())
		.filter(Boolean);
	if (allowed.includes(origin)) return origin;
	if (allowed.some(isLoopbackOrigin) && isLoopbackOrigin(origin)) return origin;
	return null;
}

function isLoopbackOrigin(origin: string): boolean {
	try {
		const url = new URL(origin);
		return (url.protocol === "http:" || url.protocol === "https:") && (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]");
	} catch {
		return false;
	}
}

export function corsHeaders(request: Request, allowedOrigins: string): HeadersInit {
	const origin = allowedOrigin(request, allowedOrigins);
	if (!origin) return {};
	return {
		"Access-Control-Allow-Credentials": "true",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Origin": origin,
		Vary: "Origin"
	};
}

export function json(data: unknown, init: ResponseInit = {}, cors: HeadersInit = {}): Response {
	return new Response(JSON.stringify(data), {
		...init,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			...cors,
			...init.headers
		}
	});
}

export function html(body: string, init: ResponseInit = {}, cors: HeadersInit = {}): Response {
	return new Response(body, {
		...init,
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			...cors,
			...init.headers
		}
	});
}

export function redirect(location: string, headers: HeadersInit = {}): Response {
	return new Response(null, {
		status: 302,
		headers: {
			Location: location,
			...headers
		}
	});
}

export function parseCookies(request: Request): Map<string, string> {
	const cookies = new Map<string, string>();
	const header = request.headers.get("Cookie");
	if (!header) return cookies;
	for (const part of header.split(";")) {
		const [name, ...rest] = part.trim().split("=");
		if (!name) continue;
		cookies.set(name, decodeURIComponent(rest.join("=")));
	}
	return cookies;
}

export function serializeCookie(name: string, value: string, options: { maxAge?: number; path?: string; secure?: boolean } = {}): string {
	const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${options.path ?? "/"}`, "HttpOnly", "SameSite=Lax"];
	if (options.secure !== false) {
		parts.push("Secure");
	}
	if (typeof options.maxAge === "number") {
		parts.push(`Max-Age=${options.maxAge}`);
	}
	return parts.join("; ");
}

export function shouldUseSecureCookie(request: Request): boolean {
	const url = new URL(request.url);
	if (url.protocol === "https:") return true;
	return url.hostname !== "localhost" && url.hostname !== "127.0.0.1";
}

export function clientIp(request: Request): string {
	return request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ?? "0.0.0.0";
}

export async function readJson(request: Request): Promise<unknown> {
	if (!request.headers.get("Content-Type")?.toLowerCase().includes("application/json")) {
		throw new Response(JSON.stringify({ error: "Expected application/json" }), { status: 415 });
	}
	return request.json();
}

export function routeNotFound(ctx: AppContext): Response {
	return json({ error: "Not found" }, { status: 404 }, ctx.corsHeaders);
}

export function sanitizeReturnTo(value: string | null): string {
	if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
	return value;
}

export function sanitizeOAuthReturnTo(value: string | null, allowedOrigins: string): string {
	if (!value) return "/";
	if (value.startsWith("/") && !value.startsWith("//")) return value;

	try {
		const url = new URL(value);
		const allowed = allowedOrigins
			.split(",")
			.map(item => item.trim())
			.filter(Boolean);
		return allowed.includes(url.origin) ? url.toString() : "/";
	} catch {
		return "/";
	}
}
