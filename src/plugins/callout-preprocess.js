/**
 * Vite plugin: preprocesses raw .md files before Astro/remark parses them.
 *
 * Converts the legacy {{notice}} / {{noticed}} callout syntax to the new
 * GitHub-style alert syntax (> [!NOTE]) so the rehype-callouts plugin
 * can render them uniformly.
 *
 * Supported old formats:
 *   {{notice}}
 *   content
 *   {{noticed}}
 *
 *   {{notice}} Optional title
 *   content
 *   {{noticed}}
 */
export function calloutPreprocessPlugin() {
	return {
		name: "callout-preprocess",
		/** @param {string} code @param {string} id */
		transform(code, id) {
			if (!id.endsWith(".md")) return null;

			// Match {{notice}} ... {{noticed}} blocks (non-greedy, handles multiline)
			const result = code.replace(
				/\{\{notice\}\}([ \t]+([^\n]*))?([\s\S]*?)\{\{noticed\}\}/g,
				(_match, _titleWithSpace, title, rawContent) => {
					const cleanTitle = title?.trim() ?? "";
					// Strip leading/trailing blank lines from content
					const content = rawContent.replace(/^\s*\n/, "").replace(/\n\s*$/, "");

					const lines = content.split("\n");
					const quotedLines = lines.map((l) => `> ${l}`).join("\n");

					const titleLine = cleanTitle ? `> **${cleanTitle}**\n` : "";
					return `\n> [!NOTE]\n${titleLine}${quotedLines}\n`;
				}
			);

			return result === code ? null : { code: result };
		}
	};
}
