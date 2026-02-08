const fs = require('fs');

const csvPath = 'c:/Users/ASUS/Desktop/ekap-malzeme/2024 Birim Fiyatları/ÇŞB 2025 .csv';
const outPath = 'c:/Users/ASUS/Desktop/ekap-malzeme/data_2025.js';

try {
    // Read as UTF-8
    const data = fs.readFileSync(csvPath, 'utf8');
    const result = [];

    console.log(`File size: ${data.length} bytes`);

    let records = parseCSV(data);
    console.log(`Parsed ${records.length} records.`);

    records.forEach(row => {
        const id = row[0] ? row[0].trim() : '';
        if (!id || id.length < 3 || id.includes('Sıra No')) return;

        let description = row[5] ? row[5].trim() : '';
        description = description.replace(/[\r\n]+/g, ' ');

        let unit = '';
        let price = null;

        for (let i = 6; i < row.length; i++) {
            let col = row[i] ? row[i].trim() : '';
            if (!col) continue;
            if (!unit && isUnit(col)) {
                unit = col;
                continue;
            }
            if (isPrice(col)) {
                price = parsePrice(col);
                break;
            }
        }

        if (id && description && price !== null) {
            result.push({
                id: id,
                kurum: 'ÇŞB',
                tanim: description.replace(/"/g, ''),
                birim: unit || '-',
                fiyatlar: {
                    2025: price
                },
                analiz: [] // Required by app logic
            });
        }
    });

    console.log(`Extracted ${result.length} valid items.`);

    // Check specific items
    const missing = result.find(r => r.id === '10.480.1501');
    if (missing) {
        console.log('Found 10.480.1501:', missing.tanim);
    } else {
        console.log('10.480.1501 NOT FOUND');
    }

    const cit = result.find(r => r.tanim.toLowerCase().includes('çit'));
    if (cit) {
        console.log('Found item with "çit":', cit.id, cit.tanim.substring(0, 50) + '...');
    }

    const fileContent = `const EXTRA_DATA_2025 = ${JSON.stringify(result, null, 4)};\n`;
    fs.writeFileSync(outPath, fileContent, 'utf8');
    console.log(`Written to ${outPath}`);

} catch (err) {
    console.error('Error:', err);
}

function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentVal = '';
    let inQuote = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (inQuote) {
            if (char === '"') {
                if (nextChar === '"') {
                    currentVal += '"';
                    i++;
                } else {
                    inQuote = false;
                }
            } else {
                currentVal += char;
            }
        } else {
            if (char === '"') {
                inQuote = true;
            } else if (char === ';') {
                currentRow.push(currentVal);
                currentVal = '';
            } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
                currentRow.push(currentVal);
                rows.push(currentRow);
                currentRow = [];
                currentVal = '';
                if (char === '\r') i++;
            } else if (char === '\r') {
                currentRow.push(currentVal);
                rows.push(currentRow);
                currentRow = [];
                currentVal = '';
            } else {
                currentVal += char;
            }
        }
    }
    if (currentVal || currentRow.length > 0) {
        currentRow.push(currentVal);
        rows.push(currentRow);
    }
    return rows;
}

function isUnit(str) {
    const units = ['m³', 'm3', 'm²', 'm2', 'm', 'Ad', 'Adet', 'Sa', 'Saat', 'Ton', 'kg', 'lt', 'km', 'Gr', 'mt', 'Mt', 'takım'];
    return units.some(u => str.toLowerCase() === u.toLowerCase()) || (str.length <= 5 && !/\d/.test(str));
}

function isPrice(str) {
    return /^[0-9\.]+,\d{2}$/.test(str) || /^\d+,\d{2}$/.test(str);
}

function parsePrice(str) {
    let clean = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(clean);
}
