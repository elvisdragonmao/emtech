---
authors: elvismao
categories: [網頁開發]
tags: [不用庫 也能酷 - 玩轉 CSS & Js 特效，HTML, CSS, JavaScript]
categories: [網頁開發]
thumbnail: /static/2023ironman-1/thumbnail.webp
date: 2023-09-17
---

# Day3 用 Flex 切遍天下

當你拿到一張設計圖要照著做出來你的第一反應是什麼呢？是直接套 bootstrap 再說嗎？但我幾乎所有的切版**只要是整齊能畫出網格的，我都會使用 flex。**而這個網格也不一定是正方形，只要是矩形就可以了。

什麼意思呢？假設 Google 拿了一張首頁的設計圖給我要我照著做出來（假設）

那麼我會先看出來整個頁面被包在一個和螢幕一樣大的 flex 方框，垂直排列。而排完剩餘的空間全部給一個空白的方框。而上面的 nav 目錄方框裡面分左右兩個方框，靠兩側對齊。

![Google](www.google.com_.png)

當然這沒有正確答案，但你可以發現其實只用 flex 就可以完成所有的切版作業了。因此讓我們先來認識他的基本語法吧。

## Flex 基本語法

要使用 flex 很簡單，在 HTML 請你用一個箱子包住幾個元素。比如說我建立一個 `<section>` 包著幾個 `<div>` ，並設個背景顏色方便查看，同時附上昨天學到的快捷鍵。

```html
<!-- section>div*4 -->
<section>
	<div></div>
	<div></div>
	<div></div>
	<div></div>
</section>
```

```css
section {
	background: #191d88; /* bg #191d88 */
	padding: 5px; /* p5 */
}

div {
	width: 100px; /* w100 */
	height: 100px; /* h100 */
	background: #ffc436; /* bg #ffc436 */
	margin: 20px; /* m20 */
}
```

![Untitled](Untitled.webp)

因為 `div` 是區塊元素 (display: block) 所以元素都會換行，而這很重要因為這樣我們才能設定他的寬高。但如果我們加上 `display: flex` 就可以讓他們並排。

![Untitled](flex.webp)

我們把外面包著大家的藍色元素叫做外容器，裡面叫做內容器。我們可以在外容器的 CSS 設定裡面的東西怎麼排。

## 方向 **flex-direction**

```css
section {
	flex-direction: row; /* 預設左到右 */
	flex-direction: row-reverse; /* 右到左 */
	flex-direction: column; /* 上到下 */
	flex-direction: column-reverse; /* 下到上 */
}
```

比如說我設成 `row-reverse` 就會從右到左排。

![Untitled](reverse.webp)

## 超過換行 **flex-wrap**

如果不設定的話瀏覽器會硬擠成一排。

![Untitled](wrap.webp)

你可以加上 `flex-wrap: wrap` 來解放他。所有值如下

```css
flex-wrap: nowrap; /* 不換行 */
flex-wrap: wrap; /* 太寬換行 */
flex-wrap: wrap-reverse; /* 換行但從下到上排 */
```

## flex-flow

這是 `flex-direction` 和 `flex-wrap` 的縮寫，所以只要在這前後帶上相對應的值即可。

```css
.flex-container {
	flex-flow: < "flex-direction" > || < "flex-wrap" >;
}
```

## 水平對齊 **justify-content**

元素要對齊哪裡。注意如果你設定 `flex-direction: column;` 就是垂直對齊方向。這裡使[卡伯斯](https://www.casper.tw/css/2017/07/21/css-flex/)製作的示意圖，非常清楚。

```css
justify-content: flex-start | flex-end | center | space-between | space-around;
```

![Untitled](justify.webp)

## 垂直對齊 **align-items**

你懂得，和上面相反。如果你設定 `flex-direction: column;` 就是水平對齊方向。

![Untitled](align-items.webp)

`flex-start` 靠開始位置、 `flex-end` 靠結束位置、 `center` 致中、 `strech` 拉到一樣高、 `base-line` 會找文字的位置對齊。

## **多行對齊 align-content**

是上一個屬性的多行版本，比較少用，但排列方式也有多一些，但注意 `stretch` 在高度被限制的情況下不會正常伸展。

```css
align-content: flex-start | flex-end | center | space-between | space-around | stretch;
```

![Untitled](align-content.webp)

## 內元件設定

我們會再內元件 (黃色方塊) 設定的 CSS 不多。我們可以使用 **`align-self: flex-end`** 設定單獨一個元素的特別往另一邊靠，也可以設定假設排完有多的空間要給誰。

- flex-grow: 剩下空間方給他幾份，預設值為 `0`，如果設定為 0 則不會縮放，1 以上就大家來分。
- flex-shrink: 反之，當空間分配還不足時的目前元件的收縮性，預設值為 `1`，如果設定為 0 則不會縮放。
- flex-basis: 元件的基準值，可使用不同的單位值。

比如說以下是一個頁首，使用 `flex-grow` 把剩下的空間都給中間。

https://codepen.io/elvismao/pen/ZEVWaqq

![flex-grow](flex-grow.webp)

你可以使用 **`order`** 屬性來設定順序，前到後放入整數，支援負值。但我從來沒有用到過，都是直接在 HTML 改，不過還是提供給大家。

如果你不熟悉 flex 的話你可以到 **[Flexbox Froggy](https://flexboxfroggy.com/#zh-tw)** 這個網站，用遊戲的方式了解 flex。(然後提示是可以直接按，不用慢慢輸入喔)

![Untitled](froggy.webp)

你也可以使用今天所學到的語法複製一個 Google 的網頁。重點在排版所以按鍵的陰影和顏色可以直接打開開發者工具查看喔。我先做了一個範例提供大家參考，也能實現搜尋功能。如果有任何問題也歡迎留言。

> [範例網站](https://sysh-tech-volunteer.github.io/Web-Design-Camp/practice/google.html) | [原檔 HTML](https://github.com/SYSH-Tech-Volunteer/Web-Design-Camp/blob/main/practice/google.html) | [原檔 CSS](https://github.com/SYSH-Tech-Volunteer/Web-Design-Camp/blob/main/practice/google.css)

以上就是我今天的分享，歡迎在 [Instagram](https://www.instagram.com/emtech.cc) 和 [Google 新聞](https://news.google.com/publications/CAAqBwgKMKXLvgswsubVAw?ceid=TW:zh-Hant&oc=3)追蹤[毛哥EM 資訊密技](https://emtech.cc/)，也歡迎訂閱我新開的[YouTube 頻道：網棧](https://www.youtube.com/@webpallet)。

我是毛哥EM，讓我們明天再見。
