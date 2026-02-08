const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_FILE_CSB = path.join(__dirname, '../birim fiyatlar/2025/Analizler/ÇŞB 2025 Analiz.txt');
const INPUT_FILE_KGM_PRICES = path.join(__dirname, '../data_2025_kgm_prices.js');
const OUTPUT_FILE_FINAL = path.join(__dirname, '../data_2025.js');

function parseCSBAnalysis(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    const parsedItems = [];

    // State machine variables
    let currentItem = null;
    let captureAnalysis = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // 1. Detect New Item Start (Poz No)
        // Format: "Poz No" followed by "15.100.1001" on next line or same line
        if (line === 'Poz No') {
            // Check next line for actual ID
            if (i + 1 < lines.length) {
                const nextLine = lines[i + 1].trim();
                // Basic ID validation (contains dots or numbers)
                if (nextLine.match(/^[0-9a-zA-Z\.\-\/]+$/)) {
                    // Save previous item
                    if (currentItem) {
                        finalizeItem(currentItem);
                        parsedItems.push(currentItem);
                    }

                    // Start new item
                    currentItem = {
                        id: nextLine,
                        tanim: '',
                        birim: '',
                        fiyat: 0,
                        analiz: [],
                        kurum: 'ÇŞB' // Default, will override if merged
                    };
                    i++; // Skip the ID line
                    continue;
                }
            }
        }

        if (!currentItem) continue;

        // 2. Capture Description (Analizin Adı)
        if (line === 'Analizin Adı') {
            // Description follows
            // It might be multi-line until "Tanımı Ölçü Birimi..." header
            let descLines = [];
            let j = i + 1;
            while (j < lines.length && !lines[j].trim().startsWith('Tanımı Ölçü Birimi')) {
                const descLine = lines[j].trim();
                if (descLine && descLine !== 'Poz No' && descLine !== currentItem.id) {
                    descLines.push(descLine);
                }
                j++;
            }
            if (descLines.length > 0) {
                currentItem.tanim = descLines.join(' ');
                i = j - 1; // Advance main loop
            }
            continue;
        }

        // 3. Capture Unit (Ölçü Birimi)
        // Usually follows "Tanımı Ölçü Birimi Miktarı Birim Fiyatı" -> "Ölçü Birimi" -> "m³" or "Ton"
        if (line === 'Ölçü Birimi') {
            if (i + 1 < lines.length) {
                const unitLine = lines[i + 1].trim();
                // Validate common units to ensure we grabbed the right line
                if (['m³', 'm2', 'm', 'Ad', 'Ton', 'kg', 'sa', 'Gün'].includes(unitLine) || unitLine.length < 10) {
                    currentItem.birim = unitLine;
                    i++;
                }
            }
            continue;
        }

        // 4. Capture Analysis Rows
        // Header: "Tanımı Ölçü Birimi Miktarı Birim Fiyatı" (Already skipped above mostly)
        // Rows match regex like: "10.100.1062 Düz işçi Sa 1 165,00 165,00"

        // Regex for Analysis Row:
        // Start with Code (digits.digits...), Description (text), Unit (text), Amount (number), UnitPrice (number), Total (number)
        // Example: 10.100.1062 Düz işçi Sa 1 165,00 165,00
        // Important: Description can contain spaces. Unit is short (Sa, m³, etc). Numbers have comma decimals.

        // Let's try to match from end of line backwards for numbers
        const rowMatch = line.match(/^([0-9a-zA-Z\.\-\/]+)\s+(.+?)\s+([a-zA-ZçÇğĞıİöÖşŞüÜ³²]+)\s+([\d\.,]+)\s+([\d\.,]+)\s+([\d\.,]+)$/);

        if (rowMatch) {
            // It looks like an analysis row
            const kod = rowMatch[1];
            const tanim = rowMatch[2];
            const birim = rowMatch[3];
            const miktar = rowMatch[4];
            // const birimFiyat = rowMatch[5]; // We store this if needed, but Total is usually enough
            const tutar = rowMatch[6]; // Total for this row

            currentItem.analiz.push({
                kod: kod,
                tanim: tanim,
                birim: birim,
                miktar: miktar.replace(/\./g, '').replace(',', '.'), // Normalize number string
                tutar: parseFloat(tutar.replace(/\./g, '').replace(',', '.'))
            });
            continue;
        }

        // 5. Capture Final Price (Base Price)
        // Usually in "1 m³ Fiyatı" or "1 Ad Fiyatı" or "1 Ton Fiyatı" followed by number on next line
        // But the text file structure puts the price at the bottom: 
        // "1 m³ Fiyatı"
        // "30,63" (Total)
        // "6,13" (Profit)
        // "24,50" (Cost) - wait, check order in file.
        // File says:
        // Malzeme + İşçilik Tutarı -> 24,50
        // 25% Profit -> 6,13
        // 1 m3 Fiyatı -> 30,63
        // So the line AFTER "1 ... Fiyatı" is likely the final price.

        if (line.match(/^1\s+.+\s+Fiyatı$/)) {
            if (i + 1 < lines.length) {
                const priceLine = lines[i + 1].trim();
                // Matches numbers: 30,63 or 1.234,56
                if (priceLine.match(/^[\d\.,]+$/)) {
                    currentItem.fiyat = parseFloat(priceLine.replace(/\./g, '').replace(',', '.'));
                }
            }
        }
    }

    // Push last item
    if (currentItem) {
        finalizeItem(currentItem);
        parsedItems.push(currentItem);
    }

    console.log(`Parsed ${parsedItems.length} analysis items from ÇŞB.`);
    return parsedItems;
}

