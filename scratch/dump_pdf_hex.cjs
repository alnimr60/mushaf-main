const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function dumpHex() {
    const filePath = 'D:/Users/Alnimr/Downloads/Telegram Desktop/01.02ورش عن نافع المدنـــــي.pdf';
    const buffer = fs.readFileSync(filePath);
    const parser = new PDFParse(new Uint8Array(buffer));
    
    // Page 1 is usually the cover or Fatiha. Let's try page 1 and 2.
    for (let p = 1; p <= 3; p++) {
        const result = await parser.getText({ partial: [p] });
        const text = result.text || "";
        console.log(`--- Page ${p} ---`);
        console.log('Text:', text);
        console.log('Hex:', Buffer.from(text, 'utf16le').toString('hex'));
        console.log('----------------');
    }
}

dumpHex().catch(console.error);
