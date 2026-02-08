const fs = require('fs');

const inFile = 'c:/Users/ASUS/Desktop/ekap-malzeme/2024 Birim Fiyatları/ÇŞB 2025 .csv';
const outFile = 'c:/Users/ASUS/Desktop/ekap-malzeme/2024 Birim Fiyatları/CSB_2025_UTF8.csv';

try {
    const buffer = fs.readFileSync(inFile);
    const length = buffer.length;
    let outStr = '';

    // CP1254 (Turkish) to Unicode mapping for specific ranges
    // Standard ASCII is same. High bit set is where we look.

    for (let i = 0; i < length; i++) {
        const byte = buffer[i];
        if (byte < 128) {
            outStr += String.fromCharCode(byte);
        } else {
            // Map common CP1254 chars
            switch (byte) {
                case 0xDD: outStr += 'İ'; break;
                case 0xFD: outStr += 'ı'; break;
                case 0xE7: outStr += 'ç'; break;
                case 0xC7: outStr += 'Ç'; break;
                case 0xF0: outStr += 'ğ'; break;
                case 0xD0: outStr += 'Ğ'; break;
                case 0xF6: outStr += 'ö'; break;
                case 0xD6: outStr += 'Ö'; break;
                case 0xFC: outStr += 'ü'; break;
                case 0xDC: outStr += 'Ü'; break;
                case 0xDE: outStr += 'Ş'; break;
                case 0xFE: outStr += 'ş'; break;
                // Common punctuation/other in 1254
                case 0x93: outStr += '“'; break;
                case 0x94: outStr += '”'; break;
                case 0x91: outStr += '‘'; break;
                case 0x92: outStr += '’'; break;
                default:
                    // Fallback to ISO-8859-1 mapping or just keep as is? 
                    // To be safe, let's keep it as a generic char code if not matched, 
                    // but CP1254 is a superset of ISO-8859-1 mostly except for the turkish chars.
                    // Doing a direct parse for others might result in weird chars, but readable.
                    outStr += String.fromCharCode(byte);
            }
        }
    }

    fs.writeFileSync(outFile, outStr, 'utf8');
    console.log(`Converted ${length} bytes to UTF-8 file: ${outFile}`);

} catch (err) {
    console.error(err);
}
