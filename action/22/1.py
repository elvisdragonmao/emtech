mport requests
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