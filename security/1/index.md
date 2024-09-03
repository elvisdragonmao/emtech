### Day 1: SQL Injection - 這裡不是給你插的地方

歡迎來到破壞與重生：30 日爛站再造。在這個系列，我每天會帶你親手製作一個「爛」網站，刻意留下漏洞，然後從駭客的角度進行攻擊，最後再教你如何修補這些錯誤，從實戰中學習。

透過日復一日的實作，你將學習到如何識別和利用各種常見的網站漏洞，例如 SQL 注入、XSS、CSRF 等等。同時，我們也會探討如何有效地防範這些攻擊，幫助你從根本上提升網站的安全性。如果你是資安初學者，你可以在這裡有機會實際體驗到網站是如何被攻擊。如果你是大神，希望這個系列能夠博君一笑。廢話不多說，一起來做爛網站吧！

#### 簡介：什麼是 SQL Injection？
SQL Injection（SQL 注入）是一種攻擊技術，攻擊者通過操控 SQL 查詢來取得對資料庫的控制權。這個漏洞通常出現在用戶輸入未經妥善處理的情況下，並且可能導致資料洩露、數據篡改甚至整個系統崩潰。

#### 開發爛網站：一步步製作脆弱的網站

1. **初始化專案並設置 Node.js 環境**
   - **目標：** 建立基本的專案結構和開發環境。
   - **步驟：**
     - 打開終端並創建一個新目錄來存放專案文件：
       ```bash
       mkdir mysterious-vulnerable-site
       cd mysterious-vulnerable-site
       ```
     - 初始化 Node.js 專案，這會創建一個 `package.json` 文件來管理專案依賴：
       ```bash
       npm init -y
       ```
     - 安裝必需的 Node.js 套件，包括 Express 用於建構網頁伺服器，SQLite 用於資料庫，body-parser 用於解析請求主體，EJS 用於渲染 HTML 模板：
       ```bash
       npm install express sqlite3 body-parser ejs
       ```

2. **設置 SQLite 資料庫**
   - **目標：** 建立一個簡單的 SQLite 資料庫來儲存用戶資料。
   - **步驟：**
     - 在專案的主文件夾中創建一個名為 `index.js` 的文件，並添加以下代碼來設置 SQLite 資料庫：
       ```javascript
       const sqlite3 = require('sqlite3').verbose();
       const db = new sqlite3.Database(':memory:');

       db.serialize(() => {
         db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
         db.run("INSERT INTO users (username, password) VALUES ('admin', 'password123')");
       });
       ```
     - **說明：** 我們建立了一個名為 `users` 的表格，用來存放用戶的 `username` 和 `password`。這個資料庫儲存在內存中 (`:memory:`)，這意味著它在伺服器關閉後就會消失，非常適合開發測試。

