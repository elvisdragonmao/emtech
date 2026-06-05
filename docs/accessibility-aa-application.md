# 網站無障礙標章 AA 申請自評紀錄

更新日期：2026-06-05

## 申請範圍

- 網站：毛哥EM資訊密技
- 網址：https://emtech.cc
- 程式範圍：`apps/blog`
- 建置產物：`apps/blog/dist`
- 靜態頁數：203 頁
- 標章等級：AA
- 規範來源：`/Users/em/.codex/skills/accessibility-rules`
- 規範基準：skill 由 `rule.html` 產生，含 4 原則、13 指引、78 成功準則、31 檢測碼、209 稽核評量碼。

AA 申請採 A + AA 成功準則，共 50 項；AAA 項目未列入本次標章範圍。

## 本次完成項目

- 全站版型補強可見焦點、跳到主要內容、地標、語言、頁面標題與狀態訊息。
- 修正搜尋對話框、留言表單、留言預覽、課程列表、首頁篩選與頁尾/作者連結的名稱、對比、焦點與新視窗提示。
- 新增 markdown 處理外掛，自動補 raw HTML 範例中的 iframe 標題、表單控制項名稱與內文標題階層。
- 修正 Shiki 程式碼區塊、Instagram fallback、Nord 色票、課程統計、搜尋 dialog 的 AA 對比問題。
- 將內容內頁標題階層正規化，避免文章內 `#` 與跳級標題破壞唯一主標題與文件結構。
- 修正 `nsda2025` 圖片檔名，避免 Astro 輸出無效圖片佔位。

## 自動檢測證據

以下指令均於 2026-06-05 執行。

| 檢測                           | 範圍                         | 結果                                                        |
| ------------------------------ | ---------------------------- | ----------------------------------------------------------- |
| `pnpm --filter blog typecheck` | Astro 43 個檔案              | 0 errors / 0 warnings / 0 hints                             |
| `pnpm --filter blog build`     | 203 靜態頁                   | build passed，Pagefind indexed 203 pages                    |
| Playwright DOM smoke           | 203 個 HTML                  | 無缺漏 `img[alt]`、iframe 可及名稱、表單控制項名稱、重複 id |
| axe-core WCAG A/AA             | 201 個非轉址頁               | 0 violations                                                |
| axe-core 搜尋 dialog           | 桌機與手機 viewport          | 0 violations                                                |
| axe-core 深色/手機抽樣         | 主要頁、文章、課程、embed 頁 | 0 violations                                                |

全站 axe 排除 2 個純轉址頁：`/article/`、`/course/javascript/`。這兩頁為 Astro 產生的 301 redirect fallback；結構檢查仍包含於 203 個 HTML DOM smoke。

## A+AA 自評矩陣

