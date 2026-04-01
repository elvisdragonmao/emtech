import hljs from "highlight.js";
import type { Options } from "markdown-it";
import MarkdownIt from "markdown-it";
import type Renderer from "markdown-it/lib/renderer.mjs";
import type Token from "markdown-it/lib/token.mjs";

const slugify = (text: string) =>
	text
		.toString()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^\p{L}\p{N}\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\-_]+/gu, "")
		.replace(/\-\-+/g, "-")
		.toLowerCase();

interface MarkdownEnv {
	slugCounts?: Map<string, number>;
}

const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

export const createMarkdownRenderer = (imageMeta: Record<string, string>) => {
	const md = new MarkdownIt({
		html: true,
		linkify: false,
		highlight: (source: string, lang: string): string => {
			const code = source.endsWith("\n") ? source.slice(0, -1) : source;
			const language = (lang || "plaintext").trim().toLowerCase();

			if (!language || !hljs.getLanguage(language)) {
				return escapeHtml(code);
			}

			return hljs.highlight(code, {
				language
			}).value;
		}
	});

	md.renderer.rules.heading_open = (tokens: Token[], idx: number, options: Options, env: unknown, self: Renderer) => {
		const token = tokens[idx];
		const level = token.tag.slice(1);
		if (level === "1") return self.renderToken(tokens, idx, options);

		const headingText = tokens[idx + 1]?.content ?? "";
		const baseSlug = slugify(headingText) || `section-${idx}`;
		const markdownEnv = env as MarkdownEnv;
		markdownEnv.slugCounts ??= new Map<string, number>();
		const existingCount = markdownEnv.slugCounts.get(baseSlug) ?? 0;
		markdownEnv.slugCounts.set(baseSlug, existingCount + 1);
		const slug = existingCount === 0 ? baseSlug : `${baseSlug}-${existingCount + 1}`;
		token.attrSet("id", slug);
		return self.renderToken(tokens, idx, options);
	};

	md.renderer.rules.fence = (tokens: Token[], idx: number) => {
		const token = tokens[idx];
		const info = token.info?.trim() ?? "";
		const langName = info.split(/\s+/)[0] || "code";
		const langClass = info ? `language-${langName}` : "";
		const codeContent = token.content.endsWith("\n") ? token.content.slice(0, -1) : token.content;
		const highlightedCode = md.options.highlight?.(codeContent, langName, "") ?? escapeHtml(codeContent);
		const rows = highlightedCode.split("\n").length;
		const toggle =
			rows > 5
				? `<input type="checkbox" class="code-toggle" id="code-toggle-${token.map?.[0] ?? 0}">
        <label for="code-toggle-${token.map?.[0] ?? 0}" class="code-toggle-label"></label>`
				: "";

		return `<div class="code-block emfont-FiraMono">
  <div class="highlight">
    <div class="code-wrapper">
      <div class="line-numbers">
        ${codeContent
					.split("\n")
					.map((_line: string, index: number) => `<div class="ln">${index + 1}</div>`)
					.join("")}
      </div>
      <div class="code-content" tabindex="0">
        <pre class="chroma"><code class="${langClass} hljs" data-lang="${langName}">${highlightedCode}</code></pre>
      </div>
    </div>
  </div>
  <button class="code-copy" onclick="copyCode(this)">Copy</button>
  ${toggle}
</div>
`;
	};

	md.renderer.rules.image = (tokens: Token[], idx: number) => {
		const token = tokens[idx];
		const src = token.attrGet("src") ?? "";
		const alt = token.content || "";
		const title = token.attrGet("title") ?? "";
		const size = imageMeta[decodeURIComponent(src)] || "";
		return `
        <figure>
            <img src="${src}" alt="${alt}" title="${title}" ${size}>
            ${alt ? `<figcaption>${alt}</figcaption>` : ""}
        </figure>
    `;
	};

	md.renderer.rules.table_open = () => "<div class='table-wrapper'><table>";
	md.renderer.rules.table_close = () => "</table></div>";

	return md;
};
