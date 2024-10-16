---
authors: elvismao
tags: [Windows]
categories: [教學]
date: 2022-12-03
---

# 【Win11】取得電池報告！查看健康度、充電次數、歷史！

在Windows11無須依靠第三方軟體，只需要一行指令即可輕鬆取得電池的使用記錄和資訊。



## 取得報告方法

首先請進到命令題字元。可按Windows按鍵輸入cmd搜尋。

接著輸入這行指令

```bat
powercfg /batteryreport /output "battery.html" && battery.html
```

呃對，就這樣，我簡化的很簡單吧

在「已安裝電池」(Installed Battery)下會給出筆記型電腦所配的鋰電池的設計容量(Design Capacity)和當前實際容量(Full Charge Capacity)，最下方還有循環充電次數(Cycle Count)。

如果你感興趣的話，還可以通過「電池容量」歷史查看電池實際容量的變化情況，改變充放電習慣。 此外還有最近三天的電池電量使用記錄、電池壽命預估等。
