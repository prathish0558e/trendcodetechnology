Add-Type -AssemblyName System.Drawing
$f = 'WhatsApp Image 2026-09-29 at 1.36.28 PM.jpeg'
$i = [System.Drawing.Image]::FromFile((Resolve-Path $f))
$b = New-Object System.Drawing.Bitmap($i)
$w = $b.Width; $h = $b.Height

$c1 = $b.GetPixel(2, 2)
Write-Host ('TL: ' + $c1.R + ',' + $c1.G + ',' + $c1.B)
$c2 = $b.GetPixel([int]($w/2), [int]($h/2))
Write-Host ('MID: ' + $c2.R + ',' + $c2.G + ',' + $c2.B)
$c3 = $b.GetPixel($w-3, $h-3)
Write-Host ('BR: ' + $c3.R + ',' + $c3.G + ',' + $c3.B)
$c4 = $b.GetPixel([int]($w/2), 2)
Write-Host ('TOPC: ' + $c4.R + ',' + $c4.G + ',' + $c4.B)
Write-Host ($w.ToString() + 'x' + $h.ToString())
$b.Dispose(); $i.Dispose()
