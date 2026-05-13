import type { CommentStatus } from "@emtech/comments-shared";
import type { Env, SessionUser } from "../types";

type CommentNotification = {
	id: string;
	pagePath: string;
	parentId: string | null;
	body: string;
	name: string | null;
	status: CommentStatus;
	deviceLabel: string | null;
	browserLabel: string | null;
	locationLabel: string | null;
	user: SessionUser | null;
};

export async function notifyDiscordComment(env: Env, comment: CommentNotification): Promise<void> {
	if (!env.DISCORD_WEBHOOK_URL) return;

	const response = await fetch(env.DISCORD_WEBHOOK_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			embeds: [
				{
					title: "新留言",
					description: truncate(comment.body, 1200),
					color: colorForStatus(comment.status),
					fields: compactFields([
						{ name: "頁面", value: comment.pagePath, inline: true },
						{ name: "作者", value: authorName(comment), inline: true },
						{ name: "狀態", value: comment.status, inline: true },
						comment.parentId ? { name: "上層留言", value: comment.parentId, inline: true } : null,
						comment.deviceLabel ? { name: "裝置", value: comment.deviceLabel, inline: true } : null,
						comment.browserLabel ? { name: "瀏覽器", value: comment.browserLabel, inline: true } : null,
						comment.locationLabel ? { name: "位置", value: comment.locationLabel, inline: true } : null,
						{ name: "留言 ID", value: comment.id, inline: false }
					]),
					timestamp: new Date().toISOString()
				}
			]
		})
	});

	if (!response.ok) {
		throw new Error(`Discord webhook failed with status ${response.status}`);
	}
}

export function logDiscordNotificationFailure(error: unknown, commentId: string): void {
	console.error(
		JSON.stringify({
			message: "discord comment notification failed",
			commentId,
			error: error instanceof Error ? error.message : String(error)
		})
	);
}

function authorName(comment: CommentNotification): string {
	if (comment.user) return `@${comment.user.login}`;
	return comment.name ?? "Anonymous";
}

function colorForStatus(status: CommentStatus): number {
	if (status === "approved") return 0x57f287;
	if (status === "pending") return 0xfee75c;
	if (status === "spam" || status === "rejected" || status === "deleted") return 0xed4245;
	return 0x5865f2;
}

function truncate(value: string, maxLength: number): string {
	if (value.length <= maxLength) return value;
	return `${value.slice(0, maxLength - 1)}...`;
}

function compactFields(fields: Array<{ name: string; value: string; inline: boolean } | null>): Array<{ name: string; value: string; inline: boolean }> {
	return fields
		.filter((field): field is { name: string; value: string; inline: boolean } => field !== null)
		.map(field => ({ ...field, value: truncate(field.value, 1024) }));
}
