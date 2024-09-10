# 第七天：時間差不多囉：事件觸發器

> 《禮記·中庸》「凡事預則立，不預則廢。」說明了如果沒有設定事件觸發器，需要時 Action 也不會執行。

今天，我們將深入了解如何在 GitHub Actions 中設置事件觸發器。事件觸發器是 GitHub Actions 的核心功能之一，它可以根據特定的 GitHub 事件自動啟動工作流程。這使得我們可以在合適的時機自動執行各種操作，例如測試、部署等，從而提高工作效率和代碼質量。

## 技巧：設置工作流程在特定事件上觸發

1. **什麼是事件觸發器？**

   事件觸發器是一種機制，用於在特定 GitHub 事件發生時自動啟動工作流程。這些事件可以是代碼推送、拉取請求創建、Issue 更新等。利用事件觸發器，我們可以在合適的時間自動執行指定的操作，從而實現自動化的工作流程。

2. **常見的事件類型：**

   - **push:** 當代碼推送到指定分支時觸發。例如，當我們向 `main` 分支推送代碼時。
   - **pull_request:** 當創建或更新拉取請求時觸發。例如，當我們創建一個新的 Pull Request 或對現有的 Pull Request 進行更新時。
   - **issue:** 當創建或更新 Issue 時觸發。例如，當我們報告一個新的問題或更新現有的問題描述時。
   - **schedule:** 根據設定的時間表定期觸發。例如，每天、每周定期執行任務。
   - **workflow_dispatch:** 手動觸發工作流程。例如，當需要在 GitHub UI 上手動啟動工作流程時。

3. **如何設置事件觸發器？**

   在 GitHub Actions 工作流程文件（`.yml`）中，我們可以使用 `on` 關鍵字來指定觸發事件。以下是一些常見的設置示例：

## 實作：在代碼推送和 PR 創建時觸發工作流程

**步驟 1：創建 GitHub Actions 工作流程文件**

1. **設置推送事件觸發器**

   在 `.github/workflows/trigger-on-push.yml` 文件中，設置工作流程以在代碼推送時觸發：

   ```yaml
   name: On Push Event

   on:
     push:
       branches:
         - main  # 當推送到 main 分支時觸發工作流程

   jobs:
     build:
       runs-on: ubuntu-latest

       steps:
       - name: Check out the code
         uses: actions/checkout@v2

       - name: Run a script
         run: echo "Code was pushed to the main branch."
   ```

   **YAML 文件解析：**
   - **`on: push:`** 指定當推送到 `main` 分支時觸發此工作流程。
   - **`jobs:`** 定義要執行的工作（在這裡是 `build`）。
   - **`steps:`** 設定工作流程的具體步驟，包括檢出代碼和執行腳本。

2. **設置 Pull Request 事件觸發器**

   在 `.github/workflows/trigger-on-pr.yml` 文件中，設置工作流程以在 PR 創建或更新時觸發：

   ```yaml
   name: On Pull Request Event

   on:
     pull_request:
       branches:
         - main  # 當拉取請求目標分支為 main 時觸發工作流程

   jobs:
     review:
       runs-on: ubuntu-latest

       steps:
       - name: Check out the code
         uses: actions/checkout@v2

       - name: Run a script
         run: echo "A Pull Request was created or updated against the main branch."
   ```

   **YAML 文件解析：**
   - **`on: pull_request:`** 指定當拉取請求創建或更新時觸發此工作流程。
   - **`branches:`** 設定拉取請求目標分支（在這裡是 `main`）。

