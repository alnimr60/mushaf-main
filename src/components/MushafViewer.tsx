import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue } from "motion/react";
import { Menu, Search, Book, Sidebar as SidebarIcon, ChevronRight, ChevronLeft, Layout, RefreshCw, Home as HomeIcon } from "lucide-react";
import { QIRAAT_DATA } from "../data/qiraat";
import { SURAHS } from "../data/surahs";
import { cn } from "../lib/utils";
import PageImage from "./PageImage";
import DynamicMushafPage from "./DynamicMushafPage";
import ImagePreloader from "./ImagePreloader";

export default function MushafViewer() {
  const { riwayaId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem("last_page");
    return saved ? parseInt(saved) : 1;
  });
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"surahs" | "juz" | "qiraat">("surahs");
  const [viewMode, setViewMode] = useState<"horizontal" | "vertical">("horizontal");
  const [isImmersive, setIsImmersive] = useState(false);
  const [isTextMode, setIsTextMode] = useState(() => {
    const saved = localStorage.getItem("mushaf_text_mode");
    return saved === "true";
  });

  const riwaya = React.useMemo(() => 
    QIRAAT_DATA.flatMap(q => q.riwayat).find(r => r.id === riwayaId),
    [riwayaId]
  );

  const qiraa = React.useMemo(() => 
    QIRAAT_DATA.find(q => q.riwayat.some(r => r.id === riwayaId)),
    [riwayaId]
  );

  const dragX = useMotionValue(0);

  useEffect(() => {
    localStorage.setItem("last_page", page.toString());
  }, [page]);

  useEffect(() => {
    localStorage.setItem("mushaf_text_mode", isTextMode.toString());
  }, [isTextMode]);

  const handleNextPage = () => {
    if (page < 604) {
      dragX.stop();
      dragX.set(0);
      setDirection(1);
      setPage(p => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      dragX.stop();
      dragX.set(0);
      setDirection(-1);
      setPage(p => p - 1);
    }
  };

  const onDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      handleNextPage();
    } else if (info.offset.x < -swipeThreshold) {
      handlePrevPage();
    }
  };

  const currentSurah = React.useMemo(() => 
    [...SURAHS].reverse().find(s => s.page <= page),
    [page]
  );

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? -300 : 300, 
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  if (!riwaya) return <div className="p-20 text-center text-[#2C1E14]">القراءة غير موجودة</div>;

  return (
    <div className="relative h-screen w-full bg-[#F8F6F2] overflow-hidden select-none touch-none">
      {riwaya.type === 'image' && <ImagePreloader currentPage={page} riwaya={riwaya} />}
      
      {/* Top bar (Auto-hiding) */}
      <AnimatePresence>
        {!isImmersive && (
          <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="absolute top-0 right-0 left-0 h-16 bg-[#F8F6F2]/95 backdrop-blur-md border-b border-[#F0EBE5] z-40 flex items-center justify-between px-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate("/")}
                className="w-8 h-8 rounded-full bg-[#F0EBE5] flex items-center justify-center hover:bg-[#EAE2D5] transition-all text-[#2C1E14]"
              >
                <ChevronRight size={18} />
              </button>
              <div className="text-right">
                <h2 className="text-[#8B7355] font-amiri font-bold text-lg leading-tight">{qiraa?.name}</h2>
                <p className="text-[#5D4A38] text-[9px] font-bold tracking-widest uppercase opacity-70">برواية {riwaya.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsTextMode(!isTextMode)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all",
                  isTextMode 
                    ? "bg-[#8B7355] text-white border-[#8B7355]" 
                    : "border-[#EAE2D5] text-[#8B7355] hover:bg-[#F0EBE5]"
                )}
              >
                <Layout size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{isTextMode ? 'نمط الصور' : 'نمط النص'}</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(true); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#EAE2D5] text-[#8B7355] hover:bg-[#F0EBE5] transition-all"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider">الفهرس</span>
                <Menu size={18} />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Mushaf Content */}
      <main 
        className="h-full w-full flex items-center justify-center bg-[#FFFDF9] relative overflow-hidden"
        onClick={() => setIsImmersive(!isImmersive)}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={`${riwayaId}-${page}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={onDragEnd}
            transition={{ type: "spring", damping: 35, stiffness: 400, mass: 0.5 }}
            className="absolute h-full w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <div className={cn(
              "relative w-full h-full flex items-center justify-center transition-all duration-500",
              "sm:max-w-2xl sm:max-h-[90vh] sm:rounded-xl sm:shadow-2xl sm:border sm:border-[#EAE2D5] bg-white overflow-hidden"
            )}>
              {/* Header Info (Auto-hiding) */}
              <div className="absolute top-0 right-0 left-0 h-16 bg-gradient-to-b from-white/90 to-transparent flex items-center justify-between px-6 pt-2 text-[10px] text-[#8B7355] font-bold pointer-events-none z-20 transition-opacity duration-300" 
                   style={{ opacity: isImmersive ? 0 : 0.8 }}>
                <div className="flex flex-col items-start">
                   <span className="opacity-50">الجزء {Math.ceil(page/20)}</span>
                </div>
                <div className="flex flex-col items-center">
                   <span className="font-amiri text-base">{currentSurah?.name}</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="opacity-50">ص {page}</span>
                </div>
              </div>
              
              {isTextMode ? (
                <DynamicMushafPage page={page} riwaya={riwaya} />
              ) : (
                <PageImage page={page} riwaya={riwaya} isImmersive={isImmersive} />
              )}
              
              {/* Paper Texture Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] mix-blend-overlay z-10" />
              
              {/* Corner Accents (Desktop only) */}
              <div className="hidden sm:block absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#8B7355]/10 rounded-tl-xl pointer-events-none" />
              <div className="hidden sm:block absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#8B7355]/10 rounded-tr-xl pointer-events-none" />
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Page Indicator */}
      {!isImmersive && (
        <div className="absolute bottom-6 left-6 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full border border-[#F0EBE5] text-[9px] text-[#8B7355] font-bold shadow-sm">
           صفحة {page} من ٦٠٤
        </div>
      )}

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-[#2C1E14]/20 backdrop-blur-[2px] z-50 overflow-hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 35, stiffness: 350 }}
              className="absolute top-0 right-0 h-full w-[85vw] max-w-sm bg-white border-l border-[#EAE2D5] z-[60] shadow-2xl flex flex-col pt-12"
            >
              <div className="px-8 pb-6 border-b-2 border-[#8B7355] mx-2 space-y-3">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold font-amiri text-[#2C1E14]">الفهرس والقراءات</h3>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-[#8B7355] hover:rotate-90 transition-transform">
                      <ChevronRight size={24} />
                    </button>
                 </div>
              </div>

              <div className="px-4 pb-4 border-b border-[#F0EBE5]">
                <div className="flex bg-[#F8F6F2] p-1 rounded-xl">
                  {[
                    { id: "surahs", name: "السور" },
                    { id: "juz", name: "الأجزاء" },
                    { id: "qiraat", name: "القراءات" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSidebarTab(tab.id as any)}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                        sidebarTab === tab.id 
                          ? "bg-white text-[#8B7355] shadow-sm" 
                          : "text-[#2C1E14] opacity-50 hover:opacity-100"
                      )}
                    >
                      {tab.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                 {sidebarTab === "surahs" && (
                   <div className="grid grid-cols-1 divide-y divide-[#F0EBE5]">
                     {SURAHS.map(s => (
                       <button 
                         key={s.id}
                         onClick={() => { setPage(s.page); setIsSidebarOpen(false); }}
                         className={cn(
                           "w-full flex items-center justify-between py-4 transition-all text-right",
                           page === s.page ? "text-[#8B7355] font-bold" : "text-[#2C1E14] hover:pr-2"
                         )}
                       >
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] opacity-30 font-mono w-4">{s.id}</span>
                            <span className="font-amiri text-lg">{s.name}</span>
                         </div>
                         <span className="text-[10px] opacity-40 font-bold uppercase">ص {s.page}</span>
                       </button>
                     ))}
                   </div>
                 )}

                 {sidebarTab === "juz" && (
                    <div className="grid grid-cols-3 gap-2">
                       {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => (
                         <button
                           key={juz}
                           onClick={() => { setPage((juz - 1) * 20 + 2); setIsSidebarOpen(false); }}
                           className={cn(
                             "py-4 rounded-xl border text-sm transition-all font-bold",
                             Math.ceil(page / 20) === juz 
                              ? "bg-[#8B7355] text-white border-[#8B7355] shadow-lg" 
                              : "border-[#F0EBE5] text-[#2C1E14] hover:bg-[#F8F6F2]"
                           )}
                         >
                           الجزء {juz}
                         </button>
                       ))}
                    </div>
                 )}

                 {sidebarTab === "qiraat" && (
                    <div className="space-y-8">
                      {QIRAAT_DATA.map(q => (
                        <div key={q.id} className="space-y-3">
                          <p className="text-[10px] text-[#8B7355] font-bold uppercase tracking-widest pl-2">{q.name}</p>
                          <div className="flex flex-col border-r-2 border-[#F0EBE5]">
                             {q.riwayat.map(r => (
                               <button 
                                 key={r.id}
                                 onClick={() => { navigate(`/read/${r.id}`); setIsSidebarOpen(false); }}
                                 className={cn(
                                   "py-4 pr-6 text-sm text-right border-b border-[#F0EBE5] last:border-0 transition-all",
                                   riwayaId === r.id 
                                    ? "text-[#8B7355] font-bold bg-[#F8F6F2]" 
                                    : "text-[#2C1E14] hover:bg-[#FCFBFA]"
                                 )}
                               >
                                 رواية {r.name}
                               </button>
                             ))}
                          </div>
                        </div>
                      ))}
                    </div>
                 )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
