#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

function getArg(flag, fallback) {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index + 1 >= process.argv.length) return fallback;
  return process.argv[index + 1];
}

const riwayaMap = {
  "susi": "soosi",
  "duri": "doori",
  "qunbul": "qunbul",
  "bazzi": "albazzi",
  "shuba": "shoubah",
};

const arabicToLatin = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchPageText(src, pageNumber) {
  const url = `https://tafsir.app/get_mushaf.php?src=${src}&pg=${pageNumber}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer': `https://tafsir.app/m-${src}-text/1/${pageNumber}`,
      'Accept': 'application/json'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for page ${pageNumber}`);
  const json = await res.json();
  return json.data || "";
}

function parseAyahs(pageText) {
  const ayahs = [];
  const regex = /([٠-٩]+)/g;
  
  let cleanText = pageText.trim();
  const lines = cleanText.split('\n');
  if (lines.length > 0 && lines[0].includes('سُورَةُ')) {
      lines.shift();
  }
  cleanText = lines.join(' ');
  
  const parts = cleanText.split(regex);
  let currentText = "";
  
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      currentText += parts[i];
    } else {
      const arabicNum = parts[i];
      const numStr = arabicNum.split('').map(c => arabicToLatin[c] || c).join('');
      const num = parseInt(numStr, 10);
      
      let t = currentText.trim();
      
      const words = t.split(/\s+/);
      let foundBasmalah = false;
      if (words.length >= 4) {
        const w1 = words[0].replace(/[^\u0621-\u064A]/g, '');
        const w2 = words[1].replace(/[^\u0621-\u064A]/g, '');
        if (w1 === 'بسم' && (w2 === 'الله' || w2 === 'لله' || w2 === 'الل')) {
          foundBasmalah = true;
        }
      }
      
      if (foundBasmalah) {
          const basmalahText = words.slice(0, 4).join(' ');
          ayahs.push({
              text: basmalahText.trim(),
              numberInSurah: 0
          });
          t = words.slice(4).join(' ').trim();
      }
      
      if (t) {
        ayahs.push({
          text: t + " " + arabicNum,
          numberInSurah: num
        });
      } else {
        if (ayahs.length > 0 && num > 0) {
            ayahs[ayahs.length - 1].text += " " + arabicNum;
            ayahs[ayahs.length - 1].numberInSurah = num;
        }
      }
      currentText = "";
    }
  }
  
  if (currentText.trim()) {
      ayahs.push({
          text: currentText.trim(),
          numberInSurah: -1
      });
  }
  
  return ayahs;
}

async function main() {
  const riwayaId = getArg("--riwaya", "susi");
  const src = riwayaMap[riwayaId] || getArg("--src", riwayaId);
  const outputRoot = getArg("--out", path.join("public", "data", "text"));
  
  let start = parseInt(getArg("--start", "1"), 10);
  let end = parseInt(getArg("--end", "604"), 10);

  const targetDir = path.join(outputRoot, riwayaId);
  fs.mkdirSync(targetDir, { recursive: true });

  console.log(`Generating ${riwayaId} (src=${src}) text pages ${start}-${end}`);
  
  let written = 0;
  for (let page = start; page <= end; page++) {
    try {
      const rawText = await fetchPageText(src, page);
      const ayahs = parseAyahs(rawText);
      
      const payload = {
        pageNumber: page,
        riwayaId,
        ayahs
      };
      
      const filePath = path.join(targetDir, `page_${page}.json`);
      fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
      written++;
      if (page % 50 === 0) {
         console.log(`- generated up to page ${page}`);
      }
      await delay(20);
    } catch (e) {
      console.error(`Error processing page ${page}:`, e.message);
      await delay(1000);
    }
  }
  console.log(`Done. Wrote ${written} files to ${targetDir}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
