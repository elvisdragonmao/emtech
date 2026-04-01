import fs from "node:fs/promises";
import path from "node:path";

import { findRepresentativeColors } from "./colors.js";
import { BuildError, ValidationError, formatError } from "./errors.js";
import { parseFrontMatter } from "./frontmatter.js";
import { log, printBanner } from "./logger.js";
import { createMarkdownRenderer } from "./markdown.js";
import { loadPartials, renderPartials, replacePlaceholders } from "./partials.js";
import {
	CONFIG_FILE,
	DIST_DIR,
	PAGES_DIR,
	PARTIALS_DIR,
	POSTS_DIR,
	PUBLIC_DIR,
	STATIC_DIR,
	buildPostAssetUrl,
	buildPostAssetUrlFromReference,
	resolveWithin,
	sitePathToDistPath,
	toPosixPath
} from "./paths.js";
import type { BuildStats, PostBuildResult, PostMeta, SiteConfig } from "./types.js";

const STATIC_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"]);

const defaultStats = (): BuildStats => ({
	pages: 0,
	posts: 0,
	tags: 0,
	categories: 0
});

const parseBooleanEnv = (value: string | undefined) => {
	if (!value) return false;
	return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
};

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, "").trim();

const requireStringArray = (value: unknown, key: string, filePath: string) => {
	if (value === undefined) return undefined;
	if (!Array.isArray(value) || !value.every(item => typeof item === "string")) {
		throw new ValidationError(`Expected ${key} to be an array of strings`, filePath);
	}
	return value;
};

const ensureDirectory = async (directoryPath: string) => {
	await fs.mkdir(directoryPath, { recursive: true });
};

const readConfig = async () => JSON.parse(await fs.readFile(CONFIG_FILE, "utf8")) as SiteConfig;

const initializeDist = async (skipPosts: boolean) => {
	if (!skipPosts) {
		await fs.rm(DIST_DIR, { recursive: true, force: true });
	}

	await Promise.all([
		ensureDirectory(resolveWithin(DIST_DIR, "static")),
		ensureDirectory(resolveWithin(DIST_DIR, "p", "clean")),
		ensureDirectory(resolveWithin(DIST_DIR, "p", "meta")),
		ensureDirectory(resolveWithin(DIST_DIR, "meta", "tag")),
		ensureDirectory(resolveWithin(DIST_DIR, "meta", "category"))
	]);
};

const listSubdirectories = async (directoryPath: string) => {
	const entries = await fs.readdir(directoryPath, { withFileTypes: true });
	return entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
};

const walkFiles = async (directoryPath: string, relativePrefix = ""): Promise<string[]> => {
	const entries = await fs.readdir(directoryPath, { withFileTypes: true });
	const files: string[] = [];

	for (const entry of entries) {
		const relativePath = relativePrefix ? path.posix.join(relativePrefix, entry.name) : entry.name;
		const absolutePath = path.join(directoryPath, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await walkFiles(absolutePath, relativePath)));
			continue;
		}
		files.push(relativePath);
	}

	return files;
};

const collectImageMeta = async (imageMeta: Record<string, string>, siteUrl: string, filePath: string) => {
	if (imageMeta[siteUrl]) return;

	try {
		const colors = await findRepresentativeColors(filePath);
		if (!colors) return;
		imageMeta[siteUrl] = `width="${colors.size[0]}" height="${colors.size[1]}"`;
	} catch (error) {
		log("warn", `Unable to read image metadata for ${siteUrl}: ${formatError(error)}`);
	}
};

const copyRecursive = async (sourceDir: string, targetDir: string) => {
	await ensureDirectory(targetDir);
	await fs.cp(sourceDir, targetDir, { recursive: true });
};

const copyStaticAssets = async () => {
	const imageMeta: Record<string, string> = {};

	await Promise.all([copyRecursive(STATIC_DIR, resolveWithin(DIST_DIR, "static")), copyRecursive(PUBLIC_DIR, DIST_DIR)]);

	const postIds = await listSubdirectories(POSTS_DIR);
	for (const postId of postIds) {
		const postDirectory = resolveWithin(POSTS_DIR, postId);
		const assetFiles = (await walkFiles(postDirectory)).filter(file => file !== "index.md");

		for (const relativeFile of assetFiles) {
			const sourcePath = resolveWithin(postDirectory, relativeFile);
			const targetPath = resolveWithin(DIST_DIR, "static", postId, relativeFile);
			await ensureDirectory(path.dirname(targetPath));
			await fs.copyFile(sourcePath, targetPath);

			if (STATIC_IMAGE_EXTENSIONS.has(path.extname(relativeFile).toLowerCase())) {
				const siteUrl = buildPostAssetUrl(postId, toPosixPath(relativeFile));
				await collectImageMeta(imageMeta, siteUrl, targetPath);
			}
		}
	}

	return imageMeta;
};

