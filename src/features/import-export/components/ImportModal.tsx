import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { parseStudentNames } from '../utils/csvParser';
import { downloadSampleCSV } from '../utils/csvExporter';
import { FolderUp, FileText, Upload, DownloadCloud } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportStudents: (names: string[], mode: 'replace' | 'append') => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportStudents,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'file' | 'template'>('paste');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  const parsedNames = parseStudentNames(text);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setText(content);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleConfirmImport = () => {
    if (parsedNames.length === 0) {
      alert('Vui lòng dán danh sách hoặc chọn file có chứa tên học sinh!');
      return;
    }
    onImportStudents(parsedNames, importMode);
    setText('');
    setFileName('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <FolderUp size={22} className="text-sky-200" />
          <span>Tải / Nhập Danh Sách Học Sinh</span>
        </>
      }
      headerTheme="import"
      maxWidth="max-w-xl"
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-4 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('paste')}
          className={`pb-2.5 px-3.5 font-bold text-xs md:text-sm border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'paste'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={15} />
          <span>Dán văn bản</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('file')}
          className={`pb-2.5 px-3.5 font-bold text-xs md:text-sm border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'file'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Upload size={15} />
          <span>Chọn file (.csv, .txt)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('template')}
          className={`pb-2.5 px-3.5 font-bold text-xs md:text-sm border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'template'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DownloadCloud size={15} />
          <span>File mẫu</span>
        </button>
      </div>

      {/* Tab 1: Paste Text */}
      {activeTab === 'paste' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-600 font-medium">
            Copy danh sách tên học sinh từ <strong>Excel, Word, Zalo</strong> rồi dán vào đây (mỗi em một dòng):
          </p>
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ví dụ:&#10;1. Nguyễn Văn An&#10;2. Trần Thị Mai&#10;3. Lê Hoàng Nam"
            className="w-full p-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-mono text-xs leading-relaxed"
          />
        </div>
      )}

      {/* Tab 2: Upload File */}
      {activeTab === 'file' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 font-medium">
            Tải lên file danh sách lớp học từ máy tính (hỗ trợ .csv hoặc .txt):
          </p>
          <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
            <Upload className="text-indigo-600 mb-2" size={32} />
            <strong className="text-indigo-900 text-sm">Bấm vào đây để chọn file từ máy tính</strong>
            <span className="text-[11px] text-slate-500 mt-1">Định dạng hỗ trợ: .csv, .txt</span>
            <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
          </label>
          {fileName && (
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              📄 Đã chọn file: {fileName}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Download Template */}
      {activeTab === 'template' && (
        <div className="space-y-3 text-center py-4">
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Tải file mẫu Excel (.csv) có cấu trúc chuẩn về máy tính. Thầy/Cô chỉ cần mở bằng Excel, điền danh sách rồi nạp lại vào ứng dụng:
          </p>
          <button
            type="button"
            onClick={downloadSampleCSV}
            className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors inline-flex items-center gap-2"
          >
            <DownloadCloud size={16} />
            <span>Tải file Excel mẫu (.csv) về máy</span>
          </button>
        </div>
      )}

      {/* Import Mode Radio */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
          <input
            type="radio"
            name="importMode"
            value="replace"
            checked={importMode === 'replace'}
            onChange={() => setImportMode('replace')}
            className="text-indigo-600"
          />
          <span><strong>Thay thế toàn bộ lớp hiện tại</strong></span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
          <input
            type="radio"
            name="importMode"
            value="append"
            checked={importMode === 'append'}
            onChange={() => setImportMode('append')}
            className="text-indigo-600"
          />
          <span><strong>Thêm nối tiếp</strong> vào danh sách</span>
        </label>
      </div>

      {/* Preview Badge */}
      <div
        className={`mt-3 p-2.5 rounded-xl text-xs font-bold ${
          parsedNames.length > 0
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-slate-100 text-slate-600'
        }`}
      >
        {parsedNames.length > 0
          ? `✨ Đã phát hiện ${parsedNames.length} học sinh hợp lệ sẵn sàng nạp`
          : '🔍 Hãy dán văn bản hoặc chọn file để nạp'}
      </div>

      {/* Footer Buttons */}
      <div className="mt-4 flex gap-2.5">
        <button
          type="button"
          onClick={handleConfirmImport}
          disabled={parsedNames.length === 0}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs md:text-sm text-white shadow-md transition-all ${
            parsedNames.length === 0
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 active:scale-95'
          }`}
        >
          🚀 Xác nhận nạp danh sách
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
        >
          Đóng
        </button>
      </div>
    </Modal>
  );
};
