---
authors: elvismao
categories: [網頁開發]
tags: [不用庫 也能酷 - 玩轉 CSS & Js 特效，HTML, CSS, JavaScript]
thumbnail: /static/2023ironman-1/thumbnail.webp
date: 2023-09-15
---

# Day1 相見歡 - 庫就不酷嗎？

哈囉大家好我是毛哥EM，歡迎來到 **【不用庫 也能酷 - 玩轉 CSS & Js 特效】**

在這 30 天裡面我會先帶大家複習一些許多人搞不懂但很重要的語法，接者將揭開如何以最精簡的程式，實現從簡單到複雜的特效，讓元素變得生動有趣。同時，我們也將挑戰自己，使用純 JavaScript 實現無需依賴庫的互動，從而提高網站效能和速度。

基本上如果你有追蹤且照著順序讀下來大部分的內容都會滿輕鬆的。而如果你是一位大神的話也歡迎沒事來逛逛，搞不好你會找到你沒聽過的各種冷知識喔 w

無論你是前端初學者還是經驗豐富的開發者，這個系列都將帶給你嶄新的思維。帶你製作令人驚艷的網站。

## 背景

第一天來講一下為什麼我要來寫這個系列。我從小學三年級開始玩 Wix（類似 WordPress 或 Google Site 的視覺化網頁編輯器），做網頁就像做簡報一樣拉一拉就好了。不過做出來的網頁預設載入了一大堆厚重的函式庫，明明只是淡入淡出還需要 GSAP。，載入 6、7 秒都算正常發揮。當時雖然不會 HTML 但按 F12 也能看出機器生成的程式碼又臭又長。加上 Wix 網站會有很醜的廣告橫幅，裡面充滿了各種付費解鎖功能，還有 RWD 非常難弄，讓我決定從此走向手刻這條不歸路…

![小學製作和朋友分享檔案的網站](bank.webp)

然而並不只是機器生成的程式碼才有載入問題，在現代網頁函式庫的使用也是非常氾濫的。像是明明只是顯示號碼牌的網頁還要套 Bootstrap，因為懶得打 `document.querySelector()`而安裝 jQuery，甚至打開 [Awwwards](https://www.awwwards.com/) 隨便找一個得獎的網站都要放一個載入動畫，似乎在洗腦你好的網站就是要等待的。

![Loading](loading.webp)

也許是我這個剛要升上高二的菜鳥不太會用函式庫，但自己做除了載入更快以外和可自訂性也比較高。只要熟悉效果後面的原理自己做是不會比較慢的。

## 用庫就不酷了嗎？

然而不一定所有東西都是手刻才是最好的選擇。比如像是顯示 3D 模型的 three.js、手機擴增實境功能的 ar.js 都不是自己能夠輕鬆手刻的。現成的函式庫除了幫你省時以外大多瀏覽器相容性都不錯。你可以根據你自己開發和學習的成本取的一個甜蜜點。**做網站的方式千百種，只要能傳遞資訊和給使用者好體驗就是好網站。**不過對於簡單單一功能的函式庫，或是只需要大函式庫裡面的單一功能，那麼自己寫除了能省去學習及開發成本，也能避免一些衝突的問題。比如說這是一台車，並用以下程式把它致中。

```css
.car {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
}
```

![車車](car.webp)

我使用 Animate.CSS 想要製作一個車開進來的效果，只需要加入一個 class 就可以了…

https://codepen.io/elvismao/pen/bGObqWq

等等我們的定位怎麼跑掉啦？仔細一看原來 Animate.css 也是使用 `transform` 屬性來製作動畫，所以我們互相衝突了。

![屬性衝突](animation-transform.webp)

當然你可以為了使用 Animate.css 所有的 CSS 都不使用 `transform` 屬性，但其實自己寫也沒有多麻煩喔，你只需要先把我們原本的 `left: 50` 改成出發點 `0` ，製作動畫 `@keyframes drive { to { left: 50% }` ，然後套用到車子上就可以了。同時你對於車要動多快，加速度，時間點都可以自由地掌握。

<iframe height="300" style="width: 100%;" scrolling="no" title="Car Move" src="https://codepen.io/elvismao/embed/NWeKpjj?default-tab=css%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/elvismao/pen/NWeKpjj">
  Car Move</a> by Edit Mr. (<a href="https://codepen.io/elvismao">@edit-mr</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

我寫這一個系列並不是期待所有人都開始排斥函式庫，而是希望就算你要使用函式庫你也可以大致知道背後的原理，就像你不該先學習 React 再學習 JavaScript 一樣。這樣你除了走得更踏實以外，遇到問題需要微調也可以知道從何下手，而不是只會貼上範例程式。

如果你認同我的想法的話歡迎追蹤這個系列，也歡迎在 Instagram 和 Google 新聞追蹤毛哥EM 資訊密技。而如果你不會 HTML 和 CSS 但因為某種原因你讀到這裡的話，歡迎訂閱我新開的 YouTube 頻道：網棧。

我是毛哥EM，讓我們明天再見。
