#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(rootDir, "apps/blog/src/content");
const collections = ["post", "course"];

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

function stripFrontmatter(content) {
	return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

function toVisibleText(markdown) {
	let text = stripFrontmatter(markdown);

	text = text.replace(/```[\s\S]*?```/g, " ");
	text = text.replace(/~~~[\s\S]*?~~~/g, " ");
	text = text.replace(/`[^`]*`/g, " ");
	text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
	text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
	text = text.replace(/<[^>]+>/g, " ");
	text = text.replace(/^\s{0,3}#{1,6}\s*/gm, "");
	text = text.replace(/^\s{0,3}>\s?/gm, "");
	text = text.replace(/^\s*[-*+]\s+/gm, "");
	text = text.replace(/^\s*\d+\.\s+/gm, "");
	text = text.replace(/[*_~>#|\[\](){}]/g, " ");
	text = text.replace(/https?:\/\/\S+/g, " ");

	return text;
}

function countText(text) {
	const visibleChars = Array.from(text.replace(/\s+/g, "")).length;
	const visibleCharsNoPunctuation = Array.from(text.replace(/[\s\p{P}\p{S}]/gu, "")).length;
	const cjkChars = (text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu) ?? []).length;
	const latinWords = (text.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g) ?? []).length;

	return { visibleChars, visibleCharsNoPunctuation, cjkChars, latinWords };
}

function addCounts(total, counts) {
	total.files += counts.files;
	total.visibleChars += counts.visibleChars;
	total.visibleCharsNoPunctuation += counts.visibleCharsNoPunctuation;
	total.cjkChars += counts.cjkChars;
	total.latinWords += counts.latinWords;
}

function formatNumber(number) {
	return new Intl.NumberFormat("en-US").format(number);
}

function printRow(label, counts) {
	console.log(
		[
			label.padEnd(8),
			String(counts.files).padStart(4),
			formatNumber(counts.visibleChars).padStart(12),
			formatNumber(counts.visibleCharsNoPunctuation).padStart(12),
			formatNumber(counts.cjkChars).padStart(10),
			formatNumber(counts.latinWords).padStart(10)
		].join("  ")
	);
}

const summary = new Map();

for (const collection of collections) {
	const contentDir = path.join(contentRoot, collection);
	const files = await listContentFiles(contentDir);
	const counts = { files: files.length, visibleChars: 0, visibleCharsNoPunctuation: 0, cjkChars: 0, latinWords: 0 };

	for (const filePath of files) {
		const markdown = await readFile(filePath, "utf8");
		addCounts(counts, { files: 0, ...countText(toVisibleText(markdown)) });
	}

	summary.set(collection, counts);
}

const total = { files: 0, visibleChars: 0, visibleCharsNoPunctuation: 0, cjkChars: 0, latinWords: 0 };
for (const counts of summary.values()) addCounts(total, counts);

console.log("Scope     Files  Visible chars  No punct.   CJK chars  Latin words");
console.log("--------------------------------------------------------------------");
for (const [collection, counts] of summary) printRow(collection, counts);
printRow("all", total);
