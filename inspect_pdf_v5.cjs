const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function test() {
    let dataBuffer = fs.readFileSync('D:/Users/Alnimr/Downloads/Telegram Desktop/01_02مصحف_ورش_من_طريــــــــــق_الأزرق.pdf');
    try {
        let parser = new PDFParse(dataBuffer);
        // Using getText from the prototype methods list found
        let text = await parser.getText();
        console.log('--- Success ---');
        console.log(text.substring(0, 500));
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
