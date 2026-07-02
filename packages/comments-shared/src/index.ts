export type AuthorType = "anonymous" | "named" | "gravatar" | "github";
export type CommentStatus = "pending" | "approved" | "rejected" | "spam" | "deleted";

export type PublicComment = {
	id: string;
	pagePath: string;
	parentId: string | null;
	body: string;
	author: {
		type: AuthorType;
		name: string;
		avatarUrl: string | null;
	};
	meta: {
		device: string | null;
		browser: string | null;
		location: string | null;
	};
	createdAt: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
	return EMAIL_PATTERN.test(normalizeEmail(email));
}

export async function sha256Hex(input: string): Promise<string> {
	const data = new TextEncoder().encode(input);
	const digest = await crypto.subtle.digest("SHA-256", data);
	return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function emailHash(email: string): Promise<string> {
	const normalized = normalizeEmail(email);
	if (!isValidEmail(normalized)) {
		throw new Error("Invalid email");
	}

	return sha256Hex(normalized);
}

export function gravatarUrlFromHash(hash: string, size = 96, defaultImage = "404"): string {
	const safeSize = Number.isFinite(size) ? Math.min(Math.max(Math.trunc(size), 1), 2048) : 96;
	return `https://www.gravatar.com/avatar/${hash}?s=${safeSize}&d=${encodeURIComponent(defaultImage)}&r=g`;
}

export async function gravatarUrlForEmail(email: string, size = 96): Promise<string> {
	return gravatarUrlFromHash(await emailHash(email), size);
}

export function escapeHtml(value: string): string {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

export function sanitizeCommentBody(body: string): string {
	return escapeHtml(body.trim().replace(CONTROL_CHAR_PATTERN, ""));
}

export type SpamCheckResult = {
	action: "allow" | "pending" | "spam";
	reasons: string[];
};

export function checkSpam(body: string): SpamCheckResult {
	const trimmed = body.trim();
	const reasons: string[] = [];
	const links = trimmed.match(/https?:\/\/|www\./gi)?.length ?? 0;
	const controlChars = trimmed.match(CONTROL_CHAR_PATTERN)?.length ?? 0;
	const compact = trimmed.toLowerCase().replace(/\s+/g, "");

	if (trimmed.length < 2) {
		reasons.push("too_short");
	}

	if (links > 3) {
		reasons.push("too_many_links");
	}

	if (compact.length >= 12) {
		const half = Math.floor(compact.length / 2);
		if (compact.slice(0, half) === compact.slice(half, half * 2)) {
			reasons.push("repeated_text");
		}
	}

	if (controlChars > 3 || controlChars / Math.max(trimmed.length, 1) > 0.05) {
		reasons.push("control_chars");
	}

	if (reasons.includes("too_many_links") || reasons.includes("control_chars")) {
		return { action: "spam", reasons };
	}

	if (reasons.length > 0) {
		return { action: "pending", reasons };
	}

	return { action: "allow", reasons };
}
