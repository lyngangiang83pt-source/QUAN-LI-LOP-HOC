import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../../../services/audioService';
import { Megaphone } from 'lucide-react';

interface SilenceButtonProps {
  onShowToast?: (msg: string, type?: 'success' | 'danger' | 'wheel' | 'rank' | 'info') => void;
}

export const SilenceButton: React.FC<SilenceButtonProps> = ({ onShowToast }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const ringTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dừng âm thanh khi unmount
  useEffect(() => {
    return () => {
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
      audioService.stopAll();
    };
  }, []);

  const stopSound = () => {
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
    audioService.stopAll();
    setIsPlaying(false);
  };

  const playSilenceSound = () => {
    if (isPlaying) {
      stopSound();
      return;
    }

    setIsPlaying(true);

    if (onShowToast) {
      onShowToast('🤫 YÊU CẦU CẢ LỚP GIỮ TRẬT TỰ! Thầy/Cô đang có hiệu lệnh quan trọng 📢✨', 'danger');
    }

    // Phát tiếng gõ búa / thước gỗ hiệu lệnh dứt khoát: CỐC! CỐC! CỐC!
    audioService.play('silenceGavel');
    ringTimeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
    }, 1500);
  };

  return (
    <button
      type="button"
      onClick={playSilenceSound}
      className={`px-3.5 py-2 rounded-full font-black text-xs md:text-sm border transition-all flex items-center gap-1.5 shadow-lg active:scale-95 ${
        isPlaying
          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white border-white shadow-rose-500/40 animate-pulse'
          : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white border-white/40 shadow-rose-500/30 hover:scale-105'
      }`}
      title={isPlaying ? 'Bấm để dừng âm thanh' : 'Phát hiệu lệnh yêu cầu cả lớp Giữ trật tự (Gõ búa Cốc! Cốc! Cốc!)'}
    >
      {isPlaying ? (
        <>
          <Megaphone size={16} className="text-white animate-bounce" />
          <span>Yêu cầu trật tự! 🤫</span>
        </>
      ) : (
        <>
          <Megaphone size={15} />
          <span>Trật tự</span>
        </>
      )}
    </button>
  );
};
