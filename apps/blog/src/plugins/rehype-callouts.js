/**
 * rehype plugin: transforms GitHub-style alert blockquotes into styled callout divs.
 *
 * Supports:
 *   > [!NOTE]           → <div class="callout-note">
 *   > [!NOTE] Title     → with <strong>Title</strong>
 *   > [!TLDR]           → <div class="callout-tldr"> (big watermark "TL;DR")
 *   > [!WARNING]        → <div class="callout-warning">
 *   > [!TIP]            → <div class="callout-tip">
 *   > [!IMPORTANT]      → <div class="callout-important">
 *   > [!CAUTION]        → <div class="callout-caution">
 *
 * After remark converts markdown to HTML, `> [!NOTE]\n> content` becomes:
 *   <blockquote><p>[!NOTE]</p><p>content</p></blockquote>
 * or (when on one paragraph line):
 *   <blockquote><p>[!NOTE]\ncontent</p></blockquote>
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { visit } from "unist-util-visit";

const TYPE_MAP = {
	NOTE: { className: "callout-note", label: "Note", icon: "message-square", watermark: null },
	TIP: { className: "callout-tip", label: "提示", icon: "lightbulb", watermark: null },
	IMPORTANT: { className: "callout-important", label: "重要", icon: "circle-alert", watermark: null },
	WARNING: { className: "callout-warning", label: "注意", icon: "triangle-alert", watermark: null },
	CAUTION: { className: "callout-caution", label: "小心", icon: "construction", watermark: null },
	TLDR: { className: "callout-tldr", label: "TL;DR", icon: null, watermark: "TL;DR" },
	SUMMARY: { className: "callout-tldr", label: "簡單來說", icon: null, watermark: "TL;DR" }
};

const ICONS = {
	"message-square": loadLucideAstroIcon("message-square"),
	lightbulb: loadLucideAstroIcon("lightbulb"),
	"circle-alert": loadLucideAstroIcon("circle-alert"),
	"triangle-alert": loadLucideAstroIcon("triangle-alert"),
	construction: loadLucideAstroIcon("construction")
};

function loadLucideAstroIcon(iconName) {
	const iconUrl = import.meta.resolve(`@lucide/astro/icons/${iconName}`);
	const source = readFileSync(fileURLToPath(iconUrl), "utf8");
	const marker = "createLucideIcon(";
	const markerIndex = source.indexOf(marker);
	if (markerIndex === -1) throw new Error(`Unable to read Lucide icon "${iconName}" from @lucide/astro.`);

	const arrayStart = source.indexOf("[", markerIndex + marker.length);
	if (arrayStart === -1) throw new Error(`Unable to read Lucide icon "${iconName}" from @lucide/astro.`);

	let depth = 0;
	let inString = false;
	let escapeNext = false;
	let arrayEnd = -1;

	for (let i = arrayStart; i < source.length; i += 1) {
		const char = source[i];
		if (escapeNext) {
			escapeNext = false;
			continue;
		}
		if (char === "\\") {
			escapeNext = true;
			continue;
		}
		if (char === '"') {
			inString = !inString;
			continue;
		}
		if (inString) continue;

		if (char === "[") depth += 1;
		if (char === "]") {
			depth -= 1;
			if (depth === 0) {
				arrayEnd = i + 1;
				break;
			}
		}
	}

	if (arrayEnd === -1) throw new Error(`Unable to read Lucide icon "${iconName}" from @lucide/astro.`);
	return JSON.parse(source.slice(arrayStart, arrayEnd));
}

function createLucideIconNode(iconName) {
	const iconNode = ICONS[iconName];
	if (!iconNode) return null;

	return {
		type: "element",
		tagName: "svg",
		properties: {
			xmlns: "http://www.w3.org/2000/svg",
			width: "18",
			height: "18",
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			ariaHidden: "true",
			focusable: "false",
			className: ["lucide", `lucide-${iconName}`, "callout-icon"]
		},
		children: iconNode.map(([tagName, properties]) => ({
			type: "element",
			tagName,
			properties,
			children: []
		}))
	};
}

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
			const titleChildren = [];
			const iconNode = config.icon ? createLucideIconNode(config.icon) : null;
			if (iconNode) titleChildren.push(iconNode);
			titleChildren.push({
				type: "element",
				tagName: "span",
				properties: {},
				children: [{ type: "text", value: labelText }]
			});
			calloutChildren.push({
				type: "element",
				tagName: "strong",
				properties: {},
				children: titleChildren
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