const renderPages = async (partials: Map<string, string>) => {
	const entries = await fs.readdir(PAGES_DIR, { withFileTypes: true });
	const pageFiles = entries.filter(entry => entry.isFile() && path.extname(entry.name) === ".html");

	await Promise.all(
		pageFiles.map(async entry => {
			const pageName = path.basename(entry.name, ".html");
			const sourcePath = resolveWithin(PAGES_DIR, entry.name);
			const targetDir = resolveWithin(DIST_DIR, pageName);
			const content = renderPartials(await fs.readFile(sourcePath, "utf8"), partials);
			await ensureDirectory(targetDir);
			await fs.writeFile(resolveWithin(targetDir, "index.html"), content);
		})
	);

	await Promise.all([
		fs.copyFile(resolveWithin(DIST_DIR, "home", "index.html"), resolveWithin(DIST_DIR, "index.html")),
		fs.copyFile(resolveWithin(DIST_DIR, "post", "index.html"), resolveWithin(DIST_DIR, "p", "index.html")),
		fs.copyFile(resolveWithin(DIST_DIR, "404", "index.html"), resolveWithin(DIST_DIR, "404.html"))
	]);

	await Promise.all([
		fs.rm(resolveWithin(DIST_DIR, "home"), { recursive: true, force: true }),
		fs.rm(resolveWithin(DIST_DIR, "post"), { recursive: true, force: true }),
		fs.rm(resolveWithin(DIST_DIR, "404"), { recursive: true, force: true })
	]);

	return pageFiles.length;
};

