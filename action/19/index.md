## 第十九天：**集成第三方服務：自動化 Issue 管理和代碼審查**

> 戰國時期張儀遊說各國開放 API 給秦整合，才能夠瓦解合縱聯盟。

在這篇教程中，我們將探討如何集成外部 API 和服務，自動化 GitHub issue 管理，並使用 Coderabbit 自動進行代碼審查。我們將使用 GitHub Actions 來實現這些自動化功能。

## **1. 技術背景**

- **GitHub API**: 允許我們與 GitHub 平台進行交互，包括管理 issues。
- **Coderabbit API**: 用於自動化代碼審查，幫助確保代碼質量。

## **2. 自動化 GitHub Issue 管理**

### **步驟 1：設置 GitHub Actions 工作流程**

我們首先需要設置一個 GitHub Actions 工作流程，當有新的 issue 創建或更新時，自動執行指定操作。例如，我們可以自動為新創建的 issue 標籤。

在 `.github/workflows` 目錄下創建一個 YAML 文件，例如 `issue-management.yml`，並添加以下內容：

```yaml
name: Manage GitHub Issues

on:
  issues:
    types: [opened, edited]

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Label new issues
        uses: actions/github-script@v6
        with:
          script: |
            const issue = context.issue;
            const labels = ['new-issue'];
            await github.issues.addLabels({
              ...issue,
              labels
            });
```

這個工作流程在每次 issue 被創建或更新時自動為其添加一個標籤 `new-issue`。

### **步驟 2：自動處理 Issue**

假設我們想要在 issue 被標記為 `bug` 時，自動將其分配給一個特定的用戶。我們可以擴展上述 YAML 文件：

```yaml
name: Manage GitHub Issues

on:
  issues:
    types: [opened, edited]

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Label new issues
        uses: actions/github-script@v6
        with:
          script: |
            const issue = context.issue;
            const labels = ['new-issue'];
            await github.issues.addLabels({
              ...issue,
              labels
            });

      - name: Assign bug issues
        if: contains(github.event.issue.labels.*.name, 'bug')
        uses: actions/github-script@v6
        with:
          script: |
            const issue = context.issue;
            await github.issues.addAssignees({
              ...issue,
              assignees: ['specific-user']
            });
```

## **3. 使用 Coderabbit 進行自動化代碼審查**

### **步驟 1：註冊並獲取 API 密鑰**

首先，註冊 Coderabbit 並獲取 API 密鑰。這些密鑰用於在請求中進行身份驗證。

### **步驟 2：設置 GitHub Actions 工作流程**

我們需要設置一個工作流程，當有新的代碼提交時，調用 Coderabbit 進行代碼審查。在 `.github/workflows` 目錄下創建一個新的 YAML 文件，例如 `code-review.yml`，並添加以下內容：

```yaml
name: Code Review with Coderabbit

on:
  push:
    branches:
      - main

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Install dependencies
        run: npm install

      - name: Run Coderabbit Code Review
        env:
          CODERABBIT_API_KEY: ${{ secrets.CODERABBIT_API_KEY }}
        run: |
          curl -X POST "https://api.coderabbit.io/review" \
          -H "Authorization: Bearer $CODERABBIT_API_KEY" \
          -H "Content-Type: application/json" \
          -d '{
                "repository": "${{ github.repository }}",
                "branch": "${{ github.ref }}",
                "commit": "${{ github.sha }}",
                "message": "Automated code review"
              }'
```

這個工作流程會在每次推送到 `main` 分支時自動執行 Coderabbit 代碼審查。

## **4. 補充知識**

### **如何調試和測試**

- **GitHub Actions**: 在 GitHub Actions 中，你可以查看每次工作流程運行的詳細日誌。這有助於調試問題。
- **API 測試工具**: 使用工具如 Postman 來測試 API 請求，確保其正確性。
- **Secrets 管理**: 確保將敏感信息（如 API 密鑰）儲存在 GitHub Secrets 中，以防止洩露。

### **常用技巧**

1. **使用 API 限制**: 適當設置 API 請求的頻率，以避免超過服務的限制。
2. **錯誤處理**: 在腳本中加入錯誤處理代碼，確保在請求失敗時能夠獲取清晰的錯誤信息。
3. **保持更新**: 定期檢查和更新第三方 API 的版本和文檔，以便適應 API 的變更。

## **小結**

今天，我們探討了如何使用 GitHub Actions 自動化 issue 管理，並集成 Coderabbit 進行代碼審查。我們掌握了如何利用外部 API 來提高開發效率，並確保代碼質量。希望這篇教程能幫助你更高效地管理項目和代碼。