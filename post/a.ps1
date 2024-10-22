# Directory path where the markdown files are located
$directory = Get-Location

# Loop through each file (from 2023ironman-1/index.md to 2023ironman-30/index.md)
for ($i = 1; $i -le 30; $i++) {
    $filePath = Join-Path $directory "2023ironman-$i\index.md"
    
    if (Test-Path $filePath) {
        # Read the content of the markdown file
        $content = Get-Content -Path $filePath

        # Use regex to replace image URLs with just the filename
        # Find patterns like: ![alt text](https://emtech.cc/post/2023ironman-X/image.webp)
        # Replace with: ![alt text](image.webp)
        $content = $content -replace "!\[(.*?)\]\(https:\/\/emtech.cc\/post\/2023ironman-\d+\/(.*?)\)", "![`$1`](`$2`)"

        # Write the updated content back to the file
        Set-Content -Path $filePath -Value $content
        Write-Host "Processed: $filePath"
    } else {
        Write-Host "File not found: $filePath"
    }
}
