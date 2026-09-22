import React, { useState, useMemo } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Student } from '../../../types';
import { 
  MinusCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Users, 
  Check, 
  Zap, 
  Layers,
  ChevronRight
} from 'lucide-react';

interface ClassPenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  className: string;
  onDeductAllClassPenalty: (
    penaltyPts: number, 
    reason: string, 
    targetStudentIds?: string[], 
    scopeName?: string
  ) => void;
}

type ScopeType = 'all' | 'to1' | 'to2' | 'to3' | 'to4' | 'daycuoi' | 'custom';

interface ScopeOption {
  id: ScopeType;
  label: string;
  icon: string;
  desc: string;
}

const SCOPE_OPTIONS: ScopeOption[] = [
  { id: 'all', label: 'Cả lớp', icon: '🌐', desc: 'Toàn bộ học sinh trong lớp' },
  { id: 'to1', label: 'Tổ 1', icon: '👥', desc: 'Nhóm học sinh Tổ 1' },
  { id: 'to2', label: 'Tổ 2', icon: '👥', desc: 'Nhóm học sinh Tổ 2' },
  { id: 'to3', label: 'Tổ 3', icon: '👥', desc: 'Nhóm học sinh Tổ 3' },
  { id: 'to4', label: 'Tổ 4', icon: '👥', desc: 'Nhóm học sinh Tổ 4' },
  { id: 'daycuoi', label: 'Dãy bàn cuối', icon: '🪑', desc: 'Các học sinh ngồi cuối lớp' },
  { id: 'custom', label: 'Chọn từng em', icon: '🎯', desc: 'Tự chọn danh sách học sinh' },
];

const DEFAULT_PENALTY_REASONS = [
  { icon: '📢', label: 'Mất trật tự', defaultPts: 1 },
  { icon: '📝', label: 'Chưa làm bài tập', defaultPts: 1 },
  { icon: '🔇', label: 'Không tập trung nghe giảng', defaultPts: 1 },
  { icon: '⏰', label: 'Vào tiết muộn', defaultPts: 1 },
  { icon: '📱', label: 'Làm việc riêng trong giờ', defaultPts: 1 },
  { icon: '🧹', label: 'Chưa trực nhật / vệ sinh lớp', defaultPts: 1 },
];

