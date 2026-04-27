const fs = require('fs');
const pdf = require('pdf-parse');

async function getFonts() {
    const dataBuffer = fs.readFileSync('D:/Users/Alnimr/Downloads/Telegram Desktop/01.02ورش عن نافع المدنـــــي.pdf');
    
    // pdf-parse doesn't easily give fonts, but let's try to see if it's in the metadata or raw info
    const data = await pdf(dataBuffer);
    console.log('Metadata:', data.metadata);
    console.log('Info:', data.info);
}

getFonts().catch(console.error);
