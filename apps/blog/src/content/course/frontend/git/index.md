---
authors: elvismao
tags: [Git]
categories: [基礎教學]
date: 2026-09-15
description: "從零開始學 Git 與 GitHub，用最白話的方式搞懂版本控制、Commit、Branch、Merge、Conflict、Pull Request 與 Code Review。看完就能自己操作，也能開始和團隊一起寫 Code。"
---

# Git 與 GitHub：從 final_final 到優雅的版本控制

> [!NOTE] 簡報資源
>
> 這篇教程歡迎可以搭配簡報：[Git & GitHub 基礎 - 毛哥EM的簡報](https://slides.elvismao.com/talks/git/) 一起服用

如果你曾經寫過程式、做過報告、剪過影片，或認真改過一份文件，你的電腦裡大概多少都出現過這種東西：

```text
project
project-v2
project-new
project-final
project-final-final
project-final-final-real
project-final-final-aaaa
project-final-final-real-2
```

然後過了一個禮拜，你自己也搞不清楚哪一個是最後一個版本，每個版本差在哪。

恭喜你，其實你已經在做版本控制了。

只是做得挺糟的。

這篇文章會帶你認識 **Git** 和 **GitHub**：兩個幾乎所有軟體開發者遲早都會遇到的東西。

我們會從「為什麼需要版本控制」開始，一路做到真正可以拿去跟別人合作：

- Git 與 GitHub 是什麼
- Git 的安裝與基本設定
- Repository、Commit、Branch 等核心概念
- Git 基礎指令：`clone`、`add`、`commit`、`push`、`pull`
- Branch 建立、切換與合併
- Merge Conflict 衝突處理
- Remote 遠端倉庫
- Fork 與 Pull Request
- Code Review
- Merge、Squash、Rebase
- 一套實際可用的 GitHub 團隊協作流程

今天當然你不太可能背完 Git 所有指令。主要是希望可以讓大家能建立對於版本控制的基本概念。

## 為什麼我們需要版本控制？

想像一個很經典的場景。昨天你的網站可以跑。

今天，你想說：

> 這裡稍微重構一下好了。

兩個小時之後網站炸了。你看著螢幕開始思考：

> 等一下，昨天到底長怎樣？

於是你開始瘋狂 `Ctrl + Z`，但是也回不到原本的樣子。

如果我們有辦法知道：

- 這個專案以前長什麼樣子？
- 哪一天改了什麼？
- 是誰改的？
- 為什麼改？
- 如果改壞了，能不能回去？

事情就會簡單很多。

這就是**版本控制 Version Control** 想解決的問題。

### 最原始的版本控制：複製一份

最直覺的方法其實沒有錯。

今天有一個：

```text
project
```

怕改壞？

複製一份：

```text
project-v2
```

再改：

```text
project-v3
```

做到差不多：

```text
project-final
```

客戶說 Logo 再大一點：

```text
project-final-2
```

晚上十一點半又說：

> 不好意思，最後一個小修改。

於是：

```text
project-final-final
```

凌晨兩點：

```text
project-final-final-真的
```

問題也開始出現了。

1. 你根本不知道每個版本到底差在哪裡。
2. 每一次都複製整份專案，非常浪費空間。

如果只是 Word 文件可能還好，但一個網站專案裡可能有：

- 幾百個程式碼檔案
- 圖片
- 字型
- 套件
- 編譯結果
- 各種設定檔

如果每改一點東西就整包複製一次，你的 SSD 一下就會炸了。而且這還只是**一個人**。

### 如果今天有十個人一起寫呢？

真正精彩的才要開始。假設你跟海鷗、Ben 三個人一起做專案。

你改了一份。

海鷗改了一份。

Ben 也改了一份。

到了晚上大家說：

> 好，現在把大家的版本合起來。

請問怎麼合併？

Email？Discord？LINE 傳 ZIP？

```text
project-final-use-this-one.zip
```

隔天再有人丟：

```text
project-final-use-this-one-new.zip
```

三天後，公司突然發現某一段 Code 長得非常可疑。

大家互相看了一眼。

「誰寫的？」「什麼時候寫的？」「為什麼這樣寫？」「那可以改掉嗎？」

全部都不知道。這就是 Git 出場的時候。

## Git 是什麼？

**Git 是一套版本控制系統。**

它會幫我們記錄專案的修改歷史，讓我們知道：

- 改了什麼
- 誰改的
- 什麼時候改的
- 為什麼改
- 專案以前長什麼樣子

如果某一天真的改爛了，也可以回去看看之前正常的版本。

而 Git 更重要的一件事，是讓很多人可以同時開發同一個專案，再把不同人的成果整合起來。

### Git 是怎麼出生的？

Git 的故事跟 Linux Kernel 有很深的關係。

Linux Kernel 是一個規模非常龐大的開源專案（你使用的安卓手機背後就是 Linux）。早期 Linux 開發者會透過 Patch、壓縮檔甚至 Email 等方式交換修改；後來開始使用一套叫做 BitKeeper 的分散式版本控制系統。

但 2005 年 Linux 社群和 BitKeeper 背後公司的關係出現問題。Linux 的創作者 Linus Torvalds 看了一輪當時可以用的工具都不太滿意。

於是採用了一個非常工程師的解法：

> 那我自己寫一個。

Git 花了十天就誕生了。

今天 Git 已經成為軟體開發世界最普遍的版本控制工具之一。

## Git 是「分散式」版本控制

版本控制可以大致想成幾種不同的架構。

### 本地端版本控制

最簡單的情況，就是版本紀錄全部放在你自己的電腦。

優點是簡單。缺點也很簡單。你電腦死掉，它可能就一起走了。

而且多人合作很痛苦。

### 集中式版本控制

所有人的版本歷史都放在一台中央 Server，大家都跟這台 Server 溝通。像 SVN 就是經典代表。

### 分散式版本控制

Git 屬於這一類。

每個開發者的電腦裡，都可以保有一份完整的 Repository 歷史。

不只是現在最新的檔案。還包括過去的所有編輯版本歷史。因此就算今天沒有網路，你依然可以：

- 修改程式
- 查看歷史
- 建立分支
- Commit

等到有網路之後，再跟其他人交換新的版本。

這就是 Git 被稱為 **DVCS：Distributed Version Control System** 的原因。

## Repository：專案的時光機

在 Git 裡，一個被 Git 管理的專案通常叫做 **Repository**，簡稱：**Repo**。中文常翻成儲存庫、倉庫、程式碼倉庫，你爽就好。

Repository 不只是現在這一份檔案，還包含 Git 記錄下來的版本歷史。

而版本歷史裡的一個個節點，就叫：「**Commit**」

## Commit：幫專案留下版本紀錄

Commit 就是一個版本的存檔點。

例如：

```text
A  建立網站
↓
B  加入登入頁面
↓
C  修正登入 Bug
↓
D  加入深色模式
```

A、B、C、D 都是一個 Commit。理解上，可以把 Commit 想成專案在某個時間點的一張快照。因此如果 D 爆炸了，我們可以回頭看：

> C 的時候到底長什麼樣子？

## 用「寄包裹」理解 Git

Git 一開始最讓人困惑的地方通常是我只是想存個檔案，為什麼我要做這麼多事情？

我很喜歡把 Git 想成**寄包裹**。

| Git               | 寄包裹                   |
| ----------------- | ------------------------ |
| `git clone`       | 把完整專案複製到你的電腦 |
| Working Directory | 你的工作桌               |
| `git add`         | 把這次想寄的東西放進箱子 |
| Staging Area      | 箱子裡準備寄出的內容     |
| `git commit`      | 封箱，建立正式紀錄       |
| Commit Message    | 在箱子上寫這次改了什麼   |
| Remote            | 收件地址                 |
| `git push`        | 把包裹寄出去             |
| `git pull`        | 把遠端的新東西拿回來整合 |

接下來就照這個流程走一次。

## `git clone`：先把專案拿回來

今天如果要編輯一個既有專案，第一件事當然是：**先拿到它。**

```bash
git clone <repository-url>
```

例如：

```bash
git clone https://github.com/USERNAME/git-workshop.git
```

`clone` 就是你玩 Minecraft 的那個指令 `/clone`，「克隆、複製」。

它不只會下載目前的檔案，也會把 Git 的版本歷史一起抓下來。

Clone 完：

```bash
cd git-workshop
```

就可以進到資料夾開始工作。

## 修改檔案

這一段跟 Git 沒什麼關係。你正常寫程式就好。

例如建立：

```text
hi.txt
```

內容：

```text
Hello Git!
```

存檔。

接著可以：

```bash
git status
```

Git 就會告訴你現在有哪些東西發生變化。

這個指令超級重要。

如果你哪天不知道 Git 現在到底在幹嘛：

```bash
git status
```

他就會告訴你我是誰？我在哪？現在發生什麼事？

## `git add`：把東西放進箱子

假設現在改了：

```text
hi.txt
```

接著告訴 Git：

> 好，這個變更我要放進下一個 Commit。

```bash
git add hi.txt
```

這個動作叫做 **Stage**。

被 Stage 的內容會進到 **Staging Area**，也就是我們剛剛說的箱子。

你的工作桌上可能改了十個檔案，但這次只想寄三個。沒問題。只 Add 那三個。

例如：

```bash
git add index.html
git add style.css
git add script.js
```

如果真的全部都要：

```bash
git add .
```

`.` 代表目前位置底下的變更。大概就是：

> 好啦，這邊全部裝箱。

很好用。但在正式專案裡，最好先：

```bash
git status
```

看一下。

不然哪天不小心把 `.env`、API Key、密碼，甚至某個 4GB 的奇怪檔案一起加進去，你可能會獲得一個很有教育意義快樂的下午。

## `git commit`：封箱

Stage 完之後，就可以 Commit。

```bash
git commit -m "feat: say hello"
```

Commit Message 就是在說這個版本到底做了什麼？

例如：

```text
add login page
fix: correct navbar layout
docs: update README
refactor: simplify auth logic
```

Git 本身沒有規定你一定要用什麼格式。你想寫：

```text
fix bug
```

技術上也可以。不過跟你合作的人，以及幾個月後的你看到可能會很痛苦。

很多團隊會使用類似 [Conventional Commits](https://www.conventionalcommits.org/) 這個規範的風格：

```text
feat: 新功能
fix: 修 Bug
docs: 文件
refactor: 重構
test: 測試
chore: 雜項維護
```

不過我自己是更喜歡使用 Linux kernel/Git-style 的 Commit Message。前面寫功能的影響範圍，後面解釋在幹麻。

```text
storybook: clarify build ownership
web/routes: split route-level chunks
ui/field: fix select menu positioning
```

不過這都是風格問題，自己習慣就好。

## 第一次使用 Git：先設定你的名字

我們要寄信，上面當然要寫寄件人。不過因為我們一台電腦寄出去的人基本上固定都是你，所以我們可以設定在 global，每個專案他會自己幫你戴上。

第一次使用 Git 時，我們要設定姓名和電子郵件，記得改成你自己的名稱喔！

```bash
git config --global user.name "Elvis Mao"
```

以及：

```bash
git config --global user.email "you@example.com"
```

可以檢查：

```bash
git config --global user.name
git config --global user.email
```

或者：

```bash
git config --global --list
```

注意這不是 GitHub 的登入帳號密碼。只是 Commit 上面的作者資訊。

## `git push`：寄出去

目前為止：

```bash
git add
git commit
```

其實都還只是在你自己的電腦。我們只是包好包裹還沒有寄出去。

如果想把 Commit 傳到 GitHub：

```bash
git push
```

第一次 Push 某條 Branch 時，可能會需要：

```bash
git push -u origin main
```

之後通常：

```bash
git push
```

就可以。

這裡 `origin` 是 Remote 名稱，`main` 是 Branch 名稱。等等我們會再來討論。

## `git pull`：把別人的更新拿回來

假設海鷗也在改這個專案。他 Push 了一些新的 Commit。你的電腦當然不會通靈知道。

所以可以：

```bash
git pull
```

把遠端的新變更拿回來，並整合到目前的 Branch。

> [!NOTE] Git Pull
>
> 很多教學會直接說： `git pull` = 下載。這樣方便理解，但不完全精確。他實際上是「取得 Remote 的新資料」+「整合到目前 Branch」。
>
> 也正因為有「整合」這件事情，等等才會出現 Git 最經典的場景：**Merge Conflict**

## Git 最基本的日常流程

把前面全部濃縮，就是：

```bash
git clone <url>
cd <project>
## 修改檔案
git status
git add .
git commit -m "feat: do something"
git push
```

別人有更新：

```bash
git pull
```

如果你只先學會這幾個，其實已經能做非常多事情。

## 那 GitHub 又是什麼？

**Git 不等於 GitHub。**Git 是版本控制軟體。

GitHub 是一個建立在 Git 工作流程上的線上程式碼託管與協作平台。沒有 GitHub，Git 一樣能用。GitHub 哪天掛掉（最近常常），你本機的 Git Repository 也不會瞬間蒸發。

除了 GitHub，還有 GitLab、Bitbucket、自架 Git Server 等等可以使用。

GitHub 很像工程師的 Facebook、IG。社群媒體上大家發照片，GitHub 上大家發 Code。

你可以發文（發 Commit／專案）、留言（Issue / Discussion）、按讚（給 Star）、收藏（Fork）、追蹤（Watch）、交朋友（Follow）等等，還有許多社群功能。這也是為什麼 GitHub 在開源世界這麼重要。

### GitHub 不代表「全部都是開源」

GitHub 可以有 Private Repository。而且就算一個 Repository 是 Public，也不代表你可以隨便拿它的 Code 來用。

真正決定你能怎麼使用的，是 License。例如：

- 可以修改嗎？
- 可以商業使用嗎？
- 可以重新發布嗎？
- 修改後要不要開源？
- 要不要保留原作者聲明？

Public 只是「看得到」。不是「你想幹嘛都可以」。

### 其實你每天都在使用開源軟體

你每天都可能碰到：

- Linux
- Git
- React
- Vue
- Blender
- OBS Studio
- Chromium
- VS Code 背後的 VSCodium
- 大量 JavaScript、Python、Rust、Go 套件

你今天打一個：

```bash
npm install
```

後面都靠著幾百、幾千個你這輩子沒見過的人。

## 建立 GitHub 帳號

進入 GitHub 官網，右上角點 `Sign up` 按照畫面完成註冊和 Email 驗證即可。

這裡比較值得注意的是 Username 建議好好取。你的 Username 之後會出現在很多地方。

例如：

```text
github.com/你的名字
github.com/你的名字/project
別人 @你的名字
你的網址 username.github.io
```

Username 雖然之後還可以改。但改名可能影響原本的網址、設定和外部服務。建議不要亂取，可以省不少麻煩。

## 安裝 Git

打開你的終端機（或是 Powershell、CMD 等等），並輸入：

```bash
git
```

如果會看到一長串使用說明那就代表你已經裝好了。

如果你有套件管理器的話建議可以直接使用。

macOS 有 Homebrew 的話：

```bash
brew install git
```

Windows 如果有 `winget`：

```powershell
winget install --id Git.Git -e --source winget
```

Ubuntu / Debian

```bash
sudo apt update
sudo apt install git
```

Fedora

```bash
sudo dnf install git
```

或是也可以直接到官網下載安裝程式。

如果你是完全新手，大部分選項用預設值一路下一步，今天的課程通常就夠用了。

## 建立第一個 GitHub Repository

登入 GitHub 後，在右上角找到 Create New 的 `+`，選 **New repository**，接下來可以設定幾個東西。

- Repository name：專案名稱
- Description：專案說明
- Public / Private：是否要公開，可以選公開 Pubilc
- README：是否要幫你建立專案的說明文件，可以先關閉
- `.gitignore`：是否要建立 `.gitignore` 文件，可以先關閉
- LICENSE：是否要建立授權條款，可以先關閉

### .gitignore

`.gitignore` 是告訴 Git 這些東西不要管。例如：

```text
node_modules/
.env
.DS_Store
```

其中 `.env` 特別重要。

它常常包含：

- API Key
- Token
- 資料庫密碼

這些東西不應該被 Commit 公開出來。

### License

License 是授權條款。它只是告訴其他人你可以怎麼使用我的 Code。

今天為了讓流程簡單，我們可以先建立一個空 Repository。README、`.gitignore`、License 都先不勾。按：**Create repository**，完成。

![Create Repo](create-repo.webp)

## Clone 你的 Repository

Repository 建立完成後請你選擇 `HTTPS` 並且複製 Git URL。或是直接複製你當前的網址，沒有 `.git` 也行。

![複製 Git URL](codebase.webp)

你會得到類似：

```text
https://github.com/USERNAME/git-workshop.git
https://github.com/USERNAME/git-workshop
```

打開 Terminal：

```bash
git clone https://github.com/USERNAME/git-workshop.git
```

現在 Repository 已經在你的電腦裡了。

## 用 VS Code 編輯

今天用 Visual Studio Code 當範例。

打開剛才的資料夾，建立 `hi.txt`，然後隨便打點東西。

![編輯新檔案](edit-text.webp)

存檔。打開 VS Code 左邊的 Source Control（`Ctrl+Shift+G` / `Option+Shift+G`）

你應該會看到 Changes 底下出現 hi.txt。這代表 VS Code 已經透過 Git 發現檔案有變更。

VS Code 的 Source Control，基本上就是把很多 Git 指令包成按鈕。你今天可以用 GUI，也可以用 Terminal，兩者本質是一樣的。

## 用 VS Code 做第一次 Commit

在 `hi.txt` 旁邊按 `+` 或是直接點 Changes 右邊的 `+`（相當於 `git add .`）

背後差不多就是 `git add hi.txt`。

接著輸入 Commit Message：

```text
feat: say hello
```

按：**Commit**

背後就是：

```bash
git commit -m "feat: say hello"
```

![alt text](commit.webp)

> [!NOTE] Commit 失敗
>
> 如果 Git 說 Author identity unknown，那代表你還沒設定名字和 Email。記得回去上面設定 `git config --global user.name` 和 `git config --global user.email` 喔！

## Push 到 GitHub

Commit 完成後，可以直接在 VS Code Push。或者 Terminal：

```bash
git push
```

如果第一次需要指定：

```bash
git push -u origin main
```

Push 完回到 GitHub 重新整理你應該就會看到 `hi.txt` 出現在網頁上。

恭喜。你已經完成第一次：

```text
本機修改
↓
Stage
↓
Commit
↓
Push
↓
GitHub
```

剛才同一套流程用 Command Line 是：

```bash
git status
git add hi.txt
git commit -m "feat: say hello"
git push
```

## 幾個一定要知道的 Git 指令

### `git status`

```bash
git status
```

看目前 Repository 的狀態。

### `git log`

```bash
git log
```

看 Commit 歷史。建議可以使用圖形顯示：

```bash
git log --oneline --graph --all
```

你會看到類似：

```text
* 9ca021a feat: add login
* e83ab31 fix: navbar
* 810ba11 initial commit
```

### `git diff`

還沒 Stage 前 `git diff` 可以看自己到底改了什麼。

## Branch：不要直接在正式版本上面亂搞

接下來是 Git 最重要的觀念之一，Branch。

假設現在有一個 App，正式上線版本放在 `main`。

今天你想寫登入功能你當然可以直接在 `main` 上改。就像你也可以 SSH 進正式 Server 改 Production。

技術上做得到。但通常我們希望你不要。比較正常的做法，是從 `main` 切一條新的 Branch。

例如：

```text
main
A ─── B ─── C
          \
           D ─── E
               feat/login
```

可以把 Branch 想成：從現在的專案開一條平行世界。

你在這裡愛怎麼開發就怎麼開發。等做完、測試完，再合回 `main`。

## 建立 Branch

建立並切換：

```bash
git switch -c dev
```

其中：

```text
-c
```

就是 Create。

> [!NOTE] git checkout
>
> 如果是舊教學，你也可能看到：
>
> ```bash
> git checkout -b dev
> ```
>
> 現在比較推薦新手先使用：
>
> ```bash
> git switch
> ```

語意比較清楚。

## 在 Branch 裡面工作

建立：

```bash
git switch -c dev
```

修改 `hi.txt`：

```text
Hello from dev!
```

接著：

```bash
git add hi.txt
git commit -m "feat: update greeting"
```

第一次把這條 Branch Push 到 GitHub：

```bash
git push -u origin dev
```

現在 GitHub 上會有：

```text
main
dev
```

切回：

```bash
git switch main
```

你可能會發現欸？剛剛的修改不見了。

沒有。它在 `dev`。

```bash
git switch dev
```

平行宇宙的東西又回來了。

## Merge：把 Branch 合回去

假設 `dev` 已經開發完成，準備合回 `main`。

先切回：

```bash
git switch main
```

如果是團隊專案，通常先：

```bash
git pull
```

確保 `main` 是最新的。

接著：

```bash
git merge dev
```

意思就是：

> 把 `dev` 合進我目前所在的 `main`。

成功之後：

```bash
git push
```

就完成了。

## Merge Conflict：Git 不敢幫你猜

理想世界裡 Merge 很漂亮。現實世界裡：

海鷗把第 10 行改成 A。

Ben 把同一行改成 B。

Git：

> 你們兩個自己打完之後跟我說。

因為 Git 沒辦法知道哪個才是你真正想留下來的版本。

這就是：**Merge Conflict**

### 故意做一個 Conflict

先：

```bash
git switch main
```

假設 `hi.txt`：

```text
Hello!
```

建立 Branch：

```bash
git switch -c dev
```

改成：

```text
Hello from dev!
```

Commit：

```bash
git add hi.txt
git commit -m "feat: change greeting on dev"
```

回 `main`：

```bash
git switch main
```

改同一行：

```text
Hello from main!
```

Commit：

```bash
git add hi.txt
git commit -m "feat: change greeting on main"
```

現在：

```bash
git merge dev
```

Git 可能就會說：

```text
CONFLICT
```

檔案裡可能看到：

```text
<<<<<<< HEAD
Hello from main!
=======
Hello from dev!
>>>>>>> dev
```

翻成人話：

```text
main 說這行應該是：
Hello from main!

dev 說這行應該是：
Hello from dev!

你決定。
```

Git 不自己猜，其實是好事。

因為它不知道你們誰才是對的。

## 用 VS Code 解 Conflict

這種時候非常推薦用 VS Code。

它會把 Conflict 標出來，並提供類似：

- Accept Current
- Accept Incoming
- Accept Both
- Compare Changes

等選項。

你可以留下某一邊。

也可以自己改成：

```text
Hello from both branches!
```

改完後：

```bash
git add hi.txt
git commit
git push
```

衝突就解決了。

所以 Conflict 並不是 Git 壞掉。而是 Git 在說「這裡有兩個答案，我不敢亂猜。」

## Remote：到底要 Push 去哪裡？

前面一直 `git push`，但 Git 到底怎麼知道要送去哪？

答案是：**Remote**。看看目前的 Remote：

```bash
git remote -v
```

可能看到：

```text
origin  https://github.com/elvis/project.git (fetch)
origin  https://github.com/elvis/project.git (push)
```

`origin` 是這個 Remote 的名字，是 Git Clone 時大家慣用的預設名稱。你也可以叫 `banana`。

### 為什麼 Clone 完就有 `origin`？

因為你本來就是從：

```bash
git clone https://github.com/xxx/project.git
```

Clone 下來。

Git 就會記得：

> 喔，這份專案原本來自這裡。

因此自動把它設成 origin

### 手動加入 Remote

如果你原本有一份本機專案，後來才建立 GitHub Repo：

```bash
git remote add origin https://github.com/USERNAME/project.git
```

第一次 Push：

```bash
git push -u origin main
```

完成。

你也可以有很多個 Remote：

```bash
git remote add github ...
git remote add gitlab ...
git remote add backup ...
```

所以 Remote 本質上只是：

> Git 可以跟哪些遠端 Repository 溝通？

## 本機原本就有專案怎麼辦？

如果你已經有：

```text
my-project/
```

不用重新 Clone。

直接：

```bash
cd my-project
git init
```

接著：

```bash
git add .
git commit -m "chore: initial commit"
```

在 GitHub 建立一個空 Repository。

然後：

```bash
git remote add origin https://github.com/USERNAME/my-project.git
```

需要的話，把 Branch 改成 `main`：

```bash
git branch -M main
```

最後：

```bash
git push -u origin main
```

完成。

這是非常常見的一套流程。

## Pull Request：我想把我的 Code 合進去

現在進入真正的團隊協作。假設你在 GitHub 看到一個很酷的專案。結果發現：

> 欸，這裡有 Bug。

而且你剛好會修。問題是你不是專案作者。你不能直接：

```bash
git push
```

進別人的 Repository，所以我們需要：**Pull Request**（簡稱 PR）。

它的意思大概就是：

> 嗨，我做了一組修改，你願不願意把我的東西合進你的專案？

## 同一個團隊的 PR

如果你本來就有 Repository 權限，通常不用 Fork。

直接建立 Branch：

```bash
git switch -c feat/login
```

開發：

```bash
git add .
git commit -m "feat: add login"
```

Push：

```bash
git push -u origin feat/login
```

GitHub 通常就會跳出：**Compare & pull request**

接著選：

```text
base: main
compare: feat/login
```

意思就是我要把 `feat/login` 合進 `main`。

## 如果是別人的專案：Fork

如果你沒有 Write 權限，就很常使用：

**Fork**

Fork 是把他的 Repository 複製一份到我的 GitHub 帳號。例如原本：

```text
someone/cool-project
```

Fork 後：

```text
your-name/cool-project
```

這一份是你的，你可以自己 Push。流程大概是：

```text
原作者 Repository
↓ Fork
你的 Repository
↓ Clone
你的電腦
↓ 修改
Commit
↓ Push
你的 GitHub
↓ Pull Request
原作者 Repository
```

## 比較完整的 Fork 流程

Clone 自己的 Fork：

```bash
git clone https://github.com/YOUR-NAME/cool-project.git
```

進去：

```bash
cd cool-project
```

通常還會加上原作者的 Repository：

```bash
git remote add upstream https://github.com/ORIGINAL-OWNER/cool-project.git
```

現在：

```bash
git remote -v
```

可能看到：

```text
origin    你的 Fork
upstream  原作者
```

建立 Branch：

```bash
git switch -c fix/awesome-bug
```

修改：

```bash
git add .
git commit -m "fix: awesome bug"
```

Push：

```bash
git push -u origin fix/awesome-bug
```

最後到 GitHub 開 Pull Request。

## Pull Request 要寫什麼？

PR 通常至少要有：

### Title

例如：Fix mobile navbar overflow

### Description

可以寫：

```text
修正手機版 Navbar 超出畫面的問題。

原因：
原本 Navbar 使用固定寬度，在 375px 以下會 overflow。

修改：
- 改用 flex-wrap
- 調整手機版 breakpoint
- 補上相關測試
```

好的 PR Description 可以讓 Reviewer 好看很多。不要只寫 fixed bug 之類的。

## Code Review：不要看到綠色按鈕就 Merge

Pull Request 開完，不代表馬上 Merge。正常團隊通常會先 **Code Review**，Reviewer 可以打開 **Files changed** 看看你改了什麼。

可能留言：

> 這裡為什麼這樣寫？

> 這裡是不是可能是 Null？

> 這個變數命名不符合規範

> 為什麼資料庫密碼會出現在這裡？

Review 完通常有幾種結果。

- Comment：單純留言
- Request changes：需要修改
- Approve：看過了，可以。
- Request changes：還需要修改。

比較正式的團隊甚至會設定：

- 至少一個 Reviewer Approve
- 所有測試通過
- Branch 必須是最新
- 指定人員必須 Review

才可以 Merge。

## GitHub Actions：叫機器先幫你檢查

除了人工 Code Review，也可以交給機器。

GitHub Actions 可以在：

- Push
- 開 PR
- Merge
- Release
- 定時排程

等事件發生時，自動做事。

例如：

```text
Pull Request
↓
跑 ESLint
↓
跑 Test
↓
Build
↓
安全性掃描
↓
全部成功
↓
允許 Merge
```

甚至：

```text
Merge 到 main
↓
Build
↓
Deploy
↓
網站上線
```

所以 GitHub 不只是「放 Code 的地方」。

它也可以成為整套團隊開發流程的中心。

## PR 的三種 Merge 方法

Pull Request Review 完、測試也過了。

終於可以按 Merge。

但 GitHub 常見有三種做法：

1. Merge commit
2. Squash and merge
3. Rebase and merge

## Merge Commit

假設原本：

```text
A ─── B ─── C
      \
       D ─── E
```

Merge 後可能：

```text
A ─── B ─── C ───── M
      \             /
       D ─── E ────
```

`M` 就是 Merge Commit。

它會清楚保留這兩條 Branch 在這裡合併。

優點是歷史很完整，但是 Branch 一多之後 Graph 可能會很亂。

## Rebase and Merge

Rebase 可以想成：

> 把 Branch 上面的 Commit 拿起來，重新接到最新的 `main` 後面。

原本：

```text
A ─── B ─── C
      \
       D ─── E
```

變成：

```text
A ─── B ─── C ─── D' ─── E'
```

歷史變成一條線。

優點是很乾淨，但 Rebase 會重寫 Commit 歷史。所以對已經被很多人共同使用的 Branch 做 Rebase，要特別小心。

## Squash and Merge

假設你在 Local 開發時，歷史長這樣：

```text
feat: add login
fix: typo
fix: really fix login
fix: pls work
fix: aaa
fix: finally
fix: really finally
```

開發過程這樣 Commit 沒什麼問題，Commit 本來就可以當 Checkpoint。但如果全部原封不動進 `main`，三年後的人看到：

```text
fix: aaa
```

可能不是很能理解這是一段什麼珍貴歷史。Squash 就是把這些 Commit 壓成一個：

```text
feat: add login system
```

再放進 `main`。

所以如果團隊習慣：

> 一個 PR = 一個完整功能

那 Squash and Merge 往往會非常舒服。

## 一套真正可以拿來用的團隊流程

把整件事情串起來，大概就是：

```text
更新 main
↓
開 Branch
↓
開發
↓
Commit
↓
Push
↓
Pull Request
↓
自動測試
↓
Code Review
↓
修改
↓
Approve
↓
Merge
↓
刪 Branch
↓
重新 Pull
```

例如今天要做登入：

```bash
git switch main
git pull
```

建立 Branch：

```bash
git switch -c feat/login
```

開發：

```bash
git status
git add .
git commit -m "feat: add login form"
```

繼續：

```bash
git add .
git commit -m "feat: connect login api"
```

Push：

```bash
git push -u origin feat/login
```

GitHub 上：

```text
Open Pull Request
```

Review 過程中如果還要改：

```bash
git add .
git commit -m "fix: handle invalid login"
git push
```

同一條 Branch Push 新 Commit 之後，原本的 PR 會自動更新。

不用重開。

最後 Merge。

本機回來：

```bash
git switch main
git pull
```

下一個功能：

```bash
git switch -c feat/profile
```

再跑一次。

這就是很多軟體團隊每天在做的事情。

## Branch 名稱怎麼取？

團隊可以自己訂。

常見例如：

```text
feat/login
feat/profile
fix/navbar
fix/payment-timeout
docs/install-guide
refactor/auth
```

重點不是一定要照這個格式。重點是看到名字就知道這條 Branch 在幹嘛。不要：

```text
test
test2
mybranch
newnew
aaa
```

## 最重要的不是背指令

你以後一定會忘記：

```bash
git remote add
```

怎麼打。

你也一定會 Google：

```text
git undo last commit
```

完全正常。

工程師沒有每天坐在辦公室默背 Git Manual。

真正重要的是，你腦袋裡知道：

```text
我的修改現在在哪？

還只是在 Working Directory？

已經 Stage？

已經 Commit？

在哪條 Branch？

Remote 有沒有？

我要把哪條 Branch 合去哪裡？
```

只要這張地圖有建立起來，指令忘記都查得到。

如果這張地圖不存在，背一百條指令也只是在施法。

## 最後

最後想講一件比較不像 Git 教學的事情。

我們今天一直在打：

```bash
git add
git commit
git push
```

看起來都是很冷冰冰的指令。

但真的開始接觸開源軟體之後，你會慢慢發現一件很有趣的事情。

你今天打開一個大型 Repository。

裡面可能有幾十萬行 Code。

數千個 Commit。

幾百、幾千位 Contributor。

它不是某個人某一天坐下來，一口氣把所有東西寫完的。

而是在很多年的時間裡，一群可能從來沒見過彼此的人，一點一點把東西留下來。

有人修了一個 Typo。

```text
docs: fix typo
```

有人花三個月重寫一個核心功能。

```text
feat: new rendering engine
```

有人只是覺得：

> 這個按鈕怪怪的。

所以送了一個 Pull Request。

也有人用了某個免費工具很久，某一天突然想：

> 它幫了我這麼多，我是不是也可以幫它修點東西？

下一個人，就站在這些 Commit 上繼續往前走。

Linux 是這樣。

Git 自己也是這樣。

我們每天在使用的大量 Library、Framework、編輯器、伺服器軟體，也都是這樣。

所以 Git 最厲害的地方，也許從來不只是可以回到昨天的版本。

而是它讓很多彼此不認識的人，可以把自己的工作接在另一個人的工作後面。

讓修改有歷史。

讓貢獻有紀錄。

讓一個人完成不了的東西，可以由很多人一起完成。

今天你第一次：

```bash
git clone
```

可能只是下載課堂範例。

第一次：

```bash
git commit
```

可能只是新增一句：

```text
Hello Git!
```

但那些今天看起來巨大得不可思議的開源專案，本質上也是這樣長出來的。

一個 Commit。

再下一個 Commit。

有人寫第一行。

有人改第二行。

有人修第三行。

很多年之後，我們才有今天這些工具可以使用。

所以哪一天，如果你也看到一個 Bug。

看到文件寫得不清楚。

看到一個功能覺得：

> 欸，這個我好像可以改。

那就試試看。

Fork 它。

開一條 Branch。

改掉它。

Commit。

Push。

開一個 Pull Request。

因為所有很大的開源專案，最後其實都是這樣長大的。

一個人留下一點。

下一個人，再留下一點。

而下一個 Commit，

也許就是你的。
