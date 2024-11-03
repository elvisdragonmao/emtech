---
authors: elvismao
tags: [HTML]
categories: ["網棧","教學"]
thumbnail: /static/webpallet-0/thumbnail.webp
date: 2023-06-05
---

# EP.2 5 分鐘完結 HTML

哈囉大家好，我是毛哥EM，歡迎來到網棧。今天我要讓你5分鐘學會所有常用的HTML語法。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/3NV8ZQtfQm0?si=hh0oS6Qi06ZpiJDe" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

HTML 叫做超文本標記語言 (Hyper Text Markup Language)。故名思義就是標記一下文字，要記得 HTML 主要功能不是為了裝飾，目的是讓**瀏覽器知道這個是什麼**。比如說 Google 想知道網站標題會去找裡面的`<h1>`；而給盲人用的語音閱讀器在看到`<strong>`會加重語氣。裝飾文字是 CSS 的工作，下禮拜就來講）

不過讓我們先來實際寫寫看 HTML 再來慢慢探討這些大道理。首先請你再瀏覽器輸入`pen.new`。輸入之後你會看到三個輸入框方別讓你輸入 HTML,CSS，和 JavaScript，還有底下的預覽區域。這個網站叫做 CodePen，是一個可以讓大家互相分享網頁作品的網站。平常做網站時可以來這裡尋找靈感，或是參考別人的作法。

首先這是一段文字。如果你想要讓它成為粗體的話請你在兩邊加入 `<b>` 和 `</b>`。就像 word 一樣，B 代表了 bold。那麼我們把隔壁幾個鄰居也搬過來吧

`<i>`是斜體 (Italic)、 `<u>` 是底線 (Underline)、而 `<s>` 是劃掉 (Strike)。不過這幾個都只是好看而已，對於瀏覽器來說沒什麼意義，因此我比較建議你使用 `<strong>` 來增加重要性，而語氣轉折或想區別強調文字時使用 `<em>` (emphasis)。

今天假設你建立了一個 `<h1>` 元素，代表一級標題 (header)，但是你還想增加一個屬性告訴瀏覽器說這是一個中文的標題，這時你可以這樣打：`<h1 lang="zh-TW">` 意思是說這是一段繁體中文的標題。前面這一串我們叫做開始標記，後面的 `</h1>`叫做結束標記。lang 叫做屬性，而 zh-TW 是屬性質。

HTML 就是這樣建立一個又一個地”元素” (element) 。因為寫 HTML 時你需要一直重複打大於小於符號很麻煩，你知道工程師都是很懶的，所以Сергей Чикуёнок發明了 emmet。假如說你想建立一個`<h1>`元素你只需要打`h1`然後按`tab`就可以了。

為了方便操作我們把輸入框放到左邊，然後選一個好看的配色，然後讓我們一次認識所有常見 HTML 吧！順帶一題我也會告訴你這些 HTML 語法原本的英文單字，可能會讓你比較好理解。

## 文字

以下是常的文字元素。

```html
<p>
    段落
    <b>粗體</b>
    <i>斜體</i>
    <s>刪除線</s>
    <u>底線</u>
    H<sup>+</sup> CO<sub>2</sub>
</p>
```

`<p>`元素代表段落區塊 (paragraph)。`<b>`是粗體 (bold)、`<i>`是斜體 (italic)、`<s>`是劃掉 (strike)、`<u>`是底線 (underline)。`<sup>`是上標 (superscript)、`<sub>`是下標 (subscript)。你可以記 super 在上面，而訂閱按鈕 Subscribe 在影片下方等你去按。

**粗體\***斜體\*~~刪除線~~
<u>底線</u>
H<sup>+</sup> CO<sub>2</sub>

## 空白 換行

也許你有發現，在 HTML 中一個以上的 tab、空格、換行都視為一個空格，因此你可以自由地排版保持程式的簡潔。但是如果你想要換行的話，你可以使用`<br>`元素換行，`<hr>`插入分隔線 (Horizontal Rule)。而如果你想要插入一個空白的話，你可以使用`&nbsp;`。

