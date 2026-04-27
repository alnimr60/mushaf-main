export interface QiraatVariant {
  surah: number;
  ayah: number;
  wordIndex: number; // 0-based index of the word in the Ayah
  symbol: string;    // The custom sign or mark
  color: string;     // Hex color for the mark/word
  note: string;      // The explanation of the variant
  riwaya: string;    // e.g., 'warsh', 'qalun'
}

export const MOCK_VARIANTS: QiraatVariant[] = [
  {
    surah: 1,
    ayah: 4,
    wordIndex: 0,
    symbol: "◌۬",
    color: "#EF4444",
    note: "قرأ عاصم والكسائي ويعقوب وخلف (مَلِكِ) بكسر اللام بدون ألف.",
    riwaya: "warsh"
  },
  {
    surah: 2,
    ayah: 30,
    wordIndex: 2,
    symbol: "◌۬",
    color: "#D97706",
    note: "انفرد بها حمزة بإبدال الهمزة ياء مع كسر وضم الهاء.",
    riwaya: "warsh"
  }
];