function finalizeItem(item) {
    if (item.analiz && item.analiz.length > 0) {
        // Filter out junk rows if any
    }
}

// Processing
try {
    const csbData = parseCSBAnalysis(INPUT_FILE_CSB);

    // Load KGM 2025 Prices to merge
    // Since we are inside Node, and the file is JS with "const DATA_...", we can't require it directly easily as JSON.
    // We'll read it as text for simplicity or rely on the previous logic.
    // The requirement is to MERGE.
    // If an item exists in KGM, we prefer KGM Price + ÇŞB Analysis (if KGM analysis is missing).

    let kgmPrices = [];
    if (fs.existsSync(INPUT_FILE_KGM_PRICES)) {
        const kgmContent = fs.readFileSync(INPUT_FILE_KGM_PRICES, 'utf-8');
        // Hacky way to extract JSON from "const X = [...];"
        const jsonStr = kgmContent.substring(kgmContent.indexOf('['), kgmContent.lastIndexOf(']') + 1);
        kgmPrices = JSON.parse(jsonStr);
    }

    // Merge Logic
    // 1. Start with KGM Prices (Primary Source for 2025 Prices)
    // 2. Augment with ÇŞB Analysis and ÇŞB items not in KGM

    const finalMap = new Map();

    // Add CSB items first
    csbData.forEach(item => {
        finalMap.set(item.id, {
            id: item.id,
            tanim: item.tanim,
            birim: item.birim,
            fiyatlar: { 2025: item.fiyat },
            analiz: item.analiz,
            kurum: 'ÇŞB'
        });
    });

    // Merge KGM items
    kgmPrices.forEach(kgmItem => {
        if (finalMap.has(kgmItem.id)) {
            // Update existing CSB item with KGM Price and Info
            const existing = finalMap.get(kgmItem.id);
            existing.kurum = 'KGM'; // It's in KGM list, so mark as KGM
            existing.tanim = kgmItem.tanim; // Prefer KGM Description
            existing.birim = kgmItem.birim;
            existing.fiyatlar[2025] = kgmItem.fiyatlar[2025]; // Override price
            // Keep analysis from CSB
        } else {
            // Add new KGM item (No analysis available yet)
            finalMap.set(kgmItem.id, {
                id: kgmItem.id,
                tanim: kgmItem.tanim,
                birim: kgmItem.birim,
                fiyatlar: kgmItem.fiyatlar,
                analiz: [],
                kurum: 'KGM'
            });
        }
    });

    const finalData = Array.from(finalMap.values());

    const jsContent = `const DATA_2025 = ${JSON.stringify(finalData, null, 2)};\n`;
    fs.writeFileSync(OUTPUT_FILE_FINAL, jsContent);
    console.log(`Created ${OUTPUT_FILE_FINAL} with ${finalData.length} items.`);

} catch (err) {
    console.error("Error processing files:", err);
}
