import mapping from '../data/pdf_mapping.json';

/**
 * Decodes raw PDF text (legacy font mapping) into standard Unicode Arabic.
 */
export function decodePdfText(rawText: string): string {
  if (!rawText) return "";
  
  let decoded = "";
  for (const char of rawText) {
    if (mapping[char as keyof typeof mapping]) {
      decoded += mapping[char as keyof typeof mapping];
    } else if (char === " " || char === "\n" || char === "\t") {
      decoded += char;
    } else {
      // Keep unknown characters for debugging
      decoded += `[${char}]`;
    }
  }
  
  // Clean up extra spaces
  return decoded.replace(/\s+/g, " ").trim();
}

/**
 * Normalizes Arabic text (removes diacritics if needed, etc.)
 */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, "") // Remove harakat
    .replace(/\s+/g, " ")
    .trim();
}
