import React from 'react';
import { ClassItem } from '../../../types';
import { School, Settings } from 'lucide-react';

interface ClassPickerProps {
  classes: ClassItem[];
  currentClassId: string;
  currentClass: ClassItem;
  onSelectClass: (id: string) => void;
  onOpenClassModal: () => void;
  onEditClassInfo: () => void;
}

export const ClassPicker: React.FC<ClassPickerProps> = ({
  classes,
  currentClassId,
  currentClass,
  onSelectClass,
  onOpenClassModal,
  onEditClassInfo,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Selector Dropdown */}
      <div className="flex items-center gap-2 bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-inner">
        <School size={16} className="text-amber-300" />
        <span className="text-xs font-bold text-sky-100 hidden sm:inline">Đang dạy:</span>
        <select
          value={currentClassId}
          onChange={(e) => onSelectClass(e.target.value)}
          className="bg-transparent text-white font-bold text-sm outline-none cursor-pointer pr-2"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id} className="text-slate-900 bg-white font-semibold">
              Lớp {c.name} ({c.subject || 'Tin học'} - {c.students?.length || 0} HS)
            </option>
          ))}
        </select>
      </div>

      {/* Button Open Class Manager */}
      <button
        type="button"
        onClick={onOpenClassModal}
        className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs md:text-sm border border-white/30 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
        title="Quản lý danh sách các lớp & thêm lớp mới"
      >
        <Settings size={15} />
        <span>Quản lý lớp</span>
      </button>

      {/* Clickable Subtitle */}
      <button
        type="button"
        onClick={onEditClassInfo}
        className="text-xs md:text-sm text-sky-100/90 hover:text-white bg-black/20 hover:bg-black/35 px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5"
        title="Bấm để chỉnh sửa nhanh tên môn học và tên lớp"
      >
        <span>✏️ Môn: <strong>{currentClass.subject || 'Tin học'}</strong> | Lớp: <strong>{currentClass.name}</strong></span>
      </button>
    </div>
  );
};
