import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { ClassItem } from '../../../types';
import { parseStudentNames } from '../../import-export/utils/csvParser';
import { School, PlusCircle, Trash2, Edit3, RotateCcw, CheckCircle2 } from 'lucide-react';

interface ClassManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  currentClassId: string;
  onSwitchClass: (id: string, resetPoints?: boolean) => void;
  onAddNewClass: (name: string, subject: string, defaultPoints: number, studentNames: string[]) => void;
  onEditClass: (id: string, newName: string, newSubject: string) => void;
  onDeleteClass: (id: string) => void;
  onResetPoints: (id: string) => void;
}

export const ClassManagerModal: React.FC<ClassManagerModalProps> = ({
  isOpen,
  onClose,
  classes,
  currentClassId,
  onSwitchClass,
  onAddNewClass,
  onEditClass,
  onDeleteClass,
  onResetPoints,
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('Tin học');
  const [defaultPoints, setDefaultPoints] = useState(2);
  const [rawText, setRawText] = useState('');

  const parsedNames = parseStudentNames(rawText);

  const handleSubmitNewClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Thầy/Cô vui lòng nhập Tên lớp (Ví dụ: 10A2, 11B1)!');
      return;
    }

    let finalNames = parsedNames;
    if (finalNames.length === 0) {
      if (confirm('Thầy/Cô chưa nhập danh sách học sinh. Có muốn tự động tạo 5 học sinh mẫu cho lớp này không?')) {
        finalNames = ['Nguyễn Văn An', 'Trần Thị Mai', 'Lê Hoàng Nam', 'Phạm Thu Hà', 'Đỗ Minh Quân'];
      } else {
        return;
      }
    }

    onAddNewClass(name.trim(), subject.trim(), defaultPoints, finalNames);
    setName('');
    setRawText('');
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setRawText(content);
    };
    reader.readAsText(file, 'UTF-8');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <School size={22} />
          <span>Quản Lý Lớp Học & Danh Sách Lớp</span>
        </>
      }
      headerTheme="class"
      maxWidth="max-w-2xl"
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-5 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('add')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'add'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle size={16} />
          <span>Thêm Lớp Mới</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'list'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Danh Sách Các Lớp ({classes.length})</span>
        </button>
      </div>

      {/* Tab 1: Add Class */}
      {activeTab === 'add' && (
        <form onSubmit={handleSubmitNewClass} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Tên lớp học (*):</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: 10A2, 11B1..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Môn học (*):</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ví dụ: Tin học, Toán, Tiếng Anh..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              Điểm tích lũy khởi đầu mỗi em khi có mặt:
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="10"
                value={defaultPoints}
                onChange={(e) => setDefaultPoints(Number(e.target.value))}
                className="w-24 px-3.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 text-center font-bold text-sm outline-none"
              />
              <span className="text-xs text-slate-500 font-medium">
                điểm (Mặc định 2 điểm cho mỗi học sinh có mặt)
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase text-slate-600">
                Danh sách học sinh (Dán mỗi em một dòng):
              </label>
              <label className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors">
                📁 Nạp từ File
                <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="1. Nguyễn Văn An&#10;2. Trần Thị Mai&#10;3. Lê Hoàng Nam"
              className="w-full p-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm font-mono leading-relaxed"
            />
            <div className={`mt-2 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              parsedNames.length > 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'
            }`}>
              {parsedNames.length > 0
                ? `✨ Phát hiện ${parsedNames.length} học sinh sẵn sàng tạo lớp`
                : '🔍 Nhập danh sách hoặc dán tên học sinh (mỗi em một dòng)'}
            </div>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🚀 Lưu lớp & Chọn dạy ngay</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
            >
              Đóng
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Class List */}
      {activeTab === 'list' && (
        <div className="space-y-3">
          {classes.map((c) => {
            const isActive = c.id === currentClassId;
            return (
              <div
                key={c.id}
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                } flex flex-wrap md:flex-nowrap justify-between items-center gap-3`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-base">🏫 Lớp: {c.name}</span>
                    {isActive && (
                      <span className="bg-emerald-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-xs">
                        <CheckCircle2 size={12} /> Đang dạy
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 font-semibold mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Môn: <strong className="text-slate-900">{c.subject || 'Tin học'}</strong></span>
                    <span>Sĩ số: <strong className="text-slate-900">{c.students?.length || 0} học sinh</strong></span>
                    <span>Mặc định: <strong className="text-slate-900">{c.defaultPoints ?? 2}đ/em</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isActive ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchClass(c.id, false);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                    >
                      🎯 Chọn dạy lớp này
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onResetPoints(c.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs border border-amber-300 transition-colors flex items-center gap-1"
                      title="Reset lại điểm toàn bộ học sinh lớp này về điểm mặc định"
                    >
                      <RotateCcw size={13} /> Reset {c.defaultPoints ?? 2}đ
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const newN = prompt('Nhập tên lớp mới:', c.name);
                      if (newN && newN.trim()) {
                        const newS = prompt('Nhập tên môn học:', c.subject || 'Tin học');
                        onEditClass(c.id, newN.trim(), newS?.trim() || 'Tin học');
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Đổi tên lớp / môn học"
                  >
                    <Edit3 size={15} />
                  </button>

                  {classes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Thầy/Cô có chắc chắn muốn xóa lớp "${c.name}" không?`)) {
                          onDeleteClass(c.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                      title="Xóa lớp này"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};
