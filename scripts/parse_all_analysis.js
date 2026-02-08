const fs = require('fs');
const path = require('path');

// Configuration
const CSB_ANALYSIS_FILE = path.join(__dirname, '../birim fiyatlar/2025/Analizler/ÇŞB 2025 Analiz.txt');
const VGM_ANALYSIS_FILE = path.join(__dirname, '../birim fiyatlar/2025/Analizler/VGM 2025 Analiz.txt');

// Input (Prices from previous step)
const INPUT_PRICES_FILE = path.join(__dirname, '../data_2025_prices_temp.js');

// Final Output
const OUTPUT_FILE_FINAL = path.join(__dirname, '../data_2025.js');

// ---- GENERIC PARSER FOR STANDARD ANALYSIS FORMAT ----
// Works for ÇŞB and likely VGM if format is similar
function parseAnalysisText(filePath, institutionName) {
    console.log(`Parsing analysis for ${institutionName} from ${path.basename(filePath)}...`);
    if (!fs.existsSync(filePath)) {
        console.log("File not found, skipping.");
        return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    const parsedItems = [];

    // State machine
    let currentItem = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // 1. New Item Detection
        // "Poz No" followed by ID
        if (line === 'Poz No') {
            if (i + 1 < lines.length) {
                const nextLine = lines[i + 1].trim();
                // Basic ID validation
                if (nextLine.length > 3 && nextLine.match(/^[0-9a-zA-Z\.\-\/]+$/)) {
                    if (currentItem) parsedItems.push(currentItem);

                    currentItem = {
                        id: nextLine,
                        tanim: '',
                        birim: '',
                        fiyat: 0,
                        analiz: [],
                        kurum: institutionName
                    };
                    i++;
                    continue;
                }
            }
        }

        if (!currentItem) continue;

        // 2. Description
        if (line === 'Analizin Adı') {
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
                i = j - 1;
            }
            continue;
        }

        // 3. Unit
        if (line === 'Ölçü Birimi') {
            if (i + 1 < lines.length) {
                const unitLine = lines[i + 1].trim();
                if (['m³', 'm2', 'm', 'Ad', 'Ton', 'kg', 'sa', 'Gün'].includes(unitLine) || unitLine.length < 10) {
                    currentItem.birim = unitLine;
                    i++;
                }
            }
            continue;
        }

        // 4. Analysis Rows
        // Format: "Code Description Unit Amount UnitPrice Total"
        // Regex needs to be flexible for VGM which might differ slightly
        // Let's use the same robust regex from before looking for trailing numbers

        // Regex: (Code) (Description...) (Unit) (Amount) (UnitPrice) (Total)
        // Groups: 1=Code, 2=Desc, 3=Unit, 4=Amount, 6=Total
        // 4. Analysis Rows
        // Regex: (Code) (Description...) (Unit) (Amount) (UnitPrice) (Total)
        const rowMatch = line.match(/^([0-9a-zA-Z\.\-\/]+)\s+(.+?)\s+([a-zA-ZçÇğĞıİöÖşŞüÜ³²]+)\s+([\d\.,]+)\s+([\d\.,]+)\s+([\d\.,]+)$/);

        if (rowMatch) {
            currentItem.analiz.push({
                type: 'row',
                kod: rowMatch[1],
                tanim: rowMatch[2],
                birim: rowMatch[3],
                miktar: rowMatch[4].replace(/\./g, '').replace(',', '.'),
                tutar: parseFloat(rowMatch[6].replace(/\./g, '').replace(',', '.'))
            });
            continue;
        }

        // 5. Section Headers (Text Rows)
        // If we are inside an item, and the line is not a standard keyword, capture it as a header.
        // Filter out noise:
        const noise = [
            'Poz No', 'Analizin Adı', 'Tanımı Ölçü Birimi', 'Ölçü Birimi',
            'Tutarı (TL)', 'Genel Fiyat Analizi', 'Malzeme + İşçilik',
            'Yüklenici kârı', '1.01.2025', 'Yapım Şartları', 'Ölçü:', 'Not:', 'Sayfa No',
            'İÇİNDEKİLER', 'Birim Fiyatı', 'Miktarı'
        ];

        // Also filter footer calculation lines like "1 m³ Fiyatı" or single numbers
        if (line.match(/^1\s+.+\s+Fiyatı$/) || line.match(/^[\d\.,]+$/) || line.match(/^-\d+-$/)) {
            // Let logic 5 (Final Price) handle "Fiyatı", ignore numbers
        } else if (!noise.some(n => line.includes(n)) && line.length > 2) {
            // Assume it's a section header or note
            // Check if it's the item definition repeating (sometimes happens) ?
            // For safety, only capture if we have started parsing rows? 
            // Or just capture all text?
            // Let's capture it.
            currentItem.analiz.push({
                type: 'header',
                tanim: line
            });
        }

        // 6. Final Price (Re-numbered)
        if (line.match(/^1\s+.+\s+Fiyatı$/)) {
            if (i + 1 < lines.length) {
                const priceLine = lines[i + 1].trim();
                if (priceLine.match(/^[\d\.,]+$/)) {
                    currentItem.fiyat = parseFloat(priceLine.replace(/\./g, '').replace(',', '.'));
                }
            }
        }
    }

    if (currentItem) parsedItems.push(currentItem);
    console.log(`Parsed ${parsedItems.length} items from ${path.basename(filePath)}`);
    return parsedItems;
}


