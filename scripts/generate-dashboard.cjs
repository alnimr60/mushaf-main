const fs = require('fs');
const path = require('path');

const glyphPathsPath = path.join(__dirname, '../scratch/glyph_paths.json');
const glyphPaths = JSON.parse(fs.readFileSync(glyphPathsPath, 'utf8'));

const glyphIds = Object.keys(glyphPaths).sort();

// Helper to calculate bounding box of a path string
function getBoundingBox(d) {
    const coords = d.match(/[-+]?[0-9]*\.?[0-9]+/g);
    if (!coords) return { minX: 0, minY: 0, maxX: 10, maxY: 10 };
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < coords.length; i += 2) {
        const x = parseFloat(coords[i]);
        const y = parseFloat(coords[i+1]);
        if (!isNaN(x)) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
        }
        if (!isNaN(y)) {
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }
    }
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>Visual Mushaf Mapping Tool</title>
    <style>
        body { font-family: sans-serif; padding: 40px; background: #fdfaf6; color: #2c1e14; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; }
        .card { background: white; padding: 15px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; border: 1px solid #eae2d5; }
        .glyph-container { 
            background: #fff; 
            height: 120px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            border-radius: 8px; 
            margin-bottom: 10px; 
            border: 1px solid #eee;
        }
        svg { width: 90%; height: 90%; }
        input { width: 80px; font-size: 24px; text-align: center; border: 2px solid #8b7355; border-radius: 6px; padding: 5px; }
        .id-label { font-size: 11px; color: #999; margin-top: 5px; font-family: monospace; }
        .footer { position: sticky; bottom: 20px; background: white; padding: 20px; border-radius: 15px; box-shadow: 0 -5px 20px rgba(0,0,0,0.1); border: 2px solid #8b7355; margin-top: 40px; }
        button { padding: 12px 30px; background: #8b7355; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; }
        #output { width: 100%; background: #1e1e1e; color: #ccc; padding: 20px; border-radius: 10px; margin-top: 20px; white-space: pre-wrap; display: none; }

        /* Palette Styles */
        .palette { background: white; padding: 15px; border-radius: 12px; margin-bottom: 30px; border: 2px solid #8b7355; position: sticky; top: 10px; z-index: 1000; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .palette-title { font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #8b7355; }
        .palette-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .palette-grid span { 
            display: inline-block; 
            width: 40px; 
            height: 40px; 
            line-height: 40px; 
            text-align: center; 
            background: #fdfaf6; 
            border: 1px solid #eae2d5; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 24px; 
            transition: all 0.2s;
        }
        .palette-grid span:hover { background: #8b7355; color: white; transform: scale(1.1); }
        header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .mapped-count { font-weight: bold; color: #8b7355; font-size: 18px; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div>
                <h1>Visual Mushaf Mapping Tool</h1>
                <p>Click a symbol to copy it, then paste it in the box for the matching shape.</p>
            </div>
            <div class="mapped-count" id="stats">Mapped: 0 / ${glyphIds.length}</div>
        </header>

        <div class="palette">
            <div class="palette-title">Quranic Palette (Click to Copy)</div>
            <div class="palette-grid">
                <span onclick="copyToClipboard('أ')">أ</span><span onclick="copyToClipboard('إ')">إ</span><span onclick="copyToClipboard('آ')">آ</span>
                <span onclick="copyToClipboard('ؤ')">ؤ</span><span onclick="copyToClipboard('ئ')">ئ</span><span onclick="copyToClipboard('ء')">ء</span>
                <span onclick="copyToClipboard('َ')">َ</span><span onclick="copyToClipboard('ُ')">ُ</span><span onclick="copyToClipboard('ِ')">ِ</span><span onclick="copyToClipboard('ْ')">ْ</span><span onclick="copyToClipboard('ّ')">ّ</span>
                <span onclick="copyToClipboard('ً')">ً</span><span onclick="copyToClipboard('ٌ')">ٌ</span><span onclick="copyToClipboard('ٍ')">ٍ</span>
                <span onclick="copyToClipboard('ٰ')">ٰ</span><span onclick="copyToClipboard('ٓ')">ٓ</span><span onclick="copyToClipboard('ۦ')">ۦ</span><span onclick="copyToClipboard('ۥ')">ۥ</span>
                <span onclick="copyToClipboard('ۖ')">ۖ</span><span onclick="copyToClipboard('ۗ')">ۗ</span><span onclick="copyToClipboard('ۚ')">ۚ</span><span onclick="copyToClipboard('ۛ')">ۛ</span><span onclick="copyToClipboard('ۜ')">ۜ</span>
                <span onclick="copyToClipboard('۞')">۞</span><span onclick="copyToClipboard('۩')">۩</span><span onclick="copyToClipboard('﴾')">﴾</span><span onclick="copyToClipboard('﴿')">﴿</span>
            </div>
        </div>
        
        <div class="grid">
            ${glyphIds.map(id => {
                const d = glyphPaths[id];
                const box = getBoundingBox(d);
                // We add some padding to the bounding box
                const pad = Math.max(box.width, box.height) * 0.2 || 2;
                const vBox = `${box.minX - pad} ${box.minY - pad} ${box.width + pad*2} ${box.height + pad*2}`;
                
                return `
                <div class="card">
                    <div class="glyph-container">
                        <svg viewBox="${vBox}" preserveAspectRatio="xMidYMid meet">
                            <g transform="scale(1, -1) translate(0, ${-(box.minY + box.maxY)})">
                                <path d="${d}" fill="#000" />
                            </g>
                        </svg>
                    </div>
                    <input type="text" data-id="${id}" maxlength="3" oninput="updateStats()">
                    <div class="id-label">Glyph ${id}</div>
                </div>
                `;
            }).join('')}
        </div>

        <div class="footer">
            <button onclick="exportJSON()">Export Mapping JSON</button>
            <span id="stats">Mapped: 0 / ${glyphIds.length}</span>
        </div>
        <pre id="output"></pre>
    </div>

    <script>
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                // Subtle feedback
                const palette = document.querySelector('.palette');
                const originalBg = palette.style.background;
                palette.style.background = '#f0fff4';
                setTimeout(() => palette.style.background = originalBg, 200);
            });
        }
        function updateStats() {
            const count = document.querySelectorAll('input:not([value=""])').length; // Simplified
            // Actual check is more complex in JS without value attribute update
            let c = 0; document.querySelectorAll('input').forEach(i => { if(i.value) c++; });
            document.getElementById('stats').textContent = 'Mapped: ' + c + ' / ${glyphIds.length}';
        }
        function exportJSON() {
            const map = {};
            document.querySelectorAll('input').forEach(i => { if(i.value) map[i.getAttribute('data-id')] = i.value; });
            const out = document.getElementById('output');
            out.textContent = JSON.stringify(map, null, 2);
            out.style.display = 'block';
            out.scrollIntoView({ behavior: 'smooth' });
        }
    </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, '../scratch/mapping_dashboard.html'), html);
console.log("Fixed dashboard created: scratch/mapping_dashboard.html");
