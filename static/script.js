const header = document.querySelector("header");
const footer = document.querySelector("footer");
let currentPage = "post",
	nextPosts = [],
	asideTags,
	categories = {};
let search = [];

// get read history page id and title from localStorage
let readHistory = JSON.parse(localStorage.getItem("readHistory")) || [];
// get Url check is it localhost
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const startAds = isLocalhost ? () => {} : () => (adsbygoogle = window.adsbygoogle || []).push({});

// update read history list
const updateReadHistory = id => {
	if (id !== null && id !== undefined) readHistory.unshift(id);
	readHistory.forEach((item, index) => {
		if (item + "" == "null" || item + "" == "undefined") {
			readHistory.splice(index, 1);
		}
		// remove duplicate
		readHistory = readHistory.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
	});
	localStorage.setItem("readHistory", JSON.stringify(readHistory));
	// get the latest 5 read history
	readHistory = readHistory.slice(0, 5);
	document.querySelectorAll(".recent").forEach(list => {
		if (readHistory.length > 0) list.innerHTML = "<h2>近期瀏覽</h2>" + readHistory.map(id => `<h3><a href="/p/${id.id}">${id.title}</a></h3>`).join("");
		else list.innerHTML = "";
	});
};

const updateDate = element => {
	const diffDays = Math.ceil((new Date() - new Date("2021-06-04")) / (1000 * 60 * 60 * 24));
	element.textContent = `${Math.floor(diffDays / 365)}年 ${diffDays % 365}天`;
};

updateDate(document.querySelector(".home-page #time p"));
updateReadHistory();

const pre = document.createElement("pre");
document.getElementById("header-playground").appendChild(pre);

let x = 1760,
	z = 0,
	y = 0,
	donut;
const startDonut = () => {
	donut = setInterval(() => {
		((z += 0.07), (y += 0.03));
		const a = [...new Array(x)].map((a, r) => (r % 80 === 79 ? "\n" : " ")),
			r = new Array(x).fill(0),
			t = Math.cos(z),
			e = Math.sin(z),
			n = Math.cos(y),
			o = Math.sin(y);
		for (let s = 0; s < 6.28; s += 0.07) {
			const c = Math.cos(s),
				h = Math.sin(s);
			for (let s = 0; s < 6.28; s += 0.02) {
				const v = Math.sin(s),
					M = Math.cos(s),
					i = c + 2,
					l = 1 / (v * i * e + h * t + 5),
					p = v * i * t - h * e,
					d = 0 | (40 + 30 * l * (M * i * n - p * o)),
					m = 0 | (12 + 15 * l * (M * i * o + p * n)),
					f = 0 | (8 * ((h * e - v * c * t) * n - v * c * e - h * t - M * c * o)),
					y = d + 80 * m;
				m < 22 && m >= 0 && d >= 0 && d < 79 && l > r[y] && ((r[y] = l), (a[y] = ".,-~:;=!*#$@"[f > 0 ? f : 0]));
			}
		}
		pre.innerHTML = a.join("");
	}, 50); /* JS by
  @housamz */
};

// aos
const isElementInViewport = el => {
	const rect = el.getBoundingClientRect();
	return rect.bottom < 0 || rect.top > window.innerHeight;
};

const addClassToVisibleElements = () => {
	const aosElements = document.querySelectorAll(".aos");
	aosElements.forEach(function (aosElement) {
		if (!isElementInViewport(aosElement)) aosElement.classList.add("ed");
		else aosElement.classList.remove("ed");
	});
};

document.addEventListener("scroll", addClassToVisibleElements);
addClassToVisibleElements();

