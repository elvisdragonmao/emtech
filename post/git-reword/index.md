---
authors: elvismao
tags: []
categories: []
date: 2025-05-04
description: 
---

# 如何更改已經 push 的 commit message

有時候，我們在 `git commit` 後才發現 commit message 打錯字，或著是你有一個每個都每個 commit 都寫 "fix bug" 的好朋友。因此這篇文章我們要來討論如何修改已經 push 上去的 commit message。

## 方法一：如果只想改最後一個 commit

1. 用 `git commit --amend` 修改

```bash
git commit --amend
```

這條指令會打開你的編輯器（像是 Vim），讓你重新編輯最後一個 commit 的訊息。
改完後儲存並關閉。

1. 強制推送

```bash
git push --force
```

或者更安全一點，只強制更新自己那個分支：

```bash
git push --force-with-lease
```

這樣就可以成功修改最後一個 commit message。

## 方法二：想改更早以前的 commit

如果想改好幾個 commit 前，或是一次更改多個訊息，可以用 `git rebase`：

1. 開始互動式 rebase

```bash
git rebase -i HEAD~n
```

把 `n` 換成你想回溯的 commit 數量，例如改前三個 commit，就用 `HEAD~3`。你也可以複製 commit hash，像這樣：

```bash
git rebase -i abc1234
```

這樣會從這個 commit 的下一個開始全部顯示。

2. 編輯 commit
   畫面出來後，你會看到類似：

```
pick abc1234 First commit
pick def5678 Second commit
pick ghi9012 Third commit
```

把想改的那一行的 `pick` 改成 `reword`（或是縮寫 `r`），像這樣：

```
pick abc1234 First commit
r def5678 Second commit
pick ghi9012 Third commit
```

然後儲存並關閉。

3. 修改訊息
   Git 會依序個打開你要 `reword` 的 commit，讓你編輯新的訊息。編輯完儲存離開就會進入下一個。

4. Rebase 完成後，強制推送

```bash
git push --force
```

或

```bash
git push --force-with-lease
```

這樣就完成了。記得因為我們強制推送了，所以如果有其他人也在這個分支上工作，他們需要重新拉取這個分支，或者用 `git pull --rebase` 來更新他們的本地版本。