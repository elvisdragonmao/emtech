# Loop through directories 1 to 29
1..29 | ForEach-Object {
    $dir = "$_"
    $file = "$dir\index.md"

    # Check if the file exists
    if (Test-Path $file) {
        # Get the first line of the file
        $firstLine = Get-Content -Path $file -TotalCount 1
        Write-Output "$firstLine"
    } else {
    }
}