const loadArticleList = async (postList, category) => {
	return new Promise((resolve, reject) => {
		fetch(`/meta/${category}.json`)
			.then(response => response.json())
			.then(async data => {
				let posts = data;
				if (decodeURIComponent(category) == "category/精選") {
					// Wait for search data to be loaded using a Promise
					// fetch /meta/latest.json
					const latest = await fetch("/meta/latest.json");
					const latestData = await latest.json();

					posts = [...latestData.slice(0, 4), ...data];
					// remove duplicate
					posts = posts.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
					let i = 5;
					while (posts.length < 12) {
						posts.push(latestData[i]);
						i++;
					}
				}
				postList.innerHTML = "";
				for (const post of posts) {
					const article = document.createElement("article");
					article.classList.add("aos");
					article.setAttribute("data-aos", "fade-up");
					const tags = post.tags ? post.tags.map(tag => `<a href="/tag/${tag}" class="tag">${tag}</a>`) : [];
					const postCategories = post.categories ? post.categories.map(category => `<a href="/category/${category}" class="category">${category}</a>`) : [];
					article.innerHTML = `
                    <a href="/p/${post.id}" aria-label="${post.title}"
        ><div
            class="hero"
            style="background-image: ${post.thumbnail ? `url(${post.thumbnail})` : "none"},${post.colors ? post.colors : "none"};
            "
        ></div
    ></a>
    <div class="info">
        <div class="post-categories">${postCategories.join(" ")}</div>
            <a href="/p/${post.id}"
        ><h3>${post.title}</h3></a>
        <div class="tags">${tags.join(" ")}</div>
    </div>
    `;
					postList.appendChild(article);
				}
				addClassToVisibleElements();
				resolve();
			})
			.catch(reject);
	});
};

const postScrollAnimations = () => {
	if (header.getBoundingClientRect().bottom < 0) {
		document.body.classList.add("nav-sticky");
	} else {
		document.body.classList.remove("nav-sticky");
	}
	for (const next of nextPosts) {
		const nextTop = next.getBoundingClientRect().top;
		if (nextTop > window.innerHeight) {
			next.style = "";
			if (nextTop < window.innerHeight * 2 && !next.classList.contains("loaded")) {
				next.classList.add("loaded");
				// find random post with same tag but not read yet
				// Traverse backwards to find the closest <header> sibling
				let headerSibling = next.previousElementSibling;
				while (headerSibling && headerSibling.tagName !== "HEADER") {
					headerSibling = headerSibling.previousElementSibling;
				}
				const category = headerSibling.querySelectorAll(".header-tag");
				const postCategories = Array.from(category).map(a => a.textContent);
				let randomPost = null;
				// go through from first category to last, find the first post not read in localStorage
				(async () => {
					// Use Promise.all to wait for all fetch requests
					const fetchPromises = postCategories.map(async category => {
						const response = await fetch(`/meta/tag/${category}.json`);
						const posts = await response.json();
						for (const post of posts) {
							if (!readHistory.find(item => item.id === post.id)) {
								randomPost = post;
								next.previousElementSibling.innerHTML = "有關" + (/^[a-zA-Z]/.test(category) ? " " : "") + category + " 的其他文章";
								break;
							}
						}
					});

					// Wait for all fetches to complete
					await Promise.all(fetchPromises);

					// Check if a post has been found after all fetches
					if (!randomPost && search.length > 0) {
						next.previousElementSibling.innerHTML = "這系列你都看過了，推薦一篇給你！";
						randomPost = search[Math.floor(Math.random() * search.length)];
					}

					if (!randomPost) {
						next.previousElementSibling.innerHTML = "沒有更多文章了";
						next.classList.remove("loaded");
					}

					fetch("/p/clean/" + randomPost.id + ".html")
						.then(response => {
							if (!response.ok) throw new Error("Network response was not ok");
							return response.text();
						})
						.then(data => {
							next.innerHTML = data;
							initPost(next);
						})
						.catch(error => {
							console.error("Fetch failed", error);
							next.classList.remove("loaded");
						});
				})();
			}
		} else {
			let originalHeight, scale, height, width;
			if (!next.classList.contains("main-container")) {
				let maxWidth = Math.min(1200, window.innerWidth - 64) - 32;
				let footerHeight = parseFloat(getComputedStyle(footer).height) + 32;
				originalHeight = Math.min(400, window.innerHeight - footerHeight);
				let toMove = window.innerHeight - originalHeight;
				let canMove = window.innerHeight - originalHeight - footerHeight;
				height = originalHeight + (toMove / canMove) * (canMove - nextTop);
				width = Math.max(maxWidth, maxWidth + ((window.innerWidth - maxWidth) / canMove) * (canMove - nextTop));
				scale = width / window.innerWidth;
			} else height = window.innerHeight + 1; // 直接上第一篇過
			if (height > window.innerHeight) {
				next.style = "";

				// 已經滾動到下一篇
				// contiune.bottom > 0
				// top < 0
				if (
					// 第一篇文章 || 後面的文章已經超過
					(next.classList.contains("main-container") || nextTop < 0) &&
					// 還沒滾動到最底
					next.querySelector(".continue")?.getBoundingClientRect().bottom > 0
				) {
					next.style = "";
					if (!next.getAttribute("data-id")) next.setAttribute("data-id", next.querySelector(".post").getAttribute("data-id"));
					const nextID = next.getAttribute("data-id");
					if (nextID !== null && nextID !== readHistory[0].id) {
						window.history.pushState(null, null, `/p/${nextID}`);
						const title = next.querySelector(".post-header h1").textContent;
						updateReadHistory({
							id: nextID,
							title
						});
						document.title = title + " | 毛哥EM 資訊密技";
					}
				}
			} else {
				next.style.setProperty("--scale", scale);
				next.style.setProperty("--scaleWidth", "100vw");
				next.style.width = `${width}px`;
				next.style.overflow = "hidden";
				next.style.boxShadow = "0 8px 16px -4px #2c2d306e";
				next.style.height = `${Math.max(originalHeight, height)}px`;
			}
		}
	}
};

