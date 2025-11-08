---
authors: elvismao
tags: [iOS, 自製]
categories: [生活駭客]
date: 2024-01-12
---

# 教學：將學校行事曆輕鬆加入 Apple 日曆

在這篇文章中，我要教你如何將 Google 行事曆輕鬆加入你的 Apple 日曆中，方便你隨時掌握校園或者活動動態。讓我們開始吧！

### 步驟一：找到行事曆

首先請你找到學校或其他組織的行事曆，通常會放在首頁，且絕大部分是使用 Google 日曆。

![找到行事曆](0.webp)

### 步驟二：複製網址

你會看到右下角有一個添加行事曆的按鈕，不過點擊之後會添加到你的 Google 行事曆而不是 iPhone 的，因此我們只需要複製這個連結。你可以直接右鍵複製或是點開連結馬上複製網址。

以西苑高中為例：複製到的網址如下

```
https://calendar.google.com/calendar/render?cid=sysh.tc.edu.tw_iq8pt1qet88ps9ifm6l3cabl6s%40group.calendar.google.com
```

### 步驟三：修改網址

不過這個網址沒辦法被加入 Apple 行事曆，我們需要稍微修改一下。請你先複製剛才網址 cid= 後面的 ID，然後貼在這一串裡面

```
https://calendar.google.com/calendar/ical/剛才的ID/public/basic.ics
```

比如說西苑高中就是：

```
https://calendar.google.com/calendar/ical/sysh.tc.edu.tw_iq8pt1qet88ps9ifm6l3cabl6s%40group.calendar.google.com/public/basic.ics
```

### 步驟四：新增訂閱行事曆

在你的 iPhone 或 iPad 上，打開 Apple 日曆應用程式。這是預設安裝在 iOS 裝置上的應用程式。點擊畫面下方的「行事曆」標籤，接著點擊右上角的「新增行事曆」。在這裡，選擇「訂閱行事曆」。

![新增訂閱行事曆](1.webp)

### 步驟五：貼上網址

在這一步，將剛才修改玩的網址貼上。確認後，你可以選擇你喜歡的標示顏色。

![貼上網址::img-medium](2.webp)

### 完成！

恭喜你，現在你已經成功將學校行事曆加入你的 Apple 日曆中了！你可以透過日曆應用程式隨時查看活動和行事。你可以使用搜尋來塞選活動。

![完成 w100::img-medium](search.webp)

希望這篇文章能夠幫助到你。如果你有任何問題都可以在 IG 留言，也歡迎在 [Instagram](https://www.instagram.com/emtech.cc) 和 [Google 新聞](https://news.google.com/publications/CAAqBwgKMKXLvgswsubVAw?ceid=TW:zh-Hant&oc=3)追蹤[毛哥EM 資訊密技](https://emtech.cc/)。
