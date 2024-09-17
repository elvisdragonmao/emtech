# 壓縮與解壓縮 - 上傳工件（artifact）

> 宋·張端義《貴耳集》上卷：「言簡理盡，遂成王言。」可見檔案壓縮十分重要。

今天我們要來探討如何使用 GitHub Actions 來進行檔案壓縮和解壓縮操作，並將其上傳為工件（artifact）。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/4>

## 國小複習：GitHub 的 Artifact 是什麼？

簡單來說就是輸出的附件。在 GitHub Actions 中，Artifact 代表工作流程運行產生的檔案或資料。通過上傳 Artifact，我們可以將檔案保存起來，以便後續操作或共享。Artifact 可以是構建產生的檔案、測試報告、日誌等，通常用於構建、測試和部署流程中。通過 Artifact，我們可以方便地查看和下載工作流程運行產生的檔案，並進行後續操作。Artifact 會保存在 GitHub Actions 的工作流程中，並且可以在工作流程運行詳情頁面中查看和下載。

我曾經有看到有人是使用 GitHub Action 在某天堂漫畫網站下載漫畫碎片，組裝完之後上傳到 GitHub 作為 Artifact 來下載。這樣的操作方式也是蠻很有趣的。有興趣進行相關*學術研究*的朋友可以參考一下。

#### 實作：壓縮工作目錄並上傳作為工件

**步驟 1：建立工作流程文件**
1. 在儲存庫中，創建一個新的 GitHub Actions 工作流程文件，例如 `.github/workflows/compress-and-upload.yml`。

**步驟 2：編寫 YAML 配置文件**

```yaml
name: 壓縮並上傳為工件

on:
  push:
    branches:
      - main  # 觸發條件：當代碼推送到 main 分支時

jobs:
  compress:
    runs-on: ubuntu-latest

    steps:
    - name: 檢出代碼
      uses: actions/checkout@v2

    - name: 壓縮檔案
      run: |
        mkdir compressed
        tar -czf compressed/files.tar.gz .  # 壓縮當前目錄中的所有檔案和子目錄，並存儲為 files.tar.gz
    
    - name: 上傳工件
      uses: actions/upload-artifact@v3
      with:
        name: compressed-files
        path: compressed/files.tar.gz
```

**YAML 文件解析：**
- **`on: push:`** 設定當推送到 `main` 分支時觸發這個工作流程。
- **`actions/checkout@v2:`** 檢出代碼，確保工作流程在最新的代碼基礎上運行。
- **`tar -czf:`** 使用 `tar` 命令來壓縮目錄或檔案。`-c` 創建壓縮檔案，`-z` 使用 gzip 壓縮，`-f` 指定檔案名。
- **`actions/upload-artifact@v3:`** 上傳壓縮檔案作為工件，工件名為 `compressed-files`。

**步驟 3：推送工作流程文件**
```bash
git add .github/workflows/compress-and-upload.yml
git commit -m "Add workflow to compress and upload artifacts"
git push origin main
```

**應用範例：**
- **自動備份：** 定期將工作目錄中的重要文件壓縮並上傳，以便進行備份和恢復。
- **構建工件：** 在 CI/CD 流程中，將構建產生的檔案壓縮並上傳，以便進行部署或分發。

#### 實作：下載和解壓縮工件

**步驟 1：建立解壓縮工作流程文件**
1. 在儲存庫中，創建一個新的 GitHub Actions 工作流程文件，例如 `.github/workflows/download-and-extract.yml`。

**步驟 2：編寫 YAML 配置文件**

```yaml
name: 下載並解壓縮工件

on:
  workflow_run:
    workflows: ["壓縮並上傳為工件"]
    types:
      - completed

jobs:
  extract:
    runs-on: ubuntu-latest

    steps:
    - name: 下載工件
      uses: actions/download-artifact@v3
      with:
        name: compressed-files
    
    - name: 解壓縮檔案
      run: |
        tar -xzf compressed-files/files.tar.gz -C extracted  # 解壓縮到指定目錄

    - name: 列出檔案
      run: |
        ls -R extracted  # 列出解壓縮後的檔案
```

**YAML 文件解析：**
- **`workflow_run:`** 設定當 `Compress and Upload Artifacts` 工作流程完成後觸發這個工作流程。
- **`actions/download-artifact@v3:`** 下載之前上傳的工件。
- **`tar -xzf:`** 使用 `tar` 命令解壓縮檔案。`-x` 解壓縮，`-z` 使用 gzip 解壓，`-f` 指定檔案名。
- **`ls -R extracted:`** 列出解壓縮後的檔案和目錄，確認解壓縮是否成功。

**步驟 3：推送工作流程文件**
```bash
git add .github/workflows/download-and-extract.yml
git commit -m "Add workflow to download and extract artifacts"
git push origin main
```

以今天的例子你可能會想說，沒事這樣壓縮和解壓縮檔案有什麼用？但這只是一個基本的練習。但在實際的開發中通常情況會更加複雜。例如，當你需要將檔案上傳到遠端伺服器時，通常會先壓縮檔案以節省傳輸時間和成本。同時，當你從遠端伺服器下載檔案時，也需要先解壓縮檔案以進行後續操作。

**應用範例：**
- **資料處理：** 在工作流程中自動下載、解壓縮並處理外部數據檔案。
- **測試階段：** 在 CI/CD 流程中，自動下載並解壓縮測試數據檔案，進行測試操作。

#### 常用技巧與注意事項

1. **檔案大小限制：**
    - GitHub Actions 的工件大小限制為 2 GB。確保壓縮的檔案不超過這個限制。

2. **使用適當的壓縮格式：**
    - 根據需求選擇合適的壓縮格式。例如，`tar.gz` 適合 Linux 環境，而 `zip` 可能在不同平台上更為通用。

3. **處理大檔案：**
    - 如果需要處理大型檔案，可以考慮分段壓縮或使用增量備份的方式來減少單次操作的檔案大小。

4. **安全性考量：**
    - 確保壓縮檔案中不包含敏感信息。如果需要處理敏感數據，請進行加密處理。

5. **自動化流程測試：**
    - 在正式環境使用前，先在測試環境中檢查壓縮和解壓縮流程的可靠性，以確保無誤。

#### 結語

今天我們探討了如何在 GitHub Actions 中進行檔案壓縮和解壓縮操作。通過這些操作，我們可以更靈活地處理檔案，並提升自動化流程的效率。希望這些實作教學和技巧對你的開發工作有所幫助。明天我們要來探討如何使用 prettier 來格式化代碼，統一風格並提高可讀性。