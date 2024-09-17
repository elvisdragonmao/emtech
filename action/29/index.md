# 自動化維護與清理：自動關閉長時間未處理的 Issue 和 PR

> 《後漢書·卷六十六 陳王列傳》：「一屋不掃，何以掃天下？」

**引言**

在持續運行的開源或企業倉庫中，管理問題（issues）和拉取請求（PRs）是維護工作的重要部分。隨著時間的推移，未處理的 issue 和 PR 可能會累積，影響倉庫的健康和開發效率。使用 GitHub Actions 進行自動化維護和清理，可以減少手動工作，確保倉庫保持整潔。本文將介紹如何設置 GitHub Actions 來自動關閉長時間未處理的 issue 和 PR，提升維護效率。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/29>

## 為什麼需要自動化維護？

未處理的 issue 和 PR 可能會影響倉庫的運行效率。自動化維護有助於：

- **保持倉庫整潔**：及時處理或關閉過期的問題和請求。
- **提升開發效率**：減少維護人員的工作量，讓他們專注於當前和重要的問題。
- **改進問題追蹤**：自動化的清理過程能夠讓倉庫的問題管理更加系統化和高效。

## 技巧與實作

### 自動關閉未處理的 Issue

1. **創建工作流程文件**

   在你的倉庫中，創建一個工作流程文件，例如 `cleanup-issues.yml`，並加入以下內容：

   ```yaml
   name: Clean Up Old Issues

   on:
     schedule:
       - cron: '0 0 * * *'  # 每天午夜運行

   jobs:
     cleanup:
       runs-on: ubuntu-latest

       steps:
         - name: Checkout repository
           uses: actions/checkout@v2

         - name: Set up Python
           uses: actions/setup-python@v3
           with:
             python-version: '3.9'

         - name: Install dependencies
           run: |
             pip install requests

         - name: Run issue cleanup script
           run: python scripts/cleanup_issues.py
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

   **解釋**:
   - `on.schedule`: 設置自動運行的時間間隔，此處為每天午夜。
   - `actions/setup-python`: 配置 Python 環境。
   - `cleanup_issues.py`: 自定義 Python 腳本，用於處理未處理的 issue。

2. **編寫清理腳本**

   在 `scripts` 目錄中，創建 `cleanup_issues.py` 腳本，並加入以下內容：

   ```python
   import requests
   from datetime import datetime, timedelta
   import os

   # GitHub API URL
   API_URL = 'https://api.github.com/repos/{owner}/{repo}/issues'
   TOKEN = os.getenv('GITHUB_TOKEN')

   # 設置要過期的天數
   EXPIRY_DAYS = 30

   def get_old_issues():
       headers = {'Authorization': f'token {TOKEN}'}
       response = requests.get(API_URL.format(owner='your-username', repo='your-repo'), headers=headers)
       issues = response.json()

       old_issues = []
       for issue in issues:
           created_at = datetime.strptime(issue['created_at'], '%Y-%m-%dT%H:%M:%SZ')
           if (datetime.utcnow() - created_at) > timedelta(days=EXPIRY_DAYS):
               old_issues.append(issue)

       return old_issues

   def close_issues(issues):
       headers = {'Authorization': f'token {TOKEN}', 'Accept': 'application/vnd.github.v3+json'}
       for issue in issues:
           issue_number = issue['number']
           url = f'https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}'
           requests.patch(url, headers=headers, json={'state': 'closed'})
           print(f'Closed issue #{issue_number}')

   if __name__ == '__main__':
       old_issues = get_old_issues()
       close_issues(old_issues)
   ```

   **解釋**:
   - `get_old_issues()`: 獲取超過指定天數的舊 issue。
   - `close_issues()`: 關閉過期的 issue。
   - 使用 GitHub API 來獲取和更新 issue。

3. **測試與驗證**

   提交工作流程文件和清理腳本到倉庫，檢查 GitHub Actions 是否按預期運行，並確保舊的 issue 被自動關閉。

### 自動關閉未處理的 PR

1. **創建工作流程文件**

   在倉庫中，創建一個工作流程文件，例如 `cleanup-prs.yml`，並加入以下內容：

   ```yaml
   name: Clean Up Old PRs

   on:
     schedule:
       - cron: '0 0 * * *'  # 每天午夜運行

   jobs:
     cleanup:
       runs-on: ubuntu-latest

       steps:
         - name: Checkout repository
           uses: actions/checkout@v2

         - name: Set up Python
           uses: actions/setup-python@v3
           with:
             python-version: '3.9'

         - name: Install dependencies
           run: |
             pip install requests

         - name: Run PR cleanup script
           run: python scripts/cleanup_prs.py
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

   **解釋**:
   - 同樣的調度設置和 Python 環境配置。

2. **編寫清理腳本**

   在 `scripts` 目錄中，創建 `cleanup_prs.py` 腳本，並加入以下內容：

   ```python
   import requests
   from datetime import datetime, timedelta
   import os

   # GitHub API URL
   API_URL = 'https://api.github.com/repos/{owner}/{repo}/pulls'
   TOKEN = os.getenv('GITHUB_TOKEN')

   # 設置要過期的天數
   EXPIRY_DAYS = 30

   def get_old_prs():
       headers = {'Authorization': f'token {TOKEN}'}
       response = requests.get(API_URL.format(owner='your-username', repo='your-repo'), headers=headers)
       prs = response.json()

       old_prs = []
       for pr in prs:
           created_at = datetime.strptime(pr['created_at'], '%Y-%m-%dT%H:%M:%SZ')
           if (datetime.utcnow() - created_at) > timedelta(days=EXPIRY_DAYS):
               old_prs.append(pr)

       return old_prs

   def close_prs(prs):
       headers = {'Authorization': f'token {TOKEN}', 'Accept': 'application/vnd.github.v3+json'}
       for pr in prs:
           pr_number = pr['number']
           url = f'https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}'
           requests.patch(url, headers=headers, json={'state': 'closed'})
           print(f'Closed PR #{pr_number}')

   if __name__ == '__main__':
       old_prs = get_old_prs()
       close_prs(old_prs)
   ```

   **解釋**:
   - `get_old_prs()`: 獲取超過指定天數的舊 PR。
   - `close_prs()`: 關閉過期的 PR。

3. **測試與驗證**

   提交工作流程文件和清理腳本到倉庫，檢查 GitHub Actions 是否按預期運行，並確保舊的 PR 被自動關閉。

## 高級配置

### 管理權限和秘密

確保 GitHub Token 擁有足夠的權限來讀取和修改 issue 和 PR 的狀態。使用 GitHub Secrets 來安全地管理這些敏感信息。

### 定制化設置

根據需要定制清理條件，例如過期天數，或在清理前發送通知。可以在腳本中添加額外的邏輯來適應不同的情況。

## 小結

自動化維護和清理是保持倉庫健康的重要策略。通過設置 GitHub Actions 自動關閉長時間未處理的 issue 和 PR，可以提高維護效率，確保倉庫的整潔。希望本文能幫助你實現自動化維護，提升工作流程的自動化程度。