import type { AppContext } from "../types";
import { html } from "../utils/http";

export function adminUi(ctx: AppContext): Response {
	return html(
		`<!doctype html>
<html lang="zh-Hant">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>Comments Moderation</title>
	<style>
		body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #17202a; background: #f7f7f4; }
		main { max-width: 960px; margin: 0 auto; padding: 32px 20px 56px; }
		header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
		h1 { margin: 0; font-size: clamp(2rem, 6vw, 4rem); line-height: 1; letter-spacing: -0.04em; }
		.panel, article { background: white; border: 1px solid #d8ddd7; }
		.panel { padding: 16px; margin-bottom: 16px; display: grid; gap: 12px; }
		label { display: grid; gap: 6px; font-weight: 700; }
		input, select, textarea { font: inherit; padding: 10px 12px; border: 1px solid #c9d0c7; background: #fff; }
		button { font: inherit; font-weight: 800; padding: 10px 12px; border: 1px solid #236b82; background: #eef8fb; color: #17202a; cursor: pointer; }
		button:disabled { opacity: 0.45; cursor: not-allowed; }
		.toolbar { display: flex; flex-wrap: wrap; gap: 10px; align-items: end; }
		#comments { display: grid; gap: 12px; }
		article { padding: 16px; display: grid; gap: 10px; }
		.meta { display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.85rem; color: #5e6a70; }
		.body { white-space: pre-wrap; line-height: 1.65; }
		.actions { display: flex; flex-wrap: wrap; gap: 8px; }
		.notice { color: #5e6a70; }
		.error { color: #a12323; }
	</style>
</head>
<body>
	<main>
		<header>
			<h1>留言審核</h1>
			<a href="/api/auth/github/start?returnTo=/admin">GitHub login</a>
		</header>
		<section class="panel" id="gate">
			<p class="notice">管理介面需要 GitHub 帳號 <strong>elvisdragonmao</strong> 登入。API 操作也需要 ADMIN_TOKEN。</p>
			<p id="authState">Checking session...</p>
		</section>
		<section class="panel" id="controls" hidden>
			<div class="toolbar">
				<label>ADMIN_TOKEN
					<input id="token" type="password" autocomplete="off" />
				</label>
				<label>Status
					<select id="status">
						<option value="pending">pending</option>
						<option value="approved">approved</option>
						<option value="rejected">rejected</option>
						<option value="spam">spam</option>
						<option value="deleted">deleted</option>
					</select>
				</label>
				<button id="load" type="button">Load</button>
			</div>
			<p id="message" class="notice"></p>
		</section>
		<section id="comments"></section>
	</main>
	<script>
		const authState = document.querySelector("#authState");
		const controls = document.querySelector("#controls");
		const comments = document.querySelector("#comments");
		const message = document.querySelector("#message");
		const token = document.querySelector("#token");
		const statusSelect = document.querySelector("#status");
		const load = document.querySelector("#load");

		async function checkAuth() {
			const res = await fetch("/api/auth/me", { credentials: "include" });
			const data = await res.json();
			if (!data.authenticated) {
				authState.textContent = "尚未登入 GitHub。";
				return;
			}
			if (data.user.login !== "elvisdragonmao") {
				authState.textContent = "目前登入 " + data.user.login + "，不是管理員。";
				return;
			}
			authState.textContent = "已登入 " + data.user.login + "。";
			controls.hidden = false;
		}

		async function loadComments() {
			message.textContent = "Loading...";
			comments.replaceChildren();
			const res = await fetch("/api/admin/comments?status=" + encodeURIComponent(statusSelect.value), {
				headers: { Authorization: "Bearer " + token.value }
			});
			const data = await res.json();
			if (!res.ok) {
				message.textContent = data.error || "Failed";
				message.className = "error";
				return;
			}
			message.textContent = data.comments.length + " comments";
			message.className = "notice";
			for (const comment of data.comments) {
				comments.appendChild(renderComment(comment));
			}
		}

		function renderComment(comment) {
			const article = document.createElement("article");
			const meta = document.createElement("div");
			meta.className = "meta";
			meta.textContent = comment.pagePath + " / " + comment.author.name + " / " + comment.createdAt + " / " + comment.status;
			const body = document.createElement("div");
			body.className = "body";
			body.innerHTML = comment.body;
			const actions = document.createElement("div");
			actions.className = "actions";
			for (const action of ["approve", "reject", "delete"]) {
				const button = document.createElement("button");
				button.type = "button";
				button.textContent = action;
				button.addEventListener("click", () => moderate(comment.id, action));
				actions.appendChild(button);
			}
			article.append(meta, body, actions);
			return article;
		}

		async function moderate(id, action) {
			const res = await fetch("/api/admin/comments/" + encodeURIComponent(id) + "/" + action, {
				method: "POST",
				headers: { Authorization: "Bearer " + token.value }
			});
			const data = await res.json();
			if (!res.ok) {
				message.textContent = data.error || "Failed";
				message.className = "error";
				return;
			}
			await loadComments();
		}

		load.addEventListener("click", loadComments);
		checkAuth().catch(() => { authState.textContent = "無法確認登入狀態。"; });
	</script>
</body>
</html>`,
		{},
		ctx.corsHeaders
	);
}
