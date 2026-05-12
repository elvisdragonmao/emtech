/**
 * rehype plugin: transforms GitHub-style alert blockquotes into styled callout divs.
 *
 * Supports:
 *   > [!NOTE]           → <div class="callout-note">
 *   > [!NOTE] Title     → with <strong>Title</strong>
 *   > [!TLDR]           → <div class="callout-tldr"> (big watermark "TL;DR")
 *   > [!WARNING]        → <div class="callout-warning">
 *   > [!TIP]            → <div class="callout-tip">
 *
 * After remark converts markdown to HTML, `> [!NOTE]\n> content` becomes:
 *   <blockquote><p>[!NOTE]</p><p>content</p></blockquote>
 * or (when on one paragraph line):
 *   <blockquote><p>[!NOTE]\ncontent</p></blockquote>
 */

import { visit } from "unist-util-visit";

const TYPE_MAP = {
	NOTE: { className: "callout-note", label: "Note", watermark: null },
	TIP: { className: "callout-tip", label: "提示", watermark: null },
	WARNING: { className: "callout-warning", label: "注意", watermark: null },
	TLDR: { className: "callout-tldr", label: "TL;DR", watermark: "TL;DR" },
	SUMMARY: { className: "callout-tldr", label: "簡單來說", watermark: "TL;DR" }
};

export function rehypeCallouts() {
	return tree => {
		visit(tree, "element", (node, index, parent) => {
			if (node.tagName !== "blockquote") return;

			// Find the first paragraph child
			const firstP = node.children?.find(c => c.type === "element" && c.tagName === "p");
			if (!firstP) return;

			// Extract the raw text from the first paragraph's first text node
			const firstText = firstP.children?.find(c => c.type === "text");
			if (!firstText) return;

			// Text may be "[!NOTE]", "[!NOTE] Title", or "[!NOTE]\nRest of content"
			const rawText = firstText.value ?? "";
			const alertMatch = rawText.match(/^\[!([\w]+)\]([ \t]+([^\n]*))?(\n[\s\S]*)?$/);
			if (!alertMatch) return;

			const typeKey = alertMatch[1].toUpperCase();
			const config = TYPE_MAP[typeKey];
			if (!config) return;

			const inlineTitle = alertMatch[3]?.trim() ?? "";
			const remainingText = alertMatch[4] ?? ""; // text after the [!TYPE] line

			// Build replacement node children
			const calloutChildren = [];

			// Title / label
			const labelText = inlineTitle || config.label;
			calloutChildren.push({
				type: "element",
				tagName: "strong",
				properties: {},
				children: [{ type: "text", value: labelText }]
			});

			// If there's remaining text in the same paragraph, keep it
			if (remainingText.trim()) {
				firstText.value = remainingText.replace(/^\n/, "");
				calloutChildren.push(...(firstP.children ?? []));
			}

			// Remaining sibling paragraphs in the blockquote
			const restChildren = node.children.filter(c => c !== firstP);
			calloutChildren.push(...restChildren);

			// Optional watermark span
			if (config.watermark) {
				calloutChildren.push({
					type: "element",
					tagName: "span",
					properties: { ariaHidden: "true" },
					children: [{ type: "text", value: config.watermark }]
				});
			}

			// Replace blockquote with the styled div
			const replacement = {
				type: "element",
				tagName: "div",
				properties: { className: [config.className] },
				children: calloutChildren
			};

			if (parent && index != null) {
				parent.children[index] = replacement;
			}
		});
	};
}
