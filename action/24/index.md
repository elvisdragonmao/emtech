# 自動化性能測試 - 使用 GitHub Actions 進行負載測試與生成性能報告

> 嬌娘對王安石進行心理上的壓力負載測試後寫下了性能報告：「宰相肚裡能撐船」

**引言**

在軟體開發中，性能測試是確保應用程序在高負載下正常運行的關鍵步驟。自動化性能測試可以幫助我們在開發過程中及早發現性能瓶頸並做出改進。本文將介紹如何使用 GitHub Actions 來自動化性能測試，進行負載測試並生成性能報告。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/24>

## 專案背景

假設我們有一個簡單的 Web 應用，我們希望對其進行負載測試，以確保它能在高流量下穩定運行。我們將使用 `k6` 這個工具進行性能測試，並通過 GitHub Actions 自動化測試過程，生成性能報告並將結果上傳到 GitHub Pages。

## 準備專案

1. **創建專案文件夾**

   ```bash
   mkdir performance-test
   cd performance-test
   ```

2. **初始化 Git 存儲庫**

   ```bash
   git init
   ```

3. **創建性能測試腳本**

   在 `performance-test` 目錄下創建 `test.js` 文件，並加入以下內容：

   ```javascript
   // test.js
   import http from "k6/http";
   import { sleep, check } from "k6";

   export const options = {
     vus: 10, // Number of virtual users
     duration: "30s" // Test duration
   };

   export default function () {
     const response = http.get("https://example.com");
     check(response, {
       "status is 200": (r) => r.status === 200
     });
     sleep(1);
   }
   ```

   該腳本使用 `k6` 模擬 10 個虛擬用戶，在 30 秒內對 `https://example.com` 進行負載測試。

   > 資安宣導：你懂的。不要沒事貼心的幫別的網站進行負載測試。

4. **安裝 `k6`**

   在本地測試時，你可以使用以下命令安裝 `k6`：

   ```bash
   brew install k6
   ```

   在 Windows 上，你可以使用 Chocolatey 安裝 `k6`：

   ```bash
    choco install k6
   ```

## 步驟 2: 設置 GitHub Actions

在 `.github/workflows` 目錄下創建 `performance-test.yml` 文件，並加入以下內容：

```yaml
name: Performance Testing

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  performance-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up k6
        uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install k6
        run: |
          curl -s https://dl.k6.io/signing.key | sudo apt-key add -
          echo "deb https://dl.k6.io/deb/ stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Run performance tests
        run: k6 run test.js

      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: ./results/

      - name: Deploy performance report to GitHub Pages
        if: github.ref == 'refs/heads/main'
        run: |
          mkdir -p public
          mv results/ public/
          git config --global user.name 'GitHub Actions'
          git config --global user.email 'action@github.com'
          git add public/
          git commit -m 'Deploy performance report'
          git push
```

### 工作流程解釋

- **`Checkout code`**：檢出代碼，以便 `k6` 能夠運行測試腳本。
- **`Set up k6`**：安裝 `k6` 工具。
- **`Run performance tests`**：執行性能測試腳本 `test.js`。
- **`Upload test results`**：上傳測試結果到 GitHub Actions artifacts，以便後續查看。
- **`Deploy performance report to GitHub Pages`**：將測試結果部署到 GitHub Pages（如果你在 `public/` 目錄中生成了性能報告）。

## 配置 GitHub Pages

1. **設置 GitHub Pages**

   - 進入 GitHub repository 的 `Settings` 頁面。
   - 選擇 `Pages`，然後在 `Source` 下拉菜單中選擇 `main` 分支。
   - 點擊 `Save` 以保存更改。

## 步驟 4: 測試工作流程

1. **提交更改**

   提交所有更改並推送到 GitHub：

   ```bash
   git add .
   git commit -m "Add performance testing workflow"
   git push origin main
   ```

2. **檢查 Actions**

   - 進入 GitHub repository 的 `Actions` 頁面。
   - 查看 `Performance Testing` 工作流程的執行情況，確保所有步驟都成功完成。

3. **查看性能報告**

   - 在 GitHub Pages 上查看性能報告，確保測試結果能夠正確顯示。

## 小結

在本文中，我們設置了一個自動化性能測試的 CI/CD 流程，使用 `k6` 工具進行負載測試並生成性能報告。這樣的流程可以確保你的應用在高負載下表現良好，並及時發現性能問題。
