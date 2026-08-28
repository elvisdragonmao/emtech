ALTER TABLE comments ADD COLUMN notification_email_ciphertext TEXT NULL;

CREATE TABLE IF NOT EXISTS comment_thread_unsubscribes (
	thread_root_id TEXT NOT NULL,
	email_hash TEXT NOT NULL,
	created_at TEXT NOT NULL,
	PRIMARY KEY (thread_root_id, email_hash),
	FOREIGN KEY (thread_root_id) REFERENCES comments (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comment_thread_unsubscribes_email_hash ON comment_thread_unsubscribes (email_hash);
