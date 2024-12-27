---
authors: elvismao
tags: [Terminal, Windows, Android]
categories: [軟體分享]
date: 2022-09-06
---

# 【pdftk】萬能 PDF 工具！一行指令合併 旋轉 提取

用 PDF Toolkit (pdftk) 一行指令完成各種 PDF 處裡！

因為這是一個終端機用指令執行的套件，所以請開啟你的終端機 (Terminal/Termux/Command) 並用任意一個套件軟體安裝它。

## Mac 安裝

比如說 mac 可以用 brew

```
brew install pdftk
```

{{notice}}
PDF Toolkit (pdftk)

- 開發者:pdflabs
- 軟體類型：終端機套件
- 網址：[www.pdflabs.com](http://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/)
  {{noticed}}

## 安卓安裝

這裡提供安卓系統的安裝方法。請先到 F-Droid 下載 Termux 來模擬終端機。你可以直接下載 apk 或先下載 F-Droid 再下載。記得不要去 Google Play 下載，會有問題。

{{notice}}
Termux

- 開發者:Termux
- 軟體類型：安卓應用程式
- 官網：[termux.com](https://termux.com/)
- 安裝網址：[F-Droid](https://f-droid.org/packages/com.termux/)
  {{noticed}}

進去後貼上這一串。問你什麼就好好好或 enter 就好了。看我多用心給你複製鍵就算了還全部合成一行指令。

```
pkg update && pkg upgrade && pkg install pdftk && termux-setup-storage
```

## Windows 安裝

windows 使用者可以先安裝 Chocolatey。方法是用管理員身分開啟 PowerShell，接著輸入這兩串指令。

```bat
Set-ExecutionPolicy AllSigned
```

輸入完按 enter

```bat
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

輸入完按 enter，如果問你要不要繼續就按`A`然後 enter。安裝 pdftl 請輸入

```bat
choco install pdftk
```

輸入完按 enter，如果問你要不要繼續就按`A`然後 enter 即可。

# 使用教學

請先移動到存放檔案的資料夾。比如說你是使用 Termux 想到你的下載資料夾

```
cd storage/downloads
```

你就可以開始使用啦！下面列出幾個常用的功能。

## 合併多個 PDF 文件

pdftk 可以將多個 PDF 檔案合併成一個檔案。比如下面的例子：

```
pdftk 1.pdf 2.pdf 3.pdf cat output 123.pdf
```

或者使用檔案控制代碼這樣就能控制順序：

```
pdftk A=1.pdf B=2.pdf cat A B output 12.pdf
```

下面的例子使用了檔案萬用字元了。`*`代表所有的意思，比如說`*.pdf`就是所有.pdf 結尾的檔案。

```
pdftk *.pdf cat output combined.pdf
```

下面的例子將多個檔案的多頁提取出來生成一個新的 PDF 檔案：

```
pdftk A=one.pdf B=two.pdf cat A1-7 B1-5 A8 output combined.pdf
```

{{notice}}
小提醒
注：檔名一定要正確，有時看著一樣確還差個/，最好使用 Tab 鍵來自動補全。
{{noticed}}

## 將 PDF 檔案中的一部分取出生成一個新檔案

pdftk 可以隨意刪除或旋轉頁面。下面是一個把指定頁碼的頁面移出 pdf 文件的範例。

```
pdftk new.pdf cat 1-96 98-end output new1.pdf
```

新生成的 new1.pdf 文件不包含頁碼為 97 的頁面。cat 選項後跟的引數用以指定頁碼範圍和頁面方向的限定條件。1-96 表示從 1 到 96 頁，98-end 表示從 98 頁至文件末尾。所以輸出的新 pdf 文件不包含頁碼為 97 的頁面。

除了範例中的具體數值，還可使用一些限定字元。odd 和 even 表示奇偶頁碼。N、S、E、W、L、R、D 表示文件版面的旋轉角度（N: 0，E: 90，S: 180，W: 270，L: -90，R: +90，D: +180）。比如說

- 1-6odd 表示 1，3，5
- 1-6even 表示 2，4，6
- 1-endE 表示整篇文件所有頁面都旋轉 90 度

## 90 度旋轉 PDF 檔案的第一頁

選轉方向可以選 "north" "south" "east" "west" "left" "right" 或 "down"

記得要寫旋轉的頁面在關鍵字前

```
pdftk  in.pdf cat 1right  2-end  output  out.pdf
```

## 旋轉整個文件 180 度

```
pdftk  in.pdf  cat  1-endS  out.pdf
```

## 折分文件，將 PDF 檔案的每一頁輸出成一個 PDF 檔案，輸出檔案預設命名為 pg/\_0001.pdf pg/\_0002.pdf 等等

```
pdftk  in.pdf  burst
```

也可以指定輸出檔名，比如下面的例子：

```
pdftk  in.pdf  burst output page_%1d.pdf
```

## PDF 檔案加密和解密

pdftk 可以對現有 PDF 檔案進行基於密碼的加解密，也就是說對現有的加密的 PDF 檔案解密需要提供解密密碼，pdftk 不是強力破解工具。

pdftk 可以設定兩種不同的密碼，稱為：owner password 和 user password。owner password 限制了使用者是否可以對 PDF 檔案列印、修改、拷貝等。而如果設定了 user password，使用者就必須提供密碼才能察看 PDF 檔案。

PDF 檔案可以採用 40 位加密或 128 位加密，通過使用命令選項 encrypt/\_40bit 或 encrypt/\_128bit 可以指定加密演算法的位數。如果不指定預設採用 128 位加密。

### 權限

使用者的許可權可以使用 allow 命令選項設定，可以設定的許可權如下：

- `Printing`：允許高品質列印
- `DegradedPrinting`：允許高品質列印
- `ModifyContents`：允許修改檔案內容
- `CopyContents`：允許複製
- `ModifyAnnotations`：允許添加註釋
- `FillIn`：允許填入資料
- `AllFeatures`：允許所有特性

### 加解密

與加解密相關的命令語法總結如下：

```
pdftk <檔案>

   [請輸入密碼]

   cat

   [output 檔案名]

   [encrypt_40bit | encrypt_128bit]

   [allow 權限]

   [owner_pw 擁有者密碼]

   [user_pw 使用者密碼]
```

下面是幾個例子：

```
pdftk a.pdf output b.pdf owner_pw foopass

pdftk a.pdf output b.pdf owner_pw foo user_pw baz

pdftk a.pdf output b.pdf owner_pw foo user_pw baz allow printing

pdftk secured.pdf input_pw foopass output unsecured.pdf
```

### 合併兩個 PDF 文件，其中有一個是加密的

在合併時要使用控制代碼選項來指定密碼。下面是一個範例，shortsec.pdf 是一個加密過的 PDF 文件，在合併時如果沒有指定密碼，則會出錯：

```
pdftk A=a.pdf B=b.pdf cat output combined.pdf

Error: Failed to open PDF file:

   a.pdf

   OWNER PASSWORD REQUIRED, but not given (or incorrect)

Errors encountered.  No output created.

Done.  Input errors, so no output created.
```

下面通過控制代碼選項指定密碼則可以正常合併：

```
pdftk A=a.pdf B=b.pdf input_pw A=foopass cat output combined.pdf
```

## 新增 PDF 背景水印或前景圖章

將一個 PDF 檔案的水印新增到另一個 PDF 檔案中。

```
pdftk in.pdf background back.pdf output out.pdf
```

pdftk 只提取有水印的 PDF 檔案的第一頁作為水印。

stamp 命令選項與 background 類似，只是疊加在輸出檔案的上面（background 是疊加在輸出檔案的下面的）。

```
pdftk in.pdf stamp back.pdf output out.pdf
```

## 新增/提取 PDF 檔案附件

可以將任意檔案新增到 PDF 檔案中，比如下面的例子：

```
pdftk in.pdf attach_files 1.html 2.html to_page 6 output out.pdf
```

下面的例子將附件解壓縮到當前資料夾：

```
pdftk report.pdf unpack_files output .
```

## 修復損壞了的 PDF 檔案

下面的例子試圖修復一個損壞了的檔案：

```
pdftk broken.pdf output fixed.pdf
```

這篇資訊量有點大，建議可以加入書籤需要的時候再來看一下

[參考資料](http://lybhu.blog.sohu.com/144036460.html)
