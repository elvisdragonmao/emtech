---
authors: elvismao
categories: [網頁開發]
tags: [不用庫 也能酷 - 玩轉 CSS & Js 特效，HTML, CSS, JavaScript]
categories: [網頁開發]
thumbnail: /static/2023ironman-1/thumbnail.webp
date: 2023-10-10
---

# Day26 不要躲在下面動！Animate On Scroll 自己做

我們都知道 CSS 動畫可以用 `@keyframes` 來做，但是他們都是馬上就觸發的。就算元素還沒有出現在畫面上，動畫也已經開始了。

如果要做出滾動到某個位置才觸發的動畫，就需要用到 JavaScript 來偵測滾動位置，然後再加上 CSS 動畫。沒錯，JavaScript 回來了。

## 原理

我們要做的是當元素出現在畫面上時，才觸發動畫。所以我們要偵測元素是否出現在畫面上。

我們可以用 `getBoundingClientRect()` 來取得元素相對於螢幕的位置，然後再用 `window.innerHeight` 來取得畫面的高度，就可以知道元素是否出現在畫面上了。

這裡是一個我做的範例。你可以看到當元素的上方超出畫面時`top`就會變負值。當元素的下方超出畫面時`bottom`的值會大於螢幕高度。那麼我們只需要有任何一部分有顯示在畫面上就可以觸發動畫了。

https://codepen.io/elvismao/pen/ExGrxjX

![getBoundingClientRect()](getBoundingClientRect.webp)

> **為甚麼不要等整個元素顯示出來在觸發動畫？**  
> 因為如果元素很長，可能到半個畫面都空白之後他才出現會很奇怪。所以我們只要有任何一部分有顯示在畫面上就可以觸發動畫了，這樣滾動起來會比較順暢。  
> 如果你想要的話可以自己改成等整個元素顯示出來再觸發動畫，或是設定一些延遲時間以及增加動畫長度。後者我比較推薦。

## 實作

先打點簡單的內容。我們幫需要動畫的內容加上 `aos` 這個 class。這樣我們只要偵測這些元素是否出現在畫面上。如果有的話就加上 `ed` 這個 class。這樣我們就可以用 CSS 來做動畫了。

> 叫做 ed 是因為英文過去式常常加上 ed，想說蠻直覺野蠻短的。如果你有更好的主意也可以改成其他名字。

![簡單的版面](layout.webp)

```html
<h1 class="aos">Animate On Scroll</h1>
<p class="aos">
	Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad, mollitia magni nemo eius obcaecati aliquam ex nisi maiores. Autem hic illo quas amet ipsam. Eos tempore repellat sint illum tenetur!
</p>
<h2 class="aos">Scroll</h2>
<div></div>
<div class="aos"></div>
<div class="aos"></div>
<div class="aos"></div>
<div class="aos"></div>
```

```css
body {
	max-width: 600px;
	margin: 0 auto;
	font-size: 2em;
}
h2 {
	font-size: 2em;
}
div {
	height: 5em;
	background: lightblue;
	margin: 1em;
}
```

好的動畫我先簡單做一個淡入的動畫。平常隱藏起來，當加上 `ed` 這個 class 時就顯示出來。

```css
.aos {
	opacity: 0;
	transition: opacity 1s;
}

.aos.ed {
	opacity: 1;
}
```

加上 JavaScript，在頁面滾動時偵測每個有 `.aos` 的元素是否出現在畫面上。如果有的話就加上 `ed` 這個 class，沒有的話就回收。

```js
function isElementInViewport(el) {
	const rect = el.getBoundingClientRect();
	return rect.bottom < 0 || rect.top > window.innerHeight;
}

function addClassToVisibleElements() {
	var aosElements = document.querySelectorAll(".aos");
	aosElements.forEach(function (aosElement) {
		if (!isElementInViewport(aosElement)) aosElement.classList.add("ed");
		else aosElement.classList.remove("ed");
	});
}

document.addEventListener("scroll", addClassToVisibleElements);
addClassToVisibleElements();
```

![淡入動畫](fade.gif)

