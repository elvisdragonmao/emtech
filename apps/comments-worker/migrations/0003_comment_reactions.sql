CREATE TABLE IF NOT EXISTS comment_reactions (
	comment_id TEXT NOT NULL,
	visitor_hash TEXT NOT NULL,
	emoji TEXT NOT NULL,
	created_at TEXT NOT NULL,
	PRIMARY KEY (comment_id, visitor_hash, emoji),
	FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON comment_reactions (comment_id);
