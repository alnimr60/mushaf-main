const pdf = require('pdf-parse');
const fs = require('fs');

async function test() {
    let dataBuffer = fs.readFileSync('D:/Users/Alnimr/Downloads/Telegram Desktop/01_02مصحف_ورش_من_طريــــــــــق_الأزرق.pdf');
    try {
        // Attempting to invoke the exported object directly as a function, 
        // which is standard for the main export of 'pdf-parse'
        let data = await pdf(dataBuffer);
        console.log('--- Success ---');
        console.log(data.text.substring(0, 500));
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
