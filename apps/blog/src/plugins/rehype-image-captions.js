import { visit } from "unist-util-visit";

const isWhitespaceText = node => node.type === "text" && !node.value.trim();
const isImage = node => node.type === "element" && node.tagName === "img";
const isLinkedImage = node => {
	if (node.type !== "element" || node.tagName !== "a") return false;
	const children = node.children?.filter(child => !isWhitespaceText(child)) ?? [];
	return children.length === 1 && isImage(children[0]);
};

const getImageAlt = node => {
	const image = isImage(node) ? node : node.children?.find(isImage);
	const alt = image?.properties?.alt;
	return typeof alt === "string" ? alt.trim() : "";
};

export function rehypeImageCaptions() {
	return tree => {
		visit(tree, "element", node => {
			if (!isImage(node)) return;
			node.properties ??= {};
			if (node.properties.alt == null) node.properties.alt = "";
			node.properties.loading ??= "lazy";
		});

		visit(tree, "element", (node, index, parent) => {
			if (node.tagName !== "p" || !parent || index == null) return;

			const children = node.children?.filter(child => !isWhitespaceText(child)) ?? [];
			const content = children[0];
			if (children.length !== 1 || (!isImage(content) && !isLinkedImage(content))) return;

			const caption = getImageAlt(content);
			if (!caption) return;

			parent.children[index] = {
				type: "element",
				tagName: "figure",
				properties: {},
				children: [
					content,
					{
						type: "element",
						tagName: "figcaption",
						properties: {},
						children: [{ type: "text", value: caption }]
					}
				]
			};
		});
	};
}
