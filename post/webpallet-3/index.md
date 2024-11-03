---
authors: elvismao
tags: [CSS]
categories: ["網棧","教學"]
thumbnail: /static/webpallet-0/thumbnail.webp
date: 2023-06-12
---

# EP.3 10 分鐘 基本 CSS 教學

哈囉大家好，我是毛哥EM，歡迎來到網棧。今天我要讓你10分鐘學會所有常用的CSS語法

CSS 的功能是來裝飾 HTML 的，因此這部影片假設你已經會使用 Codepen 和 HTML 了，如果還沒有的話建議你先去看 EP.2 十分鐘完結 HTML 喔。有一些部分可能比較難理解，但我相信你只要多練習幾次就可以了。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/WrNpToBObo0?si=ObuDcZHDTcmjBs2y" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 簡單的 CSS

首先請你先建立一個 h1 標題。

```html
<h1>我是標題</h1>
```

如果你想讓它變成藍色的話你可以這樣打 CSS

```css
h1 {
    color: blue;
}
```

這樣就可以了，你可以試試看改成其他顏色，例如紅色、綠色、黃色等等。

接下來我們要來改變字體大小，你可以這樣打

```css
h1 {
    color: blue;
    font-size: 50px;
}
```

我們來看一下 CSS 的結構。h1 是選擇器，代表我們要選擇的元素，而 color 和 font-size 是屬性，代表我們要改變的屬性，blue 和 50px 是屬性質，代表我們要改成的值。選擇器有很多種，我們來看一下最常用的幾種。

## 選擇器

-   元素選擇器：比如說`h1`就是選擇所有的 h1 元素
-   所有後代：比如說`*`就是選擇所有的元素
-   後代選擇器：比如說 `nav a`就是選擇所有 nav 裡面的 a 元素
-   親代選擇器：比如說 ` ol > li` 就是選擇所有 ol 裡面的 li 元素。而如果是 ol 裡的 li 裡的 li 就不會被選到。
-   群組選擇器：比如說 `nav, a`就是選擇所有 nav 元素和 a 元素
-   相鄰兄弟：比如說 ` h1 + p`就是選擇 h1 正後方的那一個 p 元素
-   一般兄弟：比如說 ` h1 ~ p`就是選擇 h1 後面的所有 p 元素
-   屬性選擇器：比如說 `a[href="https://twitter.com"]`就是選擇所有連結到 twitter 首頁的 a 元素
    -   屬性網址包含某字是使用星號：`a[href*="tuts"]` (比如說 nettuts.com、net.tutsplus.com、tutsplus.com)
    -   屬性開頭是使用上箭頭 caret 符號：`a[href^="http"]`
    -   屬性結尾是使用錢符號：`[href$=".jpg"]`

### 權重

當有兩個 CSS 是在描述同一個元素，那們瀏覽器要聽誰的呢？這個時候我們就會看權重。有兩個規則

#### 權重越高，就越有權力

> 你女朋友說你很醜，早餐店阿姨說你是帥哥，那麼你應該很醜，因為女朋友權重比較重。

權重從高到低分別是

-   ID 選擇器
-   類別選擇器、屬性選擇器、偽類選擇器 (如：`root`)
-   元素選擇器、偽元素選擇器
-   任何元素選擇符`*`沒有權級

