/** @format */

import fetch from "node-fetch";

// get current time in UTC_8
const now = new Date();
const nowUTC8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);
// minus 2024/9/15, calculate how many days after.
const days = Math.floor(
  (nowUTC8 - new Date("2024-09-14")) / (24 * 60 * 60 * 1000)
);
const url =
  "https://ithelp.ithome.com.tw/users/20139821/ironman/7503?page=" +
  Math.ceil(days / 10);

fetch(url)
  .then((res) => res.text())
  .then((html) => {
    // remove all tabs and spaces in the html
    const htmlNoSpace = html.replace(/\s/g, "");
    // check if html include <spanclass="ir-qa-list__daysir-qa-list__days--profile">DAY5</span>
    //console.log(htmlNoSpace); // The raw HTML of the page

    if (
      !htmlNoSpace.includes(
        `<spanclass="ir-qa-list__daysir-qa-list__days--profile">DAY${days}</span>`
      )
    ) {
      // call discord webhook, and send message to discord
      fetch(process.env.DISCORD_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: `@everyone 第${days}天的文章還沒發布喔！`
        })
      })
        .then(() => {
          console.log(
            "Day",
            days,
            "not published yet. Message sent to Discord."
          );
        })
        .catch((err) => {
          console.error("Error sending message to Discord:", err);
        });
    }
  })
  .catch((err) => {
    console.error("Error fetching page:", err);
  });
