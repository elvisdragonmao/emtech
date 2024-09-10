# https://kknews.cc/zh-tw/other/mbaxyp9.html

# Set the directory to search
$directory = "C:\Users\user\Documents\GayHub\emtech\"

# Find all .md files in the directory and its subdirectories
$mdFiles = Get-ChildItem -Path $directory -Recurse -Filter *.md

# Initialize a variable to store the total letter/character count
$totalCharacters = 0

# Loop through each .md file
foreach ($file in $mdFiles) {
    # Read the content of the file
    $content = Get-Content -Path $file.FullName -Raw
    
    # Remove non-character symbols (keep letters, Chinese characters, etc.)
    $charactersOnly = $content -replace '[^\p{L}\p{N}]', ''
    
    # Count the number of remaining characters
    $characterCount = $charactersOnly.Length
    
    # Add the character count of the current file to the total
    $totalCharacters += $characterCount
}

# Output the total character count
Write-Output "Total number of characters in all .md files: $totalCharacters"
