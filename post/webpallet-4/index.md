---
authors: elvismao
tags: [CSS]
categories: [網栈,教學]

date: 2023-07-31
---

# VSCode 教學與你值得擁有的擴充功能

哈囉大家好，我是毛哥EM，歡迎來到網棧。今天我要讓你學會使用VS Code建造網案與你值得擁有的擴充功能。

在我們開始之前讓我先簡單介紹什麼是VSCode。VSCode是一個整合式開發環境Integrated Development Environment（簡稱IDE）。因為寫程式需要同時用到很多工具，包括寫程式的文字編輯器，終端機，瀏覽器等。這時如果你有一個軟體可以做到所有的功能，還可以在需要其他功能時直接下載擴充，是不是十分的方便！

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/bWQtC3WyuBQ?si=ps1Tfy-tfc41rfY-" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 安裝軟體

首先請你到 [Visual Studio Code 官網](https://code.visualstudio.com)下載並安裝Visual Studio Code。打開安裝檔並一直下一步即可。如果顯示的版本不正確的話請你點擊箭頭選擇正確的作業系統版本。

## 建立網站

進到VSCode中會顯示歡迎畫面，你可以選擇你喜歡的主題顏色佈置。我們直接來試著架設一個網頁，首先請你先開啟一個資料夾，如果沒有的話你可以建立一個。比如說我建立了一個叫做資料夾的資料夾。在VSCode中我建議你開啟資料夾而不是單一檔案，除了切換檔案比較方便以外，有一些功能也需要開啟資料夾才能使用。

我們在資料夾建立一個檔案，命名叫做`index.html`。VSCode完全支援Emmet語法，我們輸入`!`並按下tab就會建立一個基本的HTML架構。沒錯，這才是完整的HTML，我們之前打在Codepen的HTML應該要打在`<body>`裡面。第一排的`<!DOCTYPE html>` 是在告訴瀏覽器使用最新的HTML5，`<head>`是放使用者看不到的網頁資訊，而`<body>`就是頁面內容。讓我來嘗試打開這個HTML檔案。點擊文件並且按下`alt`+`shift`+`r`或是點擊右鍵選擇在檔案總管開啟。雙擊使用瀏覽器打開。

你可以把視窗往螢幕的右側頂就會填滿右半部，左半部選擇VSCode即可完成左右畫面切割。對於製作網頁即時預覽非常方便。

## 擴充功能

### Live Server - 即時預覽

不過你可以發現每次編輯完存檔後右邊的瀏覽器都需要重新整理，非常麻煩，而且如果你使用久了，你會發現很多網站功能會失效。因此我建議你安裝一個擴充功能叫做Live Server。切換到擴充功能分頁並且安裝後，點擊右下角的Go Live就會自動架設本地的網頁伺服器，並顯示你的網頁。只要編輯完按`control`+`S`存檔就會即時同步更新。

### Indent Rainbow - 縮排彩虹

我建議你安裝一個擴充功能叫做Indent Rainbow - 縮排彩虹。他會幫你用不同的顏色標記每個縮排，在閱讀複雜文件時非常有用。

### VS Code Pets - 養隻寵物吧

一個人寫程式非常孤獨，但是你可以在VSCode裡養寵物。下載VSCode Pets擴充功能你就可以在VSCode視窗裡面養寵物，且我有把它翻譯成中文（對了，如果你看不慣英文介面VSCode也有繁體中文擴充功能可以安裝），你可以在設定裡改變寵物大小，場地背景以及開啟丟球模式。點擊+可以生成更多寵物，讓他們陪伴你度過痛苦的寫程式時光。

### Night Owl - 看起來舒服的主題

一直看著同一個畫面長時間會感到膩和煩躁。一個好看的主題可以讓你的眼睛更舒服。我十分喜歡Night Owl這個主題，對於不同資料型態的顏色和字體區分讓我開發起來很有效率，且長時間注視不會不舒服。

### Copilot / Tabnine - 讓AI助你一臂之力

我還建議你安裝GitHub Copilot。他會在你寫程式的時候預測你之後要打的內容，可以大幅加速你開發的效率。不過Copilot對於非學生是需要付費的，如果你有的話可以登入你的GitHub帳號驗證。如果沒有的話，使用Tabnine也有不錯的效果。你在寫程式的時候，他自己就會幫你猜下一行。你也可以透過註解要求他生成指定的內容比如說這裡我要求他生成一個質感設計的按鈕。

### Material Desig Icon - 好看圖示

最後我推薦你安裝一個圖示的擴充功能，它會給不同種類的檔案不同形狀的符號，讓你更輕鬆的找到檔案。我自己是使用Material Design Icon，我覺得滿好看的。

## 總結

好啦，以上就是我對VSCode的分享。我們還剩下git的功能還沒有提到，讓我們下禮拜再繼續聊。

週一早上六點，我會在YouTube和各大Podcast平台不定時更新。如果你喜歡文字版，也歡迎在Instagram和Google新聞追蹤毛哥EM資訊密技。
我是毛哥EM，讓我們下週再見！
