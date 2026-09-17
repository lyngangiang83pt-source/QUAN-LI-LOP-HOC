import React, { useState, useMemo } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Student } from '../../../types';
import { parseScoreRows, parseScoreFromExcelBuffer, ParsedScoreRow } from '../utils/scoreParser';
import { downloadSampleScoreExcel, downloadSampleScoreCSV } from '../utils/csvExporter';
import { FileSpreadsheet, FileText, Upload, DownloadCloud, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface ImportScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  className: string;
  onImportScores: (rows: ParsedScoreRow[], mode: 'override' | 'add') => void;
}

export const ImportScoreModal: React.FC<ImportScoreModalProps> = ({
  isOpen,
  onClose,
  students,
  className,
  onImportScores,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'file' | 'template'>('paste');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileParsedRows, setFileParsedRows] = useState<ParsedScoreRow[]>([]);
  const [importMode, setImportMode] = useState<'override' | 'add'>('override');

  // Dữ liệu bảng điểm hiệu lực tùy theo tab hiện hành
  const parsedRows = useMemo(() => {
    if (activeTab === 'file') {
      return fileParsedRows;
    }
    return parseScoreRows(text);
  }, [activeTab, fileParsedRows, text]);

  // Đối chiếu từng dòng parsed với danh sách học sinh hiện tại trong lớp
  const previewMatches = useMemo(() => {
    return parsedRows.map((row) => {
      const matchedStudent = students.find((s) => {
        if (row.code && s.id.toLowerCase() === row.code.toLowerCase()) {
          return true;
        }
        if (row.name && s.name.trim().toLowerCase() === row.name.trim().toLowerCase()) {
          return true;
        }
        return false;
      });

      const currentScore = matchedStudent ? (matchedStudent.points || 0) : null;
      let finalScore: number | null = null;

      if (matchedStudent) {
        if (importMode === 'override') {
          finalScore = row.score;
        } else {
          finalScore = (matchedStudent.points || 0) + row.score;
        }
      }

      return {
        row,
        matchedStudent,
        currentScore,
        finalScore,
      };
    });
  }, [parsedRows, students, importMode]);

  const matchedCount = previewMatches.filter((m) => m.matchedStudent !== undefined).length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const lowerName = file.name.toLowerCase();

    // 1. File Excel (.xlsx, .xls)
    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        if (buffer) {
          const rows = parseScoreFromExcelBuffer(buffer);
          setFileParsedRows(rows);
        }
      };
      reader.readAsArrayBuffer(file);
    }
    // 2. File văn bản (.csv, .txt)
    else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const rows = parseScoreRows(content);
          setFileParsedRows(rows);
          setText(content);
        }
      };
      reader.readAsText(file, 'UTF-8');
    }
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) {
      alert('Vui lòng dán bảng điểm hoặc chọn file chứa dữ liệu điểm 3 cột!');
      return;
    }
    if (matchedCount === 0) {
      alert('Không tìm thấy học sinh nào trong lớp khớp với Mã HS hoặc Họ tên trong file!');
      return;
    }

    onImportScores(parsedRows, importMode);
    setText('');
    setFileName('');
    setFileParsedRows([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <FileSpreadsheet size={22} className="text-emerald-300" />
          <span>Nạp File Điểm Lớp {className}</span>
        </>
      }
      headerTheme="import"
      maxWidth="max-w-2xl"
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
          <span>Dán từ Excel</span>
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
          <span>Chọn file (.xlsx, .csv)</span>
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
          <span>File mẫu 3 cột</span>
        </button>
      </div>

      {/* Tab 1: Paste from Excel */}
      {activeTab === 'paste' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-600 font-medium">
            Copy 3 cột (<strong>MÃ HS, HỌ VÀ TÊN, TỔNG ĐIỂM</strong>) từ bảng tính Excel rồi dán trực tiếp vào đây:
          </p>
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Ví dụ:\nHS01\tNguyễn Văn An\t10\nHS02\tTrần Thị Mai\t8.5\nHS03\tLê Hoàng Nam\t9`}
            className="w-full p-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-mono text-xs leading-relaxed"
          />
        </div>
      )}

      {/* Tab 2: Upload File */}
      {activeTab === 'file' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 font-medium">
            Tải lên file bảng điểm 3 cột (.xlsx, .xls, .csv, .txt) từ máy tính:
          </p>
          <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
            <Upload className="text-indigo-600 mb-2" size={32} />
            <strong className="text-indigo-900 text-sm">Bấm vào đây để chọn file bảng điểm</strong>
            <span className="text-[11px] text-slate-500 mt-1">Hỗ trợ Excel (.xlsx, .xls) hoặc CSV/TXT chuẩn 3 cột: MÃ HS, HỌ VÀ TÊN, TỔNG ĐIỂM</span>
            <input type="file" accept=".xlsx,.xls,.csv,.txt" className="hidden" onChange={handleFileUpload} />
          </label>
          {fileName && (
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 flex items-center justify-between">
              <span>📄 Đã nạp file: <strong>{fileName}</strong></span>
              <span className="text-[11px] bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-full font-extrabold">
                {fileParsedRows.length} dòng dữ liệu
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Download Template */}
      {activeTab === 'template' && (
        <div className="space-y-3 text-center py-4">
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Tải file mẫu Excel chuẩn 3 cột (<strong>MÃ HS, HỌ VÀ TÊN, TỔNG ĐIỂM</strong>). Thầy/Cô chỉ cần mở bằng Excel, điền điểm rồi nạp vào phần mềm:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={downloadSampleScoreExcel}
              className="py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <FileSpreadsheet size={16} />
              <span>Tải file Excel mẫu (.xlsx) chuẩn</span>
            </button>
            <button
              type="button"
              onClick={downloadSampleScoreCSV}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors inline-flex items-center gap-2 border border-slate-200"
            >
              <DownloadCloud size={16} />
              <span>Tải bản CSV (.csv)</span>
            </button>
          </div>
        </div>
      )}

      {/* Chế độ nạp điểm (Import Mode) */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50 p-3 rounded-xl border">
        <span className="text-xs font-bold text-slate-700 shrink-0 flex items-center gap-1">
          <Sparkles size={14} className="text-indigo-600" />
          Chế độ nạp điểm:
        </span>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="radio"
              name="scoreImportMode"
              value="override"
              checked={importMode === 'override'}
              onChange={() => setImportMode('override')}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <span><strong>Ghi đè điểm tổng</strong> (Điểm mới = Điểm trong file)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="radio"
              name="scoreImportMode"
              value="add"
              checked={importMode === 'add'}
              onChange={() => setImportMode('add')}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <span><strong>Cộng dồn</strong> (Điểm hiện có + Điểm trong file)</span>
          </label>
        </div>
      </div>

      {/* Preview Table */}
      {previewMatches.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">
              🔍 Xem trước đối chiếu ({matchedCount}/{previewMatches.length} học sinh khớp trong lớp {className}):
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                matchedCount > 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {matchedCount > 0 ? `Khớp ${matchedCount} em` : 'Không khớp em nào'}
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                <tr>
                  <th className="p-2">MÃ HS</th>
                  <th className="p-2">HỌ VÀ TÊN</th>
                  <th className="p-2 text-center">TỔNG ĐIỂM (File)</th>
                  <th className="p-2 text-center">Điểm hiện tại</th>
                  <th className="p-2 text-center">Điểm sau nạp</th>
                  <th className="p-2 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewMatches.map((m, idx) => (
                  <tr
                    key={idx}
                    className={m.matchedStudent ? 'hover:bg-indigo-50/40' : 'bg-rose-50/40 text-rose-800'}
                  >
                    <td className="p-2 font-mono font-bold text-indigo-700">
                      {m.row.code || (m.matchedStudent ? m.matchedStudent.id : '-')}
                    </td>
                    <td className="p-2 font-semibold text-slate-800">
                      {m.matchedStudent ? m.matchedStudent.name : (m.row.name || 'Không rõ tên')}
                    </td>
                    <td className="p-2 text-center font-bold text-slate-700">
                      {m.row.score}đ
                    </td>
                    <td className="p-2 text-center font-medium text-slate-500">
                      {m.currentScore !== null ? `${m.currentScore}đ` : '-'}
                    </td>
                    <td className="p-2 text-center font-extrabold text-emerald-600">
                      {m.finalScore !== null ? `${m.finalScore}đ` : '-'}
                    </td>
                    <td className="p-2 text-center">
                      {m.matchedStudent ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={12} /> Khớp
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          <AlertCircle size={12} /> Không có trong lớp
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="mt-5 flex gap-2.5">
        <button
          type="button"
          onClick={handleConfirmImport}
          disabled={matchedCount === 0}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs md:text-sm text-white shadow-md transition-all ${
            matchedCount === 0
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95'
          }`}
        >
          🚀 Xác nhận nạp điểm cho {matchedCount} học sinh
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

