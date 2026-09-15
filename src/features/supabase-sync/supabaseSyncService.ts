import { supabase } from './supabaseClient';
import { ClassItem, Student } from '../../types';

export class SupabaseSyncService {
  private static debounceTimer: NodeJS.Timeout | null = null;

  // 1. Tải toàn bộ danh sách lớp và học sinh từ Supabase
  public static async fetchRemoteData(): Promise<ClassItem[] | null> {
    const client = supabase;
    if (!client) return null;

    try {
      const { data: remoteClasses, error: classErr } = await client
        .from('classes')
        .select('*')
        .order('id', { ascending: true });

      if (classErr) throw classErr;
      if (!remoteClasses || remoteClasses.length === 0) return [];

      const { data: remoteStudents, error: stuErr } = await client
        .from('students')
        .select('*')
        .order('id', { ascending: true });

      if (stuErr) throw stuErr;

      const mergedClasses: ClassItem[] = remoteClasses.map((rc) => {
        const classStudents: Student[] = (remoteStudents || [])
          .filter((rs) => rs.class_id === rc.id)
          .map((rs) => ({
            id: rs.student_code || `HS${String(rs.id).padStart(2, '0')}`,
            name: rs.full_name || 'Học sinh',
            attendance: rs.attendance_status || 'present',
            points: rs.current_score !== null && rs.current_score !== undefined ? Number(rs.current_score) : 2,
            lastNote: 'Đồng bộ từ Supabase Cloud',
            dbId: rs.id,
          }));

        return {
          id: `class_remote_${rc.id}`,
          dbId: rc.id,
          name: rc.class_code || 'Lớp mới',
          subject: rc.subject || 'Tin học',
          defaultPoints: 2,
          students: classStudents,
        };
      });

      return mergedClasses;
    } catch (err) {
      console.warn('Lỗi khi tải dữ liệu từ Supabase Cloud:', err);
      return null;
    }
  }

  // 2. Đẩy toàn bộ danh sách lớp & học sinh lên Supabase
  public static async pushAllData(classes: ClassItem[]): Promise<boolean> {
    const client = supabase;
    if (!client) return false;

    try {
      for (const c of classes) {
        let classDbId = c.dbId;

        // Kiểm tra hoặc tạo lớp trong DB
        if (!classDbId) {
          const { data: found } = await client
            .from('classes')
            .select('id')
            .eq('class_code', c.name)
            .limit(1);

          if (found && found.length > 0) {
            classDbId = found[0].id;
            c.dbId = classDbId;
          } else {
            const { data: newClass, error: err } = await client
              .from('classes')
              .insert({
                class_code: c.name,
                subject: c.subject || 'Tin học',
                teacher_name: 'Thầy / Cô',
                school_year: '2025 - 2026',
              })
              .select()
              .single();

            if (!err && newClass) {
              classDbId = newClass.id;
              c.dbId = classDbId;
            }
          }
        }

        // Cập nhật danh sách học sinh của lớp
        if (classDbId && c.students && c.students.length > 0) {
          for (const s of c.students) {
            const payload = {
              class_id: classDbId,
              student_code: s.id,
              full_name: s.name,
              gender: 'nam',
              current_score: Number(s.points || 0),
              attendance_status: s.attendance || 'present',
              stars_count: Number(s.points || 0),
            };

            const { data: existingStu } = await client
              .from('students')
              .select('id')
              .eq('class_id', classDbId)
              .eq('student_code', s.id)
              .limit(1);

            if (existingStu && existingStu.length > 0) {
              s.dbId = existingStu[0].id;
              await client.from('students').update(payload).eq('id', existingStu[0].id);
            } else {
              const { data: createdStu } = await client.from('students').insert(payload).select().single();
              if (createdStu) s.dbId = createdStu.id;
            }
          }
        }
      }
      return true;
    } catch (err) {
      console.warn('Lỗi khi đẩy dữ liệu lên Supabase:', err);
      return false;
    }
  }

