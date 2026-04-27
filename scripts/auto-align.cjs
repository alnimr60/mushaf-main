const fs = require('fs');

async function autoAlign(pageNum, surahNum, startAyah, endAyah) {
    const sequences = JSON.parse(fs.readFileSync('scratch/glyph_sequences.json', 'utf8'));
    const mapping = JSON.parse(fs.readFileSync('src/data/glyph_mapping.json', 'utf8'));
    const warshData = JSON.parse(fs.readFileSync('scratch/warsh_text.json', 'utf8'));

    // 1. Get Reference Text for specific verses
    const verses = warshData.quran.filter(v => v.chapter == surahNum && v.verse >= startAyah && v.verse <= endAyah);
    let refText = verses.map(v => v.text).join(' ');
    // Atomize reference text (split into characters including harakat)
    const refAtoms = [...refText].filter(c => c !== ' ');

    // 2. Get Glyph Sequence for the page
    const pageGlyphs = sequences[pageNum];
    if (!pageGlyphs) return "Page not found";
    
    // Simple line grouping
    const lines = {};
    pageGlyphs.forEach(g => {
        let y = Math.round(g.y / 10) * 10;
        if (!lines[y]) lines[y] = [];
        lines[y].push(g);
    });
    const sortedY = Object.keys(lines).sort((a, b) => a - b);
    
    const pageAtoms = [];
    sortedY.forEach(y => {
        const line = lines[y];
        line.sort((a, b) => b.x - a.x); // RTL
        line.forEach(g => pageAtoms.push(g));
    });

    console.log(`Reference Atoms: ${refAtoms.length}`);
    console.log(`PDF Atoms: ${pageAtoms.length}`);

    // 3. Sliding Window / Greedy Match
    // This is a simplified version. We look for segments where we know most characters.
    let suggestions = {};
    
    let pIdx = 0;
    let rIdx = 0;
    
    while(pIdx < pageAtoms.length && rIdx < refAtoms.length) {
        const glyph = pageAtoms[pIdx];
        const refChar = refAtoms[rIdx];
        const mapped = mapping[glyph.id];
        
        if (mapped === refChar) {
            // Match!
            pIdx++;
            rIdx++;
        } else if (mapped && mapped !== refChar) {
            // Mismatch in mapping vs reference
            // Could be an extra mark or different decomposition
            rIdx++; 
        } else if (!mapped) {
            // Unknown glyph! Suggest refChar
            if (!suggestions[glyph.id]) suggestions[glyph.id] = new Set();
            suggestions[glyph.id].add(refChar);
            pIdx++;
            rIdx++;
        } else {
            pIdx++;
        }
    }

    console.log("\n--- AI SUGGESTIONS BASED ON SEQUENCE ALIGNMENT ---");
    for (let id in suggestions) {
        console.log(`Glyph [${id}] might be: ${Array.from(suggestions[id]).join(' or ')}`);
    }
}

// Run for Page 1 vs Fatiha 1-7
autoAlign('p1', 1, 1, 7);
