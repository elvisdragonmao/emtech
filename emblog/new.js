const fs = require("fs");
const path = require("path");
const readline = require("readline");

async function getPostId() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question("Enter post ID: ", (entered) => {
            rl.close();
            resolve(entered.trim());
        });
    });
}

async function main() {
    let id = process.argv[2];

    if (!id) {
        id = await getPostId();
    }

    if (!id) {
        console.log("Post ID is required.");
        process.exit(1);
    }

    const postDir = path.join("post", id);
    const postFile = path.join(postDir, "index.md");
    const content = `---
authors: elvismao
tags: []
categories: []
date: ${new Date().toISOString().split("T")[0]}
description: 
---

# 
`;

    if (!fs.existsSync(postDir)) {
        fs.mkdirSync(postDir, { recursive: true });
    }

    fs.writeFileSync(postFile, content, "utf8");
    console.log(`Post created: ${postFile}`);
}

main();