記得是可以相加的喔，這裡有一個[計算機](https://specificity.keegan.st/)，如果不確定的話可以試試看。

如果你想要讓你的樣式宣告比較有權力，你可以使用`!important`，但是這個方法不是很好，但是如果真的沒辦法讓你的樣式宣告生效的話，你可以使用這個方法。

#### 權重如果相等，後寫的樣式宣告會蓋過先前的樣式宣告

就像你女朋友在剛交往時很愛你，但是後來你變得很醜，所以她就不愛你了。那麼他不愛你了，因為要以後面的為主。

## 各種單位

接下來我們來看一下各種單位。CSS 有很多種單位，我們來看一下最常用的幾種。

### 顏色

今天假設你想表示紅色，你可以使用以下幾種方式，都是一樣的效果

```css
h1 {
    color: red; /* 顏色名稱 */
    color: #ff0000; /* 16 進位 HEX 碼 */
    color: rgb(255, 0, 0);
    color: rgba(255, 0, 0, 1); /* RBG 加上 A 透明度 */
    color: hsl(0, 100%, 50%); /* HSL 分別代表色相、飽和度、亮度 */
    color: hsla(0, 100%, 50%, 1); /* HSL 加上 A 透明度 */
    color: color(
        display-p3 1 0 0 / 1
    ); /* 使用 color 可以顯示 RGB 不能表示的顏色，我們之後再來討論 */
}
```

### 大小

接下來是大小單位

```css
h1 {
    font-size: 100px; /* px 是像素 */
    font-size: 10rem; /* rem 是相對於系統設定的字體大小 */
    font-size: 10em; /* em 是相對於父元素的字體大小 */
    font-size: 10vw; /* 10vw 是相對於螢幕寬度 10% */
    font-size: 10vh; /* 10vh 是相對於螢幕高度的 10% */
    font-size: 10vmin; /* vmin 是相對於螢幕寬度和高度的最小值的百分比 */
    font-size: 10vmax; /* vmax 是相對於螢幕寬度和高度的最大值的百分比 */
    font-size: 10%; /* %在不同時候的意思不太一樣，但原則上就是你想的那樣...嗯對 */
}
```

-   width 跟 height 的%基準是父層
-   line-height 以本身文字行高為基準

接下來我們來有效率的一次認識所有常用的 CSS 語法吧

## 裝飾文字

語法直接全上！

```css
h1 {
    color: red; /*顏色*/
    font-size: 1em; /*字體大小*/
    letter-spacing: 10px; /*字體間距*/
    line-height: 1.5; /*行高。通常會用數字代表正常高的倍數 */
    font-weight: 500; /*字體粗細，數字最大 900，越大越重，預設*/
    text-decoration: underline; /*底線，最長是用 none 來把超連結醜醜的底線移除*/
    font-style: italic; /*斜體*/
    opacity: 0.5; /*不透明度*/
    text-align: center; /*文字對齊方向*/
    font-family: arial, sans-serif; /*字體，如果第一個沒有就依序往後*/
}
```

### font-weight

font-weight 是字體粗細，有以下幾種寫法

```css
/* 關鍵字 */
font-weight: normal;
font-weight: bold;

/* 比較級關鍵字 */
font-weight: lighter;
font-weight: bolder;

/* 絕對的數值 */
font-weight: 100;
font-weight: 400; /* 正常 */
font-weight: 700; /* 粗 */
font-weight: 900;
```

### text-decoration

text-decoration 是裝飾文字，有以下幾種寫法：

```css
text-decoration: underline; /*底線*/
text-decoration: overline red; /*上線並且是紅色*/
text-decoration: none; /*沒有裝飾*/
text-decoration-color: #ff00ff; /*裝飾的顏色*/
```

## 背景

### background-color

background-color 是背景顏色

```css
background-color: #ff0000;
```

### background-image

background-image 是背景圖片，可以用 url() 來指定圖片位置

```css
background-image: url(cloud.png);
background-repeat: no-repeat;
background-size: cover; /* 寬填滿 */
background-size: contain; /* 高填滿 */

background-position: top left;
background-position: 20% 40%; /* 從左上開始算 */

background-attachment: scroll; /* 不動但可以往下滾 */
background-attachment: fixed; /* 卡住不動 */
background-attachment: local; /* 一起動 */
```

### 漸層

漸層的邏輯可以參考我的[網頁漸層指引](https://www.instagram.com/p/Cn99VUIvbLf/)(然後你可以順便按讚追蹤)

語法可以直接寫多個顏色，在空白後寫佔的比例。

```css
background: linear-gradient(#333, #333 50%, #eee 75%, #333 75%);
```

這個比例可能跟你想像的不太一漾，漸層開始的位置是 0%，漸層結束的地方是 100%。你寫的百分比代表你寫的位置的顏色，顏色間會自動平分，如果沒有寫就會自動平分。前面可以加入關鍵字表示漸層方向。12 點是 0 度，依序循轉漸進。

```css
background: linear-gradient(#e66465, #9198e5);
background: linear-gradient(0.25turn, #3f87a6, #ebf8e1, #f69d3c);
background: linear-gradient(
    217deg,
    rgba(255, 0, 0, 0.8),
    rgba(255, 0, 0, 0) 70.71%
);
```

<img src=https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient/linear-gradient.png style="width:300px;display:inline;" />
![](https://i.imgur.com/XUupJaf.png)

## border

邊框。分成 border-top,border-bottom, border-left, border-right，或是使用 border 一次指定所有的

```css
border-style: solid; /* 花邊，Solid 是預設的直線 */
border-width: 10px; /* 寬度 */
border-color: #00ff00; /*邊框顏色 */
border: solid 10px hsl(0, 100%, 100%); /* 縮寫 */
```

### border-radius

圓角。單位可以是半徑或著是百分比。所以如果你設成 50% 就會變成圓形。如果有兩格值就是上下和左右，四個就是上右下左。

```css
border-radius: 四個角;
border-radius: 左上角與右下角 右上角與左下角;
border-radius: 左上角 右上角 右下角 左下角;
border-top-left-radius: 10%;
```

### outline

outline 位置在 border 的外緣，但不佔用元素的任何空間。原則上我通常不會想用到它，因為 border 比較好用。
outline 不能夠聲明單邊樣式，它一定是圍繞呈現的。  
outline 的形狀可以不規則，它會順著 border 邊緣顯示，不一定得是矩形。可是目前大多數的瀏覽器不支援該特性。實際上驗證之下會發現 outline 並不會去適應 border-radius 的圓弧。

```css
outline-style | outline-width | outline-color | outline-offset
```

## Box-sizing

可以指定元素大小的計算方式。

```
box-sizing:content-box;  // 把寬度範圍指定給內容物的空間
box-sizing:border-box;  // 把寬度範圍指定給整個邊框到邊框之間的空間。
```

所以在 block 元素中只要設定 box-sizing:border-box; 就不用另外再計算 padding、border 的寬度造成 width 賦予的值不直覺。

假設 width:300px, padding 就算加了 20px, border 加了 4px，寬度依舊是 300px。

## display

CSS 的 Display 屬性可以改變元素對外所參與的佈局環境（outer display type），白話文就是元素怎麼排。

-   `inline`: 像文字一樣左到右上到下，不能決定寬高
-   `block`: 佔滿`<body>`整排，下一個東西會換行
-   `contents`: 只有 contents area 的 box，只顯示內容文字。
-   `inline-block`: 保持像 block 一樣得特性，可以設長寬等等，但一樣從左到右排
-   `display: none` Bang 不見

*   block 是有面積的，可以設定寬跟高
*   inline 設定寬高無效，可以設定 padding 的左右值，上下值無效，無法被撐開。
*   inline-block 同時擁有兩種 display 的特性，可以設定寬高，但也可以與其他元素並排。

> 如果使用 inline-block(像是 a 或 li 設定)，標籤之間會有空白字元約 4~5px

也可以為元素創造內部的佈局環境，提供後代元素佈局的規則（inner display type）。對內創造的佈局例如：

-   `flex`  
    彈性盒佈局，該屬性值的元素本身對外仍參與 normal flow，可是內部環境為獨立的 flex formatting context。
-   `grid`  
    格線佈局，該屬性值的元素本身對外仍參與 normal flow，可是內部環境為獨立的彈性盒佈局 grid formatting context。

這些我們之後會再細細討論。

## float

### 用法

常見用法像是文字繞圖片的特效。none 是正常排，left 就是去左邊，right 是去右邊。

#### none

![](https://i.imgur.com/wHErd2k.png)

#### left

![](https://i.imgur.com/Yz6bJ16.png)

float 是我比較少用的 CSS，因為會遇到一些問題比如說 float collapse

![](https://i.imgur.com/Zdntd5z.png)

當然解決方法很多，列幾個

-   元素的 float 參數不為 none
-   元素的 position 參數為 absolute 或 fixed
-   元素的 display 為 inline-block
-   overflow 參數不為 visible 的 block 元素
-   display 參數為 flow-root 的元素

### Clear

```css
clear: left|right|both;
```

可以讓左/右不會重疊到

![](https://i.imgur.com/KJsAt0K.png)
![](https://i.imgur.com/In4DqWf.png)

## Position

功能是設定**物件定位時所要的參考對像**。可以用的有

```css
position: static | relative | absolute | fixed | sticky;
```

### static 原始定位

inline 往右，block 往下

### reletive 相對定位

我原本該在哪裡位置就佔著，但我可以看起來要往右/下...

![](https://i.imgur.com/H1Vru7P.png)

### absolute 絕對定位

會以 reletive 的位置來定位，接著再用 top left bottom right 排。有一個口決：父相子絕，就是外面用 relative，裡面用 absolute。

### fixed

貼著視窗，卡在那裡，原本位置不再佔據。

# sticky

以自己為基準，卡在那裡，但 sticky 元素仍然 in flow，元素佔位會保留。

![](https://media.giphy.com/media/LRs2BIsDx1WjzSdIAJ/giphy.gif)

## Transform

原本位置佔著，但是可以做出各種效果如 rotate 旋轉

### Transform: translate

可以改變元素定位的參考位置，最常見的是把參考點變成元素正中間，方便定位。

```css
transform: translate(單位或百分比, 單位或百分比);
transform: translateX(單位或百分比);
transform: translateY(單位或百分比);
```

單位值為多少就平移多少，然後 transform 支援負值

```css
.translate {
    background-color: pink;
    transform: translate(100px, -50px);
}
```

![](https://i.imgur.com/IFdDGiC.png)

translate 的百分比基準是自己的 width 跟 height

![](https://i.imgur.com/jM1Hazt.png)

來一個推方塊範例

```css
.outer {
    position: relative;
}

img {
    position: absolute;
    top: 50%;
    left: 50%;
}
```

![](https://i.imgur.com/Gswm945.png)

再來往左上推：`transform: translate(-50%, -50%);`

![](https://i.imgur.com/YeDUST3.png)

就做到致中的效果啦

## transition 轉場

當元素因為各種原因改變屬性質，比如說 javascript 改的或著是因為元素被點擊等等。會在指定時間平滑的切換過去，做出簡單的動畫。

```css
transition: 屬性 轉換時間 延遲執行動畫的時間 速度;

transition:all .3s 0s ease;// 設定全部 0.3 秒轉換 沒有延遲 ease 為預設值
transition: padding .3s 0s, background-color 1s 1s; // 可以各別設定，用逗號分開，並用延遲時間設定出現的先後順序
```

任何屬性都可以設定 transition，比如說文字段落滑過要變色也可以。

## overflow

假設元素超過了框框的大小。可能是父原素的大小有可能是超過了螢幕的大小。這時候我們可以使用 overflow 屬性來決定要怎麼處理。最常用的是 hidden 隱藏、auto 自動還有 scroll，也就是顯示滾動軸。

```css
/* Keyword values */
overflow: visible; /* 可突出 */
overflow: hidden;
overflow: clip; /* 禁止所有滾動 */
overflow: scroll;
overflow: auto;
overflow: overlay; /* 不佔空間的 auto */
overflow: hidden visible;
```

## Media

Media 可以告訴瀏覽器在不同的螢幕大小該如何呈現。這個是基本的語法。

```css
@media screen and (條件) and (條件)...{ // 判斷式，用在 screen 螢幕的媒體
}
```

語法有很多不同的寫法，我決定教你一個雖然是最近出來，但是絕對是最好理解的屬性。

```css
@media (height > 600px) {
h1{
font-size:2em;
}
```

他的意思是說假設螢幕寬度大於 600 像素，那麼大標題就要以正常字體的兩倍大顯示。

## 偽類

偽類可以讓我們針對特定的元素狀態或條件應用樣式，這使得我們可以更好地控制和美化網頁的外觀。

在 CSS 中，偽類以冒號（:）開頭，並在選擇器後面添加。它們可以根據元素的特定狀態或其他條件應用樣式，例如當滑鼠懸停在元素上方時，或當元素是其父元素的第一個子元素時。

以下是一些常見的 CSS 偽類：

-   `:hover`：當滑鼠懸停在元素上方時應用的樣式。這是一個常見的偽類，常用於添加互動效果，例如當滑鼠懸停在按鈕上時改變其背景顏色。
-   `:active`：當元素被激活時應用的樣式。通常用於按下按鈕或鏈接時，以顯示按下效果。
-   `:visited`：應用於已訪問過的連結的樣式。這使得訪問過的連結可以與未訪問的連結區分開來。
-   `:first-child`：選擇父元素的第一個子元素。這使得我們可以針對列表中的第一個元素或表格中的第一列應用特定的樣式。
-   `:nth-child()`：選擇父元素中特定位置的子元素。這個偽類允許我們按照一定的模式選擇元素，例如 :nth-child(2n) 可以選擇所有偶數位置的元素。

比如說你想要元素在滑鼠放在上面時往上移一點，有選牌得感覺，你可以這樣打

````css
.card:hover{
  transform: translateX(-10px);
}

這只是偽類的一小部分，還有其他更多的偽類可供使用。使用偽類，我們可以根據特定的條件和狀態來微調網頁的樣式，使其更具交互性和吸引力。


## 偽元素

最後我們來談談偽元素
跟偽類的差異在於，偽類是基於真實存在的元素去選取不存在的class，而偽類則是基於存在的元素，創出一個虛擬的元素。它的選擇符是::雙冒號。

直接看範例，你們就懂了

```html
<p>大家好</p>
````

```css
p::before {
    content: ”哈囉“;
}
```

哈囉大家好

沒錯就是這麼簡單，通常我們會拿它來做視覺效果。比如說在開啟新分頁的超連結旁邊放一個小小的箭頭符號。

## 總結

好啦，今天我們介紹了許多不同的 CSS 屬性。這些已經是最常用的屬性了，但礙於篇幅我們有一些沒有講的很詳細。如果你想知道更多的屬性，可以到[MDN](https://developer.mozilla.org/zh-TW/docs/Web/CSS)查詢。下一週我們要來介紹如何使用 VSCode 這個酷酷的「整合式開發環境」。

每週一早上六點，我們會在YouTube和各大Podcast平台不定時更新。如果你喜歡文字版，也歡迎在Instagram和Google新聞追蹤毛哥EM資訊密技。
我是毛哥EM，讓我們下週再見！
