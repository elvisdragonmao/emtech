---
authors: elvismao
tags: [Github, Hugo]
categories: [製作教學]
series: [複製貼上就能成為工程師]
date: 2022-08-17
---

# 【Github Action】自動部署你的 Hugo 網站

每次寫完文章還要打指令生成網站，麻煩死了！讓Github Action幫你自動部署，寫完文章直角上傳就好了！
<!--more-->
 {{% notice notice "在開始之前" %}}
 請先建立好部落格，並且將整個檔案的資料夾上傳到Github的`用戶名/用戶名.github.io`repository
 記住不是裡面的`public`子資料夾，是整個資料夾喔
 {{% /notice %}}
 
 # 要解決的問題
 平常我們寫完一篇文章，要先打指令生成靜態網站（生成在`public`資料夾裡面），再把它上傳到Github上面。
除了過程十分的麻煩以外，因為網站資料是儲存在你自己的電腦裡面，所以假設你更變工作環境（比如說在手機上）你就沒辦法進行編輯。

既然每次生成網站的指令都是一樣的，不如我們來建立一個Github Action來讓它自動部署吧

# 設定 Github

## 設定 Access Token

首先我們要先建立一個Repository 的 Access Token。這是一把鑰匙，我們要把鑰匙給Github Action的程式它才可以部署我們的網站

請先到`Settings/Developer Settings`下的`Personal access tokens`生成一組`Access Token`。建議scope直接選repo的所有權限。

![生成Access Token](https://emtech.cc/images/hugo-githubAction-access-token.png)

## 添加 Secrets

因為我們的Github Action程式碼是公開的，但是我們不想要讓其他人看到剛才的那組Access Token，所以我們要建立一組Secret。當我們在程式說要「那個東西」的時候，他就會知道要來這裡找這組密碼。

請到`Settings/Secrets`新增一組 Secrets，我這邊叫做 ACCESS_TOKEN，之後在腳本上會用到。

![添加Secrets](https://emtech.cc/images/hugo-githubAction-sectets.png)

## 新增Workflow

依序點擊Action，New，set up a workflow yourself，並貼上以下程式。名稱可以自己取，貼上完之後點擊Start Commit。

![設定Workflow](https://emtech.cc/images/hugo-githubAction-access-workflow.jpg)

程式意思是當main分支有push操作時（就是你上傳或更變檔案），會生成靜態網頁。剛才不是說會生成在`public`這個資料夾，我們把它推送到 gh-pages 這個分支（當然你也可以自己取名）

```
name: create

on:
  push:
    branches:
      - main  # 當main分支有push操作時

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          submodules: true  # 找尋Hugo主題(true OR recursive)
          fetch-depth: 0    # Fetch all history for .GitInfo and .Lastmod

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '0.89.4' # hugo 版本
          extended: true

      - name: Build
        run: hugo --minify

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.HUGO_DEPLOY_TOKEN }}
          PUBLISH_BRANCH: gh-pages  # 推送到 gh-pages 分支
          PUBLISH_DIR: ./public     # hugo 生成的目錄
          commit_message: ${{github.event.head_commit.message }}
```

新增完成後它會自己跑一次。不過我們還需要做一個設定。生成的網站是放在`gh-pages`這個分支，我們要輸入網址時，去讀取這個分支而不是main。所以請到`Settings/Pages/Branch`更改

![更改Branch](https://emtech.cc/images/hugo-githubAction-branch.jpg)

這樣就大公告成囉！記得每次更新完部落格Github Action都需要大約30秒的執行時間才會完成部署。如果你想要查看它的進度狀態可以點擊最新紀錄的橘點看目前的即時狀態。如果變成綠色就是部署成功，如果是鴻森代表有問題（通常是文章中的語法有語法錯誤）。