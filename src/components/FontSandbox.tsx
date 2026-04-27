import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Type, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { MOCK_VARIANTS } from '../data/mockVariants';

export default function FontSandbox() {
  const navigate = useNavigate();
  const [fontSize, setFontSize] = useState(48);
  const [text, setText] = useState('وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً');
  const [loading, setLoading] = useState(false);
  const [surah, setSurah] = useState(2);
  const [ayah, setAyah] = useState(30);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  const fetchAyah = async (s: number, a: number) => {
    setLoading(true);
    setSelectedNote(null);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${s}:${a}/quran-uthmani`);
      const data = await res.json();
      if (data.data) {
        setText(data.data.text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeVariants = MOCK_VARIANTS.filter(v => v.surah === surah && v.ayah === ayah);

  return (
    <div className="min-h-screen bg-[#F8F6F2] flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b border-[#F0EBE5] flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-full bg-[#F0EBE5] flex items-center justify-center text-[#2C1E14]"
          >
            <ChevronRight size={18} />
          </button>
          <h1 className="font-bold text-[#2C1E14]">معمل الخطوط الرقمية</h1>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={surah} 
            onChange={(e) => { setSurah(Number(e.target.value)); fetchAyah(Number(e.target.value), 1); }}
            className="bg-[#F8F6F2] border border-[#F0EBE5] rounded-lg px-2 py-1 text-xs font-bold outline-none"
          >
            {Array.from({length: 114}, (_, i) => (
              <option key={i+1} value={i+1}>سورة {i+1}</option>
            ))}
          </select>
          <input 
            type="number" 
            value={ayah} 
            onChange={(e) => { setAyah(Number(e.target.value)); fetchAyah(surah, Number(e.target.value)); }}
            className="w-16 bg-[#F8F6F2] border border-[#F0EBE5] rounded-lg px-2 py-1 text-xs font-bold outline-none text-center"
            placeholder="آية"
          />
        </div>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-8">
        {selectedNote && (
          <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-xl text-amber-900 font-amiri text-lg shadow-sm animate-in fade-in slide-in-from-top-4">
            <p className="flex gap-3">
              <span className="font-bold text-amber-600">تنبيه القراءة:</span>
              {selectedNote}
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#F0EBE5] space-y-6">
          <div className="flex items-center justify-between border-b border-[#F0EBE5] pb-4">
            <div className="flex items-center gap-2 text-[#8B7355]">
              <Sparkles size={20} />
              <span className="font-bold">تجربة النص الرقمي (Hafs Base)</span>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="24" 
                max="120" 
                value={fontSize} 
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-32 accent-[#8B7355]"
              />
              <span className="text-[10px] font-bold text-[#8B7355] w-8">{fontSize}px</span>
            </div>
          </div>

          <div className="relative space-y-4">
            {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-xl">
                <div className="w-8 h-8 border-4 border-[#8B7355]/20 border-t-[#8B7355] rounded-full animate-spin" />
              </div>
            )}
            <div 
              className="min-h-[200px] flex flex-wrap flex-row-reverse items-center justify-center text-center gap-x-4 gap-y-8 p-8 bg-[#FCFBFA] rounded-xl border-2 border-dashed border-[#F0EBE5]"
              style={{ 
                fontFamily: 'UthmanicHafs', 
                fontSize: `${fontSize}px`,
                direction: 'rtl'
              }}
            >
              {text.split(' ').map((word, i) => {
                const variant = activeVariants.find(v => v.wordIndex === i);
                return (
                  <span 
                    key={i} 
                    onClick={() => variant && setSelectedNote(variant.note)}
                    className={cn(
                      "relative transition-all duration-300 cursor-pointer p-1 rounded-md",
                      variant ? "bg-amber-50 ring-2" : "hover:bg-gray-50"
                    )}
                    style={{ 
                      color: variant?.color || 'inherit',
                      borderColor: variant?.color || 'transparent'
                    }}
                  >
                    {word}
                    {variant && (
                      <span 
                        className="absolute -top-6 left-1/2 -translate-x-1/2 text-[12px] font-bold"
                        style={{ color: variant.color }}
                      >
                        {variant.symbol}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
            <p className="text-center text-[10px] text-[#8B7355] opacity-60">
              * سيتم تلوين الكلمات وإضافة العلامات تلقائياً عند اختيار آية مسجلة في قاعدة البيانات (مثل سورة ٢ آية ٣٠).
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#8B7355] uppercase tracking-wider">نص التجربة</label>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-4 rounded-xl border border-[#F0EBE5] font-arabic text-lg focus:ring-2 focus:ring-[#8B7355] outline-none min-h-[100px] bg-[#F8F6F2]/50"
              placeholder="اكتب النص القرآني هنا..."
            />
          </div>
        </div>

        <div className="bg-[#8B7355]/5 rounded-2xl p-6 border border-[#8B7355]/10">
          <h3 className="text-[#8B7355] font-bold mb-4 flex items-center gap-2">
            <Type size={18} />
            كيف نبدأ بناء "خط القراءات"؟
          </h3>
          <ul className="space-y-3 text-sm text-[#5D4A38] leading-relaxed">
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-[#8B7355] text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold">1</span>
              <span>نستخدم هذا الخط (UthmanicHafs) كأساس لكل الكلمات العادية.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-[#8B7355] text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold">2</span>
              <span>بالنسبة للكلمات التي بها "خلاف" أو "علامات خاصة"، نقوم باستخراجها كـ <b>Vector</b> من الـ PDF.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-[#8B7355] text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>نضع هذه الكلمات الخاصة في ملف خط جديد (مثلاً: <code className="bg-white px-1 rounded">MushafVariants.ttf</code>).</span>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-[#8B7355] text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold">4</span>
              <span>في الكود، نقوم بتبديل الكلمة العادية بالكلمة الخاصة من الخط الجديد عند الحاجة.</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
