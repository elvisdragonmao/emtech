const fs = require("fs");
const path = require("path");
const markdownIt = require("markdown-it");
const hljs = require("highlight.js");
let postsMeta = [];
// Updated Markdown-it setup with new highlight.js API
const md = markdownIt({
    highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, { language: lang }).value;
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
    fs.mkdirSync("dist/posts");
    fs.mkdirSync("dist/posts/clean");
    fs.mkdirSync("dist/posts/meta", { recursive: true });
    fs.mkdirSync("dist/meta/tags", { recursive: true });
    fs.mkdirSync("dist/meta/categories", { recursive: true });
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

    const postFolders = fs
        .readdirSync(postsDir)
        .filter((folder) =>
            fs.lstatSync(path.join(postsDir, folder)).isDirectory()
        );

    postFolders.forEach((postID) => {
        const postPath = path.join(postsDir, postID);
        const markdownFile = path.join(postPath, "index.md");

        if (fs.existsSync(markdownFile)) {
            console.log(`➤ Processing post: ${postID}`);
            const markdownContent = fs.readFileSync(markdownFile, "utf8");
            const postMeta = extractFrontMatter(markdownContent);
            let htmlContent = md.render(
                markdownContent.replace(/---[\s\S]+?---/, "")
            ); // 移除 front matter，但不要移除文章中的分段符號
            // 找到第一行的 h1 標題

            // 如果沒有 title，則從文章內容中找到第一個 h1 標題

            if (!postMeta.title) {
                postMeta.title = htmlContent.match(/<h1>(.*?)<\/h1>/)[1];
            }
            console.log(postMeta.title);
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
                .readFileSync("view/pages/post.html", "utf8")
                .replace("{{title}}", postMetaObj.title)
                .replace("{{content}}", htmlContent);
            fs.mkdirSync(`dist/posts/${postID}`, { recursive: true });
            fs.writeFileSync(`dist/posts/${postID}/index.html`, fullPostHtml);

            // 生成乾淨的內容頁面
            // const cleanPostHtml = fs.readFileSync('view/pages/clean.html', 'utf8')
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
    postsMeta.forEach((post) => {
        console.log(post);
        if (post.tags)
            post.tags.forEach((tag) => {
                if (!tagsMap[tag]) tagsMap[tag] = [];
                tagsMap[tag].push(post);
            });
        if (post.categories)
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
function generateSitemapAndRSS() {
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
    initDist();
    console.log("\x1b[34m%s\x1b[0m", "➤ Copying static files...");
    copyStatic();
    console.log("\x1b[34m%s\x1b[0m", "➤ Processing posts...");
    processPosts();
    console.log("\x1b[34m%s\x1b[0m", "➤ Generating sitemap and RSS...");
    generateSitemapAndRSS();
    console.log("\x1b[35m%s\x1b[0m", "➤ Site generated!");
}

generateSite();
