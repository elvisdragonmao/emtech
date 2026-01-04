---
authors: elvismao
categories: [網頁開發]
tags: [不用庫 也能酷 - 玩轉 CSS & Js 特效，HTML, CSS]
categories: [網頁開發]
thumbnail: /static/2023ironman-1/thumbnail.webp
date: 2023-09-23
---

# Day9 給你五彩斑斕的黑：mix-blend-mode

> 昨天我們只是一個人的色而已，今天疊在一起更刺激。

你有使用過 iOS17 的 StandBy 功能嗎？就是那個你一定要買磁吸充電還要喬好角度的功能。這不是重點，你有發現白色的數字時鐘似乎不只是有點半透明而已，還有一點說不出來的…高級感。

之所以會有這種效果是因為他使用了不同的混合模式，如果是有在畫圖或 P 圖的朋友絕對對它不陌生。我這裡使用 iPhone 的 Procreate 來示範，希望你能理解。

首先這是一顆球

![球](ball.webp)

好啦我知道我很不會畫畫，有些事情模糊一點比較好。前天學的 filter: blur() 拿來用一下，順便打上一道陽光。

![高斯模糊](light.webp)

好吧看來我把他救回來，然後又毀了。這個黃色和我這個直男一樣太直了。當顏色疊在一起的時候不一定要直接顯示上面的顏色，可以把兩個疊再一起的顏色做一些運算得出不同的數值。比如說我們可以用乘法把兩個顏色乘在一起得到一個很暗的結果（下面最右邊的圖）中文叫做色彩增值，而英文叫做 multiply 乘法就白話很多。以下是幾個不同混合模式的效果：

![不同混合模式](mix.webp)

可以看出明明是同樣的顏色相疊但整個出來的感覺差很多對吧！

而要在 CSS 使用混合模式也很簡單，語法是

```css
mix-blend-mode: normal;
mix-blend-mode: multiply;
mix-blend-mode: screen;
mix-blend-mode: overlay;
mix-blend-mode: darken;
mix-blend-mode: lighten;
mix-blend-mode: color-dodge;
mix-blend-mode: color-burn;
mix-blend-mode: hard-light;
mix-blend-mode: soft-light;
mix-blend-mode: difference;
mix-blend-mode: exclusion;
mix-blend-mode: hue;
mix-blend-mode: saturation;
mix-blend-mode: color;
mix-blend-mode: luminosity;
```

要死記這些語法代表的顏色很難，建議大家都可以測試玩看看。這裡給大家一個線上的[測試工具](https://www.casper.tw/WorkShop-gh-pages/cssBlendMode/)

![線上工具](online.webp)

我們來實際應用看看吧，這是一個簡單的數字範例。可以看出 mix-blend-mode 讓你的顏色堆疊有著更多的可能，不只是半透明而已，還有顏色互相堆疊渲染的效果。

https://codepen.io/elvismao/pen/jOXayXa

![時間數字範例](mix-time.webp)

```html
<h1>
	09:41
	<div class="mix">09:41</div>
</h1>
```

```css
body {
	background: linear-gradient(90deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%);
	color: rgba(255, 255, 255, 0.6);
	display: flex;
	align-item: center;
	justify-content: center;
	height: 100svh;
	font-size: 10vw;
}
.mix {
	mix-blend-mode: plus-lighter;
}
* {
	margin: 0;
}
```

我有自己復刻一個[網頁版的 StandBy](https://edit-mr.github.io/code/StandBy/)，有興趣的可以去逛逛或加入書籤喔。

你可以看出 mix-blend-mode 讓你的顏色堆疊有著更多的可能，一開始黑色的陰影也變得五彩斑斕。不過如果是圖片的話最好還是希望設計師可以弄到直接可以丟上來的狀態，因為這個屬性在很多情況下會罷工，又很難 debug；而且顯示出來的效果多少和 Photoshop 裡面也有一點點出入，所以如果是圖片的話最好還是調好比較好，不管是對於瀏覽器還是對於你都會比較輕鬆。這是我在上一個案子用血換的教訓。

以上就是我今天的分享，歡迎在 [Instagram](https://www.instagram.com/emtech.cc) 和 [Google 新聞](https://news.google.com/publications/CAAqBwgKMKXLvgswsubVAw?ceid=TW:zh-Hant&oc=3)追蹤[毛哥EM 資訊密技](https://emtech.cc/)，也歡迎訂閱我新開的[YouTube 頻道：網棧](https://www.youtube.com/@webpallet)。

我是毛哥EM，讓我們明天再見。
