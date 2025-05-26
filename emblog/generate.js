const fs = require("fs").promises;
const path = require("path");
const markdownIt = require("markdown-it");
const hljs = require("highlight.js");
const sharp = require("sharp");
const skipPost = process.env.SKIPPOST || 0;
let analyze = {
    pages: 0,
    posts: 0,
    tags: 0,
    categories: 0
};
let postsMeta = [];
let tags = {};
const categories = {};
const partialsContent = {};
let imageMeta = {};

const log = (type, message) => {
    const types = {
        log: "➤",
        info: "➤",
        warn: "⚠️",
        success: "✅",
        error: "❌"
    };
    const color = {
        log: 37,
        info: 34,
        warn: 33,
        success: 35,
        message: 32,
        error: 31
    };
    const icon = types[type] || types.log;
    const consoleColor = color[type] || color.log;
    console.log(`\x1b[${consoleColor}m%s\x1b[0m`, icon + " " + message);
};

const md = markdownIt({
    html: true,
    linkify: false,
    highlight: (str, lang) => {
        try {
            // if last char is \n, remove it
            if (str.slice(-1) === "\n") {
                str = str.slice(0, -1);
            }
            const highlightedCode = hljs.highlight(str, {
                language: (lang || "plaintext").toLowerCase()
            }).value;

            // Adding line numbers
            const lines = highlightedCode
                .split("\n")
                .map(
                    (line, idx) =>
                        `<span class="line"><span class="ln">${
                            idx + 1
                        }</span><span class="cl">${line}</span></span>`
                )
                .join("\n");

            return lines;
        } catch (__) {}
    }
});

// Function to create anchor-friendly IDs from text
const slugify = (text) =>
    text
        .toString()
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(
            /[^\p{L}\p{N}\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\-_]+/gu,
            ""
        ) // Remove all non-word characters except hyphens/underscores
        .replace(/\-\-+/g, "-"); // Replace multiple hyphens with a single one

// Custom renderer for headings to include anchor IDs
md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const level = token.tag.slice(1); // Get the heading level (h1, h2, etc.)
    // if h1 just return
    if (level === "1") return self.renderToken(tokens, idx, options);
    const title = tokens[idx + 1].content; // Get the heading text content
    const slug = slugify(title); // Generate slug based on the text content
    token.attrPush(["id", slug]);
    return self.renderToken(tokens, idx, options);
};

// Custom renderer for code block
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const langClass = token.info ? `language-${token.info.trim()}` : "";
    const langName = token.info || "code";

    // Use the highlighted code with line numbers
    const highlightedCode = md.options.highlight(
        token.content,
        token.info.trim()
    );
    if (!highlightedCode) {
        return `<pre tabindex="0" class="chroma wtf"><code class="${langClass} hljs" data-lang="${langName}">${md.utils.escapeHtml(
            token.content
        )}</code></pre>`;
    }
    // count how many rows in the code block
    const rows = highlightedCode.split("\n").length;
    // add a class to the code block if it has more than 3 rows
    let toggle = "";
    if (rows > 5) {
        toggle = `<input type="checkbox" class="code-toggle" id="code-toggle-${idx}">
        <label for="code-toggle-${idx}" class="code-toggle-label"></label>`;
    }

    // Wrap the code block in a div with a copy button
    return `
        <div class="code-block">
            <div class="highlight">
                <pre tabindex="0" class="chroma"><code class="${langClass} hljs" data-lang="${langName}">${highlightedCode}</code></pre>
            </div>
            <button class="code-copy" onclick="copyCode(this)">Copy</button>
            ${toggle}
        </div>
    `;
};

// Custom renderer for images to include figcaption
md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    let src = token.attrs[token.attrIndex("src")][1];
    const alt = token.content || ""; // Use alt as caption
    const title = token.attrs[token.attrIndex("title")]
        ? token.attrs[token.attrIndex("title")][1]
        : "";
    let wh = imageMeta[decodeURIComponent(src)] || "";
    return `
        <figure>
            <img src="${src}" alt="${alt}" title="${title}" ${wh}>
            ${alt ? "<figcaption>" + alt + "</figcaption>" : ""}
        </figure>
    `;
};

// add a div outside table

md.renderer.rules.table_open = (tokens, idx, options, env, self) => {
    return "<div class='table-wrapper'><table>";
};

md.renderer.rules.table_close = (tokens, idx, options, env, self) => {
    return "</table></div>";
};

