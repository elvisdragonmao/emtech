import { visit } from "unist-util-visit";

const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/;
const shortcodePattern = /^\{\{youtube(?:\s+([\s\S]*?))?\}\}$/;
const descriptionPrefix = "影片替代內容：";
const allowedAttributes = new Set(["id", "title"]);

const textContent = node => {
	if (typeof node?.value === "string") return node.value;
	return (node?.children ?? []).map(textContent).join("");
};

const shortcodeText = node => {
	if (node.type !== "paragraph" || !node.children?.every(child => child.type === "text")) return "";
	return node.children
		.map(child => child.value ?? "")
		.join("")
		.trim();
};

const fail = (file, message, node) => {
	file.fail(message, node);
};

const parseAttributes = (source, node, file) => {
	const attributes = {};
	let cursor = 0;

	while (cursor < source.length) {
		while (/\s/.test(source[cursor] ?? "")) cursor += 1;
		if (cursor >= source.length) break;

		const nameMatch = source.slice(cursor).match(/^[A-Za-z][A-Za-z0-9-]*/);
		if (!nameMatch) fail(file, "Invalid attribute in youtube shortcode", node);

		const name = nameMatch[0];
		cursor += name.length;
		while (/\s/.test(source[cursor] ?? "")) cursor += 1;

		if (source[cursor] !== "=") fail(file, `YouTube shortcode attribute \`${name}\` requires a value`, node);
		cursor += 1;
		while (/\s/.test(source[cursor] ?? "")) cursor += 1;

		const quote = source[cursor];
		const closingQuote = quote === '"' || quote === "'" ? quote : quote === "“" ? "”" : quote === "‘" ? "’" : "";
		if (!closingQuote) fail(file, `YouTube shortcode attribute \`${name}\` must use quotes`, node);
		cursor += 1;

		let value = "";
		let closed = false;

		while (cursor < source.length) {
			const character = source[cursor];

			if (character === closingQuote) {
				closed = true;
				cursor += 1;
				break;
			}

			if (character === "\\" && (source[cursor + 1] === closingQuote || source[cursor + 1] === "\\")) {
				value += source[cursor + 1];
				cursor += 2;
				continue;
			}

			value += character;
			cursor += 1;
		}

		if (!closed) fail(file, `YouTube shortcode attribute \`${name}\` has an unclosed value`, node);
		if (Object.hasOwn(attributes, name)) fail(file, `Duplicate youtube shortcode attribute: ${name}`, node);
		if (!allowedAttributes.has(name)) fail(file, `Unsupported youtube shortcode attribute: ${name}`, node);

		attributes[name] = value.trim();

		if (cursor < source.length && !/\s/.test(source[cursor])) {
			fail(file, "Separate youtube shortcode attributes with whitespace", node);
		}
	}

	return attributes;
};

const descriptionParagraph = node => node?.type === "paragraph" && textContent(node).trimStart().startsWith(descriptionPrefix);

/**
 * Turn `{{youtube id="video-id" title="Accessible title"}}` into a
 * consistent, privacy-enhanced YouTube embed.
 *
 * When the immediately following paragraph starts with `影片替代內容：`, it
 * receives a generated id and is automatically linked with aria-describedby.
 */
export function remarkYoutube() {
	return (tree, file) => {
		const videoOccurrences = new Map();

		visit(tree, "paragraph", (node, index, parent) => {
			const match = shortcodeText(node).match(shortcodePattern);
			if (!match) return;

			const attributes = parseAttributes(match[1] ?? "", node, file);
			const videoId = attributes.id ?? "";
			const title = attributes.title ?? "";

			if (!youtubeIdPattern.test(videoId)) {
				fail(file, "YouTube shortcodes require a valid 11-character video `id`", node);
			}

			if (!title) {
				fail(file, "YouTube shortcodes require a non-empty accessible `title`", node);
			}

			const occurrence = (videoOccurrences.get(videoId) ?? 0) + 1;
			videoOccurrences.set(videoId, occurrence);

			const properties = {
				className: ["youtube-embed"],
				src: `https://www.youtube-nocookie.com/embed/${videoId}`,
				title,
				width: 1280,
				height: 720,
				loading: "lazy",
				frameBorder: 0,
				allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
				referrerPolicy: "strict-origin-when-cross-origin",
				allowFullScreen: true
			};

			const followingNode = parent && index != null ? parent.children[index + 1] : null;
			if (descriptionParagraph(followingNode)) {
				const suffix = occurrence === 1 ? "" : `-${occurrence}`;
				const descriptionId = `youtube-${videoId}${suffix}-description`;
				followingNode.data ??= {};
				followingNode.data.hProperties = { ...followingNode.data.hProperties, id: descriptionId };
				properties.ariaDescribedBy = descriptionId;
			}

			node.data ??= {};
			node.data.hName = "iframe";
			node.data.hProperties = properties;
			node.data.hChildren = [];
			node.children = [];
		});
	};
}
