---
authors: elvismao
tags: [iOS 捷徑]
categories: [網站分享, API 分享, 捷徑分享]
date: 2022-01-06
---

# 【Remove.bg】讓 AI 幫你一鍵去背

在這篇文章我要介紹Remove.bg這個超讚的去被網站，並講解如何使用它提供的Api來製作捷徑，使你能夠一鍵去被

<!--more-->

去背對於影音創作者來說是十分重要的技能。除了可以凸顯主題之外，也可以對背景空間進行利用，不過如果要對沒有使用綠幕的圖片進行去背通常是一件十分痛苦的一件事。好在有一個線上的網站可以透過AI來去背，且效果十分不錯。
{{notice}}
Remove.bg" %}}

- 開發者:[Kaleido](https://www.kaleido.ai/)
- 類型:網站/網路應用程式
- 連結:[Remove.bg](https://Remove.bg)
  {{% /notice %}}

進入到網站後可以直接上傳照片。上傳完成後可以直接下載，也可以做一些編輯如手動去背（如果AI沒去好）、添加濾鏡、背景顏色等。

![Remove.bg介面](https://emtech.cc/images/remove-bg-site.jpg)

## ios捷徑（API）

每次去背都要打卡網頁操作，如果量多的話十分不方便。好在他們有提供API，可以讓我們用捷徑腳本來簡化步驟。

{{notice}}
API是什麼" %}}
API(Application Programming Interface)，中文叫做應用程式介面。你可以想像有一台飲料機，上面的按鈕就是 API ，當你投入錢並按下按鈕時飲料機就收到了你的需求，並將飲料從取物口送出，而投入的方式可以是硬幣、鈔票、或刷卡。{{% /notice %}}

以下是一個簡單的捷徑示範，你可以直接下載來使用。後面會提供簡單的製作教學。有多簡單呢，只有兩個方塊！
{{notice}}
Remove.bg一鍵去背" %}}

- 開發者:毛哥EM(我)
- 軟體類型:ios捷徑
- 下載位置:[iCloud](https://www.icloud.com/shortcuts/fce4a5a7643e4fc2b8c26fa82f5a2fc3)
  {{% /notice %}}

### 使用方法

要使用Remove.bg的API你需要一個用來辨識你是誰的API Key（仗權）。請先到[這裡](https://accounts.kaleido.ai/users/sign_in#api-key)註冊一個帳號，你可以直接使用Google登入，並複製你的API Key。

Remove.bg提供每個帳號每個月50次的免費使用。對一般人來說已經很足夠了，但如果還需要更多的話可以升級方案<s>或再註冊一個帳號</s>

![用捷徑去背](https://emtech.cc/images/remove-bg-api.jpg)

加入捷徑後請輸入剛才得到的API Key。

![Remove.bg介面](https://emtech.cc/images/remove-bg-shortcutsSetup.PNG)

要使用時只需要分享圖片，並點選捷徑即可。是不是超方便的！

![用捷徑去背](https://emtech.cc/images/remove-bg-shortcuts.jpg)

### 製作教學

從官方文件可以看出我們呼叫API至少需要提供API Key、大小、圖片，並以`Post`的方式傳遞到`https://api.remove.bg/v1.0/removebg`。所以捷徑只需要照著填入並儲存把回傳的圖片即可。實際設定如下

![捷徑動作](https://emtech.cc/images/remove-bg-shortcutsBlock.jpg)
