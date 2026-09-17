import React from 'react';
import { Student, AttendanceStatus, FilterType } from '../../../types';
import { StudentCard } from './StudentCard';
import { FolderUp, UserPlus } from 'lucide-react';

interface StudentGridProps {
  students: Student[];
  currentFilter: FilterType;
  searchQuery: string;
  minWheelPoints?: number;
  onToggleAttendance: (id: string, status: AttendanceStatus) => void;
  onOpenScoreModal: (student: Student, type: 'plus' | 'minus') => void;
  onResetStudentScore: (id: string) => void;
  onDeleteStudent: (id: string) => void;
  onOpenImportModal: () => void;
  onOpenAddModal: () => void;
}

export const StudentGrid: React.FC<StudentGridProps> = ({
  students,
  currentFilter,
  searchQuery,
  minWheelPoints = 5,
  onToggleAttendance,
  onOpenScoreModal,
  onResetStudentScore,
  onDeleteStudent,
  onOpenImportModal,
  onOpenAddModal,
}) => {
  // Filter & Search Logic
  const filteredStudents = React.useMemo(() => {
    let list = [...students];

    if (currentFilter === 'top') {
      list.sort((a, b) => (b.points || 0) - (a.points || 0));
    } else if (currentFilter === 'present') {
      list = list.filter((s) => s.attendance === 'present');
    } else if (currentFilter === 'qualified') {
      list = list.filter((s) => (s.points || 0) >= minWheelPoints);
    } else if (currentFilter === 'absent') {
      list = list.filter((s) => s.attendance === 'absent');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
      );
    }

    return list;
  }, [students, currentFilter, searchQuery, minWheelPoints]);

  if (filteredStudents.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center flex flex-col items-center justify-center gap-3 shadow-soft-sm">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
          🔍
        </div>
        <p className="text-base font-bold text-slate-800">
          Chưa có học sinh nào phù hợp với bộ lọc hiện tại
        </p>
        <p className="text-xs text-slate-500 max-w-md">
          Thầy/Cô hãy thử tìm kiếm tên khác hoặc bấm nút bên dưới để thêm học sinh vào lớp nhé!
        </p>
        <div className="flex gap-2.5 mt-2">
          <button
            type="button"
            onClick={onOpenImportModal}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <FolderUp size={15} />
            <span>Nạp danh sách</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <UserPlus size={15} />
            <span>Thêm 1 em</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
      {filteredStudents.map((s) => (
        <StudentCard
          key={s.id}
          student={s}
          minWheelPoints={minWheelPoints}
          onToggleAttendance={onToggleAttendance}
          onOpenScoreModal={onOpenScoreModal}
          onResetStudentScore={onResetStudentScore}
          onDeleteStudent={onDeleteStudent}
        />
      ))}
    </div>
  );
};
