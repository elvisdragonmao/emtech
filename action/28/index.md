# 無國界倉庫 - 管理多倉庫的自動化工作流程

> 《荀子 ─ 勸學》：「不積跬步，無以致千里；不積小流，無以成江海。」

在多倉庫的開發環境中，管理和協作變得複雜。尤其當倉庫之間需要保持同步或協同工作時，手動管理變得難以維持。使用 GitHub Actions 進行跨倉庫的自動化工作流程，可以大幅提升效率，減少手動操作的錯誤。本文將介紹如何設置跨倉庫的自動化工作流程，實現代碼同步和自動化任務。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/28>

## 為什麼需要跨倉庫協作？

在大型項目或多倉庫系統中，以下情境通常需要跨倉庫協作：

- **代碼同步**：保持多個倉庫中的代碼版本一致。
- **跨倉庫部署**：從多個倉庫中提取代碼，進行構建和部署。
- **共享資源**：共享庫或資源，確保各倉庫中的資源版本一致。
- **自動化任務**：在一個倉庫中的操作觸發另一個倉庫的操作。

## 技巧與實作

### 跨倉庫的代碼同步

要實現跨倉庫的代碼同步，我們可以使用 GitHub Actions 來自動化推送和拉取操作。以下是一步步的設置過程：

1. **設置 GitHub Token**

   在目標倉庫中生成一個 Personal Access Token (PAT) 並儲存到源倉庫的 Secrets 中。這個 token 需要具有讀寫權限，以便能夠在兩個倉庫之間進行操作。

2. **創建工作流程文件**

   在源倉庫中，創建一個工作流程文件，例如 `sync-code.yml`，並加入以下內容：

   ```yaml
   name: Sync Code to Another Repository

   on:
     push:
       branches:
         - main
     workflow_dispatch:

   jobs:
     sync:
       runs-on: ubuntu-latest

       steps:
         - name: Checkout source repository
           uses: actions/checkout@v3
           with:
             repository: source-repo/source-repo-name
             token: ${{ secrets.SOURCE_REPO_TOKEN }}

         - name: Set up Git
           run: |
             git config --global user.email "action@github.com"
             git config --global user.name "GitHub Actions"

         - name: Add and commit changes
           run: |
             git add .
             git commit -m "Syncing code to another repository" || echo "No changes to commit"

         - name: Push changes to target repository
           run: |
             git remote add target https://github.com/target-repo/target-repo-name.git
             git push target main
           env:
             GITHUB_TOKEN: ${{ secrets.TARGET_REPO_TOKEN }}
   ```

   **解釋**:

   - `actions/checkout@v3`: 下載源倉庫的代碼。
   - `git config`: 設置 Git 用戶名和郵箱。
   - `git commit`: 提交代碼變更。
   - `git push`: 推送變更到目標倉庫。

3. **測試與驗證**

   提交工作流程文件到源倉庫，然後推送到 `main` 分支或手動觸發工作流程。檢查目標倉庫是否正確同步了代碼。

### 跨倉庫的自動化任務

跨倉庫的自動化任務可以包括自動化測試、構建和部署等。以下是一個範例工作流程，用於在一個倉庫中觸發另一個倉庫的構建任務：

1. **創建觸發工作流程**

   在觸發源倉庫中，創建工作流程文件，例如 `trigger-build.yml`，並加入以下內容：

   ```yaml
   name: Trigger Build in Another Repository

   on:
     push:
       branches:
         - main
     workflow_dispatch:

   jobs:
     trigger:
       runs-on: ubuntu-latest

       steps:
         - name: Trigger build in target repository
           run: |
             curl -X POST \
               -H "Accept: application/vnd.github.v3+json" \
               -H "Authorization: token ${{ secrets.SOURCE_REPO_TOKEN }}" \
               https://api.github.com/repos/target-repo/target-repo-name/dispatches \
               -d '{"event_type": "build"}'
   ```

   **解釋**:

   - 使用 GitHub API `dispatches` 端點來觸發目標倉庫的構建。
   - `event_type` 可以自定義為任何你需要的事件類型。

2. **設置目標倉庫**

   在目標倉庫中，創建一個工作流程文件，例如 `build.yml`，並加入以下內容：

   ```yaml
   name: Build on Trigger

   on:
     repository_dispatch:
       types: [build]

   jobs:
     build:
       runs-on: ubuntu-latest

       steps:
         - name: Checkout code
           uses: actions/checkout@v3

         - name: Build project
           run: |
             echo "Running build tasks..."
             # 替換為實際的構建命令
   ```

   **解釋**:

   - 使用 `repository_dispatch` 來接收來自另一個倉庫的觸發事件。
   - 在接收到 `build` 事件時，執行構建任務。

3. **測試與驗證**

   提交觸發工作流程到源倉庫，推送到 `main` 分支或手動觸發工作流程。檢查目標倉庫是否執行了構建任務。

## 注意事項

### 管理跨倉庫的秘鑰和權限

確保所有跨倉庫操作的秘鑰和 token 都配置正確，並具有必要的權限。使用 GitHub Secrets 來安全地管理這些敏感信息。

### 多倉庫工作流程的錯誤處理

在跨倉庫操作中，考慮添加錯誤處理步驟，例如在工作流程中檢查 API 響應狀態碼，並在遇到錯誤時進行適當的處理或通知。

## 小結

跨倉庫協作和自動化可以顯著提高開發和部署效率。通過設置 GitHub Actions 工作流程來實現代碼同步和自動化任務，可以有效管理多倉庫環境中的複雜性。希望本文能幫助你掌握如何在 GitHub Actions 中配置和管理跨倉庫的自動化工作流程。
