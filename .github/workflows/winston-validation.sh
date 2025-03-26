#!/bin/bash

# Base directory
BASE_DIR="./post"

# Initialize a flag to check if all files pass
ALL_PASS=true

# Loop through all markdown files in subdirectories
# Create a temporary file to store results
TEMP_FILE=$(mktemp)

# Function to process a single file
process_file() {
  local FILE=$1
  local TEMP_FILE=$2
  
  # Store the response in a variable
  RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"text": "'"$FILE"'"}' https://winston.emtech.cc/api/check)
  
  # Check if response contains any mistakes
  if [[ $RESPONSE == '{"mistakes":[]}' ]]; then
    echo -n "."
  else
    {
      echo -e "\n❌ Found issues in $FILE:"
      # Parse and display mistakes
      echo "$RESPONSE" | jq -r '.mistakes[] | if .type == "term_ambiguity_check" then "⚠️ \(.wrong) -> \(.correct[0]) (\(.type))" else "❌ \(.wrong) -> \(.correct[0]) (\(.type))" end' | while read -r line; do
        if [[ $line == "⚠️"* ]]; then
          echo "$line"
        else
          echo "$line"
          echo "FAIL" >> "$TEMP_FILE"
        fi
      done
    } | tee -a "$TEMP_FILE.output"
  fi
}

export -f process_file

# Find all files and process them in parallel
find "$BASE_DIR" -type f -name "index.md" | xargs -I {} -P 24 bash -c 'process_file "$@"' _ {} "$TEMP_FILE"

# Check if any failures were recorded
if [ -f "$TEMP_FILE" ]; then
  ALL_PASS=false
fi

# Print all collected output in order
if [ -f "$TEMP_FILE.output" ]; then
  cat "$TEMP_FILE.output"
fi

# Cleanup temporary files
rm -f "$TEMP_FILE" "$TEMP_FILE.output"

# Final summary
if $ALL_PASS; then
  printf "\n✅ All files passed the checks."
else
  printf "\n❌ Some files failed the checks. Please review the errors above."
  exit 1
fi
