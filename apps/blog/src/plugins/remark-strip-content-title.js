export function remarkStripContentTitle() {
	return tree => {
		const children = tree.children ?? [];
		const firstContentIndex = children.findIndex(node => node.type !== "html" || node.value.trim());
		if (firstContentIndex === -1) return;

		const firstContent = children[firstContentIndex];
		if (firstContent.type === "heading" && firstContent.depth === 1) {
			children.splice(firstContentIndex, 1);
		}
	};
}
