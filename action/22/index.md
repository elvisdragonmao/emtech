# 爬蟲腳本與數據處理：使用 GitHub Actions 自動化

> 「讀書人的事，能算偷麼？」孔乙己如果是使用 GitHub Action 運行爬蟲腳本，就不會被人發現打斷腳了。

在這篇教程中，我們將探討如何使用 GitHub Actions 來自動運行 Python 爬蟲腳本，並處理和存儲抓取的數據。這個過程包括設置 GitHub Actions 工作流程、運行爬蟲腳本以及將結果存儲到不同的地方（如文件或數據庫）。

> 今日範例程式: <https://github.com/Edit-Mr/2024-GitHub-Actions/tree/main/22>

# **1. 設置 GitHub Actions 工作流程**

首先，我們需要創建一個 GitHub Actions 工作流程來運行爬蟲腳本。以下是一個基本的工作流程範例：

```yaml
name: Run Web Scraper

on:
  schedule:
    - cron: "0 0 * * *" # 每天午夜運行一次
  workflow_dispatch:

jobs:
  scrape:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Set up Python
        uses: actions/setup-python@v3
        with:
          python-version: "3.9"

      - name: Install dependencies
        run: |
          pip install -r requirements.txt

      - name: Run scraper
        run: |
          python scraper.py

      - name: Upload data
        uses: actions/upload-artifact@v3
        with:
          name: scraped-data
          path: data/
```

# **2. 編寫 Python 爬蟲腳本**

假設我們有一個爬蟲腳本 `scraper.py`，該腳本從某個網站抓取數據並將其存儲到本地文件。

以下是一個範例爬蟲腳本，使用 `requests` 和 `BeautifulSoup` 來抓取數據：

```python
# scraper.py

import requests
from bs4 import BeautifulSoup
import os
import json

# 設置要抓取的 URL
url = 'https://example.com'

# 發送 GET 請求
response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')

# 提取數據
data = []
for item in soup.select('.item-class'):
    title = item.select_one('.title-class').text
    link = item.select_one('a')['href']
    data.append({
        'title': title,
        'link': link
    })

# 創建數據目錄（如果不存在）
os.makedirs('data', exist_ok=True)

# 將數據寫入 JSON 文件
with open('data/results.json', 'w') as f:
    json.dump(data, f, indent=4)

print('Data has been scraped and saved to data/results.json')
```

# **3. 設置 `requirements.txt`**

在 GitHub Actions 中，我們需要安裝爬蟲腳本所需的依賴。創建一個 `requirements.txt` 文件來列出依賴項：

```
requests
beautifulsoup4
```

# **4. 完整實作**

1. **創建 GitHub Actions 工作流程文件**

   在 `.github/workflows` 目錄下創建 `run-scraper.yml` 文件，並添加上述工作流程內容。

2. **創建爬蟲腳本**

   將爬蟲腳本保存為 `scraper.py`。

3. **創建依賴列表**

   將 `requirements.txt` 文件添加到 repository 根目錄。

4. **創建數據目錄**

   確保 `data/` 目錄存在於 repository 中，以便存儲爬取的數據。

# **5. 使用不同存儲選項**

根據需要，你可以選擇將數據存儲到其他地方，例如：

- **數據庫**：將爬取的數據存儲到數據庫中（如 SQLite、MySQL）。
- **雲存儲**：將數據上傳到雲存儲服務（如 AWS S3、Google Cloud Storage）。
- **電子郵件**：通過電子郵件發送數據或通知。

## 範例：將數據存儲到 SQLite

以下是一個將數據存儲到 SQLite 數據庫的爬蟲腳本範例：

```python
# scraper.py

import requests
from bs4 import BeautifulSoup
import sqlite3

# 設置要抓取的 URL
url = 'https://example.com'

# 發送 GET 請求
response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')

# 連接到 SQLite 數據庫
conn = sqlite3.connect('data/scraped_data.db')
cursor = conn.cursor()

# 創建表（如果不存在）
cursor.execute('''
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    link TEXT
)
''')

# 插入數據
for item in soup.select('.item-class'):
    title = item.select_one('.title-class').text
    link = item.select_one('a')['href']
    cursor.execute('INSERT INTO items (title, link) VALUES (?, ?)', (title, link))

# 提交並關閉連接
conn.commit()
conn.close()

print('Data has been scraped and saved to data/scraped_data.db')
```

# **6. 測試和驗證**

推送更改到 GitHub repository，然後檢查 GitHub Actions 頁面來確保工作流程成功運行。下載生成的文件或查看數據庫，確認數據是否正確抓取和存儲。

# **7. 小結**

通過這篇教程，我們學會了如何使用 GitHub Actions 自動運行 Python 爬蟲腳本，並將抓取的數據存儲到不同的地方。這樣可以輕鬆地自動化數據抓取和處理過程，提高工作效率。如果有任何問題或需要進一步的幫助，隨時告訴我！
