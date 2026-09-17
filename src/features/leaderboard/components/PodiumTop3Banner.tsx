import React from 'react';
import { Student } from '../../../types';
import { Crown, Trophy, ExternalLink, Sparkles } from 'lucide-react';

interface PodiumTop3BannerProps {
  students: Student[];
  onOpenLeaderboardModal: () => void;
  onOpenSpotlightModal?: () => void;
}

export const PodiumTop3Banner: React.FC<PodiumTop3BannerProps> = ({
  students,
  onOpenLeaderboardModal,
  onOpenSpotlightModal,
}) => {
  const sorted = React.useMemo(() => {
    return [...students].sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [students]);

  const top3 = sorted.slice(0, 3);
  if (top3.length === 0) return null;

  const medals = ['🥇 Top 1', '🥈 Top 2', '🥉 Top 3'];

  return (
    <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300/80 rounded-2xl p-4 md:p-5 shadow-soft-sm mb-5 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Crown className="text-amber-500 fill-amber-400" size={22} />
          <h2 className="text-base md:text-lg font-black text-amber-950 uppercase tracking-tight">
            Bảng Vinh Danh Học Sinh Điểm Cao Nhất Lớp
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {onOpenSpotlightModal && (
            <button
              type="button"
              onClick={onOpenSpotlightModal}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-black shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
              title="Mở Lễ vinh danh Spotlight Top 1 với luồng sáng vàng và nhạc trao giải"
            >
              <Sparkles size={14} className="text-amber-950" />
              <span>🔦 Chiếu sáng Spotlight Top 1</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenLeaderboardModal}
            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <Trophy size={14} />
            <span>Mở Bảng Xếp Hạng</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {top3.map((s, idx) => {
          const isTop1 = idx === 0;
          return (
            <div
              key={s.id}
              onClick={onOpenLeaderboardModal}
              className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-xs flex flex-col justify-between ${
                isTop1
                  ? 'bg-gradient-to-b from-amber-100 to-yellow-200/90 border-amber-400 ring-2 ring-amber-300'
                  : 'bg-white border-amber-200 hover:border-amber-300'
              }`}
              title="Bấm để xem Bảng Xếp Hạng chi tiết"
            >
              <div className="text-xs font-extrabold uppercase text-amber-800 tracking-wider">
                {medals[idx]}
              </div>
              <div className="font-extrabold text-slate-900 text-sm md:text-base my-1.5 truncate">
                {s.name}
              </div>
              <div className="inline-block mx-auto px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 font-extrabold text-xs">
                {s.points > 0 ? '+' : ''}{s.points} ⭐
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
