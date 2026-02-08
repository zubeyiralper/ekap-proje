const fs = require('fs');

// Mock data loading
function loadJs(path) {
    let content = fs.readFileSync(path, 'utf8');
    // Hack to make const global in eval logic for node script
    content = content.replace(/const POZ_DATA/g, 'global.POZ_DATA');
    content = content.replace(/const EXTRA_DATA/g, 'global.EXTRA_DATA');
    content = content.replace(/const EXTRA_DATA_2025/g, 'global.EXTRA_DATA_2025');
    // remove '= [' and replace with 'global.XYZ = [' if needed, but the above regex handles the var name. 
    // Wait, "const POZ_DATA = [" -> "global.POZ_DATA = [" 
    return content;
}

// Global scope simulation
global.POZ_DATA = [];
global.EXTRA_DATA = [];
global.EXTRA_DATA_2025 = [];

try {
    // 1. Load data.js
    const d1 = loadJs('c:/Users/ASUS/Desktop/ekap-malzeme/data.js');
    eval(d1); // Defines POZ_DATA
    console.log(`Initial POZ_DATA size: ${POZ_DATA.length}`);

    // 2. Load data_2024.js
    const d2 = loadJs('c:/Users/ASUS/Desktop/ekap-malzeme/data_2024.js');
    eval(d2); // Defines EXTRA_DATA
    console.log(`EXTRA_DATA size: ${EXTRA_DATA.length}`);

    // 3. Load data_2025.js
    const d3 = loadJs('c:/Users/ASUS/Desktop/ekap-malzeme/data_2025.js');
    eval(d3); // Defines EXTRA_DATA_2025
    console.log(`EXTRA_DATA_2025 size: ${EXTRA_DATA_2025.length}`);

    // 4. Run Merge Logic (Copied from app.js)
    if (typeof EXTRA_DATA !== 'undefined' && Array.isArray(EXTRA_DATA)) {
        let mergedCount = 0;
        EXTRA_DATA.forEach(newItem => {
            const searchId = newItem.id.trim();
            const existing = POZ_DATA.find(p => p.id === searchId);
            if (existing) {
                if (!existing.fiyatlar) existing.fiyatlar = {};
                if (newItem.fiyatlar && newItem.fiyatlar[2024] > 0) {
                    existing.fiyatlar[2024] = newItem.fiyatlar[2024];
                }
            } else {
                POZ_DATA.push(newItem);
                mergedCount++;
            }
        });
        console.log(`Merge 2024 complete. New Items: ${mergedCount}`);
    }

    if (typeof EXTRA_DATA_2025 !== 'undefined' && Array.isArray(EXTRA_DATA_2025)) {
        let mergedCount2025 = 0;
        let updatedCount2025 = 0;
        EXTRA_DATA_2025.forEach(newItem => {
            const searchId = newItem.id.trim();
            const existing = POZ_DATA.find(p => p.id === searchId);
            if (existing) {
                if (!existing.fiyatlar) existing.fiyatlar = {};
                if (newItem.fiyatlar && newItem.fiyatlar[2025] !== null) {
                    existing.fiyatlar[2025] = newItem.fiyatlar[2025];
                    updatedCount2025++;
                }
                if (!existing.birim || existing.birim === '-') existing.birim = newItem.birim;
            } else {
                POZ_DATA.push(newItem);
                mergedCount2025++;
            }
        });
        console.log(`Merge 2025 complete. New Items: ${mergedCount2025}, Updated: ${updatedCount2025}`);
    }

    // 5. Verify Total
    console.log(`Final POZ_DATA size: ${POZ_DATA.length}`);

    // 6. Verify specific item (10.100.1001 Taşcı ustası)
    const item = POZ_DATA.find(p => p.id === '10.100.1001');
    if (item) {
        console.log('Verification Item Found: 10.100.1001');
        console.log('Tanim:', item.tanim);
        console.log('Fiyat 2025:', item.fiyatlar[2025]);
        if (item.fiyatlar[2025] === 250.00) {
            console.log('SUCCESS: Price matches CSV (250,00 -> 250.00)');
        } else {
            console.log('FAILURE: Price mismatch');
        }
    } else {
        console.log('FAILURE: Item 10.100.1001 not found');
    }

} catch (e) {
    console.error('Verification Error:', e);
}
