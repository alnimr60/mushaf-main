import { WordVariant, WordSegment } from "../types";
import { QIRAAT_SYMBOLS } from "../data/symbols";

/**
 * Compares a Hafs word with a target Riwaya word (e.g. Warsh)
 * and automatically generates a WordVariant if they differ.
 */
export function autoGenerateVariant(hafsWord: string, targetWord: string): WordVariant | null {
  if (hafsWord === targetWord) return null;

  // Pattern 1: Alif removal (e.g. Maaliki -> Maliki)
  if (hafsWord.includes('ا') && !targetWord.includes('ا') && hafsWord.length > targetWord.length) {
    return {
      note: "حذف الألف - إمالة أو قصر",
      segments: [
        { 
          text: targetWord.substring(0, 1), 
          color: QIRAAT_SYMBOLS.IMALA_DOT.defaultColor,
          symbols: [{ 
            char: QIRAAT_SYMBOLS.IMALA_DOT.char, 
            position: 'top', 
            color: QIRAAT_SYMBOLS.IMALA_DOT.defaultColor,
            fontSize: '0.3em'
          }] 
        },
        { text: targetWord.substring(1) }
      ]
    };
  }

  // Pattern 2: Basic vowel/letter change
  return {
    text: targetWord,
    color: "#8B7355", // Default color for general differences
    note: `اختلاف في الرسم أو الضبط: ${hafsWord} -> ${targetWord}`
  };
}

/**
 * Processes a whole page automatically.
 */
export function autoDigitizePage(hafsAyahs: any[], targetPageText: string[]) {
  const variants: Record<string, WordVariant> = {};

  hafsAyahs.forEach((ayah, aIdx) => {
    const hafsWords = ayah.text.split(' ');
    // This assumes targetPageText is provided as an array of ayahs
    const targetWords = targetPageText[aIdx]?.split(' ') || [];

    hafsWords.forEach((hWord: string, wIdx: number) => {
      const tWord = targetWords[wIdx];
      if (tWord && hWord !== tWord) {
        const variant = autoGenerateVariant(hWord, tWord);
        if (variant) {
          variants[`${aIdx}:${wIdx}`] = variant;
        }
      }
    });
  });

  return variants;
}
