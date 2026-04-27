import fs from 'fs/promises';
import path from 'path';

const WARSH_DIR = 'C:/Users/Lenovo/Downloads/warsh-quran/assets/quran';
const OUTPUT_DIR = './public/data/text/warsh';

async function fetchPageLayout(pageNumber) {
  try {
    const res = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani_warsh?page_number=${pageNumber}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.verses.map(v => v.verse_key); // e.g. "2:5"
  } catch (err) {
    console.error(`Failed to fetch layout for page ${pageNumber}`, err);
    return null;
  }
}

async function processPage(pageNumber) {
  console.log(`Processing page ${pageNumber}...`);
  const verseKeys = await fetchPageLayout(pageNumber);
  
  if (!verseKeys || verseKeys.length === 0) {
    console.error(`No verses found for page ${pageNumber}`);
    return false;
  }

  const pageAyahs = [];
  
  for (const verseKey of verseKeys) {
    const [surahStr, ayahStr] = verseKey.split(':');
    const surah = parseInt(surahStr, 10);
    const ayah = parseInt(ayahStr, 10);
    
    const paddedSurah = String(surah).padStart(3, '0');
    const filePath = path.join(WARSH_DIR, `${paddedSurah}.json`);
    
    let warshData;
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      warshData = JSON.parse(fileContent);
    } catch (err) {
      console.error(`Failed to read or parse ${filePath}`, err);
      continue;
    }
    
    // Add Basmalah if it's the first verse of the surah (and not Surah 9)
    if (ayah === 1 && surah !== 9) {
      pageAyahs.push({
        text: warshData.ayahs[0].replace(/\uFE0E/g, ''), // Basmalah is at index 0 in the APK data
        numberInSurah: 0
      });
    }
    
    // Get the verse text
    // For Surah 9 (At-Tawbah), there is no Basmalah, so verse 1 is at index 0.
    // For other surahs, Basmalah is at index 0, so verse N is at index N.
    const textIndex = (surah === 9) ? (ayah - 1) : ayah;
    const text = warshData.ayahs[textIndex];
    
    if (!text) {
      console.warn(`Warning: Could not find text for ${verseKey} at index ${textIndex}`);
    }
    
    pageAyahs.push({
      text: text ? text.replace(/\uFE0E/g, '') : "",
      numberInSurah: ayah,
      verse_key: verseKey
    });
  }
  
  const outputFilePath = path.join(OUTPUT_DIR, `page_${pageNumber}.json`);
  
  // Ensure directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  await fs.writeFile(
    outputFilePath, 
    JSON.stringify({
      pageNumber: pageNumber,
      riwayaId: "warsh",
      ayahs: pageAyahs,
      source: {
        type: "warsh-quran-apk",
        timestamp: new Date().toISOString()
      }
    }, null, 2)
  );
  
  return true;
}

async function run() {
  console.log("Starting generation of Warsh pages...");
  
  // Create output dir if it doesn't exist
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  // Process pages with a concurrency limit to avoid overwhelming the API
  const CONCURRENCY = 10;
  let activePromises = [];
  
  for (let i = 1; i <= 604; i++) {
    const p = processPage(i);
    activePromises.push(p);
    
    if (activePromises.length >= CONCURRENCY) {
      await Promise.all(activePromises);
      activePromises = [];
      // Small delay to be nice to the API
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  if (activePromises.length > 0) {
    await Promise.all(activePromises);
  }
  
  console.log("Finished generating all 604 pages!");
}

run().catch(console.error);
