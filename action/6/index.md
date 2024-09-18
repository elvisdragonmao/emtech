# 有意見就說 - 編輯後自動提 Pull Request

> 《三國演義》第六 ○ 回：「竊聞：『 良藥苦口利於病 ，忠言逆耳利於行。』」處理 Issue 和 PR 很煩但十分重要。

今天我們要來探討如何讓 GitHub Actions 在進行操作後提 Pull Request（PR）。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/6>

## 國小複習：Pull Request 是什麼？

1. **什麼是 Pull Request？**

   - Pull Request 是一個 Git 工作流中的重要部分，它允許開發者在完成某些功能或修復後，將變更合併到另一個分支（如 `main` 或 `master`）之前進行代碼審核。通過 PR，團隊成員可以檢查代碼、提出建議、討論改進點，並最終合併變更。

2. **如何進行 Git 合併？**

   - `git merge` 命令用於將不同分支的變更合併到一起。通常在合併前，你需要確保本地代碼庫是最新的，並解決可能存在的衝突。

3. **如何在 GitHub Actions 中自動提 PR？**
   - 我們可以使用 GitHub Actions 的 `gh` CLI 工具來自動創建 Pull Request，或者使用 GitHub API。
   - 也可以使用現成的 Action，如 `peter-evans/create-pull-request`，來簡化 PR 的創建過程。

## 實作：自動提 Pull Request

### 步驟 1：設置 GitHub Actions 工作流程

在你的專案中，創建一個新的 GitHub Actions 工作流程文件，例如 `.github/workflows/create-pr.yml`。

```yaml
name: 建立 PR

on:
  push:
    branches:
      - main # 當推送到 main 分支時觸發工作流程

jobs:
  create-pr:
    runs-on: ubuntu-latest

    steps:
      - name: 檢出代碼
        uses: actions/checkout@v2

      - name: 設置 Git
        run: |
          git config --global user.name "GitHub Actions"
          git config --global user.email "actions@github.com"

      - name: 安裝 GitHub CLI
        run: sudo apt-get install gh

      - name: 創建新分支並進行變更
        run: |
          git checkout -b update-branch
          echo "// Code change made by GitHub Actions" >> file.txt
          git add file.txt
          git commit -m "Automated commit by GitHub Actions"

      - name: 推送變更並創建 Pull Request
        run: |
          git push origin update-branch
          gh auth login --with-token < ${{ secrets.GITHUB_TOKEN }}
          gh pr create --title "Automated PR" --body "This is an automated PR created by GitHub Actions" --base main --head update-branch
```

**YAML 文件解析：**

- **`on: push:`** 設定當推送到 `main` 分支時觸發這個工作流程。
- **`actions/checkout@v2:`** 檢出代碼，以便進行後續操作。
- **`設置 Git:`** 配置 Git 用戶名和電子郵件，以便進行提交。
- **`安裝 GitHub CLI:`** 安裝 GitHub CLI 工具，用於創建 PR。
- **`創建新分支並進行變更:`** 創建新分支，進行代碼變更，並提交這些變更。
- **`推送變更並創建 Pull Request:`** 推送新分支到遠端，使用 `gh` CLI 創建 PR。

## 步驟 2：測試工作流程

1. **推送變更到 `main` 分支**

   ```bash
   git add .github/workflows/create-pr.yml
   git commit -m "Add workflow to create PR"
   git push origin main
   ```

2. **檢查工作流程**

   - 進入 GitHub 倉庫的 `Actions` 標籤頁，查看工作流程的執行情況。如果一切正常，你會看到工作流程自動創建了一個新的 Pull Request。

## 沒事幹嘛提 PR？

以下是幾個利用場景，可以使用自動化創建 PR 的工作流程：

1. **自動化代碼審核：**
   - 通過自動創建 PR，可以自動觸發代碼審核流程，幫助團隊更快地檢查和合併變更。
   - PR 提供了一個討論和審核的平台，讓團隊成員可以就代碼變更進行討論和提出建議。
   - PR 可以幫助團隊確保代碼品質和一致性，並減少潛在的錯誤和問題。
2. **讓自動化操作不要直接更改主分支：**
   - 通過創建 PR，可以在變更被合併到主分支之前進行審核和測試，從而減少對主分支的直接變更。
   - PR 提供了一個安全的方式來管理代碼變更，確保變更是經過審核和測試的。

## 練習：Prettier 格式化後自動提 PR

我們來結合昨天學過的 Prettier 格式化工作流程，將格式化後的代碼變更自動提交到新的分支，並創建 PR。這次我們使用 `peter-evans/create-pull-request@v5` 這個現成的 Action 來創建 PR。

```yaml
name: Prettier Check

on: [push, pull_request]

jobs:
  prettier:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm install prettier

      - name: Run Prettier check
        id: prettier
        run: npx prettier —check .

      - name: Run Prettier format (if needed)
        if: ${{ failure() }}
        run: npx prettier —write .

      - name: Create Pull Request
        if: ${{ failure() }}
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: "fix: format code with Prettier"
          branch: prettier-fixes
          committer: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>
          author: ${{ github.actor }} <${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com>
          signoff: true
          delete-branch: true
          title: "fix: format code with Prettier"
          body: "This pull request fixes the code formatting issues identified by Prettier."
```

這個工作流程會在每次推送或 PR 時運行 Prettier 檢查，如果發現格式問題，則自動進行格式化並創建 PR。這樣可以確保代碼庫中的代碼始終保持一致的格式。

## 常用技巧與注意事項

1. **檢查分支和目標：**

   - 確保你在創建 PR 時選擇了正確的源分支和目標分支。`--base` 參數指定了 PR 的目標分支（例如 `main`），`--head` 參數指定了源分支（例如 `update-branch`）。

2. **處理 GitHub CLI 認證：**

   - 使用 GitHub Token 時，請確保 Token 擁有足夠的權限來創建 PR 和進行其他操作。

3. **代碼變更的策略：**

   - 在自動創建 PR 時，建議只做小範圍的代碼變更，以避免引入潛在的問題。如果需要大範圍的變更，請仔細檢查代碼。

4. **自動合併 PR：**

   - 如果希望在 PR 被創建後自動合併，可以在工作流程中添加相應的操作。你可以使用 GitHub API 或 CLI 進行自動合併操作。

5. **更新 PR 標題和描述：**
   - 可以根據實際需要自定義 PR 的標題和描述，提供更多上下文信息，讓審核者更容易理解變更內容。也許你有發現創建 PR 其實有很多的參數可以設定。像是標籤、指派人、屬於的專案等等。

## 結語

今天我們探討了如何在 GitHub Actions 中自動創建 Pull Request。我們設置了一個工作流程，從創建分支、提交變更，到推送和創建 PR。明天我們要來談談不同的時間觸發器，以及如何設置定時任務和手動觸發工作流程。