3. **建立 Express 應用與基礎路由**
   - **目標：** 創建一個簡單的網頁伺服器，並設置路由來處理用戶請求。
   - **步驟：**
     - 在 `index.js` 中，添加以下代碼來設置 Express 應用：
       ```javascript
       const express = require('express');
       const bodyParser = require('body-parser');
       const app = express();

       app.set('view engine', 'ejs');
       app.use(bodyParser.urlencoded({ extended: true }));
       app.use(express.static('public'));

       app.get('/', (req, res) => {
         res.render('index');
       });

       app.post('/login', (req, res) => {
         const username = req.body.username;
         const password = req.body.password;

         db.get(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`, (err, row) => {
           if (row) {
             res.send("Login successful!");
           } else {
             res.send("Login failed!");
           }
         });
       });

       app.listen(3000, () => {
         console.log('Server is running on http://localhost:3000');
       });
       ```
     - **說明：** 這段代碼設置了一個簡單的 Express 應用，其中包含兩個路由：`GET /` 來顯示首頁，`POST /login` 來處理用戶登入請求。登入邏輯使用了一個 SQL 查詢來檢查用戶名和密碼是否匹配。

4. **創建 EJS 模板與前端頁面**
   - **目標：** 設計一個簡單的前端登入頁面。
   - **步驟：**
     - 創建一個 `views` 文件夾，在其中創建 `index.ejs` 文件，並添加以下 HTML 代碼：
       ```html
       <!DOCTYPE html>
       <html lang="en">
       <head>
           <meta charset="UTF-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>Mysterious Vulnerable Site</title>
           <link rel="stylesheet" href="/styles.css">
       </head>
       <body>
           <h1>Welcome to the Mysterious Site</h1>
           <form method="POST" action="/login">
               <input type="text" name="username" placeholder="Username" />
               <input type="password" name="password" placeholder="Password" />
               <button type="submit">Login</button>
           </form>
       </body>
       </html>
       ```
     - **說明：** 這是一個基本的 HTML 登入頁面，包含了用戶名和密碼輸入欄位，以及提交按鈕。我們使用 EJS 模板來生成這個頁面，以便於將來進行動態渲染。

5. **添加 CSS 來美化頁面**
   - **目標：** 為前端頁面添加基本的樣式，使其看起來更專業。
   - **步驟：**
     - 在專案根目錄下創建一個 `public` 文件夾，並在其中創建 `styles.css` 文件，添加以下 CSS 代碼：
       ```css
       body {
           font-family: Arial, sans-serif;
           background-color: #f0f0f0;
           text-align: center;
           padding: 50px;
       }

       h1 {
           color: #333;
       }

       form {
           display: inline-block;
           margin-top: 20px;
       }

       input {
           padding: 10px;
           margin: 5px;
           border: 1px solid #ccc;
           border-radius: 5px;
       }

       button {
           padding: 10px 20px;
           border: none;
           background-color: #5cb85c;
           color: white;
           border-radius: 5px;
           cursor: pointer;
       }

       button:hover {
           background-color: #4cae4c;
       }
       ```
     - **說明：** 這段 CSS 為我們的頁面添加了一些基礎樣式，使得頁面更加美觀，並讓用戶在使用時有更好的體驗。

6. **啟動伺服器並檢視網站**
   - **目標：** 運行伺服器，檢視我們所創建的網站。
   - **步驟：**
     - 在終端中運行以下命令來啟動伺服器：
       ```bash
       node index.js
       ```
     - 打開瀏覽器並進入 `http://localhost:3000`，你會看到一個簡單的登入頁面。

#### 網頁深坑大揭密：這個網站有什麼大問題？

現在，我們已經成功建立了一個看似無害的登入頁面。可是，當你輸入 `' OR '1'='1` 作為密碼時，竟然也能登入成功。這是一個經典的 SQL Injection 漏洞。

這個漏洞的本質是：後端在處理用戶輸入時，未能妥善處理，直接將用戶輸入拼接到 SQL 查詢中，使攻擊者可以透過操控 SQL 查詢來取得未經授權的存取。

#### 技術深挖：SQL Injection 的運作方式

SQL Injection 攻擊是通過將惡意的 SQL 查詢插入到應用程序的查詢語句中，以實現繞過身份驗證或獲取敏感資料的目的。這種攻擊的威脅性不容忽視，例如，2008 年的 Heartland Payment Systems 資料洩露事件，就是因為 SQL Injection 攻擊導致的一億三千萬張信用卡資料外洩。

#### 修復漏洞：讓網站不再脆弱

要防範 SQL Injection，最有效的做法是使用 **預備語句（Prepared Statements）**，它能夠將用戶輸入和 SQL 語句分開處理，從而避免了注入攻擊。

將原本的登入邏輯替換為安全版本：

```javascript
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (row) {
      res.send("Login successful!");
    } else

 {
      res.send("Login failed!");
    }
  });
});
```

透過這種方式，輸入的用戶名和密碼會被視為參數，而不是 SQL 語句的一部分，因此攻擊者無法再通過操控輸入來進行 SQL Injection。

---

這就是我們在第一天製作「爛」網站的完整過程。希望你能在這次實作中學到一些關於 SQL Injection 的知識，並了解如何避免讓你的網站變成黑客的玩具。明天我們將探討另一個常見的網頁漏洞，敬請期待！