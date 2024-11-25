#!/bin/bash

# 程式由 Claude 撰寫
# 底下的鬼話是 ChatGPT 說的，看了很難受，讓大家一起難受。

# Initialize arrays to store files
declare -a warning_files=()
declare -a error_files=()
declare -a processed_files=()
declare -a updated_md_files=()

# Check if imagemagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed. Installing..."
    sudo apt-get update && sudo apt-get install -y imagemagick
fi

# Function to check file sizes
check_files() {
    local dir=$1
    if [ -d "$dir" ]; then
        while IFS= read -r file; do
            # Skip if file is a .git directory or webp file
            if [[ "$file" == *".git"* ]] || [[ "$file" == *.webp ]]; then
                continue
            fi
            
            # Get file size in KB
            size=$(du -k "$file" | cut -f1)
            
            if [ $size -gt 500 ]; then
                error_files+=("$file ($size KB)")
            elif [ $size -gt 100 ]; then
                warning_files+=("$file ($size KB)")
            fi
        done < <(find "$dir" -type f)
    fi
}

# Function to update markdown files with new image paths
update_markdown_references() {
    local old_file=$1
    local new_file=$2
    local old_basename=$(basename "$old_file")
    local new_basename=$(basename "$new_file")
    
    # Find all markdown files
    while IFS= read -r md_file; do
        if [ -f "$md_file" ]; then
            # Check if the old filename is referenced in the markdown file
            if grep -q "$old_basename" "$md_file"; then
                echo "Updating references in $md_file..."
                # Replace the old filename with the new one, handling different markdown image syntaxes
                sed -i "s|\]($old_basename)|\]($new_basename)|g" "$md_file"
                sed -i "s|\](./$old_basename)|\](./$new_basename)|g" "$md_file"
                sed -i "s|\](/$old_basename)|\](/$new_basename)|g" "$md_file"
                sed -i "s|$old_basename|$new_basename|g" "$md_file"
                
                if [[ ! " ${updated_md_files[@]} " =~ " ${md_file} " ]]; then
                    updated_md_files+=("$md_file")
                fi
            fi
        fi
    done < <(find . -name "*.md" -o -name "*.markdown")
}

# Check both directories
check_files "static"
check_files "post"

# Print warnings
if [ ${#warning_files[@]} -gt 0 ]; then
    echo "⚠️ WARNING: The following files are larger than 100KB:"
    printf '%s\n' "${warning_files[@]}"
fi

# Handle files larger than 500KB
if [ ${#error_files[@]} -gt 0 ]; then
    echo "❌ ERROR: The following files are larger than 500KB:"
    printf '%s\n' "${error_files[@]}"
    
    # Create new branch for fixes
    current_date=$(date +%Y%m%d_%H%M%S)
    branch_name="fix/optimize-large-files-$current_date"
    git checkout -b "$branch_name"
    
    # Process each large file
    for file in "${error_files[@]}"; do
        filename=$(echo "$file" | cut -d' ' -f1)
        if [[ $filename =~ \.(jpg|jpeg|png)$ ]]; then
            echo "Converting $filename to WebP..."
            
            # Create WebP version with max width 1000px
            new_filename="${filename%.*}.webp"
            convert "$filename" -resize '1000x>' -quality 85 "$new_filename"
            
            # Remove original file if conversion successful
            if [ $? -eq 0 ]; then
                # Update markdown references before removing the original file
                update_markdown_references "$filename" "$new_filename"
                
                git rm "$filename"
                processed_files+=("$filename → $new_filename")
                git add "$new_filename"
            else
                echo "Error converting $filename"
            fi
        fi
    done
    
    # Create commit and pull request if files were processed
    if [ ${#processed_files[@]} -gt 0 ]; then
        echo "The following files were converted to WebP:"
        printf '%s\n' "${processed_files[@]}"
        
        # Stage all changes including markdown updates
        git add -A
        
        # Prepare the commit message
        commit_message="把太大的圖片調教成 WebP，並更新了所有連結。

The following files were optimized:
$(printf '%s\n' "${processed_files[@]}")

Updated markdown files:
$(printf '%s\n' "${updated_md_files[@]}")

- Converted images to WebP with max width 1000px
- Quality set to 85%
- Original files removed
- Updated all markdown references to new WebP files"
        
        git commit -m "$commit_message"
        
        git push origin "$branch_name"
        
        # Create pull request using GitHub CLI
        gh pr create --title "啊～太大了，我快撐不住了啦！" \
                    --body "🎨 把太大的圖片調教成可愛的 WebP，並更新所有連結。

### 調教過的圖片：
$(printf '%s\n' "${processed_files[@]}")

### 調教過的 MD 檔案：
$(printf '%s\n' "${updated_md_files[@]}")

### 🔗調教細節：
- 鎖起來，長度只能到 1000px📏
- 改造成小小的 WebP，品質保持在 85%😏
- 把沒用的大東西直接丟掉🗑️
- 連結重新綁起來🪢

###  📦驗貨：
- [ ] Markdown 中的圖片都乖乖地出現了嗎📋？
- [ ] 調教的品質好嗎🌸？
- [ ] 連結沒有被玩到壞掉吧👉👈？

###  ✨技術細節：
- 超過 500KB 的原始圖片通通被乖乖壓縮轉檔了呢～再也不重壓你了！
- Markdown 的路徑都更新好了，一切都安排得好好的～
- 全部已經 commit 到這個 PR 了，盡情享受吧～

快來驗收一下吧～人家可是很努力呢❤～" \
                    --base main \
                    --head "$branch_name"
        
        echo "Pull request created successfully!"
        exit 1
    fi
fi

echo "✅ All files passed size checks!"
exit 0