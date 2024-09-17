## 自動化多平台 Python 應用打包

> 不如虎穴，焉得虎子，說明了 pyinstaller 要打包 macOS 的執行檔一定要在 macOS 環境運行。

為了支援多平台的 Python 應用打包（例如 Windows、macOS 和 Linux），我們可以使用 GitHub Actions 和 PyInstaller 配合使用。以下是一步步的詳細指南，介紹如何在 GitHub Actions 中設置自動化打包，生成適用於不同作業系統的可執行文件。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/21>

## **1. 準備工作**

首先，確保你的 Python 應用準備好了。假設我們仍使用前面範例中的 `hello.py` 文件。

## **2. 設置 GitHub Actions**

我們需要配置 GitHub Actions 來在不同的操作系統上運行 PyInstaller。以下是一個例子，展示了如何在 macOS、Windows 和 Linux 上自動化打包過程。

在你的 GitHub repository 中，創建一個新的工作流程文件。例如，在 `.github/workflows` 目錄下創建一個名為 `build-multi-platform.yml` 的文件，並添加以下內容：

```yaml
name: Build Multi-Platform

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest  # Linux 作業系統作為主要運行平台

    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        python-version: [3.9]  # 可以根據需要調整 Python 版本

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Set up Python
        uses: actions/setup-python@v3
        with:
          python-version: ${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          pip install pyinstaller

      - name: Build application
        run: |
          pyinstaller --onefile hello.py
        env:
          PLATFORM: ${{ matrix.os }}

      - name: Archive artifacts
        uses: actions/upload-artifact@v3
        with:
          name: hello-executable-${{ matrix.os }}
          path: dist/hello${{ matrix.os == 'windows-latest' && '.exe' || '' }}  # 根據平台確定擴展名
```

## **3. 詳細步驟解析**

- **Checkout repository**: 檢出 GitHub repository 的代碼。
- **Set up Python**: 安裝指定版本的 Python。
- **Install dependencies**: 安裝 PyInstaller。
- **Build application**: 使用 PyInstaller 打包 Python 應用，根據運行的操作系統環境變量來確定可執行文件的名稱和擴展名。
- **Archive artifacts**: 上傳生成的可執行文件作為 GitHub Actions 的構建產物，供後續下載或分發使用。

## **4. 完整的工作流程範例**

這個配置會在 Ubuntu、macOS 和 Windows 上運行 PyInstaller 來打包 `hello.py` 文件，並將生成的可執行文件上傳為工作流產物。

```yaml
name: Build Multi-Platform

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        python-version: [3.9]

    runs-on: ${{ matrix.os }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Set up Python
        uses: actions/setup-python@v3
        with:
          python-version: ${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          pip install pyinstaller

      - name: Build application
        run: |
          pyinstaller --onefile hello.py

      - name: Archive artifacts
        uses: actions/upload-artifact@v3
        with:
          name: hello-executable-${{ matrix.os }}
          path: dist/hello${{ matrix.os == 'windows-latest' && '.exe' || '' }}
```

## **5. 測試和驗證**

推送更改到 GitHub repository，然後檢查 GitHub Actions 頁面來確保工作流程成功運行。檢查生成的可執行文件是否能在對應的操作系統上正常運行。

## **6. 小結**

通過這篇教程，我們學會了如何在 GitHub Actions 中設置多平台的自動打包流程。這樣，我們可以在不同的操作系統上生成對應的可執行文件，並自動化打包和分發過程，提高了開發效率和應用的可用性。如果有任何問題或需要進一步的幫助，隨時告訴我！