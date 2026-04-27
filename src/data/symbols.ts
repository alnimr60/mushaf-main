export const WARSH_COLORS = {
  DIFF_FROM_HAFS: "#D53F8C", // Purple
  MAD_BADAL: "#3182CE",      // Light Blue
  TAQLEEL: "#E53E3E",        // Red
  THIN_RAA: "#38A169",       // Green
  THICK_LAAM: "#2C5282",     // Blue
  MEEM_JAM: "#A0522D",       // Orange/Brown
  IDGHAM: "#2B6CB0"          // Dark Blue
};

export interface QiraatSymbol {
  id: string;
  char: string;
  name: string;
  defaultColor: string;
}

export const QIRAAT_SYMBOLS: Record<string, QiraatSymbol> = {
  IMALA_DOT: {
    id: 'imala_dot',
    char: '●',
    name: 'نقطة الإمالة',
    defaultColor: "#E53E3E"
  },
  SILA_HA: {
    id: 'sila_ha',
    char: 'ۥ',
    name: 'صلة الراء',
    defaultColor: "#8B7355"
  }
};