const rewriteMarkdownAssetUrls = (markdown: string, postId: string) => {
	return markdown.replace(/!\[(.*?)\]\((.*?)\)/g, (fullMatch, altText: string, rawTarget: string) => {
		const target = rawTarget.trim();
		if (!target) return fullMatch;
		if (/^(https?:\/\/|\/|#|mailto:|data:)/i.test(target)) return fullMatch;

		let normalizedTarget = target;
		if (normalizedTarget.startsWith("./")) {
			normalizedTarget = normalizedTarget.slice(2);
		}

		if (normalizedTarget.startsWith("../")) {
			return `![${altText}](${buildPostAssetUrlFromReference(postId, normalizedTarget)})`;
		}

		return `![${altText}](${buildPostAssetUrl(postId, normalizedTarget)})`;
	});
};

const getDescription = (htmlContent: string, explicitDescription?: string) => {
	if (explicitDescription) {
		return stripHtml(explicitDescription);
	}

	const paragraphMatch = htmlContent.match(/<p>(.*?)<\/p>/);
	if (!paragraphMatch) {
		throw new ValidationError("Post requires a description or a first paragraph", htmlContent.slice(0, 80));
	}

	return stripHtml(paragraphMatch[1]);
};

const getTitleAndContent = (htmlContent: string, explicitTitle: unknown, postId: string) => {
	if (typeof explicitTitle === "string" && explicitTitle.trim()) {
		return {
			title: explicitTitle.trim(),
			content: htmlContent.replace(/<h1>.*?<\/h1>/, "")
		};
	}

	const headingMatch = htmlContent.match(/<h1>(.*?)<\/h1>/);
	if (!headingMatch) {
		throw new ValidationError("Post requires a title in front matter or the first h1", postId);
	}

	return {
		title: headingMatch[1],
		content: htmlContent.replace(/<h1>.*?<\/h1>/, "")
	};
};

const getReadingMetrics = (markdownBody: string) => {
	const chineseCharCount = (markdownBody.match(/[\u4e00-\u9fa5]/g) || []).length;
	const englishWordCount = (markdownBody.match(/\b\w+\b/g) || []).length;
	const length = chineseCharCount + englishWordCount;
	const readingTime = Math.ceil(chineseCharCount / 300 + englishWordCount / 200) + " min";
	return {
		length,
		lengthLabel: length > 1000 ? `${(length / 1000).toFixed(1)}k` : length,
		readingTime
	};
};

const buildBreadcrumbJson = (kind: "tag" | "category", names: string[], title: string) => {
	return names
		.map(
			name => `,{
                                    "@context": "https://schema.org",
                                    "@type": "BreadcrumbList",
                                    "itemListElement": [{
                                      "@type": "ListItem",
                                      "position": 1,
                                      "name": "${name}",
                                      "item": "https://emtech.cc/${kind}/${name}"
                                    },{
                                      "@type": "ListItem",
                                      "position": 2,
                                      "name": "${title}"
                                    }]
                                  }`
		)
		.join("");
};

const generateSitemapAndRSS = async (postsMeta: PostMeta[], tags: Record<string, number>, categories: Record<string, { count: number; description?: string }>) => {
	const allPages = ["https://emtech.cc", "https://emtech.cc/random", "https://emtech.cc/rss.xml", "https://emtech.cc/sitemap.xml"]
		.concat(postsMeta.map(post => `https://emtech.cc/p/${post.id}`))
		.concat(Object.keys(tags).map(tag => `https://emtech.cc/tag/${tag}`))
		.concat(Object.keys(categories).map(category => `https://emtech.cc/category/${category}`));

	await fs.writeFile(resolveWithin(DIST_DIR, "pages.txt"), allPages.map(url => encodeURI(url)).join("\n"));

	const today = new Date().toISOString();
	const sitemapContent = postsMeta
		.map(
			post => ` <url>
    <loc>https://emtech.cc/p/${post.id}</loc>
  ${post.lastmod ? `<lastmod>${new Date(post.lastmod).toISOString()}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
		)
		.join("\n");

	await fs.writeFile(
		resolveWithin(DIST_DIR, "sitemap.xml"),
		`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://emtech.cc</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${sitemapContent}
  </urlset>`
	);

	const rssItems = postsMeta
		.map(
			post => `<item>
      <title>${post.title}</title>
      <link>https://emtech.cc/p/${post.id}</link>
      <description>${post.description}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid>https://emtech.cc/p/${post.id}</guid>
      <media:thumbnail url="https://emtech.cc${post.thumbnail}" />
      <category>${post.categories ?? []}</category>
     <content:encoded><![CDATA[<img src="${post.thumbnail}" />${post.htmlContent || ""}]]></content:encoded>
    </item>`
		)
		.join("\n");

	await fs.writeFile(
		resolveWithin(DIST_DIR, "rss.xml"),
		`<?xml version="1.0" encoding="UTF-8"?>
        <?xml-stylesheet type="text/xsl" href="/static/rss.xsl"?>
        <rss version="2.0" 
        xmlns:content="http://purl.org/rss/1.0/modules/content/"
        xmlns:media="http://search.yahoo.com/mrss/">
        <channel>
        <title>毛哥EM資訊密技</title>
        <link>https://emtech.cc</link>
        <description>分享各種程式及軟體</description>
        <language>zh-Hant</language>
        <lastBuildDate>${new Date().toUTCString()}
        </lastBuildDate>
        <pubDate>${new Date().toUTCString()}</pubDate>
        <ttl>1800</ttl>
        ${rssItems}</channel></rss>`
	);
};

const processPosts = async (partials: Map<string, string>, imageMeta: Record<string, string>, config: SiteConfig) => {
	const postIds = await listSubdirectories(POSTS_DIR);
	const postTemplate = partials.get("post");
	if (!postTemplate) {
		throw new BuildError("Missing required post partial", "view/partials/post.html");
	}

	const postPageTemplate = renderPartials(await fs.readFile(resolveWithin(PAGES_DIR, "post.html"), "utf8"), partials);
	const markdown = createMarkdownRenderer(imageMeta);
	const skippedPosts: string[] = [];
	const deadPosts: string[] = [];
	const buildErrors: string[] = [];
	const builtPosts: PostMeta[] = [];

	const results = await Promise.all(
		postIds.map(async postId => {
			const postDirectory = resolveWithin(POSTS_DIR, postId);
			const markdownFile = resolveWithin(postDirectory, "index.md");

			try {
				await fs.access(markdownFile);
				const source = await fs.readFile(markdownFile, "utf8");
				const withoutComments = source.replace(/<!--[\s\S]+?-->/g, "");
				const parsed = parseFrontMatter(withoutComments, markdownFile);
				const tags = requireStringArray(parsed.attributes.tags, "tags", markdownFile);
				const categories = requireStringArray(parsed.attributes.categories, "categories", markdownFile);
				const draft = parsed.attributes.draft;

				if (draft === "true") {
					return { status: "skipped", postId } satisfies PostBuildResult;
				}

				if (draft === "dead") {
					return { status: "dead", postId } satisfies PostBuildResult;
				}

				const date = parsed.attributes.date;
				if (typeof date !== "number" || !Number.isFinite(date)) {
					throw new ValidationError("Post requires a valid date", markdownFile);
				}

				const markdownBody = rewriteMarkdownAssetUrls(parsed.body, postId);
				let htmlContent = markdown.render(renderPartials(markdownBody, partials));
				const titleAndContent = getTitleAndContent(htmlContent, parsed.attributes.title, postId);
				htmlContent = titleAndContent.content;
				const title = stripHtml(titleAndContent.title);
				if (!title) {
					throw new ValidationError("Post title cannot be empty", markdownFile);
				}

				const description = getDescription(htmlContent, typeof parsed.attributes.description === "string" ? parsed.attributes.description : undefined);
				const thumbnailCandidate =
					typeof parsed.attributes.thumbnail === "string" ? parsed.attributes.thumbnail : imageMeta[`/static/${postId}/thumbnail.webp`] ? `/static/${postId}/thumbnail.webp` : "";

				let colors = typeof parsed.attributes.colors === "string" ? parsed.attributes.colors : undefined;
				let color = typeof parsed.attributes.color === "string" ? parsed.attributes.color : undefined;
				let thumbnailSize: [number, number] | undefined;

				if (!colors && thumbnailCandidate && !thumbnailCandidate.includes("http")) {
					const colorResult = await findRepresentativeColors(sitePathToDistPath(thumbnailCandidate));
					if (colorResult) {
						colors = `linear-gradient(135deg, ${colorResult.colors.join(", ")})`;
						color = colorResult.colors[1];
						thumbnailSize = colorResult.size;
					}
				}

				const readingMetrics = getReadingMetrics(markdownBody);
				const postMeta: PostMeta = {
					...parsed.attributes,
					id: postId,
					title,
					description,
					thumbnail: thumbnailCandidate,
					date,
					length: readingMetrics.lengthLabel,
					htmlContent: (Date.now() - date) / (1000 * 60 * 60 * 24) < 30 ? htmlContent : "",
					readingTime: typeof parsed.attributes.readingTime === "string" ? parsed.attributes.readingTime : readingMetrics.readingTime,
					tags,
					categories,
					colors,
					color,
					thumbnailSize
				};

				const headerCategories = categories ? categories.map(category => `<a href="/category/${category}"><div class="header-categorie">${category}</div></a>`).join("") : "";
				const headerTags = tags ? tags.map(tag => `<a href="/tag/${tag}"><div class="header-tag">${tag}</div></a>`).join("") : "";
				const postTags = tags ? tags.map(tag => `<a href="/tag/${tag}"><div class="post-tag">${tag}</div></a>`).join("") : "";
				const breadcrumbList = buildBreadcrumbJson("tag", tags ?? [], title) + buildBreadcrumbJson("category", categories ?? [], title);

				const replacements = {
					title,
					content: htmlContent,
					tldr:
						typeof parsed.attributes.description === "string" && parsed.attributes.description.trim()
							? `<div class="tldr">
                <h2>簡單來說</h2>
                <div>
                    ${parsed.attributes.description}
                </div>
            </div>`
							: "",
					BreadcrumbList: breadcrumbList,
					thumbnail: thumbnailCandidate,
					thumbnailWidth: thumbnailSize?.[0] ?? "",
					thumbnailHeight: thumbnailSize?.[1] ?? "",
					length: postMeta.length,
					colors,
					readingTime: postMeta.readingTime,
					date: new Date(date).toISOString().split("T")[0],
					lastmod: typeof parsed.attributes.lastmod === "number" ? ` (${new Date(parsed.attributes.lastmod).toISOString().split("T")[0]} 更新)` : "",
					theme: color,
					postTags,
					headerCategories,
					headerTags,
					postID: postId,
					description
				};

				const fullPostHtml = replacePlaceholders(postTemplate, replacements);
				const fullPostPageHtml = replacePlaceholders(postPageTemplate, {
					...replacements,
					post: fullPostHtml
				});

				await fs.writeFile(resolveWithin(DIST_DIR, "p", "clean", `${postId}.html`), fullPostHtml);
				await ensureDirectory(resolveWithin(DIST_DIR, "p", postId));
				await fs.writeFile(resolveWithin(DIST_DIR, "p", postId, "index.html"), fullPostPageHtml);

				return {
					status: "built",
					postId,
					post: postMeta
				} satisfies PostBuildResult;
			} catch (error) {
				if ((error as NodeJS.ErrnoException).code === "ENOENT") {
					log("warn", `No markdown file found for post: ${postId}`);
					return null;
				}
				buildErrors.push(`${postId}: ${formatError(error)}`);
				return null;
			}
		})
	);

	for (const result of results) {
		if (!result) continue;
		if (result.status === "skipped") {
			skippedPosts.push(result.postId);
			continue;
		}
		if (result.status === "dead") {
			deadPosts.push(result.postId);
			continue;
		}
		builtPosts.push(result.post);
	}

	log("info", `Skipped posts: ${skippedPosts.join(", ")}`);
	log("info", `Dead posts: ${deadPosts.join(", ")}`);

	if (buildErrors.length) {
		buildErrors.forEach(message => log("error", message));
		throw new BuildError("Post build failed", `${buildErrors.length} post(s) failed validation or rendering`);
	}

	await fs.writeFile(resolveWithin(DIST_DIR, "p", "meta", "posts.json"), JSON.stringify(builtPosts));
	await Promise.all(builtPosts.map(post => fs.writeFile(resolveWithin(DIST_DIR, "p", "meta", `${post.id}.json`), JSON.stringify(post))));

	builtPosts.sort((left, right) => right.date - left.date);

	const tagsMap: Record<string, PostMeta[]> = {};
	const categoriesMap: Record<string, PostMeta[]> = {};
	const tags: Record<string, number> = {};
	const categories: Record<string, { count: number; description?: string }> = {};
	const search = builtPosts.map(post => ({
		title: post.title,
		description: post.description,
		id: post.id,
		thumbnail: post.thumbnail
	}));

	for (const post of builtPosts) {
		for (const tag of post.tags ?? []) {
			tagsMap[tag] ??= [];
			tagsMap[tag].push(post);
			tags[tag] = (tags[tag] ?? 0) + 1;
		}

		for (const category of post.categories ?? []) {
			categoriesMap[category] ??= [];
			categoriesMap[category].push(post);
			categories[category] = categories[category] ? { count: categories[category].count + 1 } : { count: 1 };
		}
	}

	for (const category of Object.keys(categories)) {
		const configuredCategory = config.category[category];
		if (configuredCategory) {
			categories[category].description = configuredCategory.description;
		}
	}

	const sortedTags = Object.entries(tags)
		.sort((left, right) => right[1] - left[1])
		.reduce<Record<string, number>>((accumulator, [key, value]) => {
			accumulator[key] = value;
			return accumulator;
		}, {});

	await Promise.all([
		fs.writeFile(resolveWithin(DIST_DIR, "meta", "latest.json"), JSON.stringify(builtPosts.slice(0, 10))),
		fs.writeFile(resolveWithin(DIST_DIR, "meta", "search.json"), JSON.stringify(search)),
		...Object.entries(tagsMap).map(([tag, posts]) => fs.writeFile(resolveWithin(DIST_DIR, "meta", "tag", `${tag}.json`), JSON.stringify(posts))),
		...Object.entries(categoriesMap).map(([category, posts]) => fs.writeFile(resolveWithin(DIST_DIR, "meta", "category", `${category}.json`), JSON.stringify(posts))),
		fs.writeFile(resolveWithin(DIST_DIR, "meta", "tags.json"), JSON.stringify({ tags: sortedTags, categories }))
	]);

	await generateSitemapAndRSS(builtPosts, sortedTags, categories);

	return {
		posts: builtPosts,
		tags: sortedTags,
		categories,
		stats: {
			posts: builtPosts.length,
			tags: Object.keys(tagsMap).length,
			categories: Object.keys(categoriesMap).length
		}
	};
};

export const runGenerator = async () => {
	printBanner();
	log("message", "emtech Site Generator");
	log("info", "Generating site...");
	console.time("Execution Time");

	const skipPosts = parseBooleanEnv(process.env.SKIPPOST);
	const stats = defaultStats();

	try {
		log("info", "Initializing dist folder...");
		await initializeDist(skipPosts);

		log("info", "Loading config and partials...");
		const [config, partials] = await Promise.all([readConfig(), loadPartials(PARTIALS_DIR)]);

		log("info", "Preparing static assets...");
		const [pagesCount, imageMeta] = await Promise.all([renderPages(partials), copyStaticAssets()]);
		stats.pages = pagesCount;

		if (!skipPosts) {
			log("info", "Processing posts...");
			const postResult = await processPosts(partials, imageMeta, config);
			stats.posts = postResult.stats.posts;
			stats.tags = postResult.stats.tags;
			stats.categories = postResult.stats.categories;
			console.table(stats);
		}

		log("success", "Site generated successfully!");
	} catch (error) {
		log("error", formatError(error));
		throw error;
	} finally {
		console.timeEnd("Execution Time");
	}
};
