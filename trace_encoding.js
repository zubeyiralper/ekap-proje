const fs = require('fs');

const path = 'c:/Users/ASUS/Desktop/ekap-malzeme/2024 Birim Fiyatları/ÇŞB 2025 .csv';

try {
    const buffer = fs.readFileSync(path);
    // Find sequence 45 56 52 45 (EVRE)
    // Naive search
    for (let i = 0; i < buffer.length - 4; i++) {
        if (buffer[i] === 0x45 && buffer[i + 1] === 0x56 && buffer[i + 2] === 0x52 && buffer[i + 3] === 0x45) {
            console.log(`Found EVRE at index ${i}`);
            // Show 5 bytes before and 5 bytes after
            const slice = buffer.slice(item => Math.max(0, i - 5), i + 10);
            // Print surrounding bytes
            console.log('Surrounding bytes:', buffer.slice(i - 5, i + 5));
            break;
        }
    }
} catch (e) {
    console.error(e);
}
