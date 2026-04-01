import { spawn } from "node:child_process";
import { watch } from "node:fs";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";

import { DIST_DIR, PROJECT_ROOT, resolveWithin } from "../core/paths.js";

const port = 3000;
const passthroughRoutes = ["/category", "/tag", "/search"];

const getContentType = (filePath: string) => {
	const extname = path.extname(filePath).toLowerCase();
	const mimeTypes: Record<string, string> = {
		".html": "text/html; charset=utf-8",
		".js": "application/javascript; charset=utf-8",
		".css": "text/css; charset=utf-8",
		".json": "application/json; charset=utf-8",
		".png": "image/png",
		".jpg": "image/jpeg",
		".jpeg": "image/jpeg",
		".gif": "image/gif",
		".svg": "image/svg+xml",
		".xml": "application/xml; charset=utf-8",
		".xsl": "application/xml; charset=utf-8",
		".webp": "image/webp"
	};
	return mimeTypes[extname] || "application/octet-stream";
};

const resolveRequestPath = (requestUrl: string) => {
	const url = new URL(requestUrl, `http://localhost:${port}`);
	const decodedPath = decodeURIComponent(url.pathname);

	if (passthroughRoutes.some(route => decodedPath === route || decodedPath.startsWith(`${route}/`))) {
		return resolveWithin(DIST_DIR, "index.html");
	}

	const trimmedPath = decodedPath === "/" ? "index.html" : decodedPath.replace(/^\//, "");
	const withIndex = decodedPath.endsWith("/") || !path.extname(trimmedPath) ? path.join(trimmedPath, "index.html") : trimmedPath;
	return resolveWithin(DIST_DIR, withIndex);
};

const serveFile = async (filePath: string, response: http.ServerResponse) => {
	try {
		const data = await fs.readFile(filePath);
		response.writeHead(200, { "Content-Type": getContentType(filePath) });
		response.end(data);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			const fallback = resolveWithin(DIST_DIR, "404.html");
			const data = await fs.readFile(fallback);
			response.writeHead(404, { "Content-Type": getContentType(fallback) });
			response.end(data);
			return;
		}

		response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
		response.end("500 Internal Server Error");
	}
};

const server = http.createServer(async (request, response) => {
	try {
		const filePath = resolveRequestPath(request.url ?? "/");
		await serveFile(filePath, response);
	} catch {
		response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
		response.end("400 Bad Request");
	}
});

let isBuilding = false;
let shouldBuildAgain = false;
let debounceTimer: NodeJS.Timeout | null = null;

const runBuild = () => {
	if (isBuilding) {
		shouldBuildAgain = true;
		return;
	}

	isBuilding = true;
	const child = spawn("pnpm", ["build"], {
		cwd: PROJECT_ROOT,
		stdio: "inherit",
		shell: process.platform === "win32"
	});

	child.on("exit", code => {
		isBuilding = false;
		if (code !== 0) {
			console.error(`Build failed with exit code ${code ?? 1}`);
		}
		if (shouldBuildAgain) {
			shouldBuildAgain = false;
			runBuild();
		}
	});
};

const ignoredSegments = ["dist", ".git", "node_modules", ".DS_Store"];

watch(PROJECT_ROOT, { recursive: true }, (_eventType: string, filename: string | null) => {
	if (!filename) return;
	if (ignoredSegments.some(segment => filename.includes(segment))) return;

	if (debounceTimer) clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => {
		console.log(`File changed: ${filename}. Running build...`);
		runBuild();
	}, 100);
});

server.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
	runBuild();
});
