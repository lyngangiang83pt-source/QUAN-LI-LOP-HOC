import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../../../services/audioService';
import { Megaphone, X, Sparkles, Volume2 } from 'lucide-react';

interface SilenceButtonProps {
  onShowToast?: (msg: string, type?: 'success' | 'danger' | 'wheel' | 'rank' | 'info') => void;
}

const OFFICIAL_SILENCE_AUDIO_PATH = '/silence-order.mp3';

interface SloganStep {
  word: string;
  sub: string;
  icon: string;
  colorClass: string;
  borderClass: string;
  glowClass: string;
}

const SLOGAN_STEPS: SloganStep[] = [
  {
    word: 'LƯNG',
    sub: 'Lưng ngồi thẳng',
    icon: '🧘',
    colorClass: 'from-amber-400 to-yellow-500',
    borderClass: 'border-amber-400',
    glowClass: 'shadow-amber-500/50 text-amber-300',
  },
  {
    word: 'TAY',
    sub: 'Tay để lên bàn',
    icon: '🤲',
    colorClass: 'from-sky-400 to-blue-500',
    borderClass: 'border-sky-400',
    glowClass: 'shadow-sky-500/50 text-sky-300',
  },
  {
    word: 'MẮT',
    sub: 'Mắt nhìn lên bảng',
    icon: '👀',
    colorClass: 'from-emerald-400 to-teal-500',
    borderClass: 'border-emerald-400',
    glowClass: 'shadow-emerald-500/50 text-emerald-300',
  },
  {
    word: 'MIỆNG',
    sub: 'Miệng giữ im lặng',
    icon: '🤫',
    colorClass: 'from-rose-500 to-pink-500',
    borderClass: 'border-rose-400',
    glowClass: 'shadow-rose-500/50 text-rose-300',
  },
];

