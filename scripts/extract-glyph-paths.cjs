const fs = require('fs');
const path = require('path');

function extractGlyphPaths(svgPath) {
    if (!fs.existsSync(svgPath)) return {};
    const content = fs.readFileSync(svgPath, 'utf8');
    
    // Improved regex to handle different attribute orders
    const symbolRegex = /<symbol[^>]+id="glyph([\d-]+)"[^>]*>.*?<path[^>]+d="([^"]+)"/gs;
    const glyphPaths = {};
    let match;
    while ((match = symbolRegex.exec(content)) !== null) {
        glyphPaths[match[1]] = match[2];
    }
    return glyphPaths;
}

const svgFiles = [
    'C:/Users/Ahmed/test3_1.svg',
    'C:/Users/Ahmed/test3_2.svg',
    'C:/Users/Ahmed/test3_3.svg'
];

let allPaths = {};
svgFiles.forEach(file => {
    console.log(`Processing ${file}...`);
    const paths = extractGlyphPaths(file);
    allPaths = { ...allPaths, ...paths };
});

const outPath = path.join(__dirname, '../scratch/glyph_paths.json');
fs.writeFileSync(outPath, JSON.stringify(allPaths, null, 2));
console.log(`Successfully extracted ${Object.keys(allPaths).length} unique glyph shapes to ${outPath}`);
