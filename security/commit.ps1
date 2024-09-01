2..14 | ForEach-Object { 
    $pageNumber = $_.ToString()
    $fileToAdd = "$pageNumber"
    
    # Add the file to the staging area
    git add $fileToAdd

    # Commit the changes with a specific message
    git commit -m "Page $pageNumber"
}
