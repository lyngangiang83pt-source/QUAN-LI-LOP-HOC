import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Student, PrizeItem, WheelMode } from '../../../types';
import { LuckyWheelCanvas } from './LuckyWheelCanvas';
import { WinnerCelebration } from './WinnerCelebration';
import { DEFAULT_PRIZE_SLICES } from '../../../constants/classroomData';
import { audioService } from '../../../services/audioService';
import { triggerConfetti } from '../../../services/confettiService';
import { Sparkles, Play, Gift, Users, UserCheck, CheckCircle2, RotateCcw, ArrowRight, Award } from 'lucide-react';

interface LuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onApplyBonusScore: (studentId: string, pts: number, reason: string) => void;
}

export const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({
  isOpen,
  onClose,
  students,
  onApplyBonusScore,
}) => {
  // Chế độ quay: 'prize' (Quay phần thưởng) hoặc 'student' (Quay gọi tên học sinh)
  const [wheelMode, setWheelMode] = useState<WheelMode>('prize');
  const [threshold, setThreshold] = useState<number>(5);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Lưu lịch sử các em đã quay trong phiên làm việc này: { [studentId]: prizeLabel }
  const [spunRecords, setSpunRecords] = useState<{ [studentId: string]: string }>({});

  // Kết quả sau khi quay
  const [wonPrize, setWonPrize] = useState<PrizeItem | null>(null);
  const [winnerStudent, setWinnerStudent] = useState<Student | null>(null);

  const spinAnimationRef = useRef<number | null>(null);

  // Danh sách các ô phần thưởng
  const prizeSlices = useMemo(() => DEFAULT_PRIZE_SLICES, []);

  // Danh sách học sinh đủ điều kiện (Điểm ≥ threshold)
  const eligibleStudents = useMemo(() => {
    return students.filter((s) => (s.points || 0) >= threshold);
  }, [students, threshold]);

  // Danh sách học sinh đủ điều kiện chưa quay
  const unspunEligible = useMemo(() => {
    return eligibleStudents.filter((s) => !spunRecords[s.id]);
  }, [eligibleStudents, spunRecords]);

  // Tự động chọn học sinh đầu tiên chưa quay khi đổi threshold
  useEffect(() => {
    if (eligibleStudents.length > 0 && !selectedStudentId) {
      const firstUnspun = eligibleStudents.find((s) => !spunRecords[s.id]);
      if (firstUnspun) setSelectedStudentId(firstUnspun.id);
      else setSelectedStudentId(eligibleStudents[0].id);
    }
  }, [eligibleStudents, selectedStudentId, spunRecords]);

  // Học sinh đang được chọn để quay
  const targetStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  useEffect(() => {
    if (!isOpen) {
      if (spinAnimationRef.current) cancelAnimationFrame(spinAnimationRef.current);
      setIsSpinning(false);
      setWonPrize(null);
      setWinnerStudent(null);
    }
  }, [isOpen]);

  const handleStartSpin = () => {
    if (isSpinning) return;

    if (wheelMode === 'student' && eligibleStudents.length === 0) return;
    if (wheelMode === 'prize' && prizeSlices.length === 0) return;

    setIsSpinning(true);
    setWonPrize(null);
    setWinnerStudent(null);
    audioService.play('plus');

    const numSlices = wheelMode === 'prize' ? prizeSlices.length : eligibleStudents.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    // Chọn ngẫu nhiên vị trí trúng thưởng
    const winnerIdx = Math.floor(Math.random() * numSlices);

    // Tính toán góc quay để kim trên cùng (3*PI/2) trỏ đúng tâm của ô trúng thưởng
    const fullRotations = 6 + Math.floor(Math.random() * 4); // Quay 6 đến 9 vòng
    const targetSliceOffset = winnerIdx * sliceAngle + sliceAngle / 2;
    const targetAngle = fullRotations * 2 * Math.PI + (3 * Math.PI) / 2 - targetSliceOffset;

    const startAngle = rotation % (2 * Math.PI);
    const totalDelta = targetAngle - startAngle;
    const duration = 4600; // 4.6 giây
    const startTime = performance.now();
    let lastTickAngle = startAngle;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease Out Cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + totalDelta * easeOut;

      setRotation(currentAngle);

      // Âm thanh tích tắc khi kim lướt qua từng ô
      if (Math.abs(currentAngle - lastTickAngle) >= sliceAngle * 0.75) {
        audioService.play('tick');
        lastTickAngle = currentAngle;
      }

      if (progress < 1) {
        spinAnimationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);

        if (wheelMode === 'prize') {
          const prizeResult = prizeSlices[winnerIdx];
          setWonPrize(prizeResult);

          // Ghi nhận học sinh đã quay
          if (targetStudent) {
            setSpunRecords((prev) => ({
              ...prev,
              [targetStudent.id]: prizeResult.label,
            }));
          }

          if (prizeResult.points > 0 || prizeResult.type === 'pass' || prizeResult.type === 'gift') {
            audioService.play('win');
            triggerConfetti();
          } else {
            audioService.play('plus');
          }
        } else {
          const winningCandidate = eligibleStudents[winnerIdx];
          setWinnerStudent(winningCandidate);
          audioService.play('win');
          triggerConfetti();
        }
      }
    };

    spinAnimationRef.current = requestAnimationFrame(animate);
  };

  const handleApplyPrizeBonus = (pts: number, reason: string) => {
    if (targetStudent && pts > 0) {
      onApplyBonusScore(targetStudent.id, pts, reason);
    } else if (winnerStudent && pts > 0) {
      onApplyBonusScore(winnerStudent.id, pts, reason);
    }

    // Tự động chuyển sang chọn học sinh tiếp theo chưa quay
    const remaining = eligibleStudents.filter((s) => s.id !== (targetStudent?.id || '') && !spunRecords[s.id]);
    if (remaining.length > 0) {
      setSelectedStudentId(remaining[0].id);
    }

    setWonPrize(null);
    setWinnerStudent(null);
  };

  const handleSwitchToPrizeWheelWithStudent = (student: Student) => {
    setSelectedStudentId(student.id);
    setWinnerStudent(null);
    setWonPrize(null);
    setWheelMode('prize');
  };

  const handleSelectNextUnspun = () => {
    if (unspunEligible.length > 0) {
      setSelectedStudentId(unspunEligible[0].id);
      setWonPrize(null);
    }
  };

  const handleResetSpunRecords = () => {
    if (confirm('Thầy/Cô có muốn làm mới lượt quay cho tất cả học sinh để bắt đầu đợt quay mới không?')) {
      setSpunRecords({});
      setWonPrize(null);
      setWinnerStudent(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <Sparkles size={22} className="text-pink-200" />
          <span>VÒNG QUAY MAY MẮN HỌC ĐƯỜNG</span>
        </>
      }
      headerTheme="wheel"
      maxWidth="max-w-xl"
    >
      {/* 1. Tab chuyển đổi chế độ quay */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-3 gap-1">
        <button
          type="button"
          onClick={() => {
            if (!isSpinning) {
              setWheelMode('prize');
              setWonPrize(null);
              setWinnerStudent(null);
            }
          }}
          className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
            wheelMode === 'prize'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Gift size={15} />
          <span>Quay Phần Thưởng (+1Đ, +2Đ, NHẬN QUÀ, ĐẠT, MAY MẮN)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!isSpinning) {
              setWheelMode('student');
              setWonPrize(null);
              setWinnerStudent(null);
            }
          }}
          className={`py-2 px-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            wheelMode === 'student'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users size={15} />
          <span>Quay Tên Học Sinh</span>
        </button>
      </div>

      {/* 2. Bộ lọc điều kiện điểm (Threshold Selector) */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 mb-3">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
          <Award size={16} className="text-amber-500" />
          <span>Điều kiện đủ điểm quay:</span>
        </div>
        <div className="flex items-center gap-1">
          {[5, 3, 1, 0].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                setThreshold(val);
                setWonPrize(null);
                setWinnerStudent(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                threshold === val
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {val === 0 ? 'Tất cả' : val === 5 ? '≥ 5đ (Chuẩn)' : `≥ ${val}đ`}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Danh sách học sinh ĐỦ ĐIỀU KIỆN QUAY THƯỞNG */}
      <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-purple-950 flex items-center gap-1.5">
            <UserCheck size={16} className="text-purple-600" />
            <span>
              Học sinh đủ điều kiện (≥ {threshold}đ):{' '}
              <strong className="text-purple-700">{eligibleStudents.length} em</strong>
            </span>
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">
              Đã quay: <strong>{Object.keys(spunRecords).length}/{eligibleStudents.length}</strong>
            </span>
            {Object.keys(spunRecords).length > 0 && (
              <button
                type="button"
                onClick={handleResetSpunRecords}
                title="Làm mới lại lượt quay cho tất cả học sinh"
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline flex items-center gap-0.5"
              >
                <RotateCcw size={11} />
                <span>Reset lượt</span>
              </button>
            )}
          </div>
        </div>

        {/* Chips danh sách học sinh đủ điều kiện */}
        {eligibleStudents.length > 0 ? (
          <div className="max-h-28 overflow-y-auto pr-1 flex flex-wrap gap-1.5">
            {eligibleStudents.map((s) => {
              const isSelected = s.id === selectedStudentId;
              const hasSpun = !!spunRecords[s.id];
              const spunResult = spunRecords[s.id];

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (!isSpinning) {
                      setSelectedStudentId(s.id);
                      setWonPrize(null);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600 shadow-md scale-105'
                      : hasSpun
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 opacity-85 hover:opacity-100'
                      : 'bg-white text-slate-700 border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <span className="font-mono font-extrabold">{s.id}</span>
                  <span>{s.name}</span>
                  <span className="text-[11px] opacity-80">({s.points}đ)</span>

                  {hasSpun && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-200/80 text-emerald-950 px-1.5 py-0.2 rounded-full font-black">
                      <CheckCircle2 size={10} /> {spunResult}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-2 text-xs font-bold text-rose-600">
            ⚠️ Chưa có học sinh nào đạt từ {threshold} điểm trở lên trong lớp này!
          </div>
        )}

        {/* Nút chọn nhanh em tiếp theo chưa quay */}
        {unspunEligible.length > 0 && unspunEligible[0].id !== selectedStudentId && (
          <div className="mt-2 text-right">
            <button
              type="button"
              onClick={handleSelectNextUnspun}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-purple-200 shadow-2xs transition-colors"
            >
              <span>Chọn em chưa quay tiếp theo: <strong>{unspunEligible[0].name}</strong></span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* 4. Wheel Canvas */}
      <LuckyWheelCanvas
        mode={wheelMode}
        prizeSlices={prizeSlices}
        candidates={eligibleStudents}
        rotation={rotation}
      />

      {/* 5. Winner / Prize Celebration Box */}
      <WinnerCelebration
        mode={wheelMode}
        wonPrize={wonPrize}
        targetStudent={targetStudent}
        winnerStudent={winnerStudent}
        onApplyPrizeBonus={handleApplyPrizeBonus}
        onSwitchToPrizeWheelWithStudent={handleSwitchToPrizeWheelWithStudent}
        onClose={onClose}
      />

      {/* 6. Start Spin Button */}
      {!wonPrize && !winnerStudent && (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleStartSpin}
            disabled={isSpinning || (wheelMode === 'student' && eligibleStudents.length === 0)}
            className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              wheelMode === 'student' && eligibleStudents.length === 0
                ? 'bg-slate-300 cursor-not-allowed'
                : isSpinning
                ? 'bg-purple-400 cursor-wait'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 hover:shadow-purple-500/25 active:scale-95'
            }`}
          >
            <Play size={18} className="fill-white" />
            <span>
              {isSpinning
                ? 'ĐANG QUAY MAY MẮN...'
                : wheelMode === 'prize'
                ? targetStudent
                  ? `QUAY PHẦN THƯỞNG CHO: ${targetStudent.name.toUpperCase()} (${targetStudent.id})`
                  : 'QUAY PHẦN THƯỞNG NGAY (+1Đ, +2Đ, NHẬN QUÀ...)'
                : `QUAY CHỌN HỌC SINH (${eligibleStudents.length} em đủ ĐK)`}
            </span>
          </button>
        </div>
      )}
    </Modal>
  );
};


