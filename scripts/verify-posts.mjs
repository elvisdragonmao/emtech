#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDirs = [path.join(rootDir, "apps/blog/src/content/post"), path.join(rootDir, "apps/blog/src/content/course")];

async function listContentFiles(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async entry => {
			const fullPath = path.join(dir, entry.name);

			if (entry.isDirectory()) return listContentFiles(fullPath);
			if (entry.isFile() && entry.name === "index.md") return [fullPath];

			return [];
		})
	);

	return files.flat();
}

function parseFrontmatter(lines) {
	if (lines[0] !== "---") return { data: new Map(), bodyStartLine: 1 };

	const data = new Map();
	let endLine = 0;

	for (let index = 1; index < lines.length; index += 1) {
		const line = lines[index];

		if (line === "---") {
			endLine = index + 1;
			break;
		}

		const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
		if (match) data.set(match[1], match[2].trim());
	}

	return { data, bodyStartLine: endLine || 1 };
}

function isDraft(data) {
	return data.get("draft") === "true";
}

function removeInlineCode(line) {
	return line.replace(/`[^`]*`/g, "");
}

function checkPost(filePath, content) {
	const lines = content.split(/\r?\n/);
	const { data, bodyStartLine } = parseFrontmatter(lines);
	const errors = [];

	if (isDraft(data)) return errors;

	let hasTitle = false;
	let inFence = false;
	let inHtmlComment = false;

	for (let index = bodyStartLine; index < lines.length; index += 1) {
		let line = lines[index];
		const lineNumber = index + 1;

		if (/^\s*(```|~~~)/.test(line)) {
			inFence = !inFence;
			continue;
		}

		if (inFence) continue;

		if (inHtmlComment) {
			const endIndex = line.indexOf("-->");
			if (endIndex === -1) continue;

			line = line.slice(endIndex + 3);
			inHtmlComment = false;
		}

		while (line.includes("<!--")) {
			const startIndex = line.indexOf("<!--");
			const endIndex = line.indexOf("-->", startIndex + 4);

			if (endIndex === -1) {
				line = line.slice(0, startIndex);
				inHtmlComment = true;
				break;
			}

			line = `${line.slice(0, startIndex)}${line.slice(endIndex + 3)}`;
		}

		const titleMatch = line.match(/^#\s+(.+)$/);
		if (titleMatch?.[1]?.trim()) hasTitle = true;

		const contentLine = removeInlineCode(line);

		for (const match of contentLine.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
			if (!match[1].trim()) errors.push(`${lineNumber}: markdown image is missing alt text`);
		}

		for (const match of contentLine.matchAll(/<img\b[^>]*>/gi)) {
			const tag = match[0];
			const altMatch = tag.match(/\balt\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);

			if (!altMatch || !(altMatch[2] ?? altMatch[3] ?? altMatch[4] ?? "").trim()) {
				errors.push(`${lineNumber}: HTML image is missing alt text`);
			}
		}
	}

	if (!hasTitle) errors.unshift("missing top-level title heading");

	return errors;
}

const contentFiles = (await Promise.all(contentDirs.map(listContentFiles))).flat();
const failures = [];

for (const filePath of contentFiles) {
	const content = await readFile(filePath, "utf8");
	const errors = checkPost(filePath, content);

	if (errors.length > 0) {
		failures.push({ filePath, errors });
	}
}

if (failures.length > 0) {
	console.error("Post verification failed:\n");

	for (const { filePath, errors } of failures) {
		console.error(path.relative(rootDir, filePath));
		for (const error of errors) console.error(`  - ${error}`);
	}

	process.exit(1);
}

console.log(`Verified ${contentFiles.length} posts and course lessons.`);
