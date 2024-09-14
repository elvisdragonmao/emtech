# 第十七天：**把 Notion 待辦事項放到 Discord 頻道：編寫自定義 Actions（Bash 版）**

> 孔子能從心所欲不逾矩。正是因為他能夠自定義 Actions，把 Notion 待辦事項放到 Discord 頻道。

今天，我們將介紹如何使用 Bash 腳本編寫 GitHub Actions，自動從 Notion 獲取待辦事項並更新到 Discord 頻道。這是一個很好的實踐案例，能幫助你了解如何利用 Bash 腳本和 GitHub Actions 進行自動化操作。

## **1. 了解 Bash 自定義 Actions**

Bash 自定義 Actions 允許我們使用 Shell 腳本來執行操作。這是一種簡單且強大的方式，可以實現許多自動化需求。相較於 JavaScript 自定義 Actions，Bash 版本通常較為簡單，適合用來執行簡單的 Shell 命令和操作。

## **2. 創建自定義 Bash Action**

### **步驟 1：設置專案結構**

首先，創建一個新的 GitHub 存儲庫來容納我們的自定義 Action。在存儲庫中，創建以下目錄結構：

```
my-custom-action/
├── action.yml
├── script.sh
└── README.md
```

### **步驟 2：編寫 Action 配置文件**

在 `action.yml` 文件中，我們需要定義 Action 的輸入、執行和輸出。以下是 `action.yml` 的範例內容：

```yaml
name: 'Update Notion to Discord'
description: 'Fetch tasks from Notion and update Discord channel'
inputs:
  notion_database_id:
    description: 'Notion database ID'
    required: true
  notion_token:
    description: 'Notion API token'
    required: true
  discord_channel_id:
    description: 'Discord channel ID'
    required: true
  discord_token:
    description: 'Discord bot token'
    required: true
runs:
  using: 'composite'
  steps:
    - name: Run script
      run: ./script.sh
      env:
        NOTION_DATABASE_ID: ${{ inputs.notion_database_id }}
        NOTION_TOKEN: ${{ inputs.notion_token }}
        DISCORD_CHANNEL_ID: ${{ inputs.discord_channel_id }}
        DISCORD_TOKEN: ${{ inputs.discord_token }}
```

### **步驟 3：編寫 Bash 腳本**

在 `script.sh` 文件中，我們將編寫 Bash 腳本來實現具體的操作。以下是 `script.sh` 的內容：

```bash
#!/bin/bash

set -e

update_tasks() {
    local notion_database_id="$NOTION_DATABASE_ID"
    local notion_token="$NOTION_TOKEN"
    local discord_channel_id="$DISCORD_CHANNEL_ID"
    local discord_token="$DISCORD_TOKEN"
    
    # 從 Notion 獲取待辦事項
    response=$(curl -s -X POST -H "Authorization: ${notion_token}" -H "Notion-Version: 2022-06-28" -H "Content-Type: application/json" "https://api.notion.com/v1/databases/${notion_database_id}/query")
    
    if [ -n "$(echo "${response}" | jq '.results')" ]; then
        not_started_count=0
        in_progress_count=0
        for row in $(echo "${response}" | jq -r '.results[] | @base64'); do
            status_name=$(echo "${row}" | base64 -d | jq -r '.properties.Status.status.name')
            echo "${status_name}"
            if [ "${status_name}" = "Not started" ]; then
                (( not_started_count++ ))
            elif [ "${status_name}" = "In progress" ]; then
                (( in_progress_count++ ))
            fi
        done
        
        # 更新 Discord 頻道標題
        update_discord_channel_title "還有 ${not_started_count} 件事沒人做"
        update_discord_channel_title "${in_progress_count} 件事處理中"
    else
        echo "Error: Unable to retrieve data from Notion API."
        exit 1
    fi
}

update_discord_channel_title() {
    local new_title="$1"
    local channel_id="$DISCORD_CHANNEL_ID"
    local url="https://discord.com/api/v10/channels/${channel_id}"
    local token="Bot ${DISCORD_TOKEN}"
    
    response=$(curl -s -X PATCH -H "Authorization: ${token}" -H "Content-Type: application/json" -d "{\"name\": \"${new_title}\"}" "${url}")
    updated_title=$(echo "${response}" | jq -r '.name')
    echo "Channel title updated successfully: ${updated_title}"
}

update_tasks
```

