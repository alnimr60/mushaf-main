const fs = require('fs');
const path = require('path');

async function getTemplate(startPage, endPage) {
    const templatesDir = path.join(__dirname, '../scratch/templates');
    if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
    }

    for (let page = startPage; page <= endPage; page++) {
        console.log(`Fetching Unicode Warsh text for page ${page}...`);
        try {
            const url = `https://api.quran.com/api/v4/quran/verses/uthmani_warsh?page_number=${page}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            
            const text = data.verses.map(v => v.text_uthmani_warsh).join(' ');
            fs.writeFileSync(path.join(templatesDir, `page_${page}.txt`), text);
            console.log(`  - Saved page ${page}`);
        } catch (error) {
            console.error(`  - Failed to fetch page ${page}: ${error.message}`);
        }
    }
}

const args = process.argv.slice(2);
const start = parseInt(args[0]) || 1;
const end = parseInt(args[1]) || 3;

getTemplate(start, end).catch(console.error);
