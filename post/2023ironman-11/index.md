---
authors: elvismao
categories: [網頁開發]
tags: [不用庫 也能酷 - 玩轉 CSS & Js 特效，HTML, CSS, JavaScript]
categories: [網頁開發]
thumbnail: /static/2023ironman-1/thumbnail.webp
date: 2023-09-25
---

# Day11 說滾不是真的要你滾 - 背景滾動視差

你有看過這種頁面往下滾，但圖片位置沒有往下的效果嗎？

![background-attachment:fixed](scrolling.gif)

這是舊版的毛哥EM 資訊密技黑歷史。偷偷告訴你，這個效果只需要一行 CSS 就可以做到。`background-attachment` 屬性可以用來控制背景圖片的滾動方式。在這篇文章中，我們將詳細介紹這個屬性以及如何使用它來實現不同的效果。

## 什麼是 `background-attachment` ？

`background-attachment` 是 CSS 中用於控制背景圖片滾動行為的屬性。它有三個值：

1. `scroll`（滾動）：這是預設值，背景圖片將隨著頁面的滾動而移動。
2. `fixed`（固定）：背景圖片將保持固定在視口的某個位置，不隨頁面的滾動而移動。這可以建立一種視差滾動效果，使背景圖片保持在原地，而內容文字或元素則滾動過它。
3. `local`（本地）：它會使背景圖片隨著元素的內容滾動而移動，而不是整個頁面。有點像屬於那個框框的背景。這個值在大部分情況下比較少見。

## 飯粒範例

現在讓我們來看看幾個飯粒的範例

### 建立固定背景圖片

假設你想要在網站的首頁上建立一個固定的背景圖片，以實現視差效果。你可以這樣設定 CSS：

```css
body {
	background-image: url("your-image.jpg");
	background-attachment: fixed;
	background-size: cover; /* 可選，用於調整圖片大小以填充整個視口 */
}
```

![background-attachment:fixed](scrolling.gif)

這將使背景圖片保持固定，而內容將在其上滾動，建立出一種動態的效果。

### 使用 `scroll` 值

如果你想要一個網站上的背景圖片會隨著頁面滾動而移動…那麼你什麼都不用做，本來不就是這樣。但如果你有別的屬性蓋過去的話可以用 `scroll` 改回來。

```css
body {
	background-image: url("your-image.jpg");
	background-attachment: scroll;
}
```

### 使用 `local` 值

最後，如果你想要在某個元素內部建立一個背景圖片，並且希望它隨著該元素的滾動而移動，你可以使用 `local` 值。這個值通常應用於具有自己的滾動區域的元素，例如 `div` 或 `section`。

```css
.container {
	background-image: url("your-image.jpg");
	background-attachment: local;
}
```

這將使背景圖片與 `.container` 元素的內容滾動同步，而不是整個頁面。

來個大範例 <https://codepen.io/elvismao/pen/rNodVbV>

![飯粒範例](scroll.gif)

總之，`background-attachment` 屬性是一個強大的工具，可以用來控制背景圖片的滾動方式，從而實現不同的視覺效果。雖然實際功能不大但可以給人一種出乎意料且不會那麼死板的感覺。

不過這只是最基本的滾動視差，且只能應用在圖片上面。明天我們將要討論如何讓任何你想要的東西滾起來。

希望這篇文章能幫助你更好地理解和應用這個屬性，歡迎在 [Instagram](https://www.instagram.com/emtech.cc) 和 [Google 新聞](https://news.google.com/publications/CAAqBwgKMKXLvgswsubVAw?ceid=TW:zh-Hant&oc=3)追蹤[毛哥EM 資訊密技](https://emtech.cc/)，也歡迎訂閱我新開的[YouTube 頻道：網棧](https://www.youtube.com/@webpallet)。

我是毛哥EM，讓我們明天再見。