// ---- VGM SPECIFIC PARSER ----
function parseVGMAnalysis(filePath) {
    console.log(`Parsing VGM analysis from ${path.basename(filePath)}...`);
    if (!fs.existsSync(filePath)) {
        console.log("File not found, skipping.");
        return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    const parsedItems = [];

    let currentItem = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // 1. Detect Item Header
        // Format: "V.0101 M³" or "V.0006/01 M²"
        // Regex: Starts with V., followed by code characters, space, then unit words
        const headerMatch = line.match(/^(V\.[0-9A-Z\/\.\-]+)\s+(.+)$/);

        if (headerMatch) {
            // Check if it's really a header? (Short line)
            if (line.length < 50) {
                if (currentItem) parsedItems.push(currentItem);

                currentItem = {
                    id: headerMatch[1],
                    tanim: '', // Description often confusingly placed, maybe we skip for now or try to finding "Tanımı" header nearby?
                    birim: headerMatch[2],
                    fiyat: 0,
                    analiz: [],
                    kurum: 'VGM'
                };
                continue;
            }
        }

        if (!currentItem) continue;

        // 2. Analysis Rows
        // Format: "04.V004/01 Portland çimentosu... TON 0,25"
        // Codes usually start with digit then dot then V or similar.
        // Regex: Start with (digits . V or digits . digits), then text, then unit, then amount.
        // Note: Prices seem missing in this text file, only amounts.

        // Example: 04.V001/1 Su M³ 0,215
        const rowMatch = line.match(/^([0-9A-Za-z\.\/]+)\s+(.+?)\s+([a-zA-ZçÇğĞıİöÖşŞüÜ³²]+)\s+([\d,]+)$/);

        if (rowMatch) {
            // Valid row
            currentItem.analiz.push({
                kod: rowMatch[1],
                tanim: rowMatch[2],
                birim: rowMatch[3],
                miktar: rowMatch[4].replace(',', '.'),
                tutar: 0 // Price missing
            });
        }
    }

    if (currentItem) parsedItems.push(currentItem);
    console.log(`Parsed ${parsedItems.length} items from VGM.`);
    return parsedItems;
}

// ---- EXECUTION ----

// 1. Parse Analyses
const csbAnalyses = parseAnalysisText(CSB_ANALYSIS_FILE, 'ÇŞB');
const vgmAnalyses = parseVGMAnalysis(VGM_ANALYSIS_FILE);

// Combine Analyses
const allAnalyses = [...csbAnalyses, ...vgmAnalyses];
const analysisMap = new Map();
allAnalyses.forEach(item => {
    analysisMap.set(item.id, item);
});


// 2. Load and Merge with Prices
let priceData = [];
if (fs.existsSync(INPUT_PRICES_FILE)) {
    try {
        const content = fs.readFileSync(INPUT_PRICES_FILE, 'utf-8');
        const jsonStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
        priceData = JSON.parse(jsonStr);
    } catch (e) {
        console.error("Error reading temp price file:", e);
    }
}

// Merge Logic:
// Initialize map with Price Data
const finalMap = new Map();

priceData.forEach(pItem => {
    // Check if we have analysis for this item
    const analysisItem = analysisMap.get(pItem.id);

    const newItem = {
        id: pItem.id,
        kurum: pItem.kurum || (analysisItem ? analysisItem.kurum : 'Bilinmeyen'),
        tanim: pItem.tanim, // Prefer Price List description often cleaner, or check length?
        birim: pItem.birim,
        fiyatlar: pItem.fiyatlar,
        analiz: []
    };

    // If analysis exists, merge details
    if (analysisItem) {
        newItem.analiz = analysisItem.analiz;
        // Ensure 2025 price is set if missing in price list (unlikely but possible)
        if (!newItem.fiyatlar[2025] && analysisItem.fiyat) {
            newItem.fiyatlar[2025] = analysisItem.fiyat;
        }

        // If price list description is very short/empty, use analysis description
        if (!newItem.tanim || newItem.tanim.length < 5) {
            newItem.tanim = analysisItem.tanim;
        }
    }

    finalMap.set(newItem.id, newItem);
});

// Add Analysis items that might not be in the Price List (Pure analysis items)
allAnalyses.forEach(aItem => {
    if (!finalMap.has(aItem.id)) {
        finalMap.set(aItem.id, {
            id: aItem.id,
            kurum: aItem.kurum,
            tanim: aItem.tanim,
            birim: aItem.birim,
            fiyatlar: { 2025: aItem.fiyat },
            analiz: aItem.analiz
        });
    }
});


// Write Final Output
const finalData = Array.from(finalMap.values());
const jsContent = `const DATA_2025 = ${JSON.stringify(finalData, null, 2)};\n`;
fs.writeFileSync(OUTPUT_FILE_FINAL, jsContent);
console.log(`\nCreated ${OUTPUT_FILE_FINAL} with ${finalData.length} total items.`);
