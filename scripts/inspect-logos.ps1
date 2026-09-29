Add-Type -AssemblyName System.Drawing
foreach ($f in @('TCT logo.jpeg', 'TCT logo black.jpeg')) {
  $i = [System.Drawing.Image]::FromFile((Resolve-Path $f))
  $b = New-Object System.Drawing.Bitmap($i)
  $w = $b.Width; $h = $b.Height
  $c1 = $b.GetPixel(2, 2)
  $c2 = $b.GetPixel([int]($w/2), [int]($h/2))
  $c3 = $b.GetPixel($w-3, $h-3)
  Write-Host ($f + ' | ' + $w + 'x' + $h + ' | TL:' + $c1.R + ',' + $c1.G + ',' + $c1.B + ' | MID:' + $c2.R + ',' + $c2.G + ',' + $c2.B + ' | BR:' + $c3.R + ',' + $c3.G + ',' + $c3.B)
  $b.Dispose(); $i.Dispose()
}
