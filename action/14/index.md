# 直上天雲 - 自動化部屬

> 老子能夠無為而治，正是因為他掌握了 GitHub Action 自動化部屬。

自動化部署是 CI/CD 十分重要的一部分，它可以讓你的應用在每次代碼更新後自動部署到生產環境。今天，我們將探討如何使用 GitHub Actions 將應用程序自動部署到 AWS S3 或 Heroku。這樣可以實現無縫的部署過程，並確保應用程序的最新版本隨時可用。

> 當然，如果你使用的是 Zeabur 或是 Vercel 這樣的部屬平台，在 push 之後他們就會自動部屬，這樣也不錯。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/14>

## 1. 使用 GitHub Actions 部署到 AWS S3

AWS S3（Simple Storage Service）是一個可靠且可擴展的對象存儲服務。它可以用於存儲靜態網站的內容，例如 HTML、CSS 和 JavaScript 文件。

### 步驟 1：設置 AWS S3

1. **創建 S3 存儲桶**: 登錄到 AWS 管理控制台，導航到 S3 服務，並創建一個新的存儲桶。
2. **設置存儲桶權限**: 確保存儲桶設置為公開，以便你的網站可以被訪問。你可以在存儲桶的 "權限" 標籤下配置 CORS（跨來源資源共享）設置。

### 步驟 2：創建 IAM 用戶並設置訪問密鑰

1. **創建 IAM 用戶**: 在 AWS 管理控制台，導航到 IAM 服務，創建一個新的用戶，並授予 `AmazonS3FullAccess` 許可權。
2. **獲取訪問密鑰**: 生成並保存訪問密鑰 ID 和密鑰，稍後將在 GitHub Secrets 中使用。

### 步驟 3：設置 GitHub Actions 工作流程

在 `.github/workflows` 目錄下創建一個 YAML 文件，例如 `deploy-to-s3.yml`。這個工作流程會自動構建你的應用並將其上傳到 AWS S3。

```yaml
name: Deploy to S3

on:
  push:
    branches:
      - main # 當推送到 main 分支時觸發工作流程

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Check out code
        uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm install

      - name: Build application
        run: npm run build

      - name: Deploy to S3
        uses: jakejarvis/s3-sync-action@v0.5.7
        with:
          args: --acl public-read --follow-symlinks --exclude '.git/*' --exclude 'README.md'
        env:
          SOURCE_DIR: "./build"
          AWS_S3_BUCKET: ${{ secrets.AWS_S3_BUCKET }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### 步驟 4：設置 GitHub Secrets

在 GitHub 倉庫的 "Secrets and variables" 部分，設置以下 secrets：

- `AWS_S3_BUCKET`: 你的 S3 存儲桶名稱
- `AWS_ACCESS_KEY_ID`: 你的 AWS 訪問密鑰 ID
- `AWS_SECRET_ACCESS_KEY`: 你的 AWS 密鑰

## 2. 使用 GitHub Actions 部署到 Heroku

Heroku 是一個熱門的雲端平台，即時部署應用程序並提供基礎設施管理。雖然現在要錢了，但如果你跟我一樣是學生的話，可以驗證學生身分，每個月都有免費 credits。

### 步驟 1：設置 Heroku

1. **創建 Heroku 專案**: 登錄到 Heroku 儀表板，創建一個新的專案。
2. **獲取 Heroku API 密鑰**: 在 Heroku 儀表板中，導航到你的帳戶設置，生成並保存 API 密鑰。

### 步驟 2：設置 GitHub Actions 工作流程

在 `.github/workflows` 目錄下創建一個 YAML 文件，例如 `deploy-to-heroku.yml`。這個工作流程會自動將你的應用部署到 Heroku。

```yaml
name: Deploy to Heroku

on:
  push:
    branches:
      - main # 當推送到 main 分支時觸發工作流程

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Check out code
        uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm install

      - name: Build application
        run: npm run build

      - name: Deploy to Heroku
        uses: akshatp/gh-action-heroku-deploy@v2
        with:
          api_key: ${{ secrets.HEROKU_API_KEY }}
          app_name: ${{ secrets.HEROKU_APP_NAME }}
```

### 步驟 3：設置 GitHub Secrets

在 GitHub 倉庫的 "Secrets and variables" 部分，設置以下 secrets：

- `HEROKU_API_KEY`: 你的 Heroku API 密鑰
- `HEROKU_APP_NAME`: 你的 Heroku 應用名稱

## 3. 使用 Vercel 自動預覽部署

Vercel 是一個提供自動化預覽部署的平台。每當你推送代碼或創建拉取請求時，Vercel 都會自動生成預覽環境，幫助你檢查和測試變更。我們不需要設定任何工作流程，只需要將代碼推送到 GitHub，Vercel 就會自動構建和部署預覽版本。

1. **登錄 Vercel**: 使用你的 GitHub 帳戶登錄 Vercel。
2. **連接 GitHub 倉庫**: 在 Vercel 儀表板中，連接你的 GitHub 倉庫。
3. **設定部屬步驟**: 通常 Vercel 會自動偵測你使用的框架與部屬方式，如果錯誤的話你可以自行進行調整。

Vercel 會自動設置預覽部署，所以只需要推送到你的 GitHub 倉庫，Vercel 就會自動構建和部署預覽版本。

## 小結

使用 GitHub Actions 進行自動化部署可以顯著提高開發效率，確保每次代碼更新後都能自動部署到生產環境。無論是部署到 AWS S3、Heroku 還是使用 Vercel 進行預覽部署，自動化流程都能幫助你維持高效的開發和部署流程。這些技術不僅能減少手動操作的錯誤，還能使你的應用更具一致性和可靠性。希望你能夠充分利用這些技術，將你的應用程序無縫地部署到各種雲端平台。