export const ClassPenaltyModal: React.FC<ClassPenaltyModalProps> = ({
  isOpen,
  onClose,
  students,
  className,
  onDeductAllClassPenalty,
}) => {
  const [selectedScope, setSelectedScope] = useState<ScopeType>('all');
  const [customSelectedIds, setCustomSelectedIds] = useState<string[]>([]);
  const [customReason, setCustomReason] = useState('');
  const [customPoints, setCustomPoints] = useState(1);

  // Divide class into 4 Tổ based on student count
  const groups = useMemo(() => {
    const total = students.length;
    const chunkSize = Math.max(1, Math.ceil(total / 4));
    
    return {
      to1: students.slice(0, chunkSize),
      to2: students.slice(chunkSize, chunkSize * 2),
      to3: students.slice(chunkSize * 2, chunkSize * 3),
      to4: students.slice(chunkSize * 3),
      daycuoi: students.slice(Math.max(0, total - Math.max(4, Math.ceil(total * 0.25)))),
    };
  }, [students]);

  // Determine current target student pool
  const currentTargetPool = useMemo(() => {
    switch (selectedScope) {
      case 'to1':
        return groups.to1;
      case 'to2':
        return groups.to2;
      case 'to3':
        return groups.to3;
      case 'to4':
        return groups.to4;
      case 'daycuoi':
        return groups.daycuoi;
      case 'custom':
        return students.filter((s) => customSelectedIds.includes(s.id));
      case 'all':
      default:
        return students;
    }
  }, [selectedScope, groups, students, customSelectedIds]);

  const eligibleStudents = useMemo(() => {
    return currentTargetPool.filter((s) => s.attendance === 'present' || s.attendance === 'late');
  }, [currentTargetPool]);

  const absentStudents = useMemo(() => {
    return currentTargetPool.filter((s) => s.attendance === 'absent');
  }, [currentTargetPool]);

  const getScopeDisplayName = () => {
    switch (selectedScope) {
      case 'to1': return 'Tổ 1';
      case 'to2': return 'Tổ 2';
      case 'to3': return 'Tổ 3';
      case 'to4': return 'Tổ 4';
      case 'daycuoi': return 'Dãy bàn cuối';
      case 'custom': return `${eligibleStudents.length} học sinh đã chọn`;
      case 'all':
      default: return 'Cả lớp';
    }
  };

  const handleToggleCustomStudent = (id: string) => {
    setCustomSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllInScope = () => {
    setCustomSelectedIds(students.map((s) => s.id));
  };

  const handleClearCustomSelection = () => {
    setCustomSelectedIds([]);
  };

  const executePenalty = (reasonLabel: string, pts: number = 1) => {
    const scopeName = getScopeDisplayName();
    let finalReason = reasonLabel;

    if (selectedScope !== 'all') {
      finalReason = `[${scopeName}] ${reasonLabel}`;
    } else {
      if (!reasonLabel.toLowerCase().includes('cả lớp')) {
        finalReason = `Cả lớp ${reasonLabel.toLowerCase()}`;
      }
    }

    const targetIds = selectedScope === 'all' ? undefined : currentTargetPool.map((s) => s.id);

    onDeductAllClassPenalty(pts, finalReason, targetIds, scopeName);
    onClose();
  };

  const handleApplyCustomForm = (e: React.FormEvent) => {
    e.preventDefault();
    const reason = customReason.trim() || 'Nhắc nhở học tập';
    const pts = Math.max(1, Math.min(10, customPoints || 1));
    executePenalty(reason, pts);
    setCustomReason('');
    setCustomPoints(1);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <MinusCircle size={20} className="text-white" />
          <span>Trừ Điểm Nhắc Nhở Theo Tổ / Dãy / Cả Lớp</span>
        </>
      }
      headerTheme="danger"
      maxWidth="max-w-2xl"
    >
      {/* 1. Scope Selection Tabs */}
      <div className="mb-4">
        <label className="block text-xs font-black uppercase text-slate-700 mb-2 flex items-center gap-1.5">
          <Layers size={14} className="text-rose-600" />
          <span>Chọn phạm vi cần nhắc nhở:</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
          {SCOPE_OPTIONS.map((opt) => {
            const isSelected = selectedScope === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setSelectedScope(opt.id);
                  if (opt.id === 'custom' && customSelectedIds.length === 0) {
                    setCustomSelectedIds(students.slice(0, 4).map((s) => s.id));
                  }
                }}
                className={`px-2 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 text-center border active:scale-95 ${
                  isSelected
                    ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-300 font-extrabold scale-[1.02]'
                    : 'bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-900 border-slate-200'
                }`}
              >
                <span className="text-base">{opt.icon}</span>
                <span className="truncate w-full text-[11px] leading-tight">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Custom Individual Checkbox Picker (If selectedScope === 'custom') */}
      {selectedScope === 'custom' && (
        <div className="mb-4 bg-slate-50 border border-slate-200 rounded-2xl p-3 animate-fadeIn">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200 text-xs">
            <span className="font-bold text-slate-700">
              Chọn các học sinh cần trừ điểm ({customSelectedIds.length} em):
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAllInScope}
                className="text-[11px] text-sky-700 hover:underline font-bold"
              >
                Chọn tất cả
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleClearCustomSelection}
                className="text-[11px] text-rose-600 hover:underline font-bold"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {students.map((s) => {
              const isChecked = customSelectedIds.includes(s.id);
              const isAbsent = s.attendance === 'absent';
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleToggleCustomStudent(s.id)}
                  className={`px-2 py-1.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-all border ${
                    isChecked
                      ? 'bg-rose-100/90 border-rose-400 text-rose-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">
                    {s.name} <span className="text-[10px] text-slate-400">({s.id})</span>
                  </span>
                  {isAbsent ? (
                    <span className="text-[10px] text-rose-500 font-extrabold ml-1">Vắng</span>
                  ) : isChecked ? (
                    <Check size={13} className="text-rose-600 shrink-0 ml-1" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Scope Summary & Protection Notice */}
      <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-3.5 mb-4 text-xs">
        <div className="flex flex-wrap items-center justify-between font-bold text-rose-950 mb-1.5 gap-2">
          <span className="flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span>
              Phạm vi: <strong className="text-rose-900 bg-white px-2 py-0.5 rounded-md border border-rose-200">{getScopeDisplayName()}</strong> (Lớp {className})
            </span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[11px] shadow-xs">
            Trừ {eligibleStudents.length} học sinh
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 text-slate-600 mb-2">
          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
          <span>
            Chỉ trừ <strong>{eligibleStudents.length}</strong> học sinh Có mặt/Muộn. Tự động bảo vệ <strong>{absentStudents.length}</strong> học sinh Vắng mặt.
          </span>
        </div>

        {/* Member Preview Chips */}
        {currentTargetPool.length > 0 && (
          <div className="pt-2 border-t border-rose-200/60 flex flex-wrap gap-1 max-h-20 overflow-y-auto">
            {currentTargetPool.map((s) => (
              <span
                key={s.id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  s.attendance === 'absent'
                    ? 'bg-slate-100 text-slate-400 line-through border-slate-200'
                    : 'bg-white text-slate-800 border-rose-200 shadow-2xs'
                }`}
                title={s.attendance === 'absent' ? `${s.name} (Vắng - Không bị trừ)` : s.name}
              >
                <span>{s.name}</span>
                <span className="text-rose-600 text-[9px] font-extrabold">({s.points || 0}đ)</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 4. Quick Select Reasons Grid */}
      <div className="mb-4">
        <label className="block text-xs font-extrabold uppercase text-slate-700 mb-2">
          ⚡ Chọn nhanh lý do áp dụng cho <span className="text-rose-600 font-black">{getScopeDisplayName()}</span>:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {DEFAULT_PENALTY_REASONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={eligibleStudents.length === 0}
              onClick={() => executePenalty(item.label, item.defaultPts)}
              className="p-3 rounded-xl border border-rose-200/80 bg-rose-50/40 hover:bg-rose-100/90 text-rose-950 font-bold text-xs transition-all active:scale-95 flex items-center justify-between shadow-2xs group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-base group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-md font-extrabold bg-rose-200 text-rose-900 shrink-0 ml-1">
                -{item.defaultPts}đ
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Custom Reason Form */}
      <form onSubmit={handleApplyCustomForm} className="pt-3 border-t border-slate-100">
        <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
          Hoặc tự nhập lý do khác:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder={`Nhập lý do nhắc nhở ${getScopeDisplayName()}...`}
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
            disabled={eligibleStudents.length === 0}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-sm transition-all shrink-0 disabled:opacity-50"
          >
            Trừ -{customPoints || 1}đ
          </button>
        </div>
      </form>

      {/* 6. Fast Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
        >
          Đóng
        </button>
        <button
          type="button"
          disabled={eligibleStudents.length === 0}
          onClick={() => executePenalty('Nhắc nhở nề nếp', 1)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5 shadow-xs disabled:opacity-50"
        >
          <Zap size={14} className="text-amber-400" />
          <span>Trừ nhanh -1đ cho {getScopeDisplayName()}</span>
        </button>
      </div>
    </Modal>
  );
};
