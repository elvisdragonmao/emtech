---
authors: elvismao
tags: [終端機, Git, Github]
categories: [網站分享, 軟體分享]
date: 2022-08-22
---

# Git & GitHub 基本教學

這一篇文章我會用簡單好理解的方式讓你學會基本的使用Github和Git。且*複製貼上就能成為工程師*系列所搭建的網站都可以免費架設在Github



這篇文章拖很久，8月就在寫了一直沒空更新

# Github是什麼

Github可以說是程式的雲端硬碟或IG。註冊帳號就可以上傳檔案，可以自己決定要不要讓別人看到。當然也可以留言、按讚（星星）、或轉發改編。
上傳檔案除了可以像社群一樣用網頁版直接傳之外，因為通常一個專案裡面會有很多資料夾和檔案，所以通常會用一個叫做git的技術來實現同步檔案。

Github的單位是`使用者/倉庫/檔案`。我們會在電腦裡放一個資料夾裝一個專案，並透過git來同步
如果你還是有點不懂，實際操作一次就知道了。

# Git是什麼

你也可以想像Github是物流中心，而git就是物流。我們透過物流來傳資料到Github的倉庫合獲取檔案。git厲害的地方是每次上傳或下載時它會比較差異，只傳送不同的檔案。除了節省時間流量之外，因為記錄了每一次的更動，所以可以進行版本控制。包括釋出不同版本，和復原到指定版本。

# 註冊Github並建立倉庫

