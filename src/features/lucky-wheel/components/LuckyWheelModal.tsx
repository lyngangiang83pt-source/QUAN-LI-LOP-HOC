import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Student, PrizeItem, WheelMode } from '../../../types';
import { LuckyWheelCanvas } from './LuckyWheelCanvas';
import { WinnerCelebration } from './WinnerCelebration';
import { DEFAULT_PRIZE_SLICES } from '../../../constants/classroomData';
import { audioService } from '../../../services/audioService';
import { triggerConfetti } from '../../../services/confettiService';
import { Sparkles, Play, Gift, Users, UserCheck } from 'lucide-react';

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

  // Kết quả sau khi quay
  const [wonPrize, setWonPrize] = useState<PrizeItem | null>(null);
  const [winnerStudent, setWinnerStudent] = useState<Student | null>(null);

  const spinAnimationRef = useRef<number | null>(null);

  // Danh sách các ô phần thưởng
  const prizeSlices = useMemo(() => DEFAULT_PRIZE_SLICES, []);

  // Danh sách học sinh đủ điều kiện (khi ở chế độ quay học sinh)
  const candidates = useMemo(() => {
    return students.filter((s) => (s.points || 0) >= threshold);
  }, [students, threshold]);

  // Học sinh được chỉ định nhận thưởng trong chế độ Quay phần thưởng
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

    if (wheelMode === 'student' && candidates.length === 0) return;
    if (wheelMode === 'prize' && prizeSlices.length === 0) return;

    setIsSpinning(true);
    setWonPrize(null);
    setWinnerStudent(null);
    audioService.play('plus');

    const numSlices = wheelMode === 'prize' ? prizeSlices.length : candidates.length;
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

          if (prizeResult.points > 0 || prizeResult.type === 'pass') {
            audioService.play('win');
            triggerConfetti();
          } else {
            audioService.play('plus');
          }
        } else {
          const winningCandidate = candidates[winnerIdx];
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
    setWonPrize(null);
    setWinnerStudent(null);
    onClose();
  };

  const handleSwitchToPrizeWheelWithStudent = (student: Student) => {
    setSelectedStudentId(student.id);
    setWinnerStudent(null);
    setWonPrize(null);
    setWheelMode('prize');
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
      maxWidth="max-w-lg"
    >
      {/* Tab chuyển đổi chế độ quay */}
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
          <span>Quay Phần Thưởng (+1Đ, +2Đ, 0Đ, ĐẠT, MAY MẮN)</span>
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

      {/* Control Bar tùy theo Mode */}
      {wheelMode === 'prize' ? (
        <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-2.5 mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 shrink-0">
            <UserCheck size={16} className="text-purple-600" />
            <span>Học sinh nhận thưởng:</span>
          </div>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            disabled={isSpinning}
            className="text-xs font-bold p-1.5 px-3 rounded-xl border border-purple-300 bg-white text-purple-900 outline-none focus:ring-2 focus:ring-purple-200 flex-1 max-w-[200px]"
          >
            <option value="">-- Quay cho cả lớp xem --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} - {s.name} ({s.points}đ)
              </option>
            ))}
          </select>
        </div>
      ) : (
        /* Threshold Selector Buttons for Student Mode */
        <div className="text-center mb-2">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            Chọn mốc điểm học sinh đủ điều kiện quay:
          </span>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1">
            {[5, 3, 1, 0].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setThreshold(val);
                  setWinnerStudent(null);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  threshold === val
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {val === 0 ? 'Tất cả lớp' : val === 5 ? 'Mặc định: ≥ 5đ' : `≥ ${val}đ`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Wheel Canvas */}
      <LuckyWheelCanvas
        mode={wheelMode}
        prizeSlices={prizeSlices}
        candidates={candidates}
        rotation={rotation}
      />

      {/* Winner / Prize Celebration Box */}
      <WinnerCelebration
        mode={wheelMode}
        wonPrize={wonPrize}
        targetStudent={targetStudent}
        winnerStudent={winnerStudent}
        onApplyPrizeBonus={handleApplyPrizeBonus}
        onSwitchToPrizeWheelWithStudent={handleSwitchToPrizeWheelWithStudent}
        onClose={onClose}
      />

      {/* Start Spin Button */}
      {!wonPrize && !winnerStudent && (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleStartSpin}
            disabled={isSpinning || (wheelMode === 'student' && candidates.length === 0)}
            className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              wheelMode === 'student' && candidates.length === 0
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
                  ? `QUAY PHẦN THƯỞNG CHO ${targetStudent.name.toUpperCase()}`
                  : 'QUAY PHẦN THƯỞNG NGAY (+1Đ, +2Đ, 0Đ, ĐẠT, MAY MẮN)'
                : `QUAY CHỌN HỌC SINH (${candidates.length} em đủ ĐK)`}
            </span>
          </button>
        </div>
      )}
    </Modal>
  );
};

