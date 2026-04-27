const pdf = require('pdf-parse');
console.log(pdf);
const fs = require('fs');

async function check() {
    try {
        let dataBuffer = fs.readFileSync('C:/Users/Ahmed/test.pdf');
        let data = await pdf(dataBuffer, { max: 1 });
        console.log('Not encrypted, text length:', data.text.length);
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();