const fs = require("fs");
const path = require("path");
const markdownIt = require("markdown-it");
const hljs = require("highlight.js");
const sharp = require("sharp");
const skipPost = 0;
const cache = false;
let analyze = {
    pages: 0,
    posts: 0,
    tags: 0,
    categories: 0
};
let postsMeta = [];
// Updated Markdown-it setup with new highlight.js API

const md = markdownIt({
    html: true,
    linkify: true,
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
function slugify(text) {
    return text
        .toString()
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(
            /[^\p{L}\p{N}\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\-_]+/gu,
            ""
        ) // Remove all non-word characters except hyphens/underscores
        .replace(/\-\-+/g, "-"); // Replace multiple hyphens with a single one
}

// Custom renderer for headings to include anchor IDs
md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const level = token.tag.slice(1); // Get the heading level (h1, h2, etc.)

    if (level == 2) {
        // Only for h2 tags
        const title = tokens[idx + 1].content; // Get the heading text content
        const slug = slugify(title); // Generate slug based on the text content

        // Add an id attribute for anchors
        token.attrPush(["id", slug]);
    }

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
    const src = token.attrs[token.attrIndex("src")][1];
    const alt = token.content || ""; // Use alt as caption
    const title = token.attrs[token.attrIndex("title")]
        ? token.attrs[token.attrIndex("title")][1]
        : "";

    // Returning a figure with img and figcaption
    return `
        <figure>
            <img src="${src}" alt="${alt}" title="${title}">
            ${alt ? "<figcaption>" + alt + "</figcaption>" : ""}
        </figure>
    `;
};

function renderPartials(htmlContent) {
    if (!htmlContent) {
        throw new Error("htmlContent is undefined or null");
    }
    const partialsKeys = Object.keys(partialsContent);
    partialsKeys.forEach((partialKey) => {
        htmlContent = htmlContent.replace(
            new RegExp(`{{${partialKey}}}`, "g"),
            partialsContent[partialKey]
        );
    });
    return htmlContent;
}

// a json object to store the partials content
const partialsContent = {};

// read all the partials and store them in the partialsContent object

const generatePartials = () => {
    const partials = fs
        .readdirSync("view/partials")
        .filter((file) => file.endsWith(".html"))
        .map((file) => file.replace(".html", ""));
    partials.forEach((partial) => {
        console.log(`➤ Reading partial: ${partial}`);
        const partialContent = fs.readFileSync(
            `view/partials/${partial}.html`,
            "utf8"
        );
        partialsContent[partial] = partialContent;
    });

    // render partial in partialsContent
    while (partials.length) {
        partials.forEach((partial) => {
            const rendered = renderPartials(partialsContent[partial]);
            if (rendered !== partialsContent[partial]) {
                partialsContent[partial] = rendered;
            } else {
                partials.splice(partials.indexOf(partial), 1);
            }
        });
    }
};
// 清空並建立 dist 資料夾
function initDist() {
    if (!cache && fs.existsSync("dist")) {
        fs.rmSync("dist", { recursive: true });
    }
    if (!fs.existsSync("dist")) {
        fs.mkdirSync("dist");
    }
    if (!fs.existsSync("dist/static")) {
        fs.mkdirSync("dist/static");
    }
    if (!fs.existsSync("dist/p")) {
        fs.mkdirSync("dist/p");
    }
    if (!fs.existsSync("dist/p/clean")) {
        fs.mkdirSync("dist/p/clean");
    }
    if (!fs.existsSync("dist/p/meta")) {
        fs.mkdirSync("dist/p/meta", { recursive: true });
    }
    if (!fs.existsSync("dist/meta/tag")) {
        fs.mkdirSync("dist/meta/tag", { recursive: true });
    }
    if (!fs.existsSync("dist/meta/category")) {
        fs.mkdirSync("dist/meta/category", { recursive: true });
    }
}

// 複製靜態資源
function copyStatic() {
    fs.cpSync("static", "dist/static", { recursive: true });
    fs.cpSync("public", "dist", { recursive: true });
    const viewFiles = fs
        .readdirSync("view/pages")
        .filter((file) => file.endsWith(".html"));
    console.log("➤ Found view files: ", viewFiles);
    viewFiles.forEach((file) => {
        const dirName = path.basename(file, ".html");
        fs.mkdirSync(`dist/${dirName}`, { recursive: true });

        // 讀取檔案內容
        let fileContent = fs.readFileSync(`view/pages/${file}`, "utf8");
        fileContent = renderPartials(fileContent);
        fs.writeFileSync(`dist/${dirName}/index.html`, fileContent);
    });
    analyze.pages = viewFiles.length;
    fs.copyFileSync("dist/home/index.html", "dist/index.html");
    fs.rmSync("dist/home", { recursive: true });
    fs.copyFileSync("dist/post/index.html", "dist/p/index.html");
    fs.rmSync("dist/post", { recursive: true });
    fs.copyFileSync("dist/404/index.html", "dist/404.html");
    fs.rmSync("dist/404", { recursive: true });
}

const replacePlaceholders = (template, replacements) =>
    Object.keys(replacements).reduce(
        (str, key) => str.replaceAll(`{{${key}}}`, replacements[key]),
        template
    );

// 讀取文章並生成 HTML 和 JSON
async function processPosts() {
    const postsDir = "post";

    const postFolders = fs
        .readdirSync(postsDir)
        .filter((folder) =>
            fs.lstatSync(path.join(postsDir, folder)).isDirectory()
        );

    const postTemplate = renderPartials(
        fs.readFileSync("view/partials/post.html", "utf8")
    );
    const postPageTemplate = renderPartials(
        fs.readFileSync("view/pages/post.html", "utf8")
    );

    for (const postID of postFolders) {
        const postPath = path.join(postsDir, postID);
        const markdownFile = path.join(postPath, "index.md");
        if (fs.existsSync(markdownFile)) {
            console.log(`➤ Processing post: ${postID}`);
            fs.cpSync(postPath, `dist/static/${postID}`, {
                recursive: true,
                filter: (src) => {
                    return (
                        src.split("\\").pop().split("/").pop() !== "index.md"
                    );
                }
            });

            let markdownContent = fs
                .readFileSync(markdownFile, "utf8")
                .replace(/<!--[\s\S]+?-->/g, "");

            let postMeta = extractFrontMatter(markdownContent);
            // turn image url if not set path like ![](image.webp) to ![](/static/postID/image.webp)
            // don't change url if absolute path or relative path like /static/image.webp or ../image.webp or https://image.webp
            markdownContent = markdownContent.replace(
                /!\[(.*?)\]\((?!\/|http)(.*?)\)/g,
                `![](/static/${postID}/$2)`
            );
            let htmlContent = md.render(
                renderPartials(markdownContent.replace(/---[\s\S]+?---/, ""))
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
                postMeta.description = htmlContent.match(/<p>(.*?)<\/p>/)[1];
            }
            const thumbnail =
                postMeta.thumbnail ||
                (fs.existsSync(path.join(postPath, "thumbnail.webp"))
                    ? `/static/${postID}/thumbnail.webp`
                    : "");
            if (
                !postMeta.colors &&
                thumbnail.includes(".") &&
                !thumbnail.includes("http")
            ) {
                // console.log("finding" + path.join("..", "dist", thumbnail));
                postMeta.colors = await findRepresentativeColors(
                    path.join("dist", thumbnail) //.replaceAll("\\", "/")
                );
            }

            const chineseCharCount = (
                markdownContent.match(/[\u4e00-\u9fa5]/g) || []
            ).length;
            const englishWordCount = (markdownContent.match(/\b\w+\b/g) || [])
                .length;
            const length = chineseCharCount + englishWordCount;
            // turn to k, if length > 1000. Fixed to 1 decimal place
            postMeta.length =
                length > 1000 ? (length / 1000).toFixed(1) + "k" : length;
            postMeta.lastUpdated = fs.statSync(markdownFile).mtime;
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
                length
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
            const replacements = {
                title: postMeta.title,
                content: htmlContent,
                tldr,
                thumbnail: thumbnail,
                length: postMeta.length,
                colors: postMeta.colors,
                readingTime: postMeta.readingTime,
                date: new Date(postMeta.date) // format of 2024-05-12
                    .toISOString()
                    .split("T")[0],
                lastUpdated: postMeta.lastUpdated,
                postTags,
                headerCategories,
                headerTags,
                postID
            };
            const fullPostHtml = replacePlaceholders(
                postTemplate,
                replacements
            );
            const fullPostPageHtml = replacePlaceholders(postPageTemplate, {
                ...replacements,
                post: fullPostHtml
            });
            fs.writeFileSync(`dist/p/clean/${postID}.html`, fullPostHtml);

            fs.mkdirSync(`dist/p/${postID}`, { recursive: true });
            fs.writeFileSync(`dist/p/${postID}/index.html`, fullPostPageHtml);
        } else console.warn(`➤ No markdown file found for post: ${postID}`);
    }

    // 輸出 posts.json 和每篇文章的 json
    fs.mkdirSync("dist/p/meta", { recursive: true });
    fs.writeFileSync(
        "dist/p/meta/posts.json",
        JSON.stringify(postsMeta, null, 2)
    );
    postsMeta.forEach((post) => {
        fs.writeFileSync(
            `dist/p/meta/${post.id}.json`,
            JSON.stringify(post, null, 2)
        );
    });

    // 生成 tags 和 categories 的 json
    generateTagsAndCategories();
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
            const [key, value] = line.split(": ");
            const trimmedKey = key.trim();
            const trimmedValue = value.trim();

            // 檢查是否為陣列格式
            if (trimmedValue.startsWith("[") && trimmedValue.endsWith("]")) {
                // 用正則表達式將每個元素加上雙引號，處理字串內容、特殊字符和空格
                const fixedValue = trimmedValue.replace(
                    /("[^"]+"|[^,\[\]\s]+(?:\s+[^,\[\]\s]+)*)/g,
                    '"$1"'
                );
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

// 生成 tags 和 categories 的 json 檔
function generateTagsAndCategories() {
    const tagsMap = {};
    const categoriesMap = {};
    const tags = {};
    const categories = {};
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
                    ? categories[category] + 1
                    : 1;
                categoriesMap[category].push(post);
            });
        search.push({
            title: post.title,
            description: post.description,
            id: post.id
        });
    });

    // 輸出 tags 和 categories
    fs.mkdirSync("dist/meta/tag", { recursive: true });
    fs.mkdirSync("dist/meta/category", { recursive: true });
    fs.writeFileSync("dist/meta/search.json", JSON.stringify(search, null, 2));

    for (const [tag, posts] of Object.entries(tagsMap)) {
        fs.writeFileSync(
            `dist/meta/tag/${tag}.json`,
            JSON.stringify(posts, null, 2)
        );
    }

    for (const [category, posts] of Object.entries(categoriesMap)) {
        fs.writeFileSync(
            `dist/meta/category/${category}.json`,
            JSON.stringify(posts, null, 2)
        );
    }

    fs.writeFileSync(
        "dist/meta/tags.json",
        JSON.stringify({ tags, categories }, null, 2)
    );
    // calcalate the number of posts in each tag and category

    analyze.tags = Object.keys(tagsMap).length;
    analyze.categories = Object.keys(categoriesMap).length;
    analyze.posts = postsMeta.length;
}

