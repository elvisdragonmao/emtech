# Get the current folder path
$folderPath = Get-Location
# Get all .md files in the current folder
$mdFiles = Get-ChildItem -Path $folderPath -Filter *.md
foreach ($file in $mdFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $updatedContent = $content -replace '您', '你'
    # Write the updated content back to the file without adding a new line at the end
    [System.IO.File]::WriteAllText($file.FullName, $updatedContent)
}
Write-Output "Replacement complete."
