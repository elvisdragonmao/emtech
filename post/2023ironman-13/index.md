---
authors: elvismao
categories: [網頁開發]
tags: [不用庫 也能酷 - 玩轉 CSS & Js 特效，HTML, CSS, JavaScript]
categories: [網頁開發]
thumbnail: /static/2023ironman-1/thumbnail.webp
date: 2023-09-27
---

# Day13 今天我想來點… 顏色選單

昨天的內容是不是有一點燒腦？沒關係，今天來點輕鬆的，只有一行 JavaScript。不管是在線上的文書軟體、製作網站的網站、或甚至是 iOS StandBy 都會有顏色選單。今天我們就來做一個極簡的吧，還要加上自訂顏色的功能。

![顏色選單成果](final.webp)

## 顏色選單 HTML

首先我們來簡單切版一下。畫面中只有標題和選單。選單裡面放一堆顏色，然後再放一個自訂顏色的輸入框。這裡我們使用了一個 `input type="color"` 的輸入框包在裡面，這個輸入框可以讓使用者選擇顏色，而且是原生的，不需要任何 JavaScript。當元素被點擊時，我們就把顏色傳給 JavaScript 更改背景。

```html
<h1>顏色選單</h1>
<div class="color-picker">
	<div class="color-option" style="background-color: #7aaaf1" onclick="changeColor('#7aaaf1')"></div>
	<div class="color-option" style="background-color: #8683ff" onclick="changeColor('#8683ff')"></div>
	<div class="color-option" style="background-color: #e683bc" onclick="changeColor('#e683bc')"></div>
	<div class="color-option" style="background-color: #ff788c" onclick="changeColor('#ff788c')"></div>
	<div class="color-option" style="background-color: #ff8d7b" onclick="changeColor('#ff8d7b')"></div>
	<div class="color-option" style="background-color: #f8d175" onclick="changeColor('#f8d175')"></div>
	<div class="color-option" style="background-color: #9ac78f" onclick="changeColor('#9ac78f')"></div>
	<div class="color-option" style="background-color: #7dc4ca" onclick="changeColor('#7dc4ca')"></div>
	<div class="color-option" style="background-color: #FFFFFF" onclick="changeColor('#FFFFFF')"></div>
	<div class="color-option" style="background-color: #565c6a" onclick="changeColor('#565c6a')"></div>
	<div class="color-option" style="background-color: #6b5762" onclick="changeColor('#6b5762')"></div>
	<div class="color-option" id="color">
		<input type="color" onchange="document.getElementById('color').style.backgroundColor=this.value;changeColor(this.value)" />
	</div>
</div>
```

輸入框被點擊並選擇顏色之後會觸發 onchange 事件。我們會把顏色傳給 `changeColor()` 這個函式更改背景，順便把自己的顏色也改成相同顏色。我們來加上一點簡單的 CSS。

## CSS

![簡單的 CSS](button.webp)

```css
body {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	min-height: 100svh;
	overflow: hidden;
	font-family: system-ui;
}

.color-picker {
	display: flex;
	justify-content: center;
	background: #ffffff55;
	border-radius: 2.5vmax;
	gap: 0.5vmax;
	padding: 0.5vmax 1vmax;
	box-shadow: 0 0.3vmax 1vmax #00000022;
}

.color-option {
	width: 2.5vmax;
	height: 2.5vmax;
	cursor: pointer;
	border-radius: 50%;
	overflow: hidden;
	position: relative;
}
.color-option:hover {
	box-shadow: 0 0 1vmax #ffdb4d55;
}
```

可以看到顏色選單預設有一些 CSS 並不是特別好看。我們把他的不透明度設成 0，這樣就能看不到他，但是點擊的時候還是可以選顏色。

```css
.color-picker input[type="color"] {
	width: 5vw;
	height: 5vw;
	opacity: 0;
	cursor: pointer;
}
```

