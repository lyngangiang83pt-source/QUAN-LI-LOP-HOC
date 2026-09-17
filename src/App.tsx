import React, { useState } from 'react';
import { useClassroom } from './hooks/useClassroom';
import { HeaderBanner } from './components/layout/HeaderBanner';
import { ControlsBar } from './components/layout/ControlsBar';
import { StudentGrid } from './features/students/components/StudentGrid';
import { PodiumTop3Banner } from './features/leaderboard/components/PodiumTop3Banner';
import { ToastContainer } from './components/common/ToastContainer';
import { ClassManagerModal } from './features/classroom/components/ClassManagerModal';
import { LuckyWheelModal } from './features/lucky-wheel/components/LuckyWheelModal';
import { LeaderboardModal } from './features/leaderboard/components/LeaderboardModal';
import { ImportModal } from './features/import-export/components/ImportModal';
import { AddStudentModal } from './features/students/components/AddStudentModal';
import { ScoreModal } from './features/students/components/ScoreModal';
import { FindStudentByCodeModal } from './features/students/components/FindStudentByCodeModal';
import { SupabaseConfigModal } from './features/supabase-sync/components/SupabaseConfigModal';
import { exportStudentsToCSV } from './features/import-export/utils/csvExporter';
import { Student } from './types';

export const App: React.FC = () => {
  const {
    classes,
    currentClassId,
    currentClass,
    students,
    currentFilter,
    setCurrentFilter,
    searchQuery,
    setSearchQuery,
    toasts,
    showToast,
    syncStatus,
    switchClass,
    addNewClass,
    editClass,
    deleteClass,
    resetClassPoints,
    resetStudentScore,
    toggleAttendance,
    updateScore,
    markAllPresent,
    resetDayAttendance,
    setAllDefault2Points,
    addStudent,
    deleteStudent,
    importStudents,
    manualSync,
  } = useClassroom();

  // Modal Visibility States
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isFindCodeModalOpen, setIsFindCodeModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [scoreModalData, setScoreModalData] = useState<{
    student: Student | null;
    mode: 'plus' | 'minus';
  }>({ student: null, mode: 'plus' });

  const handleOpenScoreModal = (student: Student, mode: 'plus' | 'minus') => {
    setScoreModalData({ student, mode });
  };

  const handleCloseScoreModal = () => {
    setScoreModalData({ student: null, mode: 'plus' });
  };

  const handleEditClassInfo = () => {
    const newName = prompt('Nhập tên lớp mới:', currentClass.name);
    if (newName && newName.trim()) {
      const newSubject = prompt('Nhập tên môn học:', currentClass.subject || 'Tin học');
      editClass(currentClassId, newName.trim(), newSubject?.trim() || 'Tin học');
    }
  };

  const handleExportCSV = () => {
    exportStudentsToCSV(students, currentClass.name);
    showToast('Đã xuất file bảng điểm xếp hạng Excel thành công! 📥', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 md:py-6">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />

      {/* Header with Mascot Hero Banner */}
      <HeaderBanner
        classes={classes}
        currentClassId={currentClassId}
        currentClass={currentClass}
        students={students}
        syncStatus={syncStatus}
        minWheelPoints={5}
        onSelectClass={(id) => switchClass(id, false)}
        onOpenClassModal={() => setIsClassModalOpen(true)}
        onEditClassInfo={handleEditClassInfo}
        onOpenWheelModal={() => setIsWheelModalOpen(true)}
        onOpenLeaderboardModal={() => {
          setCurrentFilter('top');
          setIsLeaderboardModalOpen(true);
        }}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onMarkAllPresent={markAllPresent}
        onSetAllDefault2Points={setAllDefault2Points}
        onExportCSV={handleExportCSV}
        onResetDayAttendance={resetDayAttendance}
        onManualSync={manualSync}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onShowToast={showToast}
      />

      {/* Controls & Filter Bar */}
      <ControlsBar
        currentFilter={currentFilter}
        searchQuery={searchQuery}
        minWheelPoints={5}
        onSetFilter={setCurrentFilter}
        onSearchChange={setSearchQuery}
        onOpenWheelModal={() => setIsWheelModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenAddModal={() => setIsAddStudentModalOpen(true)}
        onOpenFindCodeModal={() => setIsFindCodeModalOpen(true)}
      />

      {/* Podium Top 3 Banner (Visible when Top filter is active) */}
      {currentFilter === 'top' && students.length > 0 && (
        <PodiumTop3Banner
          students={students}
          onOpenLeaderboardModal={() => setIsLeaderboardModalOpen(true)}
        />
      )}

      {/* Student Cards Grid */}
      <StudentGrid
        students={students}
        currentFilter={currentFilter}
        searchQuery={searchQuery}
        minWheelPoints={5}
        onToggleAttendance={toggleAttendance}
        onOpenScoreModal={handleOpenScoreModal}
        onResetStudentScore={resetStudentScore}
        onDeleteStudent={deleteStudent}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenAddModal={() => setIsAddStudentModalOpen(true)}
      />

      {/* --- ALL MODALS --- */}
      <FindStudentByCodeModal
        isOpen={isFindCodeModalOpen}
        onClose={() => setIsFindCodeModalOpen(false)}
        students={students}
        className={currentClass.name}
        minWheelPoints={5}
        onToggleAttendance={toggleAttendance}
        onApplyScore={updateScore}
        onResetScore={resetStudentScore}
        onOpenDetailedScoreModal={handleOpenScoreModal}
        onLocateStudent={(studentId) => {
          setSearchQuery(studentId);
          showToast(`Đã lọc hiển thị học sinh mã ${studentId} 🔍`, 'info');
        }}
      />

      <ClassManagerModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        classes={classes}
        currentClassId={currentClassId}
        onSwitchClass={switchClass}
        onAddNewClass={addNewClass}
        onEditClass={editClass}
        onDeleteClass={deleteClass}
        onResetPoints={resetClassPoints}
      />

      <LuckyWheelModal
        isOpen={isWheelModalOpen}
        onClose={() => setIsWheelModalOpen(false)}
        students={students}
        onApplyBonusScore={updateScore}
      />

      <LeaderboardModal
        isOpen={isLeaderboardModalOpen}
        onClose={() => setIsLeaderboardModalOpen(false)}
        students={students}
        className={currentClass.name}
        minWheelPoints={5}
        onOpenWheelModal={() => setIsWheelModalOpen(true)}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportStudents={importStudents}
      />

      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onAddStudent={addStudent}
      />

      <ScoreModal
        isOpen={!!scoreModalData.student}
        onClose={handleCloseScoreModal}
        student={scoreModalData.student}
        mode={scoreModalData.mode}
        onApplyScore={updateScore}
        onResetScore={resetStudentScore}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        classes={classes}
        onReloadData={manualSync}
        onShowToast={showToast}
      />
    </div>
  );
};
