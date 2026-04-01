import fs from "node:fs/promises";
import path from "node:path";

import { BuildError } from "./errors.js";

const partialPattern = /{{([A-Za-z0-9_-]+)}}/g;

export const loadPartials = async (partialsDir: string) => {
	const entries = await fs.readdir(partialsDir, { withFileTypes: true });
	const partials = new Map<string, string>();

	for (const entry of entries) {
		if (!entry.isFile() || path.extname(entry.name) !== ".html") continue;
		const partialName = path.basename(entry.name, ".html");
		const content = await fs.readFile(path.join(partialsDir, entry.name), "utf8");
		partials.set(partialName, content);
	}

	const resolved = new Map<string, string>();

	const resolvePartial = (name: string, stack: string[]): string => {
		if (resolved.has(name)) {
			return resolved.get(name) as string;
		}

		if (stack.includes(name)) {
			throw new BuildError("Circular partial reference detected", [...stack, name].join(" -> "));
		}

		const template = partials.get(name);
		if (template === undefined) {
			throw new BuildError("Missing partial", name);
		}

		const rendered = template.replace(partialPattern, (match, partialName: string) => {
			if (!partials.has(partialName)) return match;
			return resolvePartial(partialName, [...stack, name]);
		});

		resolved.set(name, rendered);
		return rendered;
	};

	for (const name of partials.keys()) {
		resolvePartial(name, []);
	}

	return resolved;
};

export const renderPartials = (content: string, partials: Map<string, string>) => {
	return content.replace(partialPattern, (match, name: string) => partials.get(name) ?? match);
};

export const replacePlaceholders = (template: string, replacements: Record<string, string | number | undefined>) => {
	return Object.entries(replacements).reduce((output, [key, value]) => output.replaceAll(`{{${key}}}`, value === undefined ? "" : String(value)), template);
};
