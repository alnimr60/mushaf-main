import { CanonicalPageText, PageVariants } from "../types";

function getVerseText(verse: any) {
  return (
    verse?.text_uthmani_warsh ||
    verse?.text_uthmani ||
    verse?.text_imlaei ||
    (Array.isArray(verse?.words)
      ? verse.words
          .map((w: any) => w?.text_uthmani || w?.text_imlaei || w?.text || w?.char || "")
          .filter(Boolean)
          .join(" ")
      : "")
  );
}

/**
 * Fetches the base Hafs text for a specific page from alquran.cloud.
 */
export async function getBasePageText(pageNumber: number) {
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`);
    const data = await res.json();
    return data.data.ayahs;
  } catch (err) {
    console.error("Failed to fetch base page text", err);
    return [];
  }
}

/**
 * Fetches dedicated Warsh text from Quran.com
 */
export async function getWarshPageText(pageNumber: number) {
  try {
    const res = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani_warsh?page_number=${pageNumber}`);
    const data = await res.json();
    return data.verses.map((v: any) => ({
      text: getVerseText(v),
      numberInSurah: parseInt(v.verse_key.split(':')[1])
    }));
  } catch (err) {
    console.error("Failed to fetch Warsh text", err);
    return [];
  }
}

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

/**
 * Fetches canonical page text from hosted JSON artifacts.
 * Falls back to null on missing file/network errors.
 */
export async function getHostedRiwayaPageText(
  pageNumber: number,
  riwayaId: string,
) {
  const pageData = await getHostedRiwayaPageData(pageNumber, riwayaId);
  return pageData?.ayahs || null;
}

export async function getHostedRiwayaPageData(
  pageNumber: number,
  riwayaId: string,
) {
  const configuredBase = (import.meta.env as Record<string, string | undefined>).VITE_TEXT_DATA_BASE_URL;
  const baseUrl = configuredBase ? trimTrailingSlash(configuredBase) : "";
  const pagePath = `/data/text/${riwayaId}/page_${pageNumber}.json`;
  const targetUrl = baseUrl ? `${baseUrl}${pagePath}` : pagePath;

  try {
    const res = await fetch(targetUrl);
    if (!res.ok) return null;

    const data = (await res.json()) as CanonicalPageText;
    if (!Array.isArray(data?.ayahs)) return null;

    return {
      ayahs: data.ayahs,
      source: (data as any).source || null,
      fromHostedFile: true,
    };
  } catch (err) {
    console.error(`Failed to fetch hosted ${riwayaId} page text`, err);
    return null;
  }
}

/**
 * Applies variants (color, symbols) for a specific Riwaya onto the base text.
 */
export function processPageWithVariants(
  ayahs: any[], 
  variantsData: PageVariants | null
) {
  return ayahs.map((ayah, aIdx) => {
    // Clean the text to ensure consistent splitting
    const words = ayah.text.trim().split(/\s+/);

    const processedWords = words.map((word: string, wIdx: number) => {
      const variantKey = `${aIdx}:${wIdx}`;
      const variant = variantsData?.variants?.[variantKey];
      
      return {
        text: variant?.text || word,
        segments: variant?.segments, 
        symbols: variant?.symbols,   
        color: variant?.color,
        note: variant?.note,
        isVariant: !!variant
      };
    });

    return { ...ayah, words: processedWords };
  });
}
