import path from "node:path";
import { fileURLToPath } from "node:url";

import { PathSafetyError } from "./errors.js";

const EMBLOG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const PROJECT_ROOT = path.resolve(EMBLOG_ROOT, "..");
export const DIST_DIR = path.join(PROJECT_ROOT, "dist");
export const POSTS_DIR = path.join(PROJECT_ROOT, "post");
export const VIEW_DIR = path.join(PROJECT_ROOT, "view");
export const PARTIALS_DIR = path.join(VIEW_DIR, "partials");
export const PAGES_DIR = path.join(VIEW_DIR, "pages");
export const STATIC_DIR = path.join(PROJECT_ROOT, "static");
export const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");
export const CONFIG_FILE = path.join(PROJECT_ROOT, "config.json");

export const resolveWithin = (baseDir: string, ...segments: string[]) => {
	const resolved = path.resolve(baseDir, ...segments);
	const relative = path.relative(baseDir, resolved);

	if (relative.startsWith("..") || path.isAbsolute(relative)) {
		throw new PathSafetyError("Resolved path escapes base directory", `${baseDir} -> ${resolved}`);
	}

	return resolved;
};

export const toPosixPath = (value: string) => value.split(path.sep).join(path.posix.sep);

export const normalizeAssetPath = (value: string) => {
	const normalized = path.posix.normalize(value.replaceAll("\\", "/"));
	if (normalized === "." || normalized.startsWith("../") || normalized.includes("/../") || normalized.startsWith("/")) {
		throw new PathSafetyError("Asset path escapes post directory", value);
	}
	return normalized;
};

export const sitePathToDistPath = (sitePath: string) => {
	const normalized = sitePath.startsWith("/") ? sitePath.slice(1) : sitePath;
	return resolveWithin(DIST_DIR, normalized);
};

export const buildPostAssetUrl = (postId: string, assetPath: string) => {
	const normalized = normalizeAssetPath(assetPath);
	const parts = normalized.split("/").map(encodeURIComponent);
	return `/static/${encodeURIComponent(postId)}/${parts.join("/")}`;
};

export const buildPostAssetUrlFromReference = (postId: string, assetPath: string) => {
	const normalizedReference = assetPath.replaceAll("\\", "/").trim();
	if (!normalizedReference) {
		return "";
	}

	const resolved = path.posix.normalize(path.posix.join(postId, normalizedReference));
	if (resolved.startsWith("../") || resolved === ".." || resolved.startsWith("/")) {
		throw new PathSafetyError("Post asset path escapes posts directory", `${postId}: ${assetPath}`);
	}

	const parts = resolved.split("/").map(encodeURIComponent);
	return `/static/${parts.join("/")}`;
};