  // 3. Tự động đồng bộ lớp hiện tại với cơ chế Debounce 600ms
  public static triggerDebouncedSync(
    currentClass: ClassItem,
    onStateChange?: (state: 'syncing' | 'connected' | 'error') => void
  ): void {
    const client = supabase;
    if (!client) return;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    onStateChange?.('syncing');

    this.debounceTimer = setTimeout(async () => {
      try {
        let classDbId = currentClass.dbId;
        if (!classDbId) {
          const { data: found } = await client
            .from('classes')
            .select('id')
            .eq('class_code', currentClass.name)
            .limit(1);

          if (found && found.length > 0) {
            classDbId = found[0].id;
            currentClass.dbId = classDbId;
          } else {
            const { data: created } = await client
              .from('classes')
              .insert({
                class_code: currentClass.name,
                subject: currentClass.subject || 'Tin học',
                teacher_name: 'Thầy / Cô',
                school_year: '2025 - 2026',
              })
              .select()
              .single();

            if (created) {
              classDbId = created.id;
              currentClass.dbId = classDbId;
            }
          }
        }

        if (classDbId && currentClass.students) {
          // Lấy danh sách ID học sinh hiện có trong DB của lớp này để dọn dẹp nếu có học sinh bị xóa
          const { data: remoteStuList } = await client
            .from('students')
            .select('id, student_code')
            .eq('class_id', classDbId);

          const currentStudentCodes = new Set(currentClass.students.map((s) => s.id));

          // Xóa những học sinh đã bị xóa khỏi lớp trên giao diện
          if (remoteStuList && remoteStuList.length > 0) {
            const idsToDelete = remoteStuList
              .filter((rs) => !currentStudentCodes.has(rs.student_code))
              .map((rs) => rs.id);

            if (idsToDelete.length > 0) {
              await client.from('students').delete().in('id', idsToDelete);
            }
          }

          // Cập nhật hoặc thêm mới học sinh hiện có
          for (const s of currentClass.students) {
            const payload = {
              class_id: classDbId,
              student_code: s.id,
              full_name: s.name,
              gender: 'nam',
              current_score: Number(s.points || 0),
              attendance_status: s.attendance || 'present',
              stars_count: Number(s.points || 0),
            };

            const existingInDb = remoteStuList?.find((rs) => rs.student_code === s.id);

            if (existingInDb) {
              s.dbId = existingInDb.id;
              await client.from('students').update(payload).eq('id', existingInDb.id);
            } else {
              const { data: inserted } = await client.from('students').insert(payload).select().single();
              if (inserted) s.dbId = inserted.id;
            }
          }
        }

        onStateChange?.('connected');
      } catch (err) {
        console.warn('Lỗi đồng bộ tự động lên Supabase:', err);
        onStateChange?.('error');
      }
    }, 600);
  }

  // 4. Xóa vĩnh viễn một lớp trên Supabase
  public static async deleteClassFromDb(classDbId: number): Promise<void> {
    const client = supabase;
    if (!client || !classDbId) return;

    try {
      await client.from('students').delete().eq('class_id', classDbId);
      await client.from('classes').delete().eq('id', classDbId);
    } catch (err) {
      console.warn('Lỗi khi xóa lớp trên Supabase:', err);
    }
  }

  // 5. Ghi nhận nhật ký điểm danh vào attendance_logs
  public static async logAttendance(
    studentDbId: number,
    status: string,
    pointsAwarded: number,
    note: string
  ): Promise<void> {
    const client = supabase;
    if (!client || !studentDbId) return;

    try {
      await client.from('attendance_logs').insert({
        student_id: studentDbId,
        check_date: new Date().toISOString().slice(0, 10),
        status,
        points_awarded: pointsAwarded,
        note,
      });
    } catch {
      // Non-blocking log
    }
  }

  // 6. Đăng ký nhận thông báo thay đổi thời gian thực (Supabase Realtime)
  public static subscribeToRealtime(onDataChange: () => void): () => void {
    const client = supabase;
    if (!client) return () => {};

    try {
      const channel = client
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'students' },
          () => onDataChange()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'classes' },
          () => onDataChange()
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    } catch {
      return () => {};
    }
  }
}
