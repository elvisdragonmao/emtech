---
authors: elvismao
tags: [Astro, Cloudflare, 自製, 關於]
categories: [軟體開發]
date: 2026-05-13
description: 用 Astro 重寫了一次，新增課程系統和留言系統，架構更清晰，維護更方便。
draft: true
---

# 毛哥EM資訊密技 2026：用 Astro

毛哥EM資訊密技 2026 版不再是一個只有文章列表和文章頁的手刻部落格，而是一套用 Astro、Cloudflare Workers、D1 和 Pagefind 組起來的內容平台。

如果說上一代 [emblog](/p/emblog/) 是「我想知道一個部落格生成器到底能不能自己寫」，那這一代比較像是「我真的想把這個網站長期養下去」。前者很浪漫，所有 UI、路由、Markdown 轉換、互動和生成流程都自己來；後者比較務實，把該交給成熟工具的地方交出去，然後把時間花在內容體驗、課程架構、留言系統和維護性上。

簡單講，這次不是換皮，是整個地基重新打掉。

## 從自製框架到 Astro

舊版 emblog 是我自己用 Node.js 寫的靜態部落格生成器。它很輕、很快，也有很多奇怪但我很喜歡的小細節，像文章轉場、往下滑接續下一篇、圖片主色背景、右側目錄和近期瀏覽。

但自己寫框架有一個問題：一開始每個功能都很爽，後來每個功能都變成維護成本。

Markdown 要處理、圖片要處理、路由要處理、SEO 要處理、搜尋要處理、文章資料格式要處理。這些東西不是不能自己寫，而是當網站文章越來越多、內容型態越來越複雜時，我會一直被基礎設施拖住。

所以 2026 版改成 Astro。

Astro 的好處很直接：它本來就適合內容網站。文章在 `apps/blog/src/content/post`，課程在 `apps/blog/src/content/course`，每篇內容仍然是 Markdown，但資料 schema、靜態路由、渲染流程和 build 都交給 Astro Content Collections 管。

現在一篇文章就是一個資料夾：

```txt
apps/blog/src/content/post/my-post/
├── index.md
└── thumbnail.webp
```

圖片可以跟文章放在一起，縮圖也可以被 build-time glob 找到，不需要再用一堆手寫規則去猜檔案在哪。Frontmatter 也有 schema，日期、標籤、分類、草稿狀態和 description 都會被統一整理。

這聽起來很普通，但對一個長期寫文章的人來說很重要。因為我不想每次寫文前都先跟自己的架構打架。

## Monorepo：前台、留言、共用邏輯分開

新的 repo 是 pnpm workspace：

```txt
apps/
├── blog
└── comments-worker

packages/
└── comments-shared
```

`apps/blog` 是 Astro 靜態網站，負責首頁、文章、課程、搜尋和前端互動。

`apps/comments-worker` 是 Cloudflare Worker，專門處理留言 API、GitHub OAuth、審核、D1 資料庫、Turnstile 驗證、速率限制和 Discord 通知。

`packages/comments-shared` 放前後端都會用到的共用邏輯，例如留言型別、Email hash、Gravatar URL、HTML escape、留言清理和簡單 spam 判斷。

我很喜歡這個切法。部落格本體可以維持靜態輸出，留言這種需要動態資料的東西就交給 Worker。前台不需要變成一台傳統 server，API 也不需要塞進 Astro 裡面互相牽制。

> [!NOTE]
> 這代表網站大部分頁面都可以用靜態檔案的方式服務，只有留言、登入、審核這些真的需要狀態的功能才會打 API。

## 首頁變成內容入口

新版首頁不再只是「最新文章列表」。

最上面是網站主視覺、文章數、課程數、網站活了多久，旁邊會抓最新兩篇文章做精選入口。往下才是文章 archive、課程預覽、特殊頁面和關於卡片。

文章列表也比舊版清楚很多。現在有：

- 精選文章
- 分類切換
- 標籤雲
- 載入更多
- URL query 篩選
- 滾動出現動畫

以前首頁比較像一個很有個性的展示櫃，現在比較像真的可以拿來找東西的內容索引。

這是我這次很在意的地方。部落格不是只有新文章重要，很多舊文章其實也有價值。如果首頁只照時間排序，舊文很快就被埋掉；新版用分類、標籤和精選邏輯把它們重新拉回來。

## 搜尋終於變成能用的搜尋

新版搜尋用 Pagefind。

這個選擇很合理：網站還是靜態的，但 build 完會產生搜尋索引。前端在使用者打開搜尋時才載入 Pagefind，不需要一進網站就下載一大包搜尋資料。

搜尋支援文章和課程內文，也會顯示類型、日期、標題和摘要。快捷鍵也有做：`/` 或 `Ctrl/Command + K` 都可以打開搜尋。

舊版搜尋比較像是我自己硬刻出來的功能，新版就是真的比較接近一個內容網站該有的搜尋體驗。

## 文章頁：保留手感，但結構更穩

文章頁保留了很多我喜歡的設計方向：大標題、標籤、metadata、目錄、TL;DR、上一篇下一篇、相關文章、留言區和關於卡片。

但實作上乾淨很多。

