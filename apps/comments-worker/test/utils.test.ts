import { checkSpam } from "@emtech/comments-shared";
import { describe, expect, it } from "vitest";
import { hashIp, signedValue, verifySignedValue } from "../src/utils/crypto";
import { createCommentSchema } from "../src/utils/validation";

describe("comment validation", () => {
	it("requires a non-empty body", () => {
		const result = createCommentSchema.safeParse({ pagePath: "/posts/foo", body: "   ", turnstileToken: "token" });
		expect(result.success).toBe(false);
	});

	it("accepts optional name and email", () => {
		const result = createCommentSchema.safeParse({
			pagePath: "/posts/foo",
			body: "hello",
			name: "Display Name",
			email: "user@example.com",
			turnstileToken: "token"
		});
		expect(result.success).toBe(true);
	});
});

describe("privacy utilities", () => {
	it("hashes IP addresses without returning the raw IP", async () => {
		const hashed = await hashIp("203.0.113.42", "secret-salt");
		expect(hashed).not.toContain("203.0.113.42");
		expect(hashed).toHaveLength(64);
	});
});

describe("spam heuristic", () => {
	it("marks too many links as spam", () => {
		expect(checkSpam("https://a.test https://b.test https://c.test https://d.test").action).toBe("spam");
	});
});

describe("session signing", () => {
	it("round trips signed values and rejects tampering", async () => {
		const signed = await signedValue("session-id", "secret");
		expect(await verifySignedValue(signed, "secret")).toBe("session-id");
		expect(await verifySignedValue(signed.replace("session", "other"), "secret")).toBeNull();
	});
});
