# 這是我家鑰匙 - SSH 自動化部署

> 《史記》「以貌取人，失之子羽」 說明了 SSH 身分驗證的重要性。

在部署服務時，SSH（安全外殼協定）是一種常見且安全的方式來遠程管理和部署應用程序。使用 SSH 密鑰進行身份驗證可以確保部署過程的安全性，避免使用明文密碼而引發的安全風險。今天，我們將探討如何設置 SSH 密鑰以實現自動化部署。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/15>

## 1. 設置 SSH 密鑰

### 步驟 1：生成 SSH 密鑰對

1. **生成 SSH 密鑰**：
   打開你的終端（Terminal），輸入以下命令生成新的 SSH 密鑰對：

   ```bash
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   ```

   系統會提示你輸入密鑰文件的位置和名稱，預設為 `~/.ssh/id_rsa`，以及可選擇的密碼。

2. **複製公鑰**：
   使用以下命令複製公鑰內容：

   ```bash
   cat ~/.ssh/id_rsa.pub
   ```

   你需要將這個公鑰內容添加到遠程伺服器。

### 步驟 2：將公鑰添加到遠程伺服器

1. **登錄遠程伺服器**：
   使用 SSH 登錄到你的遠程伺服器（假設伺服器 IP 為 `192.168.1.1`）：

   ```bash
   ssh username@192.168.1.1
   ```

2. **將公鑰添加到伺服器**：
   打開 `~/.ssh/authorized_keys` 文件（如果該文件不存在，可以創建）並將剛才複製的公鑰內容粘貼到該文件中：

   ```bash
   nano ~/.ssh/authorized_keys
   ```

   儲存並退出編輯器。

> 當然你也可以使用其他方法將公鑰添加到遠程伺服器，例如使用 `ssh-copy-id` 命令。

## 2. 配置 GitHub Actions 以使用 SSH 密鑰

### 步驟 1：設置 SSH 密鑰作為 GitHub Secrets

讓我們依照第 11 天的步驟，將 SSH 私鑰添加為 GitHub Secrets，以便在 GitHub Actions 中使用。這樣可以保護私鑰不被公開顯示。

1. **將私鑰添加為 GitHub Secret**：
   在你的 GitHub 倉庫中，導航到 "Settings" -> "Secrets and variables" -> "Actions"，點擊 "New repository secret"。

   - **名稱**：`SSH_PRIVATE_KEY`
   - **值**：你的 SSH 私鑰內容（`~/.ssh/id_rsa` 的內容）

### 步驟 2：設置 GitHub Actions 工作流程

在 `.github/workflows` 目錄下創建一個 YAML 文件，例如 `deploy-via-ssh.yml`，來自動化部署過程。

```yaml
name: Deploy via SSH

on:
  push:
    branches:
      - main # 當推送到 main 分支時觸發工作流程

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Check out code
        uses: actions/checkout@v3

      - name: Set up SSH
        uses: webfactory/ssh-agent@v0.5.3
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Deploy to server
        run: |
          rsync -avz --exclude='.git*' --exclude='node_modules' ./ username@192.168.1.1:/path/to/your/app/
          ssh username@192.168.1.1 'cd /path/to/your/app/ && npm install && npm run build'
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
```

## 3. 使用 SSH 進行部署

### 步驟 1：設置部署腳本

確保你的遠程伺服器上已經安裝了部署腳本，例如安裝依賴、構建應用等。你可以使用 `rsync` 將本地的應用文件同步到遠程伺服器上，並在遠程伺服器上執行命令。

### 步驟 2：運行 GitHub Actions 工作流程

推送代碼到 `main` 分支後，GitHub Actions 會自動運行 `deploy-via-ssh.yml` 工作流程，將應用部署到遠程伺服器上。

## 補充資料

- **配置 SSH 訪問**：確保 SSH 服務已經啟動並正確配置於遠程伺服器上。
- **使用 `rsync`**：`rsync` 是一個強大的工具，可以高效地同步文件和目錄。
- **密鑰管理**：定期更新和管理 SSH 密鑰，並為每個服務使用不同的密鑰以增加安全性。
- **錯誤排查**：在工作流程中添加適當的日誌和錯誤處理，以便在出現問題時能夠快速定位問題。

## 小結

使用 SSH 密鑰進行自動化部署可以大大提高安全性和效率。通過在 GitHub Actions 中配置 SSH 密鑰，你可以將應用程序安全地部署到遠程伺服器，確保每次代碼變更後都能自動更新生產環境。記住，保持密鑰安全和定期更新是保持系統安全的關鍵。希望這篇教程能夠幫助你實現更高效、更安全的部署流程。
