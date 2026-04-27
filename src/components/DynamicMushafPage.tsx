import React, { useState, useEffect } from "react";
import { getBasePageText, getHostedRiwayaPageData, getWarshPageText, processPageWithVariants } from "../lib/quranUtils";
import { PageVariants, Riwaya } from "../types";
import { cn } from "../lib/utils";

interface DynamicMushafPageProps {
  page: number;
  riwaya: Riwaya;
}

export default function DynamicMushafPage({ page, riwaya }: DynamicMushafPageProps) {
  const [ayahs, setAyahs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState("...");
  const [pdfQuality, setPdfQuality] = useState<{ lowQuality: boolean; tokenSimilarity?: number; pdfArabicRatio?: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setIsLoading(true);
      setPdfQuality(null);
      setDataSource("Loading...");

      // 1. Fetch the CORRECT base text for this Riwaya
      const hostedPageData = await getHostedRiwayaPageData(page, riwaya.id);
      let baseText = hostedPageData?.ayahs || null;
      if (!cancelled && hostedPageData?.fromHostedFile) {
        setDataSource(hostedPageData.source?.type === "hybrid" ? "Hosted hybrid data (API + PDF raw)" : "Hosted text data");
      }

      // Fallback chain for text riwayat while hosted artifacts are being prepared
      if (!baseText && riwaya.id === 'warsh') {
        baseText = await getWarshPageText(page);
        if (!cancelled) setDataSource("Quran.com Warsh API (fallback)");
      } else if (!baseText) {
        baseText = await getBasePageText(page);
        if (!cancelled) setDataSource("Base Uthmani API (fallback)");
      }
      
      // 2. Fetch specific variants for COLORS and SYMBOLS
      let pageVariants: PageVariants | null = null;
      try {
        const variantRes = await fetch(`/data/variants/${riwaya.id}/page_${page}.json`);
        if (variantRes.ok) {
          pageVariants = await variantRes.json();
        }
      } catch (e) {}

      const processed = processPageWithVariants(baseText, pageVariants);

      // 3. Read PDF-quality report when available (Warsh only)
      if (riwaya.id === "warsh") {
        try {
          const reportRes = await fetch("/data/reports/warsh-pdf-quality.json");
          if (reportRes.ok) {
            const report = await reportRes.json();
            const entry = report?.pages?.find((p: any) => p.page === page);
            if (!cancelled && entry) {
              setPdfQuality({
                lowQuality: !!entry.lowQuality,
                tokenSimilarity: entry.tokenSimilarity,
                pdfArabicRatio: entry.pdfArabicRatio,
              });
            }
          }
        } catch (e) {}
      }

      if (!cancelled) {
        setAyahs(processed);
        setIsLoading(false);
      }
    }
    loadPage();
    return () => {
      cancelled = true;
    };
  }, [page, riwaya.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[#8B7355]/20 border-t-[#8B7355] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full overflow-y-auto mushaf-paper select-text scroll-smooth custom-scrollbar"
      style={{ direction: 'rtl' }}
    >
      <div className="min-h-full w-full flex flex-col p-6 sm:p-12">
        <div className="w-full max-w-2xl mx-auto mb-4">
          <div className="rounded-lg border border-[#EAE2D5] bg-[#FAF7F2] px-3 py-2 text-[11px] text-[#5D4A38]">
            <span className="font-bold text-[#8B7355]">Source:</span> {dataSource}
            {riwaya.id === "warsh" && pdfQuality && (
              <span className={cn("ml-2", pdfQuality.lowQuality ? "text-red-700" : "text-green-700")}>
                | PDF quality: {pdfQuality.lowQuality ? "Low" : "Good"}
                {typeof pdfQuality.tokenSimilarity === "number" ? ` (sim ${pdfQuality.tokenSimilarity})` : ""}
              </span>
            )}
          </div>
        </div>
        <div className="w-full max-w-2xl mx-auto flex-1">
          <div 
            className="quran-text text-xl sm:text-2xl md:text-3xl text-[#2C1E14]"
          >
            {ayahs.map((ayah, aIdx) => (
              <React.Fragment key={aIdx}>
                {ayah.words.map((word: any, wIdx: number) => (
                  <span 
                    key={wIdx}
                    className={cn(
                      "relative inline transition-colors duration-300",
                      word.isVariant && "border-b-2 border-dotted border-[#8B7355]/40"
                    )}
                    title={word.note || `${aIdx}:${wIdx}`}
                  >
                    {/* Render Segments (multi-color within word) */}
                    {word.segments ? (
                      word.segments.map((seg: any, sIdx: number) => (
                        <span key={sIdx} className="relative inline" style={{ color: seg.color || 'inherit' }}>
                          {seg.text}
                          {/* Symbols anchored to this specific segment */}
                          {seg.symbols && seg.symbols.map((sym: any, symIdx: number) => (
                            <span 
                              key={symIdx}
                              className="absolute left-1/2 -translate-x-1/2 font-bold pointer-events-none"
                              style={{ 
                                top: sym.position === 'top' ? '-0.8em' : sym.position === 'center' ? '0' : '1.2em',
                                color: sym.color || '#8B7355',
                                fontSize: sym.fontSize || '0.4em'
                              }}
                            >
                              {sym.char}
                            </span>
                          ))}
                        </span>
                      ))
                    ) : (
                      <span className="relative inline" style={{ color: word.color || 'inherit' }}>
                        {word.text}
                      </span>
                    )}
                    {' '}
                  </span>
                ))}
                <span className="ayah-number">
                  {ayah.numberInSurah}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="h-8 w-full" />
      </div>
    </div>
  );
}
