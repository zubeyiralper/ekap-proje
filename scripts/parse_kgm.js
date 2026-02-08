const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_DIR = path.join(__dirname, '../birim fiyatlar');
const OUTPUT_FILE_2024 = path.join(__dirname, '../data_2024.js');
const OUTPUT_FILE_2025_PRICES = path.join(__dirname, '../data_2025_kgm_prices.js');

function parseKGMFile(filePath, year) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    const parsedData = [];

    // Regex to match lines like: 
    // "KGM/1901 Lastik tekerlekli traktörün... sa 515,99"
    // "50.205.1001 ... metre 104,38"

    // Strategy: Look for the last number in the line (Price), 
    // the word before it (Unit), 
    // and the start of the line (Poz No).

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Basic filter: must have a number at the end (the price)
        // Price format: 1.234,56 or 123,45
        const priceMatch = trimmed.match(/(\d+(?:\.\d{3})*(?:,\d{2})?)$/);

        if (priceMatch) {
            const priceStr = priceMatch[1];
            // Remove the price from the end
            const textWithoutPrice = trimmed.substring(0, trimmed.lastIndexOf(priceStr)).trim();

            // Now look for Unit at the end of the remaining text
            // Units usually: sa, gün, m3, ton, ad, kg, metre, m, vb.
            // Be careful, unit might be separated by spaces.
            // Let's assume unit is the last word.
            const unitMatch = textWithoutPrice.match(/\s+([a-zA-ZçÇğĞıİöÖşŞüÜ³²]+)$/);

            if (unitMatch) {
                const unit = unitMatch[1];
                const textWithoutUnit = textWithoutPrice.substring(0, textWithoutPrice.lastIndexOf(unit)).trim();

                // Now extract Poz No at the start
                // Poz No can be "KGM/1901", "50.205.1001", "03.501", etc.
                const pozMatch = textWithoutUnit.match(/^([a-zA-Z0-9\/\.\-]+)\s+(.+)/);

                if (pozMatch) {
                    const pozNo = pozMatch[1];
                    const description = pozMatch[2];

                    // Clean price (Turkish format to float)
                    const priceFloat = parseFloat(priceStr.replace(/\./g, '').replace(',', '.'));

                    parsedData.push({
                        id: pozNo,
                        tanim: description,
                        birim: unit,
                        fiyatlar: {
                            [year]: priceFloat
                        },
                        kurum: 'KGM'
                    });
                }
            }
        }
    });

    console.log(`Parsed ${parsedData.length} items from ${path.basename(filePath)} (${year})`);
    return parsedData;
}

// Processing
try {
    const data2024 = parseKGMFile(path.join(INPUT_DIR, '2024/KGM 2024.txt'), 2024);
    const data2025 = parseKGMFile(path.join(INPUT_DIR, '2025/KGM 2025.txt'), 2025);

    // Write 2024 Data
    const jsContent2024 = `const DATA_2024 = ${JSON.stringify(data2024, null, 2)};\n`;
    fs.writeFileSync(OUTPUT_FILE_2024, jsContent2024);
    console.log(`Created ${OUTPUT_FILE_2024}`);

    // Write 2025 Prices Data (Temporary, will be merged with Analysis later)
    const jsContent2025 = `const DATA_KGM_2025_PRICES = ${JSON.stringify(data2025, null, 2)};\n`;
    fs.writeFileSync(OUTPUT_FILE_2025_PRICES, jsContent2025);
    console.log(`Created ${OUTPUT_FILE_2025_PRICES}`);

} catch (err) {
    console.error("Error processing files:", err);
}
