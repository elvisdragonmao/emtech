---
authors: elvismao
tags: []
categories: [關於]
date: 2024-10-17
lastmod: 2026-04-15
description: 有朋自遠方來，不亦悅乎？
---

# 友情連結

## 有朋自遠方來，不亦悅乎？

與大佬們一起前進。

<div id="friends-sections"></div>

<script>
(async () => {
	const container = document.querySelector("#friends-sections");
	if (!container) return;

	const collator = new Intl.Collator(["en", "zh-Hant", "zh-Hans"], {
		numeric: true,
		sensitivity: "base"
	});

	const transparentPixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
	const resolveImageUrl = value => {
		if (!value) return transparentPixel;
		if (/^(https?:)?\/\//i.test(value) || value.startsWith("/")) return value;
		return `/static/friends/${value.replace(/^\.\//, "").split("/").map(encodeURIComponent).join("/")}`;
	};

	try {
		const response = await fetch("/static/friends/friends.json");
		if (!response.ok) {
			throw new Error(`Failed to load friends list: ${response.status}`);
		}

		const { sections = [] } = await response.json();

		sections.forEach(section => {
			const heading = document.createElement("h2");
			heading.textContent = section.title;
			container.appendChild(heading);

			const list = document.createElement("div");
			list.className = "friends";

			[...(section.friends || [])]
				.sort((left, right) => collator.compare(left.name, right.name))
				.forEach(friend => {
					const card = document.createElement("a");
					card.className = "friend";
					card.href = friend.url;

					const figure = document.createElement("figure");
					const image = document.createElement("img");
					image.src = resolveImageUrl(friend.image);
					image.alt = friend.name;
					image.loading = "lazy";

					const caption = document.createElement("figcaption");
					caption.textContent = friend.name;
					figure.append(image, caption);

					const content = document.createElement("div");
					const name = document.createElement("h3");
					name.textContent = friend.name;

					const description = document.createElement("p");
					description.textContent = friend.description;

					content.append(name, description);
					card.append(figure, content);
					list.appendChild(card);
				});

			container.appendChild(list);
		});
	} catch (error) {
		console.error("Failed to render friends list", error);
		const message = document.createElement("p");
		message.textContent = "朋友列表載入失敗，請稍後再試。";
		container.appendChild(message);
	}
})();
</script>

> [!NOTE]
>
> **一起呼！**
> 如果你也想要在這裡出現，歡迎透過右側任意一個方式聯繫我。提供給我照片、網址、簡介等資訊。
>
> 如果你有友列想要加我也歡迎告訴我喔！