import { escapeHtml } from "@emtech/comments-shared";

export type ThreadReplyEmailInput = {
	replyAuthor: string;
	replyBody: string;
	parentAuthor: string;
	parentBody: string;
	pageUrl: string;
	unsubscribeUrl: string;
	createdAt: string;
};

export type RenderedEmail = {
	subject: string;
	html: string;
	text: string;
};

export function renderThreadReplyEmail(input: ThreadReplyEmailInput): RenderedEmail {
	const replyAuthor = plainText(input.replyAuthor || "Anonymous", 80);
	const parentAuthor = plainText(input.parentAuthor || "Anonymous", 80);
	const replyBody = plainText(input.replyBody, 1600);
	const parentBody = plainText(input.parentBody, 800);
	const date = new Date(input.createdAt).toLocaleString("zh-TW", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Taipei" });
	const subject = `${replyAuthor} 回覆了你參與的留言`;

	return {
		subject,
		text: [
			"毛哥EM資訊密技｜留言通知",
			"",
			`${replyAuthor} 回覆了你參與的留言：`,
			`「${replyBody}」`,
			"",
			`回覆的留言（${parentAuthor}）：`,
			`「${parentBody}」`,
			"",
			`查看完整討論：${input.pageUrl}`,
			`取消這個討論串的 Email 通知：${input.unsubscribeUrl}`,
			"",
			"表情符號回應不會寄送通知。"
		].join("\n"),
		html: `<!doctype html>
<html lang="zh-Hant">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>${escapeHtml(subject)}</title>
		<style>@media screen and (max-width:480px){.email-pad{padding-left:20px!important;padding-right:20px!important}.email-title{font-size:26px!important;letter-spacing:-.8px!important}}</style>
	</head>
	<body style="margin:0;padding:0;background:#edf7fb;color:#17232c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans TC',sans-serif;">
		<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(replyAuthor)} 在你參與的討論串留下新回覆。</div>
		<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#edf7fb;background-image:radial-gradient(#b8dbea 1px,transparent 1px);background-size:16px 16px;">
			<tr>
				<td align="center" style="padding:32px 16px;">
					<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;background:#ffffff;border:1px solid #1888b2;border-top:6px solid #1888b2;">
						<tr>
							<td class="email-pad" style="padding:28px 32px 24px;border-bottom:1px solid #c8dde6;">
								<p style="margin:0 0 8px;color:#58717e;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">留言通知</p>
								<p style="margin:0 0 18px;font-size:20px;font-weight:800;letter-spacing:-0.5px;">毛哥EM資訊密技</p>
								<h1 class="email-title" style="margin:0;font-size:30px;line-height:1.2;letter-spacing:-1.2px;">有人回覆了你參與的留言</h1>
							</td>
						</tr>
						<tr>
							<td class="email-pad" style="padding:28px 32px;">
								<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:0 0 20px;background:#f3f9fb;border-left:4px solid #1888b2;">
									<tr><td style="padding:20px 22px;">
										<p style="margin:0 0 7px;color:#58717e;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;">新回覆 · ${escapeHtml(date)}</p>
										<p style="margin:0 0 12px;font-size:17px;font-weight:800;">${escapeHtml(replyAuthor)}</p>
										<p style="margin:0;font-size:16px;line-height:1.75;white-space:pre-wrap;">${escapeHtml(replyBody)}</p>
									</td></tr>
								</table>
								<p style="margin:0 0 8px;color:#58717e;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;">回覆給 ${escapeHtml(parentAuthor)}</p>
								<p style="margin:0 0 26px;padding:14px 16px;color:#4a606b;font-size:14px;line-height:1.7;background:#f8fbfc;border:1px solid #d7e6ec;white-space:pre-wrap;">${escapeHtml(parentBody)}</p>
								<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="background:#17232c;border:1px solid #17232c;">
									<a href="${escapeHtml(input.pageUrl)}" style="display:inline-block;padding:13px 20px;color:#ffffff;font-size:15px;font-weight:800;text-decoration:none;">查看完整討論 →</a>
								</td></tr></table>
							</td>
						</tr>
						<tr>
							<td class="email-pad" style="padding:20px 32px;color:#58717e;font-size:12px;line-height:1.7;background:#f7fafb;border-top:1px solid #c8dde6;">
								<p style="margin:0 0 8px;">你收到這封信，是因為你曾在這個討論串留下 Email。</p>
								<p style="margin:0;"><a href="${escapeHtml(input.unsubscribeUrl)}" style="color:#146f94;text-decoration:underline;">取消這個討論串的通知</a></p>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	</body>
</html>`
	};
}

function plainText(value: string, maxLength: number): string {
	const normalized = value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");
	if (normalized.length <= maxLength) return normalized;
	return `${normalized.slice(0, maxLength - 1)}…`;
}
