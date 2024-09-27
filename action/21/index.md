# 我沒錢買 MacBook - 自動化多平台 Python 應用打包

> 不如虎穴，焉得虎子，說明了 pyinstaller 要打包 macOS 的執行檔一定要在 macOS 環境運行。

為了支援多平台的 Python 應用打包（例如 Windows、macOS 和 Linux），我們可以使用 GitHub Actions 和 PyInstaller 配合使用。以下是一步步的詳細指南，介紹如何在 GitHub Actions 中設置自動化打包，生成適用於不同作業系統的可執行文件。

## 背景

講好久 Node.js 了，今天來點 Python 的東西。PyInstaller 是一個用於將 Python 應用程序打包為獨立可執行文件的工具。它支持 Windows、macOS 和 Linux，並且可以將 Python 程序轉換為可執行文件 (像是 .exe)，讓使用者無需安裝 Python 解釋器也可以直接執行。

使用起來大概像這樣：

```bash
# 安裝 PyInstaller
pip install pyinstaller
# 打包成單一可執行文件
pyinstaller --onefile hello.py
```

一般情況下，我們需要在不同的操作系統上運行 PyInstaller 來生成對應的可執行文件。比如說 Windows 的 .exe 文件不能在 macOS 上生成。而且如果直接像上面這樣打包檔案會很大，所以大家通常會安裝虛擬環境，然後在虛擬環境中執行 PyInstaller 來打包 Python 應用。

這樣就需要在不同的環境中進行打包，並且需要手動處理和分發生成的可執行文件實在有夠麻煩，你還要為了打包的程式多買一台筆電。為了提高效率，我們可以使用 GitHub Actions 來自動化這個過程，並在不同的操作系統上自動打包 Python 應用。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/21>

## 準備工作

首先，請先準備一份你的 Python 文件。如果你還沒有，可以使用以下的範例代碼，這是一台簡單的計算機。

```python
def calculator():
    print("Python 計算機")

    while True:
        formula = input("請輸入運算式 (輸入 'exit' 離開): ")

        if formula.lower() == 'exit':
            print("再見！")
            break
        try:
            result = eval(formula)
            print(f"結果: {result}")
        except Exception as e:
            print(f"錯誤: {e}")

if __name__ == "__main__":
    calculator()
```

跑起來效果大概像這樣：

```
Python 計算機
請輸入運算式 (輸入 'exit' 離開): 1+2*3
結果: 7
```

## 設置 GitHub Actions

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
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        python-version: [3.11]

    runs-on: ${{ matrix.os }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

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

### 詳細步驟解析

- **Checkout repository**: 檢出 GitHub repository 的代碼。
- **Set up Python**: 安裝指定版本的 Python。
- **Install dependencies**: 安裝 PyInstaller。
- **Build application**: 使用 PyInstaller 打包 Python 應用，根據運行的操作系統環境變數來確定可執行文件的名稱和擴展名。
- **Archive artifacts**: 上傳生成的可執行文件作為 GitHub Actions 的構建產物，供後續下載或分發使用。

## 測試和驗證

推送更改到 GitHub repository，然後檢查 GitHub Actions 頁面來確保工作流程成功運行。檢查生成的可執行文件是否能在對應的操作系統上正常運行。

## 小結

通過這篇教程，我們學會了如何在 GitHub Actions 中設置多平台的自動打包流程。這樣，我們可以在不同的操作系統上生成對應的可執行文件，並自動化打包和分發過程，提高了開發效率和應用的可用性。如果有任何問題或需要進一步的幫助，隨時告訴我！