進入[github.com](https://github.com)點擊Sign Up註冊跟著步驟填入資訊就好了。記得用戶名會變成你的免費網域（用戶名.github.io）所以記得好好取 ಡ ͜ ʖ ಡ

成功註冊驗證完你可以編輯一下你的個人資訊（自我介紹，頭像之類的）。好了之後點擊New Repo，並命名為`用戶名.github.io`讓裡面的檔案自動變成網站。一定要一字不漏一樣喔，但如果只是要存檔案而已取什麼名字都可以。
底下有幾個選項

- **Description (optional)**：*這個專案是什麼？在你的repo裡顯示，在列表中回顯示為副標題。*有沒有都可以
- **Add a README file**：*添加一個`README.md`，在你的repo裡顯示，通常會寫一些介紹或使用說明。要寫多長都可以。*有沒有都可以
- **Add .gitignore**：*在下載/上傳的時候忽略特定的檔案。比如說你用一個檔案存放你的私人密碼，你不希望這個上傳到網路上讓每個人都能看到對吧。*選擇None即可
- **Choose a license**：*告訴別人他可以對你的程式做什麼。我是使用Apache License 2.0。你可以閱讀這些條款看哪個符合你的想法，很多人會用MIT的條款。*有沒有都可以

成功建立之後你可以看見有一個剛才系統建立的`README.md`。這個是別人進入這個專案網頁會看到的這個說明文件，可以先不用管它。每次我們上傳完檔案後它都會需要部署一下。大概等個三十秒就可以進去你的網站了。網站就是`使用者.github.io`。

接下來我們來讓這個專案同步到你的裝置裡的某個資料夾吧。

在開始之前我們來講一下Git的邏輯原理

# Git邏輯

- 如果要從網上下載下來檔案我們要`clone`（複製）下來
- 如果`clone`之後有更新的版本想下載直接`pull`就會把新增的東西下載下來。

而要上傳檔案就像剛才說寄包裹一樣。（比較好理解的方式，不寫那些專業術語）

- 我們要先填寫寄信人（我們）的資訊，還有收件人的地址（網址）。這個只需要寫一次就可以了
- 接下來我們要`add`（選擇）要傳送的資料。通常會選擇傳送所有你編輯過的地方。
- 選好之後我們到把包裹`commit`（打包起來），並留下一串訊息（必填，簡單講你做了什麼編輯，之後比較好看）
- 最後把它`push`（寄）出去就好囉

底下我們來實際嘗試下載和上傳檔案

# 基本設定及clone

## 使用Github Destop（限電腦，以PC做示範）

{{notice}}
Gitub Destop

- 開發者:Github (Microsoft)
- 軟體類型:免費軟體
- 網址:[Github](http://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/)
  {{noticed}}

Github Destop可以讓你有按鈕可以按，不用打指令也可以使用git。多少可以節省一點時間，但看起來就沒有那麼酷（
下載Github Destop並安裝，原則上就是你也懂的一直下一步。安裝成功後他會叫你輸入剛才講的個人資訊，並且請你登入你的Github帳號。

登入完後他會請你選擇一個專案來clone。沒錯就是剛才講的複製下載檔案。預設位置會放到你的`文件資料夾/Github/專案名`裡面。按下`Ctrl+Shift+E`即可直接打開資料夾。

## 使用Git（所有裝置適用）

如果電腦裡沒有git可以上網搜尋git來下載。

下載完請打開任意終端機（如cmd）並輸入這兩個指令。就是剛才寄包裹所說的寄信人：

```
git config --global user.name "<使用者名字>"
git config --global user.email "<電子信箱>"
```

這個指令只需要打一次就可以了。如果需要更改就再輸入一次指令即可。

使用git來下載檔案非常簡單。只需要輸入`git clone <url>`就完成了。
比如說我想下載Wiwi官大為做的NICE BASEBALL來用鋼琴玩打棒球：

```
git clone
```

假設你想要確定是否和Github的內容是一樣的，點擊fetch(`git fetch`)它就會幫你自動比較。點擊後上面寫的數字就是不同檔案的數量。再次點擊pull(`git pull`)就會將這兩個版本合併了。

# 上傳檔案

接著我們來嘗試建立一個檔案。請在專案資料夾裡面點擊右鍵，建立一個文字檔案，並命名為`index.html`。當你在網址中沒有指定要讀取那個檔案名時會自動導到那個資料夾的`index.html`

如果你看到是一個Chrome或Edge的符號，請點擊右鍵，開啟，並選擇你的文字編輯器如*Sublime Text*。如果沒有可以直接選擇**記事本**來打開。你可以在這裡嘗試打點東西或者貼上以上程式碼。

```html
<!doctype html>
<head>
  <meta charset="utf-8" />
  <title>歡迎來到我的網站</title>
</head>
<body>
  <h1>歡迎來到我的網站</h1>
  <h2>我很開心</h2>
  <p><a href="https://emtech.cc/">毛哥EM資訊密技</a>的範例程式</p>
</body>
```

相信你一定把最後一行文字刪了。你可以用瀏覽器打開看看這個網站（HTML檔），你會發現HTML只不過是一個要用瀏覽器打開的word檔而已！

# 上傳到Github

現在我們來將它上傳到Github吧。回到Github Destop或你的終端機（確認是在你的專案），Github Destop上你會發現它知道你新增了一個檔案。而git需要先輸入`git add .`才會比較你有沒有更動檔案。那個`.`代表所有的檔案。而如果你只要打包某些檔案可以直接輸入檔名如`git add index.html`或指定副檔名如`git add .html`。

我們在左下角那個**小**的輸入框打入這次你做的事（使用git請打指令`git commit -m '<訊息>`），或是你可以發現它預設給你打了一個訊息，懶得打直接按Commit也可以。

打包完之後我們可以上傳囉。點擊push就好了（指令為`git push`），是不是超級簡單w。如果使用終端機且沒有設定SSH會叫你輸入Github的帳號密碼。且如果你輸入你真的密碼可能會有兩步驟驗證的問題，所以在這裡我們有兩個辦法解決。

## Git - 辦一個密碼

到Github的設定生成一個看起來像亂碼的密碼。大概長這樣

```
ghp_5xcCouSaccQcDw87FRFL6B0IaX0nzJ4MdWaK
```

在每次需要輸入密碼時請貼上這串密碼

## 密碼好麻煩 用SSH

SSH像是一個信物。我們生成一個SSH，並告訴Github說只要有拿這個東西就有權限做哪些事。如果你是使用Github Destop的話上傳時不用輸入密碼。因為Github自動幫你生成了SSH並存在你的帳號。

如何設定可以先參考[這篇文章](https://cynthiachuang.github.io/Generating-a-Ssh-Key-and-Adding-It-to-the-Github/)或是[官方文件](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)

## 衝突！？

假如你編輯了檔案，但是在你還沒上傳時別人已經改了內容（新增/編輯/刪除檔案）這個時候你就沒辦法上傳（push）了。我們會看到這串訊息

```
! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'github.com:EM-Tec/emtech.cc.git'
hint: Updates were rejected because the remote contains work that you do
hint: not have locally. This is usually caused by another repository pushing
hint: to the same ref. You may want to first integrate the remote changes
hint: (e.g., 'git pull ...') before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

我們必須要先pull最新的版本下來。不過在我們使用`git pull`指令前我們需要告訴git要怎麼處理檔案

- 合併：`git config pull.rebase false`
- 不管那個版本：`git config pull.rebase true`
- 放棄剛才編輯的：`git config pull.ff only`

我們可以用`git config --global`而不是`git config`來告訴git不管哪個專案都要這樣處理。
