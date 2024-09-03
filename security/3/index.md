### Day 3: Command Injection——當網站變成駭客的控制台

#### 簡介：什麼是 Command Injection？
Command Injection 是一種安全漏洞，允許攻擊者通過網站的表單或輸入框注入並執行任意系統命令。這種攻擊的後果可以非常嚴重，因為攻擊者可以直接操控伺服器的操作系統，執行任何他們想要的命令。

#### 開發爛網站：逐步創建脆弱的 Command Injection 應用

1. **初始化專案並設置 Node.js 環境**
   - **目標：** 設置基本的專案環境，與前兩天的步驟類似。
   - **步驟：**
     - 創建一個新目錄並初始化專案：
       ```bash
       mkdir vulnerable-command-injection-site
       cd vulnerable-command-injection-site
       npm init -y
       ```
     - 安裝 Express 和其他必要的套件：
       ```bash
       npm install express body-parser ejs
       ```

2. **設置 Express 應用與簡單的路由**
   - **目標：** 創建一個簡單的網站，允許用戶輸入一個命令，並在伺服器上執行。
   - **步驟：**
     - 在 `index.js` 中，設置 Express 應用和一個簡單的表單：
       ```javascript
       const express = require('express');
       const bodyParser = require('body-parser');
       const { exec } = require('child_process');
       const app = express();

       app.set('view engine', 'ejs');
       app.use(bodyParser.urlencoded({ extended: true }));
       app.use(express.static('public'));

       app.get('/', (req, res) => {
         res.render('index');
       });

       app.post('/execute', (req, res) => {
         const userInput = req.body.command;
         exec(userInput, (error, stdout, stderr) => {
           if (error) {
             res.send(`Error: ${stderr}`);
           } else {
             res.send(`Output: ${stdout}`);
           }
         });
       });

       app.listen(3000, () => {
         console.log('Server is running on http://localhost:3000');
       });
       ```
     - **說明：** 我們使用 Node.js 的 `exec` 函數來執行用戶輸入的命令，並將結果返回給用戶。

3. **創建 EJS 模板與前端頁面**
   - **目標：** 設計一個簡單的前端頁面，讓用戶輸入命令。
   - **步驟：**
     - 創建 `views/index.ejs` 文件，並加入以下內容：
       ```html
       <!DOCTYPE html>
       <html lang="en">
       <head>
           <meta charset="UTF-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>Command Injection Vulnerable Site</title>
           <link rel="stylesheet" href="/styles.css">
       </head>
       <body>
           <h1>Command Injection Playground</h1>
           <form method="POST" action="/execute">
               <input type="text" name="command" placeholder="Enter command" />
               <button type="submit">Execute</button>
           </form>
       </body>
       </html>
       ```
     - **說明：** 用戶可以通過這個頁面輸入他們想要執行的命令，並將結果顯示在頁面上。

4. **啟動伺服器並檢視網站**
   - **目標：** 運行伺服器並測試 Command Injection。
   - **步驟：**
     - 在終端中運行以下命令來啟動伺服器：
       ```bash
       node index.js
       ```
     - 打開瀏覽器並進入 `http://localhost:3000`，你會看到一個命令輸入框。

#### 網頁深坑大揭密：命令注入的危險性

這個網站讓我們輕而易舉地注入並執行任意系統命令。例如，輸入 `ls` 可以列出當前目錄中的文件，但攻擊者同樣可以輸入危險的命令，如 `rm -rf /` 來刪除伺服器上的所有文件。

這種 Command Injection 攻擊在歷史上已造成過許多嚴重的安全事件。許多未經驗證的用戶輸入都可能導致此類漏洞，使得伺服器成為駭客的玩具。

#### 技術深挖：Command Injection 的運作方式

Command Injection 是利用應用程式將未經驗證的用戶輸入直接傳遞給系統命令解釋器（如 Shell）的漏洞。攻擊者可以通過特定的字符或命令連接符，將他們的惡意命令注入到原本的命令中。

例如，當用戶輸入 `&& rm -rf /` 這樣的命令時，應用會將其作為一個有效的 Shell 指令執行，從而導致系統文件被刪除。

#### 修復漏洞：避免 Command Injection

為了避免 Command Injection，應該盡可能避免將用戶輸入直接傳遞給命令解釋器。如果必須執行系統命令，應該對輸入進行嚴格的驗證和清理，或者使用更安全的 API 來執行命令。

以下是修復過的代碼，其中使用了 `execFile` 來限制只執行特定的命令：

```javascript
app.post('/execute', (req, res) => {
  const userInput = req.body.command;

  // 僅允許執行 'ls' 命令，並禁止其他命令
  if (userInput === 'ls') {
    execFile(userInput, (error, stdout, stderr) => {
      if (error) {
        res.send(`Error: ${stderr}`);
      } else {
        res.send(`Output: ${stdout}`);
      }
    });
  } else {
    res.send("Command not allowed!");
  }
});
```

透過這樣的措施，我們確保應用只執行安全的命令，避免了 Command Injection 的風險。

---

這就是我們在第三天製作的「爛」網站。通過這次的實作，你應該對 Command Injection 有了一個清晰的了解，並知道如何避免這類問題。明天我們將繼續探索另一個常見的網頁漏洞，千萬不要錯過！