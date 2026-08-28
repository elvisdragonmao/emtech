# Comments Worker

Cloudflare Worker for comments, anonymous emoji reactions, moderation, and thread reply notifications.

## SMTP thread notifications

Reply notifications are sent only for approved text replies. Emoji reactions never trigger email. A recipient must have supplied an email address in a comment in the same root thread; addresses are encrypted with AES-GCM before being stored in D1, and recipients are sent separate messages so thread addresses are never disclosed to each other.

Set the non-secret sender configuration in `wrangler.toml` or the Cloudflare dashboard:

```toml
[vars]
BLOG_ORIGIN = "https://emtech.cc"
SMTP_HOST = "smtp.example.com"
SMTP_PORT = "587"
SMTP_SECURITY = "starttls"
SMTP_FROM_EMAIL = "comments@emtech.cc"
SMTP_FROM_NAME = "毛哥EM資訊密技"
```

Use `SMTP_SECURITY = "tls"` for implicit TLS on port 465. Port 25 is rejected because Workers cannot open outbound SMTP connections on that port. Unencrypted SMTP is accepted only for a loopback host during local tests.

For [Cloudflare Email Service SMTP](https://developers.cloudflare.com/email-service/reference/smtp/), use `smtp.mx.cloudflare.net`, port `465`, `SMTP_SECURITY = "tls"`, and `SMTP_USERNAME = "api_token"`. Store an API token with Email Sending permission as `SMTP_PASSWORD`, and onboard the domain used by `SMTP_FROM_EMAIL` before deploying.

Store credentials and the encryption key as Worker secrets:

```sh
pnpm --filter comments-worker exec wrangler secret put SMTP_USERNAME
pnpm --filter comments-worker exec wrangler secret put SMTP_PASSWORD
pnpm --filter comments-worker exec wrangler secret put EMAIL_ENCRYPTION_KEY
```

`EMAIL_ENCRYPTION_KEY` should be a long, randomly generated value and must be backed up. Changing or losing it makes previously stored notification addresses unreadable and invalidates existing unsubscribe links.

Apply D1 migrations before deploying code that reads the new tables and columns:

```sh
pnpm --filter comments-worker db:migrate:remote
pnpm --filter comments-worker deploy
```

Existing comments only contain an irreversible Gravatar hash, so they cannot receive notifications retroactively. An address becomes available for notifications after that participant submits a new comment or reply with email on the updated form.
