import { sha256Hex } from "@emtech/comments-shared";

const encoder = new TextEncoder();

function base64Url(bytes: ArrayBuffer): string {
	const binary = String.fromCharCode(...new Uint8Array(bytes));
	return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export async function hmacSha256Base64Url(secret: string, value: string): Promise<string> {
	const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
	const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
	return base64Url(signature);
}

export async function signedValue(value: string, secret: string): Promise<string> {
	return `${value}.${await hmacSha256Base64Url(secret, value)}`;
}

export async function verifySignedValue(signed: string | null, secret: string): Promise<string | null> {
	if (!signed) return null;
	const dot = signed.lastIndexOf(".");
	if (dot < 1) return null;
	const value = signed.slice(0, dot);
	const signature = signed.slice(dot + 1);
	const expected = await hmacSha256Base64Url(secret, value);
	return timingSafeEqual(signature, expected) ? value : null;
}

export function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let result = 0;
	for (let i = 0; i < a.length; i += 1) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return result === 0;
}

export async function secretHash(value: string, secret: string): Promise<string> {
	return sha256Hex(`${secret}:${value}`);
}

export async function hashIp(ip: string, secret: string): Promise<string> {
	return secretHash(ip, secret);
}

export function randomId(): string {
	return crypto.randomUUID();
}
