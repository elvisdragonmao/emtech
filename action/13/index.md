# 在碼頭等你 - 自動化 Docker 構建

> 司馬遷敢說：「人固有一死，或重於泰山，或輕於鴻毛。」正是因為他已經把服務打包成 Docker 映像了，就算服務掛了也不怕。

Docker 是一種容器化技術，它可以將應用程序及其所有依賴套件打包成為一個輕量、可移植的容器。這使得應用在不同環境中能夠以一致的方式運行。今天，我們將探討如何使用 GitHub Actions 自動化 Docker 映像的構建和推送。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/13>

## Docker 基本概念

- **Docker 映像 (Image)**: Docker 映像是包含應用程序及其所有依賴套件、配置文件的靜態文件。它是一個可執行的檔案，能夠在 Docker 容器中運行。
- **Docker 容器 (Container)**: Docker 容器是基於映像創建的運行實例，它是應用程序的運行環境。
- **Dockerfile**: 是一個文本文件，包含了創建 Docker 映像所需的指令和配置。

你可以想像成是在做麵包。Docker 映像就像是材料包，Docker 容器就像是你的廚房，而 Dockerfile 就是食譜，裡面記載了如何做麵包的步驟。設置好之後你只需要等著麵包出爐就好了。

## 為什麼要自動化 Docker 構建？

自動化 Docker 映像的構建可以確保每次代碼更新後，都能自動地生成最新的映像並推送到 Docker Hub 或其他容器倉庫。這樣可以保證你的應用在生產環境中總是運行最新的版本，並且大大簡化了部署過程。

## 設置 GitHub Actions 以自動化 Docker 構建

下面的步驟展示了如何使用 GitHub Actions 自動化 Docker 映像的構建和推送。

### 步驟 1：創建 Dockerfile

在你的專案根目錄中創建一個 `Dockerfile`，該文件描述了如何構建 Docker 映像。例如，對於一個 Node.js 應用，`Dockerfile` 可以如下：

```Dockerfile
# 使用官方 Node.js 映像作為基礎
FROM node:20

# 設置工作目錄
WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝應用依賴
RUN npm install

# 複製應用程式
COPY . .

# 暴露應用端口
EXPOSE 3000

# Docker，啟動！
CMD ["npm", "start"]
```

### 步驟 2：創建 GitHub Actions 工作流程

在 `.github/workflows` 目錄下創建一個 YAML 文件，例如 `docker-build-and-push.yml`。這個文件定義了自動化 Docker 構建和推送的流程。

```yaml
name: Build and Push Docker Image

on:
  push:
    branches:
      - main # 當推送到 main 分支時觸發工作流程

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Check out code
        uses: actions/checkout@v2

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v2
        with:
          context: .
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/my-app:latest
```

### 步驟 3：設置 Docker Hub 憑證

1. **登錄 Docker Hub**: 登錄到 Docker Hub，獲取你的 Docker Hub 用戶名和密碼。
2. **設置 GitHub Secrets**: 在 GitHub 的倉庫設置中，找到 "Secrets and variables" 部分，創建兩個新的 secrets：`DOCKER_USERNAME` 和 `DOCKER_PASSWORD`，並將其設置為你的 Docker Hub 用戶名和密碼。

### 步驟 4：推送代碼並觸發工作流程

將你的代碼推送到 `main` 分支，GitHub Actions 將會自動構建 Docker 映像並推送到 Docker Hub。你可以通過以下指令確認映像是否推送成功：

```bash
docker pull ${{ secrets.DOCKER_USERNAME }}/my-app:latest
```

## 技巧與應用

1. **自定義標籤**: 你可以使用變數來自定義 Docker 映像的標籤。例如，使用 commit SHA 作為標籤：
   ```yaml
   tags: ${{ secrets.DOCKER_USERNAME }}/my-app:${{ github.sha }}
   ```
2. **多平台支持**: 使用 `docker/setup-buildx-action` 支持多平台構建，這樣可以在不同的平台上運行你的 Docker 容器。
3. **清理舊映像**: 定期清理不再使用的舊映像，以節省存儲空間。你可以使用 Docker Hub 的自動清理策略來實現這一點。

## 小結

自動化 Docker 映像的構建和推送不僅能提高你的開發效率，還能確保應用的一致性和可靠性。通過 GitHub Actions，你可以輕鬆地設置自動化流程，並將應用程序容器化，實現更快速和可靠的部署。

希望你能夠運用這些技巧，將 Docker 容器化應用到你的工作流程中，使得你的應用在不同的環境中都能穩定運行。既然已經包好了，明天就可以開始部署了！