function getCurrentPubDate() {
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

    const pubDate = `${dayName}, ${day} ${month} ${year} ${hours}:${minutes}:${seconds} +0000`;

    return pubDate;
}

// Sitemap 和 RSS 生成
function generateSitemapAndRSS() {
    const today = new Date().toISOString().split("T")[0];
    const sitemapContent = postsMeta
        .map(
            (post) => ` <url>
    <loc>https://emtech.cc/p/${post.id}</loc>
    <lastmod>${new Date(post.lastUpdated).toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
        )
        .join("\n");
    fs.writeFileSync(
        "dist/sitemap.xml",
        `<?xml version="1.0" encoding="UTF-8"?>
        <?xml-stylesheet type="text/xsl" href="https://emtech.cc/style.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://emtech.cc</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${sitemapContent}</urlset>`
    );

    // RSS 生成
    const rssItems = postsMeta
        .map(
            (post) =>
                `<item>
      <title>${post.title}</title>
      <link>https://emtech.cc/p/${post.id}</link>
      <description>${post.description}</description>
      <pubDate>${new Date(post.lastUpdated).toUTCString()}</pubDate>
      <guid>https://emtech.cc/p/${post.id}</guid>
    </item>`
        )
        .join("\n");
    fs.writeFileSync(
        "dist/rss.xml",
        `<?xml version="1.0" encoding="UTF-8"?>
        <?xml-stylesheet type="text/xsl" href="/style.xsl"?>
        <rss version="2.0">
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
}

async function calculateAverageColor(imagePath, region) {
    const { width, height } = await sharp(imagePath).metadata();

    // 定義各區域
    const regions = {
        topLeft: {
            left: 0,
            top: 0,
            width: Math.floor(width / 3),
            height: Math.floor(height / 3)
        },
        center: {
            left: Math.floor(width / 3),
            top: Math.floor(height / 3),
            width: Math.floor(width / 3),
            height: Math.floor(height / 3)
        },
        bottomRight: {
            left: Math.floor((2 * width) / 3),
            top: Math.floor((2 * height) / 3),
            width: Math.floor(width / 3),
            height: Math.floor(height / 3)
        }
    };

    const regionInfo = regions[region];

    // 確認區域大小是否足夠
    const extracted = await sharp(imagePath)
        .extract(regionInfo)
        .raw()
        .ensureAlpha()
        .toBuffer({ resolveWithObject: true });

    const data = extracted.data;
    const pixelCount = data.length / 4; // 總像素數 (每個像素佔 4 個字節: RGBA)

    // 設定 sampleSize 為不超過總像素數
    const sampleSize = Math.min(10, pixelCount);

    const colors = {};

    // 取樣像素顏色
    for (let i = 0; i < sampleSize; i++) {
        const pixelIndex = i * 4; // RGBA 每個像素佔 4 個字節
        const colorKey = [0, 1, 2]
            .map((offset) =>
                data[pixelIndex + offset].toString(16).padStart(2, "0")
            )
            .join("");

        if (colors[colorKey]) {
            colors[colorKey]++;
        } else {
            colors[colorKey] = 1;
        }
    }

    // 找到最常出現的顏色
    const mostFrequentColor = Object.keys(colors).reduce((a, b) =>
        colors[a] > colors[b] ? a : b
    );
    return "#" + mostFrequentColor;
}

async function findRepresentativeColors(imagePath) {
    const topLeftColor = await calculateAverageColor(imagePath, "topLeft");
    const centerColor = await calculateAverageColor(imagePath, "center");
    const bottomRightColor = await calculateAverageColor(
        imagePath,
        "bottomRight"
    );
    return `linear-gradient(135deg, ${topLeftColor}, ${centerColor}, ${bottomRightColor})`;
    return [topLeftColor, centerColor, bottomRightColor];
    console.log(
        `<div style="width: 100px; height: 100px; background: linear-gradient(135deg, ${topLeftColor}, ${centerColor}, ${bottomRightColor});"></div>`
    );
}

// 主程式流程
async function generateSite() {
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
    console.log("\x1b[32m%s\x1b[0m", "emtech Site Generator v1.0");
    console.log("\x1b[34m%s\x1b[0m", "➤ Generating site...");
    console.time("Execution Time");
    console.log("\x1b[34m%s\x1b[0m", "➤ Reading partials...");
    generatePartials();
    console.log("\x1b[34m%s\x1b[0m", "➤ Initializing dist folder...");
    initDist();
    console.log("\x1b[34m%s\x1b[0m", "➤ Copying static files...");
    copyStatic();
    //return;
    console.log("\x1b[34m%s\x1b[0m", "➤ Processing posts...");
    if (!skipPost) {
        await processPosts();
        console.log("\x1b[34m%s\x1b[0m", "➤ Generating sitemap and RSS...");
        generateSitemapAndRSS();
        console.table(analyze);
    }
    console.log("\x1b[35m%s\x1b[0m", "➤ Site generated successfully!");
    console.timeEnd("Execution Time");
}

generateSite();
