const header = document.querySelector("header");
const footer = document.querySelector("footer");
let currentPage = "post",
    nextPosts = [],
    asideTags;

let search = [];

// get read history page id and title from localStorage
let readHistory = JSON.parse(localStorage.getItem("readHistory")) || [];
// update read history list
const updateReadHistory = (id) => {
    if (id !== null && id !== undefined) readHistory.unshift(id);
    readHistory.forEach((item, index) => {
        if (item + "" == "null" || item + "" == "undefined") {
            readHistory.splice(index, 1);
        }
        // remove duplicate
        readHistory = readHistory.filter(
            (v, i, a) => a.findIndex((t) => t.id === v.id) === i
        );
    });
    localStorage.setItem("readHistory", JSON.stringify(readHistory));
    // get the latest 5 read history
    readHistory = readHistory.slice(0, 5);
    document.querySelectorAll(".recent").forEach((list) => {
        if (readHistory.length > 0)
            list.innerHTML =
                "<h2>近期瀏覽</h2>" +
                readHistory
                    .map(
                        (id) => `<h3><a href="/p/${id.id}">${id.title}</a></h3>`
                    )
                    .join("");
        else list.innerHTML = "";
    });
};

updateReadHistory();
const updateDate = (element) => {
    const diffDays = Math.ceil(
        (new Date() - new Date("2021-06-04")) / (1000 * 60 * 60 * 24)
    );
    element.textContent = `${Math.floor(diffDays / 365)}年 ${diffDays % 365}天`;
};

updateDate(document.querySelector(".home-page #time p"));

let x = 1760,
    z = 0,
    y = 0,
    donut;
const startDonut = () => {
    donut = setInterval(() => {
        (z += 0.07), (y += 0.03);
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
                    f =
                        0 |
                        (8 *
                            ((h * e - v * c * t) * n -
                                v * c * e -
                                h * t -
                                M * c * o)),
                    y = d + 80 * m;
                m < 22 &&
                    m >= 0 &&
                    d >= 0 &&
                    d < 79 &&
                    l > r[y] &&
                    ((r[y] = l), (a[y] = ".,-~:;=!*#$@"[f > 0 ? f : 0]));
            }
        }
        pre.innerHTML = a.join("");
    }, 50); /* JS by
  @housamz */
};

