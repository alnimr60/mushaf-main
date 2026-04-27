import fs from 'fs';
import path from 'path';
import { autoDigitizePage } from './autoDigitizer';

/**
 * MOCK DATA for Warsh (Page 1 - Al-Fatiha)
 * In a real production run, we would fetch this from Tanzil.net or similar.
 */
const WARSH_MOCK_DATA: Record<number, string[]> = {
  1: [
    "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
    "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    "مَلِكِ يَوْمِ ٱلدِّينِ", // Difference: Maliki (Warsh) vs Maaliki (Hafs)
    "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
    "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ"
  ]
};

async function fetchHafsPage(page: number) {
  const res = await fetch(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`);
  const data = await res.json();
  return data.data.ayahs;
}

export async function generateAllPagesForRiwaya(riwayaId: string, start: number, end: number) {
  console.log(`Starting Batch Generation for ${riwayaId} (Pages ${start}-${end})...`);
  
  for (let p = start; p <= end; p++) {
    const hafsAyahs = await fetchHafsPage(p);
    const targetText = WARSH_MOCK_DATA[p];

    if (targetText) {
      const variants = autoDigitizePage(hafsAyahs, targetText);
      const output = {
        pageNumber: p,
        riwayaId: riwayaId,
        variants: variants
      };

      const dirPath = `./public/data/variants/${riwayaId}`;
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
      
      fs.writeFileSync(
        path.join(dirPath, `page_${p}.json`),
        JSON.stringify(output, null, 2)
      );
      
      console.log(`✅ Generated Page ${p}`);
    } else {
      console.log(`⚠️ Skipping Page ${p} (No target text found)`);
    }
  }
}