在腳本中，我們使用 `curl` 來從 Notion API 獲取待辦事項，並根據狀態更新 Discord 頻道的標題。

### **步驟 4：設置執行權限**

確保 `script.sh` 文件具有執行權限。可以使用以下命令來設置：

```bash
chmod +x script.sh
```

### **步驟 5：編寫 README**

在 `README.md` 文件中，簡單描述如何使用這個自定義 Action。例如：

```markdown
# Update Notion to Discord Action

This GitHub Action fetches tasks from Notion and updates a Discord channel with the task counts.

## Inputs

- `notion_database_id`: The ID of the Notion database.
- `notion_token`: The Notion API token.
- `discord_channel_id`: The ID of the Discord channel.
- `discord_token`: The Discord bot token.

## Example Usage

```yaml
name: Update Notion to Discord

on:
  push:
    branches:
      - main

jobs:
  update:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v2

    - name: Run custom action
      uses: ./path-to-action
      with:
        notion_database_id: ${{ secrets.NOTION_DATABASE_ID }}
        notion_token: ${{ secrets.NOTION_TOKEN }}
        discord_channel_id: ${{ secrets.DISCORD_CHANNEL_ID }}
        discord_token: ${{ secrets.DISCORD_TOKEN }}
```
```

## **3. 配置 GitHub Actions 工作流程**

創建一個 GitHub Actions 工作流程來使用我們的自定義 Action。在 `.github/workflows` 目錄下創建一個新的 YAML 文件，例如 `main.yml`，並添加以下內容：

```yaml
name: Update Notion to Discord

on:
  push:
    branches:
      - main

jobs:
  update:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v2

    - name: Use custom action
      uses: ./  # 使用自定義 Action 的路徑
      with:
        notion_database_id: ${{ secrets.NOTION_DATABASE_ID }}
        notion_token: ${{ secrets.NOTION_TOKEN }}
        discord_channel_id: ${{ secrets.DISCORD_CHANNEL_ID }}
        discord_token: ${{ secrets.DISCORD_TOKEN }}
```

## **4. 設置 GitHub Secrets**

在 GitHub 存儲庫的設置中，添加所需的 Secrets：

- `NOTION_DATABASE_ID`
- `NOTION_TOKEN`
- `DISCORD_CHANNEL_ID`
- `DISCORD_TOKEN`

這些 Secrets 將用於在 Action 中安全地傳遞敏感信息。

## **5. 運行和測試**

當你將更改推送到 GitHub 存儲庫後，GitHub Actions 將會自動運行你的工作流程。你可以查看 Actions 頁面，確保自定義 Action 正確執行並更新 Discord 頻道標題。

## JavaScript 版本


### **步驟 1：設置專案結構**

首先，我們需要創建一個新的 GitHub 存儲庫來容納我們的自定義 Action。在存儲庫中，創建以下目錄結構：

```
my-custom-action/
├── action.yml
├── src/
│   └── index.js
└── package.json
```

### **步驟 2：編寫 Action 配置文件**

在 `action.yml` 文件中，我們需要定義 Action 的輸入、執行和輸出。以下是 `action.yml` 的範例內容：

```yaml
name: 'Update Notion to Discord'
description: 'Fetch tasks from Notion and update Discord channel'
inputs:
  notion_database_id:
    description: 'Notion database ID'
    required: true
  notion_token:
    description: 'Notion API token'
    required: true
  discord_channel_id:
    description: 'Discord channel ID'
    required: true
  discord_token:
    description: 'Discord bot token'
    required: true
runs:
  using: 'node12'
  main: 'src/index.js'
```

