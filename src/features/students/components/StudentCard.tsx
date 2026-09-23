import React, { useState, useEffect, useRef } from 'react';
import { Student, AttendanceStatus } from '../../../types';
import { Plus, Minus, Trash2, RotateCcw } from 'lucide-react';
import { FloatingStarsEffect } from './FloatingStarsEffect';
import { audioService } from '../../../services/audioService';

interface StudentCardProps {
  student: Student;
  minWheelPoints?: number;
  animationsEnabled?: boolean;
  onToggleAttendance: (id: string, status: AttendanceStatus) => void;
  onOpenScoreModal: (student: Student, type: 'plus' | 'minus') => void;
  onResetStudentScore: (id: string) => void;
  onDeleteStudent: (id: string) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  minWheelPoints = 18,
  animationsEnabled = true,
  onToggleAttendance,
  onOpenScoreModal,
  onResetStudentScore,
  onDeleteStudent,
}) => {
  const isQualified = (student.points || 0) >= minWheelPoints;

  const [starAnimKey, setStarAnimKey] = useState<number>(0);
  const [pointDiff, setPointDiff] = useState<number>(0);
  const [isGlowing, setIsGlowing] = useState<boolean>(false);
  const [isMilestoneReached, setIsMilestoneReached] = useState<boolean>(false);
  const prevPointsRef = useRef<number>(student.points || 0);

  useEffect(() => {
    const currentPoints = student.points || 0;
    const prevPoints = prevPointsRef.current;
    const diff = currentPoints - prevPoints;

    if (diff > 0) {
      const reachedMilestone = prevPoints < minWheelPoints && currentPoints >= minWheelPoints;

      setPointDiff(diff);

      if (animationsEnabled) {
        setStarAnimKey((prev) => prev + 1);
        setIsGlowing(true);
        setIsMilestoneReached(reachedMilestone);

        if (reachedMilestone) {
          audioService.play('win');
        }

        const animDuration = reachedMilestone ? 3200 : 1800;
        const timer = setTimeout(() => {
          setIsGlowing(false);
          setIsMilestoneReached(false);
        }, animDuration);

        return () => clearTimeout(timer);
      }
    }
    prevPointsRef.current = currentPoints;
  }, [student.points, minWheelPoints, animationsEnabled]);

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-300 p-4 flex flex-col justify-between relative group overflow-visible ${
        isMilestoneReached && animationsEnabled
          ? 'animate-milestoneCrownCardGlow ring-4 ring-amber-400 border-amber-400 shadow-2xl scale-[1.04] z-30'
          : isGlowing && animationsEnabled
          ? 'animate-goldCardGlow ring-2 ring-amber-400 border-amber-300 shadow-lg scale-[1.02] z-20'
          : 'border-slate-200/80 shadow-soft-sm hover:shadow-soft-md'
      }`}
    >
      {/* Flying Gold Stars & Milestone Giant Golden Crown Celebration Effect Layer */}
      {animationsEnabled && (
        <FloatingStarsEffect
          key={starAnimKey}
          pointGain={pointDiff}
          isActive={isGlowing}
          isMilestoneReached={isMilestoneReached}
        />
      )}

      {/* Top Banner Tag if Qualified */}
      {isQualified && (
        <div
          className={`absolute top-0 right-0 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl rounded-tr-2xl shadow-xs transition-all ${
            isMilestoneReached
              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 scale-110 shadow-lg ring-2 ring-amber-300'
              : 'bg-gradient-to-l from-purple-600 to-pink-600 text-white'
          }`}
        >
          {isMilestoneReached ? '👑 ĐỦ ĐK QUAY! 🎉' : '🎡 Đủ đk quay'}
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

      {/* Footer: Score Pill, Reset Button & Fast Plus/Minus */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Left: Score Badge & Dedicated Reset Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xl font-extrabold text-sky-700">
              {student.points > 0 ? '+' : ''}{student.points}
            </span>
            <span className="text-amber-400 text-sm">⭐</span>
          </div>

          {/* Nút Reset riêng từng thẻ học sinh */}
          <button
            type="button"
            onClick={() => {
              if (confirm(`Thầy/Cô có chắc chắn muốn đặt lại (reset) điểm của em "${student.name}" (Mã: ${student.id}) về 2 điểm ban đầu không?`)) {
                onResetStudentScore(student.id);
              }
            }}
            className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white border border-amber-200 hover:border-amber-400 text-[11px] font-extrabold transition-all flex items-center gap-1 shadow-2xs active:scale-95"
            title={`Đặt lại (reset) điểm của em ${student.name} về 2 điểm ban đầu`}
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>

        {/* Right: Plus / Minus */}
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
