const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function extractUnique() {
    const filePath = 'C:/Users/Ahmed/01.02ورش عن نافع المدنـــــي.pdf';
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    const buffer = fs.readFileSync(filePath);
    console.log("Parsing PDF using PDFParse...");
    
    const parser = new PDFParse(new Uint8Array(buffer));
    
    let allChars = new Set();
    const pageCount = 5; // Scan first 5 pages for unique characters

    for (let p = 1; p <= pageCount; p++) {
        const result = await parser.getText({ partial: [p] });
        const text = result.text || "";
        for (const char of text) {
            if (char !== '\n' && char !== ' ' && char !== '\r') {
                allChars.add(char);
            }
        }
    }

    const sortedChars = Array.from(allChars).sort();
    console.log(`Found ${sortedChars.length} unique characters.`);
    
    const charList = sortedChars.map(c => ({
        char: c,
        hex: Buffer.from(c, 'utf16le').toString('hex'),
        mapping: ""
    }));

    const outPath = path.join(__dirname, '../scratch/unique_chars.json');
    fs.writeFileSync(outPath, JSON.stringify(charList, null, 2));
    console.log(`Results saved to ${outPath}`);
}

extractUnique().catch(console.error);
