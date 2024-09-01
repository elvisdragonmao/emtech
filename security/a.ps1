1..15 | ForEach-Object { 
    $folderName = "$_" 
    New-Item -ItemType Directory -Name $folderName -Force 
    New-Item -ItemType File -Path "$folderName\index.md" -Force 
}