const loadArticleList = async (postList, category) => {
    return new Promise((resolve, reject) => {
        fetch(`/meta/${category}.json`)
            .then((response) => response.json())
            .then((data) => {
                const posts = data;
                postList.innerHTML = "";
                for (const post of posts) {
                    const article = document.createElement("article");
                    const tags = post.tags
                        ? post.tags.map(
                              (tag) =>
                                  `<a href="/tag/${tag}" class="tag">${tag}</a>`
                          )
                        : [];
                    const categories = post.categories
                        ? post.categories.map(
                              (category) =>
                                  `<a href="/category/${category}" class="category">${category}</a>`
                          )
                        : [];
                    article.innerHTML = `
                    <a href="/p/${post.id}"
        ><div
            class="hero"
            style="background-image: ${
                post.thumbnail ? `url(${post.thumbnail})` : "none"
            },${post.colors};
            "
        ></div
    ></a>
    <div class="info">
        <div class="post-categories">${categories.join(" ")}</div>
            <a href="/p/${post.id}"
        ><h3>${post.title}</h3></a>
        <div class="tags">${tags.join(" ")}</div>
    </div>
    `;
                    postList.appendChild(article);
                    resolve();
                }
            });
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
            if (
                nextTop < window.innerHeight * 2 &&
                !next.classList.contains("loaded")
            ) {
                next.classList.add("loaded");
                // find random post with same tag but not read yet

                // Traverse backwards to find the closest <header> sibling
                let headerSibling = next.previousElementSibling;
                while (headerSibling && headerSibling.tagName !== "HEADER") {
                    headerSibling = headerSibling.previousElementSibling;
                }
                const category = headerSibling.querySelectorAll(".header-tag");
                const categories = Array.from(category).map(
                    (a) => a.textContent
                );
                let randomPost = null;
                // go through from first category to last, find the first post not read in localStorage
                (async () => {
                    // Use Promise.all to wait for all fetch requests
                    const fetchPromises = categories.map(async (category) => {
                        const response = await fetch(
                            `/meta/tag/${category}.json`
                        );
                        const posts = await response.json();
                        for (const post of posts) {
                            if (
                                !readHistory.find((item) => item.id === post.id)
                            ) {
                                randomPost = post;
                                next.previousElementSibling.innerHTML =
                                    "有關" + category + " 的其他文章";
                                break;
                            }
                        }
                    });

                    // Wait for all fetches to complete
                    await Promise.all(fetchPromises);

                    // Check if a post has been found after all fetches
                    if (!randomPost && search.length > 0) {
                        next.previousElementSibling.innerHTML =
                            "這系列你都看過了，推薦一篇給你!";
                        randomPost =
                            search[Math.floor(Math.random() * search.length)];
                    }

                    if (!randomPost) {
                        next.previousElementSibling.innerHTML =
                            "沒有更多文章了";
                        next.classList.remove("loaded");
                    }

                    fetch(
                        //  next.getAttribute("href").replace("/p/", "/p/clean/") +
                        "/p/clean/" + randomPost.id + ".html"
                    )
                        .then((response) => {
                            if (!response.ok)
                                throw new Error("Network response was not ok");
                            return response.text();
                        })
                        .then((data) => {
                            next.innerHTML = data;
                            initPost(next);
                            window.history.pushState(
                                null,
                                null,
                                `/p/${randomPost.id}`
                            );
                        })
                        .catch((error) => {
                            console.error("Fetch failed", error);
                            next.classList.remove("loaded");
                        });
                })();
            }
        } else {
            let maxWidth = Math.min(1200, window.innerWidth - 64) - 32;
            let footerHeight = parseFloat(getComputedStyle(footer).height) + 32;
            let originalHeight = Math.min(
                400,
                window.innerHeight - footerHeight
            );
            let toMove = window.innerHeight - originalHeight;
            let canMove = window.innerHeight - originalHeight - footerHeight;
            let height =
                originalHeight + (toMove / canMove) * (canMove - nextTop);
            let width = Math.max(
                maxWidth,
                maxWidth +
                    ((window.innerWidth - maxWidth) / canMove) *
                        (canMove - nextTop)
            );
            let scale = width / window.innerWidth;
            if (height > window.innerHeight) {
                next.style = "";
                //   document.body.style.paddingBottom = "1rem";
            } else {
                next.style.setProperty("--scale", scale);
                next.style.setProperty("--scaleWidth", "100vw");
                next.style.width = `${width}px`;
                next.style.overflow = "hidden";
                //  next.style.border = "var(--border)";
                next.style.height = `${Math.max(originalHeight, height)}px`;
                document.body.style.paddingBottom = "400vh";
            }
        }
    }
};

const updatePostList = async (category) => {
    let delay = currentPage == "home" ? 0 : 500;
    document.querySelector(".categories-title").textContent =
    decodeURI(category.split("/")[1]);
    await loadArticleList(document.getElementById("posts"), category);
    setTimeout(() => {
        document.getElementById("categories").scrollIntoView({
            behavior: "smooth"
        });
    }, delay);
};

// use url to get current page include /p/
window.addEventListener("scroll", postScrollAnimations);
const initPost = (page) => {
    currentPage = "post";
    document.body.classList.add("displayPost");

    // highlight current h2 in .post-content and put in .toc
    const postContent = page.querySelector(".post-content");
    const toc = page.querySelector(".toc");
    const ul = document.createElement("ul");
    // Find all h2 elements in .post-content
    const headers = Array.from(postContent.querySelectorAll("h2"));

    // Create a list item for each h2 and add it to the table of contents
    headers.forEach((header, index) => {
        const listItem = document.createElement("li");
        const link = document.createElement("a");

        // Set the href to the id of the h2, and the text to the h2's text
        link.href = `#${header.id}`;
        link.textContent = header.textContent;

        listItem.appendChild(link);
        ul.appendChild(listItem);
    });

    toc.appendChild(ul);

    // Create an intersection observer to highlight the current section in the table of contents
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    const tocItem = toc.querySelector(`a[href="#${id}"]`);
                    if (tocItem) {
                        toc.querySelectorAll("a").forEach((a) =>
                            a.classList.remove("current")
                        );
                        tocItem.classList.add("current");
                    }
                }
            });
        },
        { rootMargin: "0% 0% -80% 0%" }
    );

    // Observe each h2 element
    headers.forEach((header) => observer.observe(header));

    page.querySelectorAll("h2").forEach((h2) => {
        observer.observe(h2);
    });
    nextPosts.push(page.querySelector(".next-post"));
    if (asideTags) page.querySelector(".aside-tags").innerHTML = asideTags;
    updateDate(page.querySelector("#time p"));
    const id = page.querySelector(".post").getAttribute("data-id");
    const title = page.querySelector(".post-header h1").textContent;
    if (title && id) updateReadHistory({ id, title });
    const cat = page.querySelector(".header-categorie").textContent;
    const related = page.querySelector(".related-posts");
    // update .related-posts
    loadArticleList(related.querySelector("div"), "category/" + cat);
    related.querySelector("h2").textContent = cat + " 的其他文章";
};
if (window.location.pathname.includes("/p/")) {
    initPost(document.querySelector(".post-page"));
} else {
    currentPage = "home";
    document.body.classList.remove("displayPost");
    startDonut();
    if(window.location.pathname.includes("/category/") || window.location.pathname.includes("/tag/")) 
    updatePostList(// all the url after the domain
        window.location.pathname.slice(1)
    );
}