```html
橫線
<hr />
換行<br />
```

這兩個是插入一個元素而不是指定範圍，因此習慣後面會用/>結尾，但如果你要打<br>或<hr>瀏覽器也看得懂。HTML 是一種"好啦我看得懂就好"的語言，因此你就算用大寫，或著是屬性引號不加也沒關係，但是為了你和你的朋友之後維護起來不會那麼累我還是建議你遵守慣例。

## 標題

接下來是標題。標題有六種大小，分別是`<h1>`、`<h2>`、`<h3>`、`<h4>`、`<h5>`、`<h6>`。

```html
<h1>H1</h1>
<h2>H2</h2>
<h3>H3</h3>
<h4>H4</h4>
<h5>H5</h5>
<h6>H6</h6>
```

建議從`<h1>`開始依序做使用，保持完整的架構。

## 無序清單

無序清單是用`<ul>`元素建立的，而清單內的每一個項目都是`<li>`元素。

```html
<ul>
    <li>a</li>
    <li>b</li>
    <li>c</li>
</ul>
```

-   a
-   b
-   c

## 有序清單

有序清單是用`<ol>`元素建立的，而清單內的每一個項目都是`<li>`元素。

```html
<ol>
    <li>a</li>
    <li>b</li>
    <li>c</li>
</ol>
```

1. a
2. b
3. c

## 巢狀清單

而清單裡可以有清單，只要把清單放在`<li>`元素裡就可以了。

```html
<ul>
    <li>玉米濃湯</li>
    <li>鮪魚吐司</li>
    <li>
        薯條
        <ul>
            <li>鹽味</li>
            <li>胡椒鹽</li>
            <li>番茄醬</li>
        </ul>
    </li>
</ul>
```

<ul>
         <li>玉米濃湯</li>
         <li>鮪魚吐司</li>
         <li>薯條
            <ul>
              <li>鹽味</li>
              <li>胡椒鹽</li>
              <li>番茄醬</li>
            </ul>
         </li>
     </ul>

## 超連結

假設你想要連結到某個網站，你可以使用`<a>` (anchor) 元素，並在`href`(hypertext reference) 屬性中指定連結的網址，而在`<a>`元素中間的文字就是連結的文字。

```html
<a href="連結">顯示文字</a>
```

比如說我們要連結到 Google 首頁，我們可以這樣寫：

```html
<a href="https://www.google.com">Goolge</a>
```

