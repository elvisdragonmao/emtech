---
authors: elvismao
categories: [網頁開發]
tags: [不用庫 也能酷 - 玩轉 CSS & Js 特效，HTML, CSS]
categories: [網頁開發]
thumbnail: /static/2023ironman-1/thumbnail.webp
date: 2023-09-18
---

# Day4 自己動！@keyframes 與 Transition

今天我們要來玩玩 CSS 動畫。CSS 動畫有兩種：

- @keyframes - 動作效果
- transition - 轉場效果

  我們今天都拿 PowerPoint 來舉例，雖然感覺現在的學生都快只認識 Canva 了 (順帶一提 Canva 就是 CSS 動畫)

你可以想像 `@Keyframes` 是 PowerPoint 的動畫

![Powerpoint 動畫](ppt.webp)

而且是一載入網頁就執行。當然我們可以透過 JavaScript 來指定執行的時間 (比如說滾動到元素的時候)

![](start.webp)

而 Transition 是轉場裡面的轉化效果

![Transition](transition.webp)

當元素的外觀因為各種原因 CSS 被改變 (比如說滑鼠滑過，JavaScript 設定，打開 F12 亂搞)，會平滑的轉換過去。我們先來講 Transition 因為他比較簡單。語法如下

```css
transition: 要改的屬性 持續時間 速度曲線 延遲;
transition: background 4s ease-in-out 1s;
```

每一個屬性都可以分開設定，但真的不用跟自己過意不去。有興趣的連結下收

- [transition-delay](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-delay)
- [transition-duration](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-duration)
- [transition-property](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-property)
- [transition-timing-function](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function)

每一個屬性都可以分開設定，也可以省略一些屬性不寫。比如說

```css
transition: background 1s;
```

你可以在後面用逗號分隔其他元素

```css
transition:
	background 1s,
	color 2s;
```

秒數也可以用毫秒 ms，但我習慣使用秒因為比較短。如果是零點幾零可以省略。比如說以下幾個都是一樣效果

```css
transition: background 500ms;
transition: background 0.5s;
transition: background 0.5s; /* 是不是看起來超舒服！*/
```

以下是一個按鈕範例。你可以看到放大屬性 `scale` 有設定 `transition` 所以會漸變，而背景顏色則沒有。

https://codepen.io/elvismao/pen/mdaPYLv

![按鈕範例](button.webp)

```html
<a href="">按鈕</a>
```

```css
a:hover {
	background-color: #ffffff4a;
	transform: scale(1.2);
}

a {
	transition: transform 0.3s ease-out;
	/* 以下只是裝飾 */
	display: block;
	color: #fff;
	text-decoration: none;
	font-family: sans-serif;
	font-size: 5em;
	border: #fff solid 5px;
	padding: 1rem;
	text-align: center;
	width: 3em;
}

body {
	background: #000;
	min-height: 100svh;
	/*   昨天講的置中 */
	display: flex;
	justify-content: center;
	align-items: center;
}
```

> 記得設定 `display:none` 不會有淡出效果，請用 `opacity:0;` 然後 `pointer-event: none;` 以防止誤觸。

下面是一個設定 Width 的範例

https://codepen.io/elvismao/pen/RwEamev

![Width Transition](width.gif)

```css
a::after {
	transition: width 0.5s ease-out;
	content: "";
	height: 2px;
	display: block;
	background: red;
	width: 0em;
}
a:hover::after,
a:active::after {
	width: 100%;
}
/* 以下只是裝飾 */
a {
	display: block;
	color: #fff;
	text-decoration: none;
	font-family: sans-serif;
	font-size: 5em;
	text-align: center;
	cursor: pointer;
}
body {
	background: #000;
	min-height: 100svh;
	/*   昨天講的置中 */
	display: flex;
	justify-content: center;
	align-items: center;
}
```

## @keyframes

要使用 keyframes 我們需要先建立一個動畫，再套用到元素上。他的語法是

```css
@keyframes 動畫名稱 {
	0% {
		/* 要套用的 CSS */
	}
	30% {
		/* 要套用的 CSS */
	}
	/* ...(中間可以放更多) */
	100% {
		/* 要套用的 CSS */
	}
}
```

以第一天我們做的汽車動畫為例。想要從最左邊移動到中間，也就是 `left` 從 0 變到 50%。動畫可以這樣寫：

```css
@keyframes drive {
	0% {
		left: 0;
	}
	100% {
		left: 50%;
	}
}
```

如果是從 0%~100% 可以寫 from 和 to

```css
@keyframes drive {
	from {
		left: 0;
	}
	to {
		left: 50%;
	}
}
```

因為我們本來 `left` 就在 0 了所以可以省略。只有一行 CSS 也分號也可以省略

```css
@keyframes drive {
	to {
		left: 50%;
	}
}
```

最後再套用到元素上就好啦~

```css
animation: drive 3s forwards;
```

https://codepen.io/elvismao/pen/NWeKpjj ![drive 3s forwards](car.gif)

CSS Animation 的語法如下

```css
/* @keyframes 持續時間 | 速度曲線 | 延遲 | 次數 | 方向 | 填充模式 | 播放狀態 | 名稱 */
animation: 3s ease-in 1s 2 reverse both paused slidein;

/* 持續三秒，延遲一秒 */
animation: 3s linear 1s slidein;
/* 和上面一樣，順序可以自由變換，我自己習慣這樣寫比較好讀 */
animation: slidein 3s linear 1s;
/* 這樣效果也一樣，記得前面的是時長，後面是延遲 */
animation: slidein linear 3s 1s;

/* 多重動畫 */
animation:
	3s linear slidein,
	3s ease-out 5s slideout;
```

## 速度曲線

我們在前面不管是設定 transition 還是 animation 都有時間曲線可以設定。可以根據你的需求做調整，也可以使用 `cubic-bezier()` 來自訂曲線。你可以使用[這個網站](https://cubic-bezier.com/)生成看看，不過我覺得內建的已經很夠用了。

![Ease](ease.webp)

[圖片來源：Max](https://www.programonaut.com/css-animations-learn-how-to-create-cool-animations-quickly/)

![線上 Cubic 工具](cubic.webp)

設定速度曲線可以讓你的動畫更流暢，不會有突然爆走的感覺，也可以讓動畫更有質感。對於超連結 `hover` 做特效建議可以設定成 `ease-out` ，因為滑鼠動畫通常大家會希望有即時反應，但又不希望突然結束。

以上就是我今天的分享，歡迎在 [Instagram](https://www.instagram.com/emtech.cc) 和 [Google 新聞](https://news.google.com/publications/CAAqBwgKMKXLvgswsubVAw?ceid=TW:zh-Hant&oc=3)追蹤[毛哥EM 資訊密技](https://emtech.cc/)，也歡迎訂閱我新開的[YouTube 頻道：網棧](https://www.youtube.com/@webpallet)。

我是毛哥EM，讓我們明天再見。
