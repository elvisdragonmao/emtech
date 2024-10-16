# Get the current folder path
$folderPath = Get-Location
# Get all .md files in the current folder and subfolders
$mdFiles = Get-ChildItem -Path $folderPath -Recurse -Filter *.md

foreach ($file in $mdFiles) {
    $content = Get-Content -Path $file.FullName -Raw
   $updatedContent = $content -replace '" %}}', ""



    # Write the updated content back to the file without adding a new line at the end
    [System.IO.File]::WriteAllText($file.FullName, $updatedContent)
}
Write-Output "Replacement complete."
