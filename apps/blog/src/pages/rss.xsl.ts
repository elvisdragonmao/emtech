const xsl = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:media="http://search.yahoo.com/mrss/"
	xmlns:dc="http://purl.org/dc/elements/1.1/">
	<xsl:output method="html" encoding="UTF-8" indent="yes" />
	<xsl:template match="/">
		<html lang="zh-Hant">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title><xsl:value-of select="/rss/channel/title" /> RSS</title>
				<style>
					@import url("https://font.emtech.cc/css/IBMPlexSansTC");
					@import url("https://font.emtech.cc/css/JetBrainsMono");

					* {
						box-sizing: border-box;
					}

					:root {
						--color-bg: oklch(99% 0.004 235);
						--color-surface: oklch(100% 0 0);
						--color-ink: oklch(17% 0.022 255);
						--color-text: oklch(28% 0.025 255);
						--color-muted: oklch(58% 0.025 255);
						--color-border: oklch(89% 0.018 255);
						--color-grid-line: oklch(94% 0.012 240);
						--color-accent: oklch(71% 0.15 225);
						--color-accent-strong: oklch(61% 0.17 232);
						--shadow-card: 0 1.25rem 2.5rem oklch(17% 0.022 255 / 8%);
						--font-sans: "IBMPlexSansTC", "IBM Plex Sans Chinese TC", sans-serif;
						--font-mono: JetBrainsMono, "JetBrains Mono", monospace;
					}

					body {
						min-width: 20rem;
						margin: 0;
						font-family: var(--font-sans);
						color: var(--color-text);
						background:
							linear-gradient(90deg, transparent calc(100% - 1px), var(--color-grid-line) 1px),
							linear-gradient(180deg, transparent calc(100% - 1px), var(--color-grid-line) 1px),
							radial-gradient(circle, oklch(83% 0.05 225 / 55%) 1px, transparent 1.5px),
							var(--color-bg);
						background-size: 12rem 12rem, 12rem 12rem, 1rem 1rem, auto;
					}

					a {
						color: inherit;
						text-decoration: none;
					}

					.page {
						width: min(72rem, calc(100% - 2rem));
						margin: 0 auto;
						padding: 4rem 0;
					}

					.hero {
						display: grid;
						gap: 1rem;
						padding-bottom: 2rem;
						border-bottom: 1px solid var(--color-border);
					}

					.eyebrow {
						width: fit-content;
						padding: 0.35rem 0.55rem;
						font: 700 0.8rem/1 var(--font-mono);
						letter-spacing: 0.04em;
						color: var(--color-accent-strong);
						background: oklch(100% 0 0 / 80%);
						border: 1px solid var(--color-border);
					}

					h1 {
						margin: 0;
						font-size: clamp(3rem, 9vw, 6.5rem);
						line-height: 0.95;
						letter-spacing: 0;
						color: var(--color-ink);
					}

					.hero p {
						max-width: 42rem;
						margin: 0;
						font-size: 1.1rem;
						line-height: 1.8;
					}

					.actions {
						display: flex;
						flex-wrap: wrap;
						gap: 0.75rem;
						margin-top: 0.5rem;
					}

					.action {
						display: inline-flex;
						align-items: center;
						justify-content: center;
						min-height: 2.75rem;
						padding: 0.65rem 0.9rem;
						font-weight: 800;
						color: var(--color-ink);
						background: var(--color-surface);
						border: 1px solid var(--color-border);
						box-shadow: var(--shadow-card);
					}

					.feed {
						display: grid;
						gap: 1rem;
						padding: 2rem 0 0;
						margin: 0;
						list-style: none;
					}

					.item {
						display: grid;
						grid-template-columns: minmax(10rem, 15rem) minmax(0, 1fr);
						gap: 1rem;
						padding: 1rem;
						background: oklch(100% 0 0 / 82%);
						border: 1px solid var(--color-border);
						box-shadow: var(--shadow-card);
					}

					.thumb {
						width: 100%;
						aspect-ratio: 16 / 9;
						object-fit: cover;
						background: oklch(93% 0.045 220);
						border: 1px solid var(--color-border);
					}

					.content {
						min-width: 0;
					}

					.meta {
						display: flex;
						flex-wrap: wrap;
						gap: 0.5rem;
						margin-bottom: 0.5rem;
						font: 700 0.78rem/1.4 var(--font-mono);
						color: var(--color-muted);
					}

					h2 {
						margin: 0;
						font-size: 2rem;
						line-height: 1.25;
						color: var(--color-ink);
						overflow-wrap: anywhere;
						font-weight: 600;
					}

					.description {
						margin: 0.25rem 0 0;
						line-height: 1.75;
					}

					.categories {
						display: flex;
						flex-wrap: wrap;
						gap: 0.4rem;
						margin-top: 0.85rem;
					}

					.category {
						padding: 0.25rem 0.45rem;
						font-size: 0.82rem;
						font-weight: 700;
						color: var(--color-accent-strong);
						border: 1px solid oklch(83% 0.05 225);
						line-height: 1;
					}

					@media (max-width: 44rem) {
						.page {
							padding: 2rem 0;
						}

						.item {
							grid-template-columns: 1fr;
						}
					}
				</style>
			</head>
			<body>
				<main class="page">
					<header class="hero">
						<div class="eyebrow">RSS FEED</div>
						<h1><xsl:value-of select="/rss/channel/title" /></h1>
						<p>嘿嘿酷吧！是不想被演算法操弄的朋友呢，歡迎把這個網址送給你的 RSS 閱讀器嗷！</p>
						<div class="actions">
							<a class="action" href="/">回到首頁</a>
						</div>
					</header>
					<ol class="feed">
						<xsl:for-each select="/rss/channel/item">
							<li class="item">
								<xsl:choose>
									<xsl:when test="media:thumbnail/@url">
										<img class="thumb" src="{media:thumbnail/@url}" alt="" loading="lazy" />
									</xsl:when>
									<xsl:otherwise>
										<div class="thumb"></div>
									</xsl:otherwise>
								</xsl:choose>
								<article class="content">
									<div class="meta">
										<span><xsl:value-of select="pubDate" /></span>
										<span><xsl:value-of select="dc:creator" /></span>
									</div>
									<h2>
										<a href="{link}">
											<xsl:value-of select="title" />
										</a>
									</h2>
									<p class="description"><xsl:value-of select="description" /></p>
									<div class="categories">
										<xsl:for-each select="category">
											<span class="category"><xsl:value-of select="." /></span>
										</xsl:for-each>
									</div>
								</article>
							</li>
						</xsl:for-each>
					</ol>
				</main>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>`;

export async function GET() {
	return new Response(xsl, {
		headers: {
			"Content-Type": "text/xsl; charset=utf-8"
		}
	});
}