const switchToHome = () => {
    if (currentPage === "home") document.body.classList = "toHome";
    else document.body.classList.add("toHome");
    currentPage = "home";
    nextPosts = [];
    startDonut();
    window.removeEventListener("scroll", postScrollAnimations);
    // document.body.style.paddingBottom = "1rem";
    setTimeout(() => {
        document.body.classList.remove("displayPost");
        window.scrollTo(0, 0);
        document.body.classList.remove("toHome");
    }, 500);
};

const switchToPost = (a) => {
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
        postThumbnail.style.visibility = "hidden";
        document.body.classList.add("displayPost");
        document.body.classList.remove("toPost");
        if (postThumbnail.getAttribute("src") !== "") {
            const postThumbnailRect = postThumbnail.getBoundingClientRect();
            fixedBox.classList.remove("centered");
            fixedBox.style.width = `${postThumbnailRect.width}px`;
            fixedBox.style.height = `${postThumbnailRect.height}px`;
            fixedBox.style.left = `${
                postThumbnailRect.left + postThumbnailRect.width / 2
            }px`;
            fixedBox.style.top = `${
                postThumbnailRect.top +
                postThumbnailRect.height / 2 +
                window.scrollY
            }px`;
        } else {
            fixedBox.style.width = "0";
            fixedBox.style.height = "0";
        }
        fixedBox.style.borderRadius = "var(--border-radius)";

        // scroll to the element position
        // calc the top offset if box compare to the top of the body
        setTimeout(() => {
            if (hero) hero.style.visibility = "visible";
            fixedBox.style.display = "none";

            postThumbnail.style.visibility = "visible";
            initPost(document.querySelector(".post-page"));
        }, 500); // Match the duration of the animation (0.3s)
    };
    // fetch post content
    const fetchPostContent = (url, retries = 3000) => {
        fetch(url)
            .then((response) => {
                document
                    .querySelector(".transition")
                    .classList.remove("belive");
                if (!response.ok)
                    throw new Error("Network response was not ok");
                return response.text();
            })
            .then((data) => {
                document.querySelector(".post-page").innerHTML = data;
                showPostContent();
                nextPosts = [document.querySelector(".post-page")];
            })
            .catch((error) => {
                document.querySelector(".transition").classList.add("belive");
                const retryDelay = retries * 1.5;
                console.error(
                    `Fetch failed, retrying in ${retryDelay / 1000} seconds...`,
                    error
                );
                setTimeout(() => fetchPostContent(url, retries), retryDelay);
            });
    };

    fetchPostContent(
        a.getAttribute("href").replace("/p/", "/p/clean/") + ".html"
    );
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
        document.body.style.paddingBottom = "100vh";
        setTimeout(() => {
            fixedBox.classList.add("smooth");
            fixedBox.style.borderRadius = "1.875rem";
            fixedBox.classList.add("centered");
        }, 10);
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

const pre = document.createElement("pre");
const playground = document.getElementById("header-playground");
playground.appendChild(pre);

// copy button
function copyCode(button) {
    const codeBlock = button.previousElementSibling.querySelector("code");
    const codeLines = codeBlock.querySelectorAll(".cl");
    let codeText = "";
    codeLines.forEach((line) => {
        codeText += line.textContent + "\n";
    });

    navigator.clipboard.writeText(codeText).then(() => {
        button.style.background =
            "url(/static/img/check.svg) no-repeat center center, #ffffff10";
        setTimeout(() => {
            button.style = "bluh";
        }, 2000);
    });
}

