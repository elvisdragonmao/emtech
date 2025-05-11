---
authors: elvismao
tags: [Git]
categories: [程式開發]
date: 2025-05-04
description:
---

# Git force push orphan branch 其他人不能 pull 怎麼辦？

當我們 force push 了一個孤兒（orphan）分支到 GitHub，結果換電腦以後 Git 提示我分支出現偏離，拉不下來也推不上去。今天我們要來討論這個問題發生的原因，還有應該怎麼安全地處理。

## 什麼是 Orphan Branch？

所謂的 orphan branch（孤兒分支），指的是一個沒有父母（任何歷史紀錄）的全新分支。換句話說，它跟原本的 Git 歷史一點關係都沒有，完全是重新開始。

通常是用這種指令建立：

```bash
git checkout —orphan <branch-name>
```

之後如果你直接 force push 到像是 main 或是任何其他分支，就等於是用新的歷史直接覆蓋掉原本的歷史。

## 為什麼換電腦以後會出問題？

當你在一台電腦 force push 了 orphan branch 之後，遠端（GitHub, GitLab）已經變成全新的歷史。

但是當你在另一台電腦上 `git pull` 的時候本地還是「舊的歷史」，而遠端是「新的孤兒歷史」，兩邊完全不相干。

所以 Git 就提示：

- 分支偏離（diverged）
- 無法快轉合併（fast-forward 不起來）
- 無法直接 merge（因為根本沒共同祖先）

> 簡單來說 Git 在跟你說：「我是要確認有沒有更新，但你給這一大堆三小？沒見過，一個都沒有。啊你想要我怎樣？」

這時候，普通的 `git pull` 是無法解決的。

## 正確處理方式：reset 本地分支

如果你確定：

- 遠端是正確的版本
- 本地不要留著了（或已經備份過）

那最乾脆的做法就是重設本地分支到遠端。

> 中文：重新 `clone` 一次。

指令如下：

```bash
git fetch origin
git reset --hard origin/main
```

- `git fetch origin` 會把遠端的最新資訊拉下來，但不動你的檔案。
- `git reset --hard origin/main` 把本地的 `main` 分支硬生生對齊到遠端的 `main`，連檔案也一起覆蓋掉。

{{notice}}

### 提醒

- 這個指令會**砍掉本地所有未提交的修改**，所以如果有重要的東西，請先 `git stash` 或是手動備份一下。
- 如果 force push 的分支不是 `main`，請把 `main` 換成你要的分支名稱。

{{noticed}}

執行完，你的電腦上 `main` 就跟 GitHub 上的一模一樣了。

> 漂亮的封面圖來自 [Unsplash](https://unsplash.com/photos/a-little-boy-playing-with-a-dog-in-a-yard-oANiLNLdIkw?utm_content=creditShareLink&utm_medium=referral&utm_source=unsplash)，作者 [Peyman Shojaei](https://unsplash.com/@julius_drost)。