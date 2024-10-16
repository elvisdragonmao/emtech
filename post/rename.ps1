# Loop through folders from 1 to 30
For ($i = 1; $i -le 30; $i++) {
    # Define the current folder name and the new folder name
    $currentFolder = ".\$i"
    $newFolder = ".\2024ironman-$i"
    
    # Check if the current folder exists
    if (Test-Path $currentFolder) {
        # Rename the folder
        Rename-Item -Path $currentFolder -NewName $newFolder
        Write-Host "Renamed folder $currentFolder to $newFolder"
    } else {
        Write-Host "Folder $currentFolder does not exist"
    }
}
