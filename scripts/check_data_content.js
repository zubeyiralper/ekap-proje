const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../data_2025.js');
console.log("Checking file:", FILE_PATH);

try {
    const content = fs.readFileSync(FILE_PATH, 'utf-8');
    const jsonStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
    const data = JSON.parse(jsonStr);

    console.log(`Total items: ${data.length}`);

    const v003 = data.find(i => i.id === '04.V003/01');
    if (v003) {
        console.log("FOUND V003:", JSON.stringify(v003, null, 2));
    } else {
        console.log("V003 NOT FOUND in data_2025.js");
        // Check fuzzy
        const fuzzy = data.filter(i => i.id && i.id.includes('V003'));
        console.log("Fuzzy match V003:", fuzzy.length, fuzzy.map(i => i.id));
    }

} catch (e) {
    console.error("Error:", e);
}
