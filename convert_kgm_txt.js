const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '2024 Birim Fiyatları', 'analizler.txt');
const outputPath = path.join(__dirname, 'data_kgm.js');

try {
    const rawContent = fs.readFileSync(inputPath, 'utf8');
    const lines = rawContent.split(/\r?\n/);

    const items = [];
    let currentItem = null;

    // Regex to detect the start of a line that likely contains the Price and Unit at the end
    // Looks for: Unit (ad, m3, ton, m, vs) + Price (number with comma/dots) at the very end of the line
    const priceLineRegex = /\s+([a-zA-ZçğıöşüÇĞİÖŞÜ23\/]+)\s+([\d\s\.]+,[\d]{2})$/;

    // Regex to detect Poz ID at start of line (e.g. KGM/1901 or 03.501)
    const pozIdRegex = /^(KGM\/[\d\w\.\-\/]+|[\d]{2}\.[\d\w\.\-\/]+)\s+/;

    lines.forEach((line, index) => {
        line = line.trim();
        if (!line) return;

        // Skip obvious header/footer junk
        if (line.includes('T.C.') || line.includes('Sayfa :') || line.match(/^\d+$/)) return;
        if (line.includes('POZ NO: İŞİN ADI')) return;

        // Check if this line ENDS with a price and unit
        const priceMatch = line.match(priceLineRegex);

        if (priceMatch) {
            // This line definitely ends an item (or is a single line item)
            // But wait, sometimes the description is split. 
            // If we have a currentItem accumulating description, this line ends it.

            const unit = priceMatch[1];
            // Remove dots and SPACES, then replace comma with dot
            const priceStr = priceMatch[2].replace(/\./g, '').replace(/\s/g, '').replace(',', '.');
            const price = parseFloat(priceStr);

            // Remove the unit and price from the line to get the text part
            let textPart = line.replace(priceLineRegex, '').trim();

            if (currentItem) {
                // If we were building an item, this might be the last line of it, OR a new item entirely.
                // If this line starts with a Poz ID, it's a NEW item that happens to be one line (or the end of previous is unrelated)
                // Actually, if we hit a price, that closes the entry.

                // Does this line START with a Poz ID?
                const idMatch = textPart.match(pozIdRegex);

                if (idMatch) {
                    // It's a new item on a single line. 
                    // Push previous if exists (though previous should have been closed if we handle logic right)
                    if (currentItem) {
                        // The previous item didn't find its price line? 
                        // Or maybe we treat 'currentItem' as "lines waiting for a price".
                    }

                    // Actually, simpler logic:
                    // Buffer lines until we hit a price line.
                    // But an item might span multiple lines BEFORE the price line.
                }
            }
        }
    });

    // Strategy B:
    // 1. Accumulate lines.
    // 2. When we hit a line ending with a price, we assume that's the end of the current block.
    // 3. The start of the block should be the line that started with a Poz ID.
    // 4. Everything in between is description.

    let buffer = [];

    lines.forEach(line => {
        line = line.trim();
        // Filters
        if (line.length < 3) return; // Skip page numbers etc
        if (line.includes('BİRİM FİYAT') || line.includes('İHALELİ') || line.includes('POZ NO:') || line.includes('T.C.')) return;

        // Does this line end with a price?
        const priceMatch = line.match(priceLineRegex);

        buffer.push({ line, priceMatch });
    });

    // Now process the buffer to extract items
    let processedItems = [];
    let currentBlock = [];

    for (let i = 0; i < buffer.length; i++) {
        const { line, priceMatch } = buffer[i];

        // If it starts with a Poz ID, it's definitely the start of something
        const startsWithId = line.match(pozIdRegex);

        if (startsWithId) {
            // If we were building a block that HASN'T closed, force close it (maybe missing price)
            if (currentBlock.length > 0) {
                // Check if previous block had a price? If not, it's junk or header text. discard.
                parseBlock(currentBlock, processedItems);
            }
            currentBlock = [buffer[i]];
        } else {
            // Continuation line?
            if (currentBlock.length > 0) {
                currentBlock.push(buffer[i]);
            }
        }

        // If this line has a price, it's the specific END of the current item. 
        // We should parse it immediately and clear block.
        // Wait, what if the price line is actually the NEXT line after ID?
        // E.g. 
        // Line 1: KGM/1234 Description part 1
        // Line 2: Description part 2 unit price

        if (priceMatch) {
            if (currentBlock.length > 0) {
                parseBlock(currentBlock, processedItems);
                currentBlock = [];
            }
        }
    }

    function parseBlock(block, results) {
        if (!block || block.length === 0) return;

        // The last line MUST have the price (based on our logic above)
        // actually, logic above says we parse when we HIT a price match.
        // So the last item in 'block' is the one with priceMatch.

        const lastItem = block[block.length - 1];
        if (!lastItem.priceMatch) return; // Valid items must end with price info

        // Extract Price/Unit from last line
        const unit = lastItem.priceMatch[1];
        const priceStr = lastItem.priceMatch[2].replace(/\./g, '').replace(/\s/g, '').replace(',', '.');
        const price = parseFloat(priceStr);

        // Clean the last line text
        let lastLineText = lastItem.line.replace(priceLineRegex, '').trim();

        // Combine all texts
        let fullText = "";

        // First line has the ID
        const firstLine = block[0].line;
        const idMatch = firstLine.match(pozIdRegex);

        if (!idMatch) return; // Must start with ID

        const id = idMatch[1];
        const firstLineDesc = firstLine.substring(idMatch[0].length).trim();

        fullText = firstLineDesc;

        for (let k = 1; k < block.length - 1; k++) {
            fullText += " " + block[k].line;
        }

        if (block.length > 1) {
            fullText += " " + lastLineText;
        }

        results.push({
            id: id,
            kurum: 'KGM',
            tanim: fullText,
            birim: unit,
            fiyatlar: { 2024: price } // File says 2024
        });
    }

    // Output
    const jsContent = `const KGM_DATA = ${JSON.stringify(processedItems, null, 2)};`;
    fs.writeFileSync(outputPath, jsContent, 'utf8');

    console.log(`Converted ${processedItems.length} items.`);

} catch (err) {
    console.error("Error:", err);
}
