export interface SiteConfig {
	name: string;
	description: string;
	author: string;
	category: Record<string, { description: string }>;
}

export type FrontMatterValue = string | string[] | number;

export interface FrontMatterResult {
	attributes: Record<string, FrontMatterValue>;
	body: string;
}

export interface PostMeta {
	id: string;
	title: string;
	description: string;
	thumbnail: string;
	date: number;
	length: number | string;
	htmlContent: string;
	readingTime: string;
	lastmod?: number;
	tags?: string[];
	categories?: string[];
	colors?: string;
	color?: string;
	thumbnailSize?: [number, number];
	[key: string]: unknown;
}

export interface BuildStats {
	pages: number;
	posts: number;
	tags: number;
	categories: number;
}

export interface PostBuildResult {
	post?: PostMeta;
	status: "built" | "skipped" | "dead";
	postId: string;
}
