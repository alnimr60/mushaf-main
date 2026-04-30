const fs = require('fs');
const path = require('path');

function getArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index + 1 >= process.argv.length) return null;
  return process.argv[index + 1];
}

function parseSvgWords(svgPath) {
    const content = fs.readFileSync(svgPath, 'utf8');
    
    // Simple regex to parse <use> elements and their parent <g> style
    const useRegex = /<g[^>]*style="([^"]*)"[^>]*>[\s\S]*?<use[^>]*x="([^"]*)"[^>]*y="([^"]*)"/g;
    const uses = [];
    let match;
    
    // For a more robust parsing, we can split by <g and look for <use inside
    const gRegex = /<g[^>]*style="([^"]*)"[^>]*>([\s\S]*?)<\/g>/g;
    
    let gMatch;
    while ((gMatch = gRegex.exec(content)) !== null) {
        const style = gMatch[1];
        let color = '#000000';
        const fillMatch = style.match(/fill:(#[0-9a-fA-F]+)/);
        if (fillMatch) {
            color = fillMatch[1];
        }
        
        const innerContent = gMatch[2];
        const innerUseRegex = /<use[^>]*x="([^"]*)"[^>]*y="([^"]*)"/g;
        let uMatch;
        while ((uMatch = innerUseRegex.exec(innerContent)) !== null) {
            uses.push({
                x: parseFloat(uMatch[1]),
                y: parseFloat(uMatch[2]),
                color: color
            });
        }
    }
    
    // Sort and group by lines
    const lines = {};
    const tolerance = 5.0;
    uses.forEach((use, i) => {
        use.index = i; // keep original order for stability
        let found = false;
        for (const lineY in lines) {
            if (Math.abs(parseFloat(lineY) - use.y) < tolerance) {
                lines[lineY].push(use);
                found = true;
                break;
            }
        }
        if (!found) {
            lines[use.y] = [use];
        }
    });
    
    const sortedY = Object.keys(lines).sort((a, b) => parseFloat(a) - parseFloat(b));
    const words = [];
    
    sortedY.forEach(y => {
        const lineGlyphs = lines[y].sort((a, b) => b.x - a.x || a.index - b.index); // Right to left
        
        const gaps = [];
        for (let i = 0; i < lineGlyphs.length - 1; i++) {
            gaps.push(lineGlyphs[i].x - lineGlyphs[i+1].x);
        }
        
        let threshold = 8.0;
        if (gaps.length > 0) {
            gaps.sort((a, b) => a - b);
            const p85 = gaps[Math.floor(gaps.length * 0.85)];
            threshold = Math.max(5.0, Math.min(p85, 15.0));
        }
        
        let currentWord = [];
        for (let i = 0; i < lineGlyphs.length; i++) {
            currentWord.push(lineGlyphs[i]);
            if (i < lineGlyphs.length - 1) {
                const gap = lineGlyphs[i].x - lineGlyphs[i+1].x;
                if (gap > threshold) {
                    words.push(currentWord);
                    currentWord = [];
                }
            }
        }
        if (currentWord.length > 0) {
            words.push(currentWord);
        }
    });
    
    return words;
}

function processPage(svgPath, jsonPath, outPath) {
    if (!fs.existsSync(svgPath) || !fs.existsSync(jsonPath)) {
        console.error("Missing SVG or JSON file");
        return;
    }
    
    const svgWords = parseSvgWords(svgPath);
    const pageData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    let jsonWords = [];
    pageData.ayahs.forEach((ayah, aIdx) => {
        const words = ayah.text.trim().split(/\s+/);
        words.forEach((w, wIdx) => {
            jsonWords.push({ aIdx, wIdx, text: w });
        });
    });
    
    console.log(`SVG Words: ${svgWords.length}, JSON Words: ${jsonWords.length}`);
    
    const variants = {};
    const limit = Math.min(svgWords.length, jsonWords.length);
    
    let coloredWordsCount = 0;
    
    for (let i = 0; i < limit; i++) {
        const sWord = svgWords[i];
        const jWord = jsonWords[i];
        
        const hasColor = sWord.some(g => g.color !== '#000000');
        if (!hasColor) continue;
        
        coloredWordsCount++;
        
        // Map glyphs to characters proportionally
        const chars = jWord.text.split('');
        const segments = [];
        
        let currentSegText = "";
        let currentSegColor = sWord[0].color;
        
        chars.forEach((char, charIdx) => {
            // Find corresponding glyph color
            const glyphIdx = Math.floor((charIdx / chars.length) * sWord.length);
            const color = sWord[glyphIdx].color;
            
            if (color === currentSegColor) {
                currentSegText += char;
            } else {
                segments.push({ text: currentSegText, color: currentSegColor });
                currentSegText = char;
                currentSegColor = color;
            }
        });
        
        if (currentSegText) {
            segments.push({ text: currentSegText, color: currentSegColor });
        }
        
        // Clean up black segments to be undefined color to save space/inherit
        segments.forEach(seg => {
            if (seg.color === '#000000') delete seg.color;
        });
        
        variants[`${jWord.aIdx}:${jWord.wIdx}`] = {
            text: jWord.text,
            segments: segments
        };
    }
    
    const outData = { variants };
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(outData, null, 2));
    
    console.log(`Saved variants for ${coloredWordsCount} colored words to ${outPath}`);
}

const svg = getArg('--svg');
const json = getArg('--json');
const out = getArg('--out');

if (svg && json && out) {
    processPage(svg, json, out);
} else {
    console.log("Usage: node apply-svg-colors.cjs --svg <path> --json <path> --out <path>");
}
