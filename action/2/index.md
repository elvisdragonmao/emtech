# 第二天：Hello World—運行 Shell 指令

在這篇文章中，我們將進一步深入了解 GitHub Actions，並學習如何在工作流程中運行基本的 Shell 指令。透過這些指令，我們不僅可以簡單地測試工作流程的運作情況，還可以在實際專案中應用這些技巧來實現更多功能。接下來，讓我們從最基本的開始。

## 技巧：
1. **運行基本的 Shell 指令：**
    - Shell 指令是操作系統中的命令，透過這些指令我們可以與系統互動，如顯示當前目錄內容、建立文件夾、顯示環境變量等等。
    - 這篇教學將介紹如何在 GitHub Actions 的工作流程中使用這些基本指令。

2. **編寫和理解 YAML 結構：**
    - YAML 是一種簡單而強大的文件格式，主要用來寫配置文件。在 GitHub Actions 中，所有的工作流程配置都是使用 YAML 編寫的。
    - 我們將一步步學習如何編寫最基本的 YAML 配置，讓工作流程能夠在特定事件（如 push 到儲存庫）時自動運行。

3. **設置工作流程在特定事件上觸發：**
    - 學習如何讓工作流程在 push、pull request 或特定分支更新時自動觸發。

## 實作：運行 Shell 指令展示結果

現在，我們來實作一個簡單的工作流程，當我們推送代碼到 GitHub 儲存庫時，這個工作流程將自動運行 Shell 指令並展示結果。

**步驟 1：建立新的 GitHub 儲存庫**
1. 進入 GitHub，點擊右上角的「New」按鈕來建立一個新的儲存庫。
2. 為你的儲存庫取一個名字，例如 `hello-world-shell`，並選擇「Public」或「Private」。
3. 點擊「Create repository」來創建儲存庫。

**步驟 2：建立工作流程文件**
1. 在你的儲存庫中，創建一個名為 `.github/workflows/` 的目錄。
2. 在該目錄中創建一個新文件，名為 `hello-world-shell.yml`。

**步驟 3：編寫 YAML 配置文件**
```yaml
name: Hello World Shell Command

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Check out the code
      uses: actions/checkout@v2

    - name: Run a one-liner shell command
      run: echo "Hello, GitHub Actions!"

    - name: List directory contents
      run: ls -la

    - name: Show current directory
      run: pwd

    - name: Display environment variables
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

在這篇文章中，我們學習了如何使用 GitHub Actions 執行基本的 Shell 指令，以及這些指令如何應用於實際場景。希望這些技巧能幫助你在未來的專案中更好地自動化流程、提高生產力。

明天，我們將繼續探索更多進階的 GitHub Actions 使用技巧，敬請期待！