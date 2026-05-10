---
authors: elvismao
tags: []
categories: []
date: 2026-03-02
description:
draft: true
---

# macOS 初始設定

以下是我拿到一台 MacBook 之後會進行的各種初始設定。

## 安裝安裝軟體的軟體

### brew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Ghostty

```bash
brew install --cask ghostty
```

## 安裝軟體

## 設定

### git

```bash
git config --global user.name "Elvis Mao"
git config --global user.email "info@elvismao.com"

echo .DS_Store >> ~/.gitignore_global
git config --global core.excludesfile ~/.gitignore_global

git config pull.rebase true
```