| 成功準則                 | 等級 | 狀態              | 佐證                                                                                                |
| ------------------------ | ---- | ----------------- | --------------------------------------------------------------------------------------------------- |
| 1.1.1 非文字內容         | A    | 已處理            | 圖片 alt 全站 smoke 通過；裝飾 logo 使用空 alt 並由連結 aria-label 命名。                           |
| 1.2.1-1.2.5 時序媒體     | A/AA | 需人工佐證        | 程式已補 iframe title；送件前需逐一確認第三方影片字幕、音訊描述或替代內容。無現場媒體者可列不適用。 |
| 1.3.1 資訊與關連性       | A    | 已處理            | 內文標題階層正規化；表單 label/aria-label、課程 h2、語意區塊修正。                                  |
| 1.3.2 有意義的序列       | A    | 已處理            | DOM smoke 與頁面結構檢查通過；未使用破壞閱讀順序的內容重排。                                        |
| 1.3.3 知覺特徵           | A    | 已處理            | 互動狀態不僅靠顏色，篩選按鈕使用 aria-pressed 與文字狀態。                                          |
| 1.3.4 螢幕方向           | AA   | 已處理            | 無鎖定螢幕方向。                                                                                    |
| 1.3.5 識別輸入目的       | AA   | 已處理            | 留言姓名/email 使用 autocomplete；搜尋與範例控制項具可及名稱。                                      |
| 1.4.1 色彩使用           | A    | 已處理            | active 狀態、焦點與連結均有非色彩語意或文字/ARIA 狀態。                                             |
| 1.4.2 音訊控制           | A    | 不適用/需人工確認 | 站內無自動播放音訊；送件抽查時確認第三方 embed 未自動播放聲音。                                     |
| 1.4.3 對比值最小         | AA   | 已處理            | 全站 axe 0 violations；程式碼 token、搜尋 dialog、Instagram fallback、色票均已修正。                |
| 1.4.4 調整文字尺寸       | AA   | 已處理            | 版面使用 responsive constraints 與相對排版；需送件截圖佐證 200% 放大。                              |
| 1.4.5 影像文字           | AA   | 已處理/需人工抽查 | 主要 UI 文字為 HTML；內容截圖若含必要文字需人工確認替代說明。                                       |
| 1.4.10 流動排版          | AA   | 已處理            | 手機 viewport axe 通過；文章、課程、搜尋 dialog 具 responsive 版面。                                |
| 1.4.11 非文字對比        | AA   | 已處理            | 焦點框、圖示、表單邊界與按鈕狀態使用足夠對比。                                                      |
| 1.4.12 文字間距          | AA   | 已處理            | 移除搜尋輸入負字距；版面未禁止使用者覆蓋文字間距。                                                  |
| 1.4.13 懸浮或焦點內容    | AA   | 已處理            | 搜尋 dialog 可 Esc 關閉、焦點管理與 focus trap 已驗證。                                             |
| 2.1.1 鍵盤               | A    | 已處理            | 導覽、搜尋、篩選、留言與複製按鈕均為原生可鍵盤操作元件。                                            |
| 2.1.2 無鍵盤操作陷阱     | A    | 已處理            | 搜尋 dialog 支援 Esc、Tab 循環與焦點還原。                                                          |
| 2.1.4 快捷鍵             | A    | 已處理            | `/`、Ctrl/Cmd+K 搜尋捷徑只在非輸入區觸發。                                                          |
| 2.2.1 計時調整           | A    | 不適用/需人工確認 | 站內無計時作答或限時流程；第三方驗證若啟用需補證。                                                  |
| 2.2.2 暫停停止隱藏       | A    | 已處理            | 動畫遵守 reduced motion；未發現不可停止的自動更新內容。                                             |
| 2.3.1 閃爍三次或低於閾值 | A    | 已處理/需人工抽查 | 無高頻閃爍 UI；影音內容需人工抽查。                                                                 |
| 2.4.1 跳過區塊           | A    | 已處理            | 全站 Layout 有 skip link 到 `#main-content`。                                                       |
| 2.4.2 網頁標題           | A    | 已處理            | 每頁 Layout 產生明確 title；axe 通過。                                                              |
| 2.4.3 焦點順序           | A    | 已處理            | 原生 DOM 順序與互動流程一致；搜尋 dialog 已驗證。                                                   |
| 2.4.4 鏈結目的           | A    | 已處理            | 重要圖示連結補 aria-label；外開連結文字/標籤含另開新視窗。                                          |
| 2.4.5 多種方式           | AA   | 已處理            | 首頁、歸檔、課程、搜尋與 sitemap/rss 提供多種抵達內容方式。                                         |
| 2.4.6 標題和標籤         | AA   | 已處理            | 課程列表 h2、文章內文標題階層、搜尋/留言 label 已修正。                                             |
| 2.4.7 焦點可視           | AA   | 已處理            | 全站可互動元件 focus-visible outline；留言與搜尋未移除 outline。                                    |
| 2.5.1 指標手勢           | A    | 已處理            | 未要求多點或路徑手勢；篩選與搜尋有單點/鍵盤操作。                                                   |
| 2.5.2 指標取消           | A    | 已處理            | 使用原生 button/link 行為。                                                                         |
| 2.5.3 標籤名稱           | A    | 已處理            | 可見文字按鈕與 aria-label 未衝突；搜尋關閉按鈕有明確名稱。                                          |
| 2.5.4 動作啟動           | A    | 不適用            | 未使用裝置動作或方向感測控制。                                                                      |
| 3.1.1 網頁語言           | A    | 已處理            | Layout 輸出 `lang="zh-Hant"`。                                                                      |
| 3.1.2 局部語言           | AA   | 需人工抽查        | 文章內英文技術詞多為名稱/程式碼；送件抽查時確認長段外語是否需 `lang`。                              |
| 3.2.1 焦點               | A    | 已處理            | 取得焦點不自動變更頁面脈絡。                                                                        |
| 3.2.2 輸入               | A    | 已處理            | 搜尋輸入只更新結果/狀態，不自動跳頁；留言送出需明確操作。                                           |
| 3.2.3 一致的導覽         | AA   | 已處理            | Header/Footer/Layout 共用。                                                                         |
| 3.2.4 一致的識別         | AA   | 已處理            | 搜尋、留言、社群、頁尾與課程元件共用命名。                                                          |
| 3.3.1 識別錯誤           | A    | 已處理            | 留言送出錯誤使用 status/alert 類訊息；需後端錯誤截圖佐證。                                          |
| 3.3.2 標籤或說明         | A    | 已處理            | 留言與搜尋欄位具 label/說明；raw HTML 範例自動補 aria-label。                                       |
| 3.3.3 錯誤建議           | AA   | 已處理/需人工佐證 | 留言錯誤訊息需在實際 API 回應狀態截圖留證。                                                         |
| 3.3.4 錯誤預防           | AA   | 不適用            | 站內無法律、財務或重大個資交易流程。                                                                |
| 4.1.1 語法分析           | A    | 已處理            | DOM smoke 無重複 id；Astro build/typecheck 通過。                                                   |
| 4.1.2 名稱角色和值       | A    | 已處理            | axe 全站 0 violations；表單、dialog、按鈕、iframe 具可及名稱。                                      |
| 4.1.3 狀態訊息           | AA   | 已處理            | 搜尋 meta、留言通知、閱讀完成 toast 使用 `role="status"` / `aria-live`。                            |

