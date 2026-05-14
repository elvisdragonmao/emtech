#!/usr/bin/env node

import { execFile } from "node:child_process";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const maxSizeBytes = 400 * 1024;
const ignoredFiles = new Set(["apps/blog/public/img/dragon.webp"]);

function formatBytes(bytes) {
	return `${(bytes / 1024).toFixed(1)} KB`;
}

const { stdout } = await execFileAsync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
	cwd: rootDir,
	encoding: "buffer"
});

const filePaths = stdout.toString("utf8").split("\0").filter(Boolean);
const failures = [];

for (const filePath of filePaths) {
	if (ignoredFiles.has(filePath)) continue;

	let size;
	try {
		({ size } = await stat(path.join(rootDir, filePath)));
	} catch (error) {
		if (error.code === "ENOENT") continue;
		throw error;
	}

	if (size > maxSizeBytes) failures.push({ filePath, size });
}

if (failures.length > 0) {
	console.error(`File size verification failed. Max size is ${formatBytes(maxSizeBytes)}.\n`);

	for (const { filePath, size } of failures) {
		console.error(`- ${filePath}: ${formatBytes(size)}`);
	}

	process.exit(1);
}

console.log(`Verified ${filePaths.length} files are at most ${formatBytes(maxSizeBytes)}.`);
