/** @format */

const core = require("@actions/core");
const axios = require("axios");
const { markdownToBlocks } = require("@tryfabric/martian");

async function main() {
  const repo = core.getInput("repo");
  const notionToken = core.getInput("NOTION_API_KEY");
  const notionDatabaseId = core.getInput("NOTION_DATABASE_ID");

  // GitHub Issues API URL
  const issuesUrl = `https://api.github.com/repos/${repo}/issues?state=all`;

  // Fetch issues from GitHub
  const issuesResponse = await axios.get(issuesUrl, {
    headers: {
      "User-Agent": "request",
      Authorization: `token ${process.env.GITHUB_TOKEN}`
    }
  });

  for (const issue of issuesResponse.data) {
    const issueId = issue.id;
    const notionUrl = `https://api.notion.com/v1/databases/${notionDatabaseId}/query`;

    // Check if the issue already exists in Notion
    const notionResponse = await axios.post(
      notionUrl,
      {
        filter: {
          property: "ID",
          number: {
            equals: issueId
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${notionToken}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json"
        }
      }
    );

    const body = {
      parent: { database_id: notionDatabaseId },
      icon: {
        emoji: "⚡"
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: issue.title
              }
            }
          ]
        },
        ID: {
          number: issueId
        },
        State: {
          select: {
            name: issue.state.charAt(0).toUpperCase() + issue.state.slice(1)
          }
        },
        Status: {
          status: {
            name: "Not started"
          }
        },
        Labels: {
          multi_select: issue.labels.map((label) => ({
            name: label.name
          }))
        },
        URL: {
          url: issue.html_url
        }
      },
      children: issue.body != null ? markdownToBlocks(issue.body) : []
    };

    if (notionResponse.data.results.length > 0) {
      console.log(`Issue ${issueId} already exists in Notion, updating it`);
      // Update existing issue
      const notionPageId = notionResponse.data.results[0].id;
      delete body.properties.Status;
      await axios.patch(
        `https://api.notion.com/v1/pages/${notionPageId}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${notionToken}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
          }
        }
      );
    } else {
      console.log(`Creating new issue ${issueId} in Notion`);
      // Create new issue
      await axios.post("https://api.notion.com/v1/pages", body, {
        headers: {
          Authorization: `Bearer ${notionToken}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28"
        }
      });
      console.log(`Issue ${issueId} created in Notion`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
