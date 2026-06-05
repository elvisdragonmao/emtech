import { visit } from "unist-util-visit";

const formControlTags = new Set(["input", "textarea", "select"]);

const getProperty = (node, names) => {
	for (const name of names) {
		const value = node.properties?.[name];
		if (typeof value === "string") return value;
		if (Array.isArray(value)) {
			const stringValue = value.find(item => typeof item === "string");
			if (stringValue) return stringValue;
		}
	}
	return "";
};

const hasProperty = (node, names) =>
	names.some(name => {
		const value = node.properties?.[name];
		return typeof value === "string" ? value.trim().length > 0 : value != null;
	});

const textContent = node => {
	if (!node) return "";
	if (node.type === "text") return node.value ?? "";
	return (node.children ?? []).map(textContent).join("");
};

const collectLabelTargets = tree => {
	const targets = new Set();

	visit(tree, "element", node => {
		if (node.tagName !== "label") return;
		const targetId = getProperty(node, ["htmlFor", "for"]);
		if (!targetId || !textContent(node).trim()) return;
		targets.add(targetId);
	});

	return targets;
};

const isInsideNamedLabel = parent => parent?.type === "element" && parent.tagName === "label" && textContent(parent).trim().length > 0;

const hasAccessibleName = (node, parent, labelTargets) => {
	if (hasProperty(node, ["ariaLabel", "aria-label", "ariaLabelledby", "aria-labelledby", "title", "placeholder"])) return true;
	if (isInsideNamedLabel(parent)) return true;
	const id = getProperty(node, ["id"]);
	return Boolean(id && labelTargets.has(id));
};

const inputTypeLabel = node => {
	const type = getProperty(node, ["type"]).toLowerCase();
	const value = getProperty(node, ["value"]);

	if (type === "checkbox") return "示範核取方塊";
	if (type === "radio") return value ? `示範單選按鈕：${value}` : "示範單選按鈕";
	if (type === "password") return "示範密碼輸入欄位";
	if (type === "email") return "示範 Email 輸入欄位";
	if (type === "search") return "示範搜尋欄位";
	return "示範文字輸入欄位";
};

const controlLabel = node => {
	if (node.tagName === "textarea") return "示範多行文字輸入欄位";
	if (node.tagName === "select") return "示範下拉選單";
	return inputTypeLabel(node);
};

const frameTitle = src => {
	const normalized = src.toLowerCase();
	if (normalized.includes("youtube.com") || normalized.includes("youtu.be")) return "YouTube 影片嵌入內容";
	if (normalized.includes("codepen.io")) return "CodePen 範例嵌入內容";
	if (normalized.includes("facebook.com")) return "Facebook 貼文嵌入內容";
	return "嵌入內容";
};

const rawHasAttribute = (attributes, names) => names.some(name => new RegExp(`\\s${name}\\s*=`, "i").test(attributes));

const rawAttribute = (attributes, name) => {
	const match = attributes.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>` + "`" + `]+))`, "i"));
	return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
};

const appendRawAttribute = (tagName, attributes, selfClosingSlash, name, value) => {
	const normalizedAttributes = attributes.replace(/\s+$/, "");
	const separator = normalizedAttributes ? " " : "";
	const close = selfClosingSlash ? " />" : ">";
	return `<${tagName}${normalizedAttributes}${separator}${name}="${value}"${close}`;
};

const rawControlLabel = (tagName, attributes) => {
	if (tagName.toLowerCase() === "textarea") return "示範多行文字輸入欄位";
	if (tagName.toLowerCase() === "select") return "示範下拉選單";

	const type = rawAttribute(attributes, "type").toLowerCase();
	const value = rawAttribute(attributes, "value");
	if (type === "checkbox") return "示範核取方塊";
	if (type === "radio") return value ? `示範單選按鈕：${value}` : "示範單選按鈕";
	if (type === "password") return "示範密碼輸入欄位";
	if (type === "email") return "示範 Email 輸入欄位";
	if (type === "search") return "示範搜尋欄位";
	return "示範文字輸入欄位";
};

const transformRawHtml = value =>
	value
		.replace(/<iframe\b([^>]*?)(\/?)>/gi, (match, attributes, selfClosingSlash) => {
			if (rawHasAttribute(attributes, ["title", "aria-label", "aria-labelledby"])) return match;
			return appendRawAttribute("iframe", attributes, selfClosingSlash, "title", frameTitle(rawAttribute(attributes, "src")));
		})
		.replace(/<(input|textarea|select)\b([^>]*?)(\/?)>/gi, (match, tagName, attributes, selfClosingSlash) => {
			const type = rawAttribute(attributes, "type").toLowerCase();
			if (type === "hidden" || rawHasAttribute(attributes, ["aria-label", "aria-labelledby", "title", "placeholder"])) return match;
			return appendRawAttribute(tagName, attributes, selfClosingSlash, "aria-label", rawControlLabel(tagName, attributes));
		});

export function remarkAccessibleRawHtml() {
	return tree => {
		visit(tree, "html", node => {
			if (typeof node.value === "string") node.value = transformRawHtml(node.value);
		});
	};
}

export function remarkNormalizeContentHeadings() {
	return tree => {
		let previousDepth = 1;

		visit(tree, "heading", node => {
			node.depth = Math.max(2, Math.min(node.depth, previousDepth + 1));
			previousDepth = node.depth;
		});
	};
}

export function rehypeAccessibleEmbeds() {
	return tree => {
		const labelTargets = collectLabelTargets(tree);

		visit(tree, ["raw", "html"], node => {
			if (node.type === "raw" && typeof node.value === "string") node.value = transformRawHtml(node.value);
			if (node.type === "html" && typeof node.value === "string") node.value = transformRawHtml(node.value);
		});

		visit(tree, "element", (node, _index, parent) => {
			node.properties ??= {};

			if (node.tagName === "iframe") {
				if (!hasAccessibleName(node, parent, labelTargets)) node.properties.title = frameTitle(getProperty(node, ["src"]));
				node.properties.loading ??= "lazy";
				return;
			}

			if (!formControlTags.has(node.tagName)) return;
			const type = getProperty(node, ["type"]).toLowerCase();
			if (type === "hidden") return;
			if (!hasAccessibleName(node, parent, labelTargets)) node.properties.ariaLabel = controlLabel(node);
		});
	};
}
