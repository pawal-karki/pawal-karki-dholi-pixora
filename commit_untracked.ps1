$ErrorActionPreference = "Stop"

# Target dates
$dates = @(
    "2026-02-20",
    "2026-02-21",
    "2026-02-22"
)

# We want to commit whatever is currently staged and any remaining untracked files
# First, let's get any untracked files and add them just in case
$untrackedFiles = git ls-files --others --exclude-standard
foreach ($file in $untrackedFiles) {
    git add $file
}

# Now get all staged files (which includes the ones we just reset)
$stagedFiles = git diff --name-only --cached

if ($stagedFiles.Count -eq 0) {
    Write-Host "No files found to commit."
    exit
}

# Unstage everything so we can batch them day by day
git reset HEAD

$allFiles = git diff --name-only
$untrackedNow = git ls-files --others --exclude-standard

# Combine into one array list
$filesList = New-Object System.Collections.ArrayList
foreach ($file in $allFiles) { if (-not $filesList.Contains($file)) { $filesList.Add($file) | Out-Null } }
foreach ($file in $untrackedNow) { if (-not $filesList.Contains($file)) { $filesList.Add($file) | Out-Null } }

if ($filesList.Count -eq 0) {
    Write-Host "No files found."
    exit
}

Write-Host "Found $($filesList.Count) files to commit."

$random = New-Object System.Random
$filesPerDay = [Math]::Ceiling($filesList.Count / $dates.Count)
$prefixes = @("feat: ", "update: ", "chore: ")

foreach ($dateStr in $dates) {
    if ($filesList.Count -eq 0) { break }
    
    # Generate random time between 09:00:00 and 17:59:59
    $hour = $random.Next(9, 18).ToString("D2")
    $minute = $random.Next(0, 60).ToString("D2")
    $second = $random.Next(0, 60).ToString("D2")
    
    $timestamp = "$dateStr`T$hour`:$minute`:$second+05:45"
    $takeCount = [Math]::Min($filesPerDay, $filesList.Count)
    if ($dateStr -eq $dates[$dates.Count - 1]) { $takeCount = $filesList.Count }
    
    $filesForCommit = @()
    for ($i = 0; $i -lt $takeCount; $i++) {
        $randomIndex = $random.Next($filesList.Count)
        $filesForCommit += $filesList[$randomIndex]
        $filesList.RemoveAt($randomIndex)
    }
    
    foreach ($file in $filesForCommit) {
        git add $file
    }
    
    $randomPrefix = $prefixes[$random.Next($prefixes.Count)]
    $commitMessage = "$randomPrefix add feature components and queries"
    
    $env:GIT_AUTHOR_DATE = $timestamp
    $env:GIT_COMMITTER_DATE = $timestamp
    
    Write-Host "Committing $($filesForCommit.Count) files: $commitMessage"
    git commit -m $commitMessage
    
    Remove-Item Env:\GIT_AUTHOR_DATE
    Remove-Item Env:\GIT_COMMITTER_DATE
}

Write-Host "Finished creating commits in conventional format!"
