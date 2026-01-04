---
authors: elvismao
categories: [網頁開發]
tags: [不用庫 也能酷 - 玩轉 CSS & Js 特效，HTML, CSS, JavaScript]
categories: [網頁開發]
thumbnail: /static/2023ironman-1/thumbnail.webp
date: 2023-10-02
---

# Day18 純 CSS DVD 反彈動畫

今天我們要使用純 CSS 實現 DVD 反彈動畫，讓大家認識 `steps()` 以及 `animation-composition` 屬性的使用方式，並提供這個實用的應用。(應該吧...)

![](final.gif)

## HTML

HTML，簡單

```html
<div></div>
```

## CSS

### 版面

CSS 我們先不放背景圖片，用正方形就好了。用這種深藍色整個味道都出來了 XD。`<body>` 設定 `overflow: hidden;` 是因為有時候反彈時會撞出滾動條，看起來不是很舒服。

![](square.webp)

```css
body {
	background: #000;
	overflow: hidden;
}

div {
	width: 100px;
	height: 100px;
	background: blue;
}
```

### 動畫

我們分析一下，DVD 反彈動畫需要的動畫

- 水平移動 - `translateX()`
- 垂直移動 - `translateY()`
- 水平碰撞時改變顏色
- 垂直碰撞時改變顏色

#### 移動動畫

我們先來實現水平移動，我們使用 `translateX()` 來實現，並且使用 `animation` 屬性來實現動畫。因為元素定位點是在左上角，所以我們需要記得移動到 `100vw - 100%` 的位置就可以了。

> `transform:translate()` 的百分比是相對於自己的寬高計算的，所以我們可以使用 `100%` 來表示自己的寬高。

```css
@keyframes horizontal {
	from {
		transform: translateX(0);
	}
	to {
		transform: translateX(calc(100vw - 100%));
	}
}
```

![](horizontal.gif)

OK 沒問題。那垂直的也加上去。兩個時間故意設定稍微不一樣，讓路線隨機一點。

```css
div {
	width: 100px;
	height: 100px;
	background: blue;
	animation:
		horizontal 2.6s infinite linear alternate,
		vertical 2s infinite linear alternate;
}

@keyframes horizontal {
	from {
		transform: translateX(0);
	}
	to {
		transform: translateX(calc(100vw - 100%));
	}
}
@keyframes vertical {
	from {
		transform: translateY(0);
	}
	to {
		transform: translateY(calc(100vh - 100%));
	}
}
```

![](conflict.gif)

欸等等，垂直移動效果加上去之後，水平移動的效果就沒了！因為兩個都是使用 `transform` 屬性，所以其中一個被蓋過去了。但我們的動畫是要同時執行，變色動畫都還沒加上去啊！在之前常見的解決方法有

- 使用 `top`、`left` 屬性代替 `transform` 屬性
- 外面再包一層 `div`，讓 兩個 `div` 同時移動

而今天我們有一個更加優雅的解決方法，就是使用 `animation-composition` 屬性，讓兩個動畫同時執行。我們給 `div` 加上 `animation-composition` 屬性，並且設定 `accumulate` 值。

```css
animation-composition: accumulate;
```

![](both.gif)

呼~救回來了，但是我們的動畫還沒有變色，我們來加上變色的動畫。

#### 變色動畫

我們使用 `filter` 屬性來實現，`filter` 屬性有一個 `hue-rotate()` 函式，可以讓顏色旋轉，我們使用 `hue-rotate(360deg)` 來讓顏色旋轉一圈，就可以讓顏色變回原本的顏色了，讓所有顏色都可以跑過一次。

> 顏色改變的動畫長度記得要是平移動畫長度的倍數，才可以在撞牆時剛好變色。

