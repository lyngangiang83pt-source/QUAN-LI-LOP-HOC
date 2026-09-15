import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { UserPlus } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (name: string) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
}) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddStudent(name.trim());
    setName('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <UserPlus size={20} />
          <span>Thêm Học Sinh Mới</span>
        </>
      }
      headerTheme="primary"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
            Họ và tên học sinh (*):
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Nguyễn Văn An"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none font-semibold text-sm"
            autoFocus
            required
          />
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            💡 Học sinh mới thêm sẽ tự động được cấp <strong>+2 điểm chuyên cần ban đầu</strong>.
          </p>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            type="submit"
            className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-xs transition-colors"
          >
            Thêm học sinh
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
          >
            Hủy
          </button>
        </div>
      </form>
    </Modal>
  );
};
