const fs = require('fs');
const path = require('path');

const csvPath = 'c:/Users/ASUS/Desktop/ekap-malzeme/2024 Birim Fiyatları/ÇŞB 2025 .csv';

try {
    const data = fs.readFileSync(csvPath, 'utf8');
    const lines = data.split(/\r?\n/);

    console.log(`Searching in ${lines.length} lines...`);

    const targetId = '10.480.1501';
    const targetText = 'Çit';

    lines.forEach((line, index) => {
        if (line.includes(targetId) || line.toLowerCase().includes('çit')) {
            console.log(`Line ${index + 1}: ${line}`);
        }
    });

} catch (err) {
    console.error('Error:', err);
}
