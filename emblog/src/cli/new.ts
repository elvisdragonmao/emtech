import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";

import { POSTS_DIR, resolveWithin } from "../core/paths.js";

const getPostId = async () => {
	return new Promise<string>(resolve => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.question("Enter post ID: ", entered => {
			rl.close();
			resolve(entered.trim());
		});
	});
};

const assertValidPostId = (value: string) => {
	if (!/^[A-Za-z0-9_-]+$/.test(value)) {
		throw new Error("Post ID may only contain letters, numbers, underscores, and dashes.");
	}
};

const main = async () => {
	let id = process.argv[2];
	if (!id) {
		id = await getPostId();
	}

	if (!id) {
		throw new Error("Post ID is required.");
	}

	assertValidPostId(id);

	const postDir = resolveWithin(POSTS_DIR, id);
	const postFile = path.join(postDir, "index.md");
	const content = `---
title: 
authors: elvismao
tags: []
categories: []
date: ${new Date().toISOString().split("T")[0]}
description: 
draft: true
---

# 
`;

	await fs.mkdir(postDir, { recursive: true });
	await fs.writeFile(postFile, content, "utf8");
	console.log(`Post created: ${postFile}`);
};

main().catch(error => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
});
