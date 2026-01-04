---
authors: elvismao
categories: [網頁開發]
tags: [不用庫 也能酷 - 玩轉 CSS & Js 特效，HTML, CSS, JavaScript]
categories: [網頁開發]
thumbnail: /static/2023ironman-1/thumbnail.webp
date: 2023-10-03
---

# Day19 純 CSS 做出彈出式 Lightbox

最討厭的廣告就是彈出式 Lightbox 廣告了，他會突然跳出來，然後你要去找那個超小的叉叉關掉他。今天我們不是要重現煩人的廣告，而是要來認識 CSS 選擇器 `:target` 並做出以下效果。

![純 CSS 做出圖片 Lightbox](final.gif)

我們來用 Lightbox 看貓貓

## 認識 :taget

:target 是一個虛擬類別（pseudo-class）選擇器。他選擇的是超連結連結到的錨點（anchor）。直接上範例你就懂了。

```html
<a href="#one">One</a>
<a href="#two">Two</a>
<a href="#">no</a>
<div id="one">One</div>
<div id="two">Two</div>
```

```css
div:target {
	background: yellow;
}
```

![:target 範例](target.gif)

## 實作

那我們就裝飾一下這個版面和 Lightbox 就好啦！先從維基共享資源抓幾張圖片。

```html
<div id="one">
	<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Domestic_cat_in_the_grass.JPG/640px-Domestic_cat_in_the_grass.JPG" alt="" />
</div>
<div id="two">
	<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Cat_August_2010-4.jpg/640px-Cat_August_2010-4.jpg" alt="" />
</div>
<div id="three">
	<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/640px-Cat_November_2010-1a.jpg" alt="" />
</div>
<section>
	<a href="#one"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Domestic_cat_in_the_grass.JPG/640px-Domestic_cat_in_the_grass.JPG" alt="" /></a>
	<a href="#two"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Cat_August_2010-4.jpg/640px-Cat_August_2010-4.jpg" alt="" /></a>
	<a href="#three"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/640px-Cat_November_2010-1a.jpg" alt="" /></a>
</section>
<a href="#" id="close">✖</a>
```

連結有點亂我簡化一下，架構長這樣。

```html
<div id="one"><img src="" alt="" /></div>
<div id="two"><img src="" alt="" /></div>
<div id="three"><img src="" alt="" /></div>
<section>
	<a href="#one"><img src="" alt="" /></a>
	<a href="#two"><img src="" alt="" /></a>
	<a href="#three"><img src="" alt="" /></a>
</section>
<a href="#" id="close">✖</a>
```

簡單 CSS 裝飾，顏色使用 [Nord 的 Polar Night 配色](https://www.nordtheme.com/docs/colors-and-palettes)

```css
body {
	background: #2e3440;
	text-align: center;
	color: #eceff4;
	font-size: system-ui;
}
section {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 1rem;
}
a img {
	width: 30vw;
	display: block;
}
```

接下來來設計 Lightbox。我們希望他能置中並且背景有些許的模糊。因此設定在 `:target` 時背景使用 `filter` 來 blur 以及不透明度降低。而 Lightbox 本身則是使用 `transform` 來置中。

```css
div:target > img {
	opacity: 1;
}
div > img {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	opacity: 0;
	pointer-events: none;
	width: 90vw;
	height: calc(100vh - 6rem);
	object-fit: contain;
	z-index: 2;
}

div:target ~ #close {
	display: block;
}

div:target ~ section {
	filter: opacity(0.2) blur(10px);
}
```

關閉按鈕就放到右上角即可。

```css
#close {
	display: none;
	position: fixed;
	right: 1em;
	top: 1em;
	color: #fff;
	text-decoration: none;
	font-size: 2rem;
}
```

針對幾個可能有疑惑的 CSS 補充說明一下

- `pointer-events: none` 這個屬性可以讓滑鼠事件穿透，也就是讓滑鼠點不到他。因為如果使用 `display: none` 隱藏顯示就不會有淡入淡出效果。
- `object-fit: contain` 這個屬性可以讓圖片維持比例並且完整顯示在容器內。設定 `width` 和 `height` 等於是限定範圍，圖片會盡量放到最大但是不會超出。
- `z-index` 這個屬性可以設定元素的疊層順序，數字越大越在上面。因為我們希望 Lightbox 在最上面，所以設定為 2。
- `calc()` 這個函式可以讓你做數學運算，這邊是為了讓圖片寬度和高度稍微比螢幕小一點。
- `position: fixed` 這個屬性可以讓元素固定在螢幕上，不會隨著滾動而移動。方便我們定位原色到正中間。

最後加上一點動畫讓整體看起來更順暢。為了方便我就這樣寫，不過平常少用 `*` 會比較好，因為塞太多容易影響到效能。

```css
* {
	transition: all 0.3s;
}
```

## 成果

最終成果如下：https://codepen.io/elvismao/pen/jOXpJXX

![純 CSS 做出圖片 Lightbox](final.gif)

```html
<div id="one">
	<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Domestic_cat_in_the_grass.JPG/640px-Domestic_cat_in_the_grass.JPG" alt="" />
</div>
<div id="two">
	<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Cat_August_2010-4.jpg/640px-Cat_August_2010-4.jpg" alt="" />
</div>
<div id="three">
	<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/640px-Cat_November_2010-1a.jpg" alt="" />
</div>
<section>
	<a href="#one"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Domestic_cat_in_the_grass.JPG/640px-Domestic_cat_in_the_grass.JPG" alt="" /></a>
	<a href="#two"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Cat_August_2010-4.jpg/640px-Cat_August_2010-4.jpg" alt="" /></a>
	<a href="#three"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/640px-Cat_November_2010-1a.jpg" alt="" /></a>
</section>
<a href="#" id="close">✖</a>
```

```css
* {
	transition: all 0.3s;
}
body {
	background: #2e3440;
	text-align: center;
	color: #eceff4;
	font-size: system-ui;
	display: flex;
	align-items: center;
	min-height: 100svh;
	justify-content: center;
	overflow: hidden;
}
section {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 1rem;
}
a img {
	width: 30vw;
	display: block;
}

div:target > img {
	opacity: 1;
}
div > img {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	opacity: 0;
	pointer-events: none;
	width: 90vw;
	height: calc(100vh - 6rem);
	object-fit: contain;
	z-index: 2;
}
#close {
	display: none;
	position: fixed;
	right: 1em;
	top: 1em;
	color: #fff;
	text-decoration: none;
	font-size: 2rem;
}
div:target ~ #close {
	display: block;
}

div:target ~ section {
	filter: opacity(0.2) blur(10px);
	pointer-events: none;
}
```

以上就是我今天的分享，歡迎在 [Instagram](https://www.instagram.com/emtech.cc) 和 [Google 新聞](https://news.google.com/publications/CAAqBwgKMKXLvgswsubVAw?ceid=TW:zh-Hant&oc=3)追蹤[毛哥EM 資訊密技](https://emtech.cc/)，也歡迎訂閱我新開的[YouTube 頻道：網棧](https://www.youtube.com/@webpallet)。

我是毛哥EM，讓我們明天再見。
