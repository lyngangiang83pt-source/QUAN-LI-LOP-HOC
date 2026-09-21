import { useState, useEffect, useCallback, useMemo } from 'react';
import { ClassItem, Student, AttendanceStatus, FilterType, ToastItem, SyncStatus } from '../types';
import { DEFAULT_CLASSES } from '../constants/classroomData';
import { audioService } from '../services/audioService';
import { triggerGoldStarsCelebration } from '../services/confettiService';
import { SupabaseSyncService } from '../features/supabase-sync/supabaseSyncService';
import { ParsedScoreRow } from '../features/import-export/utils/scoreParser';

const STORAGE_CLASSES = 'CLASSROOM_CLASSES_DATA';
const STORAGE_CURRENT_ID = 'CLASSROOM_CURRENT_CLASS_ID';

export interface UndoRecord {
  id: string;
  description: string;
  previousClasses: ClassItem[];
  previousClassId: string;
  timestamp: number;
}

export const useClassroom = () => {
  const [classes, setClasses] = useState<ClassItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CLASSES);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_CLASSES;
  });

  const [currentClassId, setCurrentClassId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_CURRENT_ID);
      if (savedId) return savedId;
    } catch {
      // Fallback
    }
    return DEFAULT_CLASSES[0].id;
  });

  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [undoRecord, setUndoRecord] = useState<UndoRecord | null>(null);
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('CLASSROOM_ANIMATIONS_ENABLED');
      if (saved !== null) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return true;
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    state: 'idle',
    message: '☁️ Supabase: Đang kết nối...',
  });

  // Current active class
  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === currentClassId) || classes[0] || DEFAULT_CLASSES[0];
  }, [classes, currentClassId]);

  const students = useMemo(() => currentClass.students || [], [currentClass]);

  // Toast helper
  const showToast = useCallback((message: string, type: ToastItem['type'] = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const toggleAnimations = useCallback(() => {
    setAnimationsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('CLASSROOM_ANIMATIONS_ENABLED', JSON.stringify(next));
      if (next) {
        showToast('✨ Đã BẬT đầy đủ hiệu ứng sao bay và pháo hoa rực rỡ!', 'success');
      } else {
        showToast('⚡ Đã BẬT chế độ Siêu nhẹ mượt (Tắt bớt hiệu ứng cho máy yếu)!', 'info');
      }
      return next;
    });
  }, [showToast]);

  // Save to LocalStorage & trigger debounced Supabase Cloud sync
  const persistClasses = useCallback((updatedClasses: ClassItem[], activeId?: string) => {
    setClasses(updatedClasses);
    const targetId = activeId || currentClassId;
    localStorage.setItem(STORAGE_CLASSES, JSON.stringify(updatedClasses));
    localStorage.setItem(STORAGE_CURRENT_ID, targetId);

    const activeCls = updatedClasses.find((c) => c.id === targetId);
    if (activeCls) {
      SupabaseSyncService.triggerDebouncedSync(activeCls, (st) => {
        if (st === 'syncing') {
          setSyncStatus({ state: 'syncing', message: '🔄 Đang lưu lên Supabase...' });
        } else if (st === 'connected') {
          setSyncStatus({ state: 'connected', message: '☁️ Supabase: Đã lưu ✅' });
        } else {
          setSyncStatus({ state: 'error', message: '☁️ Supabase: Ngoại tuyến / RLS' });
        }
      });
    }
  }, [currentClassId]);

  // Startup Sync with Supabase
  useEffect(() => {
    const runStartupSync = async () => {
      setSyncStatus({ state: 'syncing', message: '🔄 Đang nạp từ Supabase...' });
      const remote = await SupabaseSyncService.fetchRemoteData();

      if (remote && remote.length > 0) {
        setClasses(remote);
        localStorage.setItem(STORAGE_CLASSES, JSON.stringify(remote));
        
        const savedCurId = localStorage.getItem(STORAGE_CURRENT_ID);
        if (savedCurId && remote.some((c) => c.id === savedCurId)) {
          setCurrentClassId(savedCurId);
        } else {
          setCurrentClassId(remote[0].id);
          localStorage.setItem(STORAGE_CURRENT_ID, remote[0].id);
        }

        setSyncStatus({ state: 'connected', message: '☁️ Supabase: Đã kết nối ✅' });
        showToast(`Đã đồng bộ ${remote.length} lớp học từ Supabase Cloud! 🚀`, 'success');
      } else if (remote && remote.length === 0) {
        // Supabase is empty, push local data
        await SupabaseSyncService.pushAllData(classes);
        setSyncStatus({ state: 'connected', message: '☁️ Supabase: Đã tải lên đám mây 🚀' });
      } else {
        setSyncStatus({ state: 'error', message: '☁️ Supabase: Cần cấp RLS' });
      }
    };

    runStartupSync();
  }, []);

  // Actions
  const switchClass = useCallback((classId: string, shouldReset = false) => {
    const target = classes.find((c) => c.id === classId);
    if (!target) return;

    setCurrentClassId(classId);
    localStorage.setItem(STORAGE_CURRENT_ID, classId);

    if (shouldReset) {
      const defPts = target.defaultPoints ?? 2;
      const updatedStudents = target.students.map((s) => ({
        ...s,
        attendance: 'present' as AttendanceStatus,
        points: defPts,
        lastNote: `Có mặt ban đầu (+${defPts}đ)`,
      }));

      const updated = classes.map((c) =>
        c.id === classId ? { ...c, students: updatedStudents } : c
      );
      persistClasses(updated, classId);
      showToast(`✨ Đã chọn lớp ${target.name} (${target.students.length} HS) - Điểm số đã reset về ${defPts}đ ban đầu!`, 'success');
    } else {
      showToast(`Đã chuyển sang lớp: ${target.name} (Bảo toàn nguyên vẹn điểm số)`, 'info');
    }
    audioService.play('plus');
  }, [classes, persistClasses, showToast]);

  const addNewClass = useCallback((name: string, subject: string, defaultPoints: number, studentNames: string[]) => {
    const newId = `class_${Date.now()}`;
    const newStudents: Student[] = studentNames.map((sName, idx) => ({
      id: `HS${String(idx + 1).padStart(2, '0')}`,
      name: sName,
      attendance: 'present',
      points: defaultPoints,
      lastNote: `Có mặt ban đầu (+${defaultPoints}đ)`,
    }));

    const newClassObj: ClassItem = {
      id: newId,
      name,
      subject: subject || 'Tin học',
      defaultPoints,
      students: newStudents,
    };

    const updated = [...classes, newClassObj];
    persistClasses(updated, newId);
    setCurrentClassId(newId);
    audioService.play('plus');
    showToast(`🎉 Đã tạo thành công Lớp ${name} (${newStudents.length} học sinh) và chọn dạy ngay!`, 'success');
  }, [classes, persistClasses, showToast]);

  const editClass = useCallback((classId: string, newName: string, newSubject: string) => {
    const updated = classes.map((c) =>
      c.id === classId ? { ...c, name: newName, subject: newSubject } : c
    );
    persistClasses(updated);
    showToast(`Đã cập nhật thông tin lớp: ${newName}`, 'success');
  }, [classes, persistClasses, showToast]);

  const deleteClass = useCallback((classId: string) => {
    if (classes.length <= 1) {
      showToast('Không thể xóa vì đây là lớp duy nhất trong danh sách!', 'danger');
      return;
    }
    const target = classes.find((c) => c.id === classId);
    const updated = classes.filter((c) => c.id !== classId);
    const nextId = currentClassId === classId ? updated[0].id : currentClassId;

    if (target?.dbId) {
      SupabaseSyncService.deleteClassFromDb(target.dbId);
    }

    persistClasses(updated, nextId);
    setCurrentClassId(nextId);
    showToast(`Đã xóa lớp "${target?.name || ''}"!`, 'danger');
  }, [classes, currentClassId, persistClasses, showToast]);

  const saveUndoSnapshot = useCallback((description: string) => {
    setUndoRecord({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      description,
      previousClasses: JSON.parse(JSON.stringify(classes)),
      previousClassId: currentClassId,
      timestamp: Date.now(),
    });
  }, [classes, currentClassId]);

  const undoLastAction = useCallback(() => {
    if (!undoRecord) return;
    const { previousClasses, previousClassId, description } = undoRecord;

    setClasses(previousClasses);
    setCurrentClassId(previousClassId);
    localStorage.setItem(STORAGE_CLASSES, JSON.stringify(previousClasses));
    localStorage.setItem(STORAGE_CURRENT_ID, previousClassId);

    const activeCls = previousClasses.find((c) => c.id === previousClassId);
    if (activeCls) {
      SupabaseSyncService.triggerDebouncedSync(activeCls, (st) => {
        if (st === 'connected') {
          setSyncStatus({ state: 'connected', message: '☁️ Supabase: Đã hoàn tác ✅' });
        }
      });
    }

    setUndoRecord(null);
    audioService.play('plus');
    showToast(`↩️ Đã hoàn tác: "${description}"!`, 'info');
  }, [undoRecord, showToast]);

  const dismissUndo = useCallback(() => {
    setUndoRecord(null);
  }, []);

  const resetClassPoints = useCallback((classId: string) => {
    const target = classes.find((c) => c.id === classId);
    if (!target) return;
    const defPts = target.defaultPoints ?? 2;

    saveUndoSnapshot(`Reset điểm lớp ${target.name} về ${defPts}đ`);

    const updated = classes.map((c) => {
      if (c.id === classId) {
        return {
          ...c,
          students: c.students.map((s) => ({
            ...s,
            attendance: 'present' as AttendanceStatus,
            points: defPts,
            lastNote: `Reset điểm đầu giờ (+${defPts}đ)`,
          })),
        };
      }
      return c;
    });

    persistClasses(updated);
    audioService.play('plus');
    showToast(`Đã reset điểm lớp ${target.name} về ${defPts} điểm ban đầu!`, 'success');
  }, [classes, persistClasses, saveUndoSnapshot, showToast]);

  const toggleAttendance = useCallback((studentId: string, newStatus: AttendanceStatus) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const oldStatus = student.attendance;
    if (oldStatus === newStatus) {
      if (newStatus === 'present' && (student.points || 0) < 2) {
        saveUndoSnapshot(`Cập nhật điểm danh: ${student.name} (2đ)`);
        const updatedStudents = students.map((s) =>
          s.id === studentId ? { ...s, points: 2, lastNote: 'Có mặt (+2đ tích lũy)' } : s
        );
        persistClasses(classes.map((c) => (c.id === currentClassId ? { ...c, students: updatedStudents } : c)));
        audioService.play('plus');
        showToast(`Đã cập nhật: ${student.name} có mặt hiện 2 điểm tích lũy!`, 'success');
      }
      return;
    }

    let pointDiff = 0;
    let note = '';

    if (newStatus === 'present') {
      pointDiff = oldStatus === 'absent' ? 2 : 1;
      note = oldStatus === 'absent' ? 'Có mặt (+2đ chuyên cần)' : 'Có mặt đúng giờ (+1đ bù)';
    } else if (newStatus === 'late') {
      pointDiff = oldStatus === 'present' ? -1 : 1;
      note = oldStatus === 'present' ? 'Chuyển sang đi muộn (-1đ)' : 'Đi muộn (+1đ chuyên cần)';
    } else if (newStatus === 'absent') {
      pointDiff = oldStatus === 'present' ? -2 : -1;
      note = oldStatus === 'present' ? 'Vắng mặt (-2đ chuyên cần)' : 'Vắng mặt (-1đ)';
    }

    let newPts = Math.max(0, (student.points || 0) + pointDiff);
    if (newStatus === 'present' && newPts < 2 && (oldStatus === 'absent' || !oldStatus)) {
      newPts = 2;
    }

    const statusText = newStatus === 'present' ? 'Có mặt (+2đ)' : newStatus === 'late' ? 'Đi muộn (+1đ)' : 'Vắng mặt';
    saveUndoSnapshot(`Điểm danh: ${student.name} ➔ ${statusText}`);

    const updatedStudents = students.map((s) =>
      s.id === studentId ? { ...s, attendance: newStatus, points: newPts, lastNote: note } : s
    );

    if (student.dbId) {
      SupabaseSyncService.logAttendance(student.dbId, newStatus, pointDiff, note);
    }

    persistClasses(classes.map((c) => (c.id === currentClassId ? { ...c, students: updatedStudents } : c)));
    if (pointDiff > 0) audioService.play('plus');
    else if (pointDiff < 0) audioService.play('minus');

    showToast(`Đã điểm danh: ${student.name} ➔ ${statusText}`, pointDiff >= 0 ? 'success' : 'danger');
  }, [classes, currentClassId, persistClasses, saveUndoSnapshot, showToast, students]);

  const updateScore = useCallback((studentId: string, pointDiff: number, reason: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const newPts = Math.max(0, (student.points || 0) + pointDiff);
    const sign = pointDiff > 0 ? '+' : '';
    const note = `${reason} (${sign}${pointDiff}đ)`;

    saveUndoSnapshot(`${student.name}: ${sign}${pointDiff} điểm (${reason})`);

    const updatedStudents = students.map((s) =>
      s.id === studentId ? { ...s, points: newPts, lastNote: note } : s
    );

    if (student.dbId) {
      SupabaseSyncService.logAttendance(student.dbId, student.attendance, pointDiff, reason);
    }

    persistClasses(classes.map((c) => (c.id === currentClassId ? { ...c, students: updatedStudents } : c)));
    if (pointDiff > 0) audioService.play('plus');
    else if (pointDiff < 0) audioService.play('minus');

    showToast(`${pointDiff > 0 ? '🌟' : '⚠️'} ${student.name}: ${sign}${pointDiff} điểm (${reason})`, pointDiff > 0 ? 'success' : 'danger');
  }, [classes, currentClassId, persistClasses, saveUndoSnapshot, showToast, students]);

  const markAllPresent = useCallback(() => {
    saveUndoSnapshot('Điểm danh tất cả học sinh CÓ MẶT (+2đ)');

    const updatedStudents = students.map((s) => {
      if (s.attendance !== 'present') {
        const addPts = s.attendance === 'late' ? 1 : 2;
        return {
          ...s,
          attendance: 'present' as AttendanceStatus,
          points: (s.points || 0) + addPts,
          lastNote: 'Điểm danh có mặt (+2đ chuyên cần)',
        };
      }
      return s;
    });

    persistClasses(classes.map((c) => (c.id === currentClassId ? { ...c, students: updatedStudents } : c)));
    audioService.play('win');
    triggerGoldStarsCelebration();
    showToast('Tất cả học sinh đã có mặt và được cộng 2 điểm chuyên cần! 🌟', 'success');
  }, [classes, currentClassId, persistClasses, saveUndoSnapshot, showToast, students]);

  const setAllDefault2Points = useCallback(() => {
    saveUndoSnapshot('Cấp 2đ tích lũy ban đầu cho cả lớp');

    const updatedStudents = students.map((s) => ({
      ...s,
      attendance: 'present' as AttendanceStatus,
      points: 2,
      lastNote: 'Cấp 2 điểm tích lũy ban đầu',
    }));

    persistClasses(classes.map((c) => (c.id === currentClassId ? { ...c, students: updatedStudents } : c)));
    audioService.play('plus');
    showToast('Đã cấp 2 điểm tích lũy ban đầu cho toàn bộ học sinh trong lớp! 🌟', 'success');
  }, [classes, currentClassId, persistClasses, saveUndoSnapshot, showToast, students]);

  const addAllClassBonus = useCallback((bonusPts: number = 2, reason: string = 'Thưởng cả lớp') => {
    const eligibleStudents = students.filter((s) => s.attendance === 'present' || s.attendance === 'late');
    const absentStudents = students.filter((s) => s.attendance === 'absent');

    if (eligibleStudents.length === 0) {
      showToast('⚠️ Không có học sinh nào đang Có mặt hoặc Đi muộn để cộng điểm thưởng!', 'danger');
      return;
    }

    saveUndoSnapshot(`Cộng +${bonusPts}đ cho ${eligibleStudents.length} HS có mặt/muộn (${reason})`);

    const updatedStudents = students.map((s) => {
      if (s.attendance === 'present' || s.attendance === 'late') {
        return {
          ...s,
          points: Math.max(0, (s.points || 0) + bonusPts),
          lastNote: `${reason} (+${bonusPts}đ)`,
        };
      }
      return s;
    });

    persistClasses(classes.map((c) => (c.id === currentClassId ? { ...c, students: updatedStudents } : c)));
    audioService.play('win');
    triggerGoldStarsCelebration();

    if (absentStudents.length > 0) {
      showToast(`🎉 Đã cộng +${bonusPts}đ cho ${eligibleStudents.length} học sinh Có mặt/Muộn (Đã bỏ qua ${absentStudents.length} học sinh Vắng)! ⭐`, 'success');
    } else {
      showToast(`🎉 Đã cộng +${bonusPts} điểm thưởng cho ${eligibleStudents.length} học sinh trong lớp (${reason})! ⭐`, 'success');
    }
  }, [classes, currentClassId, persistClasses, saveUndoSnapshot, showToast, students]);

  const addStudent = useCallback((name: string) => {
    if (!name || !name.trim()) return;
    const nextId = `HS${String(students.length + 1).padStart(2, '0')}`;
    const newStudent: Student = {
      id: nextId,
      name: name.trim(),
      attendance: 'present',
      points: 2,
      lastNote: 'Có mặt ban đầu (+2đ chuyên cần)',
    };

    saveUndoSnapshot(`Thêm học sinh ${name.trim()}`);

    const updatedStudents = [...students, newStudent];
    persistClasses(classes.map((c) => (c.id === currentClassId ? { ...c, students: updatedStudents } : c)));
    audioService.play('plus');
    showToast(`Đã thêm học sinh: ${name.trim()} (+2đ có mặt ban đầu)`, 'success');
  }, [classes, currentClassId, persistClasses, saveUndoSnapshot, showToast, students]);

  const resetStudentScore = useCallback((studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    saveUndoSnapshot(`Reset điểm em ${student.name} về 2đ ban đầu`);

    const updatedStudents = students.map((s) =>
      s.id === studentId
        ? {
            ...s,
            points: 2,
            lastNote: 'Đặt lại (reset) điểm về 2đ ban đầu',
          }
        : s
    );

    if (student.dbId) {
      SupabaseSyncService.logAttendance(student.dbId, student.attendance, 2 - (student.points || 0), 'Reset điểm về 2đ ban đầu');
    }

    persistClasses(classes.map((c) => (c.id === currentClassId ? { ...c, students: updatedStudents } : c)));
    audioService.play('plus');
    showToast(`Đã reset điểm của em ${student.name} (${student.id}) về 2 điểm ban đầu! 🔄`, 'info');
  }, [classes, currentClassId, persistClasses, saveUndoSnapshot, showToast, students]);

  const deleteStudent = useCallback((studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    saveUndoSnapshot(`Xóa học sinh ${student.name}`);

    const updatedStudents = students.filter((s) => s.id !== studentId);
    persistClasses(classes.map((c) => (c.id === currentClassId ? { ...c, students: updatedStudents } : c)));
    showToast(`Đã xóa học sinh ${student.name}`, 'danger');
  }, [classes, currentClassId, persistClasses, saveUndoSnapshot, showToast, students]);

  const importStudents = useCallback((names: string[], mode: 'replace' | 'append') => {
    const defPts = currentClass.defaultPoints ?? 2;
    let newStudentList: Student[] = [];

    saveUndoSnapshot(`Nạp danh sách ${names.length} học sinh lớp ${currentClass.name}`);

    if (mode === 'replace') {
      newStudentList = names.map((sName, idx) => ({
        id: `HS${String(idx + 1).padStart(2, '0')}`,
        name: sName,
        attendance: 'present' as AttendanceStatus,
        points: defPts,
        lastNote: `Nạp danh sách mới (+${defPts}đ)`,
      }));
    } else {
      const existing = [...students];
      const startIdx = existing.length;
      const appended: Student[] = names.map((sName, idx) => ({
        id: `HS${String(startIdx + idx + 1).padStart(2, '0')}`,
        name: sName,
        attendance: 'present' as AttendanceStatus,
        points: defPts,
        lastNote: `Thêm nối tiếp (+${defPts}đ)`,
      }));
      newStudentList = [...existing, ...appended];
    }

    persistClasses(classes.map((c) => (c.id === currentClassId ? { ...c, students: newStudentList } : c)));
    audioService.play('plus');
    showToast(`🎉 Đã nạp thành công ${names.length} học sinh vào lớp ${currentClass.name}!`, 'success');
  }, [classes, currentClass, currentClassId, persistClasses, saveUndoSnapshot, showToast, students]);

  const importScores = useCallback((rows: ParsedScoreRow[], mode: 'override' | 'add') => {
    let updatedCount = 0;

    saveUndoSnapshot(`Nạp bảng điểm cho lớp ${currentClass.name}`);

    const updatedStudents = students.map((s) => {
      const matchedRow = rows.find((r) => {
        if (r.code && s.id.toLowerCase() === r.code.toLowerCase()) return true;
        if (r.name && s.name.trim().toLowerCase() === r.name.trim().toLowerCase()) return true;
        return false;
      });

      if (matchedRow) {
        updatedCount++;
        const newScore = mode === 'override'
          ? matchedRow.score
          : Math.max(0, (s.points || 0) + matchedRow.score);

        const pointDiff = mode === 'override' ? newScore - (s.points || 0) : matchedRow.score;
        const note = mode === 'override'
          ? `Nạp file điểm mới (${matchedRow.score}đ)`
          : `Nạp cộng dồn điểm (+${matchedRow.score}đ)`;

        if (s.dbId) {
          SupabaseSyncService.logAttendance(s.dbId, s.attendance, pointDiff, note);
        }

        return {
          ...s,
          points: newScore,
          lastNote: note,
        };
      }
      return s;
    });

    persistClasses(classes.map((c) => (c.id === currentClassId ? { ...c, students: updatedStudents } : c)));
    audioService.play('plus');
    showToast(
      `🎉 Đã nạp và cập nhật điểm thành công cho ${updatedCount} học sinh trong lớp ${currentClass.name}!`,
      'success'
    );
  }, [classes, currentClass.name, currentClassId, persistClasses, saveUndoSnapshot, showToast, students]);

  const manualSync = useCallback(async () => {
    const choice = window.confirm(
      'Thao tác đồng bộ với Supabase Cloud:\n\n- Bấm [OK]: Đẩy dữ liệu lớp học hiện tại lên Supabase Cloud (Lưu trữ)\n- Bấm [Hủy / Cancel]: Tải dữ liệu mới nhất từ Supabase Cloud về máy'
    );

    if (choice) {
      setSyncStatus({ state: 'syncing', message: '🔄 Đang lưu...' });
      const ok = await SupabaseSyncService.pushAllData(classes);
      if (ok) {
        setSyncStatus({ state: 'connected', message: '☁️ Supabase: Đã lưu ✅' });
        showToast('Đã lưu toàn bộ dữ liệu lên Supabase Cloud thành công!', 'success');
      } else {
        setSyncStatus({ state: 'error', message: '☁️ Supabase: Cần cấp RLS' });
        showToast('Lỗi khi lưu lên Supabase (Vui lòng kiểm tra RLS Policy)!', 'danger');
      }
    } else {
      setSyncStatus({ state: 'syncing', message: '🔄 Đang nạp...' });
      const remote = await SupabaseSyncService.fetchRemoteData();
      if (remote && remote.length > 0) {
        setClasses(remote);
        localStorage.setItem(STORAGE_CLASSES, JSON.stringify(remote));
        const savedCurId = localStorage.getItem(STORAGE_CURRENT_ID);
        if (savedCurId && remote.some((c) => c.id === savedCurId)) {
          setCurrentClassId(savedCurId);
        } else {
          setCurrentClassId(remote[0].id);
          localStorage.setItem(STORAGE_CURRENT_ID, remote[0].id);
        }
        setSyncStatus({ state: 'connected', message: '☁️ Supabase: Đã kết nối ✅' });
        showToast('Đã tải và đồng bộ thành công dữ liệu từ Supabase Cloud!', 'success');
      } else {
        setSyncStatus({ state: 'error', message: '☁️ Supabase: Ngoại tuyến / RLS' });
      }
    }
  }, [classes, showToast]);

  return {
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
    undoRecord,
    undoLastAction,
    dismissUndo,
    animationsEnabled,
    toggleAnimations,
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
    setAllDefault2Points,
    addAllClassBonus,
    addStudent,
    deleteStudent,
    importStudents,
    importScores,
    manualSync,
  };
};
