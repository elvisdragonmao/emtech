### Day 13: Clickjacking - 點擊劫持的秘密武器

**漏洞介紹：** 點擊劫持是一種攻擊技術，通過將透明或隱藏的網頁層疊在正常內容上，欺騙用戶進行意圖不明的操作。

#### 製作過程：如何打造一個易受點擊劫持攻擊的爛網站

**1. 創建基本網站**

- **步驟：** 設置 Node.js 和 SQLite 環境，創建基本的 HTML、CSS 和 JavaScript 文件。
  ```bash
  mkdir clickjacking-example
  cd clickjacking-example
  npm init -y
  npm install express sqlite3
  ```

- **index.js**
  ```javascript
  const express = require('express');
  const sqlite3 = require('sqlite3').verbose();
  const app = express();
  const port = 3000;

  const db = new sqlite3.Database(':memory:');

  // 建立資料庫表格
  db.serialize(() => {
    db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)');
    db.run('INSERT INTO users (name, email) VALUES (?, ?)', ['Alice', 'alice@example.com']);
  });

  app.use(express.static('public'));
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (req, res) => {
    db.get('SELECT * FROM users WHERE id = 1', (err, row) => {
      if (err) throw err;
      res.sendFile(__dirname + '/public/index.html');
    });
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
  ```

- **public/index.html**
  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clickjacking Example</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <h1>Welcome to Clickjacking Example</h1>
    <button id="clickMe">Click Me!</button>
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

  #clickMe {
    padding: 10px 20px;
    font-size: 16px;
  }
  ```

**2. 建立點擊劫持攻擊的 HTML**

- **攻擊者的頁面（public/attacker.html）**
  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Attacker's Page</title>
    <style>
      .hidden-frame {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        pointer-events: none;
      }
    </style>
  </head>
  <body>
    <h1>Welcome to the Attacker's Page</h1>
    <iframe src="http://localhost:3000" class="hidden-frame"></iframe>
    <button onclick="alert('You just clicked the hidden button!')">Click Me!</button>
  </body>
  </html>
  ```

- **說明：** 在攻擊者的頁面中，我們創建了一個透明的 `iframe`，其內容來自受害者網站。當用戶點擊攻擊者頁面上的按鈕時，他們實際上也可能點擊到了受害者網站上的按鈕，從而進行了未經授權的操作。

#### 技術細節和重大事件

- **技術細節：** 點擊劫持利用了網頁中的透明層或 `iframe`，使攻擊者能夠控制用戶的點擊行為。通常，攻擊者會利用這種方法來欺騙用戶點擊某些隱藏的按鈕或鏈接。

- **重大事件：** 2010 年，Facebook 成為點擊劫持攻擊的受害者，攻擊者利用這種漏洞獲取了用戶的點讞。這一事件提高了人們對點擊劫持的認識，促使網站開發者採取更嚴格的防範措施。

#### 修復漏洞：如何防範點擊劫持

1. **使用 X-Frame-Options 標頭**

   - **步驟：** 在 Node.js 中設置 `X-Frame-Options` 標頭，以防止網站被嵌入到 `iframe` 中。
     ```javascript
     app.use((req, res, next) => {
       res.setHeader('X-Frame-Options', 'DENY');
       next();
     });
     ```

   - **說明：** `X-Frame-Options` 標頭告訴瀏覽器該頁面不允許在 `iframe` 中顯示，有效防止了點擊劫持攻擊。

2. **使用 Content Security Policy（CSP）**

   - **步驟：** 在 `index.js` 中添加 CSP 標頭：
     ```javascript
     app.use((req, res, next) => {
       res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
       next();
     });
     ```

   - **說明：** CSP 標頭可以進一步增強安全性，限制哪些源可以嵌入當前頁面。

#### 結論：點擊劫持的防範

今天我們學習了點擊劫持如何利用隱藏的 `iframe` 來進行欺詐行為，並探索了防範此類攻擊的方法。通過設置適當的 HTTP 標頭，我們可以有效地保護我們的網站免受這種威脅。

#### 延伸學習主題

- **更多 HTTP 安全標頭：** 研究其他 HTTP 標頭，如 `Strict-Transport-Security` 和 `X-Content-Type-Options`，以進一步提升網站安全性。
- **CSP 的進階應用：** 探索 Content Security Policy 的更多功能和配置選項，以保護網站免受各種攻擊。
- **前端安全最佳實踐：** 深入了解前端安全的最佳實踐，如輸入驗證和安全的 JavaScript 編程。

明天我們將繼續探索下一個常見的漏洞，繼續提升我們的安全防護技能！