const fs = require('fs');

try {
    const content = fs.readFileSync('c:/Users/ASUS/Desktop/ekap-malzeme/data_2025.js', 'utf8');
    let jsonStr = content.replace(/^const\s+\w+\s*=\s*/, '');
    jsonStr = jsonStr.trim();
    if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);

    const data = JSON.parse(jsonStr);

    // Simulate App.js Search Logic
    const query = "çit";
    const lowerQuery = query.toLocaleLowerCase('tr-TR').trim();

    console.log(`Query: "${query}" -> Lower: "${lowerQuery}"`);

    const results = data.filter(item => {
        const tanim = item.tanim || "";
        // App.js logic
        const tanimMatch = tanim.toLocaleLowerCase('tr-TR').includes(lowerQuery);
        return tanimMatch;
    });

    console.log(`Found ${results.length} items matching "${query}".`);

    if (results.length > 0) {
        console.log("Top 3 Results:");
        results.slice(0, 3).forEach(r => console.log(`- ${r.id}: ${r.tanim.substring(0, 60)}...`));
    } else {
        console.log("NO MATCHES FOUND. Debugging...");
        // Debug casing
        const sample = data.find(d => d.tanim.toLowerCase().includes("çit"));
        if (sample) {
            console.log("Sample that should have matched:", sample.tanim);
            console.log("Sample lower('tr-TR'):", sample.tanim.toLocaleLowerCase('tr-TR'));
        }
    }

} catch (e) {
    console.error(e);
}