ok 成功，我們來多做幾個更浮誇的動畫。

## 盡情發揮

我希望文字出來的時候可以有一點浮出水面的感覺。套用這個 class 的元素會先隱藏起來，當加上 `ed` 這個 class 時就會從下方滑出來。

```css
.slideIn {
	transform: translateY(1em);
}
.slideIn.ed {
	transform: translateY(0em);
}
```

再來做一個從螢幕左邊滑近來的動畫。

```css
.slideInLeft {
	transform: translateX(-100vw);
}
.slideInLeft.ed {
	transform: translateX(0);
}
```

最後來示範一個 `@keyframes` 的動畫，我們讓他放大縮小好了。因為它不需要漸入所以把原本的 `opacity` 拿掉了。蓋掉

```css
.zoom {
	opacity: 1;
}
.zoom.ed {
	animation: zoom 1.5s forwards linear;
}
@keyframes zoom {
	0% {
		scale: 1;
	}
	25% {
		scale: 1.5;
	}
	50% {
		scale: 1;
	}
	75% {
		scale: 1.25;
	}
	100% {
		scale: 1;
	}
}
```

好啦成果如下，你可以試著滾動一下頁面看看。今天這幾行程式碼就一次取代了 [Animate.css](https://animate.style/)、[WOW.js](https://wowjs.uk/)、[AOS](https://michalsnik.github.io/aos/)、[ScrollReveal](https://scrollrevealjs.org/) 這些函式庫，而且還有更簡單更高的自訂性。

https://codepen.io/elvismao/pen/rNoPBZe

![所有效果](final.gif)

```html
<h1 class="aos slideIn">Animate On Scroll</h1>
<p class="aos slideIn">
	Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad, mollitia magni nemo eius obcaecati aliquam ex nisi maiores. Autem hic illo quas amet ipsam. Eos tempore repellat sint illum tenetur!
</p>
<h2 class="aos slideIn">Scroll</h2>
<div class="aos"></div>
<div class="aos"></div>
<div class="aos slideInLeft"></div>
<div class="aos zoom"></div>
<div class="aos slideIn"></div>
```

```css
body {
	max-width: 600px;
	margin: 0 auto;
	font-size: 2em;
}
h2 {
	font-size: 2em;
}

div {
	height: 5em;
	background: lightblue;
	margin: 1em;
}

.aos {
	opacity: 0;
	transition: all 1s;
}

.aos.ed {
	opacity: 1;
}

.slideIn {
	transform: translateY(1em);
}
.slideIn.ed {
	transform: translateY(0em);
}

.slideInLeft {
	transform: translateX(-100vw);
}
.slideInLeft.ed {
	transform: translateX(0);
}

.zoom {
	opacity: 1;
}
.zoom.ed {
	animation: zoom 1.5s forwards linear;
}
@keyframes zoom {
	0% {
		scale: 1;
	}
	25% {
		scale: 1.5;
	}
	50% {
		scale: 1;
	}
	75% {
		scale: 1.25;
	}
	100% {
		scale: 1;
	}
}
```

```js
function isElementInViewport(el) {
	const rect = el.getBoundingClientRect();
	return rect.bottom < 0 || rect.top > window.innerHeight;
}

function addClassToVisibleElements() {
	var aosElements = document.querySelectorAll(".aos");
	aosElements.forEach(function (aosElement) {
		if (!isElementInViewport(aosElement)) aosElement.classList.add("ed");
		else aosElement.classList.remove("ed");
	});
}

document.addEventListener("scroll", addClassToVisibleElements);
addClassToVisibleElements();
```

以上就是我今天的分享，歡迎在 [Instagram](https://www.instagram.com/emtech.cc) 和 [Google 新聞](https://news.google.com/publications/CAAqBwgKMKXLvgswsubVAw?ceid=TW:zh-Hant&oc=3)追蹤[毛哥EM 資訊密技](https://emtech.cc/)，也歡迎訂閱我新開的[YouTube 頻道：網棧](https://www.youtube.com/@webpallet)。

我是毛哥EM，讓我們明天再見。
