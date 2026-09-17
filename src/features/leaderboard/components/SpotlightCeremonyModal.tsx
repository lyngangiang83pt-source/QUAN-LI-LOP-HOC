import React, { useEffect, useState } from 'react';
import { Student } from '../../../types';
import { audioService } from '../../../services/audioService';
import { triggerGoldStarsCelebration } from '../../../services/confettiService';
import { Crown, Sparkles, X, Plus, Camera, Award } from 'lucide-react';

interface SpotlightCeremonyModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  className: string;
  onApplyBonusScore?: (studentId: string, pts: number, reason: string) => void;
}

export const SpotlightCeremonyModal: React.FC<SpotlightCeremonyModalProps> = ({
  isOpen,
  onClose,
  students,
  className,
  onApplyBonusScore,
}) => {
  const [hideControlsForPhoto, setHideControlsForPhoto] = useState(false);

  // Find the top score in the class
  const maxScore = Math.max(0, ...students.map((s) => s.points || 0));
  const champions = students.filter((s) => (s.points || 0) === maxScore && maxScore > 0);

  useEffect(() => {
    if (isOpen) {
      setHideControlsForPhoto(false);
      // Play triumphant fanfare music
      audioService.play('fanfare');
      // Fire celebratory gold star showers
      triggerGoldStarsCelebration();

      const timer2 = setTimeout(() => {
        triggerGoldStarsCelebration();
      }, 1200);

      return () => clearTimeout(timer2);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleBonusPoint = (studentId: string) => {
    if (onApplyBonusScore) {
      onApplyBonusScore(studentId, 1, 'Thưởng vinh danh Quán Quân Top 1');
      audioService.play('win');
      triggerGoldStarsCelebration();
    }
  };

  const handleTakePhotoMode = () => {
    setHideControlsForPhoto(true);
    setTimeout(() => {
      setHideControlsForPhoto(false);
    }, 4500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden animate-fadeIn select-none">
      {/* 1. Golden Spotlight Beams from Top */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Top Projector Light Source */}
        <div className="absolute top-0 w-44 h-10 bg-yellow-100 rounded-full blur-lg shadow-[0_0_100px_40px_rgba(251,191,36,0.9)] opacity-90" />

        {/* Radiant Conical Spotlight Beam */}
        <div
          className="absolute top-0 w-[95%] max-w-3xl h-full bg-gradient-to-b from-yellow-300/40 via-amber-400/20 to-yellow-500/5 animate-spotlightPulse pointer-events-none"
          style={{
            clipPath: 'polygon(36% 0%, 64% 0%, 100% 100%, 0% 100%)',
          }}
        />

        {/* Secondary Cross Spotlight Beam */}
        <div
          className="absolute top-0 w-[70%] max-w-xl h-full bg-gradient-to-b from-amber-200/30 via-yellow-400/15 to-transparent pointer-events-none"
          style={{
            clipPath: 'polygon(42% 0%, 58% 0%, 90% 100%, 10% 100%)',
          }}
        />

        {/* Floating Sparkles In Atmosphere */}
        <span className="absolute top-1/4 left-1/4 text-3xl opacity-70 animate-floatStar1">✨</span>
        <span className="absolute top-1/3 right-1/4 text-2xl opacity-70 animate-floatStar2">⭐</span>
        <span className="absolute top-1/2 left-1/5 text-3xl opacity-60 animate-floatStar3">🌟</span>
        <span className="absolute top-2/5 right-1/5 text-2xl opacity-60 animate-floatStar1">✨</span>
      </div>

      {/* 2. Top Header Bar with Close Button */}
      <div className="relative z-20 w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-amber-400/30 text-amber-300 text-xs md:text-sm font-black">
          <Sparkles size={16} className="text-yellow-300 animate-spin-once" />
          <span>LỄ VINH DANH HỌC SINH XUẤT SẮC - LỚP {className.toUpperCase()}</span>
        </div>

        {!hideControlsForPhoto && (
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
            title="Đóng vinh danh (Phím ESC)"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* 3. Center Spotlight Stage & Champions */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center max-w-3xl w-full">
        {champions.length > 0 ? (
          <div className="flex flex-col items-center">
            {/* Giant Floating Crown */}
            <div className="relative mb-2">
              <span className="text-6xl sm:text-7xl md:text-8xl block animate-floatMvpCrown filter drop-shadow-[0_10px_25px_rgba(245,158,11,0.9)]">
                👑
              </span>
              <span className="absolute -top-2 -right-4 text-3xl animate-bounce">✨</span>
            </div>

            {/* Champions List (Single Top 1 or Tied Champions) */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-4">
              {champions.map((champ) => (
                <div key={champ.id} className="flex flex-col items-center">
                  {/* Name in Golden Glowing Text */}
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-200 drop-shadow-[0_4px_30px_rgba(251,191,36,0.9)] uppercase tracking-tight mb-2">
                    {champ.name}
                  </h1>

                  {/* Student Code Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-300/50 text-amber-200 text-xs sm:text-sm font-extrabold shadow-md mb-3">
                    <span>Mã HS: <strong>{champ.id}</strong></span>
                    <span>•</span>
                    <span>Lớp {className}</span>
                  </div>

                  {/* Score Podium Badge */}
                  <div className="px-6 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-lg sm:text-2xl shadow-[0_10px_35px_rgba(245,158,11,0.6)] border-2 border-white flex items-center gap-2 transform hover:scale-105 transition-transform">
                    <span>⭐ {champ.points} ĐIỂM TÍCH LŨY ⭐</span>
                  </div>

                  {/* Quick Bonus Point Button */}
                  {!hideControlsForPhoto && onApplyBonusScore && (
                    <button
                      type="button"
                      onClick={() => handleBonusPoint(champ.id)}
                      className="mt-3 px-3.5 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/40 text-amber-300 border border-amber-400/40 font-extrabold text-xs transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-sm"
                      title="Thưởng thêm 1 điểm vinh danh cho học sinh này"
                    >
                      <Plus size={14} />
                      <span>Thưởng nóng +1đ vinh danh</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Glowing Floor Pedestal */}
            <div className="relative mt-2 flex items-center justify-center">
              <div className="w-60 sm:w-80 md:w-96 h-12 sm:h-16 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 rounded-[50%] opacity-85 shadow-[0_0_80px_25px_rgba(245,158,11,0.85)] animate-pedestalGlow flex items-center justify-center border-2 border-yellow-200">
                <span className="text-amber-950 font-black text-xs sm:text-sm uppercase tracking-widest flex items-center gap-1">
                  <Award size={16} />
                  <span>QUÁN QUÂN XUẤT SẮC NHẤT LỚP</span>
                  <Award size={16} />
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white/10 border border-white/20 text-white text-center max-w-md">
            <div className="text-5xl mb-3">🎯</div>
            <h3 className="text-xl font-black mb-2">Chưa có học sinh đạt điểm trong lớp!</h3>
            <p className="text-xs text-slate-300 mb-4">
              Thầy/Cô hãy bắt đầu cho điểm các em học sinh có mặt và tham gia phát biểu để vinh danh Top 1 nhé!
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs"
            >
              Quay lại lớp học
            </button>
          </div>
        )}
      </div>

      {/* 4. Bottom Floating Action Controls */}
      {!hideControlsForPhoto && champions.length > 0 && (
        <div className="relative z-20 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              audioService.play('fanfare');
              triggerGoldStarsCelebration();
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-700 hover:via-pink-700 hover:to-amber-600 text-white font-black text-xs md:text-sm shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Sparkles size={16} />
            <span>Bắn thêm pháo hoa & nhạc 🎆</span>
          </button>

          <button
            type="button"
            onClick={handleTakePhotoMode}
            className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs md:text-sm border border-white/25 backdrop-blur-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg"
            title="Ẩn tạm thời các nút bấm trong 4 giây để Thầy/Cô chụp ảnh màn hình hoặc chiếu cho cả lớp ngắm"
          >
            <Camera size={16} />
            <span>Chế độ chụp ảnh lưu niệm 📸</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs md:text-sm border border-slate-700 transition-all hover:scale-105 active:scale-95"
          >
            Đóng vinh danh (ESC)
          </button>
        </div>
      )}

      {/* Photo Mode Overlay Hint */}
      {hideControlsForPhoto && (
        <div className="relative z-20 text-[11px] font-bold text-amber-200/80 bg-black/40 px-4 py-1.5 rounded-full border border-amber-400/30 animate-pulse">
          📸 Đang ở chế độ Chụp ảnh lưu niệm (Tự động hiện lại nút sau 4 giây...)
        </div>
      )}
    </div>
  );
};
