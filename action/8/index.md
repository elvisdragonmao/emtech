# 今天不講 DVD，來談談 CI/CD - eslint 與 pylint

> 「知者不惑，仁者不憂，勇者不懼。」因為他們都有使用 eslint。

今天，我們將深入了解如何在 CI/CD 流程中使用 ESLint 進行程式碼品質檢查。ESLint 是一個熱門的 JavaScript 代碼靜態分析工具，用於識別和修復代碼中的問題。通過將 ESLint 集成到 GitHub Actions 中，我們可以確保提交到代碼庫的代碼遵循一定的代碼規範，提高代碼品質，降低錯誤率。

我們同時也會練習使用 pylint，這是一個 Python 代碼檢查工具，可以說是 Python 版本的 ESLint。通過將 ESLint 和 pylint 集成到 CI/CD 流程中，我們可以在代碼推送和拉取請求時自動運行代碼檢查，確保代碼符合規範。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/8>

## 實作：配置基本的 CI 工作流程運行 ESLint 和 pylint 測試

**步驟 1：設置 ESLint**

1. **初始化 Node.js 專案**

   如果還沒有 Node.js 專案，首先初始化一個新的專案：

   ```bash
   mkdir my-eslint-project
   cd my-eslint-project
   npm init -y
   ```

2. **安裝 ESLint**

   在專案目錄中安裝 ESLint：

   ```bash
   npm install eslint --save-dev
   ```

3. **初始化 ESLint 配置**

   使用 ESLint 的初始化命令來生成配置文件：

   ```bash
   npx eslint --init
   ```

   選擇適合你的設置，這裡是一些常見的選擇：

   - **How would you like to use ESLint?** To check syntax, find problems, and enforce code style.
   - **What type of modules does your project use?** JavaScript modules (import/export).
   - **Which framework does your project use?** None of these.
   - **Does your project use TypeScript?** No.
   - **Where does your code run?** Node.
   - **What format do you want your config file to be in?** JSON.

4. **設置 `.eslintrc.json` 文件**

   ESLint 配置文件 `.eslintrc.json` 會自動生成。你可以根據需要進行修改，例如添加規則或設置插件：

   ```json
   {
     "env": {
       "browser": true,
       "es2021": true
     },
     "extends": "eslint:recommended",
     "parserOptions": {
       "ecmaVersion": 12,
       "sourceType": "module"
     },
     "rules": {
       "indent": ["error", 2],
       "linebreak-style": ["error", "unix"],
       "quotes": ["error", "single"],
       "semi": ["error", "always"]
     }
   }
   ```

5. **添加 ESLint 測試腳本**

   在 `package.json` 文件中添加一個 ESLint 測試腳本：

   ```json
   "scripts": {
     "lint": "eslint ."
   }
   ```

**步驟 2：設置 pylint**

1. **初始化 Python 專案**

   如果你在處理 Python 專案，首先初始化一個新的專案：

   ```bash
   mkdir my-python-project
   cd my-python-project
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **安裝 pylint**

   使用 pip 安裝 pylint：

   ```bash
   pip install pylint
   ```

3. **創建 pylint 配置**

   初始化 pylint 配置：

   ```bash
   pylint --generate-rcfile > .pylintrc
   ```

   你可以根據需要修改 `.pylintrc` 配置文件。

4. **添加 pylint 測試腳本**

   在 `setup.py` 文件中添加一個 pylint 測試腳本：

   ```python
   from setuptools import setup

   setup(
       name='my-python-project',
       version='0.1',
       install_requires=[],
       entry_points={
           'console_scripts': [
               'lint = pylint.lint:Run',
           ],
       },
   )
   ```

**步驟 3：配置 GitHub Actions 工作流程**

1. **創建 `.github/workflows/ci.yml` 文件**

   在專案根目錄下創建 `.github/workflows/ci.yml` 文件，配置工作流程以運行 ESLint 和 pylint：

   ```yaml
   name: eslint and pylint CI

   on:
     push:
       branches:
         - main
     pull_request:
       branches:
         - main

   jobs:
     lint:
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

         - name: Run ESLint
           run: npm run lint

     pylint:
       runs-on: ubuntu-latest

       steps:
         - name: Check out code
           uses: actions/checkout@v2

         - name: Set up Python
           uses: actions/setup-python@v2
           with:
             python-version: "3.11"

         - name: Install dependencies
           run: |
             python -m pip install --upgrade pip
             pip install pylint

         - name: Run pylint
           run: |
             pylint **/*.py
   ```

   **YAML 文件解析：**

   - **`on:`** 定義觸發事件（推送和拉取請求）。
   - **`jobs:`** 定義工作流程中的工作（`ESLint` 和 `pylint`）。
   - **`steps:`** 定義每個工作的具體步驟，包括檢出代碼、設置環境、安裝依賴、運行檢查。

2. **提交工作流程配置**

   提交並推送 `.github/workflows/ci.yml` 文件到 GitHub：

   ```bash
   git add .github/workflows/ci.yml
   git commit -m "Add CI workflow with ESLint and pylint"
   git push origin main
   ```

   - 這將觸發工作流程，運行 ESLint 和 pylint 測試。

**步驟 4：檢查工作流程結果**

1. **在 GitHub 上查看 Actions**

   進入 GitHub 的 `Actions` 標籤頁，檢查工作流程執行情況。你將看到 ESLint 和 pylint 測試的結果。

2. **修復代碼問題**

   根據 ESLint 和 pylint 的報告，修復代碼中的問題，以確保代碼符合品質標準。

## 常用技巧

1. **配置自訂規則：**

   - 根據團隊的代碼風格要求，修改 ESLint 和 pylint 配置文件，添加或禁用特定的規則。

2. **設置 GitHub Secrets：**

   - 如果需要在 CI/CD 中使用私密信息（如 API 密鑰），可以將其設置為 GitHub Secrets，並在工作流程中安全地使用它們。

3. **優化工作流程：**

   - 將常見步驟提取到自訂 Action 中，或者使用 GitHub Marketplace 中的現成 Action 來簡化工作流程配置。

4. **調試工作流程：**

   - 使用 `debug` 模式來調試工作流程，檢查問題並優化配置。

5. **結合其他工具：**
   - 配合其他代碼品質工具（如 Prettier、Stylelint）來提高代碼的整體品質。

## 結語

今天我們探討了如何在 CI/CD 流程中使用 ESLint 和 pylint 進行代碼品質檢查。通過將 ESLint 和 pylint 集成到 GitHub Actions 中，我們可以在代碼推送和拉取請求時自動運行代碼檢查，提高代碼品質，降低錯誤率。

而明天我們要來寫更多測試。明天要來討論的是如何使用 Jest 來撰寫單元測試。