const updatePostList = async (category, scroll = true) => {
	let delay = currentPage == "home" ? 0 : 500;
	document.querySelector(".categories-title").textContent = decodeURI(category.split("/")[1]);
	const des = categories[decodeURI(category.split("/")[1])] ? categories[decodeURI(category.split("/")[1])].description : "";
	if (des) {
		document.querySelector(".categories-description").innerHTML = des;
		document.querySelector(".categories-description").style.display = "block";
	} else {
		document.querySelector(".categories-description").style.display = "none";
	}
	document.querySelector(".categories-title").classList.add("loading");
	await loadArticleList(document.getElementById("posts"), category);
	document.querySelector(".categories-title").classList.remove("loading");
	if (scroll)
		setTimeout(() => {
			document.getElementById("categories").scrollIntoView({
				behavior: "smooth"
			});
		}, delay);
};

// use url to get current page include /p/
window.addEventListener("scroll", postScrollAnimations);
const initPost = (page, direct = false) => {
	currentPage = "post";
	document.body.classList.add("displayPost");

	// Table of contents
	// highlight current h2 in .post-content and put in .toc
	const postContent = page.querySelector(".post-content");
	const toc = page.querySelector(".toc");
	const ul = document.createElement("ul");
	// Find all h2 elements in .post-content
	const headers = Array.from(postContent.querySelectorAll("h2"));
	let adsCount = 0;
	// Create a list item for each h2 and add it to the table of contents
	headers.forEach((header, index) => {
		const listItem = document.createElement("li");
		const link = document.createElement("a");
		// Set the href to the id of the h2, and the text to the h2's text
		link.href = `#${header.id}`;
		link.textContent = header.textContent;
		listItem.appendChild(link);
		ul.appendChild(listItem);
		adsCount++;
		if (!isLocalhost && adsCount > 2 && adsCount % 2 === 1)
			header.insertAdjacentHTML(
				"beforebegin",
				`<ins
                    class="adsbygoogle post-adsbygoogle"
                    data-ad-layout="in-article"
                    data-ad-format="fluid"
                    data-ad-client="ca-pub-9975357988525791"
                    data-ad-slot="1149587298"
                ></ins>`
			);
	});

	toc.appendChild(ul);

	// Create mobile TOC line indicators
	const tocLines = document.createElement("div");
	tocLines.className = "toc-lines";
	headers.forEach((header, index) => {
		const line = document.createElement("div");
		line.className = "toc-line";
		line.dataset.index = index;
		tocLines.appendChild(line);
	});
	toc.insertBefore(tocLines, toc.firstChild);

	startAds();
	// Create an intersection observer to highlight the current section in the table of contents
	const observer = new IntersectionObserver(
		entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const id = entry.target.id;
					const tocItem = toc.querySelector(`a[href="#${id}"]`);
					if (tocItem) {
						toc.querySelectorAll("a").forEach(a => a.classList.remove("current"));
						tocItem.classList.add("current");

						// Update mobile line indicators
						const currentIndex = Array.from(toc.querySelectorAll("a")).indexOf(tocItem);
						toc.querySelectorAll(".toc-line").forEach((line, index) => {
							if (index === currentIndex) {
								line.classList.add("active");
							} else {
								line.classList.remove("active");
							}
						});
					}
				}
			});
		},
		{ rootMargin: "0% 0% -80% 0%" }
	);
	headers.forEach(header => observer.observe(header));
	page.querySelectorAll("h2").forEach(h2 => {
		observer.observe(h2);
	});

	// update post title
	nextPosts.push(page.querySelector(".next-post"));
	if (asideTags) page.querySelector(".aside-tags").innerHTML = asideTags;
	updateDate(page.querySelector("#time p"));
	if (direct) {
		const id = page.querySelector(".post").getAttribute("data-id");
		const title = page.querySelector(".post-header h1").textContent;
		document.title = title + " | 毛哥EM 資訊密技";
		updateReadHistory({ id, title });
	}
	const cat = page.querySelector(".header-categorie").textContent;
	const related = page.querySelector(".related-posts");
	// update .related-posts
	loadArticleList(related.querySelector("div"), "category/" + cat);
	related.querySelector("h2").textContent = cat + " 的其他文章";

	startAds();
};

