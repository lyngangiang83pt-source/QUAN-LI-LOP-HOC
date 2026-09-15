import React from 'react';
import { Student } from '../../../types';

interface StatsGridProps {
  students: Student[];
  minWheelPoints?: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ students, minWheelPoints = 5 }) => {
  const total = students.length;
  const presentCount = students.filter((s) => s.attendance === 'present').length;
  const qualifiedCount = students.filter((s) => (s.points || 0) >= minWheelPoints).length;
  const totalPoints = students.reduce((acc, cur) => acc + (cur.points || 0), 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
      {/* Stat 1 */}
      <div className="bg-white/15 backdrop-blur-md rounded-xl p-3.5 border border-white/25 shadow-sm">
        <div className="text-xs uppercase tracking-wider font-bold text-sky-100">Sĩ số lớp</div>
        <div className="text-2xl font-extrabold text-white mt-1">{total}</div>
      </div>

      {/* Stat 2 */}
      <div className="bg-white/15 backdrop-blur-md rounded-xl p-3.5 border border-white/25 shadow-sm">
        <div className="text-xs uppercase tracking-wider font-bold text-sky-100">Có mặt hôm nay</div>
        <div className="text-2xl font-extrabold text-emerald-300 mt-1">{presentCount}</div>
      </div>

      {/* Stat 3 */}
      <div className="bg-white/15 backdrop-blur-md rounded-xl p-3.5 border border-white/25 shadow-sm">
        <div className="text-xs uppercase tracking-wider font-bold text-sky-100">Đủ đk quay (≥{minWheelPoints}đ)</div>
        <div className="text-2xl font-extrabold text-pink-200 mt-1">{qualifiedCount} em</div>
      </div>

      {/* Stat 4 */}
      <div className="bg-white/15 backdrop-blur-md rounded-xl p-3.5 border border-white/25 shadow-sm">
        <div className="text-xs uppercase tracking-wider font-bold text-sky-100">Tổng Sao / Điểm</div>
        <div className="text-2xl font-extrabold text-amber-300 mt-1">{totalPoints} ⭐</div>
      </div>
    </div>
  );
};
