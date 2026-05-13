import type { AppContext } from "../types";
import { html } from "../utils/http";

export function adminUi(ctx: AppContext): Response {
	const blogOrigin =
		(ctx.env.ALLOWED_ORIGINS ?? "")
			.split(",")
			.map(origin => origin.trim())
			.find(origin => origin.startsWith("http")) ?? "https://emtech.cc";

	return html(
		`<!doctype html>
<html lang="zh-Hant">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>留言審核</title>
	<style>
		:root {
			color-scheme: light;
			--bg: #f7f7f3;
			--surface: #ffffff;
			--surface-muted: #f0f3ee;
			--ink: #17202a;
			--muted: #5f6d72;
			--border: #d7ddd5;
			--border-strong: #aeb9b0;
			--accent: #2c6f7f;
			--accent-soft: #e8f5f7;
			--danger: #9b2f2f;
			--danger-soft: #f8e9e8;
			--ok: #246c46;
			--ok-soft: #e7f4ec;
			--warn: #8a5a12;
			--warn-soft: #fbf0d8;
		}

		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			background: var(--bg);
			color: var(--ink);
			font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		}

		a {
			color: inherit;
			text-underline-offset: 0.2em;
		}

		button,
		input {
			font: inherit;
		}

		button {
			min-height: 40px;
			border: 1px solid var(--border-strong);
			background: var(--surface);
			color: var(--ink);
			cursor: pointer;
			font-weight: 700;
			padding: 9px 12px;
		}

		button:hover {
			border-color: var(--ink);
		}

		button:disabled {
			cursor: not-allowed;
			opacity: 0.45;
		}

		.admin-shell {
			width: min(1180px, calc(100% - 32px));
			margin: 0 auto;
			padding: 28px 0 56px;
		}

		.admin-hero {
			display: flex;
			align-items: flex-start;
			justify-content: space-between;
			gap: 20px;
			padding: 20px 0 24px;
			border-bottom: 1px solid var(--border);
		}

		.eyebrow {
			margin: 0 0 8px;
			color: var(--muted);
			font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
			font-size: 0.76rem;
			font-weight: 800;
			letter-spacing: 0.08em;
			text-transform: uppercase;
		}

		h1 {
			margin: 0;
			font-size: clamp(2.2rem, 7vw, 5.2rem);
			line-height: 0.95;
			letter-spacing: 0;
		}

		.hero-actions {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			flex-wrap: wrap;
			gap: 10px;
			min-width: 220px;
			padding-top: 4px;
			text-align: right;
		}

		.session-pill,
		.status-pill,
		.meta-pill {
			display: inline-flex;
			align-items: center;
			min-height: 28px;
			border: 1px solid var(--border);
			background: var(--surface);
			color: var(--muted);
			font-size: 0.82rem;
			font-weight: 700;
			padding: 5px 8px;
		}

		.status-pill[data-status="pending"] {
			background: var(--warn-soft);
			color: var(--warn);
			border-color: #ebd097;
		}

		.status-pill[data-status="approved"] {
			background: var(--ok-soft);
			color: var(--ok);
			border-color: #b8d8c2;
		}

		.status-pill[data-status="rejected"],
		.status-pill[data-status="deleted"],
		.status-pill[data-status="spam"] {
			background: var(--danger-soft);
			color: var(--danger);
			border-color: #e2b8b4;
		}

		.gate {
			margin-top: 18px;
			border: 1px solid var(--border);
			background: var(--surface);
			padding: 18px;
		}

		.gate p {
			margin: 0 0 12px;
			color: var(--muted);
			line-height: 1.6;
		}

		.gate p:last-child {
			margin-bottom: 0;
		}

		.stats {
			display: grid;
			grid-template-columns: repeat(6, minmax(0, 1fr));
			gap: 10px;
			margin: 18px 0;
		}

		.stat {
			border: 1px solid var(--border);
			background: var(--surface);
			padding: 13px 12px;
		}

		.stat strong {
			display: block;
			margin-bottom: 4px;
			font-size: 1.7rem;
			line-height: 1;
		}

		.stat span {
			color: var(--muted);
			font-size: 0.82rem;
			font-weight: 800;
		}

		.toolbar {
			display: grid;
			grid-template-columns: 1fr auto;
			gap: 12px;
			align-items: center;
			margin-bottom: 14px;
			border: 1px solid var(--border);
			background: var(--surface);
			padding: 12px;
		}

		.search {
			width: 100%;
			min-height: 42px;
			border: 1px solid var(--border-strong);
			background: var(--bg);
			color: var(--ink);
			padding: 10px 12px;
		}

		.filter-bar {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
			margin-bottom: 18px;
		}

		.filter-button {
			background: var(--surface);
			color: var(--muted);
		}

		.filter-button[aria-pressed="true"] {
			background: var(--accent-soft);
			color: var(--ink);
			border-color: var(--accent);
		}

		.workspace {
			display: grid;
			grid-template-columns: minmax(220px, 300px) 1fr;
			gap: 16px;
			align-items: start;
		}

		.sidebar,
		.queue {
			min-width: 0;
		}

		.sidebar {
			position: sticky;
			top: 16px;
			display: grid;
			gap: 10px;
		}

		.page-filter {
			width: 100%;
			display: grid;
			gap: 4px;
			border: 1px solid var(--border);
			background: var(--surface);
			padding: 11px 12px;
			text-align: left;
		}

		.page-filter[aria-pressed="true"] {
			border-color: var(--accent);
			background: var(--accent-soft);
		}

		.page-filter strong {
			display: block;
			overflow-wrap: anywhere;
			font-size: 0.92rem;
		}

		.page-filter span {
			color: var(--muted);
			font-size: 0.78rem;
			font-weight: 700;
		}

		.group {
			margin-bottom: 16px;
			border: 1px solid var(--border);
			background: var(--surface-muted);
		}

		.group-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 12px;
			padding: 13px 14px;
			border-bottom: 1px solid var(--border);
		}

		.group-title {
			min-width: 0;
		}

		.group-title a {
			display: block;
			overflow-wrap: anywhere;
			font-size: 1rem;
			font-weight: 900;
		}

		.group-title span {
			display: block;
			margin-top: 3px;
			color: var(--muted);
			font-size: 0.78rem;
			font-weight: 700;
		}

		.comment-list {
			display: grid;
			gap: 10px;
			padding: 10px;
		}

		.comment-card {
			display: grid;
			gap: 10px;
			border: 1px solid var(--border);
			background: var(--surface);
			padding: 14px;
		}

		.comment-card[data-reply="true"] {
			border-left: 4px solid var(--accent);
			background: #fbfdfd;
		}

		.comment-topline,
		.comment-meta,
		.comment-actions {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 8px;
		}

		.comment-topline {
			justify-content: space-between;
		}

		.author {
			min-width: 0;
			font-weight: 900;
			overflow-wrap: anywhere;
		}

		.comment-meta {
			color: var(--muted);
			font-size: 0.82rem;
			font-weight: 700;
		}

		.comment-body {
			white-space: pre-wrap;
			overflow-wrap: anywhere;
			color: var(--ink);
			line-height: 1.65;
		}

		.comment-actions {
			padding-top: 2px;
		}

		.action-approve {
			background: var(--ok-soft);
			border-color: #9dcaab;
		}

		.action-reject,
		.action-delete {
			background: var(--danger-soft);
			border-color: #d9aaa6;
		}

		.notice {
			margin: 0;
			color: var(--muted);
			font-weight: 700;
		}

		.error {
			color: var(--danger);
		}

		.empty {
			border: 1px solid var(--border);
			background: var(--surface);
			padding: 22px;
			color: var(--muted);
			font-weight: 800;
			text-align: center;
		}

		[hidden] {
			display: none !important;
		}

		@media (max-width: 860px) {
			.admin-shell {
				width: min(100% - 24px, 1180px);
				padding-top: 18px;
			}

			.admin-hero,
			.toolbar {
				grid-template-columns: 1fr;
				display: grid;
			}

			.hero-actions {
				justify-content: flex-start;
				text-align: left;
			}

			.stats {
				grid-template-columns: repeat(2, minmax(0, 1fr));
			}

			.workspace {
				grid-template-columns: 1fr;
			}

			.sidebar {
				position: static;
			}
		}
	</style>
</head>
<body>
	<main class="admin-shell">
		<header class="admin-hero">
			<div>
				<p class="eyebrow">Comments Admin</p>
				<h1>留言審核</h1>
			</div>
			<div class="hero-actions">
				<span class="session-pill" id="sessionState">Checking session...</span>
				<a id="loginLink" href="/api/auth/github/start?returnTo=/admin">GitHub login</a>
			</div>
		</header>

		<section class="gate" id="gate">
			<p>管理介面只允許 GitHub 帳號 <strong>elvisdragonmao</strong> 使用。</p>
			<p id="gateMessage">正在確認登入狀態。</p>
		</section>

		<section id="adminApp" hidden>
			<div class="stats" id="stats"></div>
			<section class="toolbar">
				<input class="search" id="searchInput" type="search" placeholder="搜尋留言、作者、文章路徑" autocomplete="off" />
				<button id="refreshButton" type="button">重新整理</button>
			</section>
			<nav class="filter-bar" id="statusFilters" aria-label="留言狀態"></nav>
			<div class="workspace">
				<aside class="sidebar" id="pageFilters" aria-label="文章分類"></aside>
				<section class="queue" aria-live="polite">
					<p class="notice" id="message"></p>
					<div id="comments"></div>
				</section>
			</div>
		</section>
	</main>

	<script>
		const ADMIN_LOGIN = "elvisdragonmao";
		const BLOG_ORIGIN = ${JSON.stringify(blogOrigin)};
		const STATUS_ORDER = ["pending", "approved", "rejected", "spam", "deleted"];
		const STATUS_LABELS = {
			all: "全部",
			pending: "待審",
			approved: "已公開",
			rejected: "已拒絕",
			spam: "垃圾",
			deleted: "已刪除"
		};

		const sessionState = document.querySelector("#sessionState");
		const loginLink = document.querySelector("#loginLink");
		const gate = document.querySelector("#gate");
		const gateMessage = document.querySelector("#gateMessage");
		const adminApp = document.querySelector("#adminApp");
		const stats = document.querySelector("#stats");
		const statusFilters = document.querySelector("#statusFilters");
		const pageFilters = document.querySelector("#pageFilters");
		const comments = document.querySelector("#comments");
		const message = document.querySelector("#message");
		const searchInput = document.querySelector("#searchInput");
		const refreshButton = document.querySelector("#refreshButton");

		let allComments = [];
		let activeStatus = "pending";
		let activePagePath = "all";
		let searchTerm = "";
		let loading = false;

		function formatDate(value) {
			try {
				return new Intl.DateTimeFormat("zh-Hant", {
					month: "short",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit"
				}).format(new Date(value));
			} catch {
				return value;
			}
		}

		function blogUrl(pagePath) {
			return BLOG_ORIGIN.replace(/\\/$/, "") + pagePath + "#comments";
		}

		async function checkAuth() {
			const response = await fetch("/api/auth/me", { credentials: "include" });
			const data = await response.json();
			if (!data.authenticated) {
				sessionState.textContent = "尚未登入";
				gateMessage.textContent = "請先使用 GitHub 登入。";
				return;
			}

			loginLink.hidden = true;
			sessionState.textContent = "@" + data.user.login;
			if (data.user.login !== ADMIN_LOGIN) {
				gateMessage.textContent = "目前登入 @" + data.user.login + "，不是管理員帳號。";
				return;
			}

			gate.hidden = true;
			adminApp.hidden = false;
			await loadComments();
		}

		async function loadComments() {
			if (loading) return;
			loading = true;
			refreshButton.disabled = true;
			message.className = "notice";
			message.textContent = "載入留言中...";
			try {
				const response = await fetch("/api/admin/comments?status=all", { credentials: "include" });
				const data = await response.json();
				if (!response.ok) {
					throw new Error(data.error || "Failed to load comments");
				}
				allComments = Array.isArray(data.comments) ? data.comments : [];
				if (!allComments.some(comment => comment.status === activeStatus) && activeStatus !== "all") {
					activeStatus = "all";
				}
				render();
			} catch (error) {
				message.className = "notice error";
				message.textContent = error instanceof Error ? error.message : "無法載入留言。";
			} finally {
				loading = false;
				refreshButton.disabled = false;
			}
		}

		function render() {
			renderStats();
			renderStatusFilters();
			renderPageFilters();
			renderComments();
		}

		function countByStatus(source) {
			return source.reduce((counts, comment) => {
				counts[comment.status] = (counts[comment.status] || 0) + 1;
				return counts;
			}, {});
		}

		function renderStats() {
			const counts = countByStatus(allComments);
			const total = allComments.length;
			stats.replaceChildren(
				statNode("全部", total),
				statNode("待審", counts.pending || 0),
				statNode("已公開", counts.approved || 0),
				statNode("垃圾", counts.spam || 0),
				statNode("已拒絕", counts.rejected || 0),
				statNode("已刪除", counts.deleted || 0)
			);
		}

		function statNode(label, value) {
			const node = document.createElement("div");
			node.className = "stat";
			const strong = document.createElement("strong");
			strong.textContent = String(value);
			const span = document.createElement("span");
			span.textContent = label;
			node.append(strong, span);
			return node;
		}

		function renderStatusFilters() {
			statusFilters.replaceChildren();
			for (const status of ["all"].concat(STATUS_ORDER)) {
				const button = document.createElement("button");
				button.type = "button";
				button.className = "filter-button";
				button.setAttribute("aria-pressed", String(activeStatus === status));
				button.textContent = STATUS_LABELS[status] + " " + statusCountLabel(status);
				button.addEventListener("click", () => {
					activeStatus = status;
					render();
				});
				statusFilters.appendChild(button);
			}
		}

		function statusCountLabel(status) {
			if (status === "all") return "(" + allComments.length + ")";
			return "(" + allComments.filter(comment => comment.status === status).length + ")";
		}

		function filteredComments() {
			const normalizedSearch = searchTerm.trim().toLowerCase();
			return allComments.filter(comment => {
				if (activeStatus !== "all" && comment.status !== activeStatus) return false;
				if (activePagePath !== "all" && comment.pagePath !== activePagePath) return false;
				if (!normalizedSearch) return true;
				const haystack = [
					comment.pagePath,
					comment.body,
					comment.author && comment.author.name,
					comment.githubLogin,
					comment.meta && comment.meta.device,
					comment.meta && comment.meta.browser,
					comment.meta && comment.meta.location
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();
				return haystack.includes(normalizedSearch);
			});
		}

		function pageSummaries() {
			const map = new Map();
			for (const comment of allComments) {
				const current = map.get(comment.pagePath) || {
					pagePath: comment.pagePath,
					total: 0,
					pending: 0,
					latest: comment.createdAt
				};
				current.total += 1;
				if (comment.status === "pending") current.pending += 1;
				if (new Date(comment.createdAt).getTime() > new Date(current.latest).getTime()) {
					current.latest = comment.createdAt;
				}
				map.set(comment.pagePath, current);
			}
			return Array.from(map.values()).sort((a, b) => {
				if (b.pending !== a.pending) return b.pending - a.pending;
				return new Date(b.latest).getTime() - new Date(a.latest).getTime();
			});
		}

		function renderPageFilters() {
			pageFilters.replaceChildren();
			pageFilters.appendChild(pageFilterButton("all", "全部頁面", allComments.length + " 則留言", activePagePath === "all"));
			for (const page of pageSummaries()) {
				const detail = page.total + " 則留言" + (page.pending ? " / " + page.pending + " 待審" : "") + " / " + formatDate(page.latest);
				pageFilters.appendChild(pageFilterButton(page.pagePath, page.pagePath, detail, activePagePath === page.pagePath));
			}
		}

		function pageFilterButton(pagePath, title, detail, selected) {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "page-filter";
			button.setAttribute("aria-pressed", String(selected));
			const strong = document.createElement("strong");
			strong.textContent = title;
			const span = document.createElement("span");
			span.textContent = detail;
			button.append(strong, span);
			button.addEventListener("click", () => {
				activePagePath = pagePath;
				render();
			});
			return button;
		}

		function renderComments() {
			const visible = filteredComments();
			const grouped = groupByPage(visible);
			comments.replaceChildren();
			message.className = "notice";
			message.textContent = visible.length + " 則符合條件";
			if (visible.length === 0) {
				const empty = document.createElement("div");
				empty.className = "empty";
				empty.textContent = "沒有符合目前篩選條件的留言。";
				comments.appendChild(empty);
				return;
			}

			for (const group of grouped) {
				comments.appendChild(renderGroup(group.pagePath, group.comments));
			}
		}

		function groupByPage(source) {
			const map = new Map();
			for (const comment of source) {
				const list = map.get(comment.pagePath) || [];
				list.push(comment);
				map.set(comment.pagePath, list);
			}
			return Array.from(map.entries())
				.map(([pagePath, list]) => ({
					pagePath,
					comments: list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				}))
				.sort((a, b) => {
					const aPending = a.comments.filter(comment => comment.status === "pending").length;
					const bPending = b.comments.filter(comment => comment.status === "pending").length;
					if (bPending !== aPending) return bPending - aPending;
					return new Date(b.comments[0].createdAt).getTime() - new Date(a.comments[0].createdAt).getTime();
				});
		}

		function renderGroup(pagePath, groupComments) {
			const section = document.createElement("section");
			section.className = "group";

			const header = document.createElement("header");
			header.className = "group-header";
			const title = document.createElement("div");
			title.className = "group-title";
			const link = document.createElement("a");
			link.href = blogUrl(pagePath);
			link.target = "_blank";
			link.rel = "noreferrer";
			link.textContent = pagePath;
			const detail = document.createElement("span");
			detail.textContent = groupComments.length + " 則符合條件";
			title.append(link, detail);
			const pending = document.createElement("span");
			pending.className = "status-pill";
			pending.dataset.status = groupComments.some(comment => comment.status === "pending") ? "pending" : "approved";
			pending.textContent = groupComments.filter(comment => comment.status === "pending").length + " 待審";
			header.append(title, pending);

			const list = document.createElement("div");
			list.className = "comment-list";
			for (const comment of groupComments) {
				list.appendChild(renderComment(comment));
			}

			section.append(header, list);
			return section;
		}

		function renderComment(comment) {
			const article = document.createElement("article");
			article.className = "comment-card";
			article.dataset.reply = String(Boolean(comment.parentId));

			const top = document.createElement("div");
			top.className = "comment-topline";
			const author = document.createElement("div");
			author.className = "author";
			author.textContent = comment.author && comment.author.name ? comment.author.name : "Anonymous";
			const status = document.createElement("span");
			status.className = "status-pill";
			status.dataset.status = comment.status;
			status.textContent = STATUS_LABELS[comment.status] || comment.status;
			top.append(author, status);

			const meta = document.createElement("div");
			meta.className = "comment-meta";
			meta.append(
				metaPill(formatDate(comment.createdAt)),
				metaPill(authorTypeLabel(comment.author && comment.author.type)),
				metaPill(comment.parentId ? "回覆留言" : "主留言")
			);
			if (comment.meta && comment.meta.device) meta.appendChild(metaPill(comment.meta.device));
			if (comment.meta && comment.meta.browser) meta.appendChild(metaPill(comment.meta.browser));
			if (comment.meta && comment.meta.location) meta.appendChild(metaPill(comment.meta.location));

			const body = document.createElement("div");
			body.className = "comment-body";
			body.innerHTML = comment.body;

			const actions = document.createElement("div");
			actions.className = "comment-actions";
			actions.append(
				actionButton("approve", "公開", comment.status === "approved" || comment.status === "deleted"),
				actionButton("reject", "拒絕", comment.status === "rejected" || comment.status === "deleted"),
				actionButton("delete", "刪除", comment.status === "deleted")
			);

			article.append(top, meta, body, actions);
			return article;

			function actionButton(action, label, disabled) {
				const button = document.createElement("button");
				button.type = "button";
				button.className = "action-" + action;
				button.disabled = disabled;
				button.textContent = label;
				button.addEventListener("click", () => moderate(comment.id, action));
				return button;
			}
		}

		function metaPill(label) {
			const span = document.createElement("span");
			span.className = "meta-pill";
			span.textContent = label;
			return span;
		}

		function authorTypeLabel(type) {
			if (type === "github") return "GitHub 驗證";
			if (type === "gravatar") return "Gravatar";
			if (type === "named") return "具名匿名";
			return "匿名";
		}

		async function moderate(id, action) {
			message.className = "notice";
			message.textContent = "更新留言狀態中...";
			const response = await fetch("/api/admin/comments/" + encodeURIComponent(id) + "/" + action, {
				method: "POST",
				credentials: "include"
			});
			const data = await response.json();
			if (!response.ok) {
				message.className = "notice error";
				message.textContent = data.error || "更新失敗。";
				return;
			}
			allComments = allComments.map(comment => (comment.id === id ? Object.assign({}, comment, { status: data.status, updatedAt: new Date().toISOString() }) : comment));
			render();
		}

		refreshButton.addEventListener("click", loadComments);
		searchInput.addEventListener("input", event => {
			searchTerm = event.target.value;
			renderComments();
		});

		checkAuth().catch(() => {
			sessionState.textContent = "Session error";
			gateMessage.textContent = "無法確認登入狀態。";
		});
	</script>
</body>
</html>`,
		{},
		ctx.corsHeaders
	);
}