const initDist = async () => {
    try {
        await fs.access("dist"); // Check if "dist" exists
        await fs.rm("dist", { recursive: true });
    } catch (err) {
        // Ignore error if "dist" does not exists
    }
    await Promise.all(
        [
            "dist/static",
            "dist/p/clean",
            "dist/p/meta",
            "dist/meta/tag",
            "dist/meta/category"
        ].map((path) => fs.mkdir(path, { recursive: true }))
    );
};

const replacePlaceholders = (template, replacements) =>
    Object.keys(replacements).reduce(
        (str, key) => str.replaceAll(`{{${key}}}`, replacements[key]),
        template
    );

const renderPartials = (htmlContent) => {
    if (!htmlContent) throw new Error("htmlContent is undefined or null");
    const partialsKeys = Object.keys(partialsContent);
    const regex = new RegExp(
        `{{(${partialsKeys.join("|")})}}`, // 把所有 partials 進行匹配
        "g"
    );
    return htmlContent.replace(regex, (match, partialKey) => {
        return partialsContent[partialKey] || match; // 如果部分模板存在，替換，否則保持原樣
    });
};

const generatePartials = async () => {
    const partialFiles = await fs.readdir("view/partials"); // 應該不會有人蠢到放不是 html 的檔案進去，就不篩選了
    await Promise.all(
        partialFiles.map(async (file) => {
            const partialName = file.replace(".html", "");
            console.log(`Reading partial: ${partialName}`);
            const content = await fs.readFile(`view/partials/${file}`, "utf8");
            partialsContent[partialName] = content;
        })
    );
    let partialsToRender = new Set(Object.keys(partialsContent));
    while (partialsToRender.size)
        for (const partial of [...partialsToRender]) {
            const rendered = renderPartials(partialsContent[partial]);
            if (rendered !== partialsContent[partial])
                partialsContent[partial] = rendered;
            else partialsToRender.delete(partial);
        }

    const files = await fs.readdir("view/pages");
    // Filter for .html files
    const viewFiles = files.filter((file) => file.endsWith(".html"));

    await Promise.all(
        viewFiles.map(async (file) => {
            const dirName = path.basename(file, ".html");
            const dirPath = `dist/${dirName}`;
            await fs.mkdir(dirPath, { recursive: true });
            let fileContent = await fs.readFile(`view/pages/${file}`, "utf8");
            fileContent = renderPartials(fileContent);
            await fs.writeFile(`${dirPath}/index.html`, fileContent);
        })
    );

    console.log("➤ Found view files: ", viewFiles);

    analyze.pages = viewFiles.length;

    await Promise.all([
        fs.copyFile("dist/home/index.html", "dist/index.html"),
        fs.copyFile("dist/post/index.html", "dist/p/index.html"),
        fs.copyFile("dist/404/index.html", "dist/404.html")
    ]);
    await Promise.all([
        fs.rm("dist/home", { recursive: true }),
        fs.rm("dist/post", { recursive: true }),
        fs.rm("dist/404", { recursive: true })
    ]);
};

const copyStatic = async () => {
    const copyFilteredFiles = async () => {
        const sourceDir = "post";
        const targetDir = "dist/static";
        let files = await fs.readdir(sourceDir, {
            withFileTypes: true,
            recursive: true
        });
        const filteredFiles = files.filter(
            (file) => file.isFile() && file.name !== "index.md"
        );
        const copyPromises = filteredFiles.map(async (file) => {
            const sourcePath = path.join(file.parentPath, file.name);
            const targetPath = path.join(
                targetDir,
                file.parentPath.split("\\").pop().split("/").pop(),
                file.name
            );
            await fs.cp(sourcePath, targetPath, { recursive: true });
            // test if is image
            if (
                /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(file.name) &&
                !imageMeta[file.parentPath]
            ) {
                const { width, height } = await sharp(sourcePath).metadata();
                imageMeta[
                    "/static/" +
                        file.parentPath.split("\\").pop().split("/").pop() +
                        "/" +
                        file.name
                ] = `width="${width}" height="${height}"`;
            }
        });

        await Promise.all(copyPromises);
    };

    await Promise.all([
        copyFilteredFiles(),
        fs.cp("static", "dist/static", { recursive: true }),
        fs.cp("public", "dist", { recursive: true })
    ]);
};

