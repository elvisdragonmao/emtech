#!/bin/bash

set -e

update_tasks() {
    local notion_database_id="$NOTION_DATABASE_ID"
    local notion_token="$NOTION_TOKEN"
    local discord_channel_id="$DISCORD_CHANNEL_ID"
    local discord_token="$DISCORD_TOKEN"
    
    # 從 Notion 獲取待辦事項
    response=$(curl -s -X POST -H "Authorization: ${notion_token}" -H "Notion-Version: 2022-06-28" -H "Content-Type: application/json" "https://api.notion.com/v1/databases/${notion_database_id}/query")
    
    if [ -n "$(echo "${response}" | jq '.results')" ]; then
        not_started_count=0
        in_progress_count=0
        for row in $(echo "${response}" | jq -r '.results[] | @base64'); do
            status_name=$(echo "${row}" | base64 -d | jq -r '.properties.Status.status.name')
            echo "${status_name}"
            if [ "${status_name}" = "Not started" ]; then
                (( not_started_count++ ))
            elif [ "${status_name}" = "In progress" ]; then
                (( in_progress_count++ ))
            fi
        done
        
        # 更新 Discord 頻道標題
        update_discord_channel_title "還有 ${not_started_count} 件事沒人做"
        update_discord_channel_title "${in_progress_count} 件事處理中"
    else
        echo "Error: Unable to retrieve data from Notion API."
        exit 1
    fi
}

update_discord_channel_title() {
    local new_title="$1"
    local channel_id="$DISCORD_CHANNEL_ID"
    local url="https://discord.com/api/v10/channels/${channel_id}"
    local token="Bot ${DISCORD_TOKEN}"
    
    response=$(curl -s -X PATCH -H "Authorization: ${token}" -H "Content-Type: application/json" -d "{\"name\": \"${new_title}\"}" "${url}")
    updated_title=$(echo "${response}" | jq -r '.name')
    echo "Channel title updated successfully: ${updated_title}"
}

update_tasks