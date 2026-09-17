import React from 'react';
import { Student, PrizeItem, WheelMode } from '../../../types';
import { Award, Sparkles, Plus, CheckCircle2, RotateCcw, HeartHandshake } from 'lucide-react';

interface WinnerCelebrationProps {
  mode: WheelMode;
  wonPrize: PrizeItem | null;
  targetStudent: Student | null;
  winnerStudent: Student | null;
  onApplyPrizeBonus: (pts: number, reason: string) => void;
  onSwitchToPrizeWheelWithStudent?: (student: Student) => void;
  onClose: () => void;
}

export const WinnerCelebration: React.FC<WinnerCelebrationProps> = ({
  mode,
  wonPrize,
  targetStudent,
  winnerStudent,
  onApplyPrizeBonus,
  onSwitchToPrizeWheelWithStudent,
  onClose,
}) => {
  // --- PRIZE MODE RESULT CELEBRATION ---
  if (mode === 'prize' && wonPrize) {
    const isLuckyNext = wonPrize.type === 'lucky_next';
    const isZero = wonPrize.points === 0 && !isLuckyNext;
    const isPass = wonPrize.type === 'pass';

    return (
      <div
        className={`mt-4 p-4 rounded-2xl text-white shadow-xl text-center animate-scaleUp border ${
          isLuckyNext
            ? 'bg-gradient-to-r from-rose-500 via-pink-600 to-rose-700 border-pink-300'
            : isZero
            ? 'bg-gradient-to-r from-slate-600 to-slate-800 border-slate-400'
            : 'bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 border-amber-300'
        }`}
      >
        <div className="text-xs font-black uppercase tracking-wider text-white/90 flex items-center justify-center gap-1.5 mb-1">
          {isLuckyNext ? <HeartHandshake size={18} /> : <Award size={18} />}
          <span>
            {isLuckyNext
              ? 'CHÚC BẠN MAY MẮN LẦN SAU!'
              : isPass
              ? 'XUẤT SẮC - ĐẠT YÊU CẦU!'
              : isZero
              ? 'KẾT QUẢ QUAY THƯỞNG'
              : 'CHÚC MỪNG PHẦN THƯỞNG!'}
          </span>
          {isLuckyNext ? <HeartHandshake size={18} /> : <Sparkles size={18} />}
        </div>

        <div className="text-2xl md:text-3xl font-black my-2 drop-shadow-md flex items-center justify-center gap-2">
          <span>{wonPrize.icon}</span>
          <span>{wonPrize.label}</span>
        </div>

        {targetStudent ? (
          <div className="text-xs font-extrabold bg-black/20 py-1.5 px-3 rounded-full inline-block mx-auto mb-3 text-amber-100">
            Học sinh nhận thưởng: <strong>{targetStudent.name}</strong> ({targetStudent.id} — Hiện có: {targetStudent.points}đ)
          </div>
        ) : (
          <div className="text-xs font-medium text-white/80 mb-3">
            {wonPrize.description}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2">
          {targetStudent && wonPrize.points > 0 && (
            <button
              type="button"
              onClick={() => onApplyPrizeBonus(wonPrize.points, `Quay thưởng trúng ${wonPrize.label}`)}
              className="px-4 py-2 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-black text-xs shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <Plus size={15} />
              <span>Cộng +{wonPrize.points}đ cho {targetStudent.name}</span>
            </button>
          )}

          {targetStudent && isPass && (
            <button
              type="button"
              onClick={() => onApplyPrizeBonus(1, 'Đạt yêu cầu qua Vòng quay may mắn')}
              className="px-4 py-2 rounded-xl bg-white text-cyan-700 hover:bg-cyan-50 font-black text-xs shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 size={15} />
              <span>Ghi nhận ĐẠT (+1đ)</span>
            </button>
          )}

          {targetStudent && (isLuckyNext || isZero) && (
            <button
              type="button"
              onClick={() => onApplyPrizeBonus(0, 'Quay thưởng may mắn')}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/30 transition-colors"
            >
              Ghi nhận & Đóng
            </button>
          )}

          {!targetStudent && (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-black text-xs shadow-md transition-transform active:scale-95"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- STUDENT MODE RESULT CELEBRATION ---
  if (mode === 'student' && winnerStudent) {
    return (
      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-white shadow-lg text-center animate-scaleUp border border-amber-300">
        <div className="text-xs font-black uppercase tracking-wider text-amber-100 flex items-center justify-center gap-1.5 mb-1">
          <Award size={16} />
          <span>CHÚC MỪNG HỌC SINH ĐƯỢC CHỌN!</span>
          <Award size={16} />
        </div>

        <div className="text-xl md:text-2xl font-black my-1.5 drop-shadow-sm truncate">
          {winnerStudent.name}
        </div>
        <div className="text-xs font-extrabold text-amber-100 mb-3">
          (Mã số: {winnerStudent.id} — Điểm tích lũy: {winnerStudent.points} ⭐)
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {onSwitchToPrizeWheelWithStudent && (
            <button
              type="button"
              onClick={() => onSwitchToPrizeWheelWithStudent(winnerStudent)}
              className="px-4 py-2 rounded-xl bg-white text-purple-700 hover:bg-purple-50 font-black text-xs shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles size={15} />
              <span>🎡 Quay phần thưởng cho {winnerStudent.name}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onApplyPrizeBonus(2, 'Thưởng Vòng Quay May Mắn')}
            className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/40 transition-colors flex items-center gap-1"
          >
            <Plus size={14} />
            <span>+2đ</span>
          </button>
          <button
            type="button"
            onClick={() => onApplyPrizeBonus(1, 'Thưởng Vòng Quay May Mắn')}
            className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/40 transition-colors flex items-center gap-1"
          >
            <Plus size={14} />
            <span>+1đ</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};

