import { gravatarUrlFromHash, sha256Hex } from "@emtech/comments-shared";
import { afterEach, describe, expect, it, vi } from "vitest";
import { notifyDiscordComment } from "../src/notifications/discord";
import type { Env, SessionUser } from "../src/types";

type DiscordPayload = {
	avatar_url?: string;
	allowed_mentions?: { parse: string[] };
	embeds: Array<{
		fields: Array<{ name: string; value: string; inline: boolean }>;
	}>;
};

const githubUser: SessionUser = {
	githubUserId: 123,
	login: "octocat",
	avatarUrl: "https://avatars.githubusercontent.com/u/123?v=4"
};

describe("Discord comment notifications", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("uses the user avatar, links the page path, and hides comment IDs", async () => {
		const payload = await sendNotificationPayload({
			id: "comment-id",
			pagePath: "/friends/",
			parentId: "parent-id",
			user: githubUser,
			emailHash: null
		});

		expect(payload.avatar_url).toBe(githubUser.avatarUrl);
		expect(payload.allowed_mentions).toEqual({ parse: [] });
		expect(payload.embeds[0]?.fields).toContainEqual({ name: "頁面", value: "[/friends/](https://emtech.cc/friends/)", inline: true });
		expect(payload.embeds[0]?.fields).toContainEqual({ name: "回覆", value: "是", inline: true });
		expect(payload.embeds[0]?.fields.map(field => field.name)).not.toContain("留言 ID");
		expect(JSON.stringify(payload.embeds[0]?.fields)).not.toContain("comment-id");
		expect(JSON.stringify(payload.embeds[0]?.fields)).not.toContain("parent-id");
	});

	it("uses Gravatar when an anonymous commenter provided email", async () => {
		const emailHash = "6f68582c0a2fbd783435fc9cf0b8f2eecdf1f371f24fd1b0e36fc8cbe319e676";
		const payload = await sendNotificationPayload({
			emailHash,
			user: null
		});

		expect(payload.avatar_url).toBe(gravatarUrlFromHash(emailHash, 96, "identicon"));
	});

	it("uses a deterministic fallback avatar when no remote avatar exists", async () => {
		const payload = await sendNotificationPayload({
			name: "Display Name",
			emailHash: null,
			user: null
		});

		expect(payload.avatar_url).toBe(gravatarUrlFromHash(await sha256Hex("Display Name"), 96, "identicon"));
	});
});

async function sendNotificationPayload(overrides: Partial<Parameters<typeof notifyDiscordComment>[1]>): Promise<DiscordPayload> {
	const requests: RequestInit[] = [];
	vi.stubGlobal("fetch", (_input: RequestInfo | URL, init?: RequestInit) => {
		if (init) requests.push(init);
		return Promise.resolve(new Response(null, { status: 204 }));
	});

	await notifyDiscordComment(testEnv(), {
		id: "default-id",
		pagePath: "/p/example/",
		parentId: null,
		body: "hello",
		name: "Display Name",
		emailHash: null,
		status: "approved",
		deviceLabel: "Mac",
		browserLabel: "Firefox",
		locationLabel: "Taipei, Taiwan, TW",
		user: null,
		...overrides
	});

	const body = requests[0]?.body;
	if (typeof body !== "string") throw new Error("Expected Discord JSON body");

	return JSON.parse(body) as DiscordPayload;
}

function testEnv(): Env {
	return {
		COMMENTS_DB: {} as D1Database,
		GITHUB_CLIENT_ID: "github-client-id",
		GITHUB_CLIENT_SECRET: "github-client-secret",
		GITHUB_REDIRECT_URI: "https://api.emtech.cc/api/auth/github/callback",
		SESSION_SECRET: "session-secret",
		IP_HASH_SECRET: "ip-hash-secret",
		TURNSTILE_SECRET_KEY: "turnstile-secret",
		ALLOWED_ORIGINS: "http://localhost:4321,https://emtech.cc",
		DISCORD_WEBHOOK_URL: "https://discord.test/webhook"
	};
}
