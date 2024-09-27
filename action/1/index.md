# 靠著那 GitHub Actions，凡事都能做

> 腓立比書 4 章 13 節「我靠著那加給我力量的 (ymal)，凡事都能做」

## 引言

在這個系列的文章中，我們將深入了解並掌握 GitHub Actions 的使用方法。GitHub Actions 是 GitHub 提供的一項強大的 CI/CD（持續整合/持續部署）服務，能夠自動化我們的開發流程。除了能夠進行基本的測試與自動化部署之外，還可以進行爬蟲、資料分析、在各個作業系統環境打包和優化程式等等。正如這個系列的標題，只需要寫好一次流程，之後都可以交給 GitHub Actions。

在這 30 天裡每天都會有一個實作專題和相應的技巧學習，我都會以 Node.js 作為範例的語言，但是 GitHub Actions 當然並不限於 Node.js，無論你是使用 Python、Java、還是 Go，都可以使用 GitHub Actions 來自動化你的工作流程，而且設定的邏輯也都大同小異。歡迎大家可以到 [GitHub](https://github.com/Edit-Mr/2024-GitHub-Actions) 上查看相應的代碼和實作。如果喜歡這個系列也不要忘記留下一顆星星和關注喔！

---

## 什麼是 GitHub Actions？

GitHub Actions 是一個集成在 GitHub 平台上的 CI/CD 工具，**它能幫助開發者將各種工作流自動化**。CI/CD 是現代軟體開發流程中不可或缺的部分，CI 代表「持續整合」（Continuous Integration），CD 則代表「持續部署」（Continuous Deployment）。目標是將程式的整合與部署自動化，確保程式在合併、測試和部署過程中始終保持高品質和高效率。

> 白話文：每次手動測試部屬好麻煩又容易出錯，GitHub Actions 就是幫你把這些事情自動化，讓你專心寫程式。

### 為什麼需要 CI/CD？

隨著軟體專案規模的擴大，手動進行測試、整合和部署變得既繁瑣又容易出錯。CI/CD 的出現就是為了解決這個問題，它能夠自動執行以下操作：

- **自動測試**：每當有新程式提交時，自動運行測試，確保新程式不會破壞現有功能。
- **自動部署**：在測試通過後，自動將程式部署到生產環境，縮短發布周期。
- **自動化工作流**：將不同的任務（如測試、編譯、部署）串聯起來，自動完成整個流程。

當然，因為 CI/CD 本質上就是自己在虛擬機上跑一些腳本，因此你要拿來自動化文檔生成、性能測試、安全掃描等等都是可以的。重點就是要簡化並自動化繁瑣的工作。幫助開發者提高工作效率，減少錯誤，並確保程式的品質和穩定性。

### 如何開始使用 GitHub Actions？

我們來看看如何在自己的專案中設置 GitHub Actions。這裡我們以一個簡單的 Node.js 專案為例，設置一個基本的 CI（持續整合）工作流。這個工作流將在每次有程式提交時運行測試，確保程式的品質。這裡可以先看過就好，後面會有一步步的實作。

**第一步：創建 Workflow 文件**

要使用 GitHub Actions，我們需要在專案的根目錄下創建一個 `.github/workflows` 資料夾。這個資料夾中將存放所有的工作流文件。工作流文件使用 YAML 語法編寫，文件名可以自定義。例如，我們可以創建一個名為 `ci.yml` 的文件。

**第二步：編寫 Workflow 配置**

在 `ci.yml` 文件中，我們可以開始編寫一個簡單的工作流配置。以下是一個基本範例：

```yaml
name: Node 測試

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: 設置 Node.js 環境
        uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: npm install
      - run: npm test
```

這個工作流配置文件做了以下幾件事：

1. **name**: 定義了這個工作流的名稱 `Node 測試`。
2. **on**: 設置了工作流的觸發條件，這裡設定為每當有程式被推送（push）到倉庫時觸發。
3. **jobs**: 定義了工作流中的任務。這裡只有一個名為 `build` 的任務。
4. **runs-on**: 設定任務執行的環境，這裡選擇使用 `ubuntu-latest`，也就是最新穩定版本的 Ubuntu。
5. **steps**: 定義了任務中要執行的步驟。以這個範例來說包括檢出程式、設置 Node.js 環境、安裝依賴和運行測試。

**第三步：推送到 GitHub**

將修改推送到 GitHub 後，這個工作流會自動運行。你可以在 GitHub 的「Actions」標籤頁面中查看工作流的運行情況。

### GitHub Actions 的基本概念

GitHub Actions 的核心概念包括工作流（Workflow）、任務（Job）、步驟（Step）和動作（Action）。你可以想一個大任務裡面有很多個子任務。

1. **Workflow（工作流）**：工作流是一次要執行的整個過程，它由多個任務（Job）組成。你可以將工作流視為一系列自動化操作的集合。每個工作流會根據你設置的條件觸發，例如在每次 push 程式後運行測試。
2. **Job（任務）**：每個工作流由一個或多個任務組成。任務是工作流中的一個邏輯單位，通常每個任務會在不同的環境中執行不同的操作，例如在 Linux 上執行測試，在 Windows 上編譯程式等。
3. **Step（步驟）**：每個任務由多個步驟組成。步驟是任務中的具體操作，例如檢出程式、設置環境、運行命令等。
4. **Action（動作）**：動作是每個步驟中執行的具體命令或操作。例如，使用一個設定好的 Node.js 環境，或運行一個 shell 腳本。

### YAML 格式簡介

YAML 是一種簡單易讀的配置語法，跟 Json 有些類似，常用於編寫工作流文件或各種配置文件。在 YAML 中，縮排是非常重要的，它決定了不同元素之間的層次關係。這裡有一些基本的 YAML 語法知識：

- **鍵值對**：YAML 以 `key: value` 的形式定義鍵值對。例如：`name: CI for MyProject`。
- **列表**：使用 `-` 開頭的行表示列表中的每一項。例如：
  ```yaml
  steps:
    - uses: actions/checkout@v3
    - name: Set up Node.js
  ```
- **縮排**：縮排用於表示層次結構。你只要不小心多打一個你的檔案就會爆了。

### 進階配置：多任務與 Marketplace Actions

當你熟悉了基本的工作流配置後，你可以嘗試一些進階的配置，例如多任務的工作流，或是使用 Marketplace 提供的 Actions。

#### 多任務配置

你可以在一個工作流中配置多個任務，並行執行不同的操作。例如，同時在不同的操作系統上進行測試：

```yaml
jobs:
  build-linux:
    runs-on: ubuntu-latest
    steps:
      # Linux 要執行的步驟
  build-windows:
    runs-on: windows-latest
    steps:
      # Windows 要執行的步驟
  build-mac:
    runs-on: macos-latest
    steps:
      # MacOS 要執行的步驟
```

#### 使用 Marketplace Actions

GitHub Actions Marketplace 提供了許多現成的 Actions，能夠幫助你快速搭建工作流。例如，你可以使用 `setup-node` Action 來輕鬆設置 Node.js 環境：

```yaml
- name: Set up Node.js
  uses: actions/setup-node@v3
  with:
    node-version: "20"
```

這樣你就不需要手動編寫設置環境的程式，直接引用這個 Action 即可。你也可以自己把常用的 Action 上架至 Marketplace。

## 綜合練習 - 創建一個 Node.js 專案並設置 Jest 測試

現在讓我們來實際配置一個簡單的 CI/CD 任務，並推送到 GitHub 上運行。

我們來建立一個簡單的 Node.js 專案，並使用 GitHub Actions 進行自動化測試。這個專案將包括一個簡單的功能函數，以及一個測試文件。然後，我們將設置 GitHub Actions 自動化測試流程。如果你對於裡面的程式不理解的話沒關係，可以先跟著做。我們在接下來一個月會詳細的來介紹它們。

### 第一步：創建 Node.js 專案

1. **建立儲存庫**
   首先，進入 GitHub，點擊右上角的「New」按鈕來建立一個新的儲存庫，並將其克隆到本地。這個倉庫將用於存放我們的 Node.js 專案。如果你已經有現成的 Node.js 專案也可以直接拿來使用。

   ```bash
    git clone <你的倉庫地址>
    cd <倉庫名>
   ```

   > 沒有使用過 Git 和 GitHub 嗎? 你可以參考我之前寫的 [這篇文章](https://emtech.cc/post/github-and-git/)

2. **初始化 Node.js 專案**
   使用 `npm init` 初始化專案。這會創建一個 `package.json` 文件，用於管理專案的依賴套件和腳本。

   ```bash
   npm init -y
   ```

3. **安裝 Jest 測試框架**
   安裝 `Jest`，這是一個很常見的 JavaScript 測試框架。

   ```bash
   npm install jest --save-dev
   ```

4. **設定測試腳本**
   在 `package.json` 中添加一個測試腳本，用於運行測試。找到 `scripts` 區塊，並添加以下內容：

   ```json
   "scripts": {
     "test": "jest"
   }
   ```

### 第二步：撰寫簡單的功能和測試

1. **創建功能函數**  
   在專案的根目錄下創建一個 `index.js` 文件，並撰寫一個簡單的函數，例如計算兩數相加的函數：

   ```javascript
   function add(a, b) {
     return a + b;
   }

   module.exports = add;
   ```

2. **撰寫測試文件**  
   創建一個名為 `index.test.js` 的測試文件，放在專案根目錄中。這個測試文件將測試我們的 `add` 函數是否正常運行：

   ```javascript
   const add = require("./index");

   test("adds 1 + 2 to equal 3", () => {
     expect(add(1, 2)).toBe(3);
   });
   ```

現在你可以在本地嘗試運行測試：

```bash
npm test
```

這時候你的輸出應該是類似這樣的：

```bash
$ npm test
> 1@1.0.0 test
> jest

PASS  ./index.test.js
√ adds 1 + 2 to equal 3 (3 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.57 s
Ran all test suites.
```

### 第三步：設置 GitHub Actions

1. **創建 GitHub Actions 配置**  
   在專案的根目錄下創建 `.github/workflows` 資料夾，並在其中創建一個名為 `ci.yml` 的文件。將以下內容貼到 `ci.yml` 中：

   ```yaml
   name: Node 測試

   on: [push]

   jobs:
     build:
       runs-on: ubuntu-latest

       steps:
         - uses: actions/checkout@v3
         - name: Set up Node.js
           uses: actions/setup-node@v3
           with:
             node-version: "20"
         - run: npm install
         - run: npm test
   ```

   這個工作流會在每次有程式推送（push）到 GitHub 的時候自動運行，它將執行以下步驟：

   - 檢出程式
   - 設置 Node.js 環境
   - 安裝依賴套件
   - 運行測試

2. **推送程式到 GitHub**  
   將這個專案推送到你的 GitHub repository。

   ```bash
   git add -A
   git commit -m "Add Node.js project with Jest tests"
   git push
   ```

### 第四步：檢查 GitHub Actions 執行狀況

推送完程式後，打開你的 GitHub repository，點擊 "Actions" 標籤頁。你會看到 GitHub Actions 自動運行了我們配置的 CI 工作流。當測試通過時，你會看到綠色的標誌，表示一切正常。如果測試失敗，GitHub Actions 會給出詳細的錯誤信息，幫助你排查問題。

## 結語

今天我們初步了解了 GitHub Actions 的基本概念和配置方法，並親自實作了一個簡單的工作流。在這個系列當中我都會以 Node.js 作為範例的語言，但是 GitHub Actions 並不限於 Node.js，它支援多種語言和環境，包括 Python、Java、Go、Docker 等等。無論你使用什麼語言，都可以使用 GitHub Actions 來自動化你的工作流程，而且設定的邏輯也都大同小異。

今天的文章資訊量來蠻大的，因為我希望能夠帶大家完整的體驗一次 GitHub Actions 的完整使用流程。在接下來的文章中，我們將會回到 Hello World，一步一步地深入探討更多進階的功能和技巧，讓你能夠更靈活地運用 GitHub Actions 來自動化你的開發流程。
