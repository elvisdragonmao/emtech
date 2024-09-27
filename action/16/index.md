# 解放你的 Release - 自動化版本控制與發布

> 秦始皇焚書坑儒時可以 force push 刪除紀錄，但誰知道有沒有人本地 `.git` 還留著呢！

在現代軟體開發中版本控制十分重要。利用版本控制系統（如 Git），我們可以追蹤程式碼變化、管理版本和標記釋出版本。今天，我們將探討如何使用 GitHub Actions 自動化版本控制和標記，以便在每次部署或發佈時自動創建 Git 標記並發布新版本。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/16>

## 認識 Git 標記和發布

- **Git 標記（Tag）**：
  標記是 Git 中用來給特定提交賦予一個名稱的方式。通常用於標記特定的版本（例如 `v1.0.0`），這樣在回顧歷史版本時，可以很方便地找到。

- **發布（Release）**：
  發布是 GitHub 提供的一個功能，允許你從標記中創建釋出版本。釋出版本可以包括二進位文件、更新說明等，並且會顯示在 GitHub 的釋出頁面上。

## 設置 GitHub Actions 工作流程

我們將使用 GitHub Actions 來自動化創建 Git 標記並發佈新版本。以下是設置步驟：

### 步驟 1：創建 GitHub Actions 工作流程

在 `.github/workflows` 目錄下創建一個新的 YAML 文件，例如 `release.yml`，並添加以下內容：

```yaml
name: Create Release

on:
  push:
    tags:
      - "v*.*.*" # 當推送以 'v' 開頭的標記時觸發工作流程

jobs:
  release:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Git
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"

      - name: Create Release
        id: create_release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            path/to/your/binary
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 步驟 2：創建和推送 Git 標記

在本地，使用以下命令創建 Git 標記並推送到遠端倉庫：

```bash
# 創建標記
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送標記
git push origin v1.0.0
```

當你推送這些標記後，GitHub Actions 將會觸發，並自動創建新版本和釋出。

### 步驟 3：配置 GitHub Releases Action

`softprops/action-gh-release` 用於自動創建和管理 GitHub Releases。這個 Action 會根據你推送的標記自動創建新的釋出版本。確保你在工作流程中指定了你想要附加到釋出的文件（如編譯好的二進位文件）。

## 補充提醒

- **版本號自動增加**：
  如果需要自動增量版本號，可以使用一些工具來生成版本號，如 `npm version` 或其他版本管理工具，並在工作流程中自動創建標記。

- **自動發布二進位文件**：
  將編譯好的二進位文件（如應用程序包或安裝程序）附加到釋出版本中。這樣用戶可以直接下載使用，提供更方便的更新方式。

- **添加更新說明**：
  在創建釋出時，可以添加更新說明（Changelog），讓用戶了解新版本的改動內容。

## 小結

自動化版本控制和釋出可以大大提升開發效率和可靠性。通過 GitHub Actions，自動化創建 Git 標記和釋出版本可以確保每次代碼更新後，版本控制和釋出過程都能夠自動完成，減少手動操作的錯誤和漏項。希望這篇教程能夠幫助你更好地管理版本和發布新版本。明天我們要來實作一些有趣的專案。敬請期待！
