import React from 'react';
import { Student, AttendanceStatus } from '../../../types';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  minWheelPoints?: number;
  onToggleAttendance: (id: string, status: AttendanceStatus) => void;
  onOpenScoreModal: (student: Student, type: 'plus' | 'minus') => void;
  onDeleteStudent: (id: string) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  minWheelPoints = 5,
  onToggleAttendance,
  onOpenScoreModal,
  onDeleteStudent,
}) => {
  const isQualified = (student.points || 0) >= minWheelPoints;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm hover:shadow-soft-md transition-all duration-200 p-4 flex flex-col justify-between relative group overflow-hidden">
      {/* Top Banner Tag if Qualified */}
      {isQualified && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-pink-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-bl-xl shadow-xs">
          🎡 Đủ đk quay
        </div>
      )}

      <div>
        {/* Header: Name & Red Bold Code */}
        <div className="flex items-start justify-between gap-2 pr-6">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base leading-tight">
              {student.name}
            </h3>
            {/* Red bold student code in parentheses */}
            <div className="text-xs text-rose-600 font-extrabold mt-0.5">
              (Mã: {student.id})
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Thầy/Cô có muốn xóa học sinh "${student.name}" không?`)) {
                onDeleteStudent(student.id);
              }
            }}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity p-1 rounded-md"
            title="Xóa học sinh"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Attendance Toggle Buttons */}
        <div className="grid grid-cols-3 gap-1.5 mt-3.5">
          <button
            type="button"
            onClick={() => onToggleAttendance(student.id, 'present')}
            className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all ${
              student.attendance === 'present'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ✅ Có mặt
          </button>
          <button
            type="button"
            onClick={() => onToggleAttendance(student.id, 'late')}
            className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all ${
              student.attendance === 'late'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ⏰ Muộn
          </button>
          <button
            type="button"
            onClick={() => onToggleAttendance(student.id, 'absent')}
            className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all ${
              student.attendance === 'absent'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ❌ Vắng
          </button>
        </div>
      </div>

      {/* Footer: Score Pill & Fast Plus/Minus */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-extrabold text-sky-700">
            {student.points > 0 ? '+' : ''}{student.points}
          </span>
          <span className="text-amber-400 text-sm">⭐</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenScoreModal(student, 'plus')}
            className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 transition-all font-bold flex items-center justify-center active:scale-95 shadow-xs"
            title="Cộng điểm thưởng"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            onClick={() => onOpenScoreModal(student, 'minus')}
            className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 transition-all font-bold flex items-center justify-center active:scale-95 shadow-xs"
            title="Trừ điểm nhắc nhở"
          >
            <Minus size={16} />
          </button>
        </div>
      </div>

      {/* Last Note / Reason */}
      {student.lastNote && (
        <div className="text-[11px] text-slate-500 font-medium truncate mt-1.5" title={student.lastNote}>
          📝 {student.lastNote}
        </div>
      )}
    </div>
  );
};
