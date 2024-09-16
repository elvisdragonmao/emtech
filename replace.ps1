# Get the current folder path
$folderPath = Get-Location
# Get all .md files in the current folder get .md and .ymal files
$mdFiles = Get-ChildItem -Path $folderPath -Recurse -Include *.md, *.yaml
foreach ($file in $mdFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    # replace node-version: '16' (from 1 to 19) with node-version: '20'
    $updatedContent = $content -replace "流行", "熱門"
    # Write the updated content back to the file without adding a new line at the end
    [System.IO.File]::WriteAllText($file.FullName, $updatedContent)
}
Write-Output "Replacement complete."