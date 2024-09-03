### Day 8: Man-in-the-Middle (MitM) Attacks——當黑客插足你和網站之間的對話

#### 簡介：什麼是 Man-in-the-Middle (MitM) 攻擊？
Man-in-the-Middle（MitM）攻擊是一種黑客干擾通信過程的攻擊方式。在這種攻擊中，黑客會偷偷地攔截和修改你和伺服器之間的通信，從而竊取敏感信息或篡改數據。這種攻擊尤其危險，因為受害者可能完全不知道通信已經被劫持。

#### 開發爛網站：逐步構建 MitM 攻擊的應用

1. **初始化專案並設置 Node.js 環境**
   - **目標：** 創建一個簡單的 Node.js 應用，展示如何在不使用 HTTPS 的情況下容易受到 MitM 攻擊。
   - **步驟：**
     - 創建專案目錄並初始化：
       ```bash
       mkdir mitm-vulnerability
       cd mitm-vulnerability
       npm init -y
       ```
     - 安裝 Express 和 SQLite：
       ```bash
       npm install express body-parser ejs sqlite3
       ```

2. **設置 Express 應用和漏洞**
   - **目標：** 構建一個基本的應用，展示如何在未使用 HTTPS 的情況下，攻擊者可以攔截和篡改傳輸的數據。
   - **步驟：**
     - 在 `index.js` 中設置 Express 應用：
       ```javascript
       const express = require('express');
       const bodyParser = require('body-parser');
       const sqlite3 = require('sqlite3').verbose();
       const app = express();

       app.set('view engine', 'ejs');
       app.use(bodyParser.urlencoded({ extended: true }));
       app.use(express.static('public'));

       // 設置 SQLite 資料庫
       const db = new sqlite3.Database(':memory:');
       db.serialize(() => {
         db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)');
         db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['Alice', 'password123']);
         db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['Bob', 'password456']);
       });

       app.get('/', (req, res) => {
         res.render('index');
       });

       app.post('/login', (req, res) => {
         const { username, password } = req.body;
         db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
           if (err || !row) {
             res.send('Login failed!');
           } else {
             res.send('Welcome, ' + row.username);
           }
         });
       });

       app.listen(3000, () => {
         console.log('Server is running on http://localhost:3000');
       });
       ```
     - **說明：** 我們創建了一個基本的登錄系統，處理用戶名和密碼。由於未使用 HTTPS，這使得登錄信息容易被攔截。

3. **創建 EJS 模板與前端頁面**
   - **目標：** 設計登錄頁面，展示如何在未加密的通信中提交敏感信息。
   - **步驟：**
     - 在 `views/index.ejs` 中創建登錄頁面：
       ```html
       <!DOCTYPE html>
       <html lang="en">
       <head>
           <meta charset="UTF-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>Login</title>
           <link rel="stylesheet" href="/styles.css">
       </head>
       <body>
           <h1>Login</h1>
           <form method="POST" action="/login">
               <label for="username">Username:</label>
               <input type="text" id="username" name="username" required />
               <label for="password">Password:</label>
               <input type="password" id="password" name="password" required />
               <button type="submit">Login</button>
           </form>
       </body>
       </html>
       ```
     - **說明：** 用戶在這個頁面上輸入用戶名和密碼，並提交表單。由於缺乏加密，這些信息在傳輸過程中會被暴露給任何中間的攻擊者。

#### 漏洞深挖：MitM 攻擊如何發生？

MitM 攻擊通常發生在未加密的通信中，攻擊者可以在兩個通信端點之間進行劫持和篡改。在我們的示例中，登錄信息通過 HTTP 發送而不是 HTTPS，這使得攻擊者可以通過攔截和分析網絡流量來獲取敏感信息。

#### 重大事件：MitM 攻擊的真實案例

2011 年，著名的 HTTPS 證書機構 DigiNotar 遭遇了 MitM 攻擊，攻擊者利用偽造的證書攔截和篡改用戶的 HTTPS 流量。這起事件暴露了大量的 Google 用戶數據，並引起了對 HTTPS 安全性的廣泛關注和改進。

#### 修復漏洞：如何防範 MitM 攻擊

防範 MitM 攻擊的關鍵在於使用加密來保護通信。以下是防範 MitM 攻擊的步驟：

1. **使用 HTTPS：** 確保所有的敏感數據和重要通信都通過 HTTPS 傳輸，這樣可以加密傳輸過程中的數據，防止被攔截。
   
2. **實施證書檢查：** 確保你的應用程序檢查 SSL/TLS 證書的有效性，防止使用過期或偽造的證書。

3. **啟用 HSTS（HTTP Strict Transport Security）：** 強制瀏覽器使用 HTTPS 連接你的網站，避免在 HTTP 中傳輸敏感數據。

以下是如何在 Node.js 中使用 HTTPS 的示例：

```javascript
const https = require('https');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// 設置 SQLite 資料庫
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)');
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['Alice', 'password123']);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['Bob', 'password456']);
});

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err || !row) {
      res.send('Login failed!');
    } else {
      res.send('Welcome, ' + row.username);
    }
  });
});

// HTTPS 設置
const options = {
  key: fs.readFileSync('path/to/your/ssl/key'),
  cert: fs.readFileSync('path/to/your/ssl/cert')
};

https.createServer(options, app).listen(3443, () => {
  console.log('Secure server is running on https://localhost:3443');
});
```

#### 結論與延伸學習

今天我們探討了 Man-in-the-Middle（MitM）攻擊，了解了如何在未加密的通信中，攻擊者如何攔截和篡改數據。我們還學會了如何通過實施 HTTPS 來防範這種攻擊。希望你能理解加密通信的重要性，並將這些最佳實踐應用到你自己的項目中。明天，我們將迎來另一個挑戰，繼續提升你的安全技能！

---

**延伸學習主題：**
- 深入了解 HTTPS 的工作原理和 TLS 協議。
- 學習如何配置和管理 SSL/TLS 證書。
- 探索其他類型的網絡安全攻擊，如 CSRF 和 XSS。