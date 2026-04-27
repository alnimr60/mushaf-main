const fs = require('fs');

function extractGlyphs(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const useRegex = /<use\s+xlink:href="#glyph([\d-]+)"\s+x="([\d.]+)"\s+y="([\d.]+)"/g;
    const glyphs = [];
    let match;
    while ((match = useRegex.exec(content)) !== null) {
        glyphs.push({
            id: match[1],
            x: parseFloat(match[2]),
            y: parseFloat(match[3])
        });
    }
    
    // Sort by Y (line) then X (RTL: higher X comes first on the same line)
    return glyphs.sort((a, b) => {
        if (Math.abs(a.y - b.y) > 2) return a.y - b.y;
        return b.x - a.x;
    });
}

const p1 = extractGlyphs('C:/Users/Ahmed/test3_1.svg');
const p2 = extractGlyphs('C:/Users/Ahmed/test3_2.svg');
const p3 = extractGlyphs('C:/Users/Ahmed/test3_3.svg');

console.log('Page 1 (First 10 glyphs):', p1.slice(0, 10));
console.log('Page 2 (First 10 glyphs):', p2.slice(0, 10));

// We'll use these sequences to compare with quran.com text
fs.writeFileSync('scratch/glyph_sequences.json', JSON.stringify({ p1, p2, p3 }, null, 2));
