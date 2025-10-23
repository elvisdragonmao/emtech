---
authors: elvismao
tags: [Terminal]
categories: [程式開發]
date: 2022-08-19
---

# 【終端機】輕鬆更改 SSH 的驗證碼 passpharase

SSH 是一種簡單的登入方式。以我來說在使用 git 來上傳檔案到 Github 時，因為我在手機生成並設定好了 ssh，不用每次上傳都需要輸入帳號和全是亂碼的驗證密碼。不過也可以設定在使用 SSH 登入的時候需要輸入一組 passpharase，來保障你的安全。不過如果你想要更改或取消密碼怎麼辦呢

# cd 到 ssh 資料夾

這裡以 Android 的 Termux 為例。ssh 資料夾在`~/.ssh`（其他作業系統也大同小異）

```
cd .ssh
```

# 更改密碼

如果你在建立的時候沒有自訂名稱（直接按 enter，預設為`id_rsa`），可直接打下面這串指令

```
change-ssh-passpharase
```

如果你要指定 ssh 的話後面要加一小串

```
ssh-keygen -p -f <檔名>
```

如果你之前設定過密碼會看到`Enter old passphrase:`，需要先輸入一次之前的密碼。不然直接輸入新密碼兩次就好了。如果不想要設定就直接按 enter 就好了。

如果看到以下這一串

```
Failed to load key id_rsa: incorrect passphrase supplied to decrypt private key
```

代表你剛才輸錯密碼，請重新輸入一次。
