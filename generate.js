const fs = require("fs");
const path = require("path");
const markdownIt = require("markdown-it");
const hljs = require("highlight.js");

// Markdown-it 設定
const md = markdownIt({
    highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (__) {}
        }
        return ""; // use external default escaping
    }
});

// 清空並建立 dist 資料夾
function initDist() {
    if (fs.existsSync("dist")) {
        fs.rmSync("dist", { recursive: true });
    }
    fs.mkdirSync("dist");
    fs.mkdirSync("dist/static");
}

// 複製靜態資源
function copyStatic() {
    fs.cpSync("static", "dist/static", { recursive: true });
    fs.copyFileSync("view/pages/home.html", "dist/index.html");
    fs.cpSync("public", "dist", { recursive: true });
    const viewFiles = fs
        .readdirSync("view/pages")
        .filter((file) => file.endsWith(".html"));
    console.log("➤ Found view files: ", viewFiles);
    viewFiles.forEach((file) => {
        const dirName = path.basename(file, ".html");
        fs.mkdirSync(`dist/${dirName}`, { recursive: true });
        fs.copyFileSync(`view/pages/${file}`, `dist/${dirName}/index.html`);
    });
}

// 讀取文章並生成 HTML 和 JSON
function processPosts() {
    const postsDir = "post";
    const postsMeta = [];

    const postFolders = fs
        .readdirSync(postsDir)
        .filter((folder) =>
            fs.lstatSync(path.join(postsDir, folder)).isDirectory()
        );

    postFolders.forEach((postID) => {
        const postPath = path.join(postsDir, postID);
        const markdownFile = path.join(postPath, "index.md");

        if (fs.existsSync(markdownFile)) {
            const markdownContent = fs.readFileSync(markdownFile, "utf8");
            const postMeta = extractFrontMatter(markdownContent);
            const htmlContent = md.render(
                markdownContent.replace(/^---[\s\S]+---/, "")
            ); // 移除 front matter

            const postMetaObj = {
                ...postMeta,
                id: postID,
                title: postMeta.title || "無標題文章",
                thumbnail:
                    postMeta.thumbnail ||
                    (fs.existsSync(path.join(postPath, "thumbnail.webp"))
                        ? "thumbnail.webp"
                        : "")
            };
            postsMeta.push(postMetaObj);

            // 生成完整的 HTML 頁面
            const fullPostHtml = fs
                .readFileSync("views/pages/post.html", "utf8")
                .replace("{{title}}", postMetaObj.title)
                .replace("{{content}}", htmlContent);
            fs.mkdirSync(`dist/posts/${postID}`, { recursive: true });
            fs.writeFileSync(`dist/posts/${postID}/index.html`, fullPostHtml);

            // 生成乾淨的內容頁面
            // const cleanPostHtml = fs.readFileSync('views/pages/clean.html', 'utf8')
            //   .replace('{{content}}', htmlContent);
            const cleanPostHtml = htmlContent;
            fs.writeFileSync(`dist/posts/clean/${postID}.html`, cleanPostHtml);

            // 複製文章內的圖片等資源
            fs.cpSync(postPath, `dist/static/${postID}`, {
                recursive: true,
                filter: (src) => src !== markdownFile
            });
        }
    });

    // 輸出 posts.json 和每篇文章的 json
    fs.mkdirSync("dist/posts/meta", { recursive: true });
    fs.writeFileSync(
        "dist/posts/meta/posts.json",
        JSON.stringify(postsMeta, null, 2)
    );
    postsMeta.forEach((post) => {
        fs.writeFileSync(
            `dist/posts/meta/${post.id}.json`,
            JSON.stringify(post, null, 2)
        );
    });

    // 生成 tags 和 categories 的 json
    generateTagsAndCategories(postsMeta);
}

// 提取 front matter
function extractFrontMatter(content) {
    const frontMatterMatch = content.match(/---[\s\S]+?---/);
    if (frontMatterMatch) {
        const frontMatter = frontMatterMatch[0];
        const lines = frontMatter.split("\n").slice(1, -1); // 去掉 '---'
        const meta = {};
        lines.forEach((line) => {
            const [key, value] = line.split(":");
            meta[key.trim()] = eval(value.trim()); // 轉換為陣列或字串
        });
        return meta;
    }
    return {};
}

// 生成 tags 和 categories 的 json 檔
function generateTagsAndCategories(postsMeta) {
    const tagsMap = {};
    const categoriesMap = {};

    postsMeta.forEach((post) => {
        post.tags.forEach((tag) => {
            if (!tagsMap[tag]) tagsMap[tag] = [];
            tagsMap[tag].push(post);
        });

        post.categories.forEach((category) => {
            if (!categoriesMap[category]) categoriesMap[category] = [];
            categoriesMap[category].push(post);
        });
    });

    // 輸出 tags 和 categories
    fs.mkdirSync("dist/meta/tags", { recursive: true });
    fs.mkdirSync("dist/meta/categories", { recursive: true });

    for (const [tag, posts] of Object.entries(tagsMap)) {
        fs.writeFileSync(
            `dist/meta/tags/${tag}.json`,
            JSON.stringify(posts, null, 2)
        );
    }

    for (const [category, posts] of Object.entries(categoriesMap)) {
        fs.writeFileSync(
            `dist/meta/categories/${category}.json`,
            JSON.stringify(posts, null, 2)
        );
    }
}

// Sitemap 和 RSS 生成
function generateSitemapAndRSS(postsMeta) {
    const sitemapContent = postsMeta
        .map((post) => `<url><loc>/posts/${post.id}/index.html</loc></url>`)
        .join("\n");
    fs.writeFileSync("dist/sitemap.xml", `<urlset>${sitemapContent}</urlset>`);

    // 簡單 RSS 生成
    const rssItems = postsMeta
        .map(
            (post) =>
                `<item><title>${post.title}</title><link>/posts/${post.id}/</link></item>`
        )
        .join("\n");
    fs.writeFileSync(
        "dist/rss.xml",
        `<rss><channel>${rssItems}</channel></rss>`
    );
}

// 主程式流程
function generateSite() {
    console.log("Generating site...");
    initDist();
    console.log("Copying static files...");
    copyStatic();
    console.log("Processing posts...");
    processPosts();
    console.log("Generating sitemap and RSS...");
    generateSitemapAndRSS();
    console.log("Site generated!");
}

generateSite();
