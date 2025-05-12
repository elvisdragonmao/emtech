---
authors: elvismao
tags: [Git]
categories: [程式開發]
date: 2025-05-11
description: `.gitignore` 能不能 ignore 自己？可以。
---

# 如果在 .gitignore ignore .gitignore 那 .gitignore 會被 git 因為 .gitignore ignore 了 .gitignore 而被 ignore 嗎？

`.gitignore` 是我們非常熟悉的檔案。它負責告訴 Git 哪些檔案「不要納入版本控制」。但有沒有想過**如果我在 `.gitignore` 裡面加上 `.gitignore` 本身，會發生什麼事？它真的會被 ignore 嗎？**

## 先快速複習一下 `.gitignore` 的工作方式

- **尚未被追蹤（untracked）** 的檔案，如果符合 `.gitignore` 裡的規則，就不會被 `git add` 加進來。
- **已經被追蹤（tracked）** 的檔案，不管 `.gitignore` 怎麼寫，**都還是會繼續被追蹤**，除非你手動把它從 Git 中移除（`git rm --cached 檔名`）。

## 那如果我在 `.gitignore` 裡寫上 `.gitignore` 呢？

你可以想想看，其實答案很簡單：

- 如果 `.gitignore` 還沒被 Git 追蹤過，這樣寫會讓 Git 忽略它。

- 如果 `.gitignore` 已經被 Git 追蹤了（大部分專案一開始就會這樣），那即使你在裡面寫了 `.gitignore`，Git 還是會繼續追蹤它。
-

> 人生有很多事情是看過就忘不了的。

## 簡單的實驗

1. 建一個新資料夾，初始化 Git

    ```bash
    mkdir test-gitignore
    cd test-gitignore
    git init
    ```

2. 建立 `.gitignore`，內容寫自己

    ```
    echo .gitignore > .gitignore
    ```

3. `git add .gitignore` 看看

    你會看到：

    ```
    The following paths are ignored by one of your .gitignore files:
    .gitignore
    hint: Use -f if you really want to add them.
    hint: Disable this message with "git config set advice.addIgnoredFile false"
    ```

    `.gitignore` 根本不會被加進暫存區。

    ✅ **成功忽略自己！**

## 但如果情況是這樣呢？

假設 `.gitignore` **已經在 Git 版本庫裡了**（很正常，你很有可能創 GitHub Repo 的時候就已經選了一個了），然後你有一天很無聊或不小心把 `.gitignore` 到 `.gitignore` 裡。

這時候，`git status` 只會顯示檔案內容有改變，它一樣會被追蹤、被 commit。

要讓它真的被 ignore，你需要這樣操作：

```bash
git rm --cached .gitignore
```

這會從 Git 的追蹤清單中移除 `.gitignore`，但不會刪掉本地檔案。
然後之後 `.gitignore` 就真的被 ignore 了。

## 我們學到了什麼？

我也不知道。反正，如果如果哪天突然有一個人沒事把 `.gitignore` 加進 `.gitignore` 裡，不會有什麼事發生，你也不用刪掉。
