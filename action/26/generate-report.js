import fs from "fs";
import path from "path";

const reportFilePath = path.join(__dirname, "report.md");

// 模擬生成報告的內容
const reportContent = `
# 工作流程報告

**日期**: ${new Date().toLocaleDateString()}

## 總結

本次工作流程運行成功。

## 詳細信息

- [工作流程鏈接](https://github.com/${
  process.env.GITHUB_REPOSITORY
}/actions/runs/${process.env.GITHUB_RUN_ID})
`;

// 將報告內容寫入文件
fs.writeFileSync(reportFilePath, reportContent, "utf8");

console.log("報告已生成");
