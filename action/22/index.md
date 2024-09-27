<!-- @format -->

# 特選簡章 Discord 通知 - 爬蟲腳本與數據處理

> 「讀書人的事，能算偷麼？」孔乙己如果是使用 GitHub Actions 運行爬蟲腳本，就不會被人發現還打斷腳了。

在這篇教程中，我們將探討如何使用 GitHub Actions 來自動運行 Python 爬蟲腳本，並處理和存儲抓取的數據。這個過程包括設置 GitHub Actions 工作流程、運行爬蟲腳本以及將結果存儲到不同的地方（如文件或數據庫）。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/22>  
> 專案 Repo: <https://github.com/Edit-Mr/2024SpecAdmitNotifier>

## 背景與目標

身為一位高三的特選生馬上要準備申請大學了，但是每間學校開始申請的時間都不一樣。還好有一間補習班的網站可以查看各間學校的申請時間。但是每天都要打開網站查看有沒有新的公告實在是太麻煩了。所以我決定寫一個爬蟲腳本，每天自動抓取網站上的申請時間，如果有更新的話就使用 Discord 通知我。

![成果](https://raw.githubusercontent.com/Edit-Mr/2024SpecAdmitNotifier/main/demo.png)

## 撰寫爬蟲腳本

我們使用 Node.js 撰寫爬蟲腳本，使用 `axios` 和 `cheerio` 來抓取網站上的數據。

我們要檢查頁面中某個特定表格的內容是否有變更，並將任何變動透過 Discord webhook 發送通知。首先，程式會使用 `axios` 發送 HTTP 請求來獲取網頁 HTML 資料，接著利用 `cheerio` 套件來解析這個 HTML，並定位到目標表格的位置。然後，它會將該表格的 HTML 內容與之前已存儲的表格內容進行比對，通過生成 SHA-256 哈希值來判斷新舊表格是否一致。如果表格發生變更，程式會保存新的表格內容，並分析表格中的各個欄位，檢測具體哪些行和欄位的內容發生了改變。當有改變時，它會將變更的具體內容（例如名額、報名日期、面試日期等）組裝成一段訊息，然後透過 Discord 的 webhook URL 發送給用戶進行通知。這個流程確保了用戶可以自動獲得網頁上表格更新的最新消息，而不需要手動檢查網站。

老樣子，我們先來安裝需要的套件：

```bash
npm init -y
npm install axios cheerio
```

```javascript
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const crypto = require("crypto");

// URL to crawl
const url =
  "https://www.reallygood.com.tw/newExam/inside?str=932DEFBF9A06471E3A1436C3808D1BB7";

const webhookUrl = process.env.WEBHOOK_URL;

if (!webhookUrl) {
  console.error("WEBHOOK_URL environment variable is not set.");
  process.exit(1);
}

function calculateHash(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function fetchPage() {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error("Error fetching the page:", error);
    return null;
  }
}

function extractTable(html) {
  const $ = cheerio.load(html);
  const tableHtml = $(".main_area .article table").eq(5).html();
  return tableHtml || "";
}

function saveTableToFile(content, filename) {
  fs.writeFileSync(filename, content, "utf8");
}

function compareTables(newTable, oldTableFile) {
  if (!fs.existsSync(oldTableFile)) return true; // No previous file, treat as change.

  const oldTable = fs.readFileSync(oldTableFile, "utf8");
  return calculateHash(newTable) !== calculateHash(oldTable);
}

async function sendDiscordMessage(changes) {
  const message = {
    content: changes
  };

  try {
    await axios.post(webhookUrl, message);
    console.log("Change notification sent to Discord.");
  } catch (error) {
    console.error("Error sending message to Discord:", error);
  }
}

// Main function to execute the crawl and check for changes
async function main() {
  const html = await fetchPage();
  if (!html) return;

  const newTable = extractTable(html);

  // Define the file where the table is stored
  const tableFile = "table.html";

  // Check if there's any change
  if (compareTables(newTable, tableFile)) {
    console.log("Change detected! Saving new table and notifying Discord.");
    const $ = cheerio.load(`<table>${newTable}</table>`);
    const old$ = cheerio.load(
      `<table>${fs.readFileSync(tableFile, "utf8")}</table>`
    );
    saveTableToFile(newTable, tableFile);
    const rows = $("tr");
    const oldRows = old$("tr");
    for (let i = 1; i < rows.length; i++) {
      const row = rows.eq(i);
      const columns = row.find("td");
      const oldRow = oldRows
        .find(`td:contains('${columns.eq(0).text().replace("𝐍𝐄𝐖", "")}')`)
        .parent();
      if (oldRow.length === 0) {
        console.log("Row", i, "not found in old table.");
        continue;
      }
      const oldColumns = oldRow.find("td");

      let changed = false;
      for (let j = 0; j < columns.length; j++) {
        if (
          columns.eq(j).text().trim().replace(/\s+/g, " ") !==
          oldColumns.eq(j).text().trim().replace(/\s+/g, " ")
        ) {
          changed = true;
          console.log(
            columns.eq(j).text().length,
            oldColumns.eq(j).text().length
          );
          console.log(
            columns.eq(j).text().trim().replace(/\s+/g, " ") +
              " !== " +
              oldColumns.eq(j).text().trim().replace(/\s+/g, " ")
          );
          break;
        }
      }
      if (!changed) {
        continue;
      }
      console.log("Change detected in row", i);
      let message = `#### ${columns
        .eq(0)
        .text()
        .replace("𝐍𝐄𝐖", "")
        .replace(/\s+/g, " ")} 特選資訊已更新\n**名額:** ${columns
        .eq(1)
        .text()
        .replace(/\s+/g, " ")}\n**報名及繳件日期:** ${columns
        .eq(2)
        .text()
        .replace(/\s+/g, " ")}\n**面試日期:** ${columns
        .eq(3)
        .text()
        .replace(/\s+/g, " ")}\n放榜日期: ${columns
        .eq(4)
        .text()}\n[簡章下載](${columns.eq(5).find("a").attr("href")})\n`;
      message += "\n";
      console.log(message);
      await sendDiscordMessage(message.replaceAll("\t", " "));
    }
  } else {
    console.log("No changes detected.");
  }
}
main();
```