最後我們在顏色選單的最後面加上一個 + 號偽元素讓大家可以一眼看出這個是可以選自己顏色的。我們把這個 + 號的位置設成絕對定位 `position:absolute`，然後用 transform: translate(-50%, -50%) 把他的位置移動到正中間。我們把`pointer-events`設定成`none`，這樣就不會點擊到加號而選不到顏色按鈕了。

```css
#color::after {
	content: "+";
	font-size: 0.5em;
	top: 50%;
	left: 50%;
	pointer-events: none;
	position: absolute;
	color: #fff;
	transform: translate(-50%, -50%);
	font-size: 1.5rem;
}
```

## JS

最後讓我們建立一個 `changeColor()` 函式，這個函式會把傳進來的顏色設定成背景顏色。

```js
const changeFontColor = c => (document.body.style.background = c);
```

這是 ES6 的寫法，如果你不習慣可以改成

```js
function changeFontColor(c) {
	document.body.style.background = c;
}
```

這樣就完成啦

https://codepen.io/elvismao/pen/abPVWBJ

![顏色選單成果](final.gif)

```html
<h1>顏色選單</h1>
<div class="color-picker">
	<div class="color-option" style="background-color: #7aaaf1" onclick="changeFontColor('#7aaaf1')"></div>
	<div class="color-option" style="background-color: #8683ff" onclick="changeFontColor('#8683ff')"></div>
	<div class="color-option" style="background-color: #e683bc" onclick="changeFontColor('#e683bc')"></div>
	<div class="color-option" style="background-color: #ff788c" onclick="changeFontColor('#ff788c')"></div>
	<div class="color-option" style="background-color: #ff8d7b" onclick="changeFontColor('#ff8d7b')"></div>
	<div class="color-option" style="background-color: #f8d175" onclick="changeFontColor('#f8d175')"></div>
	<div class="color-option" style="background-color: #9ac78f" onclick="changeFontColor('#9ac78f')"></div>
	<div class="color-option" style="background-color: #7dc4ca" onclick="changeFontColor('#7dc4ca')"></div>
	<div class="color-option" style="background-color: #FFFFFF" onclick="changeFontColor('#FFFFFF')"></div>
	<div class="color-option" style="background-color: #565c6a" onclick="changeFontColor('#565c6a')"></div>
	<div class="color-option" style="background-color: #6b5762" onclick="changeFontColor('#6b5762')"></div>
	<div class="color-option" id="color">
		<input type="color" onchange="document.getElementById('color').style.backgroundColor=this.value;changeFontColor(this.value)" />
	</div>
</div>
```

```css
body {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	min-height: 100svh;
	overflow: hidden;
	font-family: system-ui;
}

.color-picker {
	display: flex;
	justify-content: center;
	background: #ffffff55;
	border-radius: 2.5vmax;
	gap: 0.5vmax;
	padding: 0.5vmax 1vmax;
	box-shadow: 0 0.3vmax 1vmax #00000022;
}

.color-option {
	width: 2.5vmax;
	height: 2.5vmax;
	cursor: pointer;
	border-radius: 50%;
	overflow: hidden;
	position: relative;
}
.color-option:hover {
	box-shadow: 0 0 1vmax #ffdb4d55;
}

.color-picker input[type="color"] {
	width: 5vw;
	height: 5vw;
	opacity: 0;
	cursor: pointer;
}

#color::after {
	content: "+";
	font-size: 0.5em;
	top: 50%;
	left: 50%;
	pointer-events: none;
	position: absolute;
	color: #fff;
	transform: translate(-50%, -50%);
	font-size: 1.5rem;
}
```

```js
const changeFontColor = a => (document.body.style.background = a);
```

以上就是我今天的分享，歡迎在 [Instagram](https://www.instagram.com/emtech.cc) 和 [Google 新聞](https://news.google.com/publications/CAAqBwgKMKXLvgswsubVAw?ceid=TW:zh-Hant&oc=3)追蹤[毛哥EM 資訊密技](https://emtech.cc/)，也歡迎訂閱我新開的[YouTube 頻道：網棧](https://www.youtube.com/@webpallet)。

我是毛哥EM，讓我們明天再見。
