import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../../../services/audioService';
import { Megaphone } from 'lucide-react';

interface SilenceButtonProps {
  onShowToast?: (msg: string, type?: 'success' | 'danger' | 'wheel' | 'rank' | 'info') => void;
}

const OFFICIAL_SILENCE_AUDIO_PATH = '/silence-order.mp3';

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

  const playSilenceSound = async () => {
    if (isPlaying) {
      stopSound();
      return;
    }

    setIsPlaying(true);

    if (onShowToast) {
      onShowToast('🤫 YÊU CẦU CẢ LỚP GIỮ TRẬT TỰ! Lưng thẳng - Tay khoanh - Mắt nhìn - Miệng im lặng 📢✨', 'danger');
    }

    // Phát trực tiếp file âm thanh hiệu lệnh Trật tự chính thức (/silence-order.mp3)
    const success = await audioService.playCustomAudio(OFFICIAL_SILENCE_AUDIO_PATH, () => {
      setIsPlaying(false);
    });

    if (!success) {
      // Fallback nếu trình duyệt chưa sẵn sàng
      ringTimeoutRef.current = setTimeout(() => {
        setIsPlaying(false);
      }, 7000);
    }
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
  );
};
