import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Student } from '../../../types';
import { LuckyWheelCanvas } from './LuckyWheelCanvas';
import { WinnerCelebration } from './WinnerCelebration';
import { audioService } from '../../../services/audioService';
import { triggerConfetti } from '../../../services/confettiService';
import { Sparkles, Play } from 'lucide-react';

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
  const [threshold, setThreshold] = useState<number>(5);
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<Student | null>(null);

  const spinAnimationRef = useRef<number | null>(null);

  const candidates = React.useMemo(() => {
    return students.filter((s) => (s.points || 0) >= threshold);
  }, [students, threshold]);

  useEffect(() => {
    if (!isOpen) {
      if (spinAnimationRef.current) cancelAnimationFrame(spinAnimationRef.current);
      setIsSpinning(false);
      setWinner(null);
    }
  }, [isOpen]);

  const handleStartSpin = () => {
    if (isSpinning || candidates.length === 0) return;

    setIsSpinning(true);
    setWinner(null);
    audioService.play('plus');

    const numSlices = candidates.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    // Pick random winner index
    const winnerIdx = Math.floor(Math.random() * numSlices);

    // Calculate target angle (pointer is at top: 3*PI/2)
    // slice center should align with top pointer
    const fullRotations = 6 + Math.floor(Math.random() * 4); // 6 to 9 full spins
    const targetSliceOffset = winnerIdx * sliceAngle + sliceAngle / 2;
    const targetAngle = fullRotations * 2 * Math.PI + (3 * Math.PI) / 2 - targetSliceOffset;

    const startAngle = rotation % (2 * Math.PI);
    const totalDelta = targetAngle - startAngle;
    const duration = 4500; // 4.5 seconds
    const startTime = performance.now();
    let lastTickAngle = startAngle;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease Out Cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + totalDelta * easeOut;

      setRotation(currentAngle);

      // Play tick sound when passing slices
      if (Math.abs(currentAngle - lastTickAngle) >= sliceAngle * 0.8) {
        audioService.play('tick');
        lastTickAngle = currentAngle;
      }

      if (progress < 1) {
        spinAnimationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const winningCandidate = candidates[winnerIdx];
        setWinner(winningCandidate);
        audioService.play('win');
        triggerConfetti();
      }
    };

    spinAnimationRef.current = requestAnimationFrame(animate);
  };

  const handleRewardBonus = (bonusPts: number) => {
    if (!winner) return;
    onApplyBonusScore(winner.id, bonusPts, 'Thưởng Vòng Quay May Mắn');
    setWinner(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <Sparkles size={22} className="text-pink-200" />
          <span>VÒNG QUAY MAY MẮN (ĐIỂM ≥ {threshold})</span>
        </>
      }
      headerTheme="wheel"
      maxWidth="max-w-md"
    >
      {/* Threshold Selector Buttons */}
      <div className="text-center mb-3">
        <span className="text-xs font-bold text-slate-500 block mb-1.5">
          Chọn mốc điểm đủ điều kiện quay:
        </span>
        <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1">
          {[5, 3, 1, 10].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                setThreshold(val);
                setWinner(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                threshold === val
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {val === 5 ? 'Mặc định: ≥ 5đ' : `≥ ${val}đ`}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates Info Tag */}
      <div
        className={`p-2.5 rounded-xl text-center text-xs font-bold mb-2 transition-colors ${
          candidates.length > 0
            ? 'bg-purple-50 text-purple-900 border border-purple-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}
      >
        {candidates.length > 0 ? (
          <span>
            ✨ Có <strong>{candidates.length} học sinh</strong> đạt từ{' '}
            <strong>{threshold} điểm trở lên</strong> trên vòng quay
          </span>
        ) : (
          <span>
            ⚠️ Chưa có học sinh nào đạt từ {threshold} điểm trở lên!
          </span>
        )}
      </div>

      {/* Wheel Canvas */}
      <LuckyWheelCanvas candidates={candidates} rotation={rotation} />

      {/* Winner Celebration Box */}
      <WinnerCelebration winner={winner} onRewardWinnerBonus={handleRewardBonus} />

      {/* Start Spin Button */}
      {!winner && (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleStartSpin}
            disabled={isSpinning || candidates.length === 0}
            className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              candidates.length === 0
                ? 'bg-slate-300 cursor-not-allowed'
                : isSpinning
                ? 'bg-purple-400 cursor-wait'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/25 active:scale-95'
            }`}
          >
            <Play size={18} className="fill-white" />
            <span>
              {isSpinning
                ? 'ĐANG QUAY MAY MẮN...'
                : candidates.length === 0
                ? `Chưa có học sinh đạt ≥ ${threshold}đ`
                : `QUAY NGAY (${candidates.length} em ≥ ${threshold}đ)`}
            </span>
          </button>
        </div>
      )}
    </Modal>
  );
};