// when link is pressed and is not target_blank, prevent default and switch to home

const categoriesMove = (direction) => {
    const categories = document.getElementById("categories");
    categories.scrollTo({
        left: categories.scrollLeft + 200 * direction,
        behavior: "smooth"
    });
};

// get tags from /meta/tags.json
fetch("/meta/tags.json")
    .then((response) => response.json())
    .then((data) => {
        const tags = data.tags;
        const categories = data.categories;
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
        for (const [category, count] of Object.entries(categories)) {
            const a = document.createElement("a");
            a.href = `/category/${category}`;
            a.textContent = `${category}`;
            categoriesElement.appendChild(a);
        }
        const first = categoriesElement.querySelector("a");
        categoriesElement.insertBefore(
            categoriesElement.querySelector("a[href='/category/精選']"),
            first
        );
    });

updatePostList("category/精選");

document.body.addEventListener("click", (e) => {
    let a = e.target.closest("a"); // Find the closest <a> element (in case of nested elements)
    if (!a) return; // If no <a> was clicked, do nothing

    if (a.getAttribute("target") !== "_blank") {
        if (a.getAttribute("href").startsWith("#")) return; // Allow internal anchor links
        e.preventDefault();
        if (a.getAttribute("href") === "") return;
        if (a.getAttribute("href") === "/") {
            switchToHome();
        } else if (a.getAttribute("href").includes("/p/")) {
            switchToPost(a); // Handle post switch
            // check if there's a .hero image in the same article
        } else if (a.getAttribute("href").includes("/category/")) {
            updatePostList("category/" + a.textContent);
            if (currentPage !== "home") switchToHome();
        } else if (a.getAttribute("href").includes("/tag/")) {
            updatePostList("tag/" + a.getAttribute("href").split("/tag/")[1]);
            if (currentPage !== "home") switchToHome();
        } else if (a.getAttribute("href") === "/random") {
            // get random post id from search.json
            const randomId =
                search[Math.floor(Math.random() * search.length)].id;
            a = document.createElement("a");
            a.setAttribute("href", `/p/${randomId}`);
            switchToPost(a);
        } else window.open(a.getAttribute("href"));

        window.history.pushState(null, null, a.getAttribute("href")); // Modify the browser history
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
    .then((response) => response.json())
    .then((data) => {
        search = data;
        if (window.location.pathname === "/random") {
            const randomId =
                search[Math.floor(Math.random() * search.length)].id;
            a = document.createElement("a");
            a.setAttribute("href", `/p/${randomId}`);
            switchToPost(a);
            window.history.pushState(null, null, `/p/${randomId}`);
        }
        const latest = document.querySelector("a:has(.header-newPost)");
        fetch(`/p/meta/${search[0].id}.json`)
            .then((response) => response.json())
            .then((data) => {
                // {
                //     "authors": "elvismao",
                //     "tags": [
                //       "HTML",
                //       "CSS"
                //     ],
                //     "series": [
                //       "不用庫 也能酷 - 玩轉 CSS & Js 特效"
                //     ],
                //     "date": 1694822400000,
                //     "title": "Day2 如何打的更快 | Emmet &amp; 預測輸入",
                //     "description": "記得我在國一寫HTML的時候，傻傻的在那裡打小於、h1、大於、標題、小於、斜線、大於。我的朋友甚至發現了一個偷吃步就是先打好一堆大於小於，然後再填空。",
                //     "length": 1656,
                //     "lastUpdated": "2024-10-15T03:20:38.489Z",
                //     "readingTime": "6 min",
                //     "id": "2023ironman-2",
                //     "thumbnail": ""
                //   }
                latest.href = `/p/${data.id}`;
                latest.querySelector("h3").textContent = data.title;
                latest.querySelector("img").src = data.thumbnail;
            });
    });

// if user refresh page, scroll to top
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

console.log(`
    　　　　　 ／＞　　 フ
    　　　　　|  　_　_ l
    　 　　　／\` ミ_꒳ノ
    　　 　 /　　　 　 |
    　　　 /　 ヽ　　 ﾉ
    　 　 │　　|　|　|
    　／￣|　　 |　|　|
    　| (￣ヽ＿_ヽ_)__)
    　＼二つ
    emtech.cc is generated with emblog by Elvis Mao
    https://github.com/Edit-Mr/emblog
    `);
