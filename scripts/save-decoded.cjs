const fs = require('fs');
const path = require('path');

function getCleanText(pageNum) {
    const sequences = JSON.parse(fs.readFileSync('scratch/glyph_sequences.json', 'utf8'));
    const mapping = JSON.parse(fs.readFileSync('src/data/glyph_mapping.json', 'utf8'));

    const pageGlyphs = sequences[pageNum];
    if (!pageGlyphs) return null;

    const lines = {};
    const threshold = 10;
    pageGlyphs.forEach(g => {
        let found = false;
        for (let y in lines) {
            if (Math.abs(g.y - y) < threshold) {
                lines[y].push(g);
                found = true;
                break;
            }
        }
        if (!found) lines[g.y] = [g];
    });

    const sortedY = Object.keys(lines).sort((a, b) => a - b);
    let fullText = "";

    sortedY.forEach(y => {
        const lineGlyphs = lines[y];
        lineGlyphs.sort((a, b) => b.x - a.x);
        
        let lineText = "";
        lineGlyphs.forEach(g => {
            const char = mapping[g.id];
            lineText += char || "⬚"; 
        });
        fullText += lineText.trim() + "\n";
    });

    return fullText.trim();
}

const pages = ['p1', 'p2'];
const outputDir = path.join(__dirname, '../public/data/text/warsh');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

pages.forEach(p => {
    const text = getCleanText(p);
    if (text) {
        const pageNum = p.replace('p', '');
        const data = {
            ayahs: [
                {
                    text: text,
                    numberInSurah: 1,
                    verse_key: "1:1" // Placeholder
                }
            ],
            source: { type: "pdf-extracted", timestamp: new Date().toISOString() }
        };
        fs.writeFileSync(path.join(outputDir, `page_${pageNum}.json`), JSON.stringify(data, null, 2));
        console.log(`Saved page ${pageNum} to ${outputDir}`);
    }
});
