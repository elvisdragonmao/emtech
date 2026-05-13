# 毛哥EM資訊密技

毛哥EM 從國二經營至今的部落格。分享技術、經驗、專案、與生活。

<https://emtech.cc>

## Monorepo

這個 repo 使用 pnpm workspace：

```txt
.
├── apps/
│   ├── blog/              # Astro 部落格
│   └── comments-worker/   # Cloudflare Worker + D1 留言 API
├── packages/
│   └── comments-shared/   # Gravatar、sanitize、spam heuristic 等共用工具
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Development

```bash
pnpm install
pnpm dev
pnpm --filter blog dev
pnpm --filter comments-worker dev
```

`pnpm dev` 會啟動 blog。Worker 請另外開一個 terminal 跑 `pnpm --filter comments-worker dev`。

常用檢查：

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm --filter blog build
pnpm --filter comments-worker typecheck
pnpm --filter comments-worker test
```

## Comments Worker Setup

先複製本機 env 範例：

```bash
cp apps/comments-worker/.dev.vars.example apps/comments-worker/.dev.vars
```

`apps/comments-worker/.dev.vars` 必須填入：

```txt
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GITHUB_REDIRECT_URI
SESSION_SECRET
IP_HASH_SECRET
TURNSTILE_SECRET_KEY
ALLOWED_ORIGINS
COMMENT_DEFAULT_STATUS_ANON
COMMENT_DEFAULT_STATUS_GITHUB
```

本機開發若暫時不使用 Turnstile，可把 `TURNSTILE_SECRET_KEY` 設為 `dev-disabled`。正式環境請用 Cloudflare secret，不要 commit 真實值。

## D1 Database

建立 D1：

```bash
pnpm --filter comments-worker exec wrangler d1 create emtech-comments
```

把輸出的 `database_id` 填到 `apps/comments-worker/wrangler.toml`：

```toml
[[d1_databases]]
binding = "COMMENTS_DB"
database_name = "emtech-comments"
database_id = "your-database-id"
```

執行 migrations：

```bash
pnpm --filter comments-worker db:migrate:local
pnpm --filter comments-worker db:migrate:remote
```

## Turnstile

在 Cloudflare Turnstile 建立 widget，網域加入正式部落格網域與本機需要的測試網域。設定：

```bash
pnpm --filter comments-worker exec wrangler secret put TURNSTILE_SECRET_KEY
```

Astro 前端需要 site key。部署 blog 時設定：

```txt
TURNSTILE_SITE_KEY=your-site-key
COMMENT_API_BASE_URL=https://your-comments-worker.example.com
```

## GitHub OAuth

到 GitHub Developer Settings 建立 OAuth App：

```txt
Homepage URL: https://your-blog.example.com
Authorization callback URL: https://your-comments-worker.example.com/api/auth/github/callback
```

設定 Worker secrets：

```bash
pnpm --filter comments-worker exec wrangler secret put GITHUB_CLIENT_ID
pnpm --filter comments-worker exec wrangler secret put GITHUB_CLIENT_SECRET
pnpm --filter comments-worker exec wrangler secret put GITHUB_REDIRECT_URI
pnpm --filter comments-worker exec wrangler secret put SESSION_SECRET
pnpm --filter comments-worker exec wrangler secret put IP_HASH_SECRET
```

`ALLOWED_ORIGINS` 需要包含 blog origin，例如：

```txt
https://emtech.cc,http://localhost:4321,http://127.0.0.1:4321
```

Cookie 使用 `HttpOnly; Secure; SameSite=Lax`。本機 HTTP 下 GitHub OAuth session cookie 可能無法完整測試，建議用 HTTPS tunnel 或部署到 Cloudflare 後驗證。

## Deploy

部署 blog：

```bash
pnpm --filter blog build
```

部署 comments worker：

```bash
pnpm --filter comments-worker run deploy
```

若使用 Cloudflare Pages/Workers 靜態資產部署 blog，`apps/blog/wrangler.jsonc` 仍保留原本靜態站設定。

## Moderation

管理介面：

```txt
https://your-comments-worker.example.com/admin
```

管理介面與 moderation API 都要求 GitHub 登入使用者為 `elvisdragonmao`。沒有額外的 admin token。

API examples：

```bash
curl -b cookies.txt \
  "https://your-comments-worker.example.com/api/admin/comments?status=pending"

curl -X POST -b cookies.txt \
  "https://your-comments-worker.example.com/api/admin/comments/comment-id/approve"

curl -X POST -b cookies.txt \
  "https://your-comments-worker.example.com/api/admin/comments/comment-id/reject"

curl -X POST -b cookies.txt \
  "https://your-comments-worker.example.com/api/admin/comments/comment-id/delete"
```

## Comments API

Public routes：

```txt
GET  /api/comments?pagePath=/posts/foo
POST /api/comments
GET  /api/auth/github/start?returnTo=/posts/foo
GET  /api/auth/github/callback
GET  /api/auth/me
POST /api/auth/logout
```

`POST /api/comments` accepts:

```json
{
	"pagePath": "/posts/foo",
	"body": "required comment text",
	"name": "optional display name",
	"email": "optional email for Gravatar only",
	"parentId": "optional parent comment id",
	"turnstileToken": "required unless TURNSTILE_SECRET_KEY=dev-disabled"
}
```

Email 會 normalize 後只儲存 SHA-256 hash，用於產生 Gravatar URL，不回傳也不儲存 raw email。

## License

毛哥EM 製作。原始碼以 Apache-2.0，文章以 CC BY-4.0 授權釋出。
