import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Student, AttendanceStatus } from '../../../types';
import { 
  Hash, 
  Search, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Sparkles, 
  ExternalLink,
  RotateCcw
} from 'lucide-react';


interface FindStudentByCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  className: string;
  minWheelPoints?: number;
  onToggleAttendance: (id: string, status: AttendanceStatus) => void;
  onApplyScore: (studentId: string, pointDiff: number, reason: string) => void;
  onOpenDetailedScoreModal: (student: Student, type: 'plus' | 'minus') => void;
  onResetScore?: (studentId: string) => void;
  onLocateStudent?: (studentId: string) => void;
}

export const FindStudentByCodeModal: React.FC<FindStudentByCodeModalProps> = ({
  isOpen,
  onClose,
  students,
  className,
  minWheelPoints = 5,
  onToggleAttendance,
  onApplyScore,
  onOpenDetailedScoreModal,
  onResetScore,
  onLocateStudent,
}) => {
  const [codeQuery, setCodeQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setCodeQuery('');
      if (students.length > 0) {
        setSelectedStudentId(students[0].id);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, students]);

  // Filtered students by student code query (flexible matching: "1" -> "HS01", "HS1", "1")
  const matchedStudents = useMemo(() => {
    if (!codeQuery.trim()) return students;
    const cleanQ = codeQuery.trim().toLowerCase();
    const numericQ = cleanQ.replace(/\D/g, '');
    
    return students.filter((s) => {
      const studentCode = s.id.toLowerCase();
      const studentName = s.name.toLowerCase();
      const codeDigits = s.id.replace(/\D/g, '');

      // Direct code match (e.g. HS01)
      if (studentCode.includes(cleanQ)) return true;
      
      // Name match
      if (studentName.includes(cleanQ)) return true;

      // Numeric match (e.g. typing "1" or "01" matches "HS01")
      if (numericQ && codeDigits) {
        if (codeDigits === numericQ || Number(codeDigits) === Number(numericQ)) {
          return true;
        }
      }

      return false;
    });
  }, [students, codeQuery]);

  // If query changed and current selected student is not in matched list, auto-select first match
  useEffect(() => {
    if (matchedStudents.length > 0) {
      if (!selectedStudentId || !matchedStudents.some((s) => s.id === selectedStudentId)) {
        setSelectedStudentId(matchedStudents[0].id);
      }
    } else {
      setSelectedStudentId(null);
    }
  }, [matchedStudents, selectedStudentId]);

  // Current active student
  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || matchedStudents[0] || null;
  }, [students, selectedStudentId, matchedStudents]);

  if (!isOpen) return null;

  const handleQuickAddScore = (pts: number, label: string) => {
    if (!activeStudent) return;
    onApplyScore(activeStudent.id, pts, label);
  };

  const handleLocateAndClose = (student: Student) => {
    if (onLocateStudent) {
      onLocateStudent(student.id);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <Hash size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-base">Tìm Học Sinh Theo Mã</span>
              <span className="text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full">
                Lớp {className}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              Tra cứu nhanh mã học sinh, điểm danh và chấm điểm tức thì
            </p>
          </div>
        </div>
      }
      headerTheme="primary"
      maxWidth="max-w-2xl"
    >
      {/* Code Search Input */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600 flex items-center gap-1 font-extrabold text-xs bg-sky-50 px-2 py-1 rounded-md border border-sky-200">
            <Hash size={13} />
            <span>Mã</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={codeQuery}
            onChange={(e) => setCodeQuery(e.target.value)}
            placeholder="Nhập số thứ tự hoặc mã (VD: 1, 01, HS01, hoặc tên)..."
            className="w-full pl-20 pr-10 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none text-sm font-bold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-normal"
          />
          {codeQuery && (
            <button
              type="button"
              onClick={() => setCodeQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-100 hover:bg-slate-200 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Quick Code Chips Matrix */}
      <div className="mb-4 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <span>Danh sách mã ({matchedStudents.length}/{students.length} em)</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Bấm mã để chọn nhanh</span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
          {matchedStudents.map((s) => {
            const isSelected = activeStudent?.id === s.id;
            const isQualified = (s.points || 0) >= minWheelPoints;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedStudentId(s.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1 active:scale-95 shadow-2xs ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-300 scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span className={isSelected ? 'text-white' : 'text-rose-600'}>{s.id}</span>
                <span className="max-w-[80px] truncate text-[11px] font-medium opacity-90">
                  {s.name.split(' ').slice(-1)[0]}
                </span>
                {isQualified && <span className="text-[10px]">⭐</span>}
              </button>
            );
          })}
          {matchedStudents.length === 0 && (
            <div className="w-full text-center py-4 text-xs font-bold text-slate-400">
              Không tìm thấy học sinh có mã hoặc tên này.
            </div>
          )}
        </div>
      </div>

      {/* Active Student Spotlight Card */}
      {activeStudent ? (
        <div className="bg-white rounded-2xl border-2 border-sky-100 shadow-soft-sm overflow-hidden">
          {/* Spotlight Header */}
          <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-600 text-white p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-xl text-white border border-white/30 shadow-inner">
                {activeStudent.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black tracking-tight">{activeStudent.name}</h3>
                  <span className="bg-white text-rose-600 px-2.5 py-0.5 rounded-lg text-xs font-black shadow-xs">
                    Mã: {activeStudent.id}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs font-semibold text-sky-100">
                  <span>Trạng thái:</span>
                  <span className="font-bold">
                    {activeStudent.attendance === 'present' && '✅ Có mặt'}
                    {activeStudent.attendance === 'late' && '⏰ Đi muộn'}
                    {activeStudent.attendance === 'absent' && '❌ Vắng mặt'}
                  </span>
                  {activeStudent.points >= minWheelPoints && (
                    <span className="bg-amber-400/20 text-amber-200 border border-amber-300/30 px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-0.5">
                      <Sparkles size={10} /> Đủ đk quay
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Score Display */}
            <div className="bg-white/15 backdrop-blur-xs px-4 py-2 rounded-2xl border border-white/20 text-center flex flex-col items-center justify-center">
              <div className="text-[10px] uppercase font-bold text-sky-100 tracking-wider">Điểm số</div>
              <div className="text-2xl font-black text-amber-300 flex items-center justify-center gap-1">
                <span>{activeStudent.points > 0 ? `+${activeStudent.points}` : activeStudent.points}</span>
                <span className="text-lg">⭐</span>
              </div>
              {onResetScore && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Thầy/Cô có muốn đặt lại (reset) điểm của em "${activeStudent.name}" về 2 điểm ban đầu không?`)) {
                      onResetScore(activeStudent.id);
                    }
                  }}
                  className="mt-1 px-2 py-0.5 rounded-lg bg-black/20 hover:bg-amber-600/80 text-white text-[10px] font-extrabold flex items-center gap-1 transition-colors"
                  title="Reset điểm về 2đ ban đầu"
                >
                  <RotateCcw size={10} />
                  <span>Reset 2đ</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="p-4 space-y-4">
            {/* Action Group 1: Fast Attendance */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1.5">
                1. Điểm danh nhanh:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onToggleAttendance(activeStudent.id, 'present')}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                    activeStudent.attendance === 'present'
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <CheckCircle2 size={15} />
                  <span>Có mặt</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleAttendance(activeStudent.id, 'late')}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                    activeStudent.attendance === 'late'
                      ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <Clock size={15} />
                  <span>Đi muộn</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleAttendance(activeStudent.id, 'absent')}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                    activeStudent.attendance === 'absent'
                      ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-300'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  <XCircle size={15} />
                  <span>Vắng mặt</span>
                </button>
              </div>
            </div>

            {/* Action Group 2: Quick Score + Detailed Score */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1.5">
                2. Chấm điểm nhanh:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Fast Plus Points */}
                <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200 flex flex-col gap-2">
                  <div className="text-[11px] font-extrabold text-emerald-800 flex items-center gap-1">
                    <Plus size={13} />
                    <span>Cộng điểm thưởng</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickAddScore(1, 'Hăng hái phát biểu')}
                      className="py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-transform active:scale-95 shadow-2xs"
                    >
                      +1 ⭐
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddScore(2, 'Làm bài xuất sắc')}
                      className="py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-transform active:scale-95 shadow-2xs"
                    >
                      +2 🌟
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddScore(5, 'Thành tích nổi bật')}
                      className="py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs transition-transform active:scale-95 shadow-2xs"
                    >
                      +5 🎯
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenDetailedScoreModal(activeStudent, 'plus');
                      onClose();
                    }}
                    className="w-full py-1 text-center text-[11px] font-extrabold text-emerald-700 hover:underline"
                  >
                    Tiêu chí cộng chi tiết ➔
                  </button>
                </div>

                {/* Fast Minus Points */}
                <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-200 flex flex-col gap-2">
                  <div className="text-[11px] font-extrabold text-rose-800 flex items-center gap-1">
                    <Minus size={13} />
                    <span>Trừ điểm nhắc nhở</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickAddScore(-1, 'Mất trật tự')}
                      className="py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-transform active:scale-95 shadow-2xs"
                    >
                      -1 ⚠️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddScore(-2, 'Không làm bài')}
                      className="py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-transform active:scale-95 shadow-2xs"
                    >
                      -2 ❌
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenDetailedScoreModal(activeStudent, 'minus');
                      onClose();
                    }}
                    className="w-full py-1 text-center text-[11px] font-extrabold text-rose-700 hover:underline"
                  >
                    Tiêu chí trừ chi tiết ➔
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Note / Reason */}
            {activeStudent.lastNote && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <div className="truncate font-medium">
                  📝 <strong className="text-slate-700">Lần chấm gần nhất:</strong> {activeStudent.lastNote}
                </div>
              </div>
            )}

            {/* Action Group 3: Locate on Main List, Drive Folder & Close */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLocateAndClose(activeStudent)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-bold text-xs transition-colors flex items-center gap-1.5 border border-slate-200"
                >
                  <ExternalLink size={14} />
                  <span>Xem trên danh sách</span>
                </button>
              </div>


              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
