---
authors: elvismao
tags: [git, macOS]
categories: [程式開發]
date: 2025-04-04
description: 用 `git rm --cached .DS_Store` 刪除紀錄，然後設定全域的 `.gitignore` 檔案。
---

# 你們為什麼就不能全域 .gitignore .DS_Store 呢？

身邊有人用 macOS 的人一定都知道它會在資料夾到處拉屎。這個檔案叫做 `.DS_Store`，它的全名是 Desktop Services Store，用來儲存資料夾的顯示方式、圖示位置、背景顏色等等。不過畢竟它是一個檔案，如果你使用 git 然後不知道為什麼你用 Finder 在開你的專案而不是 IDE，一不小心這個檔案就會被 `git commit` 到你的專案裡面。`git diff` 的時候出現一堆莫名其妙的變更，然後你還要特別去處理這些變更。

我敢說你人生中基本上不會有任何時候需要 `commit` 它，因此這篇文章就來教你怎麼把這些屎清乾淨，接著讓 Git 永遠都忽略這個檔案。

## 清除專案中的 `.DS_Store`

如果你之前已經不小心 commit 了 `.DS_Store`，就算你之後再加到 `.gitignore`，Git 還是會追蹤這個檔案（就像黃子佼回不去演藝圈一樣）。這時候你需要先把它從 Git 的追蹤中移除，但不會刪除本地的檔案。

你可以使用以下指令來清除這個資料夾的 `.DS_Store`：

```bash
git rm --cached .DS_Store
```

如果你拉的到處都是，你可以使用以下指令來清除整個專案的 `.DS_Store`：

```bash
find . -name .DS_Store -print0 | xargs -0 git rm --ignore-unmatch
```

這樣你的專案就乾淨了。下一步我們來讓 Git 永遠都忽略這個檔案。

## 永遠忽略 `.DS_Store`

首先我們要建立一個 全域的 `.gitignore` 檔案，這個檔案會在你所有的專案中都會被使用。你可以在任何地方建立這個檔案，但通常會放在你的家目錄下。

```bash
echo .DS_Store >> ~/.gitignore_global
```

接著我們要告訴 Git 使用這個全域的 `.gitignore` 檔案。你可以使用以下指令來設定：

```bash
git config --global core.excludesfile ~/.gitignore_global
```

這樣就完成了！現在 Git 就會永遠忽略 `.DS_Store` 檔案了。

{{notice}}

gitignore.io

[gitignore.io](https://www.toptal.com/developers/gitignore) 是一個可以幫你產生 `.gitignore` 檔案的網站。跟你在創 GitHub Repo 的時候可以選擇一樣，你可以在上面選擇你需要的語言、框架、IDE 等等，然後它會幫你產生一個適合你的 `.gitignore` 檔案，這樣就不用自己手動寫了。不過裡面的 `.DS_Store` 可能不會被包含在裡面，所以還是建議你自己手動加上去。

{{noticed}}
