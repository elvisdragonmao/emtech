import type { ImageMetadata } from "astro";

export const SITE_URL = "https://emtech.cc";
export const SITE_NAME = "毛哥EM資訊密技";
export const SITE_DESCRIPTION = "科技、設計、毛茸茸";
export const SITE_LOCALE = "zh_TW";
export const SITE_LANGUAGE = "zh-Hant";
export const AUTHOR_NAME = "毛哥EM";
export const AUTHOR_URL = `https://elvismao.com/about/`;

export type JsonLd = Record<string, unknown>;

export type SeoImage = {
	src: string;
	width?: number;
	height?: number;
	alt: string;
	type?: string;
};

export type SeoImageInput = string | ImageMetadata | SeoImage | null | undefined;

export const DEFAULT_SEO_IMAGE: SeoImage = {
	src: `${SITE_URL}/img/og.webp`,
	width: 1500,
	height: 750,
	alt: SITE_NAME,
	type: "image/webp"
};

export function normalizePath(path: string): string {
	const url = path.startsWith("http") ? new URL(path) : null;
	const pathname = url ? url.pathname : path || "/";
	const [pathOnly, query = ""] = pathname.split("?");
	const hasExtension = /\.[a-z0-9]+$/i.test(pathOnly);
	const normalized = pathOnly === "" ? "/" : pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
	const withSlash = normalized === "/" || hasExtension || normalized.endsWith("/") ? normalized : `${normalized}/`;
	return query ? `${withSlash}?${query}` : withSlash;
}

export function absoluteUrl(path: string): string {
	if (/^https?:\/\//i.test(path)) {
		const url = new URL(path);
		url.pathname = normalizePath(url.pathname);
		return url.toString();
	}
	return `${SITE_URL}${normalizePath(path)}`;
}

export function absoluteAssetUrl(path: string): string {
	if (/^https?:\/\//i.test(path)) return path;
	return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function toSeoImage(image: SeoImageInput, alt = SITE_NAME): SeoImage {
	if (!image) return { ...DEFAULT_SEO_IMAGE, alt };

	if (typeof image === "string") {
		return {
			src: absoluteAssetUrl(image),
			alt,
			type: image.endsWith(".webp") ? "image/webp" : undefined
		};
	}

	if ("src" in image && typeof image.src === "string") {
		return {
			src: absoluteAssetUrl(image.src),
			width: "width" in image ? image.width : undefined,
			height: "height" in image ? image.height : undefined,
			alt: "alt" in image && typeof image.alt === "string" ? image.alt : alt,
			type: "type" in image ? image.type : image.src.endsWith(".webp") ? "image/webp" : undefined
		};
	}

	return { ...DEFAULT_SEO_IMAGE, alt };
}

export function pageTitle(title = SITE_NAME): string {
	return title === SITE_NAME ? SITE_NAME : `${title} | ${SITE_NAME}`;
}

export function isoDate(date: Date | string | undefined): string | undefined {
	if (!date) return undefined;
	const value = typeof date === "string" ? new Date(date) : date;
	if (Number.isNaN(value.getTime())) return undefined;
	return value.toISOString();
}

export function safeJsonLd(data: JsonLd | JsonLd[]): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function withSchemaContext(data: JsonLd): JsonLd {
	return data["@context"] ? data : { "@context": "https://schema.org", ...data };
}

export function authorSchema(name = AUTHOR_NAME): JsonLd {
	return {
		"@type": "Person",
		"@id": `${AUTHOR_URL}#person`,
		name,
		url: AUTHOR_URL,
		image: `${SITE_URL}/img/avatar_faier.webp`
	};
}

export function publisherSchema(): JsonLd {
	return {
		"@type": "Organization",
		"@id": `${SITE_URL}/#organization`,
		name: SITE_NAME,
		url: SITE_URL,
		logo: {
			"@type": "ImageObject",
			url: `${SITE_URL}/img/favicon/android-chrome-512x512.png`,
			width: 512,
			height: 512
		}
	};
}

export function webSiteSchema(): JsonLd {
	return {
		"@type": "WebSite",
		"@id": `${SITE_URL}/#website`,
		url: `${SITE_URL}/`,
		name: SITE_NAME,
		description: SITE_DESCRIPTION,
		inLanguage: SITE_LANGUAGE,
		publisher: { "@id": `${SITE_URL}/#organization` },
		potentialAction: {
			"@type": "SearchAction",
			target: `${SITE_URL}/?q={search_term_string}`,
			"query-input": "required name=search_term_string"
		}
	};
}

export function webPageSchema(input: { url: string; title: string; description: string; image?: SeoImageInput; type?: string; breadcrumbId?: string; dateModified?: Date | string }): JsonLd {
	const url = absoluteUrl(input.url);
	return {
		"@type": input.type ?? "WebPage",
		"@id": `${url}#webpage`,
		url,
		name: input.title,
		description: input.description,
		inLanguage: SITE_LANGUAGE,
		isPartOf: { "@id": `${SITE_URL}/#website` },
		primaryImageOfPage: {
			"@type": "ImageObject",
			url: toSeoImage(input.image, input.title).src
		},
		breadcrumb: input.breadcrumbId ? { "@id": input.breadcrumbId } : undefined,
		dateModified: isoDate(input.dateModified)
	};
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>, id: string): JsonLd {
	return {
		"@type": "BreadcrumbList",
		"@id": id,
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			item: {
				"@id": absoluteUrl(item.url),
				name: item.name
			}
		}))
	};
}

