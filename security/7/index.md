### Day 7: Insecure Direct Object References (IDOR)——當目標物件成為你的私人物品

#### 簡介：什麼是 Insecure Direct Object References (IDOR)？

Insecure Direct Object References（IDOR）是一種漏洞，發生在用戶能夠直接訪問不應該被他們看到的對象或資料。簡單來說，攻擊者可以通過修改請求中的參數來獲取或操作其他用戶的數據，這通常是因為對象的訪問控制不足。

#### 開發爛網站：逐步構建 IDOR 漏洞的應用

1. **初始化專案並設置 Node.js 環境**

   - **目標：** 創建一個新的 Node.js 專案，並設置一個包含 IDOR 漏洞的應用。
   - **步驟：**
     - 創建專案目錄並初始化：
       ```bash
       mkdir idor-vulnerability
       cd idor-vulnerability
       npm init -y
       ```
     - 安裝 Express 和 SQLite：
       ```bash
       npm install express body-parser ejs sqlite3
       ```

2. **設置 Express 應用與 IDOR 漏洞**

   - **目標：** 構建一個簡單的應用，讓用戶能夠通過不安全的參數訪問其他用戶的資料。
   - **步驟：**

     - 在 `index.js` 中設置 Express 應用和 SQLite 資料庫：

       ```javascript
       const express = require("express");
       const bodyParser = require("body-parser");
       const sqlite3 = require("sqlite3").verbose();
       const app = express();

       app.set("view engine", "ejs");
       app.use(bodyParser.urlencoded({ extended: true }));
       app.use(express.static("public"));

       // 設置 SQLite 資料庫
       const db = new sqlite3.Database(":memory:");
       db.serialize(() => {
         db.run(
           "CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, email TEXT)",
         );
         db.run("INSERT INTO users (username, email) VALUES (?, ?)", [
           "Alice",
           "alice@example.com",
         ]);
         db.run("INSERT INTO users (username, email) VALUES (?, ?)", [
           "Bob",
           "bob@example.com",
         ]);
       });

       app.get("/", (req, res) => {
         res.render("index");
       });

       app.get("/profile", (req, res) => {
         const userId = req.query.id;
         db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
           if (err || !row) {
             res.status(404).send("User not found");
           } else {
             res.render("profile", { user: row });
           }
         });
       });

       app.listen(3000, () => {
         console.log("Server is running on http://localhost:3000");
       });
       ```

     - **說明：** 我們創建了一個簡單的用戶資料查詢系統，用戶可以通過 `/profile?id=1` 這樣的 URL 查看其他用戶的資料，這是一個 IDOR 漏洞的例子。

3. **創建 EJS 模板與前端頁面**
   - **目標：** 設計用戶資料頁面，顯示從查詢中獲取的敏感數據。
   - **步驟：**
     - 在 `views/index.ejs` 中創建首頁，提供查詢用戶的功能：
       ```html
       <!doctype html>
       <html lang="en">
         <head>
           <meta charset="UTF-8" />
           <meta
             name="viewport"
             content="width=device-width, initial-scale=1.0"
           />
           <title>IDOR Vulnerability</title>
           <link rel="stylesheet" href="/styles.css" />
         </head>
         <body>
           <h1>Profile Lookup</h1>
           <form method="GET" action="/profile">
             <input
               type="number"
               name="id"
               placeholder="Enter user ID"
               required
             />
             <button type="submit">View Profile</button>
           </form>
         </body>
       </html>
       ```
     - 在 `views/profile.ejs` 中創建用戶資料頁面：
       ```html
       <!doctype html>
       <html lang="en">
         <head>
           <meta charset="UTF-8" />
           <meta
             name="viewport"
             content="width=device-width, initial-scale=1.0"
           />
           <title>User Profile</title>
           <link rel="stylesheet" href="/styles.css" />
         </head>
         <body>
           <h1>User Profile</h1>
           <p><strong>Username:</strong> <%= user.username %></p>
           <p><strong>Email:</strong> <%= user.email %></p>
           <a href="/">Back to Home</a>
         </body>
       </html>
       ```
     - **說明：** 用戶可以輸入用戶 ID，並查看對應的用戶資料。由於缺乏適當的訪問控制，這會暴露其他用戶的敏感信息。

#### 漏洞深挖：IDOR 漏洞如何發生？

IDOR 漏洞通常發生在網站未能對用戶的權限進行正確檢查時。攻擊者可以通過修改 URL 中的參數來訪問本不該看到的數據。例如，在這個示範中，用戶能夠通過指定其他用戶的 ID 來查看其他用戶的資料，這是因為我們未對用戶的訪問權限進行驗證。

#### 重大事件：IDOR 漏洞的真實案例

一個著名的 IDOR 漏洞事件發生在 2013 年，當時著名的在線儲存服務 Dropbox 被發現其 API 存在 IDOR 漏洞，這使得用戶能夠通過修改 URL 中的參數來訪問其他用戶的文件。這個漏洞被發現後迅速修復，並且 Dropbox 提高了其安全測試和權限控制的標準。

#### 修復漏洞：如何防範 IDOR

防範 IDOR 漏洞的關鍵在於對用戶訪問進行嚴格的控制。以下是修復 IDOR 漏洞的步驟：

1. **檢查用戶權限：** 在每次請求中，確保用戶僅能訪問他們有權限查看的數據。例如，修改我們的 `/profile` 路由，僅允許用戶查看自己的資料。
2. **使用安全的訪問控制：** 實施基於角色的訪問控制（RBAC）或其他適當的訪問控制策略。

以下是修復過的代碼，加入了用戶身份驗證和訪問控制：

```javascript
const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const app = express();

// 假設這是當前用戶的 ID
const currentUserId = 1; // 模擬當前用戶的 ID

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// 設置 SQLite 資料庫
const db = new sqlite3.Database(":memory:");
db.serialize(() => {
  db.run(
    "CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, email TEXT)",
  );
  db.run("INSERT INTO users (id, username, email) VALUES (?, ?, ?)", [
    1,
    "Alice",
    "alice@example.com",
  ]);
  db.run("INSERT INTO users (id, username, email) VALUES (?, ?, ?)", [
    2,
    "Bob",
    "bob@example.com",
  ]);
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/profile", (req, res) => {
  const userId = parseInt(req.query.id, 10);

  // 檢查用戶是否有權限查看該 ID 的資料
  if (userId !== currentUserId) {
    return res
      .status(403)
      .send("Forbidden: You do not have permission to view this profile.");
  }

  db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
    if (err || !row) {
      res.status(404).send("User not found");
    } else {
      res.render("profile", { user: row });
    }
  });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
```

#### 結論與延伸學習

今天我們探討了 Insecure Direct Object References (IDOR) 漏洞，了解了如何構建和利用此漏洞，並學習了如何有效地修復它。希望你對 IDOR 漏洞有了更深入的理解，並掌握了防範方法。明天，我們將進入另一個引人入勝的網頁安全挑戰，敬請期待！

---

**延伸學習主題：**

- 深入了解其他常

見的網頁安全漏洞，如 SQL 注入、XSS。

- 學習如何實施有效的訪問控制和身份驗證策略。
- 探索安全測試工具和技術，以識別和修復漏洞。
