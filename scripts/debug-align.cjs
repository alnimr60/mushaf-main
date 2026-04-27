const fs = require('fs');

async function debugAlign(pageNum, surahNum, startAyah, endAyah) {
    const sequences = JSON.parse(fs.readFileSync('scratch/glyph_sequences.json', 'utf8'));
    const mapping = JSON.parse(fs.readFileSync('src/data/glyph_mapping.json', 'utf8'));
    const warshData = JSON.parse(fs.readFileSync('scratch/warsh_text.json', 'utf8'));

    const verses = warshData.quran.filter(v => v.chapter == surahNum && v.verse >= startAyah && v.verse <= endAyah);
    let refText = verses.map(v => v.text).join(' ');
    const refAtoms = [...refText].filter(c => c !== ' ');

    const pageGlyphs = sequences[pageNum];
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

    console.log(`\nALIGNMENT DEBUG (Page ${pageNum} vs Surah ${surahNum}):`);
    console.log(`REF Atoms: ${refAtoms.length}, PDF Glyphs: ${pageAtoms.length}\n`);

    let count = Math.min(refAtoms.length, pageAtoms.length);
    for (let i = 0; i < count; i++) {
        const glyph = pageAtoms[i];
        const ref = refAtoms[i];
        const mapped = mapping[glyph.id] || "???";
        
        const matchStatus = mapped === ref ? "✅" : (mapped === "???" ? "❓" : "❌");
        
        console.log(`${i.toString().padStart(3)}: [${glyph.id.padEnd(6)}] Mapped: ${mapped} | Expected: ${ref} ${matchStatus}`);
        
        if (matchStatus === "❌" && i < 20) {
            // If it breaks early, maybe skip one and try?
        }
    }
}

debugAlign('p1', 1, 1, 7);
