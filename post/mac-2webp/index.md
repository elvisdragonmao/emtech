---
authors: elvismao
tags: []
categories: []
date: 2025-03-02
description: 
draft: true
---

# 

```bash
for file
do
  /opt/homebrew/bin/ffmpeg -y -i "$file" -vf "fps=8" "${file%.*}.gif"
done
```


```bash
for file
do
  /opt/homebrew/bin/cwebp -lossless -quiet "$file" -o "${file%.*}.webp"
done
```