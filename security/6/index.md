### Day 6: Sensitive Data Exposure——當你的數據成為公開秘密

#### 簡介：什麼是敏感數據曝光漏洞？
敏感數據曝光漏洞發生在網站未能妥善保護敏感信息時，導致這些數據在無意中被公開或洩露。這種漏洞通常包括明文密碼、API 金鑰或個人識別信息等敏感數據。攻擊者可以通過不安全的網站配置或未經加密的存儲，輕易獲取這些數據。

#### 開發爛網站：逐步構建易受敏感數據曝光攻擊的應用

1. **初始化專案並設置 Node.js 環境**
   - **目標：** 創建一個新的 Node.js 專案，並設置一個不安全的配置來儲存和顯示敏感數據。
   - **步驟：**
     - 創建專案目錄並初始化：
       ```bash
       mkdir sensitive-data-exposure
       cd sensitive-data-exposure
       npm init -y
       ```
     - 安裝 Express 和 body-parser：
       ```bash
       npm install express body-parser ejs sqlite3
       ```

2. **設置 Express 應用與敏感數據曝光**
   - **目標：** 構建一個簡單的應用，儲存並展示明文密碼等敏感數據。
   - **步驟：**
     - 在 `index.js` 中設置 Express 應用，並配置 SQLite 資料庫來儲存用戶數據：
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
         db.run('CREATE TABLE users (username TEXT, password TEXT)');
       });

       app.get('/', (req, res) => {
         res.render('index');
       });

       app.post('/register', (req, res) => {
         const { username, password } = req.body;
         // 插入明文密碼到資料庫
         db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
         res.send('User registered successfully!');
       });

       app.get('/users', (req, res) => {
         db.all('SELECT * FROM users', (err, rows) => {
           if (err) {
             res.status(500).send('Database error');
           } else {
             res.render('users', { users: rows });
           }
         });
       });

       app.listen(3000, () => {
         console.log('Server is running on http://localhost:3000');
       });
       ```
     - **說明：** 我們設置了一個可以儲存和展示明文密碼的網站。用戶通過 `/register` 路徑註冊，密碼以明文形式儲存到 SQLite 資料庫中。可以通過 `/users` 路徑查看所有用戶的敏感數據。

3. **創建 EJS 模板與前端頁面**
   - **目標：** 設計註冊頁面和用戶列表頁面，展示敏感數據。
   - **步驟：**
     - 在 `views/index.ejs` 中創建註冊頁面：
       ```html
       <!DOCTYPE html>
       <html lang="en">
       <head>
           <meta charset="UTF-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>Sensitive Data Exposure</title>
           <link rel="stylesheet" href="/styles.css">
       </head>
       <body>
           <h1>Register</h1>
           <form method="POST" action="/register">
               <input type="text" name="username" placeholder="Enter username" required />
               <input type="password" name="password" placeholder="Enter password" required />
               <button type="submit">Register</button>
           </form>
           <a href="/users">View All Users</a>
       </body>
       </html>
       ```
     - 在 `views/users.ejs` 中創建用戶列表頁面：
       ```html
       <!DOCTYPE html>
       <html lang="en">
       <head>
           <meta charset="UTF-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>All Users</title>
           <link rel="stylesheet" href="/styles.css">
       </head>
       <body>
           <h1>All Users</h1>
           <table>
               <tr>
                   <th>Username</th>
                   <th>Password</th>
               </tr>
               <% users.forEach(user => { %>
                   <tr>
                       <td><%= user.username %></td>
                       <td><%= user.password %></td>
                   </tr>
               <% }); %>
           </table>
           <a href="/">Back to Register</a>
       </body>
       </html>
       ```
     - **說明：** 用戶可以在註冊頁面中輸入帳號和密碼，並查看所有用戶的密碼。這樣會公開顯示所有註冊用戶的敏感數據。

#### 網頁深坑大揭密：敏感數據曝光的風險

敏感數據曝光漏洞會讓敏感信息，如明文密碼，暴露給未經授權的用戶或攻擊者。這樣的數據泄露會大大增加帳號被盜取或其他惡意攻擊的風險。當敏感數據以明文形式儲存時，即使是簡單的數據庫查詢也會暴露這些信息，造成巨大的安全風險。

#### 技術深挖：敏感數據曝光的運作方式

敏感數據曝光問題通常源於不當的數據存儲和傳輸方式。例如，將密碼以明文形式儲存在資料庫中，缺乏加密和安全保護，使得攻擊者只需通過簡單的數據查詢便能獲取敏感信息。安全措施應包括對敏感數據進行加密存儲、使用安全的傳輸協議以及確保不泄露敏感信息的配置。

#### 修復漏洞：如何保護敏感數據

為了防範敏感數據曝光，應確保在儲存和傳輸敏感信息時採用加密技術。密碼應使用強哈希算法（如 bcrypt）進行加密，並確保所有數據傳輸過程中使用 HTTPS。

以下是修復過的代碼，使用 bcrypt 加密密碼並更新存儲方式：

```javascript
const bcrypt = require('bcrypt');
const saltRounds = 10;

// 更新註冊路由以加密密碼
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  
  // 加密密碼
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      return res.status(500).send('Server error');
    }

    // 插入加密後的密碼到資料庫
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err) => {
      if (err) {
        res.status(500).send('Database error');
      } else {
        res.send('User registered successfully!');
      }
    });
  });
});

// 更新用戶列表頁面以顯示加密後的密碼（示範用途，實際應用中應避免顯示密碼）
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      res.status(500).send('Database error');
    } else {
      res.render('users', { users: rows });
    }
  });
});
```

#### 結論與延伸學習

今天我們探討了敏感數據曝光漏洞，學習了如何構建一個易受此漏洞影響的網站，並了解了如何加密和保護敏感數據。希望你對保護敏感數據的最佳實踐有了更深入的了解。明天，我們將繼續探索另一個引人入勝的網頁安全議題，敬請期待！

---

**延伸學習主題：**
- 深入了解加密技術及其在數據保護中的應用。
- 探索如何進行安全的密碼管理和存儲。
- 學習如何使用 HTTPS 和其他安全協議來保護數據傳輸。