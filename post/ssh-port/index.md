---
authors: elvismao
tags: [Linux, SSH]
categories: [debug]
date: 2024-06-24
---

# 如何更改 SSH 預設端口

在某些情況下，例如學校或公司網路封鎖了 SSH 預設的 22 端口，你可能需要更改 SSH 服務器的端口號來確保連接。更改端口號還可以增加一層安全性，因為攻擊者通常會針對常見的 22 端口進行掃描和攻擊。

<!--more-->

很明顯我寫這篇文章是因為西苑高中把我封的... 因此請你先透過網頁版的 SSH 連線到你的伺服器，或著是先開手機的個人熱點再進行以下步驟。

### 步驟一：編輯 SSH 配置文件

首先，我們需要編輯 SSH 的配置文件。你可以使用任何文本編輯器，這裡我們使用 Vim 編輯器。打開 SSH 配置文件 `sshd_config`：

```sh
sudo vim /etc/ssh/sshd_config
```

{{notice}}
Vim 基本操作" %}}

- **打開文件**：輸入 `vim 文件名`。
- **進入編輯模式**：按 `i` 鍵進入插入模式。
- **保存退出**：按 `Esc` 鍵退出編輯模式，然後輸入 `:wq` 並按 `Enter` 保存並退出。
- **退出不保存**：按 `Esc` 鍵退出編輯模式，然後輸入 `:q!` 並按 `Enter`。
  {{% /notice %}}

### 步驟二：修改端口設置

在打開的 `sshd_config` 文件中，找到以下這一行：

```sh
#Port 22
```

將其修改為：

```sh
Port 2222
```

這樣，我們就將 SSH 服務器的端口從 22 改為 2222。如果你想使用其他端口，可以自行修改。請注意，端口號必須在 0 到 65535 之間，並且不能與系統中已經使用的端口衝突。

### 步驟三：保存並退出

在 Vim 編輯器中，按 `Esc` 鍵退出插入模式，然後輸入 `:wq` 並按 `Enter` 保存並退出文件。

### 步驟四：重啟 SSH 服務

更改完成後，需要重啟 SSH 服務以使更改生效：

```sh
sudo systemctl restart sshd
```

### 步驟五：確認防火牆設置

確保防火牆允許新的端口。如果你使用的是 `ufw`，可以這樣設置：

```sh
sudo ufw allow 2222/tcp
```

### 步驟六：測試新的 SSH 端口

使用新的端口號進行 SSH 連接測試：

```sh
ssh -p 2222 username@hostname
```

### 結論

通過更改 SSH 端口號，你可以繞過一些網路限制並增強系統的安全性。使用 Vim 編輯器可以方便地進行配置文件的修改。希望這篇文章對你有幫助，如果你有任何問題都可以在 IG 留言，也歡迎在 [Instagram](https://www.instagram.com/em.tec.blog) 和 [Google 新聞](https://news.google.com/publications/CAAqBwgKMKXLvgswsubVAw?ceid=TW:zh-Hant&oc=3)追蹤[毛哥EM資訊密技](https://em-tec.github.io/)。