const moveCategories = category => {
	const a = document.querySelector("." + category);
	const postCategories = document.getElementById("categories");
	postCategories.style.setProperty("--offset", `${a.offsetLeft - 8}px`);
	postCategories.style.setProperty("--width", `${a.offsetWidth + 16}px`);
	// check the scroll amount of #categories, if the selected category is out of screen scroll to the right
	if (postCategories.scrollLeft + postCategories.offsetWidth < a.offsetLeft || postCategories.scrollLeft > a.offsetLeft) {
		postCategories.scrollTo({
			left: a.offsetLeft - 32,
			behavior: "smooth"
		});
	}
};

if (window.location.pathname.includes("/p/")) {
	initPost(document.querySelector(".post-page"), true);
	nextPosts.push(document.querySelector(".post-page"));
} else {
	currentPage = "home";
	document.body.classList.remove("displayPost");
	startDonut();
	if (window.location.pathname.includes("/category/") || window.location.pathname.includes("/tag/"))
		updatePostList(
			// all the url after the domain
			window.location.pathname.slice(1)
		);
	else {
		updatePostList("category/精選", false);
		if (window.location.pathname.includes("/search")) {
			document.title = "搜尋 | 毛哥EM 資訊密技";
			const searchKeyword = window.location.search.split("?q=")[1];
			if (searchKeyword) document.getElementById("search").value = decodeURIComponent(searchKeyword);
			document.getElementById("search-toggle").checked = true;
			// Trigger the input event to perform the search
			document.getElementById("search").dispatchEvent(new Event("input"));
		}
	}
}

const switchToHome = () => {
	if (currentPage === "home") document.body.classList = "toHome";
	else document.body.classList.add("toHome");
	if (window.location.pathname == "/") {
		updatePostList("category/精選", false);
		moveCategories("精選");
	}
	currentPage = "home";
	nextPosts = [];
	startDonut();
	window.removeEventListener("scroll", postScrollAnimations);
	// document.body.style.paddingBottom = "1rem";
	setTimeout(() => {
		window.scrollTo({
			top: 0,
			behavior: "instant"
		});
		document.body.classList.remove("displayPost");
		document.body.classList.remove("toHome");
		// document.body.style.paddingBottom = "0";
	}, 500);
};

