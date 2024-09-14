## 第十八天：**把 Issue 同步到 Notion：編寫自定義 GitHub Action**

> 白居易在看到滿滿的 issue 後不經感嘆：「野火燒不盡，春風吹又生。」然後毅然決然地把 issue 同步到 Notion，這樣就不會忘記了。

今天，我們將介紹如何編寫一個自定義的 GitHub Action，將 GitHub 的 issue 自動同步到 Notion。這個工具將使你能夠將 GitHub 的問題跟踪和管理整合到 Notion 的資料庫中，讓問題管理更加高效。

## **1. 技術背景**

在這個教程中，我們將使用 GitHub Actions 來自動化從 GitHub 獲取 issue 並將其同步到 Notion。以下是我們將使用的技術和概念：

- **GitHub Actions**: 一種自動化工作流程的工具，允許你在特定事件（如推送、pull request 等）發生時執行自定義腳本。
- **Notion API**: 用於與 Notion 進行交互，包括讀取和寫入資料。
- **GitHub API**: 用於與 GitHub 進行交互，包括獲取 issue 的詳細信息。

## **2. 自定義 GitHub Action 設置**

### **步驟 1：設置專案結構**

首先，創建一個新的 GitHub 存儲庫來容納我們的自定義 Action。結構如下：

```
github-issue-2-notion/
├── action.yml
├── script.js
└── README.md
```

### **步驟 2：編寫 Action 配置文件**

在 `action.yml` 文件中，定義 Action 的輸入、執行和輸出。以下是 `action.yml` 的內容：

```yaml
name: 'Sync GitHub Issues to Notion'
description: 'Synchronize GitHub issues to a Notion database'
inputs:
  repo:
    description: 'The GitHub repository (e.g., owner/repo)'
    required: true
  NOTION_API_KEY:
    description: 'The API key for the Notion integration'
    required: true
  NOTION_DATABASE_ID:
    description: 'The ID of the Notion database'
    required: true
runs:
  using: 'node12'
  steps:
    - name: Run script
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    - run: npm install
    - run: node script.js
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        NOTION_API_KEY: ${{ inputs.NOTION_API_KEY }}
        NOTION_DATABASE_ID: ${{ inputs.NOTION_DATABASE_ID }}
```

### **步驟 3：編寫 Node.js 腳本**

在 `script.js` 文件中，編寫 Node.js 腳本來實現從 GitHub 獲取 issue 並同步到 Notion。以下是 `script.js` 的完整內容：

```javascript
/** @format */

const core = require("@actions/core");
const axios = require("axios");
const { markdownToBlocks } = require("@tryfabric/martian");

async function main() {
    const repo = core.getInput("repo");
    const notionToken = core.getInput("NOTION_API_KEY");
    const notionDatabaseId = core.getInput("NOTION_DATABASE_ID");

    // GitHub Issues API URL
    const issuesUrl = `https://api.github.com/repos/${repo}/issues?state=all`;

    // Fetch issues from GitHub
    const issuesResponse = await axios.get(issuesUrl, {
        headers: {
            "User-Agent": "request",
            "Authorization": `token ${process.env.GITHUB_TOKEN}`
        }
    });
    
    for (const issue of issuesResponse.data) {
        const issueId = issue.id;
        const notionUrl = `https://api.notion.com/v1/databases/${notionDatabaseId}/query`;

        // Check if the issue already exists in Notion
        const notionResponse = await axios.post(notionUrl, {
            filter: {
                property: "ID",
                number: {
                    equals: issueId
                }
            }
        }, {
            headers: {
                Authorization: `Bearer ${notionToken}`,
                "Notion-Version": "2022-06-28",
                "Content-Type": "application/json"
            }
        });

        const body = {
            parent: { database_id: notionDatabaseId },
            icon: {
                emoji: "⚡"
            },
            properties: {
                Name: {
                    title: [
                        {
                            text: {
                                content: issue.title
                            }
                        }
                    ]
                },
                ID: {
                    number: issueId
                },
                State: {
                    select: {
                        name: issue.state.charAt(0).toUpperCase() + issue.state.slice(1)
                    }
                },
                Status: {
                    status: {
                        name: "Not started"
                    }
                },
                Labels: {
                    multi_select: issue.labels.map(label => ({
                        name: label.name
                    }))
                },
                URL: {
                    url: issue.html_url
                }
            },
            children: issue.body != null ? markdownToBlocks(issue.body) : []
        };

        if (notionResponse.data.results.length > 0) {
            console.log(`Issue ${issueId} already exists in Notion, updating it`);
            // Update existing issue
            const notionPageId = notionResponse.data.results[0].id;
            delete body.properties.Status;
            await axios.patch(`https://api.notion.com/v1/pages/${notionPageId}`, body, {
                headers: {
                    Authorization: `Bearer ${notionToken}`,
                    "Content-Type": "application/json",
                    "Notion-Version": "2022-06-28"
                }
            });
        } else {
            console.log(`Creating new issue ${issueId} in Notion`);
            // Create new issue
            await axios.post("https://api.notion.com/v1/pages", body, {
                headers: {
                    Authorization: `Bearer ${notionToken}`,
                    "Content-Type": "application/json",
                    "Notion-Version": "2022-06-28"
                }
            });
            console.log(`Issue ${issueId} created in Notion`);
        }
    }
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
```

### **步驟 4：設置 GitHub Secrets**

在 GitHub 存儲庫的設置中，添加以下 Secrets：

- `NOTION_API_KEY`: 你的 Notion API 密鑰。
- `NOTION_DATABASE_ID`: 你的 Notion 資料庫 ID。

### **步驟 5：創建工作流程文件**

在你的 GitHub 存儲庫的 `.github/workflows` 目錄下創建一個新的 YAML 文件，例如 `sync-issues.yml`，並添加以下內容：

```yaml
name: Sync GitHub Issues to Notion

on:
  issues:
    types: [opened, edited, deleted, closed, reopened]
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repository
      uses: actions/checkout@v2

    - name: Sync issues to Notion
      uses: ./path-to-your-action  # 使用自定義 Action 的路徑
      with:
        repo: ${{ github.repository }}
        NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
        NOTION_DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID }}
```

## **3. 補充知識**

### **如何直接串接已完成的工具**

如果你想直接使用已完成的工具，可以簡單地按照以下步驟進行：

1. **複製工具**: 在你的 GitHub 存儲庫中複製並設置 `action.yml` 和 `script.js` 文件。
2. **設置 Secrets**: 確保在 GitHub 存儲庫的 Secrets 中添加所有必要的憑證。
3. **創建工作流程**: 在 `.github/workflows` 目錄下創建工作流程文件，並引用你的自定義 Action。

### **常用技巧**

1. **錯誤處理**: 在腳本中加入錯誤處理，確保在 API 請求失敗時能夠獲取清晰的錯誤信息。
2. **環境變數**: 使用環境變數來儲存敏感信息，確保不將敏感數據寫入代碼中。
3. **測試和調試**: 在本地測試腳本，使用工具如 `curl` 和 `Postman` 來確保 API 請求正常工作。

## **小結**

今天我們探討了如何編寫一個 GitHub Action 來將 GitHub 的 issue 同步到 Notion。通過這個實踐，我們掌握了如何使用 Node.js 和 GitHub Actions 來自動化從 GitHub 獲取問題並更新 Notion 資料庫的過程。希望這篇教程能幫助你更高效地管理問題並保持項目組織的井然有序。