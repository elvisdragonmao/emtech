---
authors: elvismao
tags: [emblog, 自製]
categories: [軟體分享, 精選]
date: 2024-10-16
description: emblog 是一個十分特別且強大的部落格框架，專為毛哥EM資訊密技設計。可以在幾秒內生成出漂亮的靜態單頁式部落格。
---

# emblog - 一個不一樣的部落格生成器

emblog 是一個十分特別且強大的部落格框架，專為毛哥 EM 資訊密技設計。可以在幾秒內生成出漂亮的靜態單頁式部落格。

## 背景

> 我看著 天真的我自己  
> 出現在 沒有我的故事裡  
> 等待著 我的回應  
> 一個為何至此 的原因  
> ——草東沒有派對《山海》

毛哥 EM 資訊密技從我國二開始一直是使用 Hugo 作為部落格框架。搭配 GitHub Pages 使用 [Hugo Clarity](https://github.com/chipzoller/hugo-clarity) 主題進行部屬。雖然 Hugo 本身是一個很穩很快的部落格生成器，但 Hugo Clarity 用久了發現有蠻多小問題的。除了有些頁面看起來很詭異以外很多問題是圍繞在中文編碼問題導致 SiteMap 跟搜尋功能會有問題。

![網站使用者體驗核心指標](google.webp)

我希望我的部落格能夠不一樣。而如果要創建一個符合我要求 Hugo 主題基本上裡面的核心都會需要被我動大刀。想說部落格生成器不就是 markdown 轉 HTML 套進模板而已嗎？所以我就天真的決定自己動手做一個部落格框架。前後從構思到開發大概花了一年的時間（實際開發大概花了一個月。）

![Figma 設計](image.png)

emblog 是基於 Node.js，除了使用 `markdown-it` 進行基本的 Markdown 解析，`highlight.js` 處理程式碼語法高亮這幾個自己就算花時間做也不一定做的好的函式庫以外不使用任何框架。整個 UI 和 SPA 都是自己手工設計，維持 emblog 的輕量級和高效性。

本來想要藉機學學 Go 語言，但考慮到學習的週期以及

## 特點

emblog 的每一個細節從頁面轉場動畫、像抖音一樣的內容懶加載、細心的 SEO 優化、到 RSS Feed 都是經過精心設計的，以確保最終生成的部落格具有最佳的性能和使用體驗。有一些功能因為時間關係還沒有實現，但我會持續更新，也歡迎各位透過 [GitHub](https://github.com/Edit-Mr/emtech) 向我反饋意見。

emblog 你只需要簡單逛一下就會發現它其實只有兩個頁面，一個首頁和一個文章頁。~~絕對不是因為其他頁懶得做~~。讓我們從首頁開始講起。

此工具利

以下是 emblog 的主要特點：

-   **Markdown 轉 HTML**：自動將 Markdown 檔案轉換為結構化的 HTML 頁面，並包含 SEO 所需的中繼資料。
-   **靜態資源處理**：將靜態檔案和資源複製到最終的發佈資料夾中。
-   **SEO 優化**：支援網站地圖生成和結構化資料，提升搜尋引擎的索引效果。
-   **頁面轉場動畫**：提供頁面之間流暢的過渡動畫，增強使用者體驗。
-   **懶加載技術**：優化內容的載入速度，提升網站性能。
-   **RSS 訂閱**：自動生成 RSS 訂閱功能，讓使用者可以即時獲取更新。

## 主要功能

當你執行 `yarn build` 時，emblog 會執行以下步驟：

## 專案結構

```plaintext
/emblog                // 生成器與預覽環境
/static                // 靜態資源，如 CSS、JavaScript、圖片
/views                 // HTML 模板和 partials
/public                // 公開資源，如 favicon、外部資源
/posts                 // 存放文章的資料夾，每篇文章有自己的資料夾，內含 markdown 和圖片
  └ /{postID}          // 每篇文章對應一個資料夾，內含 index.md 和相關資源
/dist                  // 最後輸出的靜態網站資料夾
```

## 運作流程

靜態生成器依照以下步驟執行：

### 1. 靜態資源處理

-   刪除舊的 `dist/` 資料夾（若存在），確保乾淨的生成環境。
-   建立新的 `dist/` 資料夾，並將 `/static` 中的資源複製到 `dist/static` 目錄。
-   複製 `/views/pages/index.html` 到 `dist/index.html`。
-   將 `/views/pages/*.html` 中的所有檔案複製到 `dist/{id}/index.html` 中。
-   將 `/public` 資料夾下的所有資源複製到 `dist/` 根目錄。

### 2. 文章生成

-   讀取每篇文章的資料夾 `/posts/{postID}`，將 `index.md` 轉換為 HTML。
-   從 markdown 前言中提取文章的中繼資料：
    `yaml
    ---
    authors: elvismao
    tags: [HTML, CSS, JS]
    categories: [不用庫 也能酷 - 玩轉 CSS & Js 特效]
thumbnail: /static/2023ironman-1/thumbnail.webp
    date: 2023-09-15
    ---
    `
-   若未指定 `thumbnail`，生成器會自動尋找該資料夾內的 `thumbnail.webp` 作為預設縮圖。
-   輸出文章的中繼資料至 JSON 格式：
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
-   生成器會將該資料輸出到兩個位置：
    -   `dist/posts/meta/posts.json`
    -   `dist/posts/meta/{id}.json`

### 3. 標籤與分類處理

-   根據標籤 (tags) 和分類 (categories) 生成相對應的 JSON 檔案，內容包含對應文章的基本資料：
    -   `dist/meta/tags/{tag}.json`
    -   `dist/meta/categories/{category}.json`

每個 JSON 檔案將包含 `id`、`title`、`date`、`thumbnail`、`authors`、`tags`、`categories` 等文章的關鍵資訊。

### 4. HTML 渲染

-   每篇文章會生成兩個 HTML 頁面：
    1. **完整文章頁**：將文章的中繼資料和內容注入 `/views/pages/post.html` 模板，輸出到 `dist/posts/{postID}/index.html`。
    2. **乾淨文章頁**：僅包含文章內容，沒有 header 和 footer，注入 `/views/pages/clean.html` 模板，輸出到 `dist/posts/clean/{postID}.html`。

### 5. 處理文章圖片

-   將 `/posts/{id}/` 資料夾內，除了 `index.md` 之外的所有檔案，複製到 `dist/static/{id}/`，確保文章相關的圖片和資源可供使用。

### 6. 渲染部分模板 (Partials)

-   生成器會解析並替換 HTML 模板中的部分片段 (partials)。
    -   例如：`{{header}}` 會被 `/views/partials/header.html` 的內容替換。

### 7. 生成 Sitemap

-   自動生成 `sitemap.xml` 檔案，並儲存到 `dist/` 資料夾中，以提升搜尋引擎的索引效率。

### 8. 生成 RSS 訂閱

-   根據已生成的文章自動生成 RSS Feed，讓使用者可以訂閱更新。

## 使用方法

1. 確保你已安裝 Node.js。
2. 執行 `yarn` 來安裝所需的依賴包。
3. 執行 `yarn build` 來生成靜態網站。
4. 最終的靜態網站將生成在 `dist/` 資料夾中。

## 版權

emblog 目前不管是從設計到裡面的核心皆是是為毛哥 EM 資訊密技設計，缺少許多自訂功能，所以目前尚未對外開放對外使用。不過所有程式碼皆以 Apache 2.0 授權條款釋出，歡迎自行修改使用。等我之後有空應該會做成能讓大家使用的部落格生成器。歡迎關注我的 [GitHub](https://github.com/Edit-Mr/emtech) 以獲取最新消息。