const switchToPost = a => {
	// if (currentPage === "post") return;
	window.addEventListener("scroll", postScrollAnimations);
	currentPage = "post";
	document.body.classList.add("toPost");
	clearInterval(donut);
	let ready = false;

	const showPostContent = () => {
		if (!ready) {
			ready = true;
			return;
		}
		const postThumbnail = document.querySelector(".post-thumbnail");
		const postThumbnailContainer = document.querySelector(".post-thumbnail-container");
		postThumbnailContainer.style.opacity = "0"; // 實在不知道為甚麼 visibility: hidden 會卡住不會消失
		setTimeout(() => {
			document.body.classList.add("displayPost");
			document.body.classList.remove("toPost");
			if (postThumbnail.getAttribute("src") !== "") {
				const postThumbnailRect = postThumbnail.getBoundingClientRect();
				fixedBox.classList.remove("centered");
				fixedBox.style.width = `${postThumbnailRect.width}px`;
				fixedBox.style.height = `${postThumbnailRect.height}px`;
				fixedBox.style.left = `${postThumbnailRect.left + postThumbnailRect.width / 2}px`;
				fixedBox.style.top = `${postThumbnailRect.top + postThumbnailRect.height / 2 + window.scrollY}px`;
			} else {
				fixedBox.style.width = "0";
				fixedBox.style.height = "0";
			}
			fixedBox.style.borderRadius = "var(--border-radius)";

			// scroll to the element position
			// calc the top offset if box compare to the top of the body
			setTimeout(() => {
				if (hero) hero.style.visibility = "visible";
				postThumbnailContainer.style.opacity = "1";
				fixedBox.style.display = "none";
				initPost(document.querySelector(".post-page"));
			}, 500); // Match the duration of the animation (0.3s)
		}, 200);
	};
	// fetch post content
	const fetchPostContent = url => {
		const believe = document.querySelector(".believe");
		fetch(url)
			.then(response => {
				believe.innerHTML = "Patience is key in life...";
				if (!response.ok) throw new Error("Network response was not ok");
				return response.text();
			})
			.then(data => {
				document.querySelector(".post-page").innerHTML = data;
				showPostContent();
				nextPosts.push(document.querySelector(".post-page"));
			})
			.catch(error => {
				let retryDelay = 3;
				believe.innerHTML = `等等不太對，我 3 秒之後再試一次...`;

				const retryInterval = setInterval(() => {
					retryDelay--;
					believe.innerHTML = `等等不太對，我 ${retryDelay} 秒之後再試一次...`;
					if (retryDelay === 0) {
						believe.innerHTML = `嗯，你的網路有點爛...`;

						clearInterval(retryInterval);
						fetchPostContent(url);
					}
				}, 1000);
				console.error("Fetch failed", error);
			});
	};

	fetchPostContent(a.getAttribute("href").replace("/p/", "/p/clean/") + ".html");
	const fixedBox = document.querySelector(".transition");
	// check if hero exists a.closest("article").querySelector(".hero")

	const hero = a.closest("article")?.querySelector(".hero");
	if (hero) {
		fixedBox.style.backgroundImage = hero.style.backgroundImage;
		const rect = hero.getBoundingClientRect();
		fixedBox.classList.remove("smooth");
		fixedBox.style.width = `${rect.width}px`;
		fixedBox.style.height = `${rect.height}px`;
		hero.style.visibility = "hidden";
		fixedBox.style.display = "block";
		fixedBox.style.top = `${rect.top + rect.height / 2}px`;
		fixedBox.style.left = `${rect.left + rect.width / 2}px`;
		fixedBox.style.borderRadius = "1.875rem 1.875rem 0 0";
		// document.body.style.paddingBottom = "100vh";
		setTimeout(() => {
			fixedBox.classList.add("smooth");
			fixedBox.style.borderRadius = "1.875rem";
			fixedBox.classList.add("centered");
		}, 0);
		setTimeout(() => {
			showPostContent();
		}, 1000);
	} else
		setTimeout(() => {
			showPostContent();
		}, 500);

	setTimeout(() => {
		window.scrollTo(0, 0);
	}, 500);
};

// copy button
function copyCode(button) {
	const codeBlock = button.previousElementSibling.querySelector("code");
	const codeLines = codeBlock.querySelectorAll(".cl");
	let codeText = "";
	codeLines.forEach(line => {
		codeText += line.textContent + "\n";
	});

	navigator.clipboard.writeText(codeText).then(() => {
		button.style.background = "url(/static/img/check.svg) no-repeat center center, #ffffff10";
		setTimeout(() => {
			button.style = "bluh";
		}, 2000);
	});
}

