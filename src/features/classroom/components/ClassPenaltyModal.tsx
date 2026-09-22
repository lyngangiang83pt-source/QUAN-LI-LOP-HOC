import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Student } from '../../../types';
import { MinusCircle, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface ClassPenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  className: string;
  onDeductAllClassPenalty: (penaltyPts: number, reason: string) => void;
}

const DEFAULT_CLASS_PENALTIES = [
  { icon: '📢', label: 'Cả lớp mất trật tự', pts: 1 },
  { icon: '📝', label: 'Cả lớp chưa làm bài tập', pts: 1 },
  { icon: '🔇', label: 'Không tập trung nghe giảng', pts: 1 },
  { icon: '⏰', label: 'Cả lớp vào tiết muộn', pts: 1 },
  { icon: '📱', label: 'Làm việc riêng trong giờ', pts: 1 },
  { icon: '🧹', label: 'Chưa trực nhật / vệ sinh lớp', pts: 1 },
];

export const ClassPenaltyModal: React.FC<ClassPenaltyModalProps> = ({
  isOpen,
  onClose,
  students,
  className,
  onDeductAllClassPenalty,
}) => {
  const [customReason, setCustomReason] = useState('');
  const [customPoints, setCustomPoints] = useState(1);

  const eligibleStudents = students.filter(
    (s) => s.attendance === 'present' || s.attendance === 'late'
  );
  const absentStudents = students.filter((s) => s.attendance === 'absent');

  const handleSelectReason = (reason: string, pts: number = 1) => {
    onDeductAllClassPenalty(pts, reason);
    onClose();
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const reason = customReason.trim() || 'Nhắc nhở cả lớp';
    const pts = Math.max(1, Math.min(10, customPoints || 1));
    onDeductAllClassPenalty(pts, reason);
    setCustomReason('');
    setCustomPoints(1);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <MinusCircle size={20} className="text-white" />
          <span>Trừ Điểm Nhắc Nhở Cả Lớp</span>
        </>
      }
      headerTheme="danger"
      maxWidth="max-w-lg"
    >
      {/* Target Class & Scope Summary Banner */}
      <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3.5 mb-4 text-xs">
        <div className="flex items-center justify-between font-bold text-rose-950 mb-1.5">
          <span className="flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-rose-600" />
            <span>Lớp đang chọn: <strong className="text-slate-900">{className}</strong></span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 font-extrabold text-[11px]">
            Trừ {eligibleStudents.length} học sinh
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
          <span>
            Chỉ áp dụng cho <strong>{eligibleStudents.length}</strong> học sinh Có mặt/Muộn. Tự động bảo vệ <strong>{absentStudents.length}</strong> học sinh Vắng không bị trừ.
          </span>
        </div>
      </div>

      {/* Quick Select Reason Grid */}
      <div className="mb-4">
        <label className="block text-xs font-extrabold uppercase text-slate-600 mb-2">
          ⚡ Chọn nhanh lý do nhắc nhở:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DEFAULT_CLASS_PENALTIES.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectReason(item.label, item.pts)}
              className="p-3 rounded-xl border border-rose-200/80 bg-rose-50/40 hover:bg-rose-100/80 text-rose-950 font-bold text-xs transition-all active:scale-95 flex items-center justify-between shadow-2xs group"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-base group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-md font-extrabold bg-rose-200/90 text-rose-800 shrink-0 ml-1">
                -{item.pts}đ
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Reason Form */}
      <form onSubmit={handleApplyCustom} className="pt-3 border-t border-slate-100">
        <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
          Hoặc tự nhập lý do khác:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Nhập lý do (VD: Cả lớp làm ồn giờ đọc sách)"
            className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-xs font-semibold outline-none transition-all"
          />
          <input
            type="number"
            min="1"
            max="10"
            value={customPoints}
            onChange={(e) => setCustomPoints(Number(e.target.value))}
            className="w-16 px-2 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-xs font-bold text-center outline-none transition-all"
            title="Số điểm trừ"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-sm transition-all shrink-0"
          >
            Trừ -{customPoints || 1}đ
          </button>
        </div>
      </form>

      {/* Fast Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
        >
          Đóng
        </button>
        <button
          type="button"
          onClick={() => handleSelectReason('Nhắc nhở cả lớp', 1)}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
        >
          <Zap size={13} className="text-amber-500" />
          <span>Trừ nhanh -1đ (Nhắc nhở chung)</span>
        </button>
      </div>
    </Modal>
  );
};