export const SilenceButton: React.FC<SilenceButtonProps> = ({ onShowToast }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  const stepTimersRef = useRef<NodeJS.Timeout[]>([]);
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = () => {
    stepTimersRef.current.forEach((t) => clearTimeout(t));
    stepTimersRef.current = [];
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
      autoCloseTimeoutRef.current = null;
    }
  };

  // Dừng âm thanh khi unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
      audioService.stopAll();
    };
  }, []);

  // Lắng nghe phím ESC hoặc Space để đóng overlay nhanh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'Escape' || e.code === 'Space') {
        e.preventDefault();
        stopSound();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const stopSound = () => {
    clearAllTimers();
    audioService.stopAll();
    setIsPlaying(false);
    setActiveStep(0);
  };

  const playSilenceSound = async () => {
    if (isPlaying) {
      stopSound();
      return;
    }

    clearAllTimers();
    setIsPlaying(true);
    setActiveStep(0);

    if (onShowToast) {
      onShowToast('🤫 YÊU CẦU CẢ LỚP GIỮ TRẬT TỰ! Lưng thẳng - Tay khoanh - Mắt nhìn - Miệng im lặng 📢✨', 'danger');
    }

    // Thiết lập chuỗi thời gian thắp sáng từng từ theo đúng nhịp audio (0s: Lưng -> 1.4s: Tay -> 3.1s: Mắt -> 4.7s: Miệng)
    stepTimersRef.current = [
      setTimeout(() => setActiveStep(0), 100),
      setTimeout(() => setActiveStep(1), 1400),
      setTimeout(() => setActiveStep(2), 3100),
      setTimeout(() => setActiveStep(3), 4700),
    ];

    // Phát trực tiếp file âm thanh hiệu lệnh Trật tự chính thức (/silence-order.mp3)
    const success = await audioService.playCustomAudio(OFFICIAL_SILENCE_AUDIO_PATH, () => {
      // Khi phát xong, giữ màn hình thêm 0.8s để học sinh kịp nhìn rồi tự đóng
      autoCloseTimeoutRef.current = setTimeout(() => {
        setIsPlaying(false);
      }, 800);
    });

    if (!success) {
      // Fallback nếu có lỗi load audio
      autoCloseTimeoutRef.current = setTimeout(() => {
        setIsPlaying(false);
      }, 7000);
    }
  };

  return (
    <>
      {/* NÚT BẤM TRÊN HEADER BANNER */}
      <button
        type="button"
        onClick={playSilenceSound}
        className={`px-3.5 py-2 rounded-full font-black text-xs md:text-sm border transition-all flex items-center gap-1.5 shadow-lg active:scale-95 ${
          isPlaying
            ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white border-white shadow-rose-500/40 animate-pulse'
            : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white border-white/40 shadow-rose-500/30 hover:scale-105'
        }`}
        title={isPlaying ? 'Bấm để dừng âm thanh ngay' : 'Phát hiệu lệnh Trật tự (Lưng - Tay - Mắt - Miệng)'}
      >
        {isPlaying ? (
          <>
            <Megaphone size={16} className="text-white animate-bounce" />
            <span>Đang phát hiệu lệnh! 🤫</span>
          </>
        ) : (
          <>
            <Megaphone size={15} />
            <span>Trật tự</span>
          </>
        )}
      </button>

      {/* ============================================================ */}
      {/* FULLSCREEN OVERLAY CHIẾU LÊN MÀN HÌNH MÁY CHIẾU LỚP HỌC        */}
      {/* ============================================================ */}
      {isPlaying && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950/92 backdrop-blur-2xl animate-fadeIn select-none">
          
          {/* Luồng sáng vàng Spotlight từ trên chiếu xuống */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-amber-500/25 via-rose-500/15 to-transparent blur-3xl pointer-events-none rounded-full" />

          {/* Nút đóng nhanh ở góc trên */}
          <button
            type="button"
            onClick={stopSound}
            className="absolute top-5 right-5 p-3 rounded-2xl bg-white/10 hover:bg-rose-600 text-white/80 hover:text-white transition-all shadow-lg border border-white/20 flex items-center gap-2 text-xs font-bold"
            title="Đóng hiệu lệnh (Phím Esc)"
          >
            <span>Đóng</span>
            <X size={18} />
          </button>

          {/* Banner Tiêu Đề Hiệu Lệnh */}
          <div className="relative mb-6 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-red-600/40 via-rose-500/40 to-red-600/40 border-2 border-rose-400/60 text-rose-200 font-black text-xs sm:text-sm md:text-base tracking-widest uppercase mb-3 shadow-xl shadow-rose-500/30 animate-pulse">
              <Megaphone size={18} className="animate-bounce" />
              <span>HIỆU LỆNH GIỮ TRẬT TỰ LỚP HỌC</span>
              <Megaphone size={18} className="animate-bounce" />
            </div>

            {/* DÒNG CHỮ KHẨU HIỆU 4 CHỮ KHỔNG LỒ PHÁT SÁNG */}
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-wider uppercase bg-gradient-to-r from-amber-300 via-yellow-200 to-rose-400 bg-clip-text text-transparent drop-shadow-[0_10px_35px_rgba(245,158,11,0.6)]">
              LƯNG — TAY — MẮT — MIỆNG
            </h1>
          </div>

          {/* 4 THẺ BẢNG HIỆU NỔI BẬT CHIẾU SÁNG THEO TỪNG NHỊP */}
          <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 my-4">
            {SLOGAN_STEPS.map((step, index) => {
              const isCurrent = activeStep === index;
              const hasPassed = activeStep >= index;

              return (
                <div
                  key={step.word}
                  className={`relative rounded-3xl p-4 sm:p-6 md:p-7 text-center transition-all duration-300 flex flex-col items-center justify-center border-2 ${
                    isCurrent
                      ? `scale-105 sm:scale-110 bg-gradient-to-b from-slate-900 to-slate-800 ${step.borderClass} shadow-2xl ${step.glowClass} z-10 animate-scaleUp`
                      : hasPassed
                      ? `bg-slate-900/90 ${step.borderClass} opacity-95 shadow-lg`
                      : 'bg-slate-900/40 border-white/10 opacity-40 scale-95'
                  }`}
                >
                  {/* Hào quang khi từ đang được đọc */}
                  {isCurrent && (
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-400 to-rose-500 blur-md opacity-70 animate-pulse -z-10" />
                  )}

                  {/* Icon khổng lồ */}
                  <div className="text-4xl sm:text-6xl md:text-7xl mb-2 sm:mb-3 drop-shadow-md">
                    {step.icon}
                  </div>

                  {/* Chữ lớn bừng sáng */}
                  <div
                    className={`text-2xl sm:text-4xl md:text-5xl font-black tracking-wider uppercase mb-1 drop-shadow-md ${
                      hasPassed ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {step.word}
                  </div>

                  {/* Lời diễn giải bên dưới */}
                  <div
                    className={`text-xs sm:text-sm md:text-base font-bold transition-colors ${
                      isCurrent
                        ? step.glowClass
                        : hasPassed
                        ? 'text-slate-200'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.sub}
                  </div>

                  {/* Chấm trạng thái */}
                  <div className="mt-3 flex items-center justify-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        isCurrent
                          ? 'bg-amber-400 scale-125 shadow-lg shadow-amber-400'
                          : hasPassed
                          ? 'bg-emerald-400'
                          : 'bg-slate-700'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* NÚT DỪNG DƯỚI ĐÁY */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={stopSound}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 via-red-600 to-rose-700 hover:from-rose-600 hover:to-red-800 text-white font-black text-sm md:text-base tracking-wider uppercase shadow-xl shadow-red-600/30 border-2 border-white/60 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <X size={18} />
              <span>Dừng hiệu lệnh (Phím Space / Esc)</span>
            </button>
            <p className="text-xs text-slate-400">
              Khẩu lệnh tự động đóng khi kết thúc âm thanh
            </p>
          </div>
        </div>
      )}
    </>
  );
};