[Google](https://www.google.com/)

連結也可以連結到同一個網頁的某個位置。我們可以幫元素建立 id 並只要在`href`屬性中指定位置的 id 就可以了，而在`<a>`元素中間的文字就是連結的文字。

```html
<a href="#image">顯示文字</a>
<h3 id="image">圖片</h3>
```

## 圖片

如果你想要插入圖片，你可以使用`<img>` (image) 元素，並在`src` (source) 屬性中指定圖片的來源，`alt`( alternative text) 屬性中填入圖片的敘述。如果圖片無法顯示時就會使用這個替代文字，而 Google 也會透過這個文字了解圖片內容。

```html
<img src="來源" alt="文字敘述" />
```

比如說這個是從 Google 首頁抓下來的圖片，我們可以這樣寫：

```html
<img
    src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
    alt="Google"
/>
```

![](https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png)

而連結的文字也可以是圖片，只要把`<img>`元素放在`<a>`元素裡就可以了。

```html
<a href="https://www.google.com/">
    <img
        src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
        alt="Google"
    />
</a>
```

<a href="https://www.google.com/">
  <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" alt="Google">
</a>

## 表格

表格是用`<table>`元素建立的，而表格內的每一排都是`<tr>`(table row) 元素，而每一個格子都是`<td>`(table data) 元素，而表格的標題則是`<th>`(table header) 元素。

```html
<table>
    <tr>
        <th>國家</th>
        <th>首都</th>
        <th>人口</th>
        <th>語言</th>
    </tr>
    <tr>
        <td>USA</td>
        <td>Washington D.C.</td>
        <td>309 million</td>
        <td>English</td>
    </tr>
    <tr>
        <td>Sweden</td>
        <td>Stockholm</td>
        <td>9 million</td>
        <td>Swedish</td>
    </tr>
</table>
```

<table>
  <tr>
    <th>國家</th>
    <th>首都</th>
    <th>人口</th>
    <th>語言</th>
  </tr>
  <tr>
    <td>USA</td>
    <td>Washington D.C.</td>
    <td>309 million</td>
    <td>English</td>
  </tr>
  <tr>
    <td>Sweden</td>
    <td>Stockholm</td>
    <td>9 million</td>
    <td>Swedish</td>
  </tr>
</table>

你可以使用`<thead>` (table header), `<tbody>` (table body) 和 `<tfoot>` (table footer) 元素來區分表格的不同部分，這樣有助於瀏覽器和搜尋引擎了解表格的結構。

```html
<table>
    <thead>
        <tr>
            <th>項目</th>
            <th>金額</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>iPhone 11</td>
            <td>$24,900</td>
        </tr>
        <tr>
            <td>AirPods</td>
            <td>$6,490</td>
        </tr>
        <tr>
            <td>iPad Pro</td>
            <td>$25,900</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <th>總金額</th>
            <td>$57,290</td>
        </tr>
    </tfoot>
</table>
```

<table>
  <thead>
    <tr>
      <th>項目</th>
      <th>金額</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>iPhone 11</td>
      <td>$24,900</td>
    </tr>
    <tr>
      <td>AirPods</td>
      <td>$6,490</td>
    </tr>
    <tr>
      <td>iPad Pro</td>
      <td>$25,900</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <th>總金額</th>
      <td>$57,290</td>
    </tr>
  </tfoot>
</table>

> 表格來自 [Fooish 程式技術](https://www.fooish.com/html/table.html)，因為我懶得打。

### 合併儲存格：colspan 和 rowspan 屬性 (attributes)

合併表格可以利用 <td> 和 <th> 標籤上的 colspan 和 rowspan 屬性，colspan 是用來水平合併多行 (column) 的儲存格，rowspan 則用來垂直合併多列 (row) 的儲存格。

<table>
  <tr>
    <th>1</th>
    <th>2</th>
    <th>3</th>
  </tr>
  <tr>
    <td>4</td>
    <td>5</td>
    <td rowspan="2">6</td>
  </tr>
  <tr>
    <td colspan="2">7</td>
  </tr>
</table>

## 輸入框

接下來是輸入框，輸入框是用`<input>`元素建立的，而`<input>`元素有很多種類，我們可以用`type`屬性來指定，比如說我們要建立一個文字輸入框，我們可以這樣寫：

```html
<input type="text" />
```

<input type="text">

如果給他加入`value`屬性，就可以預設輸入框的內容了：

```html
<input type="text" value="Hello World!" />
```

<input type="text" value="Hello World!">

而如果我們要建立一個密碼輸入框，我們可以這樣寫：

```html
<input type="password" />
```

<input type="password">

輸入的內容會被隱藏，而且會用星號或圓點代替。

如果我們要建立一個勾選框，我們可以這樣寫：

```html
<input type="checkbox" />
```

<input type="checkbox">

如果我們要建立一個單選框，我們可以這樣寫：

```html
<input type="radio" name="color" value="red" /> red<br />
<input type="radio" name="color" value="green" /> green<br />
<input type="radio" name="color" value="blue" /> blue
```

<input type="radio" name="color" value="red"> red<br>
<input type="radio" name="color" value="green"> green<br>
<input type="radio" name="color" value="blue"> blue

記住，radio 是只能選一個的，就想你的收音機一樣，你一次只能聽一個頻道。我們在 HTML 裡面會使用`name`屬性來指定一組單選框，這樣瀏覽器才知道這些單選框是一組的。而 value 代表了選擇他的值，比如說我們選擇了 red，那麼瀏覽器就會把 red 的值傳給伺服器。

HTML 還有很多種輸入框，比如說日期、時間、檔案、顏色等等，足夠我們花一個影片介紹。你可以參考[我之前做的這個筆記](https://edit-mr.github.io/notes/posts/html-form/)來預習。

## 互動元素

接下來我們要來介紹幾個有趣的互動元素

### 按鈕

按鈕是用`<button>`元素建立的，我們可以在裡面放入文字或圖片，比如說：

```html
<button>Click me!</button>
```

<button>Click me!</button>

### iframe

iframe 是用來嵌入網頁的，比如說我們要嵌入 YouTube 影片，你可以到 YouTube 影片的分享裡面，點選嵌入，然後複製貼上到你的網頁裡面：

```html
<iframe
    width="560"
    height="315"
    src="https://www.youtube.com/embed/lOecpIqOjjY"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
></iframe>
```

<iframe width="560" height="315" src="https://www.youtube.com/embed/lOecpIqOjjY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

### Audio

Audio 是用來播放音樂的，我們可以用`<audio>`元素建立，然後用`src`屬性指定音樂的網址：

```html
<audio
    src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    controls
></audio>
```

<audio src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" controls></audio>

如果加入`controls`屬性，就會顯示播放器，讓使用者可以控制音樂的播放。

### Video

Video 是用來播放影片的，我們可以用`<video>`元素建立，然後用`src`屬性指定影片的網址：

```html
<video src="https://www.w3schools.com/html/mov_bbb.mp4" controls></video>
```

<video src="https://www.w3schools.com/html/mov_bbb.mp4" controls></video>

同樣的如果加入`controls`屬性就可以讓使用者控制影片的播放。

### div

最後我們要來介紹 HTML5 的版面。我們在建立網站時，通常會把網站分成幾個區塊，比如說標題、導覽列、內容、側邊欄、頁尾等等來方便我們做排版。因此你可以使用`<div>`元素來建立這些區塊，比如說你想建立一個提示框你可以這樣寫：

```html
<div>
    <h2>注意</h2>
    <p>感謝你的注意</p>
</div>
```

{{notice}}
注意
感謝你的注意
{{noticed}}

### HTML5 版面

但是`div`元素只是一個區塊，並沒有說明這個區塊是什麼，因此我們可以使用 HTML5 的版面來建立這些區塊。HTML5 的版面是用`<header>`、`<nav>`、`<main>`、`<section>`、`<article>`、`<aside>`、`<footer>`元素建立的，我們可以用這些元素來建立版面。比如說我們要建立一個網站的版面，我們可以這樣寫：

```html
<header>
  <h1>網站標題</h1>
</header>
<nav>
  <a href="#">連結 1</a>
  <a href="#">連結 2</a>
  <a href="#">連結 3</a>
</nav>
<main>
  <section>
   <article>
      <h2>第一篇文章</h2>
      <p>文章內容</p>
    </article>
    <article>
      <h2>第二篇文章</h2>
      <p>文章內容</p>
  </section>
  <aside>
      <h2>側邊欄</h2>
      <p>側邊欄內容</p>
    </aside>
</main>
<footer>
  <p>網站頁尾</p>
</footer>
```

這些元素本身都和`div`一樣只是把元素群組起來，不會有任何視覺效果。但是可以幫入瀏覽器和搜尋引擎了解這些區塊的用途，也能讓別人更容易 Google 到你得內容。

### 總結

好啦，今天我們介紹了許多不同的 HTML 元素。這些已經是最常用的元素了，如果你想知道更多的元素，可以到[MDN](https://developer.mozilla.org/zh-TW/docs/Web/HTML/Element)查詢。下一週我們要來介紹 CSS 來裝飾我們的網頁。

每週一早上六點，我們會在YouTube和各大Podcast平台不定時更新。如果你喜歡文字版，也歡迎在Instagram和Google新聞追蹤毛哥EM資訊密技。
我是毛哥EM，讓我們下週再見！
