# emtech
毛哥EM資訊密技

<https://emtech.cc>

![](demo.png)

```bash
npm init -y
npm install fs-extra markdown-it
```


在專案根目錄下，確保你已經有以下結構：

```plaintext
/static                // 靜態資源目錄
/views                 // HTML 模板和 partials
/public                // 公開資源
/posts                 // 文章 markdown 檔案
  └ /{postID}          // 每篇文章獨立資料夾，裡面包含 index.md 和圖片等
dist/                  // 最後輸出的資料夾
generate.js            // 生成器程式
```

# 靜態網頁生成器

我想要自己撰寫我的靜態 SPA 網頁生成器。輸出在 dist 資料夾。他會執行以下幾個步驟：

使用 Node.js 來處理，搭配 markdown-it 來解析 markdown，fs 來讀取檔案，以及 highlight.js 來處理程式碼高亮。
## 靜態資源處理

1. 刪除 dist 資料夾
2. 建立 dist 資料夾
3. 建立 dist/static 資料夾
4. 讀取 static 資料夾的檔案，複製到 dist 中的 static 資料夾
5. 複製 index.html 到 dist 中
6. 複製 /view/pages/*.html 到 dist 中的 /$1/index.html
7. 複製 /public/ 下的所有檔案到 dist 的根目錄

## 文章列表生成


1. 讀取 /posts/ 下的所有資料夾，每個資料夾都是一篇文章。我會讀取這些資料夾中的 index.md，然後轉換成 HTML。

在 `index.md` 的最上面會有以下設定：

```markdown
---
authors: elvismao
tags: [HTML, CSS, JS]
categories: ["不用庫 也能酷 - 玩轉 CSS & Js 特效"]
date: 2023-09-15
---
```

請以 json 格式輸出：

```json
[
  {
    "authors": "elvismao",
    "tags": ["HTML", "CSS", "JS"],
    "categories": ["不用庫 也能酷 - 玩轉 CSS & Js 特效"],
    "date": "2023-09-15",
    "title": "Day1 相見歡 - 庫就不酷嗎？",
    "id": "2023ironman-1",
    "thumbnail": "thumbnail.webp"
  }
]
```

如果沒有指定 `thumbnail`，如果目錄底下有 `thumbnail.webp` 就使用它。

同時要支援 Admonitions。透過 markdown-it-container 插件來處理 Admonitions 並自訂樣式

```markdown
:::note

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::

:::tip

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::

:::info

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::

:::warning

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::

:::danger

Some **content** with _Markdown_ `syntax`. Check [this `api`](#).

:::
```

並且可以設定標題

```markdown
:::note[Your Title **with** some _Markdown_ `syntax`!]

Some **content** with some _Markdown_ `syntax`.

:::
```

這個物件請複製到以下幾個地方：

1. dist/posts/meta/posts.json
2. dist/posts/meta/{id}.json

以及根據 tags 和 categories 生成以下幾個檔案：

1. dist/meta/tags/{tag}.json
2. dist/meta/categories/{categories}.json

使用 reduce 或其他函數來有效生成基於 tags、categories 的 json 資料，但每個 json 都應該要保留文章的 id、title、date、thumbnail、authors、tags、categories。

我們需要生成兩份 HTML，一份是 /posts/{postID}/index.html，另一份是 /posts/clean/{postID}.html。前者是完整的文章頁面，後者是只有文章內容的頁面，不包含 header 和 footer。完整的頁面會將剛才 json 中的資料注入到 /views/pages/post.html 中 (如 {{title}})，文章內文注入到 {{content}} 中。而 clean 頁面則會將文章內文注入到 /views/pages/clean.html 中。
放到 dist 中的 /posts/clean/{id}.html 下。

## 處理文章圖片

將 /post/{id}/ 底下 index.md 以外的檔案複製到 dist/static/{id}/ 底下


## 靜態網頁生成

最後是靜態網頁生成的部分。/views/pages/*.hmtl 下的所有檔案都會被複製到 dist 中的 /{id}/index.html，/views/pages/index.html 會被複製到 dist/index.html。

## 渲染 partials

將 /dist/posts/*.html、/views/pages/index.html、以及 /dist/{id}/index.html 中的 partials 都渲染出來。例如：

```html
{{header}}
```

會被替換成 /views/partials/header.html 的內容。

## 生成 sitemap

* SEO 相關處理：自動生成 sitemap。
* RSS Feed：自動生成 RSS feed 讓使用者能夠訂閱更新。