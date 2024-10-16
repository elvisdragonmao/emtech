---
authors: elvismao
tags: [Terminal, Vim]
categories: [軟體分享]
date: 2023-02-13
---

# 【終端機】快速上手 Vim

如果你正在尋求一款快速、高效和功能強大的文本編輯器，那麼 Vim 可能是你的最佳選擇。

Vim 是一款非常熱門的文本編輯器，在 Unix 系統中非常受歡迎。如果你正在尋求一款快速、高效和功能強大的文本編輯器，那麼 Vim 可能是你的最佳選擇。

在本文中，我們將提供一些快速上手 Vim 的技巧，以幫助你快速熟悉這款編輯器。

## 安裝

下面是各平台安裝 Vim 的步驟：

### Windows

前往 [Vim 官方網站](https://www.vim.org/download.php)下載最新版本的 Windows 安裝包並執行安裝程式，並按照提示進行安裝。當然你也可以使用choco等套件管理器安裝

```
choco install vim
```

在命令提示字元中運行 `vim` 以啟動 Vim

### Android Termux

```
pkg install vim
```

### MacOS

```
brew install vim
```

### Linux

```
sudo apt-get install vim
```

## 基本操作

如果你想打開 Vim，只需在終端機中輸入以下命令：

```
$ vim [filename]
```

如果你想創建一個新文件，可以將文件名放入命令中。如果你想編輯現有文件，可以將文件名作為參數傳遞給命令。

一旦你進入 Vim，你將看到一個空白文件。如果你想進行編輯，需要進入“編輯模式”。要進入編輯模式，只需按下`i`鍵。此時，你將可以在文件中輸入文本。

要退出編輯模式，只需按下“Esc”鍵。此時，你將回到“命令模式”。在命令模式中，你可以使用各種命令，例如保存文件、退出 Vim 等。

### 保存和退出

如果你想保存更改並退出 Vim，只需在命令模式中輸入以下命令：`:wq`

如果你不想保存更改，可以使用以下命令：`:q!`

## 其他常用指令

以下是一些常用的 Vim 指令：

-   `:w` - 保存文件
-   `:q` - 退出 Vim
-   `:w` [filename] - 將文件另存為 [filename]
-   `:x` - 保存文件並退出 Vim
-   `dd` - 刪除光標所在的行
-   `u` - 撤消上一個操作
-   `ctrl + r` - 還原上一個撤銷的操作
-   `yy` - 複製光標所在的行
-   `p` - 在光標下面粘貼複製的文本
-   `:` [行數] - 跳到文件中的第 [行數] 行
-   `/` [內容] - 在文件中搜索 [內容]

Vim 的命令很多，但只需要熟悉一些常用指令即可快速操作。希望這篇文章能對你快速上手 Vim 有所幫助。如果你覺得這篇文章有幫助到你歡迎在[Instagram](https://instagram.com/em.tec.blog)或[Google新聞](https://news.google.com/s/CBIwgtnWzKAB?sceid=TW:zh-Hant&sceid=TW:zh-Hant&r=11&oc=1)追蹤毛哥EM資訊密技