// when link is pressed and is not target_blank, prevent default and switch to home

const categoriesMove = direction => {
	const postCategories = document.getElementById("categories");
	postCategories.scrollTo({
		left: postCategories.scrollLeft + 200 * direction,
		behavior: "smooth"
	});
};

// get tags from /meta/tags.json
fetch("/meta/tags.json")
	.then(response => response.json())
	.then(data => {
		const tags = data.tags;
		categories = data.categories;
		const tagsElement = document.querySelector(".aside-tags");
		tagsElement.classList.add("aside-tags-loaded");
		const categoriesElement = document.getElementById("categories");
		for (const [tag, count] of Object.entries(tags)) {
			const a = document.createElement("a");
			a.href = `/tag/${tag}`;
			a.innerHTML = `${tag}<div>${count}</div>`;
			tagsElement.appendChild(a);
		}
		asideTags = tagsElement.innerHTML;
		for (const [category] of Object.entries(categories)) {
			const a = document.createElement("a");
			a.href = `/category/${category}`;
			a.textContent = `${category}`;
			a.classList.add(category);
			categoriesElement.appendChild(a);
		}
		const first = categoriesElement.querySelector("a");
		categoriesElement.insertBefore(categoriesElement.querySelector("a[href='/category/精選']"), first);
		moveCategories("精選");
	});

document.body.addEventListener("click", e => {
	let a = e.target.closest("a"); // Find the closest <a> element (in case of nested elements)
	if (!a) return; // If no <a> was clicked, do nothing

	if (a.getAttribute("target") !== "_blank" && !e.ctrlKey && !e.metaKey) {
		window.history.pushState(null, null, a.getAttribute("href")); // Modify the browser history
		if (a.getAttribute("href").startsWith("#")) return; // Allow internal anchor links
		e.preventDefault();
		if (a.getAttribute("href") === "") return;
		if (a.getAttribute("href") === "/") {
			switchToHome();
			document.title = "毛哥EM 資訊密技";
		} else if (a.getAttribute("href").includes("/p/")) {
			switchToPost(a); // Handle post switch
			document.getElementById("search-toggle").checked = false;
		} else if (a.getAttribute("href").includes("/category/")) {
			updatePostList("category/" + a.textContent);
			document.title = a.textContent + " | 毛哥EM 資訊密技";
			if (currentPage !== "home") switchToHome();
			// check if the <a> pressed is the child of #categories
			moveCategories(a.textContent);
		} else if (a.getAttribute("href").includes("/tag/")) {
			const tagTitle = a.getAttribute("href").split("/tag/")[1];
			updatePostList("tag/" + tagTitle);
			document.title = tagTitle + " | 毛哥EM 資訊密技";
			if (currentPage !== "home") switchToHome();
		} else if (a.getAttribute("href") === "/random") {
			// get random post id from search.json
			const randomId = search[Math.floor(Math.random() * search.length)].id;
			a = document.createElement("a");
			a.setAttribute("href", `/p/${randomId}`);
			switchToPost(a);
		} else window.open(a.getAttribute("href"));
	}
});

window.addEventListener("popstate", function (event) {
	// create a fake a element with the current url and click it
	const a = document.createElement("a");
	a.href = window.location.href;
	a.click();
	// delete the fake a element
	a.remove();
});

