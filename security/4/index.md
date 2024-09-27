### Day 4: LDAP Injection——當目錄查詢變成駭客的武器

#### 簡介：什麼是 LDAP Injection？

LDAP Injection 是一種攻擊手法，讓攻擊者能夠注入和執行不受信任的 LDAP 查詢，從而繞過身份驗證或未授權訪問敏感信息。這種漏洞通常存在於不安全的 LDAP 查詢構造中，攻擊者可以操控查詢結果，甚至獲得系統管理權限。

#### 開發爛網站：逐步構建易受 LDAP Injection 攻擊的應用

1. **初始化專案並設置 Node.js 環境**

   - **目標：** 創建一個新的 Node.js 專案，並安裝相關套件來模擬 LDAP 查詢。
   - **步驟：**
     - 創建專案目錄並初始化：
       ```bash
       mkdir ldap-injection-site
       cd ldap-injection-site
       npm init -y
       ```
     - 安裝 Express、body-parser 和 ldapjs：
       ```bash
       npm install express body-parser ejs ldapjs
       ```

2. **設置 Express 應用與 LDAP 模擬**

   - **目標：** 構建一個簡單的應用，模擬 LDAP 查詢操作，並引入漏洞。
   - **步驟：**

     - 在 `index.js` 中設置 Express 應用並模擬 LDAP 查詢：

       ```javascript
       const express = require("express");
       const bodyParser = require("body-parser");
       const ldap = require("ldapjs");
       const app = express();

       app.set("view engine", "ejs");
       app.use(bodyParser.urlencoded({ extended: true }));
       app.use(express.static("public"));

       // 模擬 LDAP 伺服器數據
       const users = [
         { uid: "admin", password: "admin123", role: "administrator" },
         { uid: "user", password: "user123", role: "user" }
       ];

       // 模擬 LDAP 查詢
       function ldapSearch(uid, password) {
         return users.find(
           (user) => user.uid === uid && user.password === password
         );
       }

       app.get("/", (req, res) => {
         res.render("index");
       });

       app.post("/login", (req, res) => {
         const { uid, password } = req.body;
         // 構造 LDAP 查詢
         const filter = `(uid=${uid})(password=${password})`;
         const result = ldapSearch(uid, password);

         if (result) {
           res.send(`Welcome ${result.role}`);
         } else {
           res.send("Invalid credentials");
         }
       });

       app.listen(3000, () => {
         console.log("Server is running on http://localhost:3000");
       });
       ```

     - **說明：** 我們模擬了一個 LDAP 查詢，直接使用用戶輸入來構造查詢，這使得系統容易受到 LDAP Injection 攻擊。

3. **創建 EJS 模板與前端頁面**

   - **目標：** 設計一個用戶登入頁面，供用戶輸入 LDAP 資料。
   - **步驟：**
     - 在 `views/index.ejs` 中創建前端頁面：
       ```html
       <!doctype html>
       <html lang="en">
         <head>
           <meta charset="UTF-8" />
           <meta
             name="viewport"
             content="width=device-width, initial-scale=1.0"
           />
           <title>LDAP Injection Vulnerable Site</title>
           <link rel="stylesheet" href="/styles.css" />
         </head>
         <body>
           <h1>LDAP Injection Playground</h1>
           <form method="POST" action="/login">
             <input type="text" name="uid" placeholder="Enter UID" />
             <input
               type="password"
               name="password"
               placeholder="Enter Password"
             />
             <button type="submit">Login</button>
           </form>
         </body>
       </html>
       ```
     - **說明：** 用戶可以在這個表單中輸入帳號和密碼，提交後進行 LDAP 查詢。

4. **啟動伺服器並檢視網站**
   - **目標：** 運行伺服器並測試 LDAP Injection。
   - **步驟：**
     - 啟動伺服器：
       ```bash
       node index.js
       ```
     - 在瀏覽器中打開 `http://localhost:3000`，使用合法的帳號和密碼進行登入測試。

#### 網頁深坑大揭密：LDAP Injection 的危險

這個示範網站允許用戶通過提交 LDAP 查詢來登入。如果攻擊者在 `uid` 或 `password` 欄位中注入特殊字符，如 `(uid=admin)(password=*)`，他們可以繞過驗證，獲取未經授權的訪問權限。

LDAP Injection 攻擊非常危險，因為 LDAP 服務通常存儲大量用戶和敏感資料。攻擊者利用此漏洞可以執行任意查詢、修改或刪除資料，甚至獲得更高的系統權限。

#### 技術深挖：LDAP Injection 的運作方式

LDAP Injection 攻擊利用了應用程式在構造 LDAP 查詢時未對用戶輸入進行適當清理。攻擊者通過特定的查詢語法注入來操控查詢結果，可能達到繞過驗證或訪問未授權數據的目的。

例如，攻擊者可以利用括號 `()` 和 OR 運算符來繞過查詢條件，使 LDAP 查詢返回不正確的結果，這樣他們便可以繼續登入系統。

#### 修復漏洞：避免 LDAP Injection

為了防範 LDAP Injection，應對用戶輸入進行嚴格的驗證和清理。避免直接將用戶輸入嵌入到 LDAP 查詢中，而應使用參數化查詢或模板來構造查詢。可以使用安全的 LDAP API 來確保查詢不受注入攻擊影響。

以下是修復過的代碼，通過檢查用戶輸入來防範 LDAP Injection：

```javascript
app.post("/login", (req, res) => {
  const { uid, password } = req.body;

  // 驗證輸入並使用安全的查詢構造
  const result = ldapSearch(uid, password);

  if (result) {
    res.send(`Welcome ${result.role}`);
  } else {
    res.send("Invalid credentials");
  }
});
```

#### 結論與延伸學習

今天我們學習了如何構建一個易受 LDAP Injection 攻擊的網站，並探索了其攻擊方式及修復方法。希望你對 LDAP Injection 有了深入了解，並掌握了防範這類漏洞的方法。明天，我們將繼續探索另一個有趣的網頁安全議題，敬請期待！

---

**延伸學習主題：**

- 探索更複雜的 LDAP 查詢語法和注入技巧。
- 深入了解目錄服務的安全性最佳實踐。
- 學習如何使用現代框架和庫來保護應用免受 LDAP Injection 攻擊。
