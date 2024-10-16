# Get the current folder path
$folderPath = Get-Location
# Get all .md files in the current folder and subfolders
$mdFiles = Get-ChildItem -Path $folderPath -Recurse -Filter *.md

foreach ($file in $mdFiles) {
    $content = Get-Content -Path $file.FullName -Raw
$updatedContent = $content -replace 'categories: \["不用庫 也能酷 - 玩轉 CSS & Js 特效"\]', "categories: [不用庫 也能酷 - 玩轉 CSS & Js 特效]`nthumbnail: /static/2023ironman-1/thumbnail.webp"




    # Write the updated content back to the file without adding a new line at the end
    [System.IO.File]::WriteAllText($file.FullName, $updatedContent)
}
Write-Output "Replacement complete."
