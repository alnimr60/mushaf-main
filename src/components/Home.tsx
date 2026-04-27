import React from "react";
import { useNavigate } from "react-router-dom";
import { QIRAAT_DATA } from "../data/qiraat";
import { motion } from "motion/react";
import { BookOpen, ChevronLeft, Sparkles } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F6F2] p-6 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-12"
      >
        <header className="text-center space-y-4 relative">
          <button 
            onClick={() => navigate('/sandbox')}
            className="absolute -top-10 left-0 p-3 rounded-full bg-white border border-[#F0EBE5] text-[#8B7355] hover:bg-[#8B7355] hover:text-white transition-all shadow-sm group"
            title="معمل الخطوط"
          >
            <Sparkles size={20} className="group-hover:animate-pulse" />
          </button>
          <h1 className="text-4xl font-bold font-amiri text-[#8B7355]">مصحف القراءات</h1>
          <div className="h-0.5 w-16 bg-[#8B7355] mx-auto" />
        </header>

        <div className="grid gap-4">
          {QIRAAT_DATA.map((qiraa, idx) => (
            <motion.div
              key={qiraa.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="space-y-3"
            >
              <h2 className="text-sm font-bold text-[#8B7355] uppercase tracking-[0.2em] pr-2">
                {qiraa.name}
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {qiraa.riwayat.map((riwaya) => (
                  <button
                    key={riwaya.id}
                    onClick={() => navigate(`/read/${riwaya.id}`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-[#FCFBFA] hover:bg-white border border-[#F0EBE5] rounded-xl transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#F0EBE5] flex items-center justify-center text-[#5D4A38] group-hover:bg-[#8B7355] group-hover:text-white transition-all">
                        <BookOpen size={20} />
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-[#2C1E14] block">{riwaya.name}</span>
                        <span className="text-xs text-[#8B7355] opacity-70">إقرار القراءة</span>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center gap-2">
                      <span className="px-4 py-1.5 rounded-full bg-[#F0EBE5] text-[#5D4A38] text-[10px] font-bold group-hover:bg-[#8B7355] group-hover:text-white transition-colors">
                        فتح المصحف
                      </span>
                      <ChevronLeft size={18} className="text-[#EAE2D5] group-hover:text-[#8B7355] transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <footer className="text-center pt-12 pb-12">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#8B7355] opacity-50">تطبيق المصحف الشريف للقراءات</div>
        </footer>
      </motion.div>
    </div>
  );
}
