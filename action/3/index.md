# 幫我結帳 - 自動化 Git 操作

> GitHub Action 如同九方皋相馬，見其所見，不見其所不見；視其所視，而遺其所不視。預設環境是讀不到 Code 的，要使用 actions/checkout 才能讀取 repo 內容。

今天我們要來討論如何使用 GitHub Actions 來自動化 Git 操作，例如自動編輯文件、提交（commit）變更以及推送（push）代碼到儲存庫中。這些操作可以讓你的開發流程更為順暢，尤其在一些重複性任務上，例如定期更新版本號、自動生成文件或部署後自動提交紀錄等。今天將介紹兩種方法：一種是手動使用 Shell 指令，另一種是使用現成的 GitHub Actions 函式庫。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/3>

## 國小複習：什麼是 Git？

我們小學四年級電腦課都學過 Git 是一個分散式版本控制系統，用於追蹤文件的變更、協作開發和版本管理。而要在 GitHub Actions 中自動化 Git 操作有以下兩種方法：

1. **手動編寫 Shell 指令：**
    - 使用基本的 Git 指令來完成自動提交和推送。
    - 這種方法適合有自定義需求的情境，例如在提交前進行特定檢查或修改。

2. **使用現成的函式庫：**
    - GitHub Marketplace 上有許多開源的 GitHub Actions 函式庫，可以用來簡化這些操作。
    - 這些函式庫可以更快速地實現自動化，並且通常已經涵蓋了常見的錯誤處理。

## 實作：手動使用 Shell 指令自動化 Git 操作

我們先來看看如何手動編寫 Shell 指令來自動提交和推送代碼。

**步驟 1：建立工作流程文件**
1. 在儲存庫中，創建一個新的 GitHub Actions 工作流程文件，例如 `.github/workflows/auto-commit.yml`。

**步驟 2：編寫 YAML 配置文件**
```yaml
name: 自動提交和推送

on:
  schedule:
    - cron: '0 0 * * *'  # 每天凌晨12點執行一次
  workflow_dispatch:  # 手動觸發

jobs:
  commit:
    runs-on: ubuntu-latest

    steps:
    - name: 檢出代碼
      uses: actions/checkout@v2

    - name: 進行修改
      run: |
        echo "Update on $(date)" >> update.log
        # 你可以在這裡添加更多自動化變更的指令

    - name: 提交變更
      run: |
        git config --global user.email "your-email@example.com"
        git config --global user.name "Your Name"
        git add .
        git commit -m "Automated commit on $(date)"
    
    - name: 推送代碼
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      run: git push origin main
```

**YAML 文件解析：**
- **`schedule:`** 使用 cron 表達式來設定工作流程的自動觸發時間。這裡設定為每天凌晨12點自動執行。
- **`workflow_dispatch:`** 允許手動觸發工作流程。
- **`steps:`** 分別執行檢出代碼、進行修改、提交變更以及推送代碼。
- **`git config:`** 設置提交時使用的用戶信息，使用過 git 的話你會知道這是必要的，否則提交會失敗。
- **`GITHUB_TOKEN:`** 使用 GitHub 提供的內建密鑰來進行認證並推送代碼。

**步驟 3：推送工作流程文件**

```bash
git add .github/workflows/auto-commit.yml
git commit -m "Add auto commit and push workflow"
git push origin main
```

**應用範例：**
- **定期更新項目狀態：** 可以每天自動更新一個狀態文件，記錄當天的構建或測試結果。
- **自動生成文檔：** 在代碼變更後，自動重新生成文檔並提交到儲存庫。

## 實作：使用現成的函式庫自動化 Git 操作

接下來，我們來看看如何使用現成的 GitHub Actions 函式庫來簡化自動化 Git 操作。

**步驟 1：使用 `stefanzweifel/git-auto-commit-action` 函式庫**

這個開源的 GitHub Actions 函式庫可以幫助我們簡單地實現自動化的提交和推送。

**步驟 2：編寫 YAML 配置文件**
```yaml
name: 使用套件自動提交和推送

on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:

jobs:
  commit:
    runs-on: ubuntu-latest

    steps:
    - name: 檢出代碼
      uses: actions/checkout@v2

    - name: 進行修改
      run: |
        echo "Update on $(date)" >> update.log

    - name: 自動提交
      uses: stefanzweifel/git-auto-commit-action@v4
      with:
        commit_message: "Automated commit on $(date)"
        branch: main
        commit_user_name: GitHub Actions
        commit_user_email: actions@github.com
```

**YAML 文件解析：**
- **`stefanzweifel/git-auto-commit-action@v4:`** 使用這個函式庫來自動進行提交和推送。
- **`commit_message:`** 設定自動提交時的訊息。
- **`branch:`** 指定提交的分支。
- **`commit_user_name:`** 和 **`commit_user_email:`** 設定提交時的用戶訊息，這些已經在函式庫中預設好。

**步驟 3：推送工作流程文件**

```bash
git add .github/workflows/auto-commit-action.yml
git commit -m "Add auto commit and push workflow with action"
git push origin main
```

**應用範例：**
- **版本號自動更新：** 每次 push 代碼時，自動增加版本號並提交。
- **自動同步：** 在分支間進行自動同步，保持不同環境的一致性。

#### 常用技巧與注意事項

1. **避免無限遞迴提交：**
    - 當自動提交導致觸發條件發生變化時，可能會導致無限遞迴。要避免這種情況，可以設置條件或標記來限制提交次數。
  
  > 你 push 之後，Acction 看到有人 push 所以也 push，Acction 看到有人 push 所以也 push，Acction 看到有人 push 所以也 push...

2. **使用 GitHub Secrets：**
    - 將敏感信息（如 GitHub Token、用戶憑證）儲存在 GitHub Secrets 中，並在工作流程中引用，以保證安全性。

3. **檢查提交日誌：**
    - 使用 `git log` 檢查自動提交的日誌，確保提交的內容正確且符合預期。

4. **靈活使用 cron 表達式：**
    - 根據需要設置自動觸發時間，例如每天、多次每天、每週等，來更好地控制自動化流程。

## 結語

透過這篇文章，我們探討了如何在 GitHub Actions 中自動化 Git 操作，無論是使用手動 Shell 指令還是現成的函式庫，這些技巧都能幫助我們更有效地管理專案，減少重複性工作，提升生產力。希望這些內容能為你在實際開發中帶來幫助。明天我們會來對檔案進行更多操作並上傳作為工件（artifact）。