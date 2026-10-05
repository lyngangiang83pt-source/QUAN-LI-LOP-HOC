import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../../../services/audioService';
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Play,
  Square,
  Settings,
  Upload,
  Link as LinkIcon,
  Music,
  Check,
  Sparkles,
  X,
  ChevronDown,
} from 'lucide-react';

export type BellSoundMode = 'westminster' | 'drum' | 'electric' | 'custom';

interface SchoolBellButtonProps {
  onShowToast?: (msg: string, type?: 'success' | 'danger' | 'wheel' | 'rank' | 'info') => void;
}

const STORAGE_KEY_BELL_MODE = 'APP_CLASS_BELL_MODE';
const STORAGE_KEY_CUSTOM_AUDIO = 'APP_CLASS_BELL_CUSTOM_AUDIO';
const STORAGE_KEY_CUSTOM_URL = 'APP_CLASS_BELL_CUSTOM_URL';
const DEFAULT_DRIVE_URL = 'https://drive.google.com/file/d/19-msS4V57yzs8t4HAmLUABxBEtPl-uNI/view?usp=drive_link';

export const SchoolBellButton: React.FC<SchoolBellButtonProps> = ({ onShowToast }) => {
  const [isRinging, setIsRinging] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [bellMode, setBellMode] = useState<BellSoundMode>(() => {
    return (localStorage.getItem(STORAGE_KEY_BELL_MODE) as BellSoundMode) || 'westminster';
  });
  const [customAudioData, setCustomAudioData] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_AUDIO) || '';
  });
  const [customUrl, setCustomUrl] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_URL) || DEFAULT_DRIVE_URL;
  });
  const [fileName, setFileName] = useState<string>('');

  const ringTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BELL_MODE, bellMode);
  }, [bellMode]);

  useEffect(() => {
    if (customAudioData) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_AUDIO, customAudioData);
    }
  }, [customAudioData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOM_URL, customUrl);
  }, [customUrl]);

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

    // Nếu chọn âm thanh tùy chỉnh (file đã tải lên hoặc link)
    if (bellMode === 'custom' && customAudioData) {
      const success = await audioService.playCustomAudio(customAudioData, () => {
        setIsRinging(false);
      });
      if (!success) {
        // Fallback sang chuông trường tổng hợp nếu file lỗi
        audioService.play('schoolBell');
        ringTimeoutRef.current = setTimeout(() => {
          setIsRinging(false);
        }, 6500);
      }
    } else if (bellMode === 'drum') {
      audioService.play('schoolDrum');
      ringTimeoutRef.current = setTimeout(() => {
        setIsRinging(false);
      }, 5200);
    } else if (bellMode === 'electric') {
      audioService.play('electricBell');
      ringTimeoutRef.current = setTimeout(() => {
        setIsRinging(false);
      }, 3800);
    } else {
      // Mặc định: Chuông trường Ting-Toong Westminster ngân vang
      audioService.play('schoolBell');
      ringTimeoutRef.current = setTimeout(() => {
        setIsRinging(false);
      }, 6500);
    }
  };

  // Xử lý khi tải file âm thanh từ máy tính
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomAudioData(result);
        setBellMode('custom');
        if (onShowToast) {
          onShowToast(`Đã nạp file âm thanh chuông "${file.name}" thành công! 🎵`, 'success');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative inline-flex items-center">
      {/* NÚT CHÍNH: CHUÔNG VÀO LỚP */}
      <div className="inline-flex rounded-full shadow-lg shadow-amber-500/20 transition-transform active:scale-95">
        <button
          type="button"
          onClick={playBellSound}
          className={`px-3.5 py-2 rounded-l-full font-black text-xs md:text-sm border-y border-l transition-all flex items-center gap-1.5 ${
            isRinging
              ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white border-white shadow-lg animate-pulse'
              : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 border-white/60'
          }`}
          title={isRinging ? 'Bấm để dừng chuông ngay' : 'Rung chuông Vào lớp (Bấm để phát âm thanh chuông)'}
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

        {/* Nút mở menu tùy chọn chuông */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`px-2 py-2 rounded-r-full font-bold text-xs border-y border-r transition-colors flex items-center justify-center ${
            isRinging
              ? 'bg-red-700 text-white border-white'
              : 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-white/60'
          }`}
          title="Tùy chọn kiểu chuông hoặc tải file âm thanh"
        >
          <ChevronDown size={14} className={`transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* POPUP TÙY CHỈNH KIỂU CHUÔNG VÀO LỚP */}
      {isSettingsOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-white/20 z-50 animate-scaleUp">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <BellRing size={16} className="text-amber-400" />
              <h4 className="font-extrabold text-xs md:text-sm text-white uppercase tracking-wider">
                Cài đặt Chuông Vào Lớp
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2 mb-4 text-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Chọn kiểu âm thanh:</div>

            {/* 1. Chuông trường Ting-Toong */}
            <label
              className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                bellMode === 'westminster'
                  ? 'bg-amber-500/20 border-amber-400/60 text-white'
                  : 'bg-slate-800/60 border-white/10 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="bellMode"
                  checked={bellMode === 'westminster'}
                  onChange={() => setBellMode('westminster')}
                  className="accent-amber-400"
                />
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span>🔔 Chuông Ting-Toong</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded">Mặc định</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Giai điệu chuông trường học ngân vang</div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  audioService.play('schoolBell');
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300"
                title="Nghe thử"
              >
                <Play size={13} />
              </button>
            </label>

            {/* 2. Hồi trống trường */}
            <label
              className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                bellMode === 'drum'
                  ? 'bg-amber-500/20 border-amber-400/60 text-white'
                  : 'bg-slate-800/60 border-white/10 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="bellMode"
                  checked={bellMode === 'drum'}
                  onChange={() => setBellMode('drum')}
                  className="accent-amber-400"
                />
                <div>
                  <div className="font-bold">🥁 Hồi trống trường</div>
                  <div className="text-[10px] text-slate-400">Tùng! Tùng! Tùng!... Cắc! Tùng!</div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  audioService.play('schoolDrum');
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300"
                title="Nghe thử"
              >
                <Play size={13} />
              </button>
            </label>

            {/* 3. Chuông điện trường học */}
            <label
              className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                bellMode === 'electric'
                  ? 'bg-amber-500/20 border-amber-400/60 text-white'
                  : 'bg-slate-800/60 border-white/10 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="bellMode"
                  checked={bellMode === 'electric'}
                  onChange={() => setBellMode('electric')}
                  className="accent-amber-400"
                />
                <div>
                  <div className="font-bold">⚡ Chuông điện (Reng Reng)</div>
                  <div className="text-[10px] text-slate-400">Âm thanh chuông điện truyền thống</div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  audioService.play('electricBell');
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300"
                title="Nghe thử"
              >
                <Play size={13} />
              </button>
            </label>

            {/* 4. Âm thanh tùy chỉnh (Tải file từ máy hoặc link Drive) */}
            <label
              className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                bellMode === 'custom'
                  ? 'bg-amber-500/20 border-amber-400/60 text-white'
                  : 'bg-slate-800/60 border-white/10 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="bellMode"
                  checked={bellMode === 'custom'}
                  onChange={() => setBellMode('custom')}
                  className="accent-amber-400"
                />
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <Music size={13} className="text-pink-400" />
                    <span>File âm thanh tùy chỉnh</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {customAudioData ? 'Đã nạp file âm thanh riêng' : 'Tải file MP3 từ máy tính'}
                  </div>
                </div>
              </div>

              {customAudioData && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    audioService.playCustomAudio(customAudioData);
                  }}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-pink-300"
                  title="Nghe thử file tùy chỉnh"
                >
                  <Play size={13} />
                </button>
              )}
            </label>
          </div>

          {/* Phần tải file MP3 từ máy tính (Offline 100%) */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-white/10 text-xs">
            <div className="font-bold text-amber-300 mb-1.5 flex items-center justify-between">
              <span>Tải file âm thanh chuông riêng:</span>
              <span className="text-[10px] text-slate-400 font-normal">MP3, WAV, M4A</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Upload size={14} />
              <span>{fileName ? `Đã chọn: ${fileName}` : 'Chọn file âm thanh từ máy tính...'}</span>
            </button>

            <div className="mt-2 text-[10px] text-slate-400 leading-relaxed">
              💡 Thầy/Cô có thể tải file âm thanh từ link Google Drive về máy rồi bấm nút trên để nạp vào lớp học.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
