# Hello World - 運行 Shell 指令

> 「有朋自遠方來，不亦樂乎」應該算是孔子的 Hello World 吧。

今天我們要來探討如何在 GitHub Actions 中運行基本的 Shell 指令。你可以把 GitHub Action 想像成你的虛擬機接著 Bad USB，只需要先設定好，基本上你平常在虛擬機或電腦上的操作都可以直接運行。

## 國小複習：甚麼是 Shell 指令？

我們小學四年級電腦課都學過 Shell 指令是一種在終端機（Terminal）中執行的命令，用於與操作系統進行交互。通過 Shell 指令，我們可以執行各種操作，例如創建文件、刪除文件、運行程序等。在 GitHub Actions 中，我們可以使用 Shell 指令來自動化各種操作，例如構建代碼、部署應用程序等。

## 實作：運行 Shell 指令

現在讓我們來實作一個簡單的工作流程，當我們推送代碼到 GitHub 儲存庫時，這個工作流程將自動運行一些基本的 Shell 指令。

**步驟 1：建立新的 GitHub 儲存庫**

你可以使用現有的儲存庫，或者創建一個新的儲存庫。

**步驟 2：建立工作流程文件**

1. 在你的儲存庫中，創建一個名為 `.github/workflows/` 的目錄。
2. 在該目錄中創建一個新文件，名為 `hello-world-shell.yml`。

**步驟 3：編寫 YAML 配置文件**

在 `hello-world-shell.yml` 文件中，編寫以下配置：

```yaml
name: 有朋自遠方來，不亦樂乎？

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: 執行一行 Shell 指令
        run: echo "有朋自遠方來，不亦樂乎？"

      - name: 列出當前目錄
        run: ls -la

      - name: 顯示當前目錄
        run: pwd

      - name: 顯示環境變數
        run: env
```

**YAML 文件解析：**

- **`name:`** 為這個工作流程命名，這裡我們命名為 `Hello World Shell Command`。
- **`on:`** 指定工作流程觸發的事件，這裡我們選擇當 `push` 時觸發。
- **`jobs:`** 這是一個大範圍的配置，代表整個工作流程的任務。
- **`runs-on:`** 指定工作流程運行的系統環境，我們選擇 `ubuntu-latest`。
- **`steps:`** 是工作流程的具體步驟，每一步都有一個 `name:` 和 `run:` 來指定要執行的 Shell 指令。

**步驟 4：推送代碼到 GitHub**

1. 在本地端將 `.github/workflows/hello-world-shell.yml` 文件加入到版本控制中：
   ```bash
   git add .github/workflows/hello-world-shell.yml
   git commit -m "Add hello world shell command workflow"
   git push origin main
   ```
2. 這時，GitHub Actions 將自動運行這個工作流程，並在 Actions 頁面上顯示結果。

## 深入應用：Shell 指令在實際場景中的應用

這裡列出幾個實際場景中常見的 Shell 指令應用，你可以根據自己的需求進行擴展和應用。

1. **自動化部署：**

   - 使用 `scp` 或 `rsync` 指令自動將構建好的文件部署到遠程伺服器。
   - ```yaml
     - name: Deploy to server
       run: scp -r ./dist user@yourserver.com:/path/to/deploy
     ```

2. **備份數據：**

   - 使用 `tar` 指令將文件夾壓縮並備份到遠程伺服器或雲端存儲。
   - ```yaml
     - name: Backup files
       run: tar -czf backup.tar.gz /path/to/backup && scp backup.tar.gz user@backupserver:/backup/location
     ```

3. **自動化測試：**

   - 使用 `curl` 測試 API 是否正常響應。
   - ```yaml
     - name: Test API response
       run: curl -I https://yourapi.com/health
     ```

4. **環境設置：**

   - 使用 `export` 設置環境變量，或者使用 `source` 加載環境配置文件。
   - ```yaml
     - name: Set environment variable
       run: export NODE_ENV=production
     ```

5. **日誌分析：**
   - 使用 `grep` 來分析日誌文件中的錯誤信息。
   - ```yaml
     - name: Analyze logs
       run: grep "ERROR" /var/log/application.log
     ```

## 結語

今天我們探討了如何使用 GitHub Actions 執行基本的 Shell 指令，以及這些指令如何應用於實際場景。希望這些技巧能幫助你在未來的專案中更好地自動化流程、提高生產力。

在這兩天我們都有使用 `actions/checkout@v2` 這個 Action，他到底是拿來幹嘛的呢？GitHub Action 如果編輯了檔案可以 push 嗎？這些問題我們將在明天的文章中一一解答。