文章會從 Markdown heading 自動拿標題，從 frontmatter 拿 description，並計算閱讀時間和字數。右側目錄會追蹤目前閱讀位置，程式碼區塊會自動加上語言標籤和複製按鈕，圖片 alt 文字會變成 figcaption。

Markdown 也多了幾個 rehype plugin：

- `rehype-callouts`：把 GitHub-style alert 轉成漂亮的 callout
- `rehype-code-blocks`：包裝 code block、加 toolbar、加複製按鈕
- `rehype-image-captions`：替圖片補 lazy loading 和 caption

這種做法比在每篇文章裡面手動寫 HTML 舒服太多。文章作者只要寫 Markdown，渲染細節由網站處理。

## 課程系統

這次最像「內容平台」的功能是課程。

文章是一篇一篇分散的，課程則是有順序、有章節、有進度的系列內容。每個課程有自己的 `course.json`，裡面定義標題、描述、縮圖、排序、重點成果和章節順序。每個 lesson 一樣是 Markdown。

課程頁會產生：

- 課程 overview
- outcomes
- 模組列表
- 每章閱讀時間
- 上一章 / 下一章
- 回課程首頁
- 側邊章節導覽
- 閱讀完成進度

閱讀完成是存在 localStorage，不需要帳號。讀者看到一章底部時，網站會記錄這章已完成，側邊欄也會出現完成符號。

這是以前 emblog 很難自然支援的內容型態。舊版架構的核心假設是「每個東西都是文章」，新版則可以同時支援單篇文章和系列課程。

## 留言系統：自己做，但不要塞進前端

留言區是這次另一個大工程。

我沒有直接用第三方留言服務，而是做了一個 `comments-worker`。它跑在 Cloudflare Workers，上面接 D1 資料庫。

功能包含：

- 匿名留言
- 顯示名稱留言
- Email Gravatar 頭像
- GitHub 登入留言
- 巢狀回覆
- Turnstile 防機器人
- IP hash 和 User-Agent hash
- 速率限制
- spam 判斷
- 管理員審核
- Discord 新留言通知

這樣前台仍然是靜態網站，但留言是完整的動態功能。登入狀態用 Worker API 查，留言列表也是依照目前頁面路徑讀 D1。匿名留言還是可以用，想要 GitHub 驗證也可以登入。

我最喜歡的地方是資料和權限被收在 API 裡。前台只管呈現，Worker 才管資料庫、session、審核和通知。這比把所有東西混在同一個 app 裡更好維護。

## Cloudflare 部署

新版部署也更清楚。

`apps/blog` build 出靜態檔後，用 Cloudflare Workers assets 服務。`wrangler.jsonc` 裡面設定了 trailing slash、404 page 和 observability。

留言 API 則是獨立 Worker，綁定到 `api.emtech.cc`，資料存在 D1。這個拆分讓網站本體和 API 可以各自部署、各自觀測、各自擴充。

對讀者來說感覺不到這些差異，因為頁面就是很快打開。但對維護者來說差很多：前台壞了不一定影響留言 API，留言 API 改版也不需要重新思考整個網站架構。

## 還有一些我覺得很酷的小地方

新版還有很多小細節不是首頁一眼會看到，但我自己很喜歡。

例如全站 layout 裡用了 Astro 的 ClientRouter，換頁時前端互動可以透過 `pageLifecycle` 重新掛載和清理，不會因為 view transition 或局部導航讓事件監聽越疊越多。

文章頁的程式碼複製有 fallback。能用 Clipboard API 就用，不能用就退回 textarea + `execCommand`。這種小東西平常不會被注意到，但真的出問題時很煩，所以我寧願先處理。

搜尋視窗有 focus trap、Esc 關閉、點背景關閉、快捷鍵開啟。目錄會依照 scroll 更新 active 狀態。課程側邊欄在桌面是 sticky，在手機會變成可收合的章節選單。

這些都不是什麼革命性功能，但它們加起來會讓網站比較像一個真的有人在使用的工具，而不是單純的靜態頁面。

## 新架構的優點

最大的優點是責任變清楚了。

Astro 負責內容網站該負責的事情：Markdown、路由、靜態輸出、內容 schema、頁面組件。

Cloudflare Workers 負責動態 API：留言、登入、審核、通知、資料庫。

Pagefind 負責靜態搜尋。

pnpm workspace 負責把前台、Worker 和共用套件放在同一個 repo 裡，但不要混成一坨。

我自己只需要專心做這個網站真正獨特的地方：內容架構、視覺語言、互動體驗和寫文章。

這比「所有東西都自己寫」少了一點浪漫，但多了很多可以長期維護的空間。

## 結語

emblog 對我來說是一個很重要的版本，因為它證明我可以從零開始做出自己的部落格生成器。

但毛哥EM資訊密技 2026 版代表另一件事：我不只是想做一個很酷的部落格框架，我想要一個能一直寫、一直改、一直加功能的內容平台。

所以這次我把底層換成 Astro，把動態功能拆到 Cloudflare Workers，把留言資料放進 D1，把搜尋交給 Pagefind，把課程和文章都納入同一套內容系統。

結果就是：它還是毛哥EM資訊密技，但地基終於比較像 2026 年的網站了。
