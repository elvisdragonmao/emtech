import type { CommentStatus } from "@emtech/comments-shared";

export type Env = {
	COMMENTS_DB: D1Database;
	GITHUB_CLIENT_ID: string;
	GITHUB_CLIENT_SECRET: string;
	GITHUB_REDIRECT_URI: string;
	SESSION_SECRET: string;
	IP_HASH_SECRET: string;
	TURNSTILE_SECRET_KEY: string;
	ALLOWED_ORIGINS: string;
	DISCORD_WEBHOOK_URL?: string;
	COMMENT_DEFAULT_STATUS_ANON?: CommentStatus;
	COMMENT_DEFAULT_STATUS_GITHUB?: CommentStatus;
};

export type AppContext = {
	request: Request;
	env: Env;
	url: URL;
	corsHeaders: HeadersInit;
	executionCtx: ExecutionContext;
};

export type GithubUser = {
	id: number;
	login: string;
	avatar_url: string | null;
};

export type SessionUser = {
	githubUserId: number;
	login: string;
	avatarUrl: string | null;
};

export type CommentRow = {
	id: string;
	page_path: string;
	parent_id: string | null;
	body: string;
	author_type: "anonymous" | "named" | "gravatar" | "github";
	author_name: string | null;
	email_hash: string | null;
	github_user_id: number | null;
	github_login: string | null;
	github_avatar_url: string | null;
	status: CommentStatus;
	device_label: string | null;
	browser_label: string | null;
	location_label: string | null;
	created_at: string;
	updated_at: string;
};
