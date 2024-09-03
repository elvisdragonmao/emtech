### Day 12: Cross-Site Request Forgery (CSRF)——利用用戶會話執行未授權操作

#### 簡介：什麼是 Cross-Site Request Forgery (CSRF)？
Cross-Site Request Forgery（CSRF）是一種攻擊，利用用戶的已驗證會話向受信任的網站發送未授權的請求。簡單來說，CSRF 可以讓攻擊者冒用用戶身份來執行一些用戶本不會執行的操作，如更改帳戶設置或提交表單。

#### 開發爛網站：打造 CSRF 漏洞網站

1. **初始化專案並設置 Node.js 環境**
   - **目標：** 創建一個簡單的 Node.js 應用，展示 CSRF 漏洞如何被利用，並演示如何修復這個漏洞。
   - **步驟：**
     - 創建專案目錄並初始化：
       ```bash
       mkdir csrf-example
       cd csrf-example
       npm init -y
       ```
     - 安裝必要的模組：
       ```bash
       npm install express sqlite3 ejs body-parser
       ```

2. **設置 Express 應用和 CSRF 漏洞**
   - **目標：** 創建一個用戶可以更新其個人信息的應用，但未對請求進行有效驗證，這使得 CSRF 攻擊成為可能。
   - **步驟：**
     - 在 `index.js` 中設置 Express 應用：
       ```javascript
       const express = require('express');
       const sqlite3 = require('sqlite3').verbose();
       const bodyParser = require('body-parser');
       const ejs = require('ejs');
       const app = express();

       app.set('view engine', 'ejs');
       app.use(express.static('public'));
       app.use(bodyParser.urlencoded({ extended: true }));

       // 設置 SQLite 資料庫
       const db = new sqlite3.Database(':memory:');
       db.serialize(() => {
         db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, email TEXT)');
         db.run('INSERT INTO users (username, email) VALUES (?, ?)', ['user1', 'user1@example.com']);
       });

       app.get('/', (req, res) => {
         db.get('SELECT * FROM users WHERE id = 1', (err, row) => {
           if (err) throw err;
           res.render('index', { user: row });
         });
       });

       app.post('/update', (req, res) => {
         const { email } = req.body;
         db.run('UPDATE users SET email = ? WHERE id = 1', [email], (err) => {
           if (err) throw err;
           res.redirect('/');
         });
       });

       app.listen(3000, () => {
         console.log('Server is running on http://localhost:3000');
       });
       ```
     - **說明：** 這段代碼允許用戶提交其電子郵件地址以更新帳戶信息，但未使用 CSRF 保護，這使得 CSRF 攻擊成為可能。

3. **創建 EJS 模板和更新頁面**
   - **目標：** 設計一個用戶可以更新其電子郵件的頁面，並演示 CSRF 攻擊的效果。
   - **步驟：**
     - 在 `views/index.ejs` 中創建頁面：
       ```html
       <!DOCTYPE html>
       <html lang="en">
       <head>
           <meta charset="UTF-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>CSRF Example</title>
           <link rel="stylesheet" href="/styles.css">
       </head>
       <body>
           <h1>Update Email</h1>
           <form action="/update" method="POST">
               <label for="email">Email:</label>
               <input type="email" name="email" id="email" value="<%= user.email %>" required>
               <button type="submit">Update</button>
           </form>
       </body>
       </html>
       ```
     - **說明：** 用戶可以在這個頁面上更新其電子郵件。由於未使用 CSRF 保護，攻擊者可以利用此頁面發送未授權請求。

#### 漏洞深挖：CSRF 如何發生？

CSRF 攻擊利用了用戶的已驗證會話來執行未授權的操作。當用戶在登錄狀態下，攻擊者可以誘導用戶訪問一個特製的網站，這個網站會自動發送一個請求到受信任的網站，利用用戶的會話來完成一些操作，如修改電子郵件地址或進行其他敏感操作。

#### 重大事件：CSRF 的真實案例

2010 年，PayPal 曾遭遇 CSRF 攻擊，攻擊者利用 CSRF 漏洞來更改用戶的支付設置，導致大量未經授權的轉帳操作。這個事件凸顯了 CSRF 攻擊的潛在危害，並促使許多網站改進了安全措施。

#### 修復漏洞：如何防範 CSRF

防範 CSRF 攻擊的關鍵是使用 CSRF 令牌來驗證請求的合法性。以下是一些具體的防範措施：

1. **使用 CSRF 令牌：** 在表單中添加一個隨機生成的 CSRF 令牌，並在伺服器端驗證該令牌是否有效。
#### 修復漏洞：如何防範 CSRF（繼續）

2. **使用 CSRF 令牌（續）**
   - **步驟：**
     - 安裝 `csurf` 模組來生成和驗證 CSRF 令牌：
       ```bash
       npm install csurf
       ```
     - 在 `index.js` 中配置 CSRF 保護：
       ```javascript
       const csurf = require('csurf');
       const session = require('express-session');

       // 設置 session 中間件
       app.use(session({
         secret: 'your-secret-key',
         resave: false,
         saveUninitialized: true
       }));

       // 設置 CSRF 中間件
       app.use(csurf());
       app.use((req, res, next) => {
         res.locals.csrfToken = req.csrfToken();
         next();
       });

       app.get('/', (req, res) => {
         db.get('SELECT * FROM users WHERE id = 1', (err, row) => {
           if (err) throw err;
           res.render('index', { user: row, csrfToken: res.locals.csrfToken });
         });
       });

       app.post('/update', (req, res) => {
         const { email } = req.body;
         db.run('UPDATE users SET email = ? WHERE id = 1', [email], (err) => {
           if (err) throw err;
           res.redirect('/');
         });
       });
       ```
     - 修改 `views/index.ejs`，在表單中添加 CSRF 令牌：
       ```html
       <!DOCTYPE html>
       <html lang="en">
       <head>
           <meta charset="UTF-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>CSRF Example</title>
           <link rel="stylesheet" href="/styles.css">
       </head>
       <body>
           <h1>Update Email</h1>
           <form action="/update" method="POST">
               <input type="hidden" name="_csrf" value="<%= csrfToken %>">
               <label for="email">Email:</label>
               <input type="email" name="email" id="email" value="<%= user.email %>" required>
               <button type="submit">Update</button>
           </form>
       </body>
       </html>
       ```
     - **說明：** CSRF 令牌被嵌入到每個表單中，伺服器在處理請求時檢查該令牌是否有效。如果令牌不匹配，請求將被拒絕。

#### 結論：CSRF 的防範和學習

通過今天的實作，我們了解了如何在應用中引入 CSRF 漏洞，並學會了如何利用 CSRF 令牌來保護應用免受這種攻擊。CSRF 攻擊利用了用戶的已驗證會話來執行未授權操作，因此，實施正確的防範措施是至關重要的。

#### 延伸學習主題

- **跨站點請求偽造（CSRF）對策的進一步探討：** 深入了解如何設置更為全面的 CSRF 保護機制，例如使用安全的 HTTP 標頭和 Cookie 屬性。
- **HTTP 請求的安全性：** 研究其他影響 HTTP 請求安全性的因素，例如內容安全策略（CSP）和防範 XSS 攻擊。
- **安全測試工具：** 使用工具如 OWASP ZAP 進行全面的安全測試，識別和修復應用中的漏洞。

明天我們將進一步探討另一個常見的漏洞，讓我們一起在實戰中提升安全意識吧！