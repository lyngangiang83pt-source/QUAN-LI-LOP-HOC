import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { getSavedCredentials, saveCustomCredentials, clearCustomCredentials, reinitSupabaseClient, supabase } from '../supabaseClient';
import { SupabaseSyncService } from '../supabaseSyncService';
import { ClassItem } from '../../../types';
import { Database, Key, Globe, CheckCircle2, AlertCircle, Copy, Check, RefreshCw, UploadCloud, RotateCcw } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  onReloadData: () => void;
  onShowToast: (msg: string, type?: 'success' | 'danger' | 'wheel' | 'rank' | 'info') => void;
}

export const SUPABASE_INIT_SQL = `-- =========================================================================
-- SCRIPT KHỞI TẠO CƠ SỞ DỮ LIỆU SUPABASE TỪ A-Z (CHUẨN POSTGRESQL)
-- Ứng dụng: Sổ Tay Quản Lý Lớp Học & Vòng Quay May Mắn (React 18)
-- =========================================================================

-- 1. Bật phần mở rộng tạo UUID nếu cần
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tạo bảng danh sách Lớp học (classes)
CREATE TABLE IF NOT EXISTS public.classes (
  id BIGSERIAL PRIMARY KEY,
  class_code VARCHAR(100) NOT NULL,
  subject VARCHAR(150) DEFAULT 'Tin học',
  teacher_name VARCHAR(150) DEFAULT 'Thầy / Cô',
  school_year VARCHAR(50) DEFAULT '2025 - 2026',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tạo bảng danh sách Học sinh (students)
CREATE TABLE IF NOT EXISTS public.students (
  id BIGSERIAL PRIMARY KEY,
  class_id BIGINT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_code VARCHAR(50) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  gender VARCHAR(20) DEFAULT 'nam',
  current_score NUMERIC(10,2) DEFAULT 0,
  attendance_status VARCHAR(50) DEFAULT 'present',
  stars_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tạo bảng Nhật ký điểm danh & điểm thưởng (attendance_logs)
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  check_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'present',
  points_awarded NUMERIC(10,2) DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Kích hoạt Row Level Security (RLS) bảo vệ dữ liệu
ALTER TABLE IF EXISTS public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance_logs ENABLE ROW LEVEL SECURITY;

-- 6. Tự động làm mới chính sách phân quyền cho ứng dụng Web (Idempotent - Tránh lỗi 42710)
DROP POLICY IF EXISTS "Allow public all access on classes" ON public.classes;
DROP POLICY IF EXISTS "Allow public all access on students" ON public.students;
DROP POLICY IF EXISTS "Allow public all access on attendance_logs" ON public.attendance_logs;

CREATE POLICY "Allow public all access on classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on attendance_logs" ON public.attendance_logs FOR ALL USING (true) WITH CHECK (true);

-- 7. Tạo chỉ mục (Indexes) tăng tốc độ tìm kiếm và sắp xếp
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_code ON public.students(student_code);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_student ON public.attendance_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_date ON public.attendance_logs(check_date);

-- 8. Thêm dữ liệu mẫu ban đầu (Nếu các bảng đang trống)
INSERT INTO public.classes (class_code, subject, teacher_name, school_year)
SELECT '6B2', 'HDTN', 'Thầy / Cô', '2025 - 2026'
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE class_code = '6B2');

INSERT INTO public.classes (class_code, subject, teacher_name, school_year)
SELECT '10A1', 'Toán Học', 'Thầy / Cô', '2025 - 2026'
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE class_code = '10A1');
`;

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  classes,
  onReloadData,
  onShowToast,
}) => {
  const currentConfig = getSavedCredentials();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    if (!url.trim() || !anonKey.trim()) {
      onShowToast('Vui lòng nhập đầy đủ Supabase URL và Anon Key!', 'danger');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Tạm lưu và thử kết nối
      saveCustomCredentials(url, anonKey);
      const client = reinitSupabaseClient();

      if (!client) {
        throw new Error('Không thể khởi tạo Supabase Client');
      }

      const startTime = performance.now();
      const { data, error } = await client.from('classes').select('id, class_code').limit(5);
      const latency = Math.round(performance.now() - startTime);

      if (error) {
        throw error;
      }

      setTestResult({
        success: true,
        message: `Kết nối thành công! (Độ trễ: ${latency}ms, Tìm thấy ${data?.length || 0} lớp học trong DB)`,
      });
      onShowToast('Kết nối Supabase Cloud thành công rực rỡ! 🚀', 'success');
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Lỗi kết nối: ${err?.message || 'Không thể truy cập bảng classes. Thầy/Cô đã chạy script SQL khởi tạo chưa ạ?'}`,
      });
      onShowToast('Kết nối thất bại. Vui lòng kiểm tra lại URL hoặc chạy script SQL!', 'danger');
    } finally {
      setTesting(false);
    }
  };

  const handleSaveAndReload = () => {
    if (!url.trim() || !anonKey.trim()) {
      onShowToast('Vui lòng nhập đầy đủ Supabase URL và Anon Key!', 'danger');
      return;
    }
    saveCustomCredentials(url, anonKey);
    onReloadData();
    onShowToast('Đã lưu cấu hình Supabase Cloud thành công!', 'success');
    onClose();
  };

  const handleResetDefault = () => {
    if (confirm('Thầy/Cô có muốn khôi phục về cơ sở dữ liệu Supabase mặc định ban đầu không?')) {
      clearCustomCredentials();
      const def = getSavedCredentials();
      setUrl(def.url);
      setAnonKey(def.anonKey);
      setTestResult(null);
      onReloadData();
      onShowToast('Đã khôi phục cấu hình Supabase mặc định!', 'info');
    }
  };

  const handlePushCurrentData = async () => {
    if (classes.length === 0) {
      onShowToast('Không có dữ liệu lớp học nào để tải lên!', 'danger');
      return;
    }

    if (
      !confirm(
        `Thầy/Cô có chắc chắn muốn đẩy toàn bộ ${classes.length} lớp học hiện tại lên cơ sở dữ liệu Supabase này không?`
      )
    ) {
      return;
    }

    setSyncing(true);
    try {
      const ok = await SupabaseSyncService.pushAllData(classes);
      if (ok) {
        onShowToast('Đã đẩy toàn bộ lớp học và học sinh lên Supabase Cloud thành công! ☁️', 'success');
        onReloadData();
      } else {
        onShowToast('Không thể đẩy dữ liệu. Vui lòng kiểm tra lại quyền RLS của DB!', 'danger');
      }
    } catch (e: any) {
      onShowToast(`Lỗi: ${e?.message || 'Thất bại'}`, 'danger');
    } finally {
      setSyncing(false);
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_INIT_SQL);
    setCopied(true);
    onShowToast('Đã sao chép toàn bộ mã SQL khởi tạo vào bộ nhớ tạm! 📋', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Database size={20} />
          <span>Cấu hình Kết nối Supabase Cloud</span>
        </div>
      }
      headerTheme="primary"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-slate-700">
        {/* Intro */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-xs md:text-sm text-sky-800 flex items-start gap-2.5">
          <Globe className="text-sky-600 shrink-0 mt-0.5" size={18} />
          <div>
            Thầy/Cô có thể liên kết trực tiếp website với <strong>Project Supabase của riêng Thầy/Cô</strong>. Dữ liệu lớp học, điểm danh và xếp hạng sẽ được lưu trữ an toàn trọn đời trên đám mây.
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Globe size={14} className="text-sky-600" />
              <span>Supabase Project URL (Địa chỉ Dự án)</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xxxxxxxxxxxx.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none text-sm font-mono transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Key size={14} className="text-amber-600" />
              <span>Supabase Anon Public Key (Khóa Công Khai Anon)</span>
            </label>
            <textarea
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              rows={2}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none text-xs font-mono transition-all resize-none"
            />
          </div>
        </div>

        {/* Test Result Box */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs md:text-sm flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="font-medium">{testResult.message}</div>
          </div>
        )}

        {/* Buttons Action Group */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs md:text-sm transition-all shadow-sm active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw size={15} className={testing ? 'animate-spin' : ''} />
            <span>{testing ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndReload}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <Check size={15} />
            <span>Lưu & Tải dữ liệu</span>
          </button>

          <button
            type="button"
            onClick={handlePushCurrentData}
            disabled={syncing}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs md:text-sm transition-all shadow-sm active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
          >
            <UploadCloud size={15} />
            <span>{syncing ? 'Đang đẩy lên...' : 'Đẩy dữ liệu hiện tại lên DB'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefault}
            className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-all active:scale-95 flex items-center gap-1.5 ml-auto"
            title="Khôi phục cấu hình mặc định ban đầu"
          >
            <RotateCcw size={14} />
            <span>Mặc định</span>
          </button>
        </div>

        {/* Collapsible SQL Initialization Box */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
          <div className="bg-slate-100 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Database size={14} className="text-sky-600" />
              <span>Mã SQL khởi tạo Database trên Supabase</span>
            </span>
            <button
              type="button"
              onClick={handleCopySQL}
              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Đã chép!' : 'Sao chép SQL'}</span>
            </button>
          </div>
          <pre className="p-3 bg-slate-900 text-emerald-400 text-[11px] font-mono overflow-x-auto max-h-40 leading-relaxed">
            {SUPABASE_INIT_SQL}
          </pre>
        </div>
      </div>
    </Modal>
  );
};
