import { escapeHtml } from "@emtech/comments-shared";
import { unsubscribeThreadEmail } from "../db/thread-notifications";
import type { AppContext } from "../types";
import { verifySignedValue } from "../utils/crypto";
import { html } from "../utils/http";

export async function unsubscribeCommentThread(ctx: AppContext): Promise<Response> {
	const subscription = await verifiedSubscription(ctx);
	if (!subscription) return unsubscribePage("連結無效", "這個取消通知連結不正確或已失效。", null, 400);

	if (ctx.request.method === "GET") {
		return unsubscribePage("取消討論串通知", "之後這個討論串有新回覆時，將不再寄 Email 給你。", ctx.url.toString());
	}

	const removed = await unsubscribeThreadEmail(ctx.env, subscription.threadRootId, subscription.emailHash);
	if (!removed) return unsubscribePage("找不到討論串", "這個討論串可能已經被移除。", null, 404);
	return unsubscribePage("已取消通知", "設定已儲存；其他討論串的通知不受影響。", null);
}

async function verifiedSubscription(ctx: AppContext): Promise<{ threadRootId: string; emailHash: string } | null> {
	if (!ctx.env.EMAIL_ENCRYPTION_KEY) return null;
	const value = await verifySignedValue(ctx.url.searchParams.get("token"), `${ctx.env.EMAIL_ENCRYPTION_KEY}:unsubscribe`);
	if (!value) return null;
	const separator = value.indexOf(":");
	if (separator < 1) return null;
	const threadRootId = value.slice(0, separator);
	const emailHash = value.slice(separator + 1);
	if (!threadRootId || !/^[a-f0-9]{64}$/.test(emailHash)) return null;
	return { threadRootId, emailHash };
}

function unsubscribePage(title: string, message: string, action: string | null, status = 200): Response {
	return html(
		`<!doctype html>
<html lang="zh-Hant">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>${escapeHtml(title)}｜毛哥EM資訊密技</title>
		<style>
			:root { color-scheme: light; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif; color: #17232c; background: #edf7fb; }
			* { box-sizing: border-box; }
			body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 1.5rem; background-image: radial-gradient(#b8dbea 1px, transparent 1px); background-size: 16px 16px; }
			main { width: min(36rem, 100%); padding: 2rem; background: #fff; border: 1px solid #1888b2; border-top-width: .4rem; }
			.eyebrow { margin: 0 0 .6rem; color: #58717e; font: 700 .75rem ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: .1em; text-transform: uppercase; }
			h1 { margin: 0 0 1rem; font-size: clamp(2rem, 7vw, 3rem); line-height: 1; letter-spacing: -.06em; }
			p { margin: 0; line-height: 1.8; color: #4a606b; }
			button { margin-top: 1.5rem; padding: .8rem 1rem; color: #fff; font: inherit; font-weight: 800; background: #17232c; border: 1px solid #17232c; cursor: pointer; }
			button:hover { background: #1888b2; border-color: #1888b2; }
		</style>
	</head>
	<body>
		<main>
			<p class="eyebrow">Email notification</p>
			<h1>${escapeHtml(title)}</h1>
			<p>${escapeHtml(message)}</p>
			${action ? `<form method="post" action="${escapeHtml(action)}"><button type="submit">確認取消</button></form>` : ""}
		</main>
	</body>
</html>`,
		{ status }
	);
}
