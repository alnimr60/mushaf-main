const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function test() {
    const filePath = 'D:/Users/Alnimr/Downloads/Telegram Desktop/01_02مصحف_ورش_من_طريــــــــــق_الأزرق.pdf';
    const buffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(buffer);
    
    try {
        let parser = new PDFParse(uint8Array);
        let text = await parser.getText();
        console.log('--- Success ---');
        console.log(text.substring(0, 500));
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
