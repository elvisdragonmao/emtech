---
authors: elvismao
categories: [網頁開發]
tags: [不用庫 也能酷 - 玩轉 CSS & Js 特效，HTML, CSS]
categories: [網頁開發]
thumbnail: /static/2023ironman-1/thumbnail.webp
date: 2023-09-20
---

# Day6 你怎在這？攻克 Position

在使用 CSS 做網站時幾乎一定會使用到 position 屬性，不過你真的知道它的原理和使用方式嗎？雖然乍看之下感覺很複雜但其實超簡單，你只需要幾分鐘就能完全理解了。

## 語法

```css
position: 屬性;
```

## Static - 該怎樣就怎樣

預設屬性，該在哪裡在哪裡，區塊元素佔整排，行內元素繼續往右。

通常不需要特別設定，除非其他 CSS 把他設定到別的然後你想要改回來。

## Relative - 解鎖偏移（相對位置）

設定成 relative 的元素可以解鎖使用 top, bottom, left, right 屬性，讓它看起來往某個地方移動一點點。但是還是佔據原本的位置。

## Absolute - 在哪都行（相對位置）

設定成 absolute 的元素會變成像是一張貼紙一樣貼在網頁上，所以原本的位置不在佔據。你一樣可以使用 top, bottom, left, right 屬性來定位元素。它定位的位置（也就是設定 top:0; left:0; 最左上角的位置）會變成外面不是 position: static 的元素。最常見的使用方法是先在外面使用 relative，然後裡面放入 absolute 就可以完成置中等各種定位。

## Fixed - 卡在畫面上

設定 Fixed 的元素會直接以螢幕的左上角為定位點進行定位，並且無論怎麼滾動畫面都會待在哪裡。最常見的使用時機是網頁右下角回到最上面的按鈕，或者是煩人的分享按鈕。

## 範例

來一個範例讓大家分辨它們不同的效果

https://codepen.io/elvismao/pen/rNoYOKZ ![範例](sunny.webp)

```html
<div class="sun">Fixed</div>
<div class="cloud">Static</div>
<div class="cloud relative">Relative</div>
<div class="building">
	Relative
	<div class="roof">Absolute</div>
</div>
```

```css
body {
	background: lightblue;
	text-align: center;
	font-weight: 800;
}
.sun {
	width: 100px;
	height: 100px;
	background: yellow;
	border-radius: 50%;
	position: fixed;
	right: 30px;
	top: 30px;
}
.cloud {
	width: 300px;
	height: 100px;
	left: 20%;
	background: white;
	border-radius: 30px 20px 100px 50px;
}
.relative {
	position: relative;
}
.building {
	width: 300px;
	height: 1000px;
	background: gray;
	position: relative;
	left: 50%;
}
.roof {
	position: absolute;
	top: 0;
	left: 50%;
	width: 100px;
	height: 70px;
	background: #000;
	margin-top: -70px;
	color: #fff;
}
```

在這裡你可以看到

- 太陽設定為 `fixed`，所以就算滾輪滾動也不會改變位置。
- 第一朵雲因為沒有設定 `position`，所以就是預設的 `static`，所以它會在原本的位置。雖然他有設定 `left: 20%;` 但是因為他是 `static` 所以沒有效果。
- 第二朵雲設定為 `relative`，所以他會在原本的位置，但是可以使用 `top, bottom, left, right` 來偏移位置。
- 建築物設定為 `relative`，所以他會在原本的位置，我們使用 `right` 來偏移到正中間。可以看到它是元素左邊在最中間，因為對齊點是左上角。
- 裡面的黑色屋頂設定為 `absolute`，所以他會以外面的 `relative` 為對齊點，並且不佔據原本的位置。我們使用 `top: 0; left: 50%;` 來定位他，但這樣會讓他在建築物裡面，因此我們可以使用 `margin-top: -70px;` 來把他拉上去。

## 實際用途

CSS Position 在網頁設計中當然不只是這樣畫畫，他是非常實用的。以下是一些實際用途：

1. **懸浮按鈕**：當你想在網頁上添加一個固定在一側的懸浮按鈕，以便用戶可以輕鬆回到頁首或執行其他動作時，可以使用 fixed 定位方式。
2. **訊息提示框**：當你需要在頁面的特定位置顯示一個訊息或提示時，可以使用 absolute 定位方式。這樣你可以輕鬆控制提示框的位置和顯示時間。
3. **圖片輪播**：在網頁上建立圖片輪播時，你可以使用 relative 或 absolute 定位方式，使圖片在特定位置輪播顯示。
4. **懸浮菜單**：如果你想在網站的一個區域添加一個懸浮菜單，以便用戶可以存取不同的頁面或功能，可以使用 fixed 定位方式，讓菜單保持可見性。
5. **對話框**：當需要彈出對話框或模態框時，通常會使用 fixed 或 absolute 定位方式，以確保它出現在用戶的視線範圍內並居中顯示。
6. **圖像縮放效果**：如果你希望用戶可以點擊圖像進行放大或縮小，可以使用 absolute 定位方式，將放大的圖像放在螢幕中央，然後用戶可以通過單擊關閉它。
7. **自定義滾動條**：你可以使用 fixed 定位方式來建立自己的自定義滾動條，以增強網頁的外觀和交互性。

這些只是我列出幾個常見的使用方法，我們不管是在前面幾天或者是接下來的文章都一直會使用 position 語法，因此熟悉這篇文章的內容非常重要。

如果還是不清楚或是需要範例都歡迎提出，也歡迎在 [Instagram](https://www.instagram.com/emtech.cc) 和 [Google 新聞](https://news.google.com/publications/CAAqBwgKMKXLvgswsubVAw?ceid=TW:zh-Hant&oc=3)追蹤[毛哥EM 資訊密技](https://emtech.cc/)，訂閱我新開的[YouTube 頻道：網棧](https://www.youtube.com/@webpallet)。

我是毛哥EM，讓我們明天再見。
