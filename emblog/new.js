const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Enter post ID: ", (id) => {
    if (!id) {
        console.log("Post ID is required.");
        rl.close();
        return;
    }

    const postDir = path.join("post", id);
    const postFile = path.join(postDir, "index.md");
    const content = `---
authors: elvismao
tags: []
categories: []
date: ${new Date(new Date(Date.now() - new Date().getTimezoneOffset() * 60000)).toISOString().split("T")[0]}
description: 
---

# 
`;

    if (!fs.existsSync(postDir)) {
        fs.mkdirSync(postDir, { recursive: true });
    }

    fs.writeFileSync(postFile, content, "utf8");
    console.log(`Post created: ${postFile}`);
    rl.close();
});
