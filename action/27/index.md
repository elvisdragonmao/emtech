# 優化工作流程運行時間：使用 GitHub Actions 快取來加速構建

> 王貞白曾感嘆「一寸光陰一寸金」，可見優化工作流程運行時間的重要性。畢竟 GitHub Actions 在私人倉庫中可不是無限免費的！

在持續集成和持續部署 (CI/CD) 流程中，構建和測試的時間常常會成為效率瓶頸。為了加速這些過程，我們可以利用 GitHub Actions 的快取功能來儲存依賴項和中間結果，從而顯著提高工作流程的運行速度。本文將詳細介紹如何使用 `actions/cache` 來優化工作流程運行時間，並提供具體的實作範例。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/27>

## 為什麼需要快取？

在工作流程中，每次運行時都需要下載和安裝依賴項，這樣會消耗大量時間。使用快取可以存儲這些依賴項，避免每次都重新下載，從而加快構建過程。

## 基本概念

### `actions/cache` 插件

`actions/cache` 是 GitHub Actions 提供的一個官方插件，用於在工作流程運行中存儲和恢復快取。它通過為快取條目指定鍵值，來管理快取內容的創建和更新。

### 使用場景

- **Node.js**: 儲存 `node_modules` 目錄。
- **Python**: 儲存 `venv` 虛擬環境。
- **Java**: 儲存 Maven 或 Gradle 緩存。
- **其他**: 儲存任何生成的中間文件或下載的依賴。

## 實作範例

### 範例 1: 儲存 Node.js 依賴

1. **創建工作流程文件**

   在 `.github/workflows` 目錄下創建一個工作流程文件，例如 `node-cache.yml`，並加入以下內容：

   ```yaml
   name: Node.js CI with Cache

   on:
     push:
       branches:
         - main
     pull_request:

   jobs:
     build:
       runs-on: ubuntu-latest

       steps:
         - name: Checkout code
           uses: actions/checkout@v3

         - name: Set up Node.js
           uses: actions/setup-node@v3
           with:
             node-version: "20"

         - name: Cache node_modules
           uses: actions/cache@v3
           with:
             path: |
               ~/.npm
               node_modules
             key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
             restore-keys: |
               ${{ runner.os }}-node-

         - name: Install dependencies
           run: npm install

         - name: Run tests
           run: npm test
   ```

   **解釋**:

   - `actions/cache@v3`: 設置快取插件。
   - `path`: 指定需要快取的目錄，如 `node_modules` 和 `~/.npm`。
   - `key`: 唯一標識快取條目的鍵，通常使用文件哈希值。
   - `restore-keys`: 允許使用部分鍵來恢復快取。

2. **測試和驗證**

   提交上述工作流程文件到 GitHub repository，然後檢查工作流程運行情況。第一次運行時，快取會被創建；後續運行時，將會使用已儲存的快取來加速安裝過程。

### 範例 2: 儲存 Python 依賴

1. **創建工作流程文件**

   在 `.github/workflows` 目錄下創建一個工作流程文件，例如 `python-cache.yml`，並加入以下內容：

   ```yaml
   name: Python CI with Cache

   on:
     push:
       branches:
         - main
     pull_request:

   jobs:
     build:
       runs-on: ubuntu-latest

       steps:
         - name: Checkout code
           uses: actions/checkout@v3

         - name: Set up Python
           uses: actions/setup-python@v4
           with:
             python-version: "3.10"

         - name: Cache Python packages
           uses: actions/cache@v3
           with:
             path: ~/.cache/pip
             key: ${{ runner.os }}-python-${{ hashFiles('**/requirements.txt') }}
             restore-keys: |
               ${{ runner.os }}-python-

         - name: Install dependencies
           run: pip install -r requirements.txt

         - name: Run tests
           run: pytest
   ```

   **解釋**:

   - `path`: 指定需要快取的目錄，如 `~/.cache/pip`。
   - `key`: 使用 `requirements.txt` 文件的哈希值來生成唯一鍵。
   - `restore-keys`: 允許使用部分鍵來恢復快取。

2. **測試和驗證**

   提交上述工作流程文件到 GitHub repository，然後檢查工作流程運行情況。首次運行時，快取會被創建；後續運行時，將會使用已儲存的快取來加速安裝過程。

## 高級配置

### 自訂快取條目

你可以根據需要自訂快取條目。例如，對於 Java 項目，你可以快取 Maven 或 Gradle 的本地緩存，以加快構建過程：

```yaml
- name: Cache Maven packages
  uses: actions/cache@v3
  with:
    path: ~/.m2/repository
    key: ${{ runner.os }}-maven-${{ hashFiles('**/pom.xml') }}
    restore-keys: |
      ${{ runner.os }}-maven-
```

### 管理快取過期

快取條目會根據鍵值自動更新。你可以使用環境變數或版本號來管理快取的過期。例如，你可以在 `key` 中加入版本號，當版本更新時，自動創建新的快取條目。

```yaml
key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}-v1
```

## 小結

通過使用 `actions/cache`，我們可以顯著提高 GitHub Actions 工作流程的運行效率，減少依賴項下載和安裝的時間。這對於大型項目或頻繁運行的工作流程特別重要。希望本文對你了解如何在 GitHub Actions 中配置快取來優化工作流程運行時間有所幫助。
