#!/bin/bash

# Base directory
BASE_DIR="../../post"

# Initialize a flag to check if all files pass
ALL_PASS=true

# Loop through all markdown files in subdirectories
while read -r FILE; do
  # Store the response in a variable
  RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"text": "'"$FILE"'"}' https://winston.emtech.cc/api/check)
  
  # Check if response contains any mistakes
  if [[ $RESPONSE == '{"mistakes":[]}' ]]; then
    echo -n "."
  else
    echo -e "\n❌ Found issues in $FILE:"
    # Parse and display mistakes
    echo "$RESPONSE" | jq -r '.mistakes[] | if .type == "term_ambiguity_check" then "⚠️ \(.wrong) -> \(.correct[0]) (\(.type))" else "❌ \(.wrong) -> \(.correct[0]) (\(.type))" end' | while read -r line; do
      if [[ $line == "⚠️"* ]]; then
        echo "$line"
      else
        echo "$line"
        ALL_PASS=false
      fi
    done
    ALL_PASS=false
  fi

done < <(find "$BASE_DIR" -type f -name "index.md")

# Final summary
if $ALL_PASS; then
  printf "\n✅ All files passed the checks."
else
  printf "\n❌ Some files failed the checks. Please review the errors above."
fi
