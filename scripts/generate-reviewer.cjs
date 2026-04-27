const fs = require('fs');

const sequences = JSON.parse(fs.readFileSync('scratch/glyph_sequences.json', 'utf8'));
const paths = JSON.parse(fs.readFileSync('scratch/glyph_paths.json', 'utf8'));
const mapping = JSON.parse(fs.readFileSync('src/data/glyph_mapping.json', 'utf8'));

const pageNum = 'p1';
const pageGlyphs = sequences[pageNum];

if (!pageGlyphs) {
    console.error(`No data for page ${pageNum}`);
    process.exit(1);
}

// 1. Determine Page Bounds to prevent compaction
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
pageGlyphs.forEach(g => {
    minX = Math.min(minX, g.x);
    maxX = Math.max(maxX, g.x);
    minY = Math.min(minY, g.y);
    maxY = Math.max(maxY, g.y);
});

const padding = 50;
const scale = 4;
const width = ((maxX - minX) * scale) + (padding * 2);
const height = ((maxY - minY) * scale) + (padding * 2);

console.log(`Page Dimensions: ${width.toFixed(0)}x${height.toFixed(0)}`);

const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Visual Reviewer - Page ${pageNum}</title>
    <style>
        body { background: #f0ede9; padding: 40px; font-family: 'Segoe UI', Tahoma, sans-serif; display: flex; flex-direction: column; align-items: center; }
        .page-container { 
            position: relative; 
            width: ${width}px; 
            height: ${height}px; 
            background: white; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        .glyph { position: absolute; cursor: pointer; transition: all 0.2s; }
        .glyph:hover { z-index: 100; transform: scale(1.5); background: rgba(255,255,0,0.2); }
        .glyph path { fill: #bbb; }
        .glyph.mapped path { fill: #1a1a1a; }
        .id-label { 
            position: absolute; 
            top: -12px; left: 0; 
            font-size: 9px; color: #999; 
            white-space: nowrap; 
            background: rgba(255,255,255,0.9);
            padding: 1px 3px;
            border-radius: 3px;
            pointer-events: none;
        }
        .char-label {
            position: absolute;
            bottom: -15px; left: 50%;
            transform: translateX(-50%);
            font-size: 14px; color: #d32f2f;
            font-weight: bold;
            pointer-events: none;
        }
        .controls { 
            position: sticky; top: 0; 
            background: white; padding: 15px; 
            margin-bottom: 20px; border-radius: 10px; 
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            display: flex; gap: 20px; align-items: center;
        }
        .legend { font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="controls">
        <h2 style="margin:0">Mushaf Reviewer (Page ${pageNum})</h2>
        <div class="legend">
            <span style="color:#bbb">● Unmapped</span> | 
            <span style="color:#1a1a1a">● Mapped</span> | 
            <span style="color:#d32f2f">Red letters are mappings</span>
        </div>
    </div>
    <div class="page-container">
        ${pageGlyphs.map(g => {
            const pathData = paths[g.id] || "";
            const isMapped = !!mapping[g.id];
            const mappedChar = mapping[g.id] || "";
            
            // Coordinate transformation:
            // Web X = g.x - minX + padding
            // Web Y = maxY - g.y + padding (Flipping Y axis properly)
            const left = (g.x - minX) * scale + padding;
            const top = (maxY - g.y) * scale + padding;

            // Extract viewBox from path data
            const coords = pathData.match(/[-+]?[0-9]*\.?[0-9]+/g) || [];
            let gxMin = 0, gxMax = 10, gyMin = 0, gyMax = 10;
            if (coords.length > 0) {
                gxMin = 100, gxMax = -100, gyMin = 100, gyMax = -100;
                for(let i=0; i<coords.length; i+=2) {
                    const x = parseFloat(coords[i]);
                    const y = parseFloat(coords[i+1]);
                    gxMin = Math.min(gxMin, x); gxMax = Math.max(gxMax, x);
                    gyMin = Math.min(gyMin, y); gyMax = Math.max(gyMax, y);
                }
            }
            const vw = Math.max(1, gxMax - gxMin);
            const vh = Math.max(1, gyMax - gyMin);
            
            // Scale the drawing itself to be readable
            const size = 30; 

            return `
            <div class="glyph ${isMapped ? 'mapped' : ''}" 
                 style="left:${left}px; top:${top}px; width:${size}px; height:${size}px;" 
                 title="ID: ${g.id}${isMapped ? ' -> ' + mappedChar : ''}">
                <div class="id-label">${g.id}</div>
                ${isMapped ? `<div class="char-label">${mappedChar}</div>` : ''}
                <svg width="${size}" height="${size}" viewBox="${gxMin} ${gyMin} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet">
                    <path d="${pathData}" transform="scale(1, -1) translate(0, ${-(gyMin + gyMax)})" />
                </svg>
            </div>`;
        }).join('')}
    </div>
</body>
</html>`;

fs.writeFileSync('scratch/visual_reviewer.html', html);
console.log('Fixed Reviewer saved to scratch/visual_reviewer.html');
