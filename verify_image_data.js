const fs = require('fs');

try {
    const content = fs.readFileSync('c:/Users/ASUS/Desktop/ekap-malzeme/data_2025.js', 'utf8');
    // Proper strip: remove "const EXTRA_DATA_2025 =" and trim trailing semicolon
    let jsonStr = content.replace(/^const\s+\w+\s*=\s*/, '');
    jsonStr = jsonStr.trim();
    if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);

    const data = JSON.parse(jsonStr);

    const targets = [
        { id: '15.555.1001', expected: 537.64 },
        { id: '15.555.1002', expected: 625.64 },
        { id: '15.550.1201', expected: 134.89 },
        { id: '15.560.1002', expected: 4592.50 } // From image RÖGAR KAPAĞI ve IZGARA
    ];

    targets.forEach(t => {
        const found = data.find(p => p.id === t.id);
        if (found) {
            const price = found.fiyatlar['2025'];
            const match = Math.abs(price - t.expected) < 0.1;
            console.log(`ID: ${t.id} | DB Price: ${price} | Image Price: ${t.expected} | Match: ${match}`);
        } else {
            console.log(`ID: ${t.id} NOT FOUND in DB`);
        }
    });

} catch (e) {
    console.error(e);
}
