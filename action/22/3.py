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