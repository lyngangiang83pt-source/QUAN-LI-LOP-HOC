import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { ResetHonorData } from '../../../types';
import { Trophy, Copy, Check, Sparkles, Award } from 'lucide-react';
import { audioService } from '../../../services/audioService';

interface ResetHonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResetHonorData | null;
  onShowToast?: (msg: string, type?: 'success' | 'danger' | 'wheel' | 'rank' | 'info') => void;
}

export const ResetHonorModal: React.FC<ResetHonorModalProps> = ({
  isOpen,
  onClose,
  data,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && data && data.students.length > 0) {
      audioService.play('win');
      setCopied(false);
    }
  }, [isOpen, data]);

  if (!data || data.students.length === 0) return null;

  // Sắp xếp học sinh theo điểm trước khi reset từ cao xuống thấp
  const sortedStudents = [...data.students].sort((a, b) => b.prevPoints - a.prevPoints);

  const handleCopyZalo = () => {
    const lines = [
      `🎉 BẢNG VINH DANH & TUYÊN DƯƠNG HỌC SINH ĐẠT CHUẨN 🎉`,
      `Lớp: ${data.className} | Ngày: ${new Date().toLocaleDateString('vi-VN')}`,
      `Thầy/Cô nhiệt liệt tuyên dương ${sortedStudents.length} học sinh xuất sắc đã đạt mốc điểm chuẩn (≥ 18đ) trong hiệp thi đua vừa qua:\n`,
    ];

    sortedStudents.forEach((s, idx) => {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '⭐';
      lines.push(`${idx + 1}. ${medal} [Mã: ${s.id}] ${s.name}: ${s.prevPoints}đ (sau trừ 18đ còn ${s.newPoints}đ)`);
    });

    lines.push(`\nChúc mừng các em và chúc cả lớp tiếp tục bứt phá trong hiệp tiếp theo! 🌟👏`);

    const text = lines.join('\n');
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }

    setCopied(true);
    audioService.play('plus');
    setTimeout(() => setCopied(false), 2500);

    if (onShowToast) {
      onShowToast('📋 Đã sao chép danh sách tuyên dương vào bộ nhớ tạm!', 'success');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Trophy size={22} className="text-amber-200 fill-amber-300" />
          <span className="font-black uppercase tracking-tight text-white text-sm sm:text-base">
            DANH SÁCH HỌC SINH ĐẠT CHUẨN ĐƯỢC TUYÊN DƯƠNG
          </span>
        </div>
      }
      headerTheme="rank"
      maxWidth="max-w-2xl"
    >
      <div className="p-4 sm:p-5 flex flex-col gap-4">
        {/* Banner Tuyên Dương Đầu Modal */}
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 shadow-soft-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md">
            🏆
          </div>
          <div className="flex-1">
            <h3 className="font-black text-amber-950 text-base sm:text-lg flex items-center gap-2">
              <span>Lớp {data.className}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-xs">
                {sortedStudents.length} học sinh đạt chuẩn
              </span>
            </h3>
            <p className="text-xs text-amber-800 font-semibold mt-1 leading-relaxed">
              Các em học sinh dưới đây đã xuất sắc đạt từ <strong>18 điểm trở lên</strong> trước khi Reset. 
              Thầy/Cô hãy đọc to tên các em trước lớp để tuyên dương và động viên tinh thần thi đua của cả lớp nhé! 👏
            </p>
          </div>
        </div>

        {/* Danh Sách Học Sinh Dạng Card Rõ Ràng Để Đọc Tên */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-slate-50/50">
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-2">
            {sortedStudents.map((s, idx) => {
              const isTop1 = idx === 0;
              const isTop2 = idx === 1;
              const isTop3 = idx === 2;

              let rankBadge = (
                <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                  #{idx + 1}
                </span>
              );

              if (isTop1) {
                rankBadge = (
                  <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                    🥇
                  </span>
                );
              } else if (isTop2) {
                rankBadge = (
                  <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                    🥈
                  </span>
                );
              } else if (isTop3) {
                rankBadge = (
                  <span className="w-7 h-7 rounded-full bg-amber-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                    🥉
                  </span>
                );
              }

              return (
                <div
                  key={s.id}
                  className="bg-white p-3 rounded-xl mb-1.5 border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs hover:border-amber-400 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {rankBadge}
                    <div className="min-w-0">
                      <div className="font-black text-slate-900 text-sm sm:text-base truncate">
                        {s.name}
                      </div>
                      <div className="text-xs text-rose-600 font-extrabold">
                        (Mã: {s.id})
                      </div>
                    </div>
                  </div>

                  {/* Cụm biến động điểm */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-extrabold text-xs" title="Điểm trước khi Reset">
                      {s.prevPoints} ⭐
                    </span>
                    <span className="text-slate-400 font-bold text-xs">➔</span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-black text-xs shadow-2xs" title="Điểm sau khi trừ 18đ">
                      +{s.newPoints} ⭐
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Thanh Hành Động Phía Dưới */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCopyZalo}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
            title="Sao chép nội dung tuyên dương để gửi Zalo phụ huynh hoặc ghi sổ"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Đã sao chép danh sách!' : 'Sao chép tin nhắn tuyên dương (Zalo)'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};
