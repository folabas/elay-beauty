$outputDir = "C:\Users\user\Documents\EL.AY_beauty\el-ay-beauty\public\images\services"
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

$results = @()
$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

$urls = @(
    @{ Url = "https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=600&h=600&fit=crop"; Name = "service-01.jpg" }
    @{ Url = "https://images.unsplash.com/photo-1605980776566-0486c3ac7617?w=600&h=600&fit=crop"; Name = "service-02.jpg" }
    @{ Url = "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&h=600&fit=crop"; Name = "service-03.jpg" }
    @{ Url = "https://images.unsplash.com/photo-1583445095369-9c651e7e5d34?w=600&h=600&fit=crop"; Name = "service-04.jpg" }
    @{ Url = "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=600&h=600&fit=crop"; Name = "service-05.jpg" }
    @{ Url = "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&h=600&fit=crop"; Name = "service-06.jpg" }
    @{ Url = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop"; Name = "service-07.jpg" }
    @{ Url = "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&h=600&fit=crop"; Name = "service-08.jpg" }
    @{ Url = "https://images.pexels.com/photos/4545171/pexels-photo-4545171.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop"; Name = "service-09.jpg" }
    @{ Url = "https://images.pexels.com/photos/3993400/pexels-photo-3993400.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop"; Name = "service-10.jpg" }
    @{ Url = "https://images.pexels.com/photos/3993398/pexels-photo-3993398.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop"; Name = "service-11.jpg" }
    @{ Url = "https://images.pexels.com/photos/5792651/pexels-photo-5792651.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop"; Name = "service-12.jpg" }
)

foreach ($item in $urls) {
    $outPath = Join-Path -Path $outputDir -ChildPath $item.Name
    try {
        Write-Host "Downloading $($item.Name) ... " -NoNewline
        Invoke-WebRequest -Uri $item.Url -OutFile $outPath -UserAgent $ua -ErrorAction Stop
        $size = (Get-Item -LiteralPath $outPath).Length
        Write-Host "OK ($size bytes)"
        $results += [PSCustomObject]@{ File = $item.Name; Status = "OK"; Size = $size }
    } catch {
        Write-Host "FAILED: $($_.Exception.Message)"
        $results += [PSCustomObject]@{ File = $item.Name; Status = "FAILED"; Size = 0 }
    }
}

Write-Host "`n=== Download Summary ==="
$results | Format-Table -AutoSize
$ok = ($results | Where-Object { $_.Status -eq "OK" }).Count
$failed = ($results | Where-Object { $_.Status -eq "FAILED" }).Count
Write-Host "Successful: $ok | Failed: $failed"
