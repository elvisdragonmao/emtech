---
authors: elvismao
tags: [HTML, CSS]
categories: ["不用庫 也能酷 - 玩轉 CSS & Js 特效"]
date: 2023-09-16
---

# Day2 如何打的更快 | Emmet & 預測輸入

記得我在國一寫HTML的時候，傻傻的在那裡打小於、h1、大於、標題、小於、斜線、大於。我的朋友甚至發現了一個偷吃步就是先打好一堆大於小於，然後再填空。

既然HTML 和 CSS 都長那樣，這種繁瑣的操作早就可以交給電腦來解決。所以今天我要和你分享如何使用 **Emmet 快速的打 HTML 以及** **CSS**

Emmet 可以做什麼呢？比如說我們想要建立一個一級標題，我們只需要先輸入 `h1` 再按下 Tab 即可，所有的標籤都可以這樣做。

不過 emmet 不只是幫你省打兩個大於小於的時間，他還有很多的語法可以供你使用。這裡我寫出幾個我最常使用的技巧。

### 基本 HTML5 架構 - `!`

只要按下驚嘆號並按下 tab 就會自動生成一個基本的 HTML5 架構，非常方便。

![!](https://emtech.cc/post/2023ironman-2/!.gif)

### 添加class - `.`

比如說我想建立一個 img 圖片元素，並加上一個 class 叫做 avatar，我只需要打

```html
img.avatar
```

即可生成 `<img *src*="" *alt*="" *class*="avatar">`。而如果要建立的是一個div元素，因為平常大家太長用 div 了，直接打 `.avatar` 就可以了

### 包在裡面 - `>`

比如說我想要建立一個 li 清單包著一個超連結 a 元素，那麼只需要打

```html
li>a
```

即可生成 `<li><a *href*=""></a></li>`。可以無限往下包

### 以及 - `+`

就跟 CSS 選取器 + 一樣，就是加在後面。比如說標題後面常接文章，我們就可以打

```html
h2+p
```

生成 `<h2></h2><p></p>`

### 乘以 - `*`

比如說我們要建立清單，你可以打 `li*3`

可以搭配前面的大於符號，效果如下

```html
<!-- ul>li*3 -->
<ul>
    <li></li>
    <li></li>
    <li></li>
</ul>
```

### 括號 - `()`

就說你想的那樣。延續前面的例子,假設你要生成三個li元素，而每個都是超連結，你不能只打 `li>a*3`，因為這樣會變成一個li元素裡面有三個超連結。不過這時我們只需要加上括號就可以了

```html
<!-- ul>(li>a)*3 -->
<ul>
    <li><a href=""></a></li>
    <li><a href=""></a></li>
    <li><a href=""></a></li>
</ul>
```

### 內文 - `{}`

比如說剛才我們製作了一個目錄，但裡面我們想要先插入一點字，只需要加上中括號之間打內文就可以了

```html
<!-- a{連結}*3 -->
<a href="">連結</a><a href="">連結</a><a href="">連結</a>
```

### 插入索引值 - $

比如說你想要內文分別是連結1，連結2，連結3，那麼你可以打

```html
<!-- a{連結$}*3 -->
<a href="">連結1</a><a href="">連結2</a><a href="">連結3</a>
```

再來一個範例，今天我們要輸入五個 li 標籤，標籤的 class name 分別為 list-1、list-2、list-3、list-4、list-5，輸入 `li.list$*5` 就可以了。

> 如果要從不是1的數開始計算可以在 `$` 後面補上一個 `@` 告訴它從哪裡開始。比如說要從 5 開始就輸入 `li.list$@5*5`

> 如果你想要編號自動補0的話可以多打 `$` 。幾個 `$` 就是幾位數，比如說 `$$` 就是從01開始數

這兩個我可以說是從來沒用過，但還是補充給大家

### 屬性 - `[]`

今天你想要建立三個輸入框，並且強調他是數字輸入框，你可以把屬性直接打在中括號裡面

```jsx
input[(type = "number")];
```

有些人因為覺得HTML很難打很難維護因此使用 haml, slim, pug, 甚至是 Markdown 來取代 HTML…然後再用編譯器轉回HTML。我自己是覺得HTML格式都長一樣很整齊，算是非常好維護，但是每一個語言都有他自己的優勢在，有的能夠少打一些字，有的能和別的程式語言更好的溝通所以才會存在。大家只要找到自己最習慣的方式就好了。

## 快速的打 CSS

應該大部分的人會發現你打 CSS 時， VS Code 會猜測你可能要打的詞，並且你只需要按 tab 就會自動完成。比如說你想換顏色，輸入 c 就會自動選擇 color，按 tab 就會自動打好。然而由於他是按照字母排得，有一些字需要幾乎打完才能選，甚至是可能會預設輸入錯誤的值。比如說你想設定 display，按下 d 並按 tab 竟然出現的是 `display: inherit`。我就問一年全世界有超過10個人會這樣打嗎？還需要刪除重新打，非常麻煩。

不過 VS Code自動選字很聰明的地方是**你不需要照著字母順序打，且可以同時打屬性。**比如說如果你想輸入 **`display: flex`** 你只需要輸入 `df` 按 tab 就可以了。我是不知道你覺得怎麼樣啦，我是覺得很帥可以讓我瞬間打完一堆常用的 CSS。

使用加號可以同時打好幾個屬性。以我最常使用的 flex 致中為例

```css
display: flex
justify-content: center;
align-item: center;
```

可以直接打 `dc+jcc+aic` 就結束了。當然，同一行 CSS 有不一樣的打法，你只要找到你習慣好打的就可以了。

你也許有看過有人打 `w100` 來生成 `width: 100px` ，不過預設的px單位可以說是越來越少用。它的原理和上面一樣就是你先打值也是可以的，比如說你想要 H1 標題變成預設字體三倍大，你可以打 `fz3re`。

![打fz2re就可以了](https://emtech.cc/post/2023ironman-2/fz.gif)

打fz是因為不管是 fo 變 font: optional, fn 變 font: none, ft 變 font-stretch: normal, fs 變 font-style: italic, fi 變 font: inherit, fe 變 font-emphasize

最後補充一下，百分比%可以打 p。比如說50p 就是50%。

你可以找你最常使用的幾款 CSS 語法記一下，再搭配 Copilot 就整個飛起來了。

希望今天的分享對你有幫助，我自己還會搭配 Copilot 以及 Copilot Chat 一起使用，可以更進一步的提升你的效率。如果你們有興趣想聽船長是怎麼帶我飛的可以在留言去告訴我，也歡迎在 [Instagram](https://www.instagram.com/emtech.cc) 和 [Google 新聞](https://news.google.com/publications/CAAqBwgKMKXLvgswsubVAw?ceid=TW:zh-Hant&oc=3)追蹤[毛哥EM資訊密技](https://emtech.cc/)，也歡迎訂閱我新開的[YouTube頻道：網棧](https://www.youtube.com/@webpallet)。

我是毛哥EM，讓我們明天再見。
