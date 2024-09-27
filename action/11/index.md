# 告訴你一個大秘密 - 如何在 GitHub Actions 中使用 Secrets

> 水果冰淇淋喜歡你，GitHub Secrets 在這裡。
>
> 《易經》：「亂之所生也，則言語以為階。君不密則失臣，臣不密則失身」說明了把 token 存在 Secrets 的重要性。

在開發過程中，我們常常需要處理敏感資訊，如 API 金鑰、密碼和其他機密資料。為了保護這些敏感資訊不被暴露，我們可以使用 GitHub Actions 的 Secrets 功能來安全地管理和使用這些資料。

今天，我們將探討如何在 GitHub Actions 中使用 Secrets，並展示如何在 Node.js 程式中安全地讀取這些秘密。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/11>

## 技巧：甚麼是 Secrets？

**Secrets** 是 GitHub 提供的一種功能，用來儲存和管理敏感資料。這些資料在工作流程中可以安全地使用，但不會被暴露在日志或其他地方。

也許你會擔心，GitHub Actions 裡面的 Log 不是會把所有的資料都印下來嗎？不用擔心，GitHub Actions 會自動過濾掉 Secrets，把他們全部變成 `***`。

## 實作：設置和使用 API 金鑰進行身份驗證

**步驟 1：設置 GitHub Secrets**

1. **創建 Secret**

   - 進入你的 GitHub 儲存庫。
   - 點擊頁面上方的 `Settings` 標籤。
   - 在左側菜單中選擇 `Secrets and variables` -> `Actions`。
   - 點擊 `New repository secret` 按鈕。
   - 輸入 Secret 的名稱（例如 `API_KEY`）和對應的值（例如你的 API 金鑰）。
   - 點擊 `Add secret` 按鈕保存。

2. **在工作流程中使用 Secret**

   建立 `.github/workflows/main.yml` 文件，將 Secret 用於工作流程。例如，如果你需要在工作流程中使用 API 金鑰，你可以將其設置為環境變數：

   ```yaml
   name: Example Workflow

   on:
     push:
       branches:
         - main

   jobs:
     build:
       runs-on: ubuntu-latest

       steps:
         - name: Check out code
           uses: actions/checkout@v3

         - name: Use API Key
           run: echo "The API key is ${{ secrets.API_KEY }}"
           env:
             API_KEY: ${{ secrets.API_KEY }}
   ```

   在這個例子中，`${{ secrets.API_KEY }}` 用於獲取儲存在 GitHub Secrets 中的 API 金鑰。這樣，API 金鑰就能安全地用於工作流程中，而不會被暴露。

## Node.js 程式中的 Secrets 使用

1. **在 Node.js 中讀取 Secrets**

   在你的 Node.js 程式中，你可以使用環境變數來讀取 Secret。這些環境變數可以通過 `process.env` 來訪問。為了使這些環境變數能在本地開發環境中使用，你可以使用 `.env` 文件。

   - **安裝 dotenv 模組**

     ```bash
     npm install dotenv
     ```

   - **創建 `.env` 文件**

     在專案根目錄下創建 `.env` 文件，並在其中添加你的秘密（這只應在本地開發中使用，不應提交到版本控制系統）：

     ```
     API_KEY=your-local-api-key
     ```

     > 記得設置 `.env` 文件在 `.gitignore` 中，以避免將其提交到版本控制系統中。

   - **在程式中加載環境變數**

     在你的 Node.js 程式中，使用 `dotenv` 模組來加載 `.env` 文件中的變數：

     ```javascript
     require("dotenv").config();

     const apiKey = process.env.API_KEY;
     console.log(`Your API key is ${apiKey}`);
     ```

2. **在 CI/CD 中使用 Secrets**

   在 GitHub Actions 工作流程中，你可以直接使用 Secrets，如上所示。以下是一個範例工作流程，它使用 Secrets 來設置環境變數，並運行 Node.js 專案：

   ```yaml
   name: Node.js CI

   on:
     push:
       branches:
         - main

   jobs:
     build:
       runs-on: ubuntu-latest

       steps:
         - name: Check out code
           uses: actions/checkout@v3

         - name: Set up Node.js
           uses: actions/setup-node@v3
           with:
             node-version: "20"

         - name: Install dependencies
           run: npm install

         - name: Run application
           run: node app.js
           env:
             API_KEY: ${{ secrets.API_KEY }}
   ```

   在這個例子中，`API_KEY` 環境變數從 GitHub Secrets 中讀取，並用於運行 Node.js 應用。

## 常用技巧

1. **使用 `.gitignore` 避免提交 `.env` 文件**

   確保你的 `.env` 文件被列在 `.gitignore` 文件中，以避免將敏感資訊提交到版本控制系統中。

   ```gitignore
   .env
   ```

2. **使用 GitHub Secrets 管理多個環境變數**

   GitHub Secrets 允許你儲存多個環境變數，並在工作流程中使用。為每個環境變數指定不同的名稱，例如 `DB_PASSWORD`、`API_KEY` 等，並在工作流程中根據需要使用這些 Secrets。

3. **定期更新和管理 Secrets**

   定期檢查和更新 GitHub Secrets，以確保敏感資料的安全。如果需要更換 API 金鑰或密碼，請記得更新 Secrets 並重新配置工作流程。

4. **避免在工作流程中直接打印 Secrets**

   為了防止敏感資料洩漏，避免在工作流程中直接打印 Secrets。如果需要調試，請確保敏感資料不會顯示在日誌中。

5. **設置環境變數的最小權限原則**

   設置 Secrets 時，請確保只賦予必要的權限。這樣可以降低敏感資料被濫用的風險。

## 結語

今天我們探討了如何在 GitHub Actions 中使用 Secrets 來安全地管理和使用敏感資料。我們展示了如何設置 Secrets，如何在工作流程和 Node.js 程式中使用這些 Secrets，以及一些常用的技巧和最佳實踐。希望這些知識能幫助你更好地保護你的敏感資料，提高應用的安全性。明天我們要來談談另外一種環境變數，這些是 GitHub Actions 預設提供的。敬請期待！
