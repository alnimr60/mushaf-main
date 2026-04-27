export interface WordSymbol {
  char: string;
  position: 'top' | 'bottom' | 'center';
  color?: string;
  fontSize?: string;
}

export interface WordSegment {
  text: string;
  color?: string;
  symbols?: WordSymbol[]; // Anchored to this specific segment
}

export interface WordVariant {
  text?: string;
  segments?: WordSegment[];
  color?: string;
  note?: string;
  path?: string;      // SVG path data from Inkscape
  viewBox?: string;   // Original viewBox from Inkscape for alignment
}

export interface PageVariants {
  pageNumber: number;
  riwayaId: string;
  variants: {
    [wordIndex: string]: WordVariant; // Key is "ayahIndex:wordIndex"
  };
}

export interface CanonicalAyahText {
  text: string;
  numberInSurah: number;
}

export interface CanonicalPageText {
  pageNumber: number;
  riwayaId: string;
  ayahs: CanonicalAyahText[];
}

export interface Riwaya {
  id: string;
  name: string;
  type: 'image' | 'text';
  pdfPath?: string;
  imagePath?: string; // Fallback or primary if type is 'image'
  repoName?: string;
  extension?: string;
}

export interface Qiraa {
  id: string;
  name: string;
  riwayat: Riwaya[];
}

export interface Bookmark {
  pageNumber: number;
  riwayaId: string;
  timestamp: number;
}
