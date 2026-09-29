import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Student } from '../../../types';
import { GameshowWheelCanvas } from './GameshowWheelCanvas';
import { audioService } from '../../../services/audioService';
import { DEFAULT_GAMESHOW_QUESTIONS, SecretQuestionItem } from '../../../constants/classroomData';
import {
  X,
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  Crown,
  Award,
  Plus,
  HelpCircle,
  Edit3,
  Trash2,
  Users,
  CheckCircle2,
  Gift,
  Zap,
  Play,
  Flame,
  Star,
  Check,
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
  onApplyBonusScore,
}) => {
  // --- TÙY CHỌN DANH SÁCH HỌC SINH (CHỐNG TRÙNG LẶP) ---
  const [filterMode, setFilterMode] = useState<'all' | 'present_only'>('present_only');
  const [spunStudentIds, setSpunStudentIds] = useState<string[]>([]);
  const [soundMuted, setSoundMuted] = useState<boolean>(audioService.isMuted());

  // --- NGÂN HÀNG CÂU HỎI BÍ MẬT ---
  const [secretQuestions, setSecretQuestions] = useState<SecretQuestionItem[]>(() => {
    const saved = localStorage.getItem('GAMESHOW_SECRET_QUESTIONS');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_GAMESHOW_QUESTIONS;
      }
    }
    return DEFAULT_GAMESHOW_QUESTIONS;
  });
  const [showQuestionBank, setShowQuestionBank] = useState<boolean>(false);
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [newQuestionCat, setNewQuestionCat] = useState<'knowledge' | 'fun' | 'challenge' | 'gift'>('knowledge');
  const [newQuestionPts, setNewQuestionPts] = useState<number>(2);

  // --- TRẠNG THÁI VẬT LÝ VÒNG QUAY ---
  const [rotation, setRotation] = useState<number>(0);
  const [needleAngle, setNeedleAngle] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // --- KẾT QUẢ QUAY & POPUP CHIẾN THẮNG ---
  const [winner, setWinner] = useState<Student | null>(null);
  const [currentSecretQuestion, setCurrentSecretQuestion] = useState<SecretQuestionItem | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [appliedScoreNote, setAppliedScoreNote] = useState<string | null>(null);

  // Refs điều khiển vòng lặp vật lý
  const animFrameRef = useRef<number | null>(null);
  const rotationRef = useRef<number>(0);
  const lastSliceIdxRef = useRef<number>(-1);

  // Lưu ngân hàng câu hỏi vào localStorage
  useEffect(() => {
    localStorage.setItem('GAMESHOW_SECRET_QUESTIONS', JSON.stringify(secretQuestions));
  }, [secretQuestions]);

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
      setCurrentSecretQuestion(null);
      setShowCelebration(false);
      setAppliedScoreNote(null);
    }
  };

  // BẮT ĐẦU QUAY VÒNG MAY MẮN
  const handleStartSpin = useCallback(() => {
    if (isSpinning || activeCandidates.length === 0) return;

    // Reset trạng thái popup trước đó
    setShowCelebration(false);
    setAppliedScoreNote(null);
    setIsSpinning(true);

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

    const duration = 6200; // 6.2 giây chuẩn Gameshow truyền hình
    const startTime = performance.now();

    // Reset chỉ số slice gần nhất
    const initialNormalized = ((-Math.PI / 2 - startRot) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    lastSliceIdxRef.current = Math.floor(initialNormalized / sliceAngle);

    let currentNeedle = 0;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Easing Curve: mượt mà, tăng tốc nhẹ rồi giảm tốc dần đều ở cuối
      // Quartic Ease-Out: 1 - (1 - t)^4
      const ease = 1 - Math.pow(1 - progress, 4);
      const currentRot = startRot + totalDelta * ease;

      // Tính toán nan quạt đang đi qua kim chỉ 12h để phát âm thanh cơ học tick tick
      const normalizedAngle = ((-Math.PI / 2 - currentRot) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const curSliceIdx = Math.floor(normalizedAngle / sliceAngle);

      if (curSliceIdx !== lastSliceIdxRef.current) {
        lastSliceIdxRef.current = curSliceIdx;
        // Biến thiên tần số âm thanh tạo cảm giác bánh xe quay cơ học chân thực
        const pitchVar = (1 - progress) * 120;
        audioService.play('wheelTick', pitchVar);
        // Kim bị gạt sang bên trái một góc
        currentNeedle = -0.32;
      }

      // Kim chỉ đàn hồi dần về 0
      currentNeedle *= 0.82;

      setRotation(currentRot);
      setNeedleAngle(currentNeedle);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        // DỪNG CHÍNH XÁC TẠI Ô HỌC SINH CHIẾN THẮNG
        setRotation(finalRot);
        setNeedleAngle(0);
        setIsSpinning(false);

        // Chọn câu hỏi bí mật ngẫu nhiên từ ngân hàng
        let drawnQuestion: SecretQuestionItem | null = null;
        if (secretQuestions.length > 0) {
          const randQIdx = Math.floor(Math.random() * secretQuestions.length);
          drawnQuestion = secretQuestions[randQIdx];
        }

        setWinner(chosenStudent);
        setCurrentSecretQuestion(drawnQuestion);

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
  }, [activeCandidates, isSpinning, secretQuestions]);

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
      if (!isOpen || isSpinning || showCelebration || showQuestionBank) return;
      if (e.code === 'Space' && activeCandidates.length > 0) {
        e.preventDefault();
        handleStartSpin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSpinning, showCelebration, showQuestionBank, activeCandidates, handleStartSpin]);

  // Xử lý cộng điểm thưởng cho học sinh trúng giải
  const handleAwardBonus = (pts: number, reason: string) => {
    if (!winner || !onApplyBonusScore) return;
    onApplyBonusScore(winner.id, pts, reason);
    setAppliedScoreNote(`Đã cộng +${pts} điểm cho ${winner.name} 🎉`);
    audioService.play('plus');
  };

  // Thêm câu hỏi mới vào ngân hàng
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const newQ: SecretQuestionItem = {
      id: 'q_' + Date.now(),
      question: newQuestionText.trim(),
      category: newQuestionCat,
      bonusPoints: Number(newQuestionPts) || 2,
      icon:
        newQuestionCat === 'knowledge'
          ? '💡'
          : newQuestionCat === 'fun'
          ? '🎤'
          : newQuestionCat === 'challenge'
          ? '🏆'
          : '🎁',
    };

    setSecretQuestions((prev) => [newQ, ...prev]);
    setNewQuestionText('');
  };

  const handleDeleteQuestion = (qId: string) => {
    if (confirm('Thầy/Cô có muốn xóa câu hỏi này khỏi ngân hàng không?')) {
      setSecretQuestions((prev) => prev.filter((q) => q.id !== qId));
    }
  };

  const handleResetDefaultQuestions = () => {
    if (confirm('Khôi phục lại danh sách câu hỏi bí mật mặc định ban đầu?')) {
      setSecretQuestions(DEFAULT_GAMESHOW_QUESTIONS);
    }
  };

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

            {/* Secret Question Bank Toggle */}
            <button
              type="button"
              onClick={() => setShowQuestionBank(!showQuestionBank)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                showQuestionBank
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20'
                  : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
              }`}
              title="Xem và chỉnh sửa ngân hàng câu hỏi bí mật"
            >
              <HelpCircle size={16} />
              <span className="hidden sm:inline">Ngân hàng câu hỏi</span>
              <span className="px-1.5 py-0.2 bg-black/30 rounded-md text-[10px]">
                {secretQuestions.length}
              </span>
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
          
          {/* TAB 1: NGÂN HÀNG CÂU HỎI BÍ MẬT */}
          {showQuestionBank ? (
            <div className="w-full max-w-2xl bg-slate-800/90 rounded-2xl p-5 border border-white/20 shadow-xl animate-scaleUp">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <HelpCircle className="text-amber-400" size={20} />
                  <h3 className="font-bold text-white text-base">
                    Ngân hàng câu hỏi & Thử thách bí mật
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetDefaultQuestions}
                    className="text-xs text-amber-300 hover:text-amber-200 underline"
                  >
                    Khôi phục mặc định
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuestionBank(false)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs"
                  >
                    Quay về vòng quay
                  </button>
                </div>
              </div>

              {/* Form thêm câu hỏi mới */}
              <form onSubmit={handleAddQuestion} className="mb-5 bg-slate-900/80 p-3.5 rounded-xl border border-white/10">
                <div className="text-xs font-bold text-amber-300 mb-2">Thêm câu hỏi / thử thách mới:</div>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="Nhập nội dung câu hỏi hoặc phần quà..."
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-white/20 text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-amber-400"
                  />
                  <select
                    value={newQuestionCat}
                    onChange={(e) => setNewQuestionCat(e.target.value as any)}
                    className="px-3 py-2 rounded-lg bg-slate-800 border border-white/20 text-white text-xs focus:outline-none"
                  >
                    <option value="knowledge">💡 Kiến thức</option>
                    <option value="fun">🎤 Vui vẻ / Hát</option>
                    <option value="challenge">🏆 Thử thách</option>
                    <option value="gift">🎁 Quà tặng</option>
                  </select>
                  <select
                    value={newQuestionPts}
                    onChange={(e) => setNewQuestionPts(Number(e.target.value))}
                    className="px-3 py-2 rounded-lg bg-slate-800 border border-white/20 text-white text-xs focus:outline-none"
                  >
                    <option value={1}>+1 Điểm</option>
                    <option value={2}>+2 Điểm</option>
                    <option value={3}>+3 Điểm</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={!newQuestionText.trim()}
                  className="w-full py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs rounded-lg shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>Thêm vào ngân hàng câu hỏi</span>
                </button>
              </form>

              {/* Danh sách câu hỏi */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {secretQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base">{q.icon}</span>
                      <span className="text-slate-400 font-mono font-bold">#{idx + 1}</span>
                      <span className="text-slate-100 font-medium truncate">{q.question}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-400/20">
                        +{q.bonusPoints}đ
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1 hover:bg-rose-500/20 hover:text-rose-400 rounded transition-colors text-slate-400"
                        title="Xóa câu hỏi"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* TAB 2: VÒNG QUAY GAMESHOW CHÍNH */
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
          )}
        </div>

        {/* ========================================== */}
        {/* POPUP CHIẾN THẮNG & CÂU HỎI BÍ MẬT         */}
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

            <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-7 text-center shadow-2xl shadow-amber-500/20 animate-scaleUp overflow-hidden">
              
              {/* Nút đóng nhanh popup */}
              <button
                type="button"
                onClick={() => setShowCelebration(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              {/* Vương miện & Banner Vinh danh */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 font-black text-xs tracking-wider uppercase mb-3 animate-pulse">
                <Sparkles size={16} />
                <span>👉 Chúc mừng bạn đã được chọn 👈</span>
                <Sparkles size={16} />
              </div>

              {/* Avatar & Tên Học Sinh Chiến Thắng */}
              <div className="my-2">
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

              {/* HỘP CÂU HỎI BÍ MẬT TIẾT LỘ (CHỈ HIỆN KHI DỪNG VÒNG QUAY) */}
              {currentSecretQuestion ? (
                <div className="my-4 p-4 rounded-2xl bg-slate-800/90 border border-amber-400/40 text-left shadow-inner relative overflow-hidden">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-black text-[11px] border border-amber-300/30">
                      <span>{currentSecretQuestion.icon}</span>
                      <span>
                        {currentSecretQuestion.category === 'knowledge'
                          ? 'CÂU HỎI KIẾN THỨC'
                          : currentSecretQuestion.category === 'fun'
                          ? 'THỬ THÁCH VUI'
                          : currentSecretQuestion.category === 'challenge'
                          ? 'THỰC HÀNH LÊN BẢNG'
                          : 'PHẦN QUÀ BÍ MẬT'}
                      </span>
                    </span>
                    <span className="text-xs font-black text-yellow-300">
                      Thưởng: +{currentSecretQuestion.bonusPoints} Điểm
                    </span>
                  </div>

                  <p className="text-white text-sm sm:text-base font-bold leading-relaxed">
                    {currentSecretQuestion.question}
                  </p>
                </div>
              ) : (
                <div className="my-4 p-3.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-slate-300">
                  🎉 Xin mời {winner.name} lên bảng tham gia câu hỏi của Thầy/Cô!
                </div>
              )}

              {/* Thông báo đã cộng điểm thành công */}
              {appliedScoreNote && (
                <div className="mb-3 p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-xs animate-scaleUp">
                  {appliedScoreNote}
                </div>
              )}

              {/* CÁC NÚT HÀNH ĐỘNG CỦA THẦY/CÔ */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() =>
                    handleAwardBonus(
                      currentSecretQuestion?.bonusPoints || 2,
                      `Xuất sắc Vòng quay: ${currentSecretQuestion?.question || 'Trả lời đúng'}`
                    )
                  }
                  className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>+{currentSecretQuestion?.bonusPoints || 2}đ Xuất sắc</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAwardBonus(1, 'Đạt yêu cầu Vòng quay (+1đ)')}
                  className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>+1đ Đạt</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAwardBonus(1, 'Nhận quà bí mật Vòng quay (+1đ)')}
                  className="col-span-2 sm:col-span-1 px-3 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Gift size={15} />
                  <span>🎁 Trao quà (+1đ)</span>
                </button>
              </div>

              {/* Nút Quay Tiếp hoặc Đóng */}
              <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowCelebration(false);
                    // Sẵn sàng quay tiếp
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles size={15} />
                  <span>Quay tiếp cho bạn khác 🎡</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCelebration(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
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
