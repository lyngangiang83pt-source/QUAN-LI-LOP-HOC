import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../../../services/audioService';
import { Bell, BellRing } from 'lucide-react';

interface SchoolBellButtonProps {
  onShowToast?: (msg: string, type?: 'success' | 'danger' | 'wheel' | 'rank' | 'info') => void;
}

const OFFICIAL_BELL_AUDIO_PATH = '/bell-class.mp3';

export const SchoolBellButton: React.FC<SchoolBellButtonProps> = ({ onShowToast }) => {
  const [isRinging, setIsRinging] = useState(false);
  const ringTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dừng chuông khi unmount
  useEffect(() => {
    return () => {
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
      audioService.stopAll();
    };
  }, []);

  const stopBell = () => {
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
    audioService.stopAll();
    setIsRinging(false);
  };

  const playBellSound = async () => {
    if (isRinging) {
      stopBell();
      return;
    }

    setIsRinging(true);

    if (onShowToast) {
      onShowToast('🔔 ĐÃ RUNG CHUÔNG VÀO LỚP! Chúc Thầy/Cô và các em học sinh có một tiết học tuyệt vời! 🎒✨', 'info');
    }

    // Phát trực tiếp file âm thanh chuông reo chính thức (/bell-class.mp3)
    const success = await audioService.playCustomAudio(OFFICIAL_BELL_AUDIO_PATH, () => {
      setIsRinging(false);
    });

    if (!success) {
      // Fallback dự phòng sang chuông điện tổng hợp nếu trình duyệt chặn load file
      audioService.play('electricBell');
      ringTimeoutRef.current = setTimeout(() => {
        setIsRinging(false);
      }, 5000);
    }
  };

  return (
    <button
      type="button"
      onClick={playBellSound}
      className={`px-3.5 py-2 rounded-full font-black text-xs md:text-sm border transition-all flex items-center gap-1.5 shadow-lg active:scale-95 ${
        isRinging
          ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white border-white shadow-red-500/40 animate-pulse'
          : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 border-white/60 shadow-amber-500/30 hover:scale-105'
      }`}
      title={isRinging ? 'Bấm để dừng chuông ngay' : 'Rung chuông Vào lớp (Phát âm thanh chuông reo)'}
    >
      {isRinging ? (
        <>
          <BellRing size={16} className="text-white animate-bounce" />
          <span>Dừng chuông 🔔</span>
        </>
      ) : (
        <>
          <Bell size={16} className="text-slate-950" />
          <span>Vào lớp</span>
        </>
      )}
    </button>
  );
};
