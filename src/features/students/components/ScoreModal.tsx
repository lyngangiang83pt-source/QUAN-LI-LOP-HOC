import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Student } from '../../../types';
import { BONUS_CRITERIA, PENALTY_CRITERIA, hasPenaltyNote } from '../../../constants/classroomData';
import { PlusCircle, MinusCircle, RotateCcw } from 'lucide-react';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  mode: 'plus' | 'minus';
  onApplyScore: (studentId: string, pointDiff: number, reason: string) => void;
  onResetScore?: (studentId: string) => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  isOpen,
  onClose,
  student,
  mode,
  onApplyScore,
  onResetScore,
}) => {
  const [customReason, setCustomReason] = useState('');
  const [customPoints, setCustomPoints] = useState(mode === 'minus' ? 2 : 1);

  if (!student) return null;

  const isPenalized = hasPenaltyNote(student.lastNote);
  const criteriaList = mode === 'plus' ? BONUS_CRITERIA : PENALTY_CRITERIA;

  const handleSelectCriteria = (pts: number, label: string) => {
    onApplyScore(student.id, pts, label);
    onClose();
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const reason = customReason.trim() || (mode === 'plus' ? 'Khen thưởng' : 'Nhắc nhở');
    const pts = mode === 'plus' ? Math.abs(customPoints) : -Math.abs(customPoints);
    onApplyScore(student.id, pts, reason);
    setCustomReason('');
    setCustomPoints(mode === 'minus' ? 2 : 1);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          {mode === 'plus' ? <PlusCircle size={20} /> : <MinusCircle size={20} />}
          <span>{mode === 'plus' ? 'Cộng Điểm Khen Thưởng' : 'Trừ Điểm Nhắc Nhở'}</span>
        </>
      }
      headerTheme={mode === 'plus' ? 'primary' : 'danger'}
      maxWidth="max-w-md"
    >
      <div className="text-xs text-slate-500 font-bold mb-3">
        Đang thao tác cho: <strong className="text-slate-900 text-sm">{student.name}</strong>{' '}
        <span className="text-rose-600 font-extrabold">(Mã: {student.id})</span>
      </div>

      {/* Special: Cơ hội sửa sai (Gỡ điểm phạt ngay trong tiết) */}
      {isPenalized && (
        <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-2 border-emerald-400 shadow-sm flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
              <span className="text-base">🌱</span>
              <span>CƠ HỘI SỬA SAI (GỠ ĐIỂM PHẠT)</span>
            </div>
            <div className="text-[11px] text-emerald-800 font-semibold truncate mt-0.5">
              Lỗi gần nhất: <span className="text-rose-600 font-bold">"{student.lastNote}"</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSelectCriteria(2, 'Cơ hội sửa sai (Đã gỡ lỗi)')}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1"
            title="Trao cơ hội sửa sai: Hoàn lại 2 điểm và xóa vi phạm cho học sinh"
          >
            <span>Gỡ lỗi (+2đ) ✨</span>
          </button>
        </div>
      )}

      {/* Fast Criteria List */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {criteriaList.map((c, idx) => {
          const isHighlight = Math.abs(c.pts) >= 10;
          const isOpportunity = c.label.includes('Cơ hội sửa sai');
          const isFullWidth = isHighlight || isOpportunity;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectCriteria(c.pts, c.label)}
              title={`${c.label} (${c.pts > 0 ? `+${c.pts}` : c.pts}đ)`}
              className={`p-3 rounded-xl border text-left font-bold text-xs transition-all active:scale-95 flex items-center justify-between shadow-2xs ${
                isFullWidth
                  ? 'col-span-2 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 hover:from-emerald-100 hover:to-teal-100 border-emerald-300 text-emerald-950 ring-1 ring-emerald-200'
                  : mode === 'plus'
                  ? 'bg-emerald-50/60 hover:bg-emerald-100/80 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/60 hover:bg-rose-100/80 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                <span className="text-base shrink-0">{c.icon}</span>
                <span className="truncate">{c.label}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-md font-extrabold shrink-0 ${
                isFullWidth
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : mode === 'plus' ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
              }`}>
                {c.pts > 0 ? `+${c.pts}` : c.pts}đ
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom Point Input */}
      <form onSubmit={handleApplyCustom} className="pt-3 border-t border-slate-100">
        <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
          Hoặc nhập lý do & số điểm tùy chỉnh:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Lý do (VD: Trực nhật tốt)"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:border-sky-500 text-xs font-semibold outline-none"
          />
          <input
            type="number"
            min="1"
            max="50"
            value={customPoints}
            onChange={(e) => setCustomPoints(Number(e.target.value))}
            className="w-16 px-2 py-2 rounded-xl border border-slate-300 focus:border-sky-500 text-xs font-bold text-center outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Xác nhận
          </button>
        </div>
      </form>

      {/* Reset Student Score Option */}
      {onResetScore && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-500 font-medium">
            Đặt lại điểm học sinh này:
          </span>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Thầy/Cô có chắc chắn muốn đặt lại (reset) điểm của em "${student.name}" về 2 điểm ban đầu không?`)) {
                onResetScore(student.id);
                onClose();
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs transition-colors flex items-center gap-1.5"
            title="Đặt lại điểm số em này về 2 điểm ban đầu"
          >
            <RotateCcw size={13} />
            <span>Reset 2 điểm</span>
          </button>
        </div>
      )}
    </Modal>
  );
};