## 設置 GitHub Actions 工作流程

接下來，我們將設置 GitHub Actions 工作流程，以便每天自動運行爬蟲腳本並通過 Discord 通知用戶。在存儲庫的 `.github/workflows` 目錄下創建一個 YAML 文件，例如 `crawl.yml`，並添加以下內容：

```yaml
name: crawl

on:
  schedule:
    - cron: "0 * * * *" # Runs every hour
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "current"

      - name: Install dependencies
        run: yarn install

      - name: Run index.js
        run: node index.js
        env:
          WEBHOOK_URL: ${{ secrets.WEBHOOK_URL }}
      - name: 自動提交
        uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "Update data"
          branch: main
          commit_user_name: Edit-Mr
          commit_user_email: info@elvismao.com
```

請你到 Discord 的伺服器設定中，新增一個 Webhook，並將 Webhook URL 添加到 GitHub 存儲庫的 Secrets 中，名稱為 `WEBHOOK_URL`。這樣，GitHub Actions 就可以使用這個 Webhook URL 來發送 Discord 通知。

## 測試和驗證

推送更改到 GitHub repository，然後檢查 GitHub Actions 頁面來確保工作流程每小時有成功運行。你可以故意編輯一下 `table.html` 文件，然後再次推送更改，觀察是否會觸發 Discord 通知。如果一切正常，你應該能夠收到 Discord 通知，並查看到表格中的具體變更內容。

## 小結

今天我們學習了如何使用 GitHub Actions 來自動運行爬蟲腳本，並通過 Discord 通知來通知用戶。這個過程包括設置 GitHub Actions 工作流程、編寫爬蟲腳本以及處理和存儲抓取的數據。這樣的自動化流程可以幫助用戶自動獲取網站上的最新信息，而不需要手動檢查網站。這樣的自動化流程可以應用在許多不同的場景中，幫助用戶節省時間和精力。
