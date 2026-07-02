import { checkSpam } from "@emtech/comments-shared";
import { describe, expect, it } from "vitest";
import { hashIp, signedValue, verifySignedValue } from "../src/utils/crypto";
import { allowedOrigin } from "../src/utils/http";
import { browserLabel, deviceLabel, locationLabel } from "../src/utils/request-context";
import { adminStatusSchema, createCommentSchema } from "../src/utils/validation";

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

describe("admin validation", () => {
	it("allows all statuses for the moderation dashboard", () => {
		expect(adminStatusSchema.safeParse({ status: "all" }).success).toBe(true);
		expect(adminStatusSchema.safeParse({ status: "spam" }).success).toBe(true);
		expect(adminStatusSchema.safeParse({ status: "unknown" }).success).toBe(false);
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

describe("public request context", () => {
	it("extracts non-sensitive browser, device, and location labels", () => {
		const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:150.0) Gecko/20100101 Firefox/150.0";

		expect(deviceLabel(ua)).toBe("Mac");
		expect(browserLabel(ua)).toBe("Firefox");
		expect(locationLabel({ city: "Taipei", region: "Taiwan", country: "TW" })).toBe("Taipei, Taiwan, TW");
	});
});

describe("CORS utilities", () => {
	const allowedOrigins = "http://localhost:4321,https://emtech.cc";

	it("allows exact configured origins", () => {
		const request = new Request("https://api.emtech.cc/api/comments", {
			headers: { Origin: "https://emtech.cc" }
		});

		expect(allowedOrigin(request, allowedOrigins)).toBe("https://emtech.cc");
	});

	it("allows alternate loopback dev ports when localhost is configured", () => {
		const request = new Request("https://api.emtech.cc/api/comments", {
			headers: { Origin: "http://localhost:4322" }
		});

		expect(allowedOrigin(request, allowedOrigins)).toBe("http://localhost:4322");
	});

	it("rejects unlisted non-loopback origins", () => {
		const request = new Request("https://api.emtech.cc/api/comments", {
			headers: { Origin: "https://localhost.example.com" }
		});

		expect(allowedOrigin(request, allowedOrigins)).toBeNull();
	});
});
