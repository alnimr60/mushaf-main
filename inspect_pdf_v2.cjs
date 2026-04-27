const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function test() {
    let dataBuffer = fs.readFileSync('D:/Users/Alnimr/Downloads/Telegram Desktop/01_02مصحف_ورش_من_طريــــــــــق_الأزرق.pdf');
    try {
        let data = await PDFParse(dataBuffer);
        console.log('--- Success ---');
        console.log(data.text.substring(0, 500));
    } catch (e) {
        console.error(e);
    }
}
test();
