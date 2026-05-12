/**
 * Shared content utilities used across pages.
 */

import type { ImageMetadata } from "astro";

export type MetaItem = {
	label: string;
	value: string;
};

export type TocHeading = {
	depth: number;
	slug: string;
	text: string;
};

/** Estimate reading time (Chinese ~300 chars/min, English ~200 wpm). */
export function readingTime(text: string): string {
	const chars = text.replace(/\s+/g, "").length;
	const mins = Math.max(1, Math.round(chars / 300));
	return `${mins} min`;
}

/** Word/character count label. */
export function wordCount(text: string): string {
	const count = text.replace(/\s+/g, "").length;
	if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
	return `${count}`;
}

/** Format a Date to "YYYY.MM.DD". */
export function formatDate(date: Date): string {
	return date.toISOString().slice(0, 10).replace(/-/g, ".");
}

/** Extract the first H1 heading from raw markdown body. */
export function extractTitle(body: string | undefined): string {
	if (!body) return "";
	const match = body.match(/^#\s+(.+)$/m);
	return match ? match[1].trim() : "";
}

export function extractExcerpt(body: string | undefined): string {
	if (!body) return "";
	const paragraphs = body
		.split(/\n{2,}/)
		.map(part => part.trim())
		.filter(part => part && !part.startsWith("#") && !part.startsWith("!") && !part.startsWith("```") && !part.startsWith("<"));

	return paragraphs[0]?.replace(/\s+/g, " ") ?? "";
}

export function normalizeTerms(terms: string[] | undefined): string[] {
	return (terms ?? []).flatMap(term =>
		term
			.split(/[，,]/)
			.map(part => part.trim())
			.filter(Boolean)
	);
}

export function formatHashTags(terms: string[] | undefined): string {
	return normalizeTerms(terms)
		.map(term => `#${term.replace(/^#+/, "")}`)
		.join(" ");
}

export type { ImageMetadata };
