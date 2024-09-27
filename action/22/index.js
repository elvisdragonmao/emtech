/** @format */

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const crypto = require("crypto");

// URL to crawl
const url =
  "https://www.reallygood.com.tw/newExam/inside?str=932DEFBF9A06471E3A1436C3808D1BB7";

const webhookUrl = process.env.WEBHOOK_URL;

if (!webhookUrl) {
  console.error("WEBHOOK_URL environment variable is not set.");
  process.exit(1);
}

function calculateHash(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function fetchPage() {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error("Error fetching the page:", error);
    return null;
  }
}

function extractTable(html) {
  const $ = cheerio.load(html);
  const tableHtml = $(".main_area .article table").eq(5).html();
  return tableHtml || "";
}

function saveTableToFile(content, filename) {
  fs.writeFileSync(filename, content, "utf8");
}

function compareTables(newTable, oldTableFile) {
  if (!fs.existsSync(oldTableFile)) return true; // No previous file, treat as change.

  const oldTable = fs.readFileSync(oldTableFile, "utf8");
  return calculateHash(newTable) !== calculateHash(oldTable);
}

async function sendDiscordMessage(changes) {
  const message = {
    content: changes
  };

  try {
    await axios.post(webhookUrl, message);
    console.log("Change notification sent to Discord.");
  } catch (error) {
    console.error("Error sending message to Discord:", error);
  }
}

// Main function to execute the crawl and check for changes
async function main() {
  const html = await fetchPage();
  if (!html) return;

  const newTable = extractTable(html);

  // Define the file where the table is stored
  const tableFile = "table.html";

  // Check if there's any change
  if (compareTables(newTable, tableFile)) {
    console.log("Change detected! Saving new table and notifying Discord.");
    const $ = cheerio.load(`<table>${newTable}</table>`);
    const old$ = cheerio.load(
      `<table>${fs.readFileSync(tableFile, "utf8")}</table>`
    );
    saveTableToFile(newTable, tableFile);
    const rows = $("tr");
    const oldRows = old$("tr");
    for (let i = 1; i < rows.length; i++) {
      const row = rows.eq(i);
      const columns = row.find("td");
      const oldRow = oldRows
        .find(`td:contains('${columns.eq(0).text().replace("𝐍𝐄𝐖", "")}')`)
        .parent();
      if (oldRow.length === 0) {
        console.log("Row", i, "not found in old table.");
        continue;
      }
      const oldColumns = oldRow.find("td");

      let changed = false;
      for (let j = 0; j < columns.length; j++) {
        if (
          columns.eq(j).text().trim().replace(/\s+/g, " ") !==
          oldColumns.eq(j).text().trim().replace(/\s+/g, " ")
        ) {
          changed = true;
          console.log(
            columns.eq(j).text().length,
            oldColumns.eq(j).text().length
          );
          console.log(
            columns.eq(j).text().trim().replace(/\s+/g, " ") +
              " !== " +
              oldColumns.eq(j).text().trim().replace(/\s+/g, " ")
          );
          break;
        }
      }
      if (!changed) {
        continue;
      }
      console.log("Change detected in row", i);
      let message = `#### ${columns
        .eq(0)
        .text()
        .replace("𝐍𝐄𝐖", "")
        .replace(/\s+/g, " ")} 特選資訊已更新\n**名額:** ${columns
        .eq(1)
        .text()
        .replace(/\s+/g, " ")}\n**報名及繳件日期:** ${columns
        .eq(2)
        .text()
        .replace(/\s+/g, " ")}\n**面試日期:** ${columns
        .eq(3)
        .text()
        .replace(/\s+/g, " ")}\n放榜日期: ${columns
        .eq(4)
        .text()}\n[簡章下載](${columns.eq(5).find("a").attr("href")})\n`;
      message += "\n";
      console.log(message);
      await sendDiscordMessage(message.replaceAll("\t", " "));
    }
  } else {
    console.log("No changes detected.");
  }
}
main();
