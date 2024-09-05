### 第六天：有意見就說：編輯後自動提 Pull Request

> 《三國演義》第六○回：「竊聞：『 良藥苦口利於病 ，忠言逆耳利於行。』」處理 Issue 和 PR 很煩但也十分重要。

在今天的文章中，我們將學習如何在 GitHub Actions 中自動提 Pull Request（PR）。這是一個在代碼有變更後自動創建 PR 的流程，從而簡化代碼審核和合併的過程。這個過程涉及到 Git 合併操作、PR 創建和審核。讓我們一起來看看如何實作這個流程。

#### 技巧：使用 Git 合併和 Pull Request 操作

1. **什麼是 Pull Request？**
   - Pull Request 是一個 Git 工作流中的重要部分，它允許開發者在完成某些功能或修復後，將變更提交到主分支（如 `main` 或 `master`）之前進行代碼審核。通過 PR，團隊成員可以檢查代碼、提出建議、討論改進點，並最終合併變更。

2. **如何進行 Git 合併？**
   - `git merge` 命令用於將不同分支上的變更合併到一起。通常在合併前，你需要確保本地代碼庫是最新的，並解決可能存在的衝突。

3. **如何在 GitHub Actions 中自動提 PR？**
   - 我們可以使用 GitHub Actions 的 `gh` CLI 工具來自動創建 Pull Request，或者使用 GitHub API。

#### 實作：自動提 Pull Request

**步驟 1：設置 GitHub Actions 工作流程**

1. **創建 GitHub Actions 工作流程文件**

   在你的專案中，創建一個新的 GitHub Actions 工作流程文件，例如 `.github/workflows/create-pr.yml`。

   ```yaml
   name: Create Pull Request

   on:
     push:
       branches:
         - main  # 當推送到 main 分支時觸發工作流程

   jobs:
     create-pr:
       runs-on: ubuntu-latest

       steps:
       - name: Check out the code
         uses: actions/checkout@v2

       - name: Set up Git
         run: |
           git config --global user.name "GitHub Actions"
           git config --global user.email "actions@github.com"

       - name: Install GitHub CLI
         run: sudo apt-get install gh

       - name: Create a new branch and make changes
         run: |
           git checkout -b update-branch
           echo "// Code change made by GitHub Actions" >> file.txt
           git add file.txt
           git commit -m "Automated commit by GitHub Actions"

       - name: Push changes and create Pull Request
         run: |
           git push origin update-branch
           gh auth login --with-token < ${{ secrets.GITHUB_TOKEN }}
           gh pr create --title "Automated PR" --body "This is an automated PR created by GitHub Actions" --base main --head update-branch
   ```

   **YAML 文件解析：**
   - **`on: push:`** 設定當推送到 `main` 分支時觸發這個工作流程。
   - **`actions/checkout@v2:`** 檢出代碼，以便進行後續操作。
   - **`Set up Git:`** 配置 Git 用戶名和電子郵件，以便進行提交。
   - **`Install GitHub CLI:`** 安裝 GitHub CLI 工具，用於創建 PR。
   - **`Create a new branch and make changes:`** 創建新分支，進行代碼變更，並提交這些變更。
   - **`Push changes and create Pull Request:`** 推送新分支到遠端，使用 `gh` CLI 創建 PR。

2. **添加 GitHub Token**

   - 你需要為 GitHub Actions 配置一個 GitHub Token 以授權 `gh` CLI 操作。這個 Token 可以通過 GitHub 的 Secret 管理功能創建並存儲：
     - 進入 GitHub 仓库的 `Settings` -> `Secrets` -> `New repository secret`。
     - 將 `GITHUB_TOKEN` 作為密鑰，並將其值設置為 GitHub Token。

**步驟 2：測試工作流程**

1. **推送變更到 `main` 分支**

   ```bash
   git add .github/workflows/create-pr.yml
   git commit -m "Add workflow to create PR"
   git push origin main
   ```

2. **檢查工作流程**

   - 進入 GitHub 仓库的 `Actions` 標籤頁，查看工作流程的執行情況。如果一切正常，你會看到工作流程自動創建了一個新的 Pull Request。

#### 常用技巧與注意事項

1. **檢查分支和目標：**
   - 確保你在創建 PR 時選擇了正確的源分支和目標分支。`--base` 參數指定了 PR 的目標分支（例如 `main`），`--head` 參數指定了源分支（例如 `update-branch`）。

2. **處理 GitHub CLI 認證：**
   - 使用 GitHub Token 時，請確保 Token 擁有足夠的權限來創建 PR 和進行其他操作。

3. **代碼變更的策略：**
   - 在自動創建 PR 時，建議只做小範圍的代碼變更，以避免引入潛在的問題。如果需要大範圍的變更，請仔細檢查代碼。

4. **自動合併 PR：**
   - 如果希望在 PR 被創建後自動合併，可以在工作流程中添加相應的操作。你可以使用 GitHub API 或 CLI 進行自動合併操作。

5. **更新 PR 標題和描述：**
   - 可以根據實際需要自定義 PR 的標題和描述，提供更多上下文信息，讓審核者更容易理解變更內容。

#### 結語

今天我們學習了如何在 GitHub Actions 中自動創建 Pull Request，並探索了 Git 合併和 PR 操作的基本技巧。我們設置了一個工作流程，從創建分支、提交變更，到推送和創建 PR。這種自動化流程可以大大提高代碼管理的效率，減少手動操作的工作量。