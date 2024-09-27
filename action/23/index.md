<!-- @format -->

# 不在其位，不謀其政 - 多階段 CI/CD 流程

> 子曰：「不在其位，不謀其政。」說明了多階段工作流程的重要性。

設計一個穩定且高效的 CI/CD（持續集成與持續部署）流程是至關重要的。這不僅能夠提高開發效率，還能確保應用的品質。我們今天要在 Node.js 專案中使用 GitHub Actions 搭建一個多階段 CI/CD 流程，涵蓋構建、測試、部署和發布。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/23>

## 設置 Node.js 專案

在開始設計 CI/CD 流程之前，我們需要確保已經在 GitHub 上創建了一個 Node.js 專案，並在本地完成了基本的項目配置。你可以使用現有的專案，或是依照以下步驟簡單配置一個。

1. **初始化專案**：

   ```bash
   mkdir node-ci-cd-demo
   cd node-ci-cd-demo
   npm init -y
   ```

2. **安裝必要的依賴項**：

   ```bash
   npm install express
   npm install --save-dev jest
   ```

3. **設置簡單的測試**：  
   在 `package.json` 中添加一個簡單的測試腳本：
   ```json
   "scripts": {
     "test": "jest"
   }
   ```

## 使用 GitHub Actions 設計 CI/CD 流程

### 創建 GitHub Actions 工作流

#### 構建階段

在項目的根目錄下創建一個 `.github/workflows` 文件夾，並在其中創建一個名為 `ci.yml` 的文件。

```yaml
name: Node.js CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x, 18.x]

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test
```

#### 部署階段

這裡我們使用 Heroku 部署應用，因為我們這個系列還沒有用過。我們可以在成功測試後自動將應用部署到 Heroku。你也可以使用我們之前介紹的任何其他部署方式。

1. 安裝 Heroku CLI 並獲取 API Token。
2. 在 GitHub 的 repository settings 中，添加一個名為 `HEROKU_API_KEY` 的機密環境變數。

然後，在 CI 工作流中添加部署步驟：

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Login to Heroku
      run: echo ${{ secrets.HEROKU_API_KEY }} | docker login --username=_ --password-stdin registry.heroku.com

    - name: Deploy to Heroku
      run: |
        heroku container:push web --app your-heroku-app-name
        heroku container:release web --app your-heroku-app-name
```

#### 發布階段

如果你希望在完成部署後發布一個新的 Release，可以在工作流中添加以下步驟：

```yaml
publish:
  needs: deploy
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Create Release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: v1.0.0
        release_name: "First release"
        draft: false
        prerelease: false
```

最後把他們整合到一個完整的 CI/CD 流程中就可以了。你可以到上面的 GitHub 範例程式中查看完整的 `ci.yml` 文件。

### 實用技巧

你發現了嗎? 我們在 CI/CD 流程中使用了 `needs` 關鍵字，這樣可以確保每個階段都在上一個階段成功後才執行。這樣可以確保流程的穩定性。以下是幾個實用的技巧，可以幫助你更好地設計 CI/CD 流程。

#### **1. 並行運行測試**

你可以使用 GitHub Actions 的矩陣功能來並行運行不同 Node.js 版本的測試，確保應用在不同環境下的穩定性。

#### **2. 缓存 Node.js 依賴**

使用 GitHub Actions 提供的 `cache` 功能來加速依賴的安裝過程。這可以顯著縮短 CI 的運行時間。

```yaml
- name: Cache Node.js modules
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

#### **3. 使用 Lint 驗證代碼風格**

你可以在 CI 過程中加入 ESLint 或 Prettier 來自動驗證代碼風格。

```yaml
- name: Run ESLint
  run: npm run lint
```

## 小結

設計一個穩定的 CI/CD 流程對於保證軟體的質量和部署效率都至關重要。本文介紹了如何使用 GitHub Actions 搭建 Node.js 的多階段 CI/CD 流程，並涵蓋了構建、測試、部署和發布的自動化。通過實踐這些步驟和技巧，你可以更輕鬆地管理你的 Node.js 專案，並確保其在不同環境中的穩定性。
