const fs = require("fs");
const path = require("path");
const markdownIt = require("markdown-it");
const hljs = require("highlight.js");
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
    // typographer: true,
    // quotes: '「」‘’“”',
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
}

// 讀取文章並生成 HTML 和 JSON
function processPosts() {
    const postsDir = "post";

    const postFolders = fs
        .readdirSync(postsDir)
        .filter((folder) =>
            fs.lstatSync(path.join(postsDir, folder)).isDirectory()
        );

    const postHTML = renderPartials(
        fs.readFileSync("view/pages/post.html", "utf8")
    );

    postFolders.forEach((postID) => {
        const postPath = path.join(postsDir, postID);
        const markdownFile = path.join(postPath, "index.md");
        if (fs.existsSync(markdownFile)) {
            console.log(`➤ Processing post: ${postID}`);
            let markdownContent = fs
                .readFileSync(markdownFile, "utf8")
                .replace(/<!--[\s\S]+?-->/g, "");
            const postMeta = extractFrontMatter(markdownContent);
            // turn image url if not set path like ![](image.webp) to ![](/static/postID/image.webp)
            // don't change url if absolute path or relative path like /static/image.webp or ../image.webp or https://image.webp
            markdownContent = markdownContent.replace(
                /!\[(.*?)\]\((?!\/|http)(.*?)\)/g,
                `![](/static/${postID}/$2)`
            );
            let htmlContent = md.render(
                markdownContent.replace(/---[\s\S]+?---/, "")
            );

            if (!postMeta.title) {
                postMeta.title = htmlContent.match(/<h1>(.*?)<\/h1>/)[1];
                // remove the first h1 tag
                htmlContent = htmlContent.replace(/<h1>.*?<\/h1>/, "");
            }

            // get description from the first paragraph of the post
            if (!postMeta.description)
                postMeta.description = htmlContent.match(/<p>(.*?)<\/p>/)[1];

            const postMetaObj = {
                ...postMeta,
                id: postID,
                title: postMeta.title || "無標題文章",
                description: postMeta.description || "無描述",
                thumbnail:
                    postMeta.thumbnail ||
                    (fs.existsSync(path.join(postPath, "thumbnail.webp"))
                        ? "thumbnail.webp"
                        : "")
            };
            postsMeta.push(postMetaObj);

            // 生成完整的 HTML 頁面
            const fullPostHtml = renderPartials(
                postHTML
                    .replaceAll("{{title}}", postMetaObj.title)
                    .replaceAll("{{content}}", htmlContent)
            );
            fs.mkdirSync(`dist/posts/${postID}`, { recursive: true });
            fs.writeFileSync(`dist/posts/${postID}/index.html`, fullPostHtml);

            // 生成乾淨的內容頁面
            // const cleanPostHtml = fs.readFileSync('view/pages/clean.html', 'utf8')
            //   .replace('{{content}}', htmlContent);
            const cleanPostHtml = htmlContent;
            fs.writeFileSync(`dist/posts/clean/${postID}.html`, cleanPostHtml);
            console.log(markdownFile);
            // 複製文章內的圖片等資源
            fs.cpSync(postPath, `dist/static/${postID}`, {
                recursive: true,
                filter: (src) => {
                    return (
                        src.split("\\").pop().split("/").pop() !== "index.md"
                    );
                }
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
    const tags = {};
    const categories = {};
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

    fs.writeFileSync(
        "dist/meta/tags.json",
        JSON.stringify({ tags, categories }, null, 2)
    );
    // calcalate the number of posts in each tag and category

    analyze.tags = Object.keys(tagsMap).length;
    analyze.categories = Object.keys(categoriesMap).length;
    analyze.posts = postsMeta.length;
}

// 生成 partials，go through all the .html in dist and replace {{partial}} with the content of the partial file
const partials = fs
    .readdirSync("view/partials")
    .filter((file) => file.endsWith(".html"));

// a json object to store the partials content
const partialsContent = {};

// read all the partials and store them in the partialsContent object

partials.forEach((partial) => {
    const partialContent = fs.readFileSync(`view/partials/${partial}`, "utf8");
    partialsContent[path.basename(partial, ".html")] = partialContent;
});

function renderPartials(htmlContent) {
    const partialsKeys = Object.keys(partialsContent);
    partialsKeys.forEach((partialKey) => {
        htmlContent = htmlContent.replace(
            new RegExp(`{{${partialKey}}}`, "g"),
            partialsContent[partialKey]
        );
    });
    return htmlContent;
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
    console.time("Execution Time");
    initDist();
    console.log("\x1b[34m%s\x1b[0m", "➤ Copying static files...");
    copyStatic();
    console.log("\x1b[34m%s\x1b[0m", "➤ Processing posts...");
    processPosts();
    console.log("\x1b[34m%s\x1b[0m", "➤ Generating sitemap and RSS...");
    generateSitemapAndRSS();
    console.table(analyze);
    console.log("\x1b[35m%s\x1b[0m", "➤ Site generated successfully!");
    console.timeEnd("Execution Time");
}

generateSite();
