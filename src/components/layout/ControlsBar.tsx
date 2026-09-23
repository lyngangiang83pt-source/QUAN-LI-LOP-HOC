import React from 'react';
import { FilterType } from '../../types';
import { Search, Trophy, Sparkles, FolderUp, UserPlus, Hash } from 'lucide-react';


interface ControlsBarProps {
  currentFilter: FilterType;
  searchQuery: string;
  minWheelPoints?: number;
  onSetFilter: (filter: FilterType) => void;
  onSearchChange: (query: string) => void;
  onOpenWheelModal: () => void;
  onOpenImportModal: () => void;
  onOpenAddModal: () => void;
  onOpenFindCodeModal: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  currentFilter,
  searchQuery,
  minWheelPoints = 18,
  onSetFilter,
  onSearchChange,
  onOpenWheelModal,
  onOpenImportModal,
  onOpenAddModal,
  onOpenFindCodeModal,
}) => {
  return (
    <div className="bg-white p-3.5 md:p-4 rounded-2xl shadow-soft-sm border border-slate-200/80 mb-5 flex flex-wrap items-center justify-between gap-3">
      {/* Search Box & Quick Find By Code Button */}
      <div className="flex items-center gap-2 flex-1 min-w-[240px]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm tên hoặc mã học sinh..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-xs md:text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-400"
          />
        </div>
        <button
          type="button"
          onClick={onOpenFindCodeModal}
          className="px-3.5 py-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 shrink-0"
          title="Tìm nhanh học sinh theo mã / số thứ tự"
        >
          <Hash size={14} />
          <span className="hidden sm:inline">Tìm theo mã</span>
          <span className="sm:hidden">Mã</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
        <button
          type="button"
          onClick={() => onSetFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            currentFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tất cả
        </button>

        <button
          type="button"
          onClick={() => onSetFilter('top')}
          className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1 ${
            currentFilter === 'top'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <Trophy size={13} />
          <span>Top điểm</span>
        </button>

        <button
          type="button"
          onClick={() => onSetFilter('qualified')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
            currentFilter === 'qualified'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
          }`}
        >
          <Sparkles size={13} />
          <span>Đạt ≥ {minWheelPoints}đ</span>
        </button>

        <button
          type="button"
          onClick={() => onSetFilter('present')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            currentFilter === 'present'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Có mặt
        </button>

        <button
          type="button"
          onClick={() => onSetFilter('absent')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            currentFilter === 'absent'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Vắng
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenWheelModal}

          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-extrabold text-xs shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
        >
          <Sparkles size={14} />
          <span>Quay thưởng</span>
        </button>

        <button
          type="button"
          onClick={onOpenImportModal}
          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
        >
          <FolderUp size={14} />
          <span>Tải DS</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
        >
          <UserPlus size={14} />
          <span>Thêm 1 em</span>
        </button>
      </div>
    </div>
  );
};
