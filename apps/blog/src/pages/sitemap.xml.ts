import { extractTitle, resolveCourseThumbnail, resolveLessonThumbnail, resolvePostThumbnail } from "@/utils/content";
import { absoluteUrl, toSeoImage } from "@/utils/seo";
import type { ImageMetadata } from "astro";
import { getCollection } from "astro:content";

type SitemapEntry = {
	loc: string;
	lastmod?: Date;
	changefreq?: "daily" | "weekly" | "monthly" | "yearly";
	priority?: number;
	image?: {
		loc: string;
		title?: string;
	};
};

const escapeXml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");

const formatDate = (date?: Date) => {
	if (!date || Number.isNaN(date.getTime()) || date.getFullYear() <= 1970) return undefined;
	return date.toISOString().slice(0, 10);
};

const renderUrl = (entry: SitemapEntry) => {
	const image = entry.image
		? `
		<image:image>
			<image:loc>${escapeXml(entry.image.loc)}</image:loc>
			${entry.image.title ? `<image:title>${escapeXml(entry.image.title)}</image:title>` : ""}
		</image:image>`
		: "";

	return `
	<url>
		<loc>${escapeXml(entry.loc)}</loc>
		${formatDate(entry.lastmod) ? `<lastmod>${formatDate(entry.lastmod)}</lastmod>` : ""}
		${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ""}
		${entry.priority ? `<priority>${entry.priority.toFixed(1)}</priority>` : ""}
		${image}
	</url>`;
};

export async function GET() {
	const posts = (await getCollection("post")).filter(post => !post.data.draft);
	const courses = await getCollection("course");
	const lessons = (await getCollection("lesson")).filter(lesson => !lesson.data.draft);
	const postThumbs = import.meta.glob<{ default: ImageMetadata }>("/src/content/post/**/*.{avif,gif,jpeg,jpg,png,webp}", { eager: true });
	const courseThumbs = import.meta.glob<{ default: ImageMetadata }>("/src/content/course/**/*.{avif,gif,jpeg,jpg,png,webp}", { eager: true });
	const latestPostDate = posts.reduce((acc, post) => Math.max(acc, (post.data.lastmod ?? post.data.date).getTime()), 0);
	const latestLessonDate = lessons.reduce((acc, lesson) => Math.max(acc, (lesson.data.lastmod ?? lesson.data.date).getTime()), 0);

	const entries: SitemapEntry[] = [
		{ loc: absoluteUrl("/"), lastmod: new Date(Math.max(latestPostDate, latestLessonDate)), changefreq: "weekly", priority: 1 },
		{ loc: absoluteUrl("/archive/"), lastmod: new Date(latestPostDate), changefreq: "weekly", priority: 0.8 },
		{ loc: absoluteUrl("/course/"), lastmod: new Date(latestLessonDate), changefreq: "weekly", priority: 0.8 },
		{ loc: absoluteUrl("/friends/"), changefreq: "monthly", priority: 0.5 }
	];

	for (const post of posts) {
		const title = extractTitle(post.body) || post.id;
		const image = resolvePostThumbnail(post, postThumbs);
		entries.push({
			loc: absoluteUrl(`/p/${post.id}/`),
			lastmod: post.data.lastmod ?? post.data.date,
			changefreq: "monthly",
			priority: 0.7,
			image: image ? { loc: toSeoImage(image, title).src, title } : undefined
		});
	}

	for (const course of courses) {
		const courseLessons = lessons.filter(lesson => lesson.id.startsWith(`${course.id}/`));
		const latestCourseDate = courseLessons.reduce((acc, lesson) => {
			const date = lesson.data.lastmod ?? lesson.data.date;
			return date > acc ? date : acc;
		}, new Date(0));
		const image = resolveCourseThumbnail(course, courseThumbs);
		entries.push({
			loc: absoluteUrl(`/course/${course.id}/`),
			lastmod: latestCourseDate,
			changefreq: "monthly",
			priority: 0.75,
			image: image ? { loc: toSeoImage(image, course.data.title).src, title: course.data.title } : undefined
		});
	}

	for (const lesson of lessons) {
		const [courseId, lessonId] = lesson.id.split("/");
		if (!courseId || !lessonId) continue;
		const title = extractTitle(lesson.body) || lesson.data.description || lessonId;
		const image = resolveLessonThumbnail(lesson, courseThumbs);
		entries.push({
			loc: absoluteUrl(`/course/${courseId}/${lessonId}/`),
			lastmod: lesson.data.lastmod ?? lesson.data.date,
			changefreq: "monthly",
			priority: 0.65,
			image: image ? { loc: toSeoImage(image, title).src, title } : undefined
		});
	}

	const uniqueEntries = [...new Map(entries.map(entry => [entry.loc, entry])).values()].sort((a, b) => a.loc.localeCompare(b.loc));
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${uniqueEntries.map(renderUrl).join("")}
</urlset>`;

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8"
		}
	});
}
