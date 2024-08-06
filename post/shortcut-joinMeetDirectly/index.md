---
authors: elvismao
tags: [自製,衛道中學,Github,JSON,ios捷徑]
categories: [捷徑分享]
date: 2021-06-04
---

# 【捷徑】快速進入當節課堂的Meet（備份）

透過這個捷徑快速進入當節課堂的Meet，再也不用怕忘記課表
<!--more-->
記得在國二在家上課的時候常常忘記記課表及找不到Meet代碼，或著是來不及再去Classroom找，因此我做了這個捷徑。<br />
{{% notice info "203 Meet" %}}

* 開發者:毛哥EM(我)
* 軟體類型:ios捷徑
* 下載位置:[iCloud](https://www.icloud.com/shortcuts/154933bcaf8145dba8ec955f8695503d)
{{% /notice %}}

## 設定

當成功將捷徑加入裝置後，他會請你設定幾個變數。

* **注意事項**:直接按下一部即可
* **英會班級**:衛道中學的英語會話課分成兩班，所以要在這裡輸入是A班還是B班。
* **使用者編號**:如果沒有當堂課的Google Meet代碼，會連結到Classroom的畫面。如果這個裝置有多個帳號的話可以指定開啟哪一個帳號的Classroom。

## 原理

原理其實也很簡單，就是先Get一個我預先放在Github的JSON檔案來查看那一節是什麼課，再用Safari來打開它。Safari會自動開啟Google Meet並加入會議。有趣的是用Chrome開啟Google Meet連結並不會打開Google Meet
我覺得以我當時的設計得不錯，所以把檔案保留下來。
{{% notice tip "小提醒" %}}

* 但是這是當時的課程所以現在無法運作，但你可以下載下來做修改。
* 如果手機說無法加入不受信任的捷徑，請參考[這篇文章](https://emtech.cc/post/shortcut-untrusted_shortcut/)提供的方法。
* 你也可以用Siri執行這個捷徑。
{{% /notice %}}
