### Day 9: Insecure File Upload——文件上傳的陷阱：從不安全的上傳到惡意腳本的威脅

#### 簡介：什麼是 Insecure File Upload？
Insecure File Upload 是指網站或應用允許用戶上傳文件，但未對文件進行充分的檢查或限制。這可能會導致用戶上傳惡意腳本或病毒，並在伺服器上執行它們，從而使攻擊者能夠控制伺服器或竊取敏感數據。

#### 開發爛網站：逐步構建不安全的文件上傳漏洞

1. **初始化專案並設置 Node.js 環境**
   - **目標：** 創建一個簡單的 Node.js 應用，展示如何通過不安全的文件上傳來實現漏洞。
   - **步驟：**
     - 創建專案目錄並初始化：
       ```bash
       mkdir insecure-file-upload
       cd insecure-file-upload
       npm init -y
       ```
     - 安裝必要的模組：
       ```bash
       npm install express multer sqlite3 ejs
       ```

2. **設置 Express 應用和文件上傳功能**
   - **目標：** 構建一個允許文件上傳的基本應用，但未對文件進行適當檢查。
   - **步驟：**
     - 在 `index.js` 中設置 Express 應用：
       ```javascript
       const express = require('express');
       const multer = require('multer');
       const path = require('path');
       const fs = require('fs');
       const ejs = require('ejs');
       const sqlite3 = require('sqlite3').verbose();
       const app = express();

       app.set('view engine', 'ejs');
       app.use(express.static('public'));
       app.use(express.urlencoded({ extended: true }));

       // 設置 SQLite 資料庫
       const db = new sqlite3.Database(':memory:');
       db.serialize(() => {
         db.run('CREATE TABLE uploads (id INTEGER PRIMARY KEY, filename TEXT)');
       });

       // 設置 Multer
       const upload = multer({ dest: 'uploads/' });

       app.get('/', (req, res) => {
         res.render('index');
       });

       app.post('/upload', upload.single('file'), (req, res) => {
         const file = req.file;
         if (file) {
           // 保存文件信息到資料庫
           db.run('INSERT INTO uploads (filename) VALUES (?)', [file.filename]);
           res.send('File uploaded successfully!');
         } else {
           res.send('No file uploaded!');
         }
       });

       app.listen(3000, () => {
         console.log('Server is running on http://localhost:3000');
       });
       ```
     - **說明：** 這段代碼允許用戶上傳文件並將文件保存到 `uploads/` 目錄。注意，我們沒有對文件進行任何驗證或檢查，這就為攻擊者提供了機會。

3. **創建 EJS 模板和上傳頁面**
   - **目標：** 設計一個文件上傳頁面，用戶可以選擇並上傳文件。
   - **步驟：**
     - 在 `views/index.ejs` 中創建上傳頁面：
       ```html
       <!DOCTYPE html>
       <html lang="en">
       <head>
           <meta charset="UTF-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>File Upload</title>
           <link rel="stylesheet" href="/styles.css">
       </head>
       <body>
           <h1>File Upload</h1>
           <form action="/upload" method="POST" enctype="multipart/form-data">
               <input type="file" name="file" required />
               <button type="submit">Upload</button>
           </form>
       </body>
       </html>
       ```
     - **說明：** 用戶可以在這個頁面上選擇文件並上傳，這些文件將被保存到 `uploads/` 目錄中，而沒有任何安全檢查。

#### 漏洞深挖：Insecure File Upload 如何發生？

不安全的文件上傳漏洞通常發生在應用程序允許用戶上傳文件，但沒有對文件類型、大小或內容進行充分的檢查。攻擊者可以利用這個漏洞上傳含有惡意代碼的文件（如 `.php` 腳本），並在伺服器上執行這些文件，進而取得對伺服器的控制權或竊取數據。

#### 重大事件：Insecure File Upload 的真實案例

2018 年，著名的安全漏洞披露平台 HackerOne 發生了文件上傳漏洞，攻擊者可以上傳含有惡意 PHP 腳本的文件，這使得他們能夠在伺服器上執行任意代碼。這一事件引起了廣泛關注，並促使許多公司加強了對文件上傳的安全檢查。

#### 修復漏洞：如何防範不安全的文件上傳

防範不安全的文件上傳漏洞涉及多方面的措施，包括文件類型檢查、文件大小限制和存儲安全性。以下是防範措施的具體步驟：

1. **檢查文件類型：** 僅允許特定類型的文件上傳，如 `.jpg`, `.png` 等圖像格式。可以使用文件擴展名和 MIME 類型進行檢查。
   
2. **限制文件大小：** 設置文件大小限制，防止上傳過大的文件，這可以減少拒絕服務攻擊的風險。

3. **檢查文件內容：** 驗證文件的內容是否符合預期，例如確保上傳的文件實際上是圖片而不是可執行的腳本。

4. **安全地處理上傳文件：** 不將上傳的文件存儲在可執行的目錄中，並對文件名稱進行處理以防止目錄遍歷攻擊。

以下是如何在 Node.js 中實施文件上傳檢查的範例：

```javascript
const multer = require('multer');
const path = require('path');

// 設置 Multer 以僅允許圖片文件
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 } // 最大文件大小 1MB
});
```

#### 結論與延伸學習

今天我們深入探討了不安全的文件上傳漏洞，了解了如何通過未檢查的文件上傳來實現漏洞。我們還學會了如何通過限制文件類型、大小和內容來防範這類漏洞。希望這些知識能夠幫助你加強對文件上傳功能的安全性。明天，我們將迎來另一個挑戰，繼續提升你的安全技能！

---

**延伸學習主題：**
- 深入了解文件上傳安全的最佳實踐。
- 學習如何配置和使用 Web 應用防火牆（WAF）來防範常見漏洞。
- 探索其他與文件相關的安全問題，如文件下載和存儲安全。