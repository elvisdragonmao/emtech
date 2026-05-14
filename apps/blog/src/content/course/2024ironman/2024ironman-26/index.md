---
authors: elvismao
tags: ["看好了 GitHub Actions, 我只示範一次", GitHub Actions, Node.js, DevOps]
categories: [自動化]
date: 2024-10-09
description: "雅典軍隊如果有 Slack 通知，斐迪庇得斯就不用趕著從馬拉松跑回雅典了。"
---

# 整合通知服務 - 在 GitHub Actions 中配置 Slack 通知和生成報告文件

> 雅典軍隊如果有 Slack 通知，斐迪庇得斯就不用趕著從馬拉松跑回雅典了。

在持續整合和持續部署 (CI/CD) 流程中，及時了解工作流程的狀態對於快速響應和改進至關重要。本文將介紹如何在 GitHub Actions 工作流程中整合 Slack 通知服務，以便在工作流程運行時獲得實時通知，以及如何生成報告文件來跟蹤工作流程的結果。

> 今日範例程式：<https://github.com/elvisdragonmao/2024-GitHub-Actions/tree/main/26>

今天的文章假設你會使用 Slack，並且已經有一個 Slack 工作區。如果你還沒有，可以參考 [Slack 官方說明文件](https://slack.com/intl/zh-tw/help/articles/206845317-Create-a-Slack-workspace) 來建立一個。

## GitHub Actions 中配置 Slack 通知

### 建立 Slack 應用並取得 Webhook URL

1. **建立 Slack 應用**
   1. 進入 [Slack API](https://api.slack.com/apps) 頁面。
   2. 點擊 `Create New App`。
   3. 選擇 `From scratch`，並輸入應用的名稱和所屬工作區。
   4. 點擊 `Create App`。

2. **設定 Incoming Webhook**
   1. 在應用設定頁面，點擊 `Incoming Webhooks`。
   2. 點擊 `Activate Incoming Webhooks`。
   3. 點擊 `Add New Webhook to Workspace`。
   4. 選擇要發送通知的頻道，並點擊 `Allow`。
   5. 複製 Webhook URL，稍後會在 GitHub Actions 中使用。

### 配置 GitHub Actions 工作流程

1. **建立工作流程文件**

   在 `.github/workflows` 目錄下建立一個新的工作流程文件，例如 `notify-slack.yml`，並加入以下內容：

   ```yaml
   name: Notify Slack

   on:
     push:
       branches:
         - main
     pull_request:

   jobs:
     notify:
       runs-on: ubuntu-latest

       steps:
         - name: Checkout code
           uses: actions/checkout@v3

         - name: Notify Slack
           uses: slackapi/slack-github-action@v1
           with:
             slack-token: ${{ secrets.SLACK_TOKEN }}
             channel-id: "C1234567890" # 替換為你的頻道 ID
             text: "工作流程已完成！查看詳細訊息：[工作流程連結](https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }})"
   ```

   **解釋**:
   - `slack-token`: 使用 GitHub Secrets 存儲你的 Slack Token。
   - `channel-id`: 你的 Slack 頻道 ID。
   - `text`: 訊息文本，包括工作流程連結。

2. **配置 GitHub Secrets**

   將你的 Slack Token 添加到 GitHub Secrets：
   1. 進入你的 GitHub repository 頁面。
   2. 點擊 `Settings` > `Secrets and variables` > `Actions`。
   3. 點擊 `New repository secret`。
   4. 添加名為 `SLACK_TOKEN` 的 secret，並填入你的 Slack Token。

## 生成報告文件

### 編寫生成報告的腳本

1. **建立報告生成腳本**

   在 `src` 目錄下建立一個腳本文件，例如 `generate-report.js`，並添加以下內容：

   ```javascript
   import fs from "fs";
   import path from "path";

   const reportFilePath = path.join(__dirname, "report.md");

   // 模擬生成報告的內容
   const reportContent = `
   # 工作流程報告
   
   **日期**: ${new Date().toLocaleDateString()}
   
   ## 總結
   
   本次工作流程運行成功。
   
   ## 詳細訊息
   
   - [工作流程連結](https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID})
   `;

   // 將報告內容寫入文件
   fs.writeFileSync(reportFilePath, reportContent, "utf8");

   console.log("報告已生成");
   ```

### 步驟 2: 配置 GitHub Actions 生成報告文件

1. **更新工作流程文件**

   在 `.github/workflows` 目錄下建立流程文件，例如 `generate-report.yml`，並加入以下內容：

   ```yaml
   name: Generate Report

   on:
     push:
       branches:
         - main
     pull_request:

   jobs:
     report:
       runs-on: ubuntu-latest

       steps:
         - name: Checkout code
           uses: actions/checkout@v3

         - name: Set up Node.js
           uses: actions/setup-node@v3
           with:
             node-version: "20"

         - name: Install dependencies
           run: npm install

         - name: Generate report
           run: node src/generate-report.js

         - name: Commit and push report
           run: |
             git config --local user.email "action@github.com"
             git config --local user.name "GitHub Actions"
             git add report.md
             git commit -m "📝 Update report"
             git push
   ```

   **解釋**:
   - `Generate report`: 運行生成報告的腳本。
   - `Commit and push report`: 將生成的報告文件提交到 repository。

## 小結

在本文中，我們介紹了如何在 GitHub Actions 工作流程中配置 Slack 通知，以便實時了解工作流程的狀態，並如何生成報告文件以跟蹤工作流程的結果。當然今天的練習非常的簡單，你可以根據實際需求進行拓展，例如添加更多通知類型、生成更複雜的報告等。