// 讀取文章並生成 HTML 和 JSON
async function processPosts() {
    const postsDir = "post";

    const items = await fs.readdir(postsDir, { withFileTypes: true });

    // Filter for directories
    const postFolders = items
        .filter((item) => item.isDirectory())
        .map((dir) => dir.name);

    const postTemplate = renderPartials(
        await fs.readFile("view/partials/post.html", "utf8")
    );
    const postPageTemplate = renderPartials(
        await fs.readFile("view/pages/post.html", "utf8")
    );

    await Promise.all(
        postFolders.map(async (postID) => {
            try {
                const postPath = path.join(postsDir, postID);
                const markdownFile = path.join(postPath, "index.md");
                try {
                    await fs.access(markdownFile); // Checks if file exists
                    console.log(`Processing post: ${postID}`);
                } catch (error) {
                    console.warn(
                        `➤ No markdown file found for post: ${postID}`
                    );
                    return;
                }
                let markdownContent = (
                    await fs.readFile(markdownFile, "utf8")
                ).replace(/<!--[\s\S]+?-->/g, "");

                let postMeta = extractFrontMatter(markdownContent);
                let colors;
                // turn image url if not set path like ![](image.webp) to ![](/static/postID/image.webp)
                // don't change url if absolute path or relative path like /static/image.webp or ../image.webp or https://image.webp
                if (postMeta.draft == "true") {
                    console.log(`Skip post: ${postID}`);
                    return;
                }
                markdownContent = markdownContent.replace(
                    /!\[(.*?)\]\((?!https?:\/\/|\/)(.*?)\)/g,
                    (_, altText, url) =>
                        `![${altText}](/static/${encodeURIComponent(postID)}/${url})`
                );
                let htmlContent = md.render(
                    renderPartials(
                        markdownContent.replace(/---[\s\S]+?---/, "")
                    )
                );
                if (!postMeta.title) {
                    postMeta.title = htmlContent.match(/<h1>(.*?)<\/h1>/)[1];
                    // remove the first h1 tag
                    htmlContent = htmlContent.replace(/<h1>.*?<\/h1>/, "");
                }
                let tldr = "";
                // get description from the first paragraph of the post
                if (postMeta.description) {
                    tldr = `<div class="tldr">
                <h2>簡單來說</h2>
                <div>
                    ${postMeta.description}
                </div>
            </div>`;
                } else {
                    postMeta.description =
                        htmlContent.match(/<p>(.*?)<\/p>/)[1];
                }
                // remove html tags from the description
                postMeta.description = postMeta.description.replace(
                    /<[^>]+>/g,
                    ""
                );
                let thumbnail =
                    postMeta.thumbnail ||
                    (imageMeta[`/static/${postID}/thumbnail.webp`]
                        ? `/static/${postID}/thumbnail.webp`
                        : "");
                let thumbnail2 = "";
                if (
                    !postMeta.colors &&
                    thumbnail.includes(".") &&
                    !thumbnail.includes("http")
                ) {
                    colors = await findRepresentativeColors(
                        path.join("dist", thumbnail)
                    );
                    postMeta.colors =
                        "linear-gradient(135deg, " + colors[0].join(", ") + ")";
                    if (thumbnail.includes(postID))
                        await sharp(path.join("dist", thumbnail)).toFile(
                            path.join("dist", "static", postID, "thumbnail.jpg")
                        );
                    thumbnail = "https://emtech.cc" + thumbnail;
                    thumbnail2 = thumbnail.replace(".webp", ".jpg");
                    postMeta.color = colors[0][1];
                    postMeta.thumbnailSize = colors[1];
                }

                const chineseCharCount = (
                    markdownContent.match(/[\u4e00-\u9fa5]/g) || []
                ).length;
                const englishWordCount = (
                    markdownContent.match(/\b\w+\b/g) || []
                ).length;
                const length = chineseCharCount + englishWordCount;
                // turn to k, if length > 1000. Fixed to 1 decimal place
                postMeta.length =
                    length > 1000 ? (length / 1000).toFixed(1) + "k" : length;
                // postMeta.lastmod =
                //     (await fs.stat(markdownFile).mtime) || "";
                if (!postMeta.readingTime) {
                    const chineseReadingSpeed = 300; // 每分鐘 300 字
                    const englishReadingSpeed = 200; // 每分鐘 200 單詞
                    const chineseReadingTime =
                        chineseCharCount / chineseReadingSpeed;
                    const englishReadingTime =
                        englishWordCount / englishReadingSpeed;
                    const totalReadingTime =
                        chineseReadingTime + englishReadingTime;
                    postMeta.readingTime = Math.ceil(totalReadingTime) + " min";
                }

                postMeta = {
                    ...postMeta,
                    id: postID,
                    title: postMeta.title || "無題",
                    description: postMeta.description || null,
                    thumbnail,
                    length,
                    // if date is in one month, add htmlContent
                    htmlContent:
                        (new Date() - new Date(postMeta.date)) /
                            (1000 * 60 * 60 * 24) <
                        30
                            ? htmlContent
                            : ""
                };

                postsMeta.push(postMeta);
                //<div class="header-categorie">閒聊</div> for each, combine all to a string
                const headerCategories = postMeta.categories
                    ? postMeta.categories
                          .map(
                              (category) =>
                                  `<a href="/category/${category}"><div class="header-categorie">${category}</div></a>`
                          )
                          .join("")
                    : "";
                const headerTags = postMeta.tags
                    ? postMeta.tags
                          .map(
                              (tag) =>
                                  `<a href="/tag/${tag}"><div class="header-tag">${tag}</div></a>`
                          )
                          .join("")
                    : "";
                const postTags = postMeta.tags
                    ? postMeta.tags
                          .map(
                              (tag) =>
                                  `<a href="/tag/${tag}"><div class="post-tag">${tag}</div></a>`
                          )
                          .join("")
                    : "";
                const categoriesreadcrumbList = // combine postMeta.categories and postMeta.tags
                    (postMeta.categories || [])
                        .map(
                            (tag) =>
                                `,{
                                    "@context": "https://schema.org",
                                    "@type": "BreadcrumbList",
                                    "itemListElement": [{
                                      "@type": "ListItem",
                                      "position": 1,
                                      "name": "${tag}",
                                      "item": "https://emtech.cc/category/${tag}"
                                    },{
                                      "@type": "ListItem",
                                      "position": 2,
                                      "name": "${postMeta.title}"
                                    }]
                                  }`
                        )
                        .join("");

                const tagsBreadcrumbList = // combine postMeta.categories and postMeta.tags
                    (postMeta.tags || [])
                        .map(
                            (tag) =>
                                `,{
                                    "@context": "https://schema.org",
                                    "@type": "BreadcrumbList",
                                    "itemListElement": [{
                                      "@type": "ListItem",
                                      "position": 1,
                                      "name": "${tag}",
                                      "item": "https://emtech.cc/tag/${tag}"
                                    },{
                                      "@type": "ListItem",
                                      "position": 2,
                                      "name": "${postMeta.title}"
                                    }]
                                  }`
                        )
                        .join("");

                const BreadcrumbList =
                    tagsBreadcrumbList + categoriesreadcrumbList;
                const replacements = {
                    title: postMeta.title,
                    content: htmlContent,
                    tldr,
                    thumbnail2,
                    BreadcrumbList,
                    thumbnail: thumbnail,
                    thumbnailWidth: postMeta.thumbnailSize
                        ? postMeta.thumbnailSize[0]
                        : "",
                    thumbnailHeight: postMeta.thumbnailSize
                        ? postMeta.thumbnailSize[1]
                        : "",
                    length: postMeta.length,
                    colors: postMeta.colors,
                    readingTime: postMeta.readingTime,
                    date: new Date(postMeta.date).toISOString().split("T")[0],
                    lastmod: postMeta.lastmod
                        ? " (" +
                          new Date(postMeta.lastmod)
                              .toISOString()
                              .split("T")[0] +
                          " 更新)"
                        : "",
                    theme: postMeta.color,
                    postTags,
                    headerCategories,
                    headerTags,
                    postID,
                    description: postMeta.description
                };
                const fullPostHtml = replacePlaceholders(
                    postTemplate,
                    replacements
                );
                const fullPostPageHtml = replacePlaceholders(postPageTemplate, {
                    ...replacements,
                    post: fullPostHtml
                });
                await fs.writeFile(`dist/p/clean/${postID}.html`, fullPostHtml);

                await fs.mkdir(`dist/p/${postID}`, { recursive: true });
                await fs.writeFile(
                    `dist/p/${postID}/index.html`,
                    fullPostPageHtml
                );
            } catch (error) {
                console.error(`➤ Error processing post: ${postID}`);
                console.error(error);
            }
        })
    );

    // 輸出 posts.json 和每篇文章的 json
    await fs.writeFile("dist/p/meta/posts.json", JSON.stringify(postsMeta));

    // Write individual post JSON files concurrently
    await Promise.all(
        postsMeta.map((post) =>
            fs.writeFile(`dist/p/meta/${post.id}.json`, JSON.stringify(post))
        )
    );

    // 生成 tags 和 categories 的 json
    const tagsMap = {};
    const categoriesMap = {};
    const search = []; // only title,discription, and id. for search

    // order by date
    postsMeta.sort((a, b) => b.date - a.date);
    postsMeta.forEach((post) => {
        if (post.tags)
            post.tags.forEach((tag) => {
                if (!tagsMap[tag]) tagsMap[tag] = [];
                tags[tag] = tags[tag] ? tags[tag] + 1 : 1;
                tagsMap[tag].push(post);
            });
        if (post.categories)
            post.categories.forEach((category) => {
                if (!categoriesMap[category]) categoriesMap[category] = [];
                categories[category] = categories[category]
                    ? { count: categories[category].count + 1 }
                    : { count: 1 };
                categoriesMap[category].push(post);
            });
        search.push({
            title: post.title,
            description: post.description,
            id: post.id,
            thumbnail: post.thumbnail
        });
    });
    tags = Object.entries(tags)
        .sort((a, b) => b[1] - a[1])
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});

    const config = JSON.parse(await fs.readFile("config.json", "utf8"));
    for (const category in categories) {
        if (config.category[category]) {
            categories[category].description =
                config.category[category].description;
        }
    }

    const writePromises = [
        fs.writeFile(
            "dist/meta/latest.json",
            JSON.stringify(postsMeta.slice(0, 10))
        ),
        fs.writeFile("dist/meta/search.json", JSON.stringify(search)),
        ...Object.entries(tagsMap).map(([tag, posts]) =>
            fs.writeFile(`dist/meta/tag/${tag}.json`, JSON.stringify(posts))
        ),
        ...Object.entries(categoriesMap).map(([category, posts]) =>
            fs.writeFile(
                `dist/meta/category/${category}.json`,
                JSON.stringify(posts)
            )
        ),
        fs.writeFile(
            "dist/meta/tags.json",
            JSON.stringify({ tags, categories })
        )
    ];
    await Promise.all(writePromises);
    // calcalate the number of posts in each tag and category
    analyze.tags = Object.keys(tagsMap).length;
    analyze.categories = Object.keys(categoriesMap).length;
    analyze.posts = postsMeta.length;
}

