import { visit } from "unist-util-visit";

const isElement = (node, tagName) => node?.type === "element" && node.tagName === tagName;

const classList = node => {
	const className = node.properties?.className ?? node.properties?.class;
	if (Array.isArray(className)) return className.filter(item => typeof item === "string");
	if (typeof className === "string") return className.split(/\s+/).filter(Boolean);
	return [];
};

const setClassList = (node, classes) => {
	node.properties ??= {};
	delete node.properties.class;
	node.properties.className = [...new Set(classes)];
};

const hasClass = (node, className) => classList(node).includes(className);

const getStringProperty = (node, names) => {
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

const LANGUAGE_LABELS = {
	bash: "Bash",
	c: "C",
	"c++": "C++",
	cpp: "C++",
	cs: "C#",
	csharp: "C#",
	css: "CSS",
	dockerfile: "Dockerfile",
	html: "HTML",
	javascript: "JS",
	js: "JS",
	json: "JSON",
	jsx: "JSX",
	markdown: "MD",
	md: "MD",
	plaintext: "Text",
	powershell: "PowerShell",
	ps1: "PowerShell",
	py: "Python",
	python: "Python",
	sh: "Shell",
	shell: "Shell",
	ts: "TS",
	tsx: "TSX",
	typescript: "TS",
	xml: "XML",
	yaml: "YAML",
	yml: "YAML",
	zsh: "Zsh"
};

const normalizeLanguageLabel = language => {
	const normalized = language.trim();
	if (!normalized) return "Text";
	return LANGUAGE_LABELS[normalized.toLowerCase()] ?? normalized;
};

const getLanguageLabel = (pre, code) => {
	const dataLanguage = getStringProperty(pre, ["dataLanguage", "data-language"]) || getStringProperty(code, ["dataLanguage", "data-language"]);
	const languageClass = [...classList(code), ...classList(pre)].find(className => className.startsWith("language-"));
	return normalizeLanguageLabel(dataLanguage || languageClass?.replace(/^language-/, "") || "");
};

const textContent = node => {
	if (!node) return "";
	if (node.type === "text") return node.value ?? "";
	return (node.children ?? []).map(textContent).join("");
};

const createLineNode = value => ({
	type: "element",
	tagName: "span",
	properties: { className: ["line"] },
	children: value ? [{ type: "text", value }] : []
});

const ensureLineNodes = code => {
	const children = code.children ?? [];
	if (children.some(child => isElement(child, "span") && hasClass(child, "line"))) {
		code.children = children.filter(child => child.type !== "text" || child.value.trim());
		return;
	}

	const rawCode = textContent(code);
	const normalizedCode = rawCode.endsWith("\n") ? rawCode.slice(0, -1) : rawCode;
	const lines = normalizedCode.split("\n");
	code.children = lines.map(createLineNode);
};

const createLanguageLabel = language => ({
	type: "element",
	tagName: "span",
	properties: { className: ["code-block-language"] },
	children: [{ type: "text", value: language }]
});

const createCopyButton = () => ({
	type: "element",
	tagName: "button",
	properties: {
		type: "button",
		className: ["code-copy-button"],
		dataCodeCopyButton: "",
		ariaLabel: "複製程式碼"
	},
	children: [{ type: "text", value: "複製" }]
});

export function rehypeCodeBlocks() {
	return tree => {
		visit(tree, "element", (node, index, parent) => {
			if (!isElement(node, "pre") || !parent || index == null) return;
			if (hasClass(parent, "code-block")) return;

			const code = node.children?.find(child => isElement(child, "code"));
			if (!code) return;

			const language = getLanguageLabel(node, code);
			ensureLineNodes(code);
			setClassList(node, [...classList(node), "code-block-pre"]);

			parent.children[index] = {
				type: "element",
				tagName: "div",
				properties: { className: ["code-block"], dataCodeBlock: "" },
				children: [
					{
						type: "element",
						tagName: "div",
						properties: { className: ["code-block-toolbar"] },
						children: [createLanguageLabel(language), createCopyButton()]
					},
					node
				]
			};
		});
	};
}
