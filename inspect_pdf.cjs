const pdf = require('pdf-parse');
const fs = require('fs');

async function test() {
    let dataBuffer = fs.readFileSync('D:/Users/Alnimr/Downloads/Telegram Desktop/01_02مصحف_ورش_من_طريــــــــــق_الأزرق.pdf');
    try {
        let data = await pdf(dataBuffer, { max: 1 });
        console.log('--- Text length ---');
        console.log(data.text.length);
        console.log('\n--- First 500 chars ---');
        console.log(data.text.substring(0, 500));
    } catch (e) {
        console.error(e);
    }
}
test();
