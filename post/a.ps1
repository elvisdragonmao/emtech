# Get the current folder path
$folderPath = Get-Location
# Get all .md files in the current folder and subfolders
$mdFiles = Get-ChildItem -Path $folderPath -Filter *.md -Recurse

foreach ($file in $mdFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    # Escape the brackets to avoid unexpected behavior in PowerShell regex
    $updatedContent = $content -replace '網棧,教學', '"網棧","教學"'
    # Trim trailing newlines or whitespace
    $trimmedContent = $updatedContent.TrimEnd()
    # Write the updated content back to the file with UTF8 encoding to preserve characters
    Set-Content -Path $file.FullName -Value $trimmedContent -Encoding UTF8
}

Write-Output "Replacement complete, and trailing empty lines removed."
