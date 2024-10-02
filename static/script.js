const header = document.querySelector("header");
const footer = document.querySelector("footer");
let currentPage = "post",
    nextPosts = [];

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
                fetch(
                    //  next.getAttribute("href").replace("/p/", "/p/clean/") +
                    "/p/clean/microsoft-store.html"
                )
                    .then((response) => {
                        if (!response.ok)
                            throw new Error("Network response was not ok");
                        return response.text();
                    })
                    .then((data) => {
                        next.innerHTML = data;
                        initPost(next);
                    })
                    .catch((error) => {
                        console.error("Fetch failed", error);
                        next.classList.remove("loaded");
                    });
            }
        } else {
            let maxWidth = Math.min(1200, window.innerWidth - 64) - 32;
            let footerHeight = parseFloat(getComputedStyle(footer).height) + 64;
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
                console.log(next.getBoundingClientRect().top);
                next.style.overflow = "hidden";
                //  next.style.border = "var(--border)";
                next.style.height = `${Math.max(originalHeight, height)}px`;
                document.body.style.paddingBottom = "400vh";
            }
        }
    }
};

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

    page.querySelector(".aside-tags").innerHTML =
        document.querySelector(".aside-tags-loaded").innerHTML;
};
if (window.location.pathname.includes("/p/")) {
    initPost(document.querySelector(".post-page"));
} else {
    currentPage = "home";
    document.body.classList.remove("displayPost");
    startDonut();
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
        const postThumbnailRect = postThumbnail.getBoundingClientRect();
        fixedBox.classList.remove("centered");
        console.log(`${postThumbnailRect.width}px`);
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
        fixedBox.style.borderRadius = "var(--border-radius)";

        // scroll to the element position
        // calc the top offset if box compare to the top of the body
        setTimeout(() => {
            postThumbnail.style.visibility = "visible";
            hero.style.visibility = "visible";
            fixedBox.style.display = "none";
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

    const hero = a.closest("article").querySelector(".hero");

    const fixedBox = document.querySelector(".transition");
    if (hero) {
        console.log(hero);
        fixedBox.style.backgroundImage = hero.style.backgroundImage;
        console.log(hero.style.backgroundImage);
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
    }

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
    navigator.clipboard.writeText(codeText);
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

// Update uptime
const diffDays = Math.ceil(
    (new Date() - new Date("2021-06-04")) / (1000 * 60 * 60 * 24)
);
document.querySelector("#time p").textContent = `${Math.floor(
    diffDays / 365
)}年 ${diffDays % 365}天`;

const updatePostList = (category) => {
    // fetch from /meta/categories/${category}.json
    fetch(`/meta/categories/${category}.json`)
        .then((response) => response.json())
        .then((data) => {
            const posts = data;
            const postList = document.getElementById("posts");
            postList.innerHTML = "";
            for (const post of posts) {
                const article = document.createElement("article");
                // <a href="/tags/軟體分享">軟體分享</a>
                const tags = post.tags.map(
                    (tag) => `<a href="/tag/${tag}" class="tag">${tag}</a>`
                );
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
    <div class="post-categories">${post.categories.join(" ")}</div>
        <h3>${post.title}</h3>
    <div class="tags">${tags.join("")}</div>
</div>
`;
                postList.appendChild(article);
            }
        });
};

// Update post list when category is clicked
document.querySelectorAll("#categories a").forEach((a) => {
    a.addEventListener("click", () => {
        updatePostList(a.textContent);
    });
});

// Update post list when tag is clicked
document.querySelectorAll("#tags a").forEach((a) => {
    a.addEventListener("click", () => {
        updatePostList(a.textContent);
    });
});

updatePostList("精選");

document.body.addEventListener("click", (e) => {
    const a = e.target.closest("a"); // Find the closest <a> element (in case of nested elements)

    if (!a) return; // If no <a> was clicked, do nothing
    // if link ""
    if (a.getAttribute("target") !== "_blank") {
        if (a.getAttribute("href").startsWith("#")) return; // Allow internal anchor links
        e.preventDefault(); // Prevent the default link behavior
        if (a.getAttribute("href") === "") return;
        if (a.getAttribute("href").includes("/p/")) {
            switchToPost(a); // Handle post switch
            // check if there's a .hero image in the same article
        } else {
            switchToHome(); // Handle home switch
        }

        window.history.pushState(null, null, a.getAttribute("href")); // Modify the browser history
    }
});
