---
authors: elvismao
tags: [Linux, 7z]
categories: [生活駭客，程式開發]
date: 2024-05-31
---

# 如何在 Linux 中使用 7z 壓縮和解壓縮檔案：完整簡單的教學

在傳輸大量檔案時，壓縮和解壓縮檔案簡直是必備的救命技能。而其中我最喜歡的軟體就是 7z（7-Zip），因為使用起來非常簡單，且壓縮出來的檔案真的是有夠小。今天我要來和你分享如何在 Linux 終端機使用 7z 壓縮和解壓縮檔案。

## 壓縮比比較

## 1. 安裝 7-Zip

在 Linux 上使用 7z 之前，首先需要安裝 7-Zip 程序。大多數 Linux 發行版都可以透過套件管理器輕鬆安裝。以下是在幾種常見的 Linux 發行版上安裝 7-Zip 的命令：

- **Ubuntu/Debian 系統**:

    ```bash
    sudo apt-get install p7zip-full
    ```

- **Fedora/RHEL 系統**:

    ```bash
    sudo dnf install p7zip p7zip-plugins
    ```

- **Arch Linux**:
    ```bash
    sudo pacman -S p7zip
    ```

安裝完成後，你可以透過在終端機輸入 `7z` 來檢查 7-Zip 是否安裝成功。

## 2. 使用 7z 壓縮檔案

使用 7z 壓縮檔案非常簡單。以下是一個基本的命令，用於壓縮資料夾或檔案：

```bash
7z a 壓縮檔案名.7z 要壓縮的資料夾或檔案
```

- `a` 代表添加檔案到壓縮檔中。
- `壓縮檔案名.7z` 是你想要創建的壓縮檔案名。
- `要壓縮的資料夾或檔案` 是你想要壓縮的對象。

例如，要壓縮名為 `Documents` 的資料夾，你可以使用：

```bash
7z a documents.7z Documents
```

## 3. 使用 7z 解壓縮檔案

解壓縮檔案同樣簡單。使用以下命令可以解壓縮 7z 檔案：

```bash
7z x 壓縮檔案名.7z
```

- `x` 代表解壓縮檔案。
- `壓縮檔案名.7z` 是你想要解壓的壓縮檔。

例如如果你的壓縮檔是 `documents.7z`，則命令如下：

```bash
7z x documents.7z
```

## 4. 進階選項和技巧

7-Zip 提供了許多進階選項，讓你可以更精確地控制壓縮和解壓縮過程。例如：

- **設置壓縮等級**：

    ```bash
    7z a -mx=9 壓縮檔案名.7z 要壓縮的資料夾或檔案
    ```

    `mx` 參數可以設置壓縮等級，範圍是 0（無壓縮）到 9（最大壓縮）。

- **加密壓縮檔案**：

    ```bash
    7z a -p 你的密碼 壓縮檔案名.7z 要壓縮的資料夾或檔案
    ```

    加`-p`選項可以為壓縮檔加密。

- **查看壓縮檔案內容**：
    ```bash
    7z l 壓縮檔案名.7z
    ```
    `l` 參數用於列出壓縮檔內的檔案。

透過這篇文章，你應該已經學會了如何在 Linux 系統中使用 7z 進行壓縮和解壓縮。如果你有任何問題都可以在 IG 留言，也歡迎在 [Instagram](https://www.instagram.com/em.tec.blog) 和 [Google 新聞](https://news.google.com/publications/CAAqBwgKMKXLvgswsubVAw?ceid=TW:zh-Hant&oc=3)追蹤[毛哥EM資訊密技](https://em-tec.github.io/)。
