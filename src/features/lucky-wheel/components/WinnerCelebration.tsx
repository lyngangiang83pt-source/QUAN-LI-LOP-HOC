import React from 'react';
import { Student } from '../../../types';
import { Award, Plus } from 'lucide-react';

interface WinnerCelebrationProps {
  winner: Student | null;
  onRewardWinnerBonus: (bonusPts: number) => void;
}

export const WinnerCelebration: React.FC<WinnerCelebrationProps> = ({
  winner,
  onRewardWinnerBonus,
}) => {
  if (!winner) return null;

  return (
    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-white shadow-lg text-center animate-scaleUp border border-amber-300">
      <div className="text-xs font-black uppercase tracking-wider text-amber-100 flex items-center justify-center gap-1.5 mb-1">
        <Award size={16} />
        <span>CHÚC MỪNG HỌC SINH MAY MẮN!</span>
        <Award size={16} />
      </div>

      <div className="text-xl md:text-2xl font-black my-1.5 drop-shadow-sm truncate">
        {winner.name}
      </div>
      <div className="text-xs font-extrabold text-amber-100 mb-3">
        (Mã số: {winner.id} — Hiện có: {winner.points} ⭐)
      </div>

      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => onRewardWinnerBonus(2)}
          className="px-4 py-2 rounded-xl bg-white text-orange-600 hover:bg-amber-50 font-black text-xs shadow-md transition-transform active:scale-95 flex items-center gap-1"
        >
          <Plus size={15} />
          <span>Thưởng thêm +2 điểm</span>
        </button>
        <button
          type="button"
          onClick={() => onRewardWinnerBonus(1)}
          className="px-3.5 py-2 rounded-xl bg-white/25 hover:bg-white/35 text-white font-bold text-xs border border-white/40 transition-colors flex items-center gap-1"
        >
          <Plus size={14} />
          <span>+1 điểm</span>
        </button>
      </div>
    </div>
  );
};
