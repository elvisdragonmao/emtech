import { describe, expect, it } from "vitest";
import { deleteCommentOwnedBy, publicCommentFromRow, visibleCommentRows } from "../src/db/comments";
import type { CommentRow, Env } from "../src/types";

describe("public comments", () => {
	it("marks only the current GitHub user's comments as deletable", () => {
		const ownComment = publicCommentFromRow(commentRow({ github_user_id: 123 }), [], { currentGithubUserId: 123 });
		const otherComment = publicCommentFromRow(commentRow({ id: "other", github_user_id: 456 }), [], { currentGithubUserId: 123 });

		expect(ownComment.capabilities.canDelete).toBe(true);
		expect(otherComment.capabilities.canDelete).toBe(false);
	});

	it("keeps deleted ancestors for approved replies and redacts their public content", () => {
		const deletedRoot = commentRow({ id: "root", status: "deleted", body: "private body", github_login: "private-user" });
		const approvedReply = commentRow({ id: "reply", parent_id: "root" });
		const unrelatedDeleted = commentRow({ id: "unrelated", status: "deleted" });

		expect(visibleCommentRows([deletedRoot, approvedReply, unrelatedDeleted]).map(row => row.id)).toEqual(["root", "reply"]);

		const publicRoot = publicCommentFromRow(deletedRoot, [], { currentGithubUserId: 123, redactDeleted: true });
		expect(publicRoot).toMatchObject({
			body: "此留言已由作者刪除。",
			deleted: true,
			author: { name: "已刪除的留言", avatarUrl: null },
			meta: { device: null, browser: null, location: null },
			capabilities: { canDelete: false }
		});
		expect(JSON.stringify(publicRoot)).not.toContain("private body");
		expect(JSON.stringify(publicRoot)).not.toContain("private-user");
	});
});

describe("comment deletion ownership", () => {
	it("matches both the comment and GitHub owner in the update", async () => {
		let sql = "";
		let bindings: unknown[] = [];
		const database = {
			prepare(statement: string) {
				sql = statement;
				return {
					bind(...values: unknown[]) {
						bindings = values;
						return {
							run: () => Promise.resolve({ success: true, results: [], meta: { changes: 1 } })
						};
					}
				};
			}
		} as unknown as D1Database;

		expect(await deleteCommentOwnedBy({ COMMENTS_DB: database } as Env, "comment-id", 123)).toBe(true);
		expect(sql).toContain("WHERE id = ? AND github_user_id = ?");
		expect(bindings.slice(1)).toEqual(["comment-id", 123]);
	});
});

function commentRow(overrides: Partial<CommentRow> = {}): CommentRow {
	return {
		id: "comment",
		page_path: "/p/example/",
		parent_id: null,
		body: "hello",
		author_type: "github",
		author_name: "octocat",
		email_hash: null,
		github_user_id: 123,
		github_login: "octocat",
		github_avatar_url: "https://avatars.githubusercontent.com/u/123?v=4",
		status: "approved",
		device_label: "Mac",
		browser_label: "Firefox",
		location_label: "Taipei, Taiwan, TW",
		created_at: "2026-08-29T12:00:00.000Z",
		updated_at: "2026-08-29T12:00:00.000Z",
		...overrides
	};
}
