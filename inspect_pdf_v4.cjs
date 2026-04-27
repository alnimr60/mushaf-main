const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function test() {
    let dataBuffer = fs.readFileSync('D:/Users/Alnimr/Downloads/Telegram Desktop/01_02مصحف_ورش_من_طريــــــــــق_الأزرق.pdf');
    try {
        // Try calling it as a constructor since it was a class in previous error
        let parser = new PDFParse(dataBuffer);
        let data = await parser.parse();
        console.log('--- Success ---');
        console.log(data.text.substring(0, 500));
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
