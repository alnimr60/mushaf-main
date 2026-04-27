const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, '../src/data/glyph_mapping.json');
const sequencesPath = path.join(__dirname, '../scratch/glyph_sequences.json');

const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
const sequences = JSON.parse(fs.readFileSync(sequencesPath, 'utf8'));

function reconstructPage(pageKey) {
    const glyphs = sequences[pageKey];
    if (!glyphs) return "Page data not found.";

    let output = "";
    let lastY = glyphs[0].y;
    
    glyphs.forEach(glyph => {
        // If Y changed significantly, it's a new line
        if (Math.abs(glyph.y - lastY) > 10) {
            output += "\n";
            lastY = glyph.y;
        }
        
        const mapped = mapping[glyph.id];
        if (mapped) {
            output += mapped;
        } else {
            // Use colored/bracketed ID for missing mappings
            output += ` [${glyph.id}] `;
        }
    });
    
    return output;
}

console.log("==========================================");
console.log("   PAGE 1 RECONSTRUCTION (PREVIEW)        ");
console.log("==========================================");
console.log(reconstructPage('p1'));
console.log("\n==========================================");
