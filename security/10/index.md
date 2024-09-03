### Day 10: Broken Authentication——破解不良認證：暴力破解密碼的威脅

#### 簡介：什麼是 Broken Authentication？
Broken Authentication 是指網站或應用程序中存在的認證漏洞，使攻擊者能夠繞過認證機制或進行暴力破解，從而獲得未經授權的訪問權限。這種漏洞可能使攻擊者能夠訪問其他用戶的帳戶或敏感數據。

#### 開發爛網站：構建不安全的認證機制

1. **初始化專案並設置 Node.js 環境**
   - **目標：** 創建一個簡單的 Node.js 應用，展示一個不安全的認證機制，並演示如何進行暴力破解攻擊。
   - **步驟：**
     - 創建專案目錄並初始化：
       ```bash
       mkdir broken-authentication
       cd broken-authentication
       npm init -y
       ```
     - 安裝必要的模組：
       ```bash
       npm install express sqlite3 ejs bcryptjs
       ```

2. **設置 Express 應用和認證功能**
   - **目標：** 構建一個允許用戶註冊和登錄的應用，但認證機制存在缺陷。
   - **步驟：**
     - 在 `index.js` 中設置 Express 應用：
       ```javascript
       const express = require('express');
       const bcrypt = require('bcryptjs');
       const sqlite3 = require('sqlite3').verbose();
       const ejs = require('ejs');
       const app = express();

       app.set('view engine', 'ejs');
       app.use(express.static('public'));
       app.use(express.urlencoded({ extended: true }));

       // 設置 SQLite 資料庫
       const db = new sqlite3.Database(':memory:');
       db.serialize(() => {
         db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)');
       });

       app.get('/', (req, res) => {
         res.render('index');
       });

       app.post('/register', (req, res) => {
         const { username, password } = req.body;
         bcrypt.hash(password, 10, (err, hash) => {
           if (err) throw err;
           db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err) => {
             if (err) throw err;
             res.send('User registered successfully!');
           });
         });
       });

       app.post('/login', (req, res) => {
         const { username, password } = req.body;
         db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
           if (err) throw err;
           if (user) {
             bcrypt.compare(password, user.password, (err, result) => {
               if (err) throw err;
               if (result) {
                 res.send('Login successful!');
               } else {
                 res.send('Invalid credentials!');
               }
             });
           } else {
             res.send('User not found!');
           }
         });
       });

       app.listen(3000, () => {
         console.log('Server is running on http://localhost:3000');
       });
       ```
     - **說明：** 這段代碼允許用戶註冊和登錄，密碼使用 bcrypt 進行哈希處理。然而，這個應用程序缺乏防範暴力破解攻擊的機制。

3. **創建 EJS 模板和認證頁面**
   - **目標：** 設計一個用戶可以註冊和登錄的頁面。
   - **步驟：**
     - 在 `views/index.ejs` 中創建註冊和登錄頁面：
       ```html
       <!DOCTYPE html>
       <html lang="en">
       <head>
           <meta charset="UTF-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>Authentication</title>
           <link rel="stylesheet" href="/styles.css">
       </head>
       <body>
           <h1>Register</h1>
           <form action="/register" method="POST">
               <label for="username">Username:</label>
               <input type="text" name="username" id="username" required />
               <label for="password">Password:</label>
               <input type="password" name="password" id="password" required />
               <button type="submit">Register</button>
           </form>

           <h1>Login</h1>
           <form action="/login" method="POST">
               <label for="username">Username:</label>
               <input type="text" name="username" id="username" required />
               <label for="password">Password:</label>
               <input type="password" name="password" id="password" required />
               <button type="submit">Login</button>
           </form>
       </body>
       </html>
       ```
     - **說明：** 用戶可以在這個頁面上註冊新帳戶或登錄現有帳戶。這些操作會通過 POST 請求發送到伺服器。

#### 漏洞深挖：Broken Authentication 如何發生？

Broken Authentication 通常發生在認證過程中存在的缺陷，如缺乏登錄嘗試限制、未加強密碼複雜度要求等。這些缺陷使攻擊者能夠進行暴力破解攻擊，即通過嘗試大量密碼來獲得未經授權的訪問權限。

#### 重大事件：Broken Authentication 的真實案例

2019 年，Capital One 遭遇了一次大規模的數據洩露事件，部分原因是其認證系統存在漏洞。攻擊者利用該漏洞進行暴力破解攻擊，最終獲取了超過 1 億條記錄的個人信息。這一事件引發了對認證系統安全性的廣泛關注。

#### 修復漏洞：如何防範 Broken Authentication

防範 Broken Authentication 涉及多方面的措施，包括限制登錄嘗試次數、強化密碼要求和實施多因素認證。以下是一些具體的防範措施：

1. **限制登錄嘗試：** 實施登錄嘗試限制，例如限制單個帳戶的登錄嘗試次數，以防止暴力破解攻擊。

2. **強化密碼要求：** 強制用戶設置複雜密碼，要求密碼包含大寫字母、小寫字母、數字和特殊字符。

3. **實施多因素認證（MFA）：** 使得用戶在登錄時需要提供額外的驗證，例如一次性密碼或生物識別信息。

4. **加密傳輸：** 確保所有的認證信息都通過加密的 HTTPS 協議進行傳輸，以防止中間人攻擊。

以下是如何在 Node.js 中實施登錄嘗試限制的示例：

```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const app = express();

// 設置登錄嘗試限制
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 5, // 每個 IP 最多嘗試 5 次
  message: 'Too many login attempts from this IP, please try again later.'
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 應用登錄限制
app.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) throw err;
    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) throw err;
        if (result) {
          res.send('Login successful!');
        } else {
          res.send('Invalid credentials!');
        }
      });
    } else {
      res.send('User not found!');
    }
  });
});
```

#### 結論：如何從 Broken Authentication 學習？

Broken Authentication 讓我們看到，強健的認證機制不僅僅是處理用戶輸入那麼簡單。從這個漏洞中，我們學到的核心教訓是：單一的認證機制無法應對所有威脅，應該採取多層次的防護措施來保護系統安全。

#### 延伸學習主題

1. **多因素認證（MFA）的實施：** 了解如何在應用中集成多因素認證，增加攻擊者入侵的難度。
   
2. **防範暴力破解攻擊的最佳實踐：** 深入了解如何設計安全的密碼策略和登錄限制機制。
   
3. **安全的會話管理：** 研究如何使用安全的會話管理技術來防止會話劫持和固定攻擊。

通過這些學習主題，你可以進一步提高你的應用程序的安全性，減少被攻擊的風險。

---

這一篇介紹了 Broken Authentication 漏洞及其相關的攻擊方式和防範措施。你可以參考這些技術細節來加強你的應用安全性，並為未來的學習打下堅實的基礎。