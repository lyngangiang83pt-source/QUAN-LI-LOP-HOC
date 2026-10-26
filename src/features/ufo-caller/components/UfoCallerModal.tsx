import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Student } from '../../../types';
import {
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Users,
  CheckCircle2,
  Palette,
  Sparkles,
} from 'lucide-react';

export interface UfoCallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  className: string;
  onApplyBonusScore?: (studentId: string, pts: number, reason: string) => void;
}

const PRESET_BACKGROUNDS = [
  { id: 'sky', label: 'Bầu trời xanh', color: '#87CEEB', url: '' },
  { id: 'galaxy', label: 'Vũ trụ Galaxy', color: '#090a1a', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80' },
  { id: 'cyber', label: 'Không gian Cyber', color: '#0f172a', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80' },
];

export const UfoCallerModal: React.FC<UfoCallerModalProps> = ({
  isOpen,
  onClose,
  students = [],
  className,
}) => {
  // Lấy trực tiếp danh sách học sinh theo sĩ số lớp dạy (ưu tiên học sinh có mặt/đi muộn nếu có điểm danh)
  const classStudentNames = useMemo(() => {
    const present = students.filter((s) => s.attendance !== 'absent');
    const targetPool = present.length > 0 ? present : students;
    return targetPool.map((s) => s.name.trim()).filter((n) => n.length > 0);
  }, [students]);

  const [allStudents, setAllStudents] = useState<string[]>([]);
  const [calledNames, setCalledNames] = useState<string[]>([]);
  const calledNamesRef = useRef<Set<string>>(new Set());

  const [allowRepeat, setAllowRepeat] = useState<boolean>(false);
  const [showBgMenu, setShowBgMenu] = useState<boolean>(false);

  // Background & Sound state
  const [bgImage, setBgImage] = useState<string>('');
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // 2D In-Game calling states
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [ufoState, setUfoState] = useState<'idle' | 'swooping' | 'landed'>('idle');
  const [calledStudentName, setCalledStudentName] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const lastCallTimeRef = useRef<number>(0);

  // Đồng bộ danh sách học sinh theo sĩ số lớp khi mở modal
  useEffect(() => {
    if (!isOpen) return;
    setAllStudents(classStudentNames);
  }, [isOpen, classStudentNames]);

  // Danh sách học sinh chưa gọi (Chống trùng lặp tuyệt đối)
  const availableStudents = useMemo(() => {
    if (allowRepeat) return allStudents;
    return allStudents.filter((name) => !calledNames.includes(name));
  }, [allStudents, calledNames, allowRepeat]);

  // Show Toast notification
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Web Audio Synthesizer (call, drop, tada, fly)
  const playSound = useCallback((type: 'call' | 'drop' | 'tada' | 'fly') => {
    if (soundMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'call') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(450, now);
        oscillator.frequency.exponentialRampToValueAtTime(950, now + 0.35);
        gainNode.gain.setValueAtTime(0.35, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        oscillator.start();
        oscillator.stop(now + 0.35);
      } else if (type === 'drop') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(900, now);
        oscillator.frequency.linearRampToValueAtTime(350, now + 0.2);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start();
        oscillator.stop(now + 0.2);
      } else if (type === 'tada') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(523.25, now);
        oscillator.frequency.setValueAtTime(659.25, now + 0.08);
        oscillator.frequency.setValueAtTime(783.99, now + 0.16);
        oscillator.frequency.setValueAtTime(1046.50, now + 0.24);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        oscillator.start();
        oscillator.stop(now + 0.8);
      } else if (type === 'fly') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.linearRampToValueAtTime(1600, now + 0.4);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        oscillator.start();
        oscillator.stop(now + 0.4);
      }
    } catch {
      // AudioContext fallback
    }
  }, [soundMuted]);

  // Handle custom background image upload
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBgImage(url);
    showToast('Đã cập nhật phông nền mới!', 'success');
  };

  // Main Call Student Logic (SIÊU NHẸ 2D & CHỐNG TRÙNG LẶP TUYỆT ĐỐI)
  const handleCallStudent = useCallback(() => {
    const now = Date.now();
    if (now - lastCallTimeRef.current < 260) return; // Chống spam phím
    lastCallTimeRef.current = now;

    // Strict non-repeat check from synchronous Ref
    const candidatePool = allowRepeat
      ? allStudents
      : allStudents.filter((name) => !calledNamesRef.current.has(name));

    if (candidatePool.length === 0) {
      showToast('Đã gọi hết tất cả học sinh! Nhấn "Khôi phục DS" để chơi lượt mới.', 'error');
      return;
    }

    setIsCalling(true);
    // Ẩn ngay tên cũ để học sinh hồi hộp chờ đĩa bay đáp xuống (chuẩn vòng quay may mắn)
    setCalledStudentName('');
    setUfoState('swooping');
    playSound('call');

    // 1. Pick next student randomly from uncalled candidates
    const rIndex = Math.floor(Math.random() * candidatePool.length);
    const selectedName = candidatePool[rIndex];

    // Immediately record to called set to eliminate ANY chance of repeat
    if (!allowRepeat) {
      calledNamesRef.current.add(selectedName);
      setCalledNames(Array.from(calledNamesRef.current));
    }

    // 2D animation timing: 420ms lượn xuống, phát tia sáng và BÙM xuất hiện tên học sinh!
    setTimeout(() => {
      setUfoState('landed');
      playSound('drop');

      setTimeout(() => {
        setCalledStudentName(selectedName);
        playSound('tada');
        confetti({
          particleCount: 150,
          spread: 95,
          origin: { y: 0.65 },
          colors: ['#ff1744', '#ffea00', '#00e676', '#2979ff', '#d500f9', '#00e5ff'],
          zIndex: 9999,
        });
        setIsCalling(false);
      }, 150);
    }, 420);
  }, [allStudents, allowRepeat, playSound, showToast]);

  // Keyboard shortcuts (Space & Enter) and Mouse shortcuts (Right-click & Middle-click)
  // to call "Gọi tiếp" continuously (STRICTLY DEDICATED TO CALLING STUDENTS ONLY)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isCallKey =
        e.code === 'Space' ||
        e.key === ' ' ||
        e.code === 'Enter' ||
        e.key === 'Enter' ||
        e.code === 'NumpadEnter';

      if (isCallKey) {
        // Prevent default scrolling, form submit or button clicking
        e.preventDefault();
        e.stopPropagation();

        // STRICT: Dedicated to calling students only.
        if (document.activeElement && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }

        handleCallStudent();
      } else if (e.code === 'Escape') {
        onClose();
      }
    };

    // Right-click: trigger "Gọi tiếp" and block browser context menu
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('#bg-menu-container')) return;

      e.preventDefault();
      e.stopPropagation();
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      handleCallStudent();
    };

    // Middle-click (scroll wheel click, e.button === 1): trigger "Gọi tiếp" and block autoscroll
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
        if (document.activeElement && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        handleCallStudent();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('mousedown', handleMouseDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, [isOpen, handleCallStudent, onClose]);

  // Reset list and clear called history
  const handleResetList = () => {
    calledNamesRef.current.clear();
    setCalledNames([]);
    setCalledStudentName('');
    setUfoState('idle');
    showToast('Đã khôi phục toàn bộ danh sách học sinh!', 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none font-sans bg-slate-950">
      {/* 2D Keyframe Styles for Butter-Smooth 60fps Animations */}
      <style>{`
        @keyframes ufoHover {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(2deg); }
        }
        @keyframes ufoMiniHover {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-10px) translateX(10px); }
        }
        @keyframes beamGlow {
          0%, 100% { opacity: 0.85; transform: scaleX(1); }
          50% { opacity: 1; transform: scaleX(1.05); }
        }
      `}</style>

      {/* 2D Background Canvas / Layer (Siêu nhẹ, 0% CPU khi tĩnh) */}
      <div
        className="absolute inset-0 z-0 bg-[#87CEEB] transition-all duration-700 overflow-hidden"
        style={{
          backgroundImage: bgImage
            ? `url('${bgImage}')`
            : 'radial-gradient(ellipse at top, #1e3a8a 0%, #090a1a 100%)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Sao lấp lánh và mây 2D chuyển động nhẹ nhàng */}
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div className="absolute top-[10%] left-[15%] w-1.5 h-1.5 bg-yellow-200 rounded-full animate-ping duration-1000" />
          <div className="absolute top-[25%] right-[20%] w-2 h-2 bg-cyan-200 rounded-full animate-pulse duration-700" />
          <div className="absolute top-[18%] left-[65%] w-1.5 h-1.5 bg-pink-200 rounded-full animate-ping duration-1000 delay-300" />
          <div className="absolute top-[40%] left-[8%] w-2 h-2 bg-white rounded-full animate-pulse duration-1000 delay-500" />
          <div className="absolute top-[35%] right-[10%] w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping duration-700 delay-200" />
          <div className="absolute bottom-[20%] left-[25%] w-2 h-2 bg-emerald-200 rounded-full animate-pulse duration-1000" />
          <div className="absolute bottom-[25%] right-[30%] w-1.5 h-1.5 bg-amber-200 rounded-full animate-ping duration-1000 delay-400" />
        </div>

        {/* Các đĩa bay mini 2D lượn lờ ở hậu cảnh tạo không gian sinh động */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <div className="absolute top-16 left-[10%] scale-50" style={{ animation: 'ufoMiniHover 5.5s ease-in-out infinite' }}>
            <MiniUfo2D color="#ec4899" />
          </div>
          <div className="absolute top-24 right-[12%] scale-60" style={{ animation: 'ufoMiniHover 6.5s ease-in-out infinite 1s' }}>
            <MiniUfo2D color="#3b82f6" />
          </div>
          <div className="absolute top-44 left-[28%] scale-40" style={{ animation: 'ufoMiniHover 7s ease-in-out infinite 2s' }}>
            <MiniUfo2D color="#10b981" />
          </div>
          <div className="absolute top-36 right-[26%] scale-45" style={{ animation: 'ufoMiniHover 6s ease-in-out infinite 1.5s' }}>
            <MiniUfo2D color="#f59e0b" />
          </div>
        </div>
      </div>

      {/* Top Header Controls */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        {/* Nút đổi phông nền nhanh (nhỏ gọn) */}
        <div id="bg-menu-container" className="relative">
          <button
            type="button"
            onClick={() => setShowBgMenu(!showBgMenu)}
            className="p-2.5 rounded-full bg-white/85 hover:bg-white text-slate-800 shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 px-3.5"
            title="Đổi phông nền không gian"
          >
            <Palette size={18} className="text-emerald-600" />
            <span className="text-xs font-black hidden md:inline">Phông nền</span>
          </button>

          {showBgMenu && (
            <div className="absolute right-0 top-12 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-scaleUp">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-xs font-extrabold text-slate-800">Chọn phông nền</span>
                <button
                  type="button"
                  onClick={() => setShowBgMenu(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex flex-col gap-1.5 mb-2.5">
                {PRESET_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => {
                      setBgImage(bg.url);
                      setShowBgMenu(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold text-left transition-all border ${
                      bgImage === bg.url
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Hoặc tải ảnh từ máy tính:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleBgUpload(e);
                  setShowBgMenu(false);
                }}
                className="block w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer bg-slate-50 rounded-full p-1 border border-slate-200"
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSoundMuted(!soundMuted)}
          className="p-2.5 rounded-full bg-white/85 hover:bg-white text-slate-800 shadow-lg backdrop-blur-md transition-all active:scale-95"
          title={soundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {soundMuted ? <VolumeX size={19} /> : <Volume2 size={19} />}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/85 hover:bg-rose-500 hover:text-white text-slate-800 shadow-lg backdrop-blur-md transition-all active:scale-95"
          title="Đóng trò chơi UFO (Esc)"
        >
          <X size={19} />
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[70] animate-bounce pointer-events-none">
          <div
            className={`px-5 py-2.5 rounded-2xl shadow-2xl font-black text-sm flex items-center gap-2 text-white ${
              toastMessage.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
            }`}
          >
            <span>{toastMessage.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* MAIN 2D IN-GAME UI LAYER */}
      <div className="absolute inset-0 z-20 pointer-events-none p-4 md:p-6 flex flex-col justify-between">
        {/* Top In-Game Bar: Class Info & Call Stats */}
        <div className="flex items-start justify-between">
          <div className="pointer-events-auto bg-white/95 p-4 rounded-2xl shadow-2xl backdrop-blur-md border-2 border-blue-200 w-auto min-w-[210px]">
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-200">
              <Users size={16} className="text-blue-600 shrink-0" />
              <div>
                <span className="text-xs font-black text-slate-900 block truncate max-w-[170px]">
                  {className || 'Lớp học'}
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  Sĩ số lớp: <strong className="text-blue-600">{allStudents.length}</strong> em
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-bold text-slate-600">Còn lại:</span>
              <span className="text-2xl font-black text-blue-600">{availableStudents.length}</span>
              <span className="text-xs text-slate-400">/ {allStudents.length}</span>
            </div>

            <div className="text-[11px] font-extrabold text-emerald-600 mb-2.5 flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>Đã gọi: {calledNames.length} em (Không trùng)</span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleResetList}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold px-3 py-1.5 rounded-xl transition-all active:scale-95 text-xs flex items-center justify-center gap-1.5 shadow-xs"
                title="Khôi phục để tất cả học sinh đều được gọi lại"
              >
                <RotateCcw size={13} />
                <span>Khôi phục DS ({calledNames.length} đã gọi)</span>
              </button>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
                <input
                  type="checkbox"
                  checked={allowRepeat}
                  onChange={(e) => setAllowRepeat(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                />
                <span className="text-[11px] text-slate-700 font-extrabold">
                  Cho phép gọi lặp lại
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* 2D UFO STAGE (MÔ HÌNH ĐĨA BAY 2D SIÊU MƯỢT & TIA SÁNG CHÓP NÓN) */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-8 relative pointer-events-none">
          {/* ĐĨA BAY 2D CHÍNH */}
          <div
            className={`transition-all duration-400 ease-out transform ${
              ufoState === 'swooping'
                ? 'scale-110 -translate-y-6 rotate-2'
                : 'scale-100 translate-y-0'
            }`}
            style={{
              animation: ufoState === 'swooping' ? undefined : 'ufoHover 3.6s ease-in-out infinite',
            }}
          >
            <MainUfo2D isCalling={isCalling || ufoState === 'swooping'} />
          </div>

          {/* CHÙM TIA SÁNG CHIẾU TỪ UFO XUỐNG KHI ĐÁP HOẶC CÓ TÊN (TRACTOR BEAM) */}
          <div
            className={`transition-all duration-500 origin-top overflow-hidden flex flex-col items-center -mt-2 ${
              calledStudentName || ufoState === 'landed' || ufoState === 'swooping'
                ? 'opacity-100 max-h-[320px] scale-y-100'
                : 'opacity-0 max-h-0 scale-y-0'
            }`}
            style={{
              animation:
                calledStudentName || ufoState === 'landed'
                  ? 'beamGlow 2s ease-in-out infinite'
                  : undefined,
            }}
          >
            {/* Tia sáng hình nón 2D phát quang rực rỡ */}
            <svg
              className="w-[280px] md:w-[460px] h-[90px] md:h-[130px]"
              viewBox="0 0 400 120"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="beamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
                  <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <polygon points="170,0 230,0 395,120 5,120" fill="url(#beamGrad)" />
            </svg>
          </div>

          {/* KHUNG TÊN HỌC SINH 2D: CHỈ HIỆN DUY NHẤT TÊN KHI ĐÁP XUỐNG (CHUẨN VÒNG QUAY MAY MẮN) */}
          {calledStudentName && (
            <div className="pointer-events-auto flex flex-col items-center animate-[scaleUp_0.35s_cubic-bezier(0.175,0.885,0.32,1.275)] -mt-6 z-30">
              <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 p-1.5 md:p-2 rounded-3xl shadow-[0_12px_50px_rgba(244,63,94,0.85)] border-4 border-yellow-300">
                <div className="bg-slate-950/90 backdrop-blur-md px-10 md:px-24 py-4 md:py-6 rounded-[20px] flex items-center justify-center text-center">
                  <span className="text-3xl md:text-6xl font-black text-white tracking-wide drop-shadow-[0_4px_24px_rgba(255,255,255,0.95)]">
                    {calledStudentName}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Big Calling Button */}
        <div className="pointer-events-auto self-center mb-6">
          <button
            type="button"
            onClick={handleCallStudent}
            className="bg-gradient-to-b from-emerald-400 to-emerald-600 text-white text-3xl md:text-5xl font-black py-4 md:py-5 px-12 md:px-20 rounded-full shadow-[0_12px_30px_rgba(16,185,129,0.55)] border-4 border-white transition-all select-none hover:scale-105 hover:shadow-[0_18px_40px_rgba(16,185,129,0.7)] active:scale-95 animate-pulse"
          >
            {calledStudentName || calledNames.length > 0 ? '🛸 GỌI TIẾP' : '🛸 GỌI TÊN'}
          </button>
          <p className="text-center text-white/95 text-[11px] font-bold mt-2.5 drop-shadow-md flex items-center justify-center gap-1.5 flex-wrap">
            <span>(Gọi tiếp:</span>
            <kbd className="px-1.5 py-0.5 bg-black/50 rounded border border-white/60 text-[10px]">Space</kbd>
            <span>/</span>
            <kbd className="px-1.5 py-0.5 bg-black/50 rounded border border-white/60 text-[10px]">Enter</kbd>
            <span>/</span>
            <span className="font-extrabold text-amber-300">Chuột phải</span>
            <span>/</span>
            <span className="font-extrabold text-cyan-300">Chuột giữa</span>
            <span>)</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// COMPONENT ĐĨA BAY 2D CHÍNH (VECTOR SVG SIÊU SẮC NÉT & CỰC NHẸ)
// -------------------------------------------------------------
const MainUfo2D: React.FC<{ isCalling: boolean }> = ({ isCalling }) => {
  return (
    <div className="relative w-56 md:w-80 h-32 md:h-44 drop-shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
      <svg viewBox="0 0 320 180" className="w-full h-full overflow-visible">
        <defs>
          {/* Ánh kim đĩa bay */}
          <linearGradient id="hullGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="35%" stopColor="#94a3b8" />
            <stop offset="70%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Vành đĩa bay màu neon */}
          <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="30%" stopColor="#8b5cf6" />
            <stop offset="70%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          {/* Buồng lái vòm kính */}
          <linearGradient id="cockpitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
          </linearGradient>

          {/* Đèn gầm UFO */}
          <radialGradient id="thrusterGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </radialGradient>
        </defs>

        {/* 1. Đèn đẩy động cơ dưới đáy */}
        <ellipse
          cx="160"
          cy="148"
          rx="50"
          ry="12"
          fill="url(#thrusterGrad)"
          className={isCalling ? 'animate-ping duration-300' : 'animate-pulse'}
        />

        {/* 2. Thân đĩa bay đáy */}
        <ellipse cx="160" cy="130" rx="145" ry="32" fill="#1e293b" />

        {/* 3. Vành đĩa bay chính (Metallic Saucer Body) */}
        <ellipse cx="160" cy="120" rx="150" ry="35" fill="url(#hullGrad)" stroke="#f8fafc" strokeWidth="2.5" />

        {/* 4. Dải đèn viền màu rực rỡ */}
        <ellipse cx="160" cy="124" rx="138" ry="18" fill="none" stroke="url(#rimGrad)" strokeWidth="6" />

        {/* Các bóng đèn LED phát sáng nhấp nháy trên vành đĩa bay */}
        {[35, 75, 120, 160, 200, 245, 285].map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy={123 + Math.sin((i / 6) * Math.PI) * 4}
            r="5"
            fill={i % 2 === 0 ? '#fde047' : '#38bdf8'}
            className="animate-pulse"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}

        {/* 5. Buồng lái vòm kính trong suốt */}
        <path
          d="M 90,105 C 90,30 230,30 230,105 Z"
          fill="url(#cockpitGrad)"
          stroke="#ffffff"
          strokeWidth="3"
        />

        {/* Ánh phản chiếu trên vòm kính */}
        <path
          d="M 115,85 C 115,50 150,45 165,45"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* 6. Chú Người Ngoài Hành Tinh (Cute Alien) bên trong buồng lái */}
        <g transform="translate(130, 48)">
          {/* Đầu Alien màu xanh lá */}
          <ellipse cx="30" cy="35" rx="20" ry="18" fill="#84cc16" stroke="#4d7c0f" strokeWidth="1.5" />

          {/* Ăng-ten */}
          <line x1="30" y1="18" x2="30" y2="6" stroke="#84cc16" strokeWidth="3" strokeLinecap="round" />
          <circle cx="30" cy="4" r="4.5" fill="#facc15" className="animate-ping" />

          {/* Mắt to màu đen có đốm sáng */}
          <ellipse cx="22" cy="34" rx="6" ry="8" fill="#0f172a" />
          <circle cx="20" cy="32" r="2" fill="#ffffff" />

          <ellipse cx="38" cy="34" rx="6" ry="8" fill="#0f172a" />
          <circle cx="36" cy="32" r="2" fill="#ffffff" />

          {/* Nụ cười thân thiện */}
          <path d="M 25,44 Q 30,48 35,44" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

// -------------------------------------------------------------
// COMPONENT ĐĨA BAY MINI HẬU CẢNH 2D (TẠO KHÔNG GIAN BẦU TRỜI)
// -------------------------------------------------------------
const MiniUfo2D: React.FC<{ color: string }> = ({ color }) => {
  return (
    <svg width="100" height="50" viewBox="0 0 100 50">
      <ellipse cx="50" cy="30" rx="45" ry="12" fill={color} opacity="0.8" />
      <ellipse cx="50" cy="27" rx="48" ry="10" fill="#cbd5e1" />
      <path d="M 32,25 C 32,5 68,5 68,25 Z" fill="#7dd3fc" opacity="0.8" />
      <circle cx="50" cy="18" r="4" fill="#a3e635" />
    </svg>
  );
};
