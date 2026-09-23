import React from 'react';
import { ClassItem, Student, SyncStatus } from '../../types';
import { ClassPicker } from '../../features/classroom/components/ClassPicker';
import { StatsGrid } from '../../features/classroom/components/StatsGrid';
import { SyncStatusBadge } from '../../features/supabase-sync/components/SyncStatusBadge';
import { Sparkles, Trophy, CheckCircle, Zap, MinusCircle, Download, FileSpreadsheet, Gauge, Crown } from 'lucide-react';

interface HeaderBannerProps {
  classes: ClassItem[];
  currentClassId: string;
  currentClass: ClassItem;
  students: Student[];
  syncStatus: SyncStatus;
  minWheelPoints?: number;
  animationsEnabled?: boolean;
  onToggleAnimations?: () => void;
  onSelectClass: (id: string) => void;
  onOpenClassModal: () => void;
  onEditClassInfo: () => void;
  onOpenWheelModal: () => void;
  onOpenLeaderboardModal: () => void;
  onOpenSpotlightModal?: () => void;
  onOpenFindCodeModal?: () => void;
  onOpenImportScoreModal: () => void;
  onMarkAllPresent: () => void;
  onAddAllClassBonus: () => void;
  onDeductAllClassPenalty?: () => void;
  onOpenClassPenaltyModal?: () => void;
  onExportScoreFile: () => void;
  onManualSync: () => void;
  onOpenSupabaseModal: () => void;
  onShowToast: (msg: string, type?: 'success' | 'danger' | 'wheel' | 'rank' | 'info') => void;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  classes,
  currentClassId,
  currentClass,
  students,
  syncStatus,
  minWheelPoints = 18,
  animationsEnabled = true,
  onToggleAnimations,
  onSelectClass,
  onOpenClassModal,
  onEditClassInfo,
  onOpenWheelModal,
  onOpenLeaderboardModal,
  onOpenSpotlightModal,
  onOpenFindCodeModal,
  onOpenImportScoreModal,
  onMarkAllPresent,
  onAddAllClassBonus,
  onDeductAllClassPenalty,
  onOpenClassPenaltyModal,
  onExportScoreFile,
  onManualSync,
  onOpenSupabaseModal,
  onShowToast,
}) => {

  const qualifiedCount = students.filter((s) => (s.points || 0) >= minWheelPoints).length;

  return (
    <header className="bg-gradient-to-r from-sky-600 via-sky-700 to-teal-700 text-white rounded-3xl p-5 md:p-6 shadow-xl mb-6 relative overflow-hidden border border-white/20">
      {/* Top Illustrated Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-6 border border-white/30 shadow-lg">
        <img
          src="/banner-header.png"
          alt="Banner Sổ Tay Quản Lý Lớp Học"
          className="w-full h-auto block object-cover"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {/* Class Selector Bar & Header Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <ClassPicker
          classes={classes}
          currentClassId={currentClassId}
          currentClass={currentClass}
          onSelectClass={onSelectClass}
          onOpenClassModal={onOpenClassModal}
          onEditClassInfo={onEditClassInfo}
        />

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Wheel Button */}
          <button
            type="button"
            onClick={onOpenWheelModal}
            className="px-3.5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-extrabold text-xs md:text-sm border border-white/40 shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <Sparkles size={16} />
            <span>Quay thưởng ({qualifiedCount} em ≥ {minWheelPoints}đ)</span>
          </button>

          {/* Leaderboard Button */}
          <button
            type="button"
            onClick={onOpenLeaderboardModal}
            className="px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 text-white font-extrabold text-xs md:text-sm border border-white/40 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <Trophy size={16} />
            <span>Top điểm</span>
          </button>

          {/* Spotlight Ceremony Top 1 Button */}
          {onOpenSpotlightModal && (
            <button
              type="button"
              onClick={onOpenSpotlightModal}
              className="px-3.5 py-2 rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-400 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black text-xs md:text-sm border-2 border-white shadow-xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 animate-pulse"
              title="Lễ vinh danh Quán Quân: Chiếu luồng sáng vàng Spotlight và nhạc trao giải"
            >
              <Crown size={16} className="text-amber-950 fill-amber-950" />
              <span>Vinh danh Top 1</span>
            </button>
          )}

          {/* Mark All Present Button */}
          <button
            type="button"
            onClick={() => {
              if (confirm('Thầy/Cô có muốn điểm danh TẤT CẢ học sinh là CÓ MẶT (+2đ chuyên cần) không?')) {
                onMarkAllPresent();
              }
            }}
            className="px-3.5 py-2 rounded-full bg-emerald-500/80 hover:bg-emerald-600 text-white font-bold text-xs md:text-sm border border-white/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-sm"
            title="Điểm danh tất cả học sinh có mặt (+2đ chuyên cần)"
          >
            <CheckCircle size={15} />
            <span>Có mặt tất cả (+2đ)</span>
          </button>

          {/* Whole Class +2pts Button */}
          <button
            type="button"
            onClick={() => {
              if (confirm('Thầy/Cô có muốn cộng thêm +2 ĐIỂM THƯỞNG cho học sinh CÓ MẶT & ĐI MUỘN (học sinh vắng không được cộng) không?')) {
                onAddAllClassBonus();
              }
            }}
            className="px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs md:text-sm border border-white/40 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            title="Cộng thêm +2 điểm thưởng cho học sinh có mặt và muộn (học sinh vắng không được cộng)"
          >
            <Zap size={15} />
            <span>Cả lớp +2đ</span>
          </button>

          {/* Whole Class -1pt Button */}
          {(onOpenClassPenaltyModal || onDeductAllClassPenalty) && (
            <button
              type="button"
              onClick={() => {
                if (onOpenClassPenaltyModal) {
                  onOpenClassPenaltyModal();
                } else if (onDeductAllClassPenalty) {
                  if (confirm('Thầy/Cô có muốn TRỪ -1 ĐIỂM của học sinh CÓ MẶT & ĐI MUỘN (học sinh vắng không bị trừ) không?')) {
                    onDeductAllClassPenalty();
                  }
                }
              }}
              className="px-3.5 py-2 rounded-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-extrabold text-xs md:text-sm border border-white/40 shadow-lg shadow-rose-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
              title="Mở bảng chọn nhanh lý do trừ -1đ nhắc nhở cả lớp (Mất trật tự, chưa làm bài...)"
            >
              <MinusCircle size={15} />
              <span>Cả lớp -1đ</span>
            </button>
          )}

          {/* Export Score File Button */}
          <button
            type="button"
            onClick={onExportScoreFile}
            className="px-3.5 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs md:text-sm border border-white/30 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
            title="Xuất file Excel bảng 3 cột: MÃ HS / HỌ VÀ TÊN / TỔNG ĐIỂM"
          >
            <Download size={15} />
            <span>Xuất file điểm</span>
          </button>

          {/* Import Score File Button */}
          <button
            type="button"
            onClick={onOpenImportScoreModal}
            className="px-3.5 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs md:text-sm border border-white/40 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            title="Nạp bảng điểm từ Excel/CSV 3 cột: MÃ HS / HỌ VÀ TÊN / TỔNG ĐIỂM"
          >
            <FileSpreadsheet size={16} />
            <span>Nạp file điểm</span>
          </button>

          {/* Animation Setting Toggle Button */}
          {onToggleAnimations && (
            <button
              type="button"
              onClick={onToggleAnimations}
              className={`px-3.5 py-2 rounded-full font-bold text-xs md:text-sm border transition-all active:scale-95 flex items-center gap-1.5 shadow-sm ${
                animationsEnabled
                  ? 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black border-amber-300 shadow-md shadow-amber-500/20'
              }`}
              title={
                animationsEnabled
                  ? 'Đang bật đầy đủ hiệu ứng hoạt họa - Bấm để chuyển sang chế độ Siêu nhẹ cho máy cấu hình yếu'
                  : 'Đang ở chế độ Siêu nhẹ mượt (Đã tắt hiệu ứng hoạt họa) - Bấm để bật lại đầy đủ hiệu ứng'
              }
            >
              {animationsEnabled ? (
                <>
                  <Sparkles size={15} className="text-yellow-300" />
                  <span>Hiệu ứng: Bật</span>
                </>
              ) : (
                <>
                  <Gauge size={15} className="text-slate-950" />
                  <span>Hiệu ứng: Tắt (Nhẹ máy)</span>
                </>
              )}
            </button>
          )}

          {/* Supabase Status Button */}
          <SyncStatusBadge status={syncStatus} onClick={onOpenSupabaseModal} />
        </div>
      </div>

      {/* Stats Dashboard Grid */}
      <StatsGrid students={students} minWheelPoints={minWheelPoints} />
    </header>
  );
};