export function itemListSchema(items: Array<{ url: string; name: string; item?: JsonLd }>, id: string): JsonLd {
	return {
		"@type": "ItemList",
		"@id": id,
		numberOfItems: items.length,
		itemListElement: items.map((entry, index) => ({
			"@type": "ListItem",
			position: index + 1,
			url: absoluteUrl(entry.url),
			name: entry.name,
			item: entry.item
		}))
	};
}

export function blogPostingSchema(input: {
	url: string;
	title: string;
	description: string;
	image?: SeoImageInput;
	datePublished: Date | string;
	dateModified?: Date | string;
	authors?: string[];
	tags?: string[];
	categories?: string[];
	wordCount?: number;
}): JsonLd {
	const url = absoluteUrl(input.url);
	const image = toSeoImage(input.image, input.title);
	return {
		"@type": "BlogPosting",
		"@id": `${url}#article`,
		mainEntityOfPage: { "@id": `${url}#webpage` },
		headline: input.title,
		name: input.title,
		description: input.description,
		image: [image.src],
		url,
		inLanguage: SITE_LANGUAGE,
		datePublished: isoDate(input.datePublished),
		dateModified: isoDate(input.dateModified ?? input.datePublished),
		author: (input.authors?.length ? input.authors : [AUTHOR_NAME]).map(authorSchema),
		publisher: { "@id": `${SITE_URL}/#organization` },
		articleSection: input.categories,
		keywords: input.tags?.join(", "),
		wordCount: input.wordCount
	};
}

export function courseSchema(input: { url: string; title: string; description: string; image?: SeoImageInput; courseId?: string; lessonCount?: number; dateModified?: Date | string }): JsonLd {
	const url = absoluteUrl(input.url);
	return {
		"@type": "Course",
		"@id": `${url}#course`,
		url,
		name: input.title,
		description: input.description,
		image: toSeoImage(input.image, input.title).src,
		inLanguage: SITE_LANGUAGE,
		provider: { "@id": `${SITE_URL}/#organization` },
		numberOfCredits: input.lessonCount,
		dateModified: isoDate(input.dateModified)
	};
}

export function learningResourceSchema(input: {
	url: string;
	title: string;
	description: string;
	image?: SeoImageInput;
	courseUrl: string;
	courseTitle: string;
	datePublished: Date | string;
	dateModified?: Date | string;
	keywords?: string[];
}): JsonLd {
	const url = absoluteUrl(input.url);
	return {
		"@type": "LearningResource",
		"@id": `${url}#learning-resource`,
		url,
		name: input.title,
		description: input.description,
		image: toSeoImage(input.image, input.title).src,
		inLanguage: SITE_LANGUAGE,
		learningResourceType: "Lesson",
		isPartOf: {
			"@type": "Course",
			"@id": `${absoluteUrl(input.courseUrl)}#course`,
			name: input.courseTitle
		},
		author: authorSchema(),
		publisher: { "@id": `${SITE_URL}/#organization` },
		datePublished: isoDate(input.datePublished),
		dateModified: isoDate(input.dateModified ?? input.datePublished),
		keywords: input.keywords?.join(", ")
	};
}

export function wordCountNumber(text: string | undefined): number {
	return text?.replace(/\s+/g, "").length ?? 0;
}
