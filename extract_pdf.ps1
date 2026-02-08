$ErrorActionPreference = "Stop"
try {
    Write-Host "Starting Word Application..."
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    # wdAlertsNone = 0
    $word.DisplayAlerts = 0

    # Find KGM PDF
    $dir = Get-ChildItem -Directory | Where-Object { $_.Name -like "*2024*" } | Select-Object -First 1
    if (!$dir) { throw "Directory not found" }
    
    $pdf = Get-ChildItem -Path $dir.FullName -Filter "KGM.pdf" | Select-Object -First 1

    if (!$pdf) {
        Write-Host "PDF not found!"
        $word.Quit()
        exit
    }

    Write-Host "Opening PDF: $($pdf.Name) (This takes time)..."
    # Open(FileName, ConfirmConversions=False, ReadOnly=True)
    $doc = $word.Documents.Open($pdf.FullName, $false, $true) 
    
    Write-Host "Extracting Text..."
    $text = $doc.Content.Text
    
    # Save to file
    $outFile = "kgm_raw.txt"
    $text | Out-File -Encoding UTF8 $outFile
    
    Write-Host "Success! Text saved to $outFile"
    
    $doc.Close($false)
    $word.Quit()
}
catch {
    Write-Error "Failed: $_"
    if ($word) { 
        try { $word.Quit() } catch {}
    }
}
