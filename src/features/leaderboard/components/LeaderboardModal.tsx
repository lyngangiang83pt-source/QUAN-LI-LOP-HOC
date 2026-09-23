import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Student } from '../../../types';
import { exportStudentsToCSV } from '../../import-export/utils/csvExporter';
import { Trophy, Download, Play } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  className: string;
  minWheelPoints?: number;
  onOpenWheelModal: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  students,
  className,
  minWheelPoints = 18,
  onOpenWheelModal,
}) => {
  const sorted = React.useMemo(() => {
    return [...students].sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [students]);

  const top3 = sorted.slice(0, 3);
  const podium = [];
  if (top3[1]) podium.push({ s: top3[1], rank: 2, label: '🥈 Hạng 2', icon: '🥈', bg: 'from-slate-100 to-slate-200 border-slate-300' });
  if (top3[0]) podium.push({ s: top3[0], rank: 1, label: '🥇 Thủ Khoa (Top 1)', icon: '👑', bg: 'from-amber-200 to-yellow-300 border-amber-400 ring-2 ring-amber-300 shadow-md transform -translate-y-2' });
  if (top3[2]) podium.push({ s: top3[2], rank: 3, label: '🥉 Hạng 3', icon: '🥉', bg: 'from-amber-50 to-orange-100 border-orange-200' });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <Trophy size={22} className="text-amber-200" />
          <span>BẢNG VINH DANH XẾP HẠNG LỚP HỌC</span>
        </>
      }
      headerTheme="rank"
      maxWidth="max-w-2xl"
    >
      {/* Top 3 Podium Box */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6 items-end pt-4 pb-2">
          {podium.map((item) => (
            <div
              key={item.s.id}
              className={`p-3 rounded-2xl border text-center bg-gradient-to-b ${item.bg} flex flex-col justify-between`}
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-[10px] md:text-xs font-black uppercase text-amber-900 tracking-wider">
                {item.label}
              </div>
              <div className="font-black text-slate-900 text-xs md:text-sm my-1 truncate" title={item.s.name}>
                {item.s.name}
              </div>
              <div className="inline-block mx-auto px-2.5 py-0.5 rounded-full bg-white/80 font-black text-amber-900 text-xs shadow-2xs">
                {item.s.points > 0 ? '+' : ''}{item.s.points} ⭐
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header Info */}
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-xs font-bold text-slate-700">📋 Danh sách xếp hạng từ Cao ➔ Thấp:</span>
        <span className="text-xs font-extrabold text-slate-500">Sĩ số: {sorted.length} học sinh</span>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider sticky top-0">
              <tr>
                <th className="py-2.5 px-3 text-center w-16">Thứ hạng</th>
                <th className="py-2.5 px-3">Họ và Tên</th>
                <th className="py-2.5 px-3 text-center w-24">Chuyên cần</th>
                <th className="py-2.5 px-3 text-center w-24">Điểm tích lũy</th>
                <th className="py-2.5 px-3 text-center w-28">Danh hiệu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {sorted.map((s, idx) => {
                const rankNum = idx + 1;
                let rankBadge = <span className="text-slate-600">#{rankNum}</span>;
                let honorBadge = <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px]">👍 Tích cực</span>;
                let rowBg = 'hover:bg-slate-50/70';

                if (rankNum === 1) {
                  rankBadge = <span className="bg-amber-100 text-amber-900 font-black px-2 py-0.5 rounded-full">🥇 #1</span>;
                  honorBadge = <span className="bg-amber-500 text-white font-black px-2 py-0.5 rounded-full text-[10px]">👑 Thủ Khoa</span>;
                  rowBg = 'bg-amber-50/50 hover:bg-amber-50';
                } else if (rankNum === 2) {
                  rankBadge = <span className="bg-slate-200 text-slate-800 font-black px-2 py-0.5 rounded-full">🥈 #2</span>;
                  honorBadge = <span className="bg-slate-700 text-white font-black px-2 py-0.5 rounded-full text-[10px]">🌟 Xuất sắc</span>;
                  rowBg = 'bg-slate-50/70 hover:bg-slate-100/70';
                } else if (rankNum === 3) {
                  rankBadge = <span className="bg-orange-100 text-orange-900 font-black px-2 py-0.5 rounded-full">🥉 #3</span>;
                  honorBadge = <span className="bg-orange-500 text-white font-black px-2 py-0.5 rounded-full text-[10px]">⭐ Top 3 Giỏi</span>;
                  rowBg = 'bg-orange-50/40 hover:bg-orange-50/70';
                } else if ((s.points || 0) >= minWheelPoints) {
                  honorBadge = <span className="bg-purple-100 text-purple-800 font-black px-2 py-0.5 rounded-full text-[10px]">🎡 Đủ đk quay</span>;
                }

                const attStatus =
                  s.attendance === 'present' ? (
                    <span className="text-emerald-700 font-bold">✅ Có mặt</span>
                  ) : s.attendance === 'late' ? (
                    <span className="text-amber-700 font-bold">⏰ Muộn</span>
                  ) : (
                    <span className="text-rose-700 font-bold">❌ Vắng</span>
                  );

                return (
                  <tr key={s.id} className={`${rowBg} transition-colors`}>
                    <td className="py-2.5 px-3 text-center">{rankBadge}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-extrabold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-rose-600 font-extrabold">(Mã: {s.id})</div>
                    </td>
                    <td className="py-2.5 px-3 text-center">{attStatus}</td>
                    <td className="py-2.5 px-3 text-center font-black text-sky-700 text-sm">
                      {s.points > 0 ? '+' : ''}{s.points} ⭐
                    </td>
                    <td className="py-2.5 px-3 text-center">{honorBadge}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => exportStudentsToCSV(students, className)}
          className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <Download size={15} />
          <span>Xuất bảng xếp hạng Excel</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenWheelModal();
          }}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
        >
          <Play size={14} className="fill-white" />
          <span>Mở Vòng Quay May Mắn</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
        >
          Đóng
        </button>
      </div>
    </Modal>
  );
};
