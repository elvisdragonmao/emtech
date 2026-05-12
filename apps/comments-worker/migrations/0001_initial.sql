CREATE TABLE IF NOT EXISTS comments (
	id TEXT PRIMARY KEY,
	page_path TEXT NOT NULL,
	parent_id TEXT NULL,
	body TEXT NOT NULL,
	author_type TEXT NOT NULL CHECK (author_type IN ('anonymous', 'named', 'gravatar', 'github')),
	author_name TEXT NULL,
	email_hash TEXT NULL,
	github_user_id INTEGER NULL,
	github_login TEXT NULL,
	github_avatar_url TEXT NULL,
	status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'spam', 'deleted')),
	ip_hash TEXT NULL,
	user_agent_hash TEXT NULL,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_page_status_created_at ON comments (page_path, status, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_status_created_at ON comments (status, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_ip_hash_created_at ON comments (ip_hash, created_at);

CREATE TABLE IF NOT EXISTS github_accounts (
	github_user_id INTEGER PRIMARY KEY,
	github_login TEXT NOT NULL,
	avatar_url TEXT NULL,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
	id TEXT PRIMARY KEY,
	session_hash TEXT NOT NULL,
	github_user_id INTEGER NOT NULL,
	expires_at TEXT NOT NULL,
	created_at TEXT NOT NULL,
	FOREIGN KEY (github_user_id) REFERENCES github_accounts (github_user_id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_session_hash ON sessions (session_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS oauth_states (
	state_hash TEXT PRIMARY KEY,
	return_to TEXT NOT NULL,
	expires_at TEXT NOT NULL,
	created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS moderation_log (
	id TEXT PRIMARY KEY,
	comment_id TEXT NOT NULL,
	action TEXT NOT NULL,
	reason TEXT NULL,
	created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_limits (
	key TEXT PRIMARY KEY,
	count INTEGER NOT NULL,
	window_start TEXT NOT NULL,
	updated_at TEXT NOT NULL
);