> 複習：[Day7 幫我開濾鏡 filter](https://ithelp.ithome.com.tw/articles/10323423)

```css
div {
	/* 同上 */
	animation:
		horizontal 2.6s infinite linear alternate,
		vertical 2s infinite linear alternate,
		colorX 26s infinite,
		colorY 14s infinite;
	animation-composition: accumulate;
}

@keyframes colorX {
	to {
		filter: hue-rotate(360deg);
	}
}
@keyframes colorY {
	to {
		filter: hue-rotate(360deg);
	}
}
```

![](gradient.gif)

怎麼說呢，顏色是漸漸變而不是直接變，這樣看起來就不是很像 DVD 動畫了。而這個時候我們就要拿出 `step()`。`steps()` 是一個可以讓動畫在指定時間內，依照指定的步數來執行的函式，而不是漸變。中間可以填入數字代表中間要經過幾個顏色。

```css
animation:
	horizontal 2.6s infinite linear alternate,
	vertical 2s infinite linear alternate,
	colorX 26s infinite steps(10),
	colorY 14s infinite steps(7);
```

#### DVD 圖片

最後換成 DVD 的圖片。從[維基百科抓 svg 向量圖](https://upload.wikimedia.org/wikipedia/commons/9/9b/DVD_logo.svg)...結果...

![](nothing.webp)

甚麼都看不到。原因是 Logo 的背景是黑色的。你可以使用我製作的這個[圖示上色 CSS 濾鏡生成器](https://elvismao.com/code/svg-filter/)，透過 `filter` 屬性來改變 Logo 的顏色。把它貼上到動畫中，並在後面的`hue-rotate()` 屬性中加上 360 度就可以囉。

```css
@keyframes colorX {
	from {
		filter: invert(9%) sepia(84%) saturate(5931%) hue-rotate(245deg) brightness(116%) contrast(153%);
	}
	to {
		filter: invert(9%) sepia(84%) saturate(5931%) hue-rotate(605deg) brightness(116%) contrast(153%);
	}
}
```

成果如下

<https://codepen.io/elvismao/pen/abPjjMd>

![](okay.gif)

```html
<img src="https://upload.wikimedia.org/wikipedia/commons/9/9b/DVD_logo.svg" />
```

```css
body {
	background: #000;
	overflow: hidden;
}

img {
	width: 100px;
	animation:
		horizontal 2.6s infinite linear alternate,
		vertical 2s infinite linear alternate,
		colorX 26s infinite steps(10),
		colorY 14s infinite steps(7);
	animation-composition: accumulate;
}
@keyframes horizontal {
	from {
		transform: translateX(0);
	}
	to {
		transform: translateX(calc(100vw - 100%));
	}
}
@keyframes vertical {
	from {
		transform: translateY(0);
	}
	to {
		transform: translateY(calc(100vh - 100%));
	}
}
@keyframes colorX {
	from {
		filter: invert(9%) sepia(84%) saturate(5931%) hue-rotate(245deg) brightness(116%) contrast(153%);
	}
	to {
		filter: invert(9%) sepia(84%) saturate(5931%) hue-rotate(605deg) brightness(116%) contrast(153%);
	}
}
@keyframes colorY {
	from {
		filter: invert(9%) sepia(84%) saturate(5931%) hue-rotate(245deg) brightness(116%) contrast(153%);
	}
	to {
		filter: invert(9%) sepia(84%) saturate(5931%) hue-rotate(605deg) brightness(116%) contrast(153%);
	}
}
```

以上就是我今天的分享，歡迎在 [Instagram](https://www.instagram.com/emtech.cc) 和 [Google 新聞](https://news.google.com/publications/CAAqBwgKMKXLvgswsubVAw?ceid=TW:zh-Hant&oc=3)追蹤[毛哥EM 資訊密技](https://emtech.cc/)，也歡迎訂閱我新開的[YouTube 頻道：網棧](https://www.youtube.com/@webpallet)。

我是毛哥EM，讓我們明天再見。

> 參考資料：[ChokCoco](http://www.cnblogs.com/coco1s/) | [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-composition)
