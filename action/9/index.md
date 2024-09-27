# Jest Do It - 運行單元測試

> 《論語．公冶長》：「聽其言而觀其行。」說明了 unit test 的重要性。

今天，我們將深入了解如何使用 Jest 進行單元測試，並探討一些 Jest 的進階功能和應用。單元測試對於確保程式碼品質至關重要，它幫助我們發現代碼中的問題並確保功能按照預期運行。Jest 是一個功能強大的 JavaScript 測試框架，除了基本的單元測試外，它還支持快照測試、模組模擬等高級功能。讓我們一起探索這些功能及其應用。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/9>

## 什麼是 Jest？

Jest 是由 Facebook 開發的一個 JavaScript 測試框架，適用於測試 JavaScript 和 TypeScript 代碼。它提供了簡單的 API 和許多強大的功能，如快照測試、模組模擬、異步測試等。Jest 以其易用性、速度和強大的功能而受到廣泛歡迎。

### Jest 的基本功能

- **簡單的 API**：Jest 提供了簡單的 API 來編寫測試，如 `test` 和 `expect` 函數。
- **快照測試**：Jest 可以對函數的輸出進行快照測試，這對於測試 UI 組件和其他需要驗證輸出一致性的功能非常有用。
- **模組模擬**：Jest 支援模組模擬，允許你替換模組中的依賴套件以進行測試。
- **異步測試**：Jest 支援異步測試，允許你測試異步代碼，如回調、Promises 和 async/await。

## 實作：配置並運行 Jest 測試框架的單元測試

**步驟 1：設置 Jest**

1. **初始化 Node.js 專案**

   如果你還沒有 Node.js 專案，首先初始化一個新的專案：

   ```bash
   mkdir my-jest-project
   cd my-jest-project
   npm init -y
   ```

2. **安裝 Jest**

   在專案目錄中安裝 Jest：

   ```bash
   npm install --save-dev jest
   ```

3. **配置 Jest**

   在 `package.json` 文件中添加 Jest 配置：

   ```json
   {
     "scripts": {
       "test": "jest"
     }
   }
   ```

   這樣，你可以使用 `npm test` 命令來運行 Jest 測試。

4. **編寫測試**

   在專案根目錄下創建一個 `sum.js` 文件，並在其中編寫一個簡單的函數：

   ```javascript
   function sum(a, b) {
     return a + b;
   }

   module.exports = sum;
   ```

   然後，在同一目錄下創建一個 `sum.test.js` 文件，編寫測試代碼：

   ```javascript
   const sum = require("./sum");

   test("adds 1 + 2 to equal 3", () => {
     expect(sum(1, 2)).toBe(3);
   });
   ```

**步驟 2：配置 GitHub Actions**

1. **創建 `.github/workflows/test.yml` 文件**

   在專案根目錄下創建 `.github/workflows/test.yml` 文件，配置工作流程以運行 Jest 測試：

   ```yaml
   name: Run Jest Tests

   on:
     push:
       branches:
         - main
     pull_request:
       branches:
         - main

   jobs:
     test:
       runs-on: ubuntu-latest

       steps:
         - name: Check out code
           uses: actions/checkout@v3

         - name: Set up Node.js
           uses: actions/setup-node@v3
           with:
             node-version: "20"

         - name: Install dependencies
           run: npm install

         - name: Run tests
           run: npm test
   ```

**步驟 3：檢查工作流程結果**

1. **在 GitHub 上查看 Actions**

   進入 GitHub 的 `Actions` 標籤頁，檢查工作流程執行情況。你將看到 Jest 測試的結果。

2. **修復測試問題**

   根據 Jest 的測試報告，修復代碼中的問題，以確保所有測試都能通過。

## Jest 的進階功能和應用

1. **快照測試**

   快照測試允許你對函數的輸出進行快照，並在以後的測試中比較這些快照。這對於測試 UI 組件和其他需要驗證輸出一致性的功能非常有用。

   **範例：**

   ```javascript
   const myFunction = require("./myFunction");

   test("matches the snapshot", () => {
     expect(myFunction()).toMatchSnapshot();
   });
   ```

   **注意：** 快照文件將保存在 `__snapshots__` 目錄中，每次測試運行時會進行比較。

2. **模組模擬**

   Jest 支援模組模擬，允許你替換模組中的依賴套件以進行測試。

   **範例：**

   ```javascript
   const myModule = require("./myModule");

   jest.mock("./myDependency", () => {
     return {
       myFunction: jest.fn(() => "mocked value")
     };
   });

   test("uses the mocked dependency", () => {
     expect(myModule()).toBe("mocked value");
   });
   ```

3. **異步測試**

   Jest 支援異步測試，允許你測試異步代碼，如回調、Promises 和 async/await。

   **範例（回調）：**

   ```javascript
   function fetchData(callback) {
     setTimeout(() => {
       callback("data");
     }, 1000);
   }

   test("fetches data asynchronously", (done) => {
     fetchData((data) => {
       expect(data).toBe("data");
       done();
     });
   });
   ```

   **範例（Promises）：**

   ```javascript
   function fetchData() {
     return new Promise((resolve) => {
       setTimeout(() => {
         resolve("data");
       }, 1000);
     });
   }

   test("fetches data asynchronously with promises", () => {
     return fetchData().then((data) => {
       expect(data).toBe("data");
     });
   });
   ```

   **範例（async/await）：**

   ```javascript
   async function fetchData() {
     return new Promise((resolve) => {
       setTimeout(() => {
         resolve("data");
       }, 1000);
     });
   }

   test("fetches data asynchronously with async/await", async () => {
     const data = await fetchData();
     expect(data).toBe("data");
   });
   ```

## 設計測試時的一些技巧

1. **保持測試簡單明瞭**

   測試應該簡單明瞭，每個測試應該只關心一個功能或特殊情況。這樣可以更容易地找到問題並確保測試能夠準確描述功能需求。

2. **使用描述性測試名稱**

   測試名稱應該描述測試的預期行為，這樣可以更容易理解測試的目的。例如，使用 `test('should add two numbers correctly')` 代替 `test('test123')`。

3. **覆蓋特殊情況**

   測試應該覆蓋所有可能的特殊情況和錯誤情況，以確保代碼能夠處理這些情況。

4. **避免測試副作用**

   簡單來說就是不要留下痕跡。測試不應該改變系統狀態或影響其他測試，應該在測試完成後清理。我們使用 GitHub Actions 來運行測試，所以不太需要擔心這個問題。

5. **測試可配置性和錯誤處理**

   測試應該涵蓋代碼中的可配置性和錯誤處理路徑，以確保系統在各種情況下都能正常工作。不會因為一個小錯誤就導致整個系統崩潰。

6. **利用 Mock 和 Stub**

   使用模擬（mock）和替身（stub）來隔離測試對象和依賴項，這樣可以專注於測試對象本身的行為。

7. **測試速度和性能**

   測試應該快速運行，以提高開發效率。避免長時間運行的測試，並定期檢查測試性能。

## 結語

今天我們深入探討了 Jest 的功能和應用，包括快照測試、模組模擬、異步測試等。了解這些功能可以幫助我們編寫更全面的測試，確保代碼的穩定性和可靠性。希望你能通過今天的探討，更好地應用 Jest 進行單元測試，提高代碼品質和開發效率。明天我們要來討論如何在不同的平台上進行多平台測試。
