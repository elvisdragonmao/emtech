---
authors: elvismao
tags: [Office, Windows]
categories: [生活駭客]
date: 2023-01-19
---

# 【開源】快速免費啟用 Office 及 Windows

Office 雖然目前有提供免費線上版，且學校都有提供 Office365，但是都一定要使用線上版。除了十分不方便以外許多操作也都受到限制。因此這一篇文章我要來和大家分享一個可以安全啟動 Office 的工具，同時也可以啟用 Windows。適用於所有版本，包括最新的 Office 2022 及 Office 365。

# 步驟 1: 下載並安裝 Office

首先請先下載並安裝 Office，這裡提供 2021 官方載點。

- [專業增強版](https://officecdn.microsoft.com/pr/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/zh-tw/ProPlus2021Retail.img)

- [專業版](https://officecdn.microsoft.com/pr/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/zh-tw/Professional2021Retail.img)
- [家庭學生版](https://officecdn.microsoft.com/pr/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/zh-tw/HomeStudent2021Retail.img)
- [家庭企業版](https://officecdn.microsoft.com/pr/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/zh-tw/HomeBusiness2021Retail.img)

- [Project 專業版](https://officecdn.microsoft.com/pr/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/zh-tw/ProjectPro2021Retail.img)

- [Project 標準版](https://officecdn.microsoft.com/pr/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/zh-tw/ProjectStd2021Retail.img)

- [Visio 專業版](https://officecdn.microsoft.com/pr/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/zh-tw/VisioPro2021Retail.img)

- [Visio 標準版](https://officecdn.microsoft.com/pr/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/zh-tw/VisioStd2021Retail.img)

下載之後直接點擊`setup.exe`安裝。

安裝完之後會提示你可以免費試用或提供金鑰。當然如果你有的話就不會讀這篇文章了，因此我們先關閉軟體，並以**使用者管理員身分**打開 PowerShell。

## 步驟 2: 打開 PowerShell

請以**使用者管理員身分**打開 PowerShell。你可以在開始選單中找到它，或是在任何地方按下`Win+X`並選擇`Windows 終端機 (管理員)`。

![開啟 PowerShell](open-powershell.webp)

## 步驟 3: 輸入指令

接著輸入這一串指令並按 enter 來打開這個軟體：

```bash
irm https://get.activated.win | iex
```

在 2024/8/31 以前你也可以打這一串。

```bash
irm https://massgrave.dev/get | iex
```

這樣就進到軟體介面了。我們要啟用 office 所以請按鍵盤上的 4，然後點擊 2 來啟用 office。如果你要啟用 Windows 可以按 4，如果失敗其他的選項也可以試試看。

![軟體畫面。貼上完指令記得按 enter](massgrave.webp)

等幾秒就如果出現綠色的

`Product activation successful`

就代表啟動完成了。可以點擊 0 回到主選單並離開軟體（當然也可以直接關閉視窗）

再次打開 Office 軟體你就會發現驗證畫面不見了！到關於介面會看到已經成功啟動了。

如果又出現錯誤說授權到期了只需要再次執行指令就可以囉。

歡迎在 [Instagram](https://www.instagram.com/emtech.cc) 和 [Google 新聞](https://news.google.com/publications/CAAqBwgKMKXLvgswsubVAw?ceid=TW:zh-Hant&oc=3)追蹤[毛哥EM 資訊密技](https://emtech.cc/)。如果你有任何問題，都可以在 IG 留言或私訊我。
