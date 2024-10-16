---
authors: elvismao
tags: [Terminal]
categories: [debug]
date: 2022-08-19
---

# 【終端機】輕鬆更改SSH的驗證碼passpharase

SSH是一種簡單的登入方式。以我來說在使用git來上傳檔案到Github時，因為我在手機生成並設定好了ssh，不用每次上傳都需要輸入帳號和全是亂碼的驗證密碼。
不過也可以設定在使用SSH登入的時候需要輸入一組passpharase，來保障你的安全。不過如果你想要更改或取消密碼怎麼辦呢

<!--more-->

# cd到ssh資料夾

這裡以Android的Termux為例。ssh資料夾在`~/.ssh`（其他作業系統也大同小異）

```
cd .ssh
```

# 更改密碼

如果你在建立的時候沒有自訂名稱（直接按enter，預設為`id_rsa`），可直接打下面這串指令

```
change-ssh-passpharase
```

如果你要指定ssh的話後面要加一小串

```
ssh-keygen -p -f <檔名>
```

如果你之前設定過密碼會看到`Enter old passphrase:`，需要先輸入一次之前的密碼。不然直接輸入新密碼兩次就好了。如果不想要設定就直接按enter就好了。

如果看到以下這一串

```
Failed to load key id_rsa: incorrect passphrase supplied to decrypt private key
```

代表你剛才輸錯密碼，請重新輸入一次。
