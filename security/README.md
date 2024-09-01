# 破壞與重生：30 日爛站再造

每天帶你親手製作一個「爛」網站，刻意留下漏洞，然後從駭客的角度進行攻擊，最後再教你如何修補這些錯誤，從實戰中學習。

透過日復一日的實作，你將學習到如何識別和利用各種常見的網站漏洞，例如 SQL 注入、XSS、CSRF 等等。同時，我們也會探討如何有效地防範這些攻擊，幫助你從根本上提升網站的安全性。如果你是資安初學者，你可以在這裡有機會實際體驗到網站是如何被攻擊。如果你是大神，希望這個系列能夠博君一笑。廢話不多說，一起來做爛網站吧！

## 目錄

### Day 1-5: 常見注入漏洞
1. **Day 1: SQL Injection** - 利用基本的 SQL 注入來竊取資料庫資訊，並修復它。
2. **Day 2: NoSQL Injection** - 探討 NoSQL 資料庫（如 MongoDB）中的注入漏洞。
3. **Day 3: Command Injection** - 演示如何通過網站的表單來注入並執行系統命令。
4. **Day 4: LDAP Injection** - 介紹 LDAP 查詢的注入漏洞，並展示攻擊和防禦。
5. **Day 5: XML External Entity (XXE)** - 利用 XXE 漏洞來提取敏感文件或進行外部連接。

### Day 6-10: 資料洩露與加密問題
6. **Day 6: Sensitive Data Exposure** - 透過不安全的網站配置洩露敏感數據，如明文密碼。
7. **Day 7: Insecure Direct Object References (IDOR)** - 示範 IDOR 漏洞導致的資料洩露。
8. **Day 8: Man-in-the-Middle (MitM) Attacks** - 模擬中間人攻擊，探討 HTTPS 的重要性。
9. **Day 9: Insecure File Upload** - 探討不安全的文件上傳，並展示如何利用它來上傳惡意腳本。
10. **Day 10: Broken Authentication** - 介紹不當認證機制導致的攻擊，演示如何暴力破解密碼。

### Day 11-15: 跨站點攻擊
11. **Day 11: Cross-Site Scripting (XSS)** - 探討 XSS 攻擊，如何植入惡意腳本並竊取 Cookie。
12. **Day 12: Cross-Site Request Forgery (CSRF)** - 演示 CSRF 攻擊，如何利用用戶會話來執行未授權操作。
13. **Day 13: Clickjacking** - 教如何通過點擊劫持來欺騙用戶進行不經意的操作。
14. **Day 14: Open Redirect** - 展示如何利用開放重定向來誘導用戶進入釣魚網站。
15. **Day 15: Content Security Policy (CSP) Bypass** - 演示 CSP 如何被繞過，並探討其配置的重要性。

### Day 16-20: 伺服器與 API 安全
16. **Day 16: Directory Traversal** - 探討目錄遍歷漏洞，並展示如何存取敏感文件。
17. **Day 17: Server-Side Request Forgery (SSRF)** - 演示如何利用 SSRF 獲取內部網路資源。
18. **Day 18: Unrestricted File Upload** - 探討如何利用不受限制的文件上傳來攻擊伺服器。
19. **Day 19: API Key Leakage** - 模擬 API 金鑰洩露的危險性，並探討如何安全地存儲金鑰。
20. **Day 20: Insecure Deserialization** - 介紹不安全的反序列化漏洞，並展示如何利用它來執行代碼。

### Day 21-25: 環境配置與錯誤處理
21. **Day 21: Security Misconfiguration** - 探討常見的安全配置錯誤，如不當的伺服器設定。
22. **Day 22: Error Handling and Information Leakage** - 如何利用錯誤信息洩露來進行攻擊。
23. **Day 23: Default Credentials** - 探討使用預設帳密的風險，並演示如何破解。
24. **Day 24: Vulnerable Dependencies** - 介紹如何利用過時的第三方庫或插件中的漏洞。
25. **Day 25: Improper Asset Management** - 探討未被管理的資產，如舊版本或備份檔案，帶來的安全隱患。

### Day 26-30: 進階攻擊與防禦
26. **Day 26: Subdomain Takeover** - 演示子域名接管的過程，並探討如何避免這類攻擊。
27. **Day 27: Business Logic Vulnerabilities** - 介紹業務邏輯漏洞，展示如何利用不合理的業務流程進行攻擊。
28. **Day 28: Cloud Security Misconfigurations** - 探討雲端環境中的常見配置錯誤，如公開 S3 bucket。
29. **Day 29: Race Conditions** - 探討競態條件攻擊，展示如何利用多執行緒來攻擊系統。
30. **Day 30: Advanced Persistent Threats (APT)** - 模擬 APT 攻擊，展示如何進行持久化攻擊和如何防禦。
