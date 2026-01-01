# emblog - A Blog Generator for emtech

<https://emtech.cc>

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Edit-Mr/emtech/markdown-validation.yml?label=Markdown) ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Edit-Mr/emtech/autocorrect.yml?label=Format) ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Edit-Mr/emtech/file-size-check.yml?label=Image%20Size)

![emtech og image](https://raw.githubusercontent.com/Edit-Mr/emtech/main/static/img/og.webp)

**emblog** is a distinctive and powerful blog framework specifically designed for **emtech**. It enables you to create stunning single-page static blogs in seconds.

## Background

Since my second year in junior high school, **emtech** has relied on [Hugo](https://gohugo.io/) as its blogging framework. Paired with GitHub Pages, it used the [Hugo Clarity](https://github.com/chipzoller/hugo-clarity) theme for deployment. While Hugo is a stable and fast blog generator, prolonged use of Hugo Clarity revealed several issues, primarily related to Chinese encoding problems. These issues affected features like the sitemap and search functionality, in addition to some pages looking odd.

![Core Web Vitals](https://emtech.cc/static/emblog/google.webp)

I also wanted my blog to be one-of-a-kind. Creating a Hugo theme that met my specific requirements would have meant overhauling its core significantly. Since a blog generator is essentially about converting Markdown to HTML using templates, I decided to build one myself. From conception to development, the process took about a year (with active development taking roughly a month).

![Figma Design](https://emtech.cc/static/emblog/image.png)

**emblog** is based on Node.js. It avoids frameworks and uses only `markdown-it` for Markdown parsing and `highlight.js` for syntax highlighting—libraries that are hard to replicate well. The entire UI and SPA (single-page application) were handcrafted to keep **emblog** lightweight and efficient.

Although I considered learning Go for this project, I ultimately chose Node.js due to its shorter learning curve and better platform support.

## Design

Every detail in **emblog**—from page transitions, TikTok-like lazy loading, meticulous SEO optimization, to the RSS feed—has been carefully designed to ensure the final blog delivers outstanding performance and user experience. Some features are still under development due to time constraints, but updates are ongoing. Feedback via [GitHub](https://github.com/elvisdragonmao/emtech) is always welcome.

**emblog** primarily consists of just two pages: a homepage and an article page. ~~Definitely not because I was too lazy to add more~~. Some planned features haven't been implemented yet but will be added gradually.

### Transitions

The page-to-article transitions are one of the blog's standout features. I designed the animations myself to ensure seamless transitions and prevent blank loading screens while articles or images are being fetched.

The effect of returning to the homepage was particularly challenging. Various attempts resulted in flashy, unnatural effects reminiscent of amateurish presentations. Ultimately, I implemented a parallax effect inspired by Material Design guidelines and Apple's approach.

![Open Article Transition](https://emtech.cc/static/emblog/transition.gif)

After reading an article, scrolling down reveals the next article, which gradually scales up. Similarly, scrolling up returns you to the previous article.

![Next Article Transition](https://emtech.cc/static/emblog/continue.gif)

### Homepage

![Homepage Screenshot](https://emtech.cc/static/emblog/home.webp)

The left black area is designed to host primary visuals, animations, or mini-games. The right side features simple buttons mainly for layout balance.

Scrolling down reveals the article list. Though currently a work-in-progress, it is functional. The issue of aspect ratios for thumbnails (many of which are 1:1 memes from my junior high days) presented a challenge. To address this, **emblog** analyzes each image's primary color and generates a gradient background to fill empty spaces, providing a seamless appearance even before the image loads.

> The time required to generate the blog is slightly longer because image analysis in Node.js is computationally intensive.

![Article List](https://emtech.cc/static/emblog/tags.webp)

### Articles

The article elements are designed to be clean and straightforward, with a touch of creativity. Image captions are automatically extracted from the `alt` text.

![Image Example](https://emtech.cc/static/emblog/image.webp)

For code highlighting, I used the Nord theme. Code blocks support copying, and if they exceed five lines, they auto-collapse. Clicking the copy button changes it to a checkmark upon successful copying—something I insisted on including.

![Code Block](https://emtech.cc/static/emblog/code.webp)

On the right side, the aside section includes sharing buttons, a table of contents, and a recent browsing list. Recent browsing is stored locally using `localStorage` for convenience and to ensure recommended articles don't repeat.

The circular CSS design for related articles at the bottom was quite tricky, relying on layered pseudo-elements to achieve the look.

![Related Articles](https://emtech.cc/static/emblog/related.png)

## Tailored for Me

The writing workflow is designed for maximum comfort. The first paragraph automatically becomes the description, and the first `h1` becomes the article title. Formatting—like spacing, capitalization, and quotation marks—is automated to avoid errors. If any article encounters issues, the generator continues without halting, ensuring smooth output.

## Try It Yourself

If you'd like to experiment locally, you can download it from [GitHub](https://github.com/elvisdragonmao/emtech). Don't forget to leave a star!

1. Ensure Node.js is installed.
2. Run `pnpm` to install dependencies.
3. Run `pnpm build` to generate the static site.
4. The static site will be output to the `dist/` folder.

## License

**emblog** was designed for **emtech** and currently lacks customization features for general use. However, all code is released under the Apache 2.0 license, and you're welcome to modify and use it. In the future, I plan to make it a publicly usable blog generator. Follow my [GitHub](https://github.com/elvisdragonmao/emtech) for updates.
