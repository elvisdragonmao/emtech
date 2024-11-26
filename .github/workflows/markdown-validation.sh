#!/bin/bash

# Base directory
BASE_DIR="./post"

# Initialize a flag to check if all files pass
ALL_PASS=true

# Loop through all markdown files in subdirectories
find "$BASE_DIR" -type f -name "index.md" | while read -r FILE; do
  echo -n "."
  
  # Check for H1 title (# )
  if ! grep -q '^# ' "$FILE"; then
    printf "\n❌ Missing H1 title in $FILE\n"
    ALL_PASS=false
  fi

  # Check for date in the front matter
  if ! grep -q '^date: [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}$' "$FILE"; then
    printf "\n❌ Missing or invalid date in $FILE\n"
    ALL_PASS=false
  fi

  # Check for tags or categories
  if ! grep -Eq '^tags: \[.*\]|^categories: \[.*\]' "$FILE"; then
    printf "\n❌ Missing tags or categories in $FILE\n"
    ALL_PASS=false
  fi

  # Check for {{notice}} and {{noticed}}
  NOTICE_COUNT=$(grep -c '{{notice}}' "$FILE")
  NOTICED_COUNT=$(grep -c '{{noticed}}' "$FILE")
  if [[ "$NOTICE_COUNT" -ne "$NOTICED_COUNT" ]]; then
    printf "\n❌ Mismatch between {{notice}} ($NOTICE_COUNT) and {{noticed}} ($NOTICED_COUNT) in $FILE\n"
    ALL_PASS=false
  fi
done

# Final summary
if $ALL_PASS; then
  printf "\n✅ All files passed the checks."
else
  printf "\n❌ Some files failed the checks. Please review the errors above."
fi
