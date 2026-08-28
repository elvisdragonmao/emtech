import type { Env } from "../types";

export type ThreadNotificationRecipient = {
	emailHash: string;
	encryptedEmail: string;
};

export type ThreadNotificationContext = {
	threadRootId: string;
	parentAuthor: string;
	parentBody: string;
	recipients: ThreadNotificationRecipient[];
};

type ThreadRecipientRow = {
	thread_root_id: string;
	email_hash: string;
	encrypted_email: string;
};

type ParentCommentRow = {
	author_name: string;
	body: string;
};

export async function threadNotificationContext(env: Env, parentId: string, replyingAuthorEmailHash: string | null): Promise<ThreadNotificationContext | null> {
	const parent = await env.COMMENTS_DB.prepare(
		`SELECT COALESCE(github_login, author_name, 'Anonymous') AS author_name, body
		 FROM comments
		 WHERE id = ?`
	)
		.bind(parentId)
		.first<ParentCommentRow>();
	if (!parent) return null;

	const { results } = await env.COMMENTS_DB.prepare(
		`WITH RECURSIVE
		 ancestors(id, parent_id) AS (
			 SELECT id, parent_id FROM comments WHERE id = ?
			 UNION ALL
			 SELECT comments.id, comments.parent_id
			 FROM comments JOIN ancestors ON comments.id = ancestors.parent_id
		 ),
		 root(id) AS (
			 SELECT id FROM ancestors WHERE parent_id IS NULL LIMIT 1
		 ),
		 thread_comments(id) AS (
			 SELECT id FROM root
			 UNION ALL
			 SELECT comments.id
			 FROM comments JOIN thread_comments ON comments.parent_id = thread_comments.id
		 )
		 SELECT
			 (SELECT id FROM root) AS thread_root_id,
			 comments.email_hash,
			 MAX(comments.notification_email_ciphertext) AS encrypted_email
		 FROM comments
		 JOIN thread_comments ON thread_comments.id = comments.id
		 WHERE comments.status = 'approved'
			 AND comments.email_hash IS NOT NULL
			 AND comments.notification_email_ciphertext IS NOT NULL
			 AND (? IS NULL OR comments.email_hash != ?)
			 AND NOT EXISTS (
				 SELECT 1 FROM comment_thread_unsubscribes
				 WHERE thread_root_id = (SELECT id FROM root)
					 AND email_hash = comments.email_hash
			 )
		 GROUP BY comments.email_hash`
	)
		.bind(parentId, replyingAuthorEmailHash, replyingAuthorEmailHash)
		.all<ThreadRecipientRow>();

	const threadRootId = results[0]?.thread_root_id;
	if (!threadRootId) {
		const root = await findThreadRoot(env, parentId);
		if (!root) return null;
		return { threadRootId: root, parentAuthor: parent.author_name, parentBody: parent.body, recipients: [] };
	}

	return {
		threadRootId,
		parentAuthor: parent.author_name,
		parentBody: parent.body,
		recipients: results.map(row => ({ emailHash: row.email_hash, encryptedEmail: row.encrypted_email }))
	};
}

export async function unsubscribeThreadEmail(env: Env, threadRootId: string, emailHash: string): Promise<boolean> {
	const root = await env.COMMENTS_DB.prepare("SELECT id FROM comments WHERE id = ? AND parent_id IS NULL").bind(threadRootId).first();
	if (!root) return false;

	await env.COMMENTS_DB.prepare("INSERT OR IGNORE INTO comment_thread_unsubscribes (thread_root_id, email_hash, created_at) VALUES (?, ?, ?)")
		.bind(threadRootId, emailHash, new Date().toISOString())
		.run();
	return true;
}

async function findThreadRoot(env: Env, commentId: string): Promise<string | null> {
	const row = await env.COMMENTS_DB.prepare(
		`WITH RECURSIVE ancestors(id, parent_id) AS (
			 SELECT id, parent_id FROM comments WHERE id = ?
			 UNION ALL
			 SELECT comments.id, comments.parent_id
			 FROM comments JOIN ancestors ON comments.id = ancestors.parent_id
		 )
		 SELECT id FROM ancestors WHERE parent_id IS NULL LIMIT 1`
	)
		.bind(commentId)
		.first<{ id: string }>();
	return row?.id ?? null;
}