## 送件時需補的人工作業

1. 使用官方檢測工具掃描正式網址 `https://emtech.cc`，保存報告。
2. 以螢幕閱讀器或鍵盤流程錄影/截圖：skip link、header 導覽、搜尋 dialog、留言表單、課程頁。
3. 抽查第三方影片與 embed，保存字幕、音訊描述或替代內容證據；無現場媒體者標示不適用。
4. 抽查內容圖片 alt 是否語意正確，特別是教學截圖與流程圖。
5. 若正式環境啟用 Turnstile 或其他驗證，補 CAPTCHA 目的、替代方式與錯誤訊息證據。
6. 將本文件、官方工具報告、截圖與版本 commit 一併歸檔後再送件。

## 相關修正檔案

- `apps/blog/src/plugins/rehype-accessible-embeds.js`
- `apps/blog/astro.config.mjs`
- `apps/blog/src/styles/global.css`
- `apps/blog/src/components/layout/SiteHeader.astro`
- `apps/blog/src/components/layout/SiteFooter.astro`
- `apps/blog/src/components/shared/SearchDialog.astro`
- `apps/blog/src/components/shared/PostBody.astro`
- `apps/blog/src/components/Comments.astro`
- `apps/blog/src/components/shared/CommentArea.astro`
- `apps/blog/src/components/home/HomeArchive.astro`
- `apps/blog/src/components/shared/AboutCard.astro`
- `apps/blog/src/pages/course/index.astro`
- `apps/blog/src/pages/course/[courseId]/index.astro`
- `apps/blog/src/content/post/Homekit-PC/index.md`
- `apps/blog/src/content/post/rol-call/index.md`
- `apps/blog/src/content/post/nsda2025/index.md`