3. **設置 Issue 事件觸發器**

   在 `.github/workflows/trigger-on-issue.yml` 文件中，設置工作流程以在 Issue 創建或更新時觸發：

   ```yaml
   name: On Issue Event

   on:
     issues:
       types: [opened, edited]  # 當 Issue 創建或更新時觸發工作流程

   jobs:
     notify:
       runs-on: ubuntu-latest

       steps:
       - name: Check out the code
         uses: actions/checkout@v2

       - name: Notify
         run: echo "An Issue was created or edited."
   ```

   **YAML 文件解析：**
   - **`on: issues:`** 指定當 Issue 創建或更新時觸發此工作流程。
   - **`types:`** 設定要觸發的事件類型（在這裡是 `opened` 和 `edited`）。

4. **設置定時事件觸發器**

   在 `.github/workflows/trigger-on-schedule.yml` 文件中，設置工作流程以定期觸發：

   ```yaml
   name: On Schedule Event

   on:
     schedule:
       - cron: '0 0 * * *'  # 每天午夜 12 點觸發工作流程

   jobs:
     daily-task:
       runs-on: ubuntu-latest

       steps:
       - name: Run a script
         run: echo "This job runs daily at midnight."
   ```

   **YAML 文件解析：**
   - **`on: schedule:`** 設定定時觸發工作流程。
   - **`cron:`** 使用 cron 表達式來設定觸發時間（在這裡是每日午夜 12 點）。

5. **設置手動觸發事件**

   在 `.github/workflows/trigger-on-manual.yml` 文件中，設置工作流程以手動觸發：

   ```yaml
   name: On Manual Trigger

   on:
     workflow_dispatch:  # 允許手動觸發

   jobs:
     manual-task:
       runs-on: ubuntu-latest

       steps:
       - name: Run a script
         run: echo "This job was manually triggered."
   ```

   **YAML 文件解析：**
   - **`on: workflow_dispatch:`** 允許手動觸發工作流程。

**步驟 2：測試工作流程**

1. **推送代碼到 `main` 分支**

   ```bash
   git add .github/workflows/trigger-on-push.yml
   git commit -m "Add workflow to trigger on push"
   git push origin main
   ```

   - 這將推送工作流程配置到 GitHub，並觸發推送事件工作流程。

2. **創建或更新 Pull Request**

   - 在 GitHub 上創建一個新的 Pull Request，或更新現有的 PR，以觸發 PR 事件工作流程。

3. **創建或更新 Issue**

   - 創建或更新一個 Issue 以觸發 Issue 事件工作流程。

4. **手動觸發工作流程**

   - 進入 GitHub 的 `Actions` 標籤頁，手動觸發工作流程。

5. **檢查工作流程執行狀況**

   - 進入 GitHub 仓库的 `Actions` 標籤頁，檢查工作流程的執行情況。如果一切正常，你會看到工作流程在不同事件發生時自動執行。

## 常見的應用案例

1. **自動化測試：**
   - 使用 `push` 事件觸發工作流程，運行單元測試以確保新代碼不會破壞現有功能。

2. **自動部署：**
   - 使用 `push` 事件觸發工作流程，當代碼推送到 `main` 分支時自動部署到生產環境。

3. **PR 驗證：**
   - 使用 `pull_request` 事件觸發工作流程，在拉取請求創建或更新時自動運行測試和代碼審查。

4. **Issue 通知：**
   - 使用 `issues` 事件觸發工作流程，當 Issue 創建或更新時自動發送通知或執行其他操作。

5. **定期任務：**
   - 使用 `schedule` 事件觸發工作流程，定期執行備份、清理或其他例行任務。

6. **手動控制：**
   - 使用 `workflow_dispatch` 事件觸發工作流程，允許手動啟動工作流程來進行特定操作，如發佈版本等。

## 結語

今天我們學習了如何在 GitHub Actions 中設置事件觸發器，並

實作了不同的工作流程來響應各種 GitHub 事件。我們探討了如何設置推送、PR、Issue、定時和手動觸發器，以及如何測試這些工作流程。事件觸發器是自動化流程中的關鍵部分，能夠有效地提高工作效率，確保代碼質量。

明天，我們將繼續探索更多 GitHub Actions 的應用，敬請期待！