import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";
import { getPageImageUrl } from "../lib/imageUtils";

interface PageImageProps {
  page: number;
  riwaya: any;
  isImmersive: boolean;
}

export default function PageImage({ page, riwaya, isImmersive }: PageImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Quick timeout to prevent spinner flash if image loads instantly from cache
    const spinnerTimer = setTimeout(() => {
      setShowSpinner(true);
    }, 150);

    return () => {
      clearTimeout(spinnerTimer);
      setShowSpinner(false);
    };
  }, [page, riwaya.id]);

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
      {showSpinner && isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
          <div className="w-8 h-8 border-4 border-[#8B7355]/20 border-t-[#8B7355] rounded-full animate-spin" />
        </div>
      )}

      {hasError ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center z-20">
           <RefreshCw className="text-[#8B7355] opacity-20" size={48} />
           <p className="text-[#8B7355] font-amiri text-lg">عذراً، لم يتم العثور على هذه الصفحة</p>
           <p className="text-[#5D4A38] text-[10px] opacity-60">تأكد من وجود الصفحة في مستودع GitHub</p>
        </div>
      ) : (
        <img
          src={getPageImageUrl(page, riwaya)}
          alt={`الصفحة ${page}`}
          decoding="async"
          loading="eager"
          fetchPriority="high"
          onLoad={() => setIsLoading(false)}
          onError={() => { setIsLoading(false); setHasError(true); }}
          className={cn(
            "w-full h-full object-contain pointer-events-none transition-all duration-700 ease-in-out relative z-10",
            "p-1 sm:p-8",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          draggable={false}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}
