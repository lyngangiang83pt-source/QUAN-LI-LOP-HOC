import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Student } from '../../../types';
import { BONUS_CRITERIA, PENALTY_CRITERIA } from '../../../constants/classroomData';
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
  const [customPoints, setCustomPoints] = useState(1);

  if (!student) return null;

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
    setCustomPoints(1);
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

      {/* Fast Criteria List */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {criteriaList.map((c, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectCriteria(c.pts, c.label)}
            className={`p-3 rounded-xl border text-left font-bold text-xs transition-all active:scale-95 flex items-center justify-between shadow-2xs ${
              mode === 'plus'
                ? 'bg-emerald-50/60 hover:bg-emerald-100/80 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/60 hover:bg-rose-100/80 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-base">{c.icon}</span>
              <span className="truncate">{c.label}</span>
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-extrabold ${
              mode === 'plus' ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
            }`}>
              {c.pts > 0 ? `+${c.pts}` : c.pts}đ
            </span>
          </button>
        ))}
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
            max="10"
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
              if (confirm(`Thầy/Cô có chắc chắn muốn đặt lại (reset) điểm của em "${student.name}" về 0 không?`)) {
                onResetScore(student.id);
                onClose();
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs transition-colors flex items-center gap-1.5"
            title="Đặt lại điểm số em này về 0"
          >
            <RotateCcw size={13} />
            <span>Reset 0 điểm</span>
          </button>
        </div>
      )}
    </Modal>
  );
};
