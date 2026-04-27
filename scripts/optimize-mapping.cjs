const fs = require('fs');
const path = require('path');

const mappingPath = 'src/data/glyph_mapping.json';
const pathsPath = 'scratch/glyph_paths.json';

const currentMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
const glyphPaths = JSON.parse(fs.readFileSync(pathsPath, 'utf8'));

function getBoundingBox(d) {
    const coords = d.match(/[-+]?[0-9]*\.?[0-9]+/g);
    if (!coords) return { minX: 0, minY: 0 };
    let minX = Infinity, minY = Infinity;
    for (let i = 0; i < coords.length; i += 2) {
        const x = parseFloat(coords[i]);
        const y = parseFloat(coords[i+1]);
        if (!isNaN(x)) minX = Math.min(minX, x);
        if (!isNaN(y)) minY = Math.min(minY, y);
    }
    return { minX, minY };
}

// Function to normalize a path by shifting it to (0,0)
function normalizePathRelative(d) {
    const box = getBoundingBox(d);
    // Replace all numbers with (num - offset)
    return d.replace(/([-+]?[0-9]*\.?[0-9]+)\s+([-+]?[0-9]*\.?[0-9]+)/g, (match, x, y) => {
        const newX = (parseFloat(x) - box.minX).toFixed(2);
        const newY = (parseFloat(y) - box.minY).toFixed(2);
        return `${newX} ${newY}`;
    }).replace(/\s+/g, ' ').trim();
}

const pathToChar = {};
Object.entries(currentMapping).forEach(([id, char]) => {
    const rawPath = glyphPaths[id];
    if (rawPath) {
        const norm = normalizePathRelative(rawPath);
        pathToChar[norm] = char;
    }
});

const finalMapping = {};
let autoFilledCount = 0;

Object.keys(glyphPaths).forEach(id => {
    const norm = normalizePathRelative(glyphPaths[id]);
    if (currentMapping[id]) {
        finalMapping[id] = currentMapping[id];
    } else if (pathToChar[norm]) {
        finalMapping[id] = pathToChar[norm];
        autoFilledCount++;
    }
});

fs.writeFileSync(mappingPath, JSON.stringify(finalMapping, null, 2));
console.log(`Deep Recheck Complete! Total Mapped: ${Object.keys(finalMapping).length}`);
console.log(`Auto-filled ${autoFilledCount} shifted glyphs.`);
