import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../../../services/audioService';
import {
  Volume2,
  VolumeX,
  Play,
  Settings,
  Upload,
  Music,
  X,
  ChevronDown,
  Megaphone,
  Gavel,
  BellRing,
} from 'lucide-react';

export type SilenceSoundMode = 'gavel' | 'whistle' | 'chime' | 'custom';

interface SilenceButtonProps {
  onShowToast?: (msg: string, type?: 'success' | 'danger' | 'wheel' | 'rank' | 'info') => void;
}

const STORAGE_KEY_SILENCE_MODE = 'APP_CLASS_SILENCE_MODE';
const STORAGE_KEY_CUSTOM_SILENCE_AUDIO = 'APP_CLASS_SILENCE_CUSTOM_AUDIO';
const STORAGE_KEY_CUSTOM_SILENCE_URL = 'APP_CLASS_SILENCE_CUSTOM_URL';
const DEFAULT_DRIVE_SILENCE_URL = 'https://drive.google.com/file/d/1HvDVFIts5QJmElwggON2Oipssgr-RKq1/view?usp=drive_link';

export const SilenceButton: React.FC<SilenceButtonProps> = ({ onShowToast }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [silenceMode, setSilenceMode] = useState<SilenceSoundMode>(() => {
    return (localStorage.getItem(STORAGE_KEY_SILENCE_MODE) as SilenceSoundMode) || 'gavel';
  });
  const [customAudioData, setCustomAudioData] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_SILENCE_AUDIO) || '';
  });
  const [customUrl, setCustomUrl] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_SILENCE_URL) || DEFAULT_DRIVE_SILENCE_URL;
  });
  const [fileName, setFileName] = useState<string>('');

  const ringTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SILENCE_MODE, silenceMode);
  }, [silenceMode]);

  useEffect(() => {
    if (customAudioData) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_SILENCE_AUDIO, customAudioData);
    }
  }, [customAudioData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOM_SILENCE_URL, customUrl);
  }, [customUrl]);

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
      onShowToast('🤫 YÊU CẦU CẢ LỚP GIỮ TRẬT TỰ! Thầy/Cô đang có hiệu lệnh quan trọng 📢✨', 'danger');
    }

    // Nếu chọn âm thanh tùy chỉnh (file đã nạp từ máy hoặc link Drive)
    if (silenceMode === 'custom' && customAudioData) {
      const success = await audioService.playCustomAudio(customAudioData, () => {
        setIsPlaying(false);
      });
      if (!success) {
        // Fallback sang tiếng gõ búa nếu file lỗi
        audioService.play('silenceGavel');
        ringTimeoutRef.current = setTimeout(() => {
          setIsPlaying(false);
        }, 1500);
      }
    } else if (silenceMode === 'whistle') {
      audioService.play('silenceWhistle');
      ringTimeoutRef.current = setTimeout(() => {
        setIsPlaying(false);
      }, 1600);
    } else if (silenceMode === 'chime') {
      audioService.play('silenceChime');
      ringTimeoutRef.current = setTimeout(() => {
        setIsPlaying(false);
      }, 1500);
    } else {
      // Mặc định: Tiếng gõ búa / thước gỗ hiệu lệnh dứt khoát
      audioService.play('silenceGavel');
      ringTimeoutRef.current = setTimeout(() => {
        setIsPlaying(false);
      }, 1500);
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
        setSilenceMode('custom');
        if (onShowToast) {
          onShowToast(`Đã nạp file âm thanh trật tự "${file.name}" thành công! 🎵`, 'success');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative inline-flex items-center">
      {/* NÚT CHÍNH: TRẬT TỰ */}
      <div className="inline-flex rounded-full shadow-lg shadow-rose-500/20 transition-transform active:scale-95">
        <button
          type="button"
          onClick={playSilenceSound}
          className={`px-3.5 py-2 rounded-l-full font-black text-xs md:text-sm border-y border-l transition-all flex items-center gap-1.5 ${
            isPlaying
              ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white border-white shadow-lg animate-pulse'
              : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white border-white/40'
          }`}
          title={isPlaying ? 'Bấm để dừng âm thanh' : 'Phát hiệu lệnh yêu cầu cả lớp Giữ trật tự'}
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

        {/* Nút mở menu tùy chọn âm thanh */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`px-2 py-2 rounded-r-full font-bold text-xs border-y border-r transition-colors flex items-center justify-center ${
            isPlaying
              ? 'bg-red-800 text-white border-white'
              : 'bg-red-700 hover:bg-red-800 text-white border-white/40'
          }`}
          title="Tùy chọn âm thanh hiệu lệnh trật tự"
        >
          <ChevronDown size={14} className={`transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* POPUP TÙY CHỈNH ÂM THANH HIỆU LỆNH TRẬT TỰ */}
      {isSettingsOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-white/20 z-50 animate-scaleUp">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Megaphone size={16} className="text-rose-400" />
              <h4 className="font-extrabold text-xs md:text-sm text-white uppercase tracking-wider">
                Cài đặt Âm thanh Trật tự
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
            <div className="text-[11px] font-bold text-slate-400 uppercase">Chọn kiểu âm thanh hiệu lệnh:</div>

            {/* 1. Tiếng gõ búa / thước gỗ */}
            <label
              className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                silenceMode === 'gavel'
                  ? 'bg-rose-500/20 border-rose-400/60 text-white'
                  : 'bg-slate-800/60 border-white/10 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="silenceMode"
                  checked={silenceMode === 'gavel'}
                  onChange={() => setSilenceMode('gavel')}
                  className="accent-rose-400"
                />
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span>🔨 Gõ búa / Thước gỗ</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded">Mặc định</span>
                  </div>
                  <div className="text-[10px] text-slate-400">CỐC! CỐC! CỐC! (3 nhịp dứt khoát)</div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  audioService.play('silenceGavel');
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-rose-300"
                title="Nghe thử"
              >
                <Play size={13} />
              </button>
            </label>

            {/* 2. Tiếng còi hiệu lệnh */}
            <label
              className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                silenceMode === 'whistle'
                  ? 'bg-rose-500/20 border-rose-400/60 text-white'
                  : 'bg-slate-800/60 border-white/10 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="silenceMode"
                  checked={silenceMode === 'whistle'}
                  onChange={() => setSilenceMode('whistle')}
                  className="accent-rose-400"
                />
                <div>
                  <div className="font-bold">📢 Tiếng còi hiệu lệnh</div>
                  <div className="text-[10px] text-slate-400">Tuýt! Tuýt! (Vang dội gây chú ý)</div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  audioService.play('silenceWhistle');
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-rose-300"
                title="Nghe thử"
              >
                <Play size={13} />
              </button>
            </label>

            {/* 3. Tiếng chuông đanh cảnh báo */}
            <label
              className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                silenceMode === 'chime'
                  ? 'bg-rose-500/20 border-rose-400/60 text-white'
                  : 'bg-slate-800/60 border-white/10 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="silenceMode"
                  checked={silenceMode === 'chime'}
                  onChange={() => setSilenceMode('chime')}
                  className="accent-rose-400"
                />
                <div>
                  <div className="font-bold">🔔 Chuông gõ nhắc nhở</div>
                  <div className="text-[10px] text-slate-400">Kính! Kính! Kính! (Âm sắc đanh sắc)</div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  audioService.play('silenceChime');
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-rose-300"
                title="Nghe thử"
              >
                <Play size={13} />
              </button>
            </label>

            {/* 4. Âm thanh tùy chỉnh (Tải file từ máy hoặc link Drive) */}
            <label
              className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                silenceMode === 'custom'
                  ? 'bg-rose-500/20 border-rose-400/60 text-white'
                  : 'bg-slate-800/60 border-white/10 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="silenceMode"
                  checked={silenceMode === 'custom'}
                  onChange={() => setSilenceMode('custom')}
                  className="accent-rose-400"
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
            <div className="font-bold text-rose-300 mb-1.5 flex items-center justify-between">
              <span>Tải file âm thanh trật tự riêng:</span>
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
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
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
