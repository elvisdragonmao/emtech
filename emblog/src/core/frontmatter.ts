import { ValidationError } from "./errors.js";
import type { FrontMatterResult, FrontMatterValue } from "./types.js";

const stripQuotes = (value: string) => value.replace(/^['"]|['"]$/g, "");

const parseArrayValue = (rawValue: string, filePath: string, key: string): string[] => {
	const raw = rawValue.trim();
	if (!raw.startsWith("[") || !raw.endsWith("]")) {
		throw new ValidationError("Invalid front matter array", `${filePath}: ${key}`);
	}

	const values: string[] = [];
	let current = "";
	let quote: '"' | "'" | null = null;

	for (let index = 1; index < raw.length - 1; index += 1) {
		const character = raw[index];

		if (quote) {
			if (character === quote) {
				quote = null;
			} else {
				current += character;
			}
			continue;
		}

		if (character === '"' || character === "'") {
			quote = character;
			continue;
		}

		if (character === "," || character === "，") {
			const value = current.trim();
			if (value) values.push(stripQuotes(value));
			current = "";
			continue;
		}

		current += character;
	}

	if (quote) {
		throw new ValidationError("Unclosed quote in front matter array", `${filePath}: ${key}`);
	}

	const finalValue = current.trim();
	if (finalValue) values.push(stripQuotes(finalValue));
	return values;
};

const parseDateValue = (rawValue: string, filePath: string) => {
	const trimmed = stripQuotes(rawValue.trim());
	const timestamp = new Date(trimmed).getTime();
	if (!Number.isFinite(timestamp)) {
		throw new ValidationError("Invalid post date", filePath);
	}
	return timestamp;
};

const parseValue = (key: string, rawValue: string, filePath: string): FrontMatterValue => {
	const trimmed = rawValue.trim();
	if (trimmed.startsWith("[")) {
		return parseArrayValue(trimmed, filePath, key);
	}

	if (key === "date") {
		return parseDateValue(trimmed, filePath);
	}

	return stripQuotes(trimmed);
};

export const parseFrontMatter = (content: string, filePath: string): FrontMatterResult => {
	const normalized = content.replace(/\r\n/g, "\n");
	if (!normalized.startsWith("---\n")) {
		return {
			attributes: {},
			body: normalized
		};
	}

	const lines = normalized.split("\n");
	let closingIndex = -1;
	for (let index = 1; index < lines.length; index += 1) {
		if (lines[index].trim() === "---") {
			closingIndex = index;
			break;
		}
	}

	if (closingIndex === -1) {
		throw new ValidationError("Unclosed front matter block", filePath);
	}

	const attributes: Record<string, FrontMatterValue> = {};
	let currentKey: string | null = null;
	let currentValue = "";

	const flushCurrent = () => {
		if (!currentKey) return;
		attributes[currentKey] = parseValue(currentKey, currentValue, filePath);
		currentKey = null;
		currentValue = "";
	};

	for (const line of lines.slice(1, closingIndex)) {
		if (!line.trim() && !currentKey) continue;
		if (line.trimStart().startsWith("#") && !currentKey) continue;

		const keyMatch = line.match(/^([A-Za-z][A-Za-z0-9_-]*):(.*)$/);
		if (keyMatch && !line.startsWith(" ") && !line.startsWith("\t")) {
			flushCurrent();
			currentKey = keyMatch[1].trim();
			currentValue = keyMatch[2].trimStart();
			continue;
		}

		if (!currentKey) {
			throw new ValidationError("Invalid front matter line", `${filePath}: ${line}`);
		}

		currentValue = currentValue ? `${currentValue}\n${line.trim()}` : line.trim();
	}

	flushCurrent();

	return {
		attributes,
		body: lines.slice(closingIndex + 1).join("\n")
	};
};
