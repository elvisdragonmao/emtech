# 第五天：使用 Prettier 進行代碼格式化

在今天的文章中，我們將學習如何使用 Prettier 來進行代碼格式化。Prettier 是一個流行的代碼格式化工具，它可以幫助你保持代碼風格一致，從而提高代碼的可讀性和維護性。我們將介紹如何在 VSCode 中安裝和設定 Prettier，並在 GitHub Actions 中使用它來自動格式化或檢查代碼。

## 技巧：使用 Prettier 進行代碼格式化，以及各種 Prettier 設定

1. **什麼是 Prettier？**
   - Prettier 是一個開源的代碼格式化工具，它可以自動格式化多種語言的代碼，包括 JavaScript、TypeScript、HTML、CSS 等。它可以根據預設的格式化規則或自定義的配置文件來統一代碼風格，讓代碼變得更加一致和可讀。

2. **如何在 VSCode 中安裝 Prettier？**
   - 打開 VSCode。
   - 進入擴展視圖，搜尋 `Prettier - Code formatter`。
   - 點擊安裝按鈕進行安裝。

3. **如何設定 Prettier 規則？**
   - 在專案根目錄下創建一個 `.prettierrc` 配置文件，並在其中設定格式化規則。例如：

     ```json
     {
       "semi": false,
       "singleQuote": true,
       "tabWidth": 2,
       "trailingComma": "es5"
     }
     ```

   - 這些設定的意義如下：
     - `semi`: 是否在語句末尾添加分號（`false` 不添加）。
     - `singleQuote`: 是否使用單引號代替雙引號（`true` 使用單引號）。
     - `tabWidth`: 設定縮排寬度為 2 個空格。
     - `trailingComma`: 在多行結構中是否添加末尾逗號（`es5` 在 ES5 支持的地方添加逗號）。

4. **如何使用預設好的規則，如 Google 的規則？**
   - Google 提供了自己的 Prettier 配置，你可以使用其標準配置來格式化代碼。首先，安裝 `prettier-config-google` 包：

     ```bash
     npm install --save-dev prettier prettier-config-google
     ```

   - 然後，在 `.prettierrc` 文件中設置 Google 的規則：

     ```json
     {
       "extends": "prettier-config-google"
     }
     ```

5. **如何設定 ignore？**
   - 有時候我們不希望 Prettier 格式化某些檔案或目錄。你可以在專案根目錄下創建一個 `.prettierignore` 文件，並在其中列出要忽略的檔案或目錄。例如：

     ```
     node_modules
     build
     *.min.js
     ```

## 實作：自動格式化文件並推送

**步驟 1：配置 Prettier**

1. 確保你已經安裝了 Prettier 和相關依賴：

   ```bash
   npm install --save-dev prettier
   ```

2. 在專案根目錄下創建 `.prettierrc` 文件並配置格式化規則。例如：

   ```json
   {
     "semi": true,
     "singleQuote": false,
     "tabWidth": 4,
     "trailingComma": "none"
   }
   ```

3. 創建 `.prettierignore` 文件以忽略不需要格式化的檔案：

   ```
   node_modules
   dist
   ```

**步驟 2：在 GitHub Actions 中自動格式化文件**

1. 創建一個 GitHub Actions 工作流程文件，例如 `.github/workflows/format.yml`。

2. 編寫 YAML 配置文件來自動運行 Prettier：

   ```yaml
   name: Format Code

   on:
     push:
       branches:
         - main  # 當推送到 main 分支時觸發

   jobs:
     format:
       runs-on: ubuntu-latest

       steps:
       - name: Check out the code
         uses: actions/checkout@v2

       - name: Install dependencies
         run: |
           npm install
           npm install --save-dev prettier

       - name: Run Prettier
         run: npx prettier --write .

       - name: Commit formatted code
         run: |
           git config --global user.name "GitHub Actions"
           git config --global user.email "actions@github.com"
           git add .
           git commit -m "Apply Prettier formatting"
           git push
         env:
           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

   **YAML 文件解析：**
   - **`on: push:`** 設定當推送到 `main` 分支時觸發這個工作流程。
   - **`actions/checkout@v2:`** 檢出代碼，確保工作流程在最新的代碼基礎上運行。
   - **`npm install:`** 安裝依賴。
   - **`npx prettier --write .`** 運行 Prettier 來格式化代碼。
   - **`git commit -m "Apply Prettier formatting"`** 提交格式化後的代碼。

**步驟 3：推送工作流程文件**

```bash
git add .github/workflows/format.yml
git commit -m "Add Prettier format workflow"
git push origin main
```

## 常用技巧與注意事項

1. **配置文件的優先級：**
   - `.prettierrc` 配置文件可以使用 JSON、YAML 或 JavaScript 格式。
   - `.prettierignore` 文件的規則類似於 `.gitignore` 文件。

2. **Prettier 和 ESLint 的整合：**
   - 如果你同時使用 ESLint 和 Prettier，建議安裝 `eslint-config-prettier` 來禁用 ESLint 的格式化規則，避免與 Prettier 衝突。
   - 使用 `eslint-plugin-prettier` 將 Prettier 的格式檢查集成到 ESLint 中。

3. **保持規則的一致性：**
   - 團隊中應統一使用相同的 Prettier 配置，以確保代碼風格一致。可以將 `.prettierrc` 文件放在版本控制中，以共享配置。

4. **自動格式化和提交：**
   - 自動格式化可以幫助維持代碼一致性，但請注意在提交格式化後的代碼之前，先進行充分的測試，以確保不會引入錯誤。

5. **手動格式化和 IDE 支持：**
   - 除了使用 GitHub Actions，你也可以在 VSCode 中手動格式化代碼（快捷鍵：`Shift + Alt + F`），或者在保存時自動格式化（設定 `"editor.formatOnSave": true`）。

## 結語

今天我們學習了如何使用 Prettier 進行代碼格式化，包括安裝、配置規則、設定忽略檔案，以及在 GitHub Actions 中自動運行 Prettier。我們探討了如何保持代碼風格的一致性，並分享了一些常用技巧和注意事項。希望這些內容對你的開發工作有所幫助。