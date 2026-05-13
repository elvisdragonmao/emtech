import { describe, expect, it } from "vitest";
import { checkSpam, emailHash, gravatarUrlForEmail, gravatarUrlFromHash, isValidEmail, normalizeEmail, sanitizeCommentBody } from "../src/index";

describe("email helpers", () => {
	it("normalizes email before hashing", async () => {
		expect(normalizeEmail("  User@Example.COM ")).toBe("user@example.com");
		expect(await emailHash("  User@Example.COM ")).toBe(await emailHash("user@example.com"));
	});

	it("validates basic email format", () => {
		expect(isValidEmail("person@example.com")).toBe(true);
		expect(isValidEmail("not-an-email")).toBe(false);
	});
});

describe("gravatar helpers", () => {
	it("generates a gravatar URL from a hash", () => {
		const url = gravatarUrlFromHash("abc123", 128);
		expect(url).toBe("https://www.gravatar.com/avatar/abc123?s=128&d=identicon&r=g");
	});

	it("generates a gravatar URL for an email without including the raw email", async () => {
		const url = await gravatarUrlForEmail("user@example.com");
		expect(url).toContain("https://www.gravatar.com/avatar/");
		expect(url).not.toContain("user@example.com");
	});
});

describe("comment content helpers", () => {
	it("escapes HTML in comment bodies", () => {
		expect(sanitizeCommentBody("<script>alert('x')</script>")).toBe("&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;");
	});

	it("detects suspicious spam patterns", () => {
		expect(checkSpam("https://a.test https://b.test https://c.test https://d.test").action).toBe("spam");
		expect(checkSpam("abcabc").action).toBe("allow");
		expect(checkSpam("hello hello hello hello").action).toBe("pending");
		expect(checkSpam("repeatrepeatrepeatrepeat").action).toBe("pending");
		expect(checkSpam("x").action).toBe("pending");
	});
});
