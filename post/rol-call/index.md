---
authors: elvismao
tags: [HTML, CSS, JavaScript, GitHub, Google Apps Script, 複製貼上就能成為工程師]
categories: [生活駭客，程式開發]
date: 2023-05-01
---

# 自製免費點名系統

本文將教授如何使用程式製作一個簡單的點名網頁。透過這個點名系統，你可以方便地管理你的學生出席狀況，並且隨時查詢歷史出席紀錄。我們將使用 Google Apps Script, GitHub 和 Google Sheets 來建立這個點名系統。**我敢保證即使你完全不會程式也可以在 5 分鐘內完成**。本文會詳細說明從建立 Google Sheets 到部屬網頁的步驟，並提供完整的程式碼和演示網頁。

> 我在兩年前曾經寫過一篇[【Google Apps Script】自製點名系統](https://emtech.cc/post/frog_check_in/)，出乎意料地幫助到許多人，所以我決定重新寫一次，比上次更容易製作和操作，也更好看一些 (我覺得啦)。

## 範例網頁

首先，我們先來看一下最終的成果。這是我們要製作的點名系統的演示網頁。你可以點擊[這裡](https://edit-mr.github.io/roll-call)查看完整的演示網頁。他有以下幾個功能

- 點名：點擊學生姓名，即可完成點名
- 新增學生：輸入學生姓名點擊新增按鈕，即可新增學生
- 查詢歷史出席紀錄：輸入學生姓名點擊查詢按鈕，即可查詢歷史出席紀錄

好了，我們現在就開始製作這個點名系統吧 w

## 步驟一：建立 Google Sheets 文件

首先，我們需要建立一個 Google Sheets 文件，用於存儲學生的出席情況。在這個文件中，我們可以添加學生名稱、出席時間、剩餘課堂等信息。

請打開我建立的這個[範例文件](https://docs.google.com/spreadsheets/d/1m0F6pOejN-ldKFIrFwssmoEPB3EPDmSQJKEPr9T88-E/edit?usp=sharing)並建立副本

![建立副本](roll-call-new.webp)

這樣 Google Sheet 就做好了。請複製這個文件的 ID，我們稍後會用到。ID 就是網址中的一長串字母和數字，比如說這個試算表：

```
https://docs.google.com/spreadsheets/d/1m0F6pOejN-ldKFIrFwssmoEPB3EPDmSQJKEPr9T88-E/edit#gid=0
```

它的 ID 就是`1m0F6pOejN-ldKFIrFwssmoEPB3EPDmSQJKEPr9T88-E`。

## 步驟二：建立 Google Apps Script

現在，我們需要建立一個 Google Apps Script，用於向 Google Sheets 文件中添加和讀取數據。請在網址輸入[script.new](https://script.new/)，進入 Google Apps Script 編輯器。接著貼上我的這一串程式。請把第一行的雙引號裡面換成剛才複製的 ID。

```js
const id = "1m0F6pOejN-ldKFIrFwssmoEPB3EPDmSQJKEPr9T88-E";

function doGet(e) {
	let t = e.parameter,
		a = SpreadsheetApp.openById(id).getSheets();
	switch (t.type) {
		case "call":
			if (!t.time) return ContentService.createTextOutput(!1);
			return (a[0].appendRow([t.name, t.time, t.remain]), ContentService.createTextOutput(!0));
		case "list":
			var r = a[1]
				.getRange(2, 1, a[1].getLastRow() - 1, a[1].getLastColumn())
				.getValues()
				.filter(e => "" !== e[0])
				.map(e => ({ name: e[0], left: e[2] }));
			return ContentService.createTextOutput(JSON.stringify(r)).setMimeType(ContentService.MimeType.JSON);
		case "search":
			var [n, ...r] = a[0].getDataRange().getValues();
			let [u, i, p] = n,
				s = n.indexOf(u),
				m = n.indexOf(i),
				c = n.indexOf(p),
				l = r.filter(e => e[s] === t.name).map(e => ({ time: e[m], left: e[c] }));
			return ContentService.createTextOutput(JSON.stringify(l)).setMimeType(ContentService.MimeType.JSON);
		case "new":
			let f = a[1].getLastRow() + 1;
			return (a[1].appendRow([t.name, `=COUNTIF('紀錄'!A:A,A${f})`, `=D${f}-B${f}`]), ContentService.createTextOutput(!0));
		default:
			return ContentService.createTextOutput("別亂撞我～");
	}
}
```

我們需要把它部屬成網頁，請點擊左上角的部屬，新增部屬作業，選擇部屬為網頁應用程式。執行身分選自己 (我)，誰可以存取選所有人。接著點擊部屬，複製網頁應用程式網址。比如說：

```
https://script.google.com/macros/s/AKfycbzxqGIMBbLkCka2aveltdVHYtdG-k_X98qzSd_V9MHDxWaOYXFwZgE3rRHDzCakzTxs/exec
```

![部屬網頁應用程式](/static/img/gas.webp)

## 步驟三：建立網頁

請你在任意一個網頁代管服務，比如說 Vercel,Github Pages, Gitlab Pages, Netlify 等等，建立一個網頁。接著在網頁中貼上以下程式碼。

如果你沒有使用過這些服務，可以參考以下教學：

### 使用 Github Pages 部屬網頁

請先註冊帳號，你可以參考以下影片：

<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/reel/CpsVHfCjBJx/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/reel/CpsVHfCjBJx/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">在 Instagram 查看這則貼文</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/reel/CpsVHfCjBJx/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">毛哥EM資訊密技（@em.tec.blog）分享的貼文</a></p></div></blockquote>
<script async src="//www.instagram.com/embed.js"></script>

部屬網頁有兩個辦法。**選一個就可以了**

#### 用戶名.github.io

第一個是影片說明的方法，就是建立一個叫做`用戶名.github.io`的倉庫，然後建立一個`index.html`的檔案並貼上以下程式。

```html
<!doctype html>
<html lang="zh-TW">
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>簡易點名系統</title>
		<meta name="theme-color" content="3B4252" />
		<style>
			h1 {
				/* 標題顏色 */
				color: var(--nord7);
			}

			body {
				/* 背景顏色 */
				background-color: var(--nord0);
			}

			body {
				/* 可選顏色 */
				--nord0: #2e3440;
				--nord1: #3b4252;
				--nord2: #434c5e;
				--nord3: #4c566a;
				--nord4: #d8dee9;
				--nord5: #e5e9f0;
				--nord6: #eceff4;
				--nord7: #8fbcbb;
				--nord8: #88c0d0;
				--nord9: #81a1c1;
				--nord10: #5e81ac;
				--nord11: #bf616a;
				--nord12: #d08770;
				--nord13: #ebcb8b;
				--nord14: #a3be8c;
				--nord15: #b48ead;
				--black: #000;
				--line: #4c566a;
			}

			main,
			nav {
				display: flex;
			}

			.call button,
			button:hover {
				background-color: var(--nord2);
			}

			button,
			section > div {
				background-color: var(--nord1);
				box-shadow: rgba(0, 0, 0, 0.2) 0 0 0.5rem;
			}

			main,
			section > div {
				padding: 1rem;
				width: 100%;
			}

			footer,
			footer a {
				color: var(--nord4);
			}

			.search button,
			button,
			input,
			section > div {
				box-shadow: rgba(0, 0, 0, 0.2) 0 0 0.5rem;
			}

			body,
			button,
			h2,
			html {
				text-align: center;
			}

			* {
				padding: 0;
				margin: 0;
				box-sizing: border-box;
				font-family: Arial, "微軟正黑體", Helvetica, sans-serif;
				color: var(--nord6);
			}

			body,
			html {
				min-height: 100%;
			}

			main {
				flex-direction: column;
				height: 100vh;
				height: 100dvh;
				max-width: 500px;
				margin: 0 auto;
			}

			nav {
				justify-content: space-between;
			}

			button {
				display: block;
				height: 50px;
				width: calc(1 / 3 * 100% - 1rem);
				line-height: 50px;
				border-radius: 1rem;
				text-decoration: none;
				border: none;
				cursor: pointer;
				transition: background-color 0.2s ease-in-out;
			}

			#call,
			.search,
			footer {
				display: flex;
			}

			.call button {
				width: calc(1 / 4 * 100% - 1rem);
				margin: 0.5rem;
			}

			button:hover {
				filter: brightness(1.2);
			}

			button:active {
				background-color: var(--nord3);
				filter: brightness(1.5);
			}

			section {
				flex-grow: 1;
				margin: 1rem 0;
				position: relative;
			}

			footer {
				justify-content: flex-end;
				align-items: flex-end;
			}

			section > div {
				border-radius: 1rem;
				overflow-x: hidden;
				overflow-y: auto;
				position: absolute;
				height: 100%;
				transition: opacity 0.5s ease-in-out;
			}

			#add,
			#history {
				opacity: 0;
			}

			#call {
				z-index: 2;
				flex-wrap: wrap;
				justify-content: space-between;
			}

			.search {
				justify-content: center;
				align-items: center;
			}

			.search button,
			input {
				height: 2rem;
				width: 50%;
				border-radius: 0.5rem;
				border: transparent;
				padding: 0 1rem;
				background-color: var(--nord3);
				color: var(--nord4);
			}

			h2,
			table {
				width: 100%;
			}

			input:focus {
				outline: transparent;
			}

			.search button {
				margin-left: 1rem;
				width: auto;
				line-height: 100%;
			}

			table {
				border-collapse: collapse;
				margin-top: 1rem;
			}

			tr {
				border-bottom: 1px solid var(--line);
			}

			td {
				padding: 0.5rem;
			}

			h2 {
				margin-top: 2rem;
				font-weight: 600;
			}

			#status {
				margin: 0.5rem 0 1rem;
				color: var(--nord13);
				font-size: 1.3rem;
			}
		</style>
	</head>

	<body>
		<main>
			<h1>簡易點名系統</h1>
			<h2 id="status">歡迎使用</h2>
			<nav><button onclick="searchA()">查詢紀錄</button><button onclick="callA()">點名</button><button onclick="addA()">新增學生</button></nav>
			<section>
				<div id="history">
					<div class="search"><input type="text" /><button>搜尋</button></div>
					<table>
						<thead>
							<tr>
								<td>時間</td>
								<td>剩下課堂</td>
							</tr>
						</thead>
						<tbody></tbody>
					</table>
				</div>
				<div id="call">
					<h2>載入中</h2>
				</div>
				<div id="add">
					<div class="search"><input type="text" /><button>新增</button></div>
				</div>
			</section>
			<footer>
				<a href="edit-mr.github.io/">毛哥EM</a>製作 |
				<a href="https://emtech.cc/post/roll-call">教學</a>
			</footer>
		</main>
		<script>
			//部屬連結放這裡
			var url = "https://script.google.com/macros/s/AKfycbzxqGIMBbLkCka2aveltdVHYtdG-k_X98qzSd_V9MHDxWaOYXFwZgE3rRHDzCakzTxs/exec";
			const [history, call, add] = ["history", "call", "add"].map(t => document.getElementById(t)),
				searchA = () => {
					((history.style.opacity = 1), (history.style.zIndex = 2), (call.style.opacity = add.style.opacity = 0), (call.style.zIndex = add.style.zIndex = 1));
				},
				callA = () => {
					((history.style.opacity = add.style.opacity = 0), (history.style.zIndex = add.style.zIndex = 1), (call.style.opacity = 1), (call.style.zIndex = 2));
				},
				addA = () => {
					((history.style.opacity = call.style.opacity = 0), (history.style.zIndex = call.style.zIndex = 1), (add.style.opacity = 1), (add.style.zIndex = 2));
				};
			fetch(url + "?type=list")
				.then(t => t.json())
				.then(t => {
					let e = document.getElementById("call");
					((e.innerHTML = ""),
						t.forEach((t, n) => {
							let a = document.createElement("button");
							((a.textContent = t.name),
								(a.id = `student-${n + 1}`),
								a.addEventListener("click", () => {
									rollCall(t.name, t.left, n + 1);
								}),
								e.appendChild(a));
						}));
				})
				.catch(t => console.error(t));
			const status = document.getElementById("status");
			function rollCall(t, e, n) {
				status.innerHTML = `${t} 點名中...`;
				var a = new Date(),
					a = a
						.toLocaleString("zh-TW", {
							year: "numeric",
							month: "2-digit",
							day: "2-digit",
							hour: "numeric",
							minute: "numeric",
							second: "numeric",
							hour12: !0
						})
						.replace("-", "/")
						.replace(" ", " ");
				fetch(url + `?type=call&name=${t}&time=${a}&remain=${e}`)
					.then(a => {
						a.ok
							? ((status.innerHTML = `${t} 已點名成功！剩餘課堂：${e - 1}`), (document.getElementById("student-" + n).style.backgroundColor = "var(--nord14)"))
							: ((status.innerHTML = `${t} 已點名失敗！剩餘課堂：${e}`), (document.getElementById("student-" + n).style.backgroundColor = "var(--nord11)"));
					})
					.catch(t => {
						status.innerHTML = `發生錯誤：${t}`;
					});
			}
			const searchBtn = document.querySelector("#history button"),
				searchInput = document.querySelector("#history input"),
				historyTableBody = document.querySelector("#history tbody");
			searchBtn.addEventListener("click", () => {
				status.innerHTML = "搜尋中...";
				let t = searchInput.value,
					e = `${e}?type=search&name=${encodeURIComponent(t)}`;
				fetch(e)
					.then(t => t.json())
					.then(t => {
						let e = document.querySelector("#history table tbody");
						((e.innerHTML = ""),
							t.forEach(t => {
								let n = document.createElement("tr"),
									a = document.createElement("td"),
									l = document.createElement("td");
								var r = new Date(t.time);
								((a.textContent = r
									.toLocaleString("zh-TW", {
										year: "numeric",
										month: "2-digit",
										day: "2-digit",
										hour: "numeric",
										minute: "numeric",
										second: "numeric",
										hour12: !0
									})
									.replace("-", "/")
									.replace(" ", " ")),
									(l.textContent = t.left),
									n.appendChild(a),
									n.appendChild(l),
									e.appendChild(n),
									(status.innerHTML = "搜尋完成"));
							}));
					})
					.catch(t => (status.innerHTML = t));
			});
			const addBtn = document.querySelector("#add button"),
				addInput = document.querySelector("#add input");
			addBtn.addEventListener("click", () => {
				let t = addInput.value;
				t &&
					((status.innerHTML = "新增中..."),
					fetch(`${url}?type=new&name=${encodeURIComponent(t)}`)
						.then(t => (status.innerHTML = "新增成功"))
						.catch(t => {
							status.innerHTML = t;
						}));
			});
		</script>
	</body>
</html>
```

請把[第 265 行](https://github.com/Edit-Mr/roll-call/blob/b694aec4381906980277b202fbc7909c95e2c544/index.html#L265)的雙引號裡面換成剛才複製的網頁應用程式網址，然後按下儲存。這樣你的網頁就完成了！你可以到網址`https://你的Github帳號.github.io/`來使用你的網頁。

#### Use this template

第二個方式也很簡單，請先到這個[Github 倉庫](https://github.com/Edit-Mr/roll-call)並點擊右上角的 Fork，或是 Use this template。倉庫名稱 Repository name 會成為你的網址 (例如：https://你的 Github 帳號.github.io/倉庫名稱)，然後點擊 Create repository from template。

請點擊檔案`index.html`並點擊右上角的鉛筆按鈕編輯，把[第 265 行](https://github.com/Edit-Mr/roll-call/blob/b694aec4381906980277b202fbc7909c95e2c544/index.html#L265)的雙引號裡面換成剛才複製的網頁應用程式網址，然後按下儲存。

然後再到你的倉庫裡面，點擊 Settings，然後點擊左邊的 Pages，把 Branch 改成 main，然後按下 Save，就完成了！

![Github Pages 設定](roll-call-pages.webp)

好啦，現在你的網頁就完成了！你可以到網址`https://你的Github帳號.github.io/倉庫名稱`來使用你的網頁。

### 自訂

這樣你的網頁就建立完成且可以使用了。如果你想客製化顏色的話可以修改 CSS。比如說如果你想改標題你可以修改[第 13 行](https://github.com/Edit-Mr/roll-call/blob/b694aec4381906980277b202fbc7909c95e2c544/index.html#L13)

```css
color: var(--nord7);
```

你可以改成任何顏色，例如：`color: red`，或是`color: #ff0000`，或是`color: rgb(255, 0, 0)`。

> 你可以 Google [colorpicker](https://www.google.com/search?q=colorpicker) 選取顏色，然後把 HEX 或是 RGB 的數字貼上去。

或是你可以使用預設的 Nord 顏色組。使用方式就是預設那樣，只要修改數字就好了。對應的顏色如下：

<p style="background-color: #2E3440;">--nord0: #2E3440;</p>
<p style="background-color: #3B4252;">--nord1: #3B4252;</p>
<p style="background-color: #434C5E;">--nord2: #434C5E;</p>
<p style="background-color: #4C566A;">--nord3: #4C566A;</p>
<p style="background-color: #D8DEE9;">--nord4: #D8DEE9;</p>
<p style="background-color: #E5E9F0;">--nord5: #E5E9F0;</p>
<p style="background-color: #ECEFF4;">--nord6: #ECEFF4;</p>
<p style="background-color: #8FBCBB;">--nord7: #8FBCBB;</p>
<p style="background-color: #88C0D0;">--nord8: #88C0D0;</p>
<p style="background-color: #81A1C1;">--nord9: #81A1C1;</p>
<p style="background-color: #5E81AC;">--nord10: #5E81AC;</p>
<p style="background-color: #BF616A;">--nord11: #BF616A;</p>
<p style="background-color: #D08770;">--nord12: #D08770;</p>
<p style="background-color: #EBCB8B;">--nord13: #EBCB8B;</p>
<p style="background-color: #A3BE8C;">--nord14: #A3BE8C;</p>
<p style="background-color: #B48EAD;">--nord15: #B48EAD;</p>

希望你喜歡這個網頁！如果你覺得這篇文章有幫助到你歡迎在[Instagram](https://instagram.com/em.tec.blog)或[Google 新聞](https://news.google.com/s/CBIwgtnWzKAB?sceid=TW:zh-Hant&sceid=TW:zh-Hant&r=11&oc=1)追蹤毛哥EM 資訊密技。如果你有任何問題，歡迎直接到毛哥EM 資訊密技的 Instagram 私訊我，我很樂意協助解決你的問題。
