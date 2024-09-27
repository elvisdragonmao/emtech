### Day 14: Open Redirect - 如何利用開放重定向進行釣魚攻擊

**漏洞介紹：** 開放重定向漏洞允許攻擊者利用網站的重定向功能，將用戶誘導到惡意網站或釣魚頁面。

#### 製作過程：打造一個易受開放重定向攻擊的網站

**1. 創建基本網站**

- **步驟：** 設置 Node.js 和 SQLite 環境，創建基本的 HTML、CSS 和 JavaScript 文件。

  ```bash
  mkdir open-redirect-example
  cd open-redirect-example
  npm init -y
  npm install express sqlite3
  ```

- **index.js**

  ```javascript
  const express = require("express");
  const sqlite3 = require("sqlite3").verbose();
  const app = express();
  const port = 3000;

  const db = new sqlite3.Database(":memory:");

  // 建立資料庫表格
  db.serialize(() => {
    db.run(
      "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)"
    );
    db.run("INSERT INTO users (name, email) VALUES (?, ?)", [
      "Bob",
      "bob@example.com"
    ]);
  });

  app.use(express.static("public"));
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (req, res) => {
    db.get("SELECT * FROM users WHERE id = 1", (err, row) => {
      if (err) throw err;
      res.sendFile(__dirname + "/public/index.html");
    });
  });

  app.get("/redirect", (req, res) => {
    const { url } = req.query;
    res.redirect(url || "/");
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
  ```

- **public/index.html**

  ```html
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Open Redirect Example</title>
      <link rel="stylesheet" href="styles.css" />
    </head>
    <body>
      <h1>Welcome to Open Redirect Example</h1>
      <a href="/redirect?url=http://localhost:3000" id="redirectLink"
        >Click here to be redirected</a
      >
    </body>
  </html>
  ```

- **public/styles.css**

  ```css
  body {
    font-family: Arial, sans-serif;
    text-align: center;
    margin: 50px;
  }

  #redirectLink {
    color: blue;
    text-decoration: underline;
  }
  ```

**2. 建立釣魚攻擊頁面**

- **釣魚頁面（public/phishing.html）**

  ```html
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Phishing Page</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          margin: 50px;
        }

        h1 {
          color: red;
        }
      </style>
    </head>
    <body>
      <h1>You have been redirected to a phishing page!</h1>
      <p>
        If you entered any sensitive information, please contact support
        immediately.
      </p>
    </body>
  </html>
  ```

- **說明：** 攻擊者可以利用網站的重定向功能來將用戶誘導到釣魚頁面，例如上面的 `phishing.html` 頁面。用戶可能誤以為他們在進行合法操作，但實際上他們正在被引導到危險的網站。

#### 技術細節和重大事件

- **技術細節：** 開放重定向漏洞發生在網站接受用戶提供的 URL 並執行重定向時。如果網站未對這些 URL 進行適當驗證或清理，攻擊者就能利用這一點來進行釣魚攻擊或其他欺詐行為。

- **重大事件：** 2014 年，許多知名網站（如 LinkedIn 和 Yahoo）曾經受到開放重定向攻擊。這些事件展示了開放重定向漏洞如何被用來進行大規模的釣魚攻擊，從而暴露出大量用戶的敏感信息。

#### 修復漏洞：如何防範開放重定向

1. **驗證和限制重定向 URL**

   - **步驟：** 修改 `index.js`，僅允許重定向到信任的域名。

     ```javascript
     app.get("/redirect", (req, res) => {
       const { url } = req.query;
       const allowedDomains = ["localhost:3000"];
       try {
         const parsedUrl = new URL(url, `http://${req.headers.host}`);
         if (allowedDomains.includes(parsedUrl.hostname)) {
           res.redirect(url);
         } else {
           res.status(400).send("Invalid redirect URL");
         }
       } catch (e) {
         res.status(400).send("Invalid URL");
       }
     });
     ```

   - **說明：** 這段代碼將確保只允許重定向到允許的域名，防止攻擊者利用不受信任的 URL 進行釣魚攻擊。

2. **使用完整的 URL 驗證**

   - **步驟：** 進一步限制 URL 的格式和內容，確保它們符合預期的結構和內容。

   - **說明：** 通過進行更嚴格的 URL 驗證，可以避免許多常見的開放重定向攻擊手法。

#### 結論：防範開放重定向

今天我們學習了如何利用開放重定向漏洞進行釣魚攻擊，並探索了修復此漏洞的方法。通過適當的 URL 驗證和限制，我們可以有效地防止這類攻擊，保護用戶免受潛在的風險。

#### 延伸學習主題

- **URL 安全和驗證：** 了解更多關於 URL 驗證的最佳實踐，以防範其他類似的安全漏洞。
- **釣魚攻擊的防範：** 探索防範釣魚攻擊的其他技術和策略，如電子郵件安全和用戶教育。
- **安全測試和漏洞掃描：** 學習如何使用工具進行安全測試，發現並修復網站中的其他漏洞。

明天我們將繼續探索更多的安全漏洞，提升我們的網頁安全防護技能！
