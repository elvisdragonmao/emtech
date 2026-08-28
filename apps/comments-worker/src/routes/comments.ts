import { emailHash, type CommentStatus } from "@emtech/comments-shared";
import { getSessionUser } from "../auth/session";
import { insertComment, listApprovedComments, parentExists, setCommentReaction } from "../db/comments";
import { logDiscordNotificationFailure, notifyDiscordComment } from "../notifications/discord";
import type { AppContext } from "../types";
import { hashIp, randomId, secretHash } from "../utils/crypto";
import { clientIp, json, readJson } from "../utils/http";
import { publicRequestContext } from "../utils/request-context";
import { createCommentSchema, listCommentsSchema, setReactionSchema } from "../utils/validation";

const RATE_LIMIT_WINDOW_SECONDS = 60 * 10;
const RATE_LIMIT_MAX = 8;
const REACTION_RATE_LIMIT_MAX = 60;

export async function listComments(ctx: AppContext): Promise<Response> {
	const parsed = listCommentsSchema.safeParse({ pagePath: ctx.url.searchParams.get("pagePath") });
	if (!parsed.success) {
		return json({ error: "Invalid pagePath" }, { status: 400 }, ctx.corsHeaders);
	}

	return json({ comments: await listApprovedComments(ctx.env, parsed.data.pagePath) }, {}, ctx.corsHeaders);
}

export async function createComment(ctx: AppContext): Promise<Response> {
	const body = await readJson(ctx.request);
	const parsed = createCommentSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: "Invalid comment", issues: parsed.error.issues.map(issue => issue.message) }, { status: 400 }, ctx.corsHeaders);
	}

	if (!isTurnstileDisabled(ctx.env.TURNSTILE_SECRET_KEY)) {
		if (!parsed.data.turnstileToken) {
			return json({ error: "Turnstile token is required" }, { status: 400 }, ctx.corsHeaders);
		}
		const ok = await verifyTurnstile(ctx.env.TURNSTILE_SECRET_KEY, parsed.data.turnstileToken, clientIp(ctx.request));
		if (!ok) {
			return json({ error: "Turnstile verification failed" }, { status: 400 }, ctx.corsHeaders);
		}
	}

	const ip = clientIp(ctx.request);
	const ipHash = await hashIp(ip, ctx.env.IP_HASH_SECRET);
	const limited = await hitRateLimit(ctx, `comment:${ipHash}`, RATE_LIMIT_MAX);
	if (limited) {
		return json({ error: "Rate limit exceeded" }, { status: 429 }, ctx.corsHeaders);
	}

	if (parsed.data.parentId && !(await parentExists(ctx.env, parsed.data.parentId, parsed.data.pagePath))) {
		return json({ error: "Parent comment not found" }, { status: 400 }, ctx.corsHeaders);
	}

	const user = await getSessionUser(ctx.request, ctx.env);
	const spam = { action: "allow", reasons: "" };
	const defaultStatus = user ? statusFromEnv(ctx.env.COMMENT_DEFAULT_STATUS_GITHUB, "approved") : statusFromEnv(ctx.env.COMMENT_DEFAULT_STATUS_ANON, "approved");
	const status = spam.action === "spam" ? "spam" : spam.action === "pending" && defaultStatus === "approved" ? "pending" : defaultStatus;
	const name = parsed.data.name && parsed.data.name.length > 0 ? parsed.data.name : null;
	const normalizedEmail = parsed.data.email && parsed.data.email.length > 0 ? parsed.data.email : null;
	const maybeEmailHash = normalizedEmail ? await emailHash(normalizedEmail) : null;
	const userAgent = ctx.request.headers.get("User-Agent") ?? "";
	const userAgentHash = userAgent ? await secretHash(userAgent, ctx.env.IP_HASH_SECRET) : null;
	const requestContext = publicRequestContext(ctx.request);
	const commentId = randomId();

	await insertComment(ctx.env, {
		id: commentId,
		pagePath: parsed.data.pagePath,
		parentId: parsed.data.parentId ?? null,
		body: parsed.data.body,
		name,
		emailHash: maybeEmailHash,
		status,
		ipHash,
		userAgentHash,
		deviceLabel: requestContext.deviceLabel,
		browserLabel: requestContext.browserLabel,
		locationLabel: requestContext.locationLabel,
		user
	});

	ctx.executionCtx.waitUntil(
		notifyDiscordComment(ctx.env, {
			id: commentId,
			pagePath: parsed.data.pagePath,
			parentId: parsed.data.parentId ?? null,
			body: parsed.data.body,
			name,
			emailHash: maybeEmailHash,
			status,
			deviceLabel: requestContext.deviceLabel,
			browserLabel: requestContext.browserLabel,
			locationLabel: requestContext.locationLabel,
			user
		}).catch(error => logDiscordNotificationFailure(error, commentId))
	);

	return json({ ok: true, status, commentId }, { status: 201 }, ctx.corsHeaders);
}

export async function updateCommentReaction(ctx: AppContext, commentId: string): Promise<Response> {
	const body = await readJson(ctx.request);
	const parsed = setReactionSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: "Invalid reaction", issues: parsed.error.issues.map(issue => issue.message) }, { status: 400 }, ctx.corsHeaders);
	}

	const ipHash = await hashIp(clientIp(ctx.request), ctx.env.IP_HASH_SECRET);
	if (await hitRateLimit(ctx, `reaction:${ipHash}`, REACTION_RATE_LIMIT_MAX)) {
		return json({ error: "Rate limit exceeded" }, { status: 429 }, ctx.corsHeaders);
	}

	const visitorHash = await secretHash(parsed.data.visitorId, ctx.env.IP_HASH_SECRET);
	const reactions = await setCommentReaction(ctx.env, {
		commentId,
		visitorHash,
		emoji: parsed.data.emoji,
		active: parsed.data.active
	});
	if (!reactions) {
		return json({ error: "Comment not found" }, { status: 404 }, ctx.corsHeaders);
	}

	return json({ ok: true, reactions }, {}, ctx.corsHeaders);
}

export function isTurnstileDisabled(secret: string | undefined): boolean {
	return !secret || secret === "dev-disabled";
}

async function verifyTurnstile(secret: string, token: string, remoteIp: string): Promise<boolean> {
	const form = new FormData();
	form.set("secret", secret);
	form.set("response", token);
	form.set("remoteip", remoteIp);

	const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
		method: "POST",
		body: form
	});

	if (!response.ok) return false;
	const data = (await response.json()) as { success?: boolean };
	return data.success === true;
}

async function hitRateLimit(ctx: AppContext, key: string, max: number): Promise<boolean> {
	const now = new Date();
	const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString();
	const current = await ctx.env.COMMENTS_DB.prepare("SELECT count, window_start AS windowStart FROM rate_limits WHERE key = ?").bind(key).first<{ count: number; windowStart: string }>();

	if (!current || current.windowStart < windowStart) {
		await ctx.env.COMMENTS_DB.prepare("INSERT OR REPLACE INTO rate_limits (key, count, window_start, updated_at) VALUES (?, ?, ?, ?)").bind(key, 1, now.toISOString(), now.toISOString()).run();
		return false;
	}

	const nextCount = current.count + 1;
	await ctx.env.COMMENTS_DB.prepare("UPDATE rate_limits SET count = ?, updated_at = ? WHERE key = ?").bind(nextCount, now.toISOString(), key).run();
	return nextCount > max;
}

function statusFromEnv(value: string | undefined, fallback: CommentStatus): CommentStatus {
	if (value === "pending" || value === "approved" || value === "rejected" || value === "spam" || value === "deleted") {
		return value;
	}
	return fallback;
}
