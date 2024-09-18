### Day 5: XML External Entity (XXE)——當 XML 變成駭客的秘密武器

#### 簡介：什麼是 XXE 漏洞？

XML External Entity (XXE) 漏洞是一種攻擊手法，利用 XML 處理中的外部實體來訪問應用程式內部的敏感信息或進行外部連接。攻擊者可以通過特製的 XML 請求讀取伺服器上的文件、進行內部端口掃描，甚至發送請求到內部系統。

#### 開發爛網站：逐步構建易受 XXE 攻擊的應用

1. **初始化專案並設置 Node.js 環境**

   - **目標：** 創建一個新的 Node.js 專案，並安裝解析 XML 的套件。
   - **步驟：**
     - 創建專案目錄並初始化：
       ```bash
       mkdir xxe-vulnerable-site
       cd xxe-vulnerable-site
       npm init -y
       ```
     - 安裝 Express、body-parser 和 xml2js（用於解析 XML）：
       ```bash
       npm install express body-parser xml2js
       ```

2. **設置 Express 應用與 XXE 漏洞**

   - **目標：** 構建一個簡單的應用，並引入 XXE 漏洞。
   - **步驟：**

     - 在 `index.js` 中設置 Express 應用，並處理 XML 請求：

       ```javascript
       const express = require("express");
       const bodyParser = require("body-parser");
       const xml2js = require("xml2js");
       const app = express();

       app.use(bodyParser.text({ type: "application/xml" }));

       app.get("/", (req, res) => {
         res.send(`
           <h1>XML External Entity (XXE) Playground</h1>
           <form method="POST" action="/parse-xml">
             <textarea name="xml" rows="10" cols="50" placeholder="Paste your XML here..."></textarea>
             <button type="submit">Submit</button>
           </form>
         `);
       });

       app.post("/parse-xml", (req, res) => {
         const xml = req.body;

         xml2js.parseString(xml, (err, result) => {
           if (err) {
             res.status(400).send("Invalid XML");
           } else {
             res.json(result);
           }
         });
       });

       app.listen(3000, () => {
         console.log("Server is running on http://localhost:3000");
       });
       ```

     - **說明：** 我們設置了一個接受 XML 請求的簡單應用，並將其解析為 JSON 以便顯示結果。此應用對 XML 中的外部實體處理缺乏防護，容易受到 XXE 攻擊。

3. **測試 XXE 漏洞**
   - **目標：** 測試應用的 XXE 漏洞，確保可以利用此漏洞來提取敏感信息。
   - **步驟：**
     - 在 `http://localhost:3000` 打開瀏覽器，粘貼以下 XML 漏洞測試代碼並提交：
       ```xml
       <?xml version="1.0"?>
       <!DOCTYPE foo [
         <!ELEMENT foo ANY>
         <!ENTITY xxe SYSTEM "file:///etc/passwd">
       ]>
       <foo>&xxe;</foo>
       ```
     - **說明：** 該 XML 請求會讀取伺服器上的 `/etc/passwd` 文件，並顯示其內容，這是經典的 XXE 漏洞測試手法。

#### 網頁深坑大揭密：XXE 的危險

XXE 漏洞可以被攻擊者利用來讀取伺服器上的任何文件，甚至發送請求到內部系統，這可能導致敏感信息泄露或內部系統的進一步攻擊。這種漏洞的威脅非常大，因為它可以打開通往內部網絡的大門。

#### 技術深挖：XXE 漏洞的運作方式

XXE 漏洞利用了 XML 解析器處理外部實體時的漏洞。當 XML 解析器讀取包含外部實體的 XML 文件時，它會嘗試加載並解析這些實體。如果應用程式未對外部實體進行適當的限制和驗證，攻擊者就可以利用這些實體來訪問伺服器上的敏感文件或進行其他惡意操作。

例如，攻擊者可以在 XML 文件中嵌入外部實體指令，從而使伺服器讀取文件或進行網絡請求，這些請求可能會暴露內部系統的結構或數據。

#### 修復漏洞：避免 XXE 攻擊

為了防範 XXE 攻擊，應對 XML 解析器的配置進行嚴格控制，禁用外部實體的解析。使用安全的 XML 解析庫或設置適當的解析選項可以防止外部實體的加載。

以下是修復過的代碼，通過禁用外部實體來防範 XXE 漏洞：

```javascript
const xml2js = require("xml2js");

app.post("/parse-xml", (req, res) => {
  const xml = req.body;

  // 使用禁用外部實體的 XML 解析器選項
  const parser = new xml2js.Parser({
    xmlns: false,
    explicitArray: false,
    strict: true,
    // 禁用 DTD 解析以防止 XXE 攻擊
    dtd: {
      ignore: true,
    },
  });

  parser.parseString(xml, (err, result) => {
    if (err) {
      res.status(400).send("Invalid XML");
    } else {
      res.json(result);
    }
  });
});
```

#### 結論與延伸學習

今天我們深入探討了 XML External Entity (XXE) 漏洞，學習了如何構建一個易受 XXE 攻擊的網站，並了解了如何修復這個漏洞。希望你對 XXE 漏洞的運作和防範措施有了清晰的認識。明天我們將繼續探索另一個有趣的網頁安全議題，敬請期待！

---

**延伸學習主題：**

- 深入了解 XML 解析庫的安全設置與最佳實踐。
- 探索其他 XML 相關的安全問題，如 XML Bomb。
- 學習如何使用更安全的數據格式，如 JSON，來避免類似的漏洞。