// fetch /meta/search.json
fetch("/meta/search.json")
	.then(response => response.json())
	.then(data => {
		search = data;
		if (window.location.pathname === "/random") {
			const randomId = search[Math.floor(Math.random() * search.length)].id;
			let a = document.createElement("a");
			a.setAttribute("href", `/p/${randomId}`);
			switchToPost(a);
			window.history.pushState(null, null, `/p/${randomId}`);
		}
		const latest = document.querySelector("a:has(.header-newPost)");
		fetch(`/p/meta/${search[0].id}.json`)
			.then(response => response.json())
			.then(data => {
				latest.href = `/p/${data.id}`;
				latest.querySelector("h3").textContent = data.title;
				latest.querySelector("img").src = data.thumbnail;
				latest.querySelector("img").style.backgroundImage = data.colors;
			});
		document.getElementById("search").addEventListener("input", function () {
			const searchInput = this.value.trim().toLowerCase();
			const searchTerms = searchInput.split(/\s+/).filter(term => term.length > 0);
			const searchList = document.querySelector(".search-results");

			if (searchTerms.length === 0) {
				searchList.innerHTML = "";
				return;
			}

			// Calculate relevance score for each article
			const scoredArticles = search
				.map(article => {
					const title = article.title.toLowerCase();
					const description = article.description.toLowerCase();
					const id = article.id.toLowerCase();

					let score = 0;
					const matchedTerms = new Set();

					searchTerms.forEach(term => {
						if (title.includes(term)) {
							score += 3;
							matchedTerms.add(term);
						}
						if (description.includes(term)) {
							score += 2;
							matchedTerms.add(term);
						}
						if (id.includes(term)) {
							score += 1;
							matchedTerms.add(term);
						}
					});

					return {
						article,
						score,
						matchCount: matchedTerms.size
					};
				})
				.filter(item => item.score > 0);

			// Sort by number of matched terms first, then by score
			scoredArticles.sort((a, b) => {
				if (b.matchCount !== a.matchCount) {
					return b.matchCount - a.matchCount;
				}
				return b.score - a.score;
			});

			// Highlight matching terms function
			function highlightTerms(text, terms) {
				// Escape special regex characters in the terms
				const escapedTerms = terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

				// Create a single regex with all terms using alternation (|)
				const regex = new RegExp(`(${escapedTerms.join("|")})`, "gi");

				// Replace all matches at once
				return text.replace(regex, "<strong>$1</strong>");
			}
			document.querySelector(".google").innerHTML = `找不到你要的文章？試試 <a href="https://google.com/search?q=${searchInput} site:emtech.cc" target="_blank">Google</a> 吧！`;
			// Render results
			searchList.innerHTML = scoredArticles
				.map(({ article, matchCount }) => {
					const highlightedTitle = highlightTerms(article.title, searchTerms);
					const highlightedDescription = highlightTerms(article.description, searchTerms);

					return `
                            <a href="/p/${article.id}" 
                               class="search-result ${matchCount === searchTerms.length ? "full-match" : "partial-match"}">
                                <h3>${highlightedTitle}</h3>
                                <p>${highlightedDescription}</p>
                                ${matchCount < searchTerms.length ? `<div class=match>符合 ${matchCount}/${searchTerms.length} 個搜尋結果</div>` : ""}
                            </a>
                        `;
				})
				.join("");
		});
		document.getElementById("search").dispatchEvent(new Event("input"));
	});

// if user refresh page, scroll to top
window.onbeforeunload = function () {
	window.scrollTo(0, 0);
};

// when press ctrl + k oe cmd + k, toggle #search-toggle
document.addEventListener("keydown", e => {
	if ((e.ctrlKey && e.key === "k") || (e.metaKey && e.key === "k")) {
		e.preventDefault();
		document.getElementById("search-toggle").checked = !document.getElementById("search-toggle").checked;
		document.getElementById("search").focus();
	}

	// if escape key is pressed, close #search-toggle
	if (e.key === "Escape") {
		document.getElementById("search-toggle").checked = false;
	}
});
console.warn(
	"%c注意！",
	`font-size: 40px; background-color: #ebc405; color: #000;font-family:system-ui; 
  background-image: repeating-linear-gradient(
    45deg,
    #ebc405,
    #ebc405 10.7px,
    #000 10.7px,
    #000 21.4px,
    #000 21.4px
  );
    text-shadow: 1px -1px #FFF, 1px 1px #FFF, -1px -1px #FFF, -1px 1px #FFF;padding: 1rem;
    background-size: 30px 100%;font-weight: bold;`
);
console.log(`謝謝你的注意。

          ／＞   フ
         |   _ _ l
        ／\` ミ_꒳ノ
      /          |
      /   ヽ     ﾉ
      │   |  |  |
  ／￣|    |  |  |
  | (￣ヽ＿_ヽ_)__)
  ＼二つ
emtech.cc is generated with emblog by Elvis Mao`);
console.log("https://github.com/elvisdragonmao/emtech");
