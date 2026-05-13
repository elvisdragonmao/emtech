import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const post = defineCollection({
	loader: glob({
		pattern: "*/index.md",
		base: "./src/content/post",
		generateId: ({ entry }) => entry.replace("/index.md", "")
	}),
	schema: z.object({
		authors: z.string().or(z.array(z.string())).optional(),
		tags: z.array(z.string()).default([]),
		categories: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
		date: z.coerce.date(),
		lastmod: z.coerce.date().optional(),
		description: z
			.string()
			.nullish()
			.transform(v => v ?? undefined),
		thumbnail: z.string().optional() // legacy absolute path for older posts
	})
});

// One JSON per course directory — stores course-level metadata
const course = defineCollection({
	loader: glob({
		pattern: "*/course.json",
		base: "./src/content/course",
		generateId: ({ entry }) => entry.replace("/course.json", "")
	}),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		displayOrder: z.number().default(Number.MAX_SAFE_INTEGER),
		accent: z.enum(["blue", "purple", "yellow"]).default("blue"),
		/** Ordered list of lesson folder names */
		order: z.array(z.string()),
		/** Path to thumbnail relative to this course dir, e.g. "js/thumbnail.webp" */
		thumbnail: z.string(),
		meta: z.string().optional(), // e.g. "零基礎 / 24 H / 課程"
		outcomes: z
			.array(
				z.object({
					title: z.string(),
					text: z.string()
				})
			)
			.optional()
	})
});

// Every lesson inside any course — ID is "courseId/lessonId"
const lesson = defineCollection({
	loader: glob({
		pattern: "*/*/index.md",
		base: "./src/content/course",
		generateId: ({ entry }) => entry.replace("/index.md", "")
	}),
	schema: z.object({
		authors: z.string().or(z.array(z.string())).optional(),
		tags: z.array(z.string()).default([]),
		categories: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
		date: z.coerce.date(),
		lastmod: z.coerce.date().optional(),
		description: z
			.string()
			.nullish()
			.transform(v => v ?? undefined),
		thumbnail: z.string().optional()
	})
});

export const collections = { post, course, lesson };
