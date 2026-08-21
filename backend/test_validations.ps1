$uri = "http://127.0.0.1:5000/api/reports"
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

# Test Case 1: Invalid File Format
Write-Host "--- Test Case 1: Invalid File Format ---" -ForegroundColor Yellow
$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"description`"",
    "",
    "Testing invalid file format",
    "--$boundary",
    "Content-Disposition: form-data; name=`"latitude`"",
    "",
    "15.0",
    "--$boundary",
    "Content-Disposition: form-data; name=`"longitude`"",
    "",
    "73.0",
    "--$boundary",
    "Content-Disposition: form-data; name=`"image`"; filename=`"test.txt`"",
    "Content-Type: text/plain",
    "",
    "This is not a valid image.",
    "--$boundary--"
) -join $LF

try {
    Invoke-RestMethod -Uri $uri -Method POST -Body $bodyLines -ContentType "multipart/form-data; boundary=$boundary"
} catch {
    $errRes = $_.Exception.Response
    $stream = $errRes.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Status: $($errRes.StatusCode)"
    Write-Host "Response: $($reader.ReadToEnd())"
}

# Test Case 2: Out of Bounds Coordinates
Write-Host "`n--- Test Case 2: Out of Bounds Coordinates ---" -ForegroundColor Yellow
$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"description`"",
    "",
    "Testing invalid coordinates",
    "--$boundary",
    "Content-Disposition: form-data; name=`"latitude`"",
    "",
    "95.0",  # Out of bounds
    "--$boundary",
    "Content-Disposition: form-data; name=`"longitude`"",
    "",
    "73.0",
    "--$boundary",
    "Content-Disposition: form-data; name=`"image`"; filename=`"Image088.jpg`"",
    "Content-Type: image/jpeg",
    "",
    "fake image bytes",
    "--$boundary--"
) -join $LF

try {
    Invoke-RestMethod -Uri $uri -Method POST -Body $bodyLines -ContentType "multipart/form-data; boundary=$boundary"
} catch {
    $errRes = $_.Exception.Response
    $stream = $errRes.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Status: $($errRes.StatusCode)"
    Write-Host "Response: $($reader.ReadToEnd())"
}

# Test Case 3: Valid Image Submission (Image088.jpg is a real file in parent dir)
Write-Host "`n--- Test Case 3: Valid Image Submission ---" -ForegroundColor Yellow
$filePath = "c:\Users\Pari\pari\Image088.jpg"
if (Test-Path $filePath) {
    $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
    $fileEnc = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetString($fileBytes)

    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"description`"",
        "",
        "Valid hazard submission test",
        "--$boundary",
        "Content-Disposition: form-data; name=`"latitude`"",
        "",
        "15.5414",
        "--$boundary",
        "Content-Disposition: form-data; name=`"longitude`"",
        "",
        "73.7431",
        "--$boundary",
        "Content-Disposition: form-data; name=`"image`"; filename=`"Image088.jpg`"",
        "Content-Type: image/jpeg",
        "",
        $fileEnc,
        "--$boundary--"
    ) -join $LF

    try {
        $res = Invoke-RestMethod -Uri $uri -Method POST -Body $bodyLines -ContentType "multipart/form-data; boundary=$boundary"
        $res | Format-List
    } catch {
        $errRes = $_.Exception.Response
        if ($null -ne $errRes) {
            $stream = $errRes.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            Write-Host "Status: $($errRes.StatusCode)"
            Write-Host "Response: $($reader.ReadToEnd())"
        } else {
            Write-Host $_
        }
    }
} else {
    Write-Host "Image088.jpg was not found, skipping Test Case 3."
}
