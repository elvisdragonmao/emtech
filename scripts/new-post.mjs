#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const postId = process.argv[2];

function printUsage() {
	console.error("Usage: pnpm new <postID>");
}

function formatLocalDate(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

if (!postId) {
	printUsage();
	process.exit(1);
}

if (postId !== postId.trim() || postId === "." || postId === ".." || postId.includes("/") || postId.includes("\\")) {
	console.error("postID must be a single folder name, e.g. pnpm new my-post");
	process.exit(1);
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const postDir = path.join(rootDir, "apps/blog/src/content/post", postId);
const indexPath = path.join(postDir, "index.md");
const content = `---
authors: elvismao
tags: []
categories: []
date: ${formatLocalDate(new Date())}
description:
draft: true
---

# ${postId}
`;

try {
	await mkdir(postDir);
	await writeFile(indexPath, content, { flag: "wx" });
	console.log(`Created ${path.relative(rootDir, indexPath)}`);
} catch (error) {
	if (error?.code === "EEXIST") {
		console.error(`Post already exists: ${postId}`);
		process.exit(1);
	}

	throw error;
}
