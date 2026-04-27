const fs = require('fs');

function reconstructCleanMushaf(pageNum) {
    const sequences = JSON.parse(fs.readFileSync('scratch/glyph_sequences.json', 'utf8'));
    const mapping = JSON.parse(fs.readFileSync('src/data/glyph_mapping.json', 'utf8'));

    const pageGlyphs = sequences[pageNum];
    if (!pageGlyphs) return "Page not found.";

    // Group by lines (y-coordinate)
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

    const sortedY = Object.keys(lines).sort((a, b) => a - b); // Correct top-to-bottom for this PDF

    let output = `\n==========================================\n`;
    output += `       MUSHAF VIEW - PAGE ${pageNum.toUpperCase()}       \n`;
    output += `==========================================\n\n`;

    sortedY.forEach(y => {
        const lineGlyphs = lines[y];
        // Sort X descending for RTL
        lineGlyphs.sort((a, b) => b.x - a.x);
        
        let lineText = "";
        lineGlyphs.forEach(g => {
            const char = mapping[g.id];
            if (char) {
                lineText += char;
            } else {
                // If missing, show a placeholder that looks like a gap
                lineText += "⬚"; 
            }
        });
        output += `  ${lineText}\n`;
    });

    output += `\n==========================================\n`;
    return output;
}

const pageArg = process.argv[2] || 'p1';
console.log(reconstructCleanMushaf(pageArg));
