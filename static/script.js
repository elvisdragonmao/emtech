const header = document.querySelector("header");
const footer = document.querySelector("footer");
const next = document.querySelector(".next-post");
let currentPage = "post";

const postScrollAnimations = () => {
    if (header.getBoundingClientRect().bottom < 0) {
        document.body.classList.add("nav-sticky");
    } else {
        document.body.classList.remove("nav-sticky");
    }
    let maxWidth = Math.min(1200, window.innerWidth - 64) - 32;
    let footerHeight =
        parseFloat(getComputedStyle(document.querySelector("footer")).height) +
        64;
    let originalHeight = Math.min(400, window.innerHeight - footerHeight);
    let toMove = window.innerHeight - originalHeight;
    let canMove = window.innerHeight - originalHeight - footerHeight;
    let height =
        originalHeight +
        (toMove / canMove) * (canMove - next.getBoundingClientRect().top);
    let width = Math.max(
        maxWidth,
        maxWidth +
            ((window.innerWidth - maxWidth) / canMove) *
                (canMove - next.getBoundingClientRect().top)
    );
    let scale = width / window.innerWidth;
    if (height > window.innerHeight) {
        next.style = "";
        footer.style.marginBottom = "1rem";
    } else {
        next.style.setProperty("--scale", scale);
        next.style.setProperty("--scaleWidth", "100vw");
        next.style.width = `${width}px`;
        next.style.overflow = "hidden";
        next.style.border = "var(--border)";
        next.style.height = `${Math.max(originalHeight, height)}px`;
        footer.style.marginBottom = "100vh";
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

if (window.location.pathname.includes("/p/")) {
    currentPage = "post";
    document.body.classList.add("displayPost");
    window.addEventListener("scroll", postScrollAnimations);

    // highlight current h2 in .post-content and put in .toc
    const postContent = document.querySelector(".post-content");
    const toc = document.querySelector(".toc");
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

    document.querySelectorAll("h2").forEach((h2) => {
        observer.observe(h2);
    });
} else {
    currentPage = "home";
    document.body.classList.remove("displayPost");
    startDonut();
}

const switchToHome = () => {
    if (currentPage === "home") return;
    currentPage = "home";
    document.body.classList.add("toHome");
    startDonut();
    window.removeEventListener("scroll", postScrollAnimations);
    footer.style.marginBottom = "1rem";
    // wait for .3s
    setTimeout(() => {
        document.body.classList.remove("displayPost");
        window.scrollTo(0, 0);
        document.body.classList.remove("toHome");
    }, 500);
};

const switchToPost = (a) => {
    if (currentPage === "post") return;
    currentPage = "post";
    document.body.classList.add("toPost");
    clearInterval(donut);
    const hero = a.closest("article").querySelector(".hero");
    if (hero) {
        const fixedBox = document.querySelector(".transition");
        const postThumbnail = document.querySelector(".post-thumbnail");
        fixedBox.style.backgroundImage = hero.style.backgroundImage;
        console.log(hero.style.backgroundImage);
        const rect = hero.getBoundingClientRect();
        fixedBox.classList.remove("smooth");
        fixedBox.style.width = `${rect.width}px`;
        fixedBox.style.height = `${rect.height}px`;
        hero.style.visibility = "hidden";
        postThumbnail.style.visibility = "hidden";
        fixedBox.style.display = "block";
        fixedBox.style.top = `${rect.top + rect.height / 2}px`;
        fixedBox.style.left = `${rect.left + rect.width / 2}px`;
        fixedBox.style.borderRadius = "1.875rem 1.875rem 0 0";
        footer.style.marginBottom = "100vh";
        setTimeout(() => {
            fixedBox.classList.add("smooth");
            fixedBox.style.borderRadius = "1.875rem";
            fixedBox.classList.add("centered");
        }, 10);

        setTimeout(() => {
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
                window.addEventListener("scroll", postScrollAnimations);
            }, 500); // Match the duration of the animation (0.3s)
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
document.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", (e) => {
        if (a.getAttribute("target") !== "_blank") {
            if (a.getAttribute("href").startsWith("#")) return;
            e.preventDefault();
            if (a.getAttribute("href").includes("/p/")) {
                switchToPost(a);
                // check if there's a .hero image in the same article
            } else switchToHome();

            window.history.pushState(null, null, a.getAttribute("href"));
        }
    });
});

const categoriesMove = (direction) => {
    const categories = document.getElementById("categories");
    categories.scrollTo({
        left: categories.scrollLeft + 200 * direction,
        behavior: "smooth"
    });
};

// get tags from /meta/tags.json

//{
// "tags": {
//     "HTML": 32,
//     "C++": 1,
//     "Twitter": 1,
//     "OBS": 1,
//     "Vim": 1,
//     "HTTP": 1
//   },
//   "categories": {
//     "心得": 1,
//   }
// }

fetch("/meta/tags.json")
    .then((response) => response.json())
    .then((data) => {
        const tags = data.tags;
        const categories = data.categories;
        const tagsElement = document.getElementById("tags");
        const categoriesElement = document.getElementById("categories");
        for (const [tag, count] of Object.entries(tags)) {
            const a = document.createElement("a");
            a.href = `/tag/${tag}`;
            a.innerHTML = `${tag}<div>${count}</div>`;
            tagsElement.appendChild(a);
        }
        // for (const [category, count] of Object.entries(categories)) {
        //     const a = document.createElement("a");
        //     a.href = `/category/${category}`;
        //     a.textContent = `${category} (${count})`;
        //     categoriesElement.appendChild(a);
        // }
    });

const diffDays = Math.ceil(
    (new Date() - new Date("2021-06-04")) / (1000 * 60 * 60 * 24)
);
document.querySelector("#time p").textContent = `${Math.floor(
    diffDays / 365
)}年 ${diffDays % 365}天`;
