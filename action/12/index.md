# 一切都是有條件的 - 環境變數和條件運行

> 甚麼是條件運行？孟子說：「生，事之以禮；死，葬之以禮；祭，事之以禮。」

在自動化工作流程中，環境變數和條件運行是控制流程的重要工具。這些功能讓我們能夠根據不同的條件或環境設置來靈活地運行特定的任務。今天我要來介紹環境變數的概念、設置方法，以及如何根據條件來控制工作流程的運行。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/12>

## 什麼是環境變數？

環境變數是存儲在操作系統或工作流程中的一些變數值，這些值可以在整個工作流程或特定任務中被訪問和使用。環境變數通常用於儲存機密信息（如 API 金鑰）、配置參數或其他需要在不同階段使用的數據。GitHub 有內建的環境變數，同時也支持自定義環境變數。

## 常見環境變數

- **`GITHUB_REPOSITORY`**: 存儲當前工作流程所在的倉庫名稱。
- **`GITHUB_REF`**: 存儲當前的分支或標籤名稱。
- **`GITHUB_SHA`**: 存儲當前 commit 的 SHA 值。
- **`GITHUB_WORKSPACE`**: 表示當前工作流程的工作空間目錄。
- **`GITHUB_ACTOR`**: 執行工作流程的用戶名。

這些變數可直接在 YAML 文件中使用，如：

```yaml
steps:
  - name: Print Environment Variables
    run: echo "Repository: ${{ env.GITHUB_REPOSITORY }} and Branch: ${{ env.GITHUB_REF }}"
```

## 設置自定義環境變數

你可以在 GitHub Actions 的 YAML 文件中設置自定義的環境變數，方式如下：

```yaml
env:
  NODE_ENV: production
  API_URL: https://api.example.com
```

在程式中可以使用這些變數：

```yaml
steps:
  - name: Use Custom Environment Variables
    run: echo "Running in ${{ env.NODE_ENV }} environment. API URL is ${{ env.API_URL }}."
```

## 在 Node.js 程式中使用環境變數

- **Node.js**: 在 Node.js 中，可以通過 `process.env` 來讀取環境變數。例如：

  ```javascript
  const apiUrl = process.env.API_URL || "https://default.example.com";
  console.log(`API URL: ${apiUrl}`);
  ```

- **設置 `.env` 文件**: 你可以使用 `.env` 文件來定義環境變數，並使用 `dotenv` 庫在 Node.js 中讀取這些變數。步驟如下：
  1. 安裝 `dotenv`：
     ```bash
     npm install dotenv
     ```
  2. 創建 `.env` 文件，內容如下：
     ```plaintext
     API_URL=https://api.example.com
     ```
  3. 在程式中使用：
     ```javascript
     require("dotenv").config();
     const apiUrl = process.env.API_URL;
     console.log(`API URL from .env: ${apiUrl}`);
     ```

## 條件運行任務

有時你可能需要根據某些條件來選擇性地運行特定的任務。這可以通過使用 `if` 關鍵字來實現。

### 範例：根據分支名稱選擇性運行

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Check out code
        uses: actions/checkout@v2

      - name: Run tests on main branch
        if: github.ref == 'refs/heads/main'
        run: npm test
```

上面的例子展示了如何僅在 `main` 分支上運行測試。

### 範例：根據環境變數的值運行任務

你也可以根據環境變數的值來決定是否運行特定任務：

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      NODE_ENV: production

    steps:
      - name: Check out code
        uses: actions/checkout@v2

      - name: Deploy to Production
        if: env.NODE_ENV == 'production'
        run: echo "Deploying to production..."
```

### 範例：使用 `git diff` 檢查是否有變更

像是前面的 git 練習，我們可以確認有編輯檔案後再來 commit。

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Check out code
        uses: actions/checkout@v2

      - name: Check for changes
        run: git diff --exit-code
      - name: Commit changes
        if: success()
        run: git commit -am "Auto commit"
```

### 範例：Prettier 檢查是否通過

這是我們第六天的練習。我們可以使用 Prettier 來檢查代碼是否符合規範，如果不符合，則自動格式化代碼。這裡我們可以使用 `failure()` 函數來判斷是否有錯誤，然後運行格式化代碼的命令。

```yaml
# ...
- name: Run Prettier check
  id: prettier
  run: npx prettier —check .

- name: Run Prettier format (if needed)
  if: ${{ failure() }}
  run: npx prettier —write .
```

## 實作練習：條件性部署

這是一個簡單的專案，示範如何根據不同的分支進行條件性部署。例如，當代碼推送到 `main` 分支時，自動部署到生產環境；當推送到 `develop` 分支時，則部署到測試環境。

### 步驟 1：設置環境變數

在 `.github/workflows/deploy.yml` 中設置：

```yaml
env:
  PRODUCTION_URL: https://prod.example.com
  STAGING_URL: https://staging.example.com
```

### 步驟 2：配置條件性部署

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Check out code
        uses: actions/checkout@v2

      - name: Deploy to Production
        if: github.ref == 'refs/heads/main'
        run: curl -X POST ${{ env.PRODUCTION_URL }}/deploy

      - name: Deploy to Staging
        if: github.ref == 'refs/heads/develop'
        run: curl -X POST ${{ env.STAGING_URL }}/deploy
```

這個工作流程根據當前分支名稱，選擇性地部署到不同的環境。

## 結語

環境變數和條件運行是 GitHub Actions 中非常強大的工具，能夠幫助你根據不同的情境來靈活地控制工作流程。無論是在不同的平台上測試代碼，還是根據分支部署應用，這些功能都能大幅提升你的工作效率和代碼品質。明天我們要來談談自動化 Docker 構建，敬請期待！
