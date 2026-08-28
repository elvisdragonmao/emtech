import { describe, expect, it } from "vitest";
import { renderThreadReplyEmail } from "../src/notifications/email-template";

describe("thread reply email template", () => {
	it("renders branded HTML and a plain-text fallback", () => {
		const rendered = renderThreadReplyEmail({
			replyAuthor: "毛哥",
			replyBody: "新的回覆內容",
			parentAuthor: "讀者",
			parentBody: "原本的留言",
			pageUrl: "https://emtech.cc/p/example/#comments",
			unsubscribeUrl: "https://api.emtech.cc/api/comments/unsubscribe?token=signed",
			createdAt: "2026-08-28T12:00:00.000Z"
		});

		expect(rendered.subject).toContain("毛哥");
		expect(rendered.html).toContain("毛哥EM資訊密技");
		expect(rendered.html).toContain("查看完整討論");
		expect(rendered.html).toContain("表情符號回應不會寄信");
		expect(rendered.text).toContain("https://emtech.cc/p/example/#comments");
	});

	it("escapes user content in HTML", () => {
		const rendered = renderThreadReplyEmail({
			replyAuthor: "<script>alert(1)</script>",
			replyBody: "<img src=x onerror=alert(1)>",
			parentAuthor: "Reader",
			parentBody: "Hello",
			pageUrl: "https://emtech.cc/#comments",
			unsubscribeUrl: "https://api.emtech.cc/unsubscribe",
			createdAt: "2026-08-28T12:00:00.000Z"
		});

		expect(rendered.html).not.toContain("<script>alert(1)</script>");
		expect(rendered.html).not.toContain("<img src=x");
		expect(rendered.html).toContain("&lt;script&gt;");
	});
});
