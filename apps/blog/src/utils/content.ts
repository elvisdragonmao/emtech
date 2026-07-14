/**
 * Shared content utilities used across pages.
 */

import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";

export type ImageInput = string | ImageMetadata | null;

type ThumbnailEntry = {
	id: string;
	data: {
		thumbnail?: string;
	};
};

type ThumbnailMap = Record<string, { default: ImageMetadata }>;

type PostEntry = CollectionEntry<"post">;
type CourseEntry = CollectionEntry<"course">;
type LessonEntry = CollectionEntry<"lesson">;

export type MetaItem = {
	label: string;
	value: string;
	href?: string;
	links?: {
		label: string;
		href: string;
	}[];
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

export function uniqueTerms(terms: string[] | undefined): string[] {
	return [...new Set(normalizeTerms(terms))];
}

export function formatHashTags(terms: string[] | undefined): string {
	return normalizeTerms(terms)
		.map(term => `#${term.replace(/^#+/, "")}`)
		.join(" ");
}

export function normalizeImportPath(path: string): string {
	const parts: string[] = [];

	for (const part of path.split("/")) {
		if (!part || part === ".") continue;
		if (part === "..") parts.pop();
		else parts.push(part);
	}

	return `/${parts.join("/")}`;
}

function resolveContentThumbnail(thumbnail: string | undefined, basePath: string, fallbackPath: string, thumbnails: ThumbnailMap): ImageInput {
	const value = thumbnail?.trim();

	if (value) {
		if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value;
		if (!/^thumbnail\.[a-z0-9]+$/i.test(value.split("/").at(-1) ?? "")) return null;

		const thumbKey = normalizeImportPath(`${basePath}/${value}`);
		const image = thumbnails[thumbKey]?.default;
		if (image) return image;
	}

	return thumbnails[normalizeImportPath(fallbackPath)]?.default ?? null;
}

export function resolvePostThumbnail(entry: ThumbnailEntry, thumbnails: ThumbnailMap): ImageInput {
	return resolveContentThumbnail(entry.data.thumbnail, `/src/content/post/${entry.id}`, `/src/content/post/${entry.id}/thumbnail.webp`, thumbnails);
}

export function resolveCourseThumbnail(entry: ThumbnailEntry, thumbnails: ThumbnailMap): ImageInput {
	return resolveContentThumbnail(entry.data.thumbnail, `/src/content/course/${entry.id}`, `/src/content/course/${entry.id}/thumbnail.webp`, thumbnails);
}

export function resolveLessonThumbnail(entry: ThumbnailEntry, thumbnails: ThumbnailMap): ImageInput {
	const thumbnail = entry.data.thumbnail?.trim();
	return resolveContentThumbnail(thumbnail, `/src/content/course/${entry.id}`, `/src/content/course/${entry.id}/thumbnail.webp`, thumbnails);
}

export type ListedContentKind = "post" | "lesson";

export type ListedContentItem = {
	kind: ListedContentKind;
	id: string;
	entryId: string;
	title: string;
	href: string;
	image: ImageInput;
	tag: string;
	tags: string[];
	categories: string[];
	description: string;
	body: string | undefined;
	date: Date;
	modified: Date;
	courseId?: string;
	lessonId?: string;
	courseTitle?: string;
};

function visibleTag(tags: string[], categories: string[]): string {
	return formatHashTags(tags.length > 0 ? tags : categories);
}

export function toPostListItem(post: PostEntry, thumbnails: ThumbnailMap): ListedContentItem {
	const tags = uniqueTerms(post.data.tags);
	const categories = uniqueTerms(post.data.categories);

	return {
		kind: "post",
		id: `post:${post.id}`,
		entryId: post.id,
		title: extractTitle(post.body) || post.id,
		href: `/p/${post.id}/`,
		image: resolvePostThumbnail(post, thumbnails),
		tag: visibleTag(tags, categories),
		tags,
		categories,
		description: post.data.description ?? extractExcerpt(post.body),
		body: post.body,
		date: post.data.date,
		modified: post.data.lastmod ?? post.data.date
	};
}

export function toLessonListItem(lesson: LessonEntry, thumbnails: ThumbnailMap, courseTitle?: string): ListedContentItem | null {
	const [courseId, lessonId] = lesson.id.split("/");
	if (!courseId || !lessonId) return null;

	const tags = uniqueTerms(lesson.data.tags);
	const categories = uniqueTerms(["課程", ...lesson.data.categories]);
	const title = extractTitle(lesson.body) || lesson.data.description || lessonId;

	return {
		kind: "lesson",
		id: `lesson:${lesson.id}`,
		entryId: lesson.id,
		title,
		href: `/course/${courseId}/${lessonId}/`,
		image: resolveLessonThumbnail(lesson, thumbnails),
		tag: visibleTag(tags, categories),
		tags,
		categories,
		description: lesson.data.description ?? extractExcerpt(lesson.body),
		body: lesson.body,
		date: lesson.data.date,
		modified: lesson.data.lastmod ?? lesson.data.date,
		courseId,
		lessonId,
		courseTitle
	};
}

export function toListedContentItems(posts: PostEntry[], lessons: LessonEntry[], courses: CourseEntry[], postThumbnails: ThumbnailMap, lessonThumbnails: ThumbnailMap): ListedContentItem[] {
	const courseTitles = new Map(courses.map(course => [course.id, course.data.title]));

	return [
		...posts.map(post => toPostListItem(post, postThumbnails)),
		...lessons.flatMap(lesson => {
			const [courseId] = lesson.id.split("/");
			const item = toLessonListItem(lesson, lessonThumbnails, courseTitles.get(courseId));
			return item ? [item] : [];
		})
	];
}

export function sortListedContentByDateDesc(items: ListedContentItem[]): ListedContentItem[] {
	return [...items].sort((a, b) => b.date.getTime() - a.date.getTime());
}

export type { ImageMetadata };