// 提取 front matter
function extractFrontMatter(content) {
    const frontMatterMatch = content.match(/---[\s\S]+?---/);
    let meta = {};
    if (frontMatterMatch) {
        const frontMatter = frontMatterMatch[0];
        const lines = frontMatter.split("\n").slice(1, -1); // 去掉 '---'
        meta = {};
        lines.forEach((line) => {
            if (!line.includes(": ") || line.startsWith("#")) return;
            const [key, value] = line.split(": ");
            const trimmedKey = key.trim();
            const trimmedValue = value.trim();

            // 檢查是否為陣列格式
            if (trimmedValue.startsWith("[") && trimmedValue.endsWith("]")) {
                // 用正則表達式將每個元素加上雙引號，處理字串內容、特殊字符和空格
                const fixedValue = trimmedValue
                    .replaceAll("，", ",")
                    .replace(
                        /("[^"]+"|[^,\[\]\s]+(?:\s+[^,\[\]\s]+)*)/g,
                        '"$1"'
                    )
                    // 把，換成 ,，但如果是引號裡面的就不換
                    .replace(/，(?=(?:(?:[^"]*"){2})*[^"]*$)/g, ",");
                // 移除多餘的雙引號（避免連續引號問題）
                const sanitizedValue = fixedValue.replace(/"{2,}/g, '"');
                meta[trimmedKey] = JSON.parse(sanitizedValue);
            } else if (trimmedKey === "date") {
                // 將日期轉換為 JavaScript timestamp
                meta[trimmedKey] = new Date(trimmedValue).getTime();
            } else {
                // 處理為字串，並去除包裹的引號
                meta[trimmedKey] = trimmedValue.replace(/^['"]|['"]$/g, "");
            }
        });
    }

    return meta;
}

const getCurrentPubDate = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];

    const now = new Date();

    const dayName = days[now.getUTCDay()];
    const day = String(now.getUTCDate()).padStart(2, "0");
    const month = months[now.getUTCMonth()];
    const year = now.getUTCFullYear();

    const hours = String(now.getUTCHours()).padStart(2, "0");
    const minutes = String(now.getUTCMinutes()).padStart(2, "0");
    const seconds = String(now.getUTCSeconds()).padStart(2, "0");

    return `${dayName}, ${day} ${month} ${year} ${hours}:${minutes}:${seconds} +0000`;
};

const generateSitemapAndRSS = async () => {
    // 所有葉面列出，包括首頁，文章頁，標籤頁，分類頁
    const allPage = [
        "https://emtech.cc",
        "https://emtech.cc/random",
        "https://emtech.cc/rss.xml",
        "https://emtech.cc/sitemap.xml"
    ]
        .concat(postsMeta.map((post) => `https://emtech.cc/p/${post.id}`))
        .concat(Object.keys(tags).map((tag) => `https://emtech.cc/tag/${tag}`))
        .concat(
            Object.keys(categories).map(
                (category) => `https://emtech.cc/category/${category}`
            )
        );

    await fs.writeFile(
        "dist/pages.txt",
        allPage.map((url) => encodeURI(url)).join("\n")
    );

    const today = new Date().toISOString();
    // Sitemap 生成
    const sitemapContent = postsMeta
        .map(
            (post) => ` <url>
    <loc>https://emtech.cc/p/${post.id}</loc>
  ${post.lastmod ? "<lastmod>" + new Date(post.lastmod).toISOString() + "</lastmod>" : ""}
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
        )
        .join("\n");
    await fs.writeFile(
        "dist/sitemap.xml",
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

    // RSS 生成
    const rssItems = postsMeta
        .map(
            (post) =>
                `<item>
      <title>${post.title}</title>
      <link>https://emtech.cc/p/${post.id}</link>
      <description>${post.description}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid>https://emtech.cc/p/${post.id}</guid>
      <media:thumbnail url="https://emtech.cc${post.thumbnail}" />
      ${post.htmlContent ? " <content:encoded><![CDATA[" + post.htmlContent + "]]></content:encoded>" : ""}
      <category>${post.categories}</category>
    </item>`
        )
        .join("\n");
    await fs.writeFile(
        "dist/rss.xml",
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
        <lastBuildDate>${getCurrentPubDate()}
        </lastBuildDate>
        <pubDate>${getCurrentPubDate()}</pubDate>
        <ttl>1800</ttl>
        ${rssItems}</channel></rss>`
    );
};

async function findRepresentativeColors(imagePath) {
    const { width, height } = await sharp(imagePath).metadata();
    const regions = [
        {
            left: 0,
            top: 0,
            width: Math.floor(width / 3),
            height: Math.floor(height / 3)
        },
        {
            left: Math.floor(width / 3),
            top: Math.floor(height / 3),
            width: Math.floor(width / 3),
            height: Math.floor(height / 3)
        },
        {
            left: Math.floor((2 * width) / 3),
            top: Math.floor((2 * height) / 3),
            width: Math.floor(width / 3),
            height: Math.floor(height / 3)
        }
    ];

    const colors = await Promise.all(
        regions.map(async (region) => {
            const { data } = await sharp(imagePath)
                .extract(region)
                .raw()
                .ensureAlpha()
                .toBuffer({ resolveWithObject: true });

            const pixelCount = data.length / 4;
            const sampleSize = Math.min(10, pixelCount);
            const colorFreq = {};

            for (let i = 0; i < sampleSize; i++) {
                const idx = i * 4;
                const color =
                    "#" +
                    [0, 1, 2]
                        .map((j) => data[idx + j].toString(16).padStart(2, "0"))
                        .join("");
                colorFreq[color] = (colorFreq[color] || 0) + 1;
            }

            return Object.entries(colorFreq).sort((a, b) => b[1] - a[1])[0][0];
        })
    );

    return [colors, [width, height]];
}

(async () => {
    console.log(
        "\x1b[33m%s\x1b[0m",
        `  
         ##         
        ####        
 ######      ###### 
  ######    ######  
    #### ## ####    
    #   #  #   #    
  ####  ####  ####  
 ################## 
        ####        
         ##                                                                
`
    );
    log("message", "emtech Site Generator");
    log("info", "Generating site...");
    console.time("Execution Time");
    log("info", "Initializing dist folder...");
    if (!skipPost) await initDist();
    log("info", "Preparing site...");
    await Promise.all([generatePartials(), copyStatic()]);
    log("info", "Processing posts...");
    if (!skipPost) {
        await processPosts();
        log("info", "Generating sitemap and RSS...");
        await generateSitemapAndRSS();
        console.table(analyze);
    }
    log("success", "Site generated successfully!");
    console.timeEnd("Execution Time");
})();