### **步驟 3：編寫 Action 腳本**

在 `src/index.js` 文件中，我們將編寫 JavaScript 代碼來完成具體的操作。以下是 `index.js` 的內容：

```javascript
const core = require('@actions/core');
const axios = require('axios');

async function updateTasks() {
    try {
        // 讀取輸入參數
        const notionDatabaseId = core.getInput('notion_database_id');
        const notionToken = core.getInput('notion_token');
        const discordChannelId = core.getInput('discord_channel_id');
        const discordToken = core.getInput('discord_token');
        
        // 從 Notion 獲取待辦事項
        const notionResponse = await axios.post(`https://api.notion.com/v1/databases/${notionDatabaseId}/query`, {}, {
            headers: {
                'Authorization': `Bearer ${notionToken}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            }
        });

        let notStartedCount = 0;
        let inProgressCount = 0;

        // 解析 Notion API 的響應
        notionResponse.data.results.forEach(result => {
            const status = result.properties.Status.status.name;
            if (status === 'Not started') {
                notStartedCount++;
            } else if (status === 'In progress') {
                inProgressCount++;
            }
        });

        // 更新 Discord 頻道標題
        await axios.patch(`https://discord.com/api/v10/channels/${discordChannelId}`, {
            name: `還有 ${notStartedCount} 件事沒人做`
        }, {
            headers: {
                'Authorization': `Bot ${discordToken}`,
                'Content-Type': 'application/json'
            }
        });

        await axios.patch(`https://discord.com/api/v10/channels/${discordChannelId}`, {
            name: `${inProgressCount} 件事處理中`
        }, {
            headers: {
                'Authorization': `Bot ${discordToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Discord channel title updated successfully');
    } catch (error) {
        core.setFailed(`Action failed with error: ${error.message}`);
    }
}

updateTasks();
```

### **步驟 4：設置依賴**

在 `package.json` 文件中，添加需要的依賴：

```json
{
  "name": "my-custom-action",
  "version": "1.0.0",
  "main": "src/index.js",
  "dependencies": {
    "@actions/core": "^1.9.0",
    "axios": "^0.21.1"
  }
}
```

在專案根目錄下執行以下命令來安裝依賴：

```bash
npm install
```

### **步驟 5：編寫測試**

為了確保自定義 Action 的正確性，可以編寫一些測試來檢查不同的功能。例如，可以使用 Mocha 和 Chai 來編寫單元測試，檢查 `index.js` 中的函數。

## **3. 配置 GitHub Actions 工作流程**

現在，我們需要創建一個 GitHub Actions 工作流程來使用我們的自定義 Action。在 `.github/workflows` 目錄下創建一個新的 YAML 文件，例如 `main.yml`，並添加以下內容：

```yaml
name: Update Notion to Discord

on:
  push:
    branches:
      - main

jobs:
  update:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v2

    - name: Use custom action
      uses: ./  # 使用自定義 Action 的路徑
      with:
        notion_database_id: ${{ secrets.NOTION_DATABASE_ID }}
        notion_token: ${{ secrets.NOTION_TOKEN }}
        discord_channel_id: ${{ secrets.DISCORD_CHANNEL_ID }}
        discord_token: ${{ secrets.DISCORD_TOKEN }}
```

## **4. 設置 GitHub Secrets**

在 GitHub 存儲庫的設置中，添加所需的 Secrets：

- `NOTION_DATABASE_ID`
- `NOTION_TOKEN`
- `DISCORD_CHANNEL_ID`
- `DISCORD_TOKEN`

這些 Secrets 將用於在 Action 中安全地傳遞敏感信息。

## **小結**

今天我們探討了如何使用 Bash 腳本編寫 GitHub Actions 自定義 Action。我們編寫了一個簡單的 Bash 腳本，從 Notion 獲取待辦事項並更新 Discord 頻道的標題。通過這個實踐，我們了解了如何使用 Shell 腳本來實現自動化操作，並且學會了如何配置和使用自定義 Actions。希望這篇教程對你有所幫助！