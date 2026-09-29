import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Student } from '../../../types';
import { GameshowWheelCanvas } from './GameshowWheelCanvas';
import { audioService } from '../../../services/audioService';
import {
  X,
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  Users,
  CheckCircle2,
  Flame,
} from 'lucide-react';

interface GameshowLuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  className: string;
  onApplyBonusScore?: (studentId: string, pts: number, reason: string) => void;
}

export const GameshowLuckyWheelModal: React.FC<GameshowLuckyWheelModalProps> = ({
  isOpen,
  onClose,
  students = [],
  className,
}) => {
  // --- TÙY CHỌN DANH SÁCH HỌC SINH (CHỐNG TRÙNG LẶP) ---
  const [filterMode, setFilterMode] = useState<'all' | 'present_only'>('present_only');
  const [spunStudentIds, setSpunStudentIds] = useState<string[]>([]);
  const [soundMuted, setSoundMuted] = useState<boolean>(audioService.isMuted());

  // --- TRẠNG THÁI VẬT LÝ VÒNG QUAY ---
  const [rotation, setRotation] = useState<number>(0);
  const [needleAngle, setNeedleAngle] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // --- KẾT QUẢ QUAY & POPUP CHIẾN THẮNG ---
  const [winner, setWinner] = useState<Student | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Refs điều khiển vòng lặp vật lý
  const animFrameRef = useRef<number | null>(null);
  const rotationRef = useRef<number>(0);
  const lastSliceIdxRef = useRef<number>(-1);

  // Cập nhật rotationRef theo rotation state
  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  // Lọc danh sách học sinh tham gia vòng quay (Đã loại trừ học sinh trúng thưởng trước đó)
  const poolStudents = useMemo(() => {
    if (filterMode === 'present_only') {
      return students.filter((s) => s.attendance !== 'absent');
    }
    return students;
  }, [students, filterMode]);

  const activeCandidates = useMemo(() => {
    return poolStudents.filter((s) => !spunStudentIds.includes(s.id));
  }, [poolStudents, spunStudentIds]);

  const spunStudentsList = useMemo(() => {
    return spunStudentIds
      .map((id) => students.find((s) => s.id === id))
      .filter((s): s is Student => s !== undefined);
  }, [spunStudentIds, students]);

  // Bật / Tắt âm thanh
  const handleToggleMute = () => {
    const newMuted = audioService.toggleMute();
    setSoundMuted(newMuted);
  };

  // Chơi lại (Reset toàn bộ lượt đã quay)
  const handleResetSpun = () => {
    if (spunStudentIds.length === 0) return;
    if (confirm('Thầy/Cô có muốn làm mới lại danh sách vòng quay để tất cả học sinh đều được tham gia từ đầu không?')) {
      setSpunStudentIds([]);
      setWinner(null);
      setShowCelebration(false);
    }
  };

  // BẮT ĐẦU QUAY VÒNG MAY MẮN
  const handleStartSpin = useCallback(() => {
    if (isSpinning || activeCandidates.length === 0) return;

    // Reset trạng thái popup trước đó
    setShowCelebration(false);
    setIsSpinning(true);

    // Kích hoạt ngay tiếng tick đầu tiên để đánh thức AudioContext
    audioService.play('wheelTick', 120);

    const numSlices = activeCandidates.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    // Chọn ngẫu nhiên học sinh chiến thắng
    const targetIdx = Math.floor(Math.random() * numSlices);
    const chosenStudent = activeCandidates[targetIdx];

    // Tính toán góc đích đến chính xác tại vị trí kim chỉ 12h (-PI/2)
    // Tâm của nan quạt targetIdx là: (targetIdx + 0.5) * sliceAngle
    // Ta cần: (targetIdx + 0.5) * sliceAngle + finalRotation = 3*PI/2 (mod 2PI)
    // => finalRotation = 3*PI/2 - (targetIdx + 0.5) * sliceAngle (mod 2PI)
    const targetLocalAngle = (targetIdx + 0.5) * sliceAngle;
    const targetModulo = ((1.5 * Math.PI - targetLocalAngle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

    const startRot = rotationRef.current;
    const currentModulo = ((startRot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    let diff = (targetModulo - currentModulo + 2 * Math.PI) % (2 * Math.PI);
    if (diff < Math.PI / 3) {
      diff += 2 * Math.PI;
    }

    // Quay từ 7 đến 10 vòng tròn ngẫu nhiên tạo sự hồi hộp cho lớp học
    const fullSpins = 7 + Math.floor(Math.random() * 4); // 7, 8, 9 hoặc 10 vòng
    const totalDelta = fullSpins * 2 * Math.PI + diff;
    const finalRot = startRot + totalDelta;

    const duration = 6200; // 6.2 giây chuẩn Gameshow
    const startTime = performance.now();

    // Theo dõi số lượng nan quạt (chốt) đã quét qua kim chỉ 12h theo tích lũy
    let lastPinCount = 0;
    let currentNeedle = 0;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Easing mượt mà: Quartic Ease-Out 1 - (1 - t)^4
      const ease = 1 - Math.pow(1 - progress, 4);
      const currentRot = startRot + totalDelta * ease;
      const deltaAngle = currentRot - startRot;

      // Đếm số lượng chốt nan quạt đã vượt qua kim chỉ 12h
      const currentPinCount = Math.floor(deltaAngle / sliceAngle);

      if (currentPinCount > lastPinCount) {
        lastPinCount = currentPinCount;
        // Biến thiên cao độ theo tốc độ quay (nhanh thì thanh cao, chậm thì trầm ấm cơ học)
        const speedFactor = 1 - progress;
        const pitchVar = speedFactor * 150 - 30;
        audioService.play('wheelTick', pitchVar);
        // Kim chỉ bị gạt rung nảy
        currentNeedle = -0.36;
      }

      // Kim chỉ đàn hồi dần về vị trí cân bằng
      currentNeedle *= 0.8;

      setRotation(currentRot);
      setNeedleAngle(currentNeedle);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        // DỪNG CHÍNH XÁC TẠI Ô HỌC SINH CHIẾN THẮNG
        setRotation(finalRot);
        setNeedleAngle(0);
        setIsSpinning(false);

        setWinner(chosenStudent);

        // Lưu học sinh đã quay vào danh sách chống trùng
        setSpunStudentIds((prev) => [...prev, chosenStudent.id]);

        // Kích hoạt âm thanh chiến thắng & mở popup chúc mừng
        audioService.play('fanfare');
        setTimeout(() => {
          audioService.play('win');
        }, 300);

        setShowCelebration(true);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  }, [activeCandidates, isSpinning]);

  // Hủy animation frame khi unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Bắt phím Space để quay nhanh cho Thầy/Cô
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isSpinning || showCelebration) return;
      if (e.code === 'Space' && activeCandidates.length > 0) {
        e.preventDefault();
        handleStartSpin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSpinning, showCelebration, activeCandidates, handleStartSpin]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      {/* Vỏ Modal Gameshow sang trọng */}
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* ========================================== */}
        {/* HEADER GAMESHOW TOP BAR                    */}
        {/* ========================================== */}
        <div className="px-5 py-4 border-b border-white/15 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Sparkles className="w-6 h-6 text-slate-950 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black tracking-wide bg-gradient-to-r from-amber-300 via-yellow-200 to-white bg-clip-text text-transparent uppercase flex items-center gap-2">
                <span>VÒNG QUAY MAY MẮN</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  LỚP {className}
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Lấy trực tiếp danh sách học sinh • Chống trùng lặp lượt quay
              </p>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-2.5 rounded-xl border transition-all ${
                soundMuted
                  ? 'bg-rose-500/20 text-rose-300 border-rose-400/40 hover:bg-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
              }`}
              title={soundMuted ? 'Đang tắt âm thanh (Bấm để bật)' : 'Đang bật âm thanh (Bấm để tắt)'}
            >
              {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSpinning}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white/80 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Đóng bảng quay"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ========================================== */}
        {/* BODY: VÒNG QUAY & BẢNG ĐIỀU KHIỂN          */}
        {/* ========================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center">
          <div className="w-full flex flex-col items-center">
            
            {/* Thanh lọc chế độ tham gia */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              <div className="bg-slate-800/80 p-1 rounded-2xl border border-white/15 flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterMode('present_only')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                    filterMode === 'present_only'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Users size={14} />
                  <span>Chỉ có mặt & đi muộn ({students.filter((s) => s.attendance !== 'absent').length} em)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                    filterMode === 'all'
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>Toàn bộ danh sách ({students.length} em)</span>
                </button>
              </div>

              {/* Nút Chơi lại (Reset) */}
              <button
                type="button"
                onClick={handleResetSpun}
                disabled={spunStudentIds.length === 0 || isSpinning}
                className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Khôi phục lại danh sách ban đầu để tất cả các em đều được quay lại"
              >
                <RotateCcw size={14} />
                <span>Chơi lại ({spunStudentIds.length} đã quay)</span>
              </button>
            </div>

            {/* Thông số lượt quay */}
            <div className="text-center mb-1 flex items-center gap-3 text-xs text-slate-300">
              <span className="font-semibold">
                🎯 Còn lại trên vòng quay:{' '}
                <strong className="text-amber-300 font-extrabold text-sm">
                  {activeCandidates.length}
                </strong>{' '}
                học sinh
              </span>
              <span>•</span>
              <span className="text-slate-400">
                Phím tắt: Nhấn <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-[10px] text-white">Space</kbd> để Quay
              </span>
            </div>

            {/* BÁNH XE GAMESHOW HTML5 CANVAS */}
            <div className="relative">
              <GameshowWheelCanvas
                candidates={activeCandidates}
                rotation={rotation}
                needleAngle={needleAngle}
                isSpinning={isSpinning}
                onCenterClick={handleStartSpin}
              />
            </div>

            {/* NÚT BẤM QUAY LỚN NỔI BẬT DƯỚI BÁNH XE */}
            <div className="mt-4 flex flex-col items-center gap-2">
              {activeCandidates.length > 0 ? (
                <button
                  type="button"
                  onClick={handleStartSpin}
                  disabled={isSpinning}
                  className={`group relative px-8 py-3.5 rounded-full font-black text-sm md:text-base tracking-wider uppercase transition-all duration-300 flex items-center gap-2 shadow-2xl ${
                    isSpinning
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
                      : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 text-slate-950 hover:from-amber-300 hover:to-orange-400 hover:scale-105 active:scale-95 shadow-amber-500/40 border-2 border-white'
                  }`}
                >
                  {isSpinning ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-spin text-amber-300" />
                      <span>Đang quay hồi hộp... ✨</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-5 h-5 text-amber-950 animate-bounce" />
                      <span>QUAY NGAY BÂY GIỜ</span>
                      <Sparkles className="w-5 h-5 text-amber-950" />
                    </>
                  )}
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-center animate-scaleUp">
                  <p className="text-amber-200 font-bold text-sm mb-2">
                    🎉 Tất cả học sinh trong danh sách đã được quay trúng!
                  </p>
                  <button
                    type="button"
                    onClick={handleResetSpun}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 mx-auto"
                  >
                    <RotateCcw size={16} />
                    <span>Bấm vào đây để Chơi lại vòng mới</span>
                  </button>
                </div>
              )}
            </div>

            {/* LỊCH SỬ CÁC HỌC SINH ĐÃ ĐƯỢC CHỌN (CHỐNG TRÙNG) */}
            {spunStudentsList.length > 0 && (
              <div className="w-full mt-5 pt-4 border-t border-white/10">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Học sinh đã được gọi hôm nay ({spunStudentsList.length} em):</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {spunStudentsList.map((stu, index) => (
                    <span
                      key={stu.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-white/10 text-xs font-semibold text-slate-200 shadow-sm"
                    >
                      <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span>{stu.name}</span>
                      <span className="text-[10px] text-amber-400">({stu.points}đ)</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* POPUP CHIẾN THẮNG & CHÚC MỪNG             */}
        {/* ========================================== */}
        {showCelebration && winner && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-fadeIn">
            {/* Pháo hoa & hiệu ứng chúc mừng rơi */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-yellow-400 animate-ping" />
              <div className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-pink-400 animate-ping delay-150" />
              <div className="absolute top-1/2 left-1/3 w-3 h-3 rounded-full bg-cyan-400 animate-ping delay-300" />
              <div className="absolute top-2/3 right-1/3 w-4 h-4 rounded-full bg-emerald-400 animate-ping delay-200" />
            </div>

            <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-7 text-center shadow-2xl shadow-amber-500/20 animate-scaleUp overflow-hidden">
              
              {/* Nút đóng nhanh popup */}
              <button
                type="button"
                onClick={() => setShowCelebration(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                title="Đóng"
              >
                <X size={18} />
              </button>

              {/* Vương miện & Banner Vinh danh */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 font-black text-xs tracking-wider uppercase mb-4 animate-pulse">
                <Sparkles size={16} />
                <span>👉 Chúc mừng bạn đã được chọn 👈</span>
                <Sparkles size={16} />
              </div>

              {/* Avatar & Tên Học Sinh Chiến Thắng */}
              <div className="my-3">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 p-1 shadow-xl shadow-amber-500/40 mb-3 flex items-center justify-center">
                  <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-3xl">
                    👑
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-300 bg-clip-text text-transparent drop-shadow-md">
                  {winner.name}
                </h3>
                <div className="text-xs font-bold text-slate-300 mt-1">
                  Mã số: <span className="text-amber-300 font-mono">{winner.id}</span> • Điểm hiện tại:{' '}
                  <span className="text-emerald-400 font-bold">{winner.points} điểm</span>
                </div>
              </div>

              {/* Nút Quay Tiếp hoặc Đóng */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-6 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowCelebration(false);
                    // Sẵn sàng quay tiếp cho bạn khác ngay lập tức
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} className="text-slate-950" />
                  <span>Quay tiếp cho bạn khác 🎡</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCelebration(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
