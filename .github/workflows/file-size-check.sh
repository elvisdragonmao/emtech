#!/bin/bash

# Initialize arrays to store files
declare -a warning_files=()
declare -a error_files=()
declare -a processed_files=()

# Check if imagemagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed. Installing..."
    apt-get update && apt-get install -y imagemagick
fi

# Function to check file sizes
check_files() {
    local dir=$1
    if [ -d "$dir" ]; then
        while IFS= read -r file; do
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
            convert "$filename" -resize '1000x>' "$new_filename"
            
            # Remove original file if conversion successful
            if [ $? -eq 0 ]; then
                rm "$filename"
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
        
        git commit -m "optimize: convert large files to WebP format

The following files were optimized:
$(printf '%s\n' "${processed_files[@]}")

Converted to WebP with max width 1000px to reduce file size."
        
        git push origin "$branch_name"
        
        # Create pull request using GitHub CLI if available
        if command -v gh &> /dev/null; then
            gh pr create --title "Optimize large files" \
                        --body "Automatically converted large files to WebP format to reduce repository size.

Converted files:
$(printf '%s\n' "${processed_files[@]}")

All images have been resized to a maximum width of 1000px and converted to WebP format for optimal file size." \
                        --base main \
                        --head "$branch_name"
        else
            echo "GitHub CLI not found. Please create pull request manually from branch: $branch_name"
        fi
        
        exit 1
    fi
fi

echo "✅ All files passed size checks!"
exit 0