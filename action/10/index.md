# 啊我就怕不相容 - 多平台測試

> 從孟母三遷的故事可以看出孟子在不同環境的相容性都不錯，但結果不一定和預期相同。

今天，我們要來探討如何使用 GitHub Actions 的矩陣構建策略來進行多平台測試。這種策略允許我們在多個環境下運行測試，確保代碼在不同的 Node.js 版本或操作系統中都能正常工作。這對於維持應用的兼容性和穩定性至關重要。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/10>

## 矩陣構建策略是什麼？

**矩陣構建策略** 是 GitHub Actions 提供的一種功能，允許你在不同的環境配置下並行運行工作流程。例如，你可以在多個 Node.js 版本或不同的操作系統上運行測試，以確保你的代碼在所有目標環境中都能正常運行。

## 實作：針對多個 Node.js 版本進行測試

讓我們接續昨天的實作，使用矩陣構建策略來測試不同的 Node.js 版本。這樣可以確保我們的代碼在不同的 Node.js 版本下都能正常運行。

**步驟 1：設置 GitHub Actions 工作流程**

1. **創建工作流程配置文件**

   在專案根目錄下創建 `.github/workflows/test.yml` 文件，並設置矩陣構建策略來測試多個 Node.js 版本：

   ```yaml
   name: Node.js CI

   on:
     push:
       branches:
         - main
     pull_request:
       branches:
         - main

   jobs:
     build:
       runs-on: ubuntu-latest

       strategy:
         matrix:
           node-version: [18.x, 19.x, 20.x]

       steps:
         - name: Check out code
           uses: actions/checkout@v3

         - name: Set up Node.js
           uses: actions/setup-node@v3
           with:
             node-version: ${{ matrix.node-version }}

         - name: Install dependencies
           run: npm install

         - name: Run tests
           run: npm test
   ```

   這個配置文件會在 `ubuntu-latest` 環境中，針對 Node.js 12.x、14.x 和 16.x 版本運行測試。

**步驟 2：檢查工作流程結果**

1. **推送到 GitHub**

   將修改推送到 GitHub 儲存庫：

   ```bash
   git add .github/workflows/test.yml
   git commit -m "Add matrix build strategy for multiple Node.js versions"
   git push origin main
   ```

2. **查看 Actions 結果**

   在 GitHub 的 `Actions` 標籤頁中，你將看到工作流程的運行結果。每個 Node.js 版本的測試都會顯示在不同的作業中，你可以檢查每個作業的結果以確保代碼在所有版本下都能正常運行。

## 多平台測試的應用和技巧

1. **測試不同的 Node.js 版本**

   使用矩陣構建策略可以輕鬆測試不同的 Node.js 版本，這有助於確保你的代碼在各個版本下都能兼容。對於使用最新語法或功能的代碼，測試不同的 Node.js 版本尤為重要。

2. **測試不同的操作系統**

   除了 Node.js 版本，你也可以使用矩陣構建策略來測試不同的操作系統。例如，你可以在 Ubuntu、Windows 和 macOS 上運行測試，以確保你的代碼在不同的操作系統上都能正常運行。

   **範例：**

   ```yaml
   strategy:
     matrix:
       os: [ubuntu-latest, windows-latest, macos-latest]
       node-version: [12.x, 14.x, 16.x]

   runs-on: ${{ matrix.os }}
   ```

3. **測試不同的環境配置**

   矩陣構建策略還可以用於測試不同的環境配置，如不同的依賴項版本或配置文件。這有助於確保你的代碼在不同的環境下都能正常運行。

4. **並行測試以提高效率**

   矩陣構建策略允許你在多個環境下並行運行測試，這樣可以大大提高測試的效率。這有助於及早發現問題，縮短開發和部署周期。

5. **配置測試用戶和數據**

   如果你的測試需要用戶和數據，你可以在矩陣構建策略中設置不同的測試用戶和數據。這樣可以確保你的代碼在不同的用戶和數據配置下都能正常運行。

6. **根據測試結果進行調整**

   根據測試結果，你可以對代碼進行調整，以修復在特定版本或環境下出現的問題。這樣可以確保代碼在所有目標環境下都能保持穩定。

## 結語

今天我們探討了如何使用 GitHub Actions 的矩陣構建策略進行多平台測試。這不僅有助於確保代碼在不同的 Node.js 版本下正常運行，還可以擴展到不同的操作系統和環境配置。希望這些技巧和實作能幫助你提升測試的覆蓋範圍和效率，確保代碼的兼容性和穩定性。
