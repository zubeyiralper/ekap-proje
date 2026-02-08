const fs = require('fs');

try {
    const content = fs.readFileSync('c:/Users/ASUS/Desktop/ekap-malzeme/data_2025.js', 'utf8');
    console.log('File Length:', content.length);
    console.log('Last 50 chars:', content.slice(-50));

    // Check strict syntax
    try {
        // Evaluate the content in a sandbox
        const sandbox = {};
        // Strip "const EXTRA_DATA_2025 =" part for JSON parse if possible, or just eval
        // It is `const EXTRA_DATA_2025 = [...];`
        // remove "const EXTRA_DATA_2025 = " and last ";"
        const jsonStr = content.replace('const EXTRA_DATA_2025 = ', '').trim().replace(/;$/, '');
        const data = JSON.parse(jsonStr);
        console.log('JSON Parse Success. Items:', data.length);

        const target = data.find(i => i.id === '10.480.1501');
        if (target) {
            console.log('Item Found:', target);
            console.log('ID Length:', target.id.length);
            console.log('ID Chars:', target.id.split('').map(c => c.charCodeAt(0)));
        } else {
            console.log('Item 10.480.1501 NOT found in parsed data');
        }

    } catch (e) {
        console.error('JSON Parse Error:', e.message);
    }
} catch (e) {
    console.error('File Read Error:', e);
}
