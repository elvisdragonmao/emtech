### Day 11: Cross-Site Scripting (XSS)——黑客的秘密武器：如何利用 XSS 竊取 Cookie

#### 簡介：什麼是 Cross-Site Scripting (XSS)？

Cross-Site Scripting（XSS）是一種安全漏洞，允許攻擊者在網站上注入並執行惡意腳本，這些腳本可以在受害者的瀏覽器上運行。XSS 攻擊可以竊取敏感信息，如 Cookie 和登錄憑證，並進一步進行其他惡意操作。

#### 開發爛網站：打造 XSS 漏洞網站

1. **初始化專案並設置 Node.js 環境**

   - **目標：** 創建一個簡單的 Node.js 應用，展示一個包含 XSS 漏洞的表單，並示範如何利用這個漏洞進行攻擊。
   - **步驟：**
     - 創建專案目錄並初始化：
       ```bash
       mkdir xss-example
       cd xss-example
       npm init -y
       ```
     - 安裝必要的模組：
       ```bash
       npm install express sqlite3 ejs
       ```

2. **設置 Express 應用和 XSS 漏洞**

   - **目標：** 構建一個允許用戶提交評論的應用，但未對輸入進行正確的清理，從而造成 XSS 漏洞。
   - **步驟：**

     - 在 `index.js` 中設置 Express 應用：

       ```javascript
       const express = require("express");
       const sqlite3 = require("sqlite3").verbose();
       const ejs = require("ejs");
       const app = express();

       app.set("view engine", "ejs");
       app.use(express.static("public"));
       app.use(express.urlencoded({ extended: true }));

       // 設置 SQLite 資料庫
       const db = new sqlite3.Database(":memory:");
       db.serialize(() => {
         db.run("CREATE TABLE comments (id INTEGER PRIMARY KEY, content TEXT)");
       });

       app.get("/", (req, res) => {
         db.all("SELECT * FROM comments", (err, rows) => {
           if (err) throw err;
           res.render("index", { comments: rows });
         });
       });

       app.post("/comment", (req, res) => {
         const { content } = req.body;
         db.run(
           "INSERT INTO comments (content) VALUES (?)",
           [content],
           (err) => {
             if (err) throw err;
             res.redirect("/");
           },
         );
       });

       app.listen(3000, () => {
         console.log("Server is running on http://localhost:3000");
       });
       ```

     - **說明：** 這段代碼允許用戶提交和顯示評論，但未對提交的內容進行清理或轉義，這使得 XSS 攻擊成為可能。

3. **創建 EJS 模板和評論頁面**

   - **目標：** 設計一個用戶可以提交和查看評論的頁面，展示 XSS 漏洞的效果。
   - **步驟：**

     - 在 `views/index.ejs` 中創建評論頁面：

       ```html
       <!doctype html>
       <html lang="en">
         <head>
           <meta charset="UTF-8" />
           <meta
             name="viewport"
             content="width=device-width, initial-scale=1.0"
           />
           <title>XSS Example</title>
           <link rel="stylesheet" href="/styles.css" />
         </head>
         <body>
           <h1>Submit a Comment</h1>
           <form action="/comment" method="POST">
             <label for="content">Comment:</label>
             <textarea name="content" id="content" required></textarea>
             <button type="submit">Submit</button>
           </form>

           <h2>Comments</h2>
           <ul>
             <% comments.forEach(comment => { %>
             <li><%= comment.content %></li>
             <% }); %>
           </ul>
         </body>
       </html>
       ```

     - **說明：** 用戶可以在這個頁面上提交評論和查看已提交的評論。由於未進行內容轉義，提交的內容會被直接顯示在頁面上，可能包含惡意腳本。

#### 漏洞深挖：XSS 如何發生？

XSS 漏洞發生在應用程序將用戶輸入的數據直接插入到頁面中，且未對其進行適當的清理或轉義。這使得攻擊者能夠注入並執行惡意腳本，這些腳本在其他用戶的瀏覽器上執行時可以竊取 Cookie、登錄憑證或進行其他操作。

#### 重大事件：XSS 的真實案例

2018 年，Twitter 遭遇了一次 XSS 攻擊，攻擊者利用該漏洞在 Twitter 的平台上注入了惡意腳本，該腳本能夠竊取用戶的 Cookie 和其他敏感信息。此事件強調了對用戶輸入進行適當處理的重要性。

#### 修復漏洞：如何防範 XSS

防範 XSS 涉及對所有用戶輸入進行適當的處理，防止惡意代碼的執行。以下是一些具體的防範措施：

1. **內容轉義：** 在插入用戶輸入到 HTML 中之前，確保所有特殊字符（如 `<`、`>`、`&`）都被轉義，以防止腳本執行。

   ```javascript
   function escapeHTML(str) {
     return str.replace(/[&<>"']/g, function (match) {
       const escape = {
         "&": "&amp;",
         "<": "&lt;",
         ">": "&gt;",
         '"': "&quot;",
         "'": "&#39;",
       };
       return escape[match];
     });
   }
   ```

2. **使用內容安全政策（CSP）：** 部署 CSP 可以幫助限制網站加載的資源和腳本，減少 XSS 攻擊的風險。

   ```html
   <meta
     http-equiv="Content-Security-Policy"
     content="default-src 'self'; script-src 'self';"
   />
   ```

3. **避免直接在 HTML 中插入未處理的用戶輸入：** 使用模板引擎（如 EJS）時，確保對動態內容進行適當的轉義。

#### 結論：從 XSS 學習的要點

XSS 教會我們，無論是如何構建表單還是展示內容，對用戶輸入進行適當處理是至關重要的。防範 XSS 涉及全面的安全措施，包括內容轉義和安全策略的應用。

#### 延伸學習主題

1. **深入了解內容安全政策（CSP）：** 探索如何配置和最佳化 CSP，以強化應用的安全性。

2. **其他注入攻擊類型：** 學習如何防範其他類型的注入攻擊，如 SQL 注入和 NoSQL 注入。

3. **瀏覽器安全和安全編碼實踐：** 了解如何在應用開發中實施最佳安全實踐，以減少漏洞風險。

通過這些學習，你將能夠更加全面地理解和防範 XSS 攻擊，提升你的應用程序安全性。
