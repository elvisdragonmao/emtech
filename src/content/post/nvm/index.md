---
title:
authors: elvismao
tags: []
categories: []
date: 2026-04-02
description: 今天我們要來講怎麼安裝 nvm、Node.js 和 pnpm。
draft: true
---

# 安裝 nvm / Node.js / 與 pnpm

> 今日目標：完成下禮拜需要的環境建置、搞懂 JS 非同步，並建立一套完整的 SEO 基礎觀念與實作框架。

| 時間        | 主題                                           | 重點                                                 |
| ----------- | ---------------------------------------------- | ---------------------------------------------------- |
| 0:00 - 0:20 | 第一章：環境建置                               | 安裝 Node.js、理解版本管理、用 Corepack 啟用 pnpm    |
| 0:20 - 1:00 | 第二章：JavaScript 非同步                      | 同步 vs 非同步、callback、Promise、async/await       |
| 1:00 - 2:00 | 第三章 A：SEO 基礎與技術 SEO                   | 搜尋引擎怎麼看網站、檢索/索引/排名、技術面           |
| 2:00 - 3:00 | 第三章 B：內容 SEO、JavaScript SEO、分析與實戰 | 標題、內容策略、結構化資料、Search Console、常見錯誤 |

## 第一章：安裝 Node.js

我們今天要先來做幾件事來安裝 Node.js，搞不好你在前面的課程已經完成了呢！

- 首先我們需要安裝管理 Node.js 的 nvm（Node Version Manager），這樣我們就可以輕鬆切換不同版本的 Node.js。
- 接著我們要用用來管理套件的 npm 安裝一個管理管理套件的工具叫做 Corepack。
- 最後我們要用這個來管理管理套件的工具 Corepack 來啟用一個管理套件的工具叫做 pnpm。

> [!NOTE]
>
> 提醒
>
> 如果你的電腦裡面本來就有 Node.js，建議先把它移除掉，避免版本衝突。

### nvm

#### macOS

打開你的終端機軟體，然後輸入以下指令來安裝 nvm：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
```

#### 1-3 Windows

[NVM for Windows](https://github.com/coreybutler/nvm-windows) 有提供安裝工具，可以直接到 [Release 下載](https://github.com/coreybutler/nvm-windows/releases) `nvm-setup.exe` 然後一路下一步就可以囉。

#### 安裝指定版本

安裝 Node.js 24 版本，並切換到這個版本：

```bash
nvm install 24
nvm use 24
```

測試一下：

```bash
node -v
```

是不是輸出類似這樣的東西：

```
v24.13.1
```

### 1-4 用 Corepack 啟用 pnpm

為了怕你電腦中有舊版本的 npm，建議先全域安裝 Corepack：

```bash
npm install -g corepack
```

首先我們要先啟用 Corepack 來管理 pnpm：

```bash
corepack enable pnpm
```

#### 檢查 pnpm

```bash
pnpm -v
```

這裡他可能會請你安裝告訴你會用硬碟多少空間，這邊點擊 `Y` 就好。
