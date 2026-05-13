import { extractExcerpt, extractTitle, normalizeImportPath, normalizeTerms } from "@/utils/content";
import { AUTHOR_NAME, SITE_DESCRIPTION, SITE_LANGUAGE, SITE_NAME, absoluteUrl, toSeoImage, type SeoImage } from "@/utils/seo";
import type { ImageMetadata } from "astro";
import { getCollection } from "astro:content";

type FeedItem = {
	title: string;
	url: string;
	description: string;
	date: Date;
	categories: string[];
	thumbnail?: SeoImage;
};

const escapeXml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");

const renderCategories = (categories: string[]) => categories.map(category => `<category>${escapeXml(category)}</category>`).join("");

const renderItem = (item: FeedItem) => `
	<item>
		<title>${escapeXml(item.title)}</title>
		<link>${escapeXml(item.url)}</link>
		<guid isPermaLink="true">${escapeXml(item.url)}</guid>
		<description>${escapeXml(item.description)}</description>
		<dc:creator>${escapeXml(AUTHOR_NAME)}</dc:creator>
		<pubDate>${item.date.toUTCString()}</pubDate>
		${
			item.thumbnail
				? `<media:thumbnail url="${escapeXml(item.thumbnail.src)}"${item.thumbnail.width ? ` width="${item.thumbnail.width}"` : ""}${item.thumbnail.height ? ` height="${item.thumbnail.height}"` : ""} />
		<media:content url="${escapeXml(item.thumbnail.src)}" medium="image"${item.thumbnail.type ? ` type="${escapeXml(item.thumbnail.type)}"` : ""}${item.thumbnail.width ? ` width="${item.thumbnail.width}"` : ""}${item.thumbnail.height ? ` height="${item.thumbnail.height}"` : ""} />`
				: ""
		}
		${renderCategories(item.categories)}
	</item>`;

export async function GET() {
	const posts = (await getCollection("post")).filter(post => !post.data.draft);
	const lessons = (await getCollection("lesson")).filter(lesson => !lesson.data.draft);
	const courses = await getCollection("course");
	const courseNames = new Map(courses.map(course => [course.id, course.data.title]));
	const postThumbs = import.meta.glob<{ default: ImageMetadata }>("/src/content/post/*/thumbnail.webp", { eager: true });
	const lessonThumbs = import.meta.glob<{ default: ImageMetadata }>("/src/content/course/*/*/thumbnail.webp", { eager: true });

	const postItems: FeedItem[] = posts.map(post => {
		const title = extractTitle(post.body) || post.id;
		const thumbKey = normalizeImportPath(`/src/content/post/${post.id}/thumbnail.webp`);
		const thumbnail = postThumbs[thumbKey]?.default;
		return {
			title,
			url: absoluteUrl(`/p/${post.id}/`),
			description: post.data.description ?? extractExcerpt(post.body),
			date: post.data.lastmod ?? post.data.date,
			categories: [...normalizeTerms(post.data.categories), ...normalizeTerms(post.data.tags)],
			thumbnail: thumbnail ? toSeoImage(thumbnail, title) : undefined
		};
	});

	const lessonItems: FeedItem[] = lessons.flatMap(lesson => {
		const [courseId, lessonId] = lesson.id.split("/");
		if (!courseId || !lessonId) return [];
		const courseTitle = courseNames.get(courseId);
		const title = extractTitle(lesson.body) || lesson.data.description || lessonId;
		const thumbKey = normalizeImportPath(`/src/content/course/${courseId}/${lessonId}/thumbnail.webp`);
		const thumbnail = lessonThumbs[thumbKey]?.default;
		return {
			title: courseTitle ? `${courseTitle}: ${title}` : title,
			url: absoluteUrl(`/course/${courseId}/${lessonId}/`),
			description: lesson.data.description ?? extractExcerpt(lesson.body),
			date: lesson.data.lastmod ?? lesson.data.date,
			categories: ["課程", ...(courseTitle ? [courseTitle] : []), ...normalizeTerms(lesson.data.tags)],
			thumbnail: thumbnail ? toSeoImage(thumbnail, title) : undefined
		};
	});

	const items = [...postItems, ...lessonItems].filter(item => item.date instanceof Date && !Number.isNaN(item.date.getTime())).sort((a, b) => b.date.getTime() - a.date.getTime());
	const updated = items[0]?.date ?? new Date();

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/rss.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
	<title>${escapeXml(SITE_NAME)}</title>
	<link>${escapeXml(absoluteUrl("/"))}</link>
	<atom:link href="${escapeXml(absoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml" />
	<description>${escapeXml(SITE_DESCRIPTION)}</description>
	<language>${SITE_LANGUAGE}</language>
	<lastBuildDate>${updated.toUTCString()}</lastBuildDate>
	<ttl>60</ttl>
	<image>
		<url>${escapeXml(absoluteUrl("/img/og.webp"))}</url>
		<title>${escapeXml(SITE_NAME)}</title>
		<link>${escapeXml(absoluteUrl("/"))}</link>
	</image>
	${items.map(renderItem).join("")}
</channel>
</rss>`;

	return new Response(xml, {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8"
		}
	});
}
