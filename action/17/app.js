const core = require("@actions/core");
const axios = require("axios");

async function updateTasks() {
  try {
    // 讀取輸入參數
    const notionDatabaseId = core.getInput("notion_database_id");
    const notionToken = core.getInput("notion_token");
    const discordChannelId = core.getInput("discord_channel_id");
    const discordToken = core.getInput("discord_token");

    // 從 Notion 獲取待辦事項
    const notionResponse = await axios.post(
      `https://api.notion.com/v1/databases/${notionDatabaseId}/query`,
      {},
      {
        headers: {
          Authorization: `Bearer ${notionToken}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      },
    );

    let notStartedCount = 0;
    let inProgressCount = 0;

    // 解析 Notion API 的響應
    notionResponse.data.results.forEach((result) => {
      const status = result.properties.Status.status.name;
      if (status === "Not started") {
        notStartedCount++;
      } else if (status === "In progress") {
        inProgressCount++;
      }
    });

    // 更新 Discord 頻道標題
    await axios.patch(
      `https://discord.com/api/v10/channels/${discordChannelId}`,
      {
        name: `還有 ${notStartedCount} 件事沒人做`,
      },
      {
        headers: {
          Authorization: `Bot ${discordToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    await axios.patch(
      `https://discord.com/api/v10/channels/${discordChannelId}`,
      {
        name: `${inProgressCount} 件事處理中`,
      },
      {
        headers: {
          Authorization: `Bot ${discordToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Discord channel title updated successfully");
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
  }
}

updateTasks();
