# 自動化安全掃描與漏洞檢查 - 使用 Dependabot 和 GitHub Actions

> 《山河頌》：「外賊易擋，家賊難防」套件的漏洞常常難以發現，還好有 Dependabot 可以定期檢查。

自動化的安全掃描可以幫助我們及時發現並修補漏洞，從而提高應用程序的安全性。本文將介紹如何使用 GitHub 的 Dependabot 來自動檢查依賴的安全性，並使用 GitHub Actions 檢查是否洩漏 secrets。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/25>

## 使用 Dependabot 進行依賴安全性檢查

### 設置 Dependabot

Dependabot 是 GitHub 的一個工具，可以自動檢查和更新你的依賴項。它能夠定期掃描你的依賴項並向你報告漏洞，並且可以自動提交更新以修補已知的安全漏洞。

1. **啟用 Dependabot**

   1. 進入你的 GitHub repository 頁面。
   2. 點擊 `Settings`。
   3. 在左側選擇 `Security & analysis`。
   4. 在 `Dependabot` 部分，啟用 `Dependabot alerts` 和 `Dependabot security updates`。

2. **配置 Dependabot**

   創建一個 `.github/dependabot.yml` 文件來配置 Dependabot 的行為。以下是一個基本配置的例子：

   ```yaml
   version: 2
   updates:
     - package-ecosystem: "npm"
       directory: "/" # 根目錄
       schedule:
         interval: "daily" # 每天檢查更新
     - package-ecosystem: "pip"
       directory: "/" # 根目錄
       schedule:
         interval: "weekly" # 每周檢查更新
   ```

   - `package-ecosystem`: 指定使用的包管理器（如 `npm`、`pip` 等）。
   - `directory`: 指定依賴項所在的目錄。
   - `schedule`: 指定檢查更新的頻率。

3. **查看 Dependabot 警報**

   Dependabot 會在 GitHub 的 `Security` 標籤頁面下顯示依賴安全性警報。當檢測到安全漏洞時，它會創建拉取請求以更新相關依賴。

## 使用 GitHub Actions 檢查 secrets 洩漏

我們可以使用 `git-secrets` 這個套件來檢查程式碼中是否存在 secrets 的洩漏。這有助於確保我們的代碼庫不會意外地包含敏感信息，例如 API 密鑰、憑證等。

### 配置 GitHub Actions 工作流程

1. **創建工作流程文件**

   在 `.github/workflows` 目錄下創建 `check-secrets.yml` 文件，並加入以下內容：

   ```yaml
   name: Check Secrets

   on:
     push:
       branches:
         - main
     pull_request:

   jobs:
     check-secrets:
       runs-on: ubuntu-latest

       steps:
         - name: Checkout code
           uses: actions/checkout@v3

         - name: Set up Node.js
           uses: actions/setup-node@v3
           with:
             node-version: "20"

         - name: Install Git Secrets
           run: |
             sudo apt-get install git-secrets

         - name: Scan for secrets
           run: git secrets --scan
   ```

   **解釋**:

   - `Install Git Secrets`：安裝 `git-secrets` 工具，用於檢查代碼中的 secrets。
   - `Scan for secrets`：運行 `git-secrets` 檢查代碼庫中的敏感信息。

2. **安裝 Git Secrets**

   你需要在本地安裝 `git-secrets` 工具來進行檢查。使用以下命令安裝：

   ```bash
   brew install git-secrets
   ```

   或者，使用以下命令在 Ubuntu 上安裝：

   ```bash
   sudo apt-get install git-secrets
   ```

   然後，初始化 `git-secrets`：

   ```bash
   git secrets --install
   ```

   你可以配置 `git-secrets` 以檢查常見的密鑰模式，例如 AWS 密鑰或其他 API 密鑰。

### 確保 secrets 的安全

- **不將敏感信息硬編碼到代碼中**：使用 GitHub 的 secrets 功能來存儲敏感信息，例如 API 密鑰和憑證。

- **使用環境變數**：在 GitHub Actions 的配置文件中，使用環境變數來引用 secrets，避免將其直接寫入代碼。

## 小結

在本文中，我們介紹了如何使用 GitHub 的 Dependabot 自動檢查依賴項的安全性，以及如何使用 GitHub Actions 檢查是否洩漏 secrets。這些措施有助於提高應用程序的安全性，確保開發過程中的每個階段都符合安全最佳實踐。
