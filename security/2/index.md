### Day 2: NoSQL Injection——讓你的資料庫變成災難現場

#### 簡介：什麼是 NoSQL Injection？

NoSQL Injection 是一種針對 NoSQL 資料庫（例如 MongoDB）的攻擊技術。與 SQL Injection 類似，攻擊者通過操控查詢來達到未經授權的存取或操控資料的目的。這種攻擊特別容易出現在未對用戶輸入進行適當驗證和清理的應用中。

#### 開發爛網站：一步步製作脆弱的 NoSQL 應用

1. **初始化專案並設置 Node.js 環境**

   - **目標：** 建立專案結構和開發環境。
   - **步驟：**
     - 與第一天類似，先創建一個新目錄並初始化專案：
       ```bash
       mkdir vulnerable-nosql-site
       cd vulnerable-nosql-site
       npm init -y
       ```
     - 安裝所需套件，包括 Express 和 MongoDB 驅動程序：
       ```bash
       npm install express mongodb body-parser ejs
       ```

2. **設置 MongoDB 資料庫**

   - **目標：** 設置一個 MongoDB 資料庫來儲存用戶資料。
   - **步驟：**

     - 在 `index.js` 文件中，添加連接到 MongoDB 的代碼：

       ```javascript
       const { MongoClient } = require("mongodb");
       const express = require("express");
       const bodyParser = require("body-parser");
       const app = express();

       const url = "mongodb://localhost:27017";
       const dbName = "vulnerable_site";
       let db;

       MongoClient.connect(
         url,
         { useNewUrlParser: true, useUnifiedTopology: true },
         (err, client) => {
           if (err) throw err;
           db = client.db(dbName);
           console.log(`Connected to database ${dbName}`);
         },
       );

       app.set("view engine", "ejs");
       app.use(bodyParser.urlencoded({ extended: true }));
       app.use(express.static("public"));
       ```

     - **說明：** 我們連接到本地 MongoDB 伺服器，並選擇名為 `vulnerable_site` 的資料庫。所有操作都將在這個資料庫中進行。

3. **建立 Express 應用與基礎路由**

   - **目標：** 創建一個簡單的伺服器，並設置用戶登入和註冊路由。
   - **步驟：**

     - 在 `index.js` 中，設置 Express 應用和路由：

       ```javascript
       app.get("/", (req, res) => {
         res.render("index");
       });

       app.post("/login", (req, res) => {
         const username = req.body.username;
         const password = req.body.password;

         db.collection("users").findOne(
           { username: username, password: password },
           (err, user) => {
             if (user) {
               res.send("Login successful!");
             } else {
               res.send("Login failed!");
             }
           },
         );
       });

       app.listen(3000, () => {
         console.log("Server is running on http://localhost:3000");
       });
       ```

     - **說明：** 這段代碼創建了一個基本的登入系統，其中使用了 MongoDB 的 `findOne` 方法來查詢用戶資料。

4. **創建 EJS 模板與前端頁面**

   - **目標：** 設計一個簡單的前端頁面，供用戶登入。
   - **步驟：**
     - 創建 `views/index.ejs` 文件，並加入以下內容：
       ```html
       <!doctype html>
       <html lang="en">
         <head>
           <meta charset="UTF-8" />
           <meta
             name="viewport"
             content="width=device-width, initial-scale=1.0"
           />
           <title>NoSQL Vulnerable Site</title>
           <link rel="stylesheet" href="/styles.css" />
         </head>
         <body>
           <h1>Welcome to the NoSQL Vulnerable Site</h1>
           <form method="POST" action="/login">
             <input type="text" name="username" placeholder="Username" />
             <input type="password" name="password" placeholder="Password" />
             <button type="submit">Login</button>
           </form>
         </body>
       </html>
       ```
     - **說明：** 這個模板與第一天的類似，只是標題有所不同。這個頁面將向用戶顯示一個簡單的登入表單。

5. **啟動伺服器並檢視網站**
   - **目標：** 運行伺服器，檢視我們所創建的網站。
   - **步驟：**
     - 在終端中運行以下命令來啟動伺服器：
       ```bash
       node index.js
       ```
     - 打開瀏覽器並進入 `http://localhost:3000`，你會看到一個簡單的登入頁面。

#### 網頁深坑大揭密：這個網站有什麼大問題？

這個看似正常的網站其實也暗藏危機。當用戶輸入 `{ "username": { "$ne": null }, "password": { "$ne": null } }` 作為登入憑據時，竟然能繞過身份驗證，直接登入。

這就是 NoSQL Injection 的典型例子，攻擊者利用 NoSQL 查詢的特性，將原本應該用來查找單一用戶的查詢變成了匹配所有記錄的查詢。

#### 技術深挖：NoSQL Injection 的運作方式

NoSQL Injection 攻擊利用了 NoSQL 資料庫的靈活性。與 SQL 不同，NoSQL 查詢通常使用 JSON 格式，這使得攻擊者可以注入對象或操作符來操控查詢邏輯。

例如，MongoDB 中常見的 `$ne` 操作符可以用來匹配不等於某個值的記錄。當攻擊者將這些操作符注入到查詢中時，可能導致資料庫返回不應該顯示的記錄。

這種攻擊的威脅性不容小覷。2019 年的 CafePress 資料洩露事件就是因為 NoSQL Injection 導致的，數以百萬計的用戶資料因此洩露。

#### 修復漏洞：讓網站不再脆弱

要防範 NoSQL Injection，最重要的就是對用戶輸入進行嚴格的驗證與清理，避免將原本應該是字符串的值直接嵌入到查詢中。以下是改進過的登入邏輯：

```javascript
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (typeof username === "string" && typeof password === "string") {
    db.collection("users").findOne(
      { username: username, password: password },
      (err, user) => {
        if (user) {
          res.send("Login successful!");
        } else {
          res.send("Login failed!");
        }
      },
    );
  } else {
    res.send("Invalid input!");
  }
});
```

透過這樣的措施，確保用戶輸入的 `username` 和 `password` 是字符串，避免了 NoSQL Injection 攻擊的可能性。

---

這就是我們在第二天探索的 NoSQL Injection 漏洞。希望你能從這次實作中學到更多關於 NoSQL Injection 的知識。明天，我們將揭開另一個常見的網頁漏洞的面紗，記得鎖定！
