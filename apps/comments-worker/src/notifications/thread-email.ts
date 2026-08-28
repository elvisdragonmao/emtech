import { isValidEmail } from "@emtech/comments-shared";
import { threadNotificationContext } from "../db/thread-notifications";
import type { Env } from "../types";
import { decryptPrivateValue, signedValue } from "../utils/crypto";
import { publicApiOrigin, publicBlogOrigin } from "../utils/origins";
import { renderThreadReplyEmail } from "./email-template";
import { sendSmtpMessages, type SmtpMessage } from "./smtp";

export type ThreadReplyNotification = {
	commentId: string;
	pagePath: string;
	parentId: string;
	body: string;
	authorName: string;
	authorEmailHash: string | null;
	createdAt: string;
};

export async function notifyThreadReply(env: Env, reply: ThreadReplyNotification): Promise<void> {
	if (!env.EMAIL_ENCRYPTION_KEY || !env.SMTP_HOST || !env.SMTP_FROM_EMAIL) return;
	const context = await threadNotificationContext(env, reply.parentId, reply.authorEmailHash);
	if (!context?.recipients.length) return;

	const pageUrl = new URL(reply.pagePath, publicBlogOrigin(env));
	pageUrl.hash = "comments";
	const messages: SmtpMessage[] = [];
	const seenAddresses = new Set<string>();

	for (const recipient of context.recipients) {
		try {
			const address = await decryptPrivateValue(recipient.encryptedEmail, env.EMAIL_ENCRYPTION_KEY);
			if (!isValidEmail(address) || seenAddresses.has(address)) continue;
			seenAddresses.add(address);
			const unsubscribeUrl = await createUnsubscribeUrl(env, context.threadRootId, recipient.emailHash);
			const rendered = renderThreadReplyEmail({
				replyAuthor: reply.authorName,
				replyBody: reply.body,
				parentAuthor: context.parentAuthor,
				parentBody: context.parentBody,
				pageUrl: pageUrl.toString(),
				unsubscribeUrl,
				createdAt: reply.createdAt
			});
			messages.push({ to: address, ...rendered, unsubscribeUrl });
		} catch (error) {
			console.error(JSON.stringify({ message: "thread email recipient could not be prepared", commentId: reply.commentId, error: error instanceof Error ? error.message : String(error) }));
		}
	}

	await sendSmtpMessages(env, messages);
}

export function logThreadEmailFailure(error: unknown, commentId: string): void {
	console.error(
		JSON.stringify({
			message: "thread email notification failed",
			commentId,
			error: error instanceof Error ? error.message : String(error)
		})
	);
}

export async function createUnsubscribeUrl(env: Env, threadRootId: string, emailHash: string): Promise<string> {
	if (!env.EMAIL_ENCRYPTION_KEY) throw new Error("EMAIL_ENCRYPTION_KEY is required");
	const value = `${threadRootId}:${emailHash}`;
	const token = await signedValue(value, `${env.EMAIL_ENCRYPTION_KEY}:unsubscribe`);
	const url = new URL("/api/comments/unsubscribe", publicApiOrigin(env));
	url.searchParams.set("token", token);
	return url.toString();
}
