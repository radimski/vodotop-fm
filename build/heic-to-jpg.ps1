# Convert HEIC/HEIF photos to full-quality JPEG.
#
#   powershell -File build/heic-to-jpg.ps1
#
# iPhones shoot HEIC by default and no browser can display it, so these always
# have to be converted. sharp cannot help: its prebuilt libvips only decodes
# AVIF, not HEVC-coded HEIC. Windows' own imaging stack (WIC) can, which is what
# this uses — so it is Windows-only, and a one-off step before `npm run photos`.
#
# Each build/originals/<name>.heic becomes build/originals/<name>-orig.jpg at
# full resolution and quality 95. The "-orig" suffix matters: build/photos.js
# refuses to let a source file share a name with one of its outputs.

Add-Type -AssemblyName PresentationCore

$imgDir = Join-Path $PSScriptRoot 'originals' | Resolve-Path
$files = Get-ChildItem $imgDir -File -Include *.heic, *.heif -Recurse:$false -ErrorAction SilentlyContinue
if (-not $files) { $files = Get-ChildItem $imgDir -File | Where-Object { $_.Extension -in '.heic', '.heif' } }

if (-not $files) { Write-Host '  no .heic/.heif files in build/originals/'; exit 0 }

foreach ($f in $files) {
    $out = Join-Path $imgDir ($f.BaseName + '-orig.jpg')
    try {
        $uri = New-Object System.Uri($f.FullName)
        $decoder = [System.Windows.Media.Imaging.BitmapDecoder]::Create(
            $uri,
            [System.Windows.Media.Imaging.BitmapCreateOptions]::PreservePixelFormat,
            [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad)
        $frame = $decoder.Frames[0]

        $encoder = New-Object System.Windows.Media.Imaging.JpegBitmapEncoder
        $encoder.QualityLevel = 95
        $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($frame))

        $stream = [System.IO.File]::Open($out, 'Create')
        $encoder.Save($stream)
        $stream.Close()

        $kb = [math]::Round((Get-Item $out).Length / 1KB)
        Write-Host ("  {0} -> {1}  ({2}x{3}, {4} KB)" -f $f.Name, (Split-Path $out -Leaf), $frame.PixelWidth, $frame.PixelHeight, $kb)
    }
    catch {
        Write-Host ("  FAILED {0}: {1}" -f $f.Name, $_.Exception.Message.Split([char]10)[0])
    }
}
