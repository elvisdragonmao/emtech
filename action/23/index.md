# 設計和實作多階段 CI/CD 流程

> 子曰：「不在其位，不謀其政。」說明了多階段工作流程的重要性。

**引言**

在軟體開發中，設計一個穩定且高效的 CI/CD（持續集成與持續部署）流程是至關重要的。這不僅能夠提高開發效率，還能確保應用的品質。本文將通過一個具體示例展示如何使用 GitHub Actions 設計和實作一個多階段的 CI/CD 流程，包括構建、測試、部署和發布。

## 專案背景

我們將以一個簡單的 Python 應用為例，演示如何設置和管理 CI/CD 流程。該應用包含以下文件和功能：

- **`app.py`**：應用主文件。
- **`requirements.txt`**：依賴文件。
- **`tests.py`**：測試文件。
- **`setup.py`**：設置文件。

## 步驟 1: 準備專案

1. **創建專案文件夾**

   ```bash
   mkdir my-python-app
   cd my-python-app
   ```

2. **初始化 Python 環境**

   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

3. **創建 Python 應用**

   在 `my-python-app` 目錄下創建以下文件：

   - `app.py`：應用主文件。

     ```python
     # app.py
     def main():
         print("Hello, world!")

     if __name__ == "__main__":
         main()
     ```

   - `requirements.txt`：依賴文件。

     ```text
     # requirements.txt
     ```

   - `tests.py`：測試文件。

     ```python
     # tests.py
     def test_main():
         assert True
     ```

   - `setup.py`：設置文件。

     ```python
     # setup.py
     from setuptools import setup

     setup(
         name='my-python-app',
         version='0.1',
         py_modules=['app'],
         install_requires=[
             'Click',
         ],
         entry_points='''
             [console_scripts]
             app=app:main
         ''',
     )
     ```

## 步驟 2: 設置 GitHub Actions 工作流程

1. **創建 `.github/workflows` 目錄**

   ```bash
   mkdir -p .github/workflows
   ```

2. **創建 CI/CD 工作流程文件**

   在 `.github/workflows` 目錄下創建 `ci-cd.yml` 文件，並加入以下內容：

   ```yaml
   name: CI/CD Pipeline

   on:
     push:
       branches:
         - main
     pull_request:
       branches:
         - main
     workflow_dispatch:

   jobs:
     build:
       runs-on: ubuntu-latest

       steps:
         - name: Checkout code
           uses: actions/checkout@v2

         - name: Set up Python
           uses: actions/setup-python@v3
           with:
             python-version: '3.9'

         - name: Install dependencies
           run: |
             pip install -r requirements.txt

         - name: Build application
           run: |
             python setup.py build

         - name: Upload build artifacts
           uses: actions/upload-artifact@v3
           with:
             name: build
             path: build/

     test:
       runs-on: ubuntu-latest
       needs: build

       steps:
         - name: Checkout code
           uses: actions/checkout@v2

         - name: Set up Python
           uses: actions/setup-python@v3
           with:
             python-version: '3.9'

         - name: Install dependencies
           run: |
             pip install -r requirements.txt

         - name: Run tests
           run: |
             pytest

     deploy:
       runs-on: ubuntu-latest
       needs: test
       if: github.ref == 'refs/heads/main'

       steps:
         - name: Checkout code
           uses: actions/checkout@v2

         - name: Set up Python
           uses: actions/setup-python@v3
           with:
             python-version: '3.9'

         - name: Install dependencies
           run: |
             pip install -r requirements.txt

         - name: Deploy to server
           run: |
             rsync -avz build/ user@server:/path/to/deploy/

     release:
       runs-on: ubuntu-latest
       needs: deploy
       if: github.ref == 'refs/heads/main'

       steps:
         - name: Checkout code
           uses: actions/checkout@v2

         - name: Create release
           uses: actions/create-release@v1
           with:
             tag_name: ${{ github.sha }}
             release_name: Release ${{ github.sha }}
             draft: false
             prerelease: false
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

         - name: Upload release assets
           uses: actions/upload-release-asset@v1
           with:
             upload_url: ${{ steps.create_release.outputs.upload_url }}
             asset_path: ./build/your-application
             asset_name: your-application-${{ github.sha }}.tar.gz
             asset_content_type: application/gzip
   ```

### **工作流程解釋**

- **`build` 階段**：
  - **Checkout code**：檢出代碼。
  - **Set up Python**：設置 Python 環境。
  - **Install dependencies**：安裝依賴。
  - **Build application**：構建應用。
  - **Upload build artifacts**：上傳構建產物。

- **`test` 階段**：
  - **Checkout code**：檢出代碼。
  - **Set up Python**：設置 Python 環境。
  - **Install dependencies**：安裝依賴。
  - **Run tests**：運行單元測試。

- **`deploy` 階段**：
  - **Checkout code**：檢出代碼。
  - **Set up Python**：設置 Python 環境。
  - **Install dependencies**：安裝依賴。
  - **Deploy to server**：部署應用到伺服器（使用 `rsync`）。

- **`release` 階段**：
  - **Checkout code**：檢出代碼。
  - **Create release**：創建 GitHub Release。
  - **Upload release assets**：上傳釋出資源。

## 步驟 3: 配置 Secrets

1. **添加 GitHub Secrets**

   - 進入 GitHub repository 的 `Settings` 頁面。
   - 選擇 `Secrets` 和 `Actions`。
   - 添加以下 Secrets：
     - `GITHUB_TOKEN`：GitHub 自動生成的 token，用於創建和管理 releases。

## 步驟 4: 測試工作流程

1. **提交更改**

   提交所有更改並推送到 GitHub：

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **檢查 Actions**

   - 進入 GitHub repository 的 `Actions` 頁面。
   - 查看每個工作流程階段的執行情況，確保所有階段都成功完成。

## 步驟 5: 小結

在本文中，我們設置了一個多階段 CI/CD 流程，涵蓋了構建、測試、部署和發布。這樣的工作流程可以確保代碼的品質和應用的穩定性，並自動化常見的開發和部署任務，提高開發效率。