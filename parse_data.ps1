$AllData = @()

# Locate Directory safely
$dir = Get-ChildItem -Directory | Where-Object { $_.Name -like "*2024*" } | Select-Object -First 1
Write-Host "Found Directory: $($dir.FullName)"

# --- 1. OGM Processing ---
Write-Host "Processing OGM..."
$ogmFile = Get-ChildItem -Path $dir.FullName -Filter "OGM.csv" | Select-Object -First 1
if ($ogmFile) {
    $ogm_lines = Get-Content $ogmFile.FullName -Encoding Default
} else { $ogm_lines = @() }

foreach ($line in $ogm_lines) {
    # Pattern: Sira;Poz;Tanim;Birim;Fiyat
    if ($line -match "^(?:\d+);([\d\.]+);(.*?);(.*?);([\d\.,]+)") {
        $id = $matches[1]
        $desc = $matches[2].Trim('"').Trim()
        $unit = $matches[3]
        $priceStr = $matches[4] -replace '\.', '' -replace ',', '.'

        if ($desc.Length -gt 2) {
            $obj = @{
                id = $id
                kurum = "OGM"
                tanim = $desc
                birim = $unit
                fiyatlar = @{ "2024" = 0 }
                analiz = @()
            }
            try { $obj.fiyatlar["2024"] = [double]$priceStr } catch {}
            $AllData += $obj
        }
    }
}

# --- 2. KGM Processing (Spaced, Multi-line support) ---
Write-Host "Processing KGM..."
$kgmFile = Get-ChildItem -Path $dir.FullName -Filter "KGM.csv" | Select-Object -First 1
if ($kgmFile) {
    $kgm_lines = Get-Content $kgmFile.FullName -Encoding Default
} else { $kgm_lines = @() }
$currentKgm = $null

foreach ($line in $kgm_lines) {
    # Start Line: KGM/15.001 ...
    if ($line -match '"?(KGM/[\w\.\/-]+)\s+(.*)') {
        $id = $matches[1]
        $desc = $matches[2].Trim()
        # Remove trailing quote if exists
        if ($desc.EndsWith('"')) { $desc = $desc.Substring(0, $desc.Length-1) }
        
        $currentKgm = @{ id = $id; kurum = "KGM"; tanim = $desc; analiz = @() }
    }
    
    # End Line detection: Look for Price pattern at end of line
    # " ... m3 1 234,56" or " ... ton 150,00"
    # Regex: Spaces, Unit, Spaces, Price, End
    if ($currentKgm -ne $null -and $line -match '\s+([a-zA-Z0-9\^³]+)\s+([\d\s]+,[\d]{2})"?$') {
        $unit = $matches[1]
        $priceRaw = $matches[2]
        $priceClean = $priceRaw -replace '\s', '' -replace ',', '.'
        
        $currentKgm["birim"] = $unit
        $currentKgm["fiyatlar"] = @{ "2024" = 0 }
        
        try { $currentKgm.fiyatlar["2024"] = [double]$priceClean } catch {}
        
        $AllData += $currentKgm
        $currentKgm = $null
    }
    elseif ($currentKgm -ne $null -and -not ($line -match 'KGM/')) {
       # Append text to description if multi-line and not a new item
       $cleanedLine = $line.Trim().Trim('"')
       if ($cleanedLine.Length -gt 0) {
          $currentKgm.tanim += " " + $cleanedLine
       }
    }
}

# --- 3. CSB Processing (Spaced, Single Line mostly) ---
Write-Host "Processing CSB..."
# Use wildcard to avoid encoding issues with 'ÇŞB'
$csbFile = Get-ChildItem -Path $dir.FullName -Filter "*B.csv" | Where-Object { $_.Name -notlike "*O*" -and $_.Name -notlike "*K*" } | Select-Object -First 1
if ($csbFile) {
    $csb_lines = Get-Content $csbFile.FullName -Encoding Default
} else { $csb_lines = @() }
foreach ($line in $csb_lines) {
   # Look for pattern: 15.120.1001 (space) Desc (space) Unit (space) Price
   if ($line -match '"?((?:\d{2}\.)+\d+)\s+(.*?)\s{2,}(\S+)\s{2,}([\d\.,]+)"?') {
       $id = $matches[1]
       $desc = $matches[2].Trim()
       $unit = $matches[3]
       $priceRaw = $matches[4]
       
       # CSB prices are like 38,25 (no thousands dot usually for small numbers, but check)
       # Assuming standard tr-TR: dot=thousand, comma=decimal
       $priceClean = $priceRaw -replace '\.', '' -replace ',', '.'

       $obj = @{
           id = $id
           kurum = "ÇŞB"
           tanim = $desc
           birim = $unit
           fiyatlar = @{ "2024" = 0 }
           analiz = @()
       }
       try { $obj.fiyatlar["2024"] = [double]$priceClean } catch {}
       
       $AllData += $obj
   }
}

Write-Host "Total Items: $($AllData.Count)"

# Export to JS
$jsonContent = $AllData | ConvertTo-Json -Depth 4
$jsContent = "const EXTRA_DATA = $jsonContent;"
$jsContent | Out-File -Encoding UTF8 "data_2024.js"
