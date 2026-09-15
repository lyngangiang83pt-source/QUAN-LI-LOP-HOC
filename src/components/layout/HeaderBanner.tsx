import React, { useState } from 'react';
import { ClassItem, Student, SyncStatus } from '../../types';
import { ClassPicker } from '../../features/classroom/components/ClassPicker';
import { StatsGrid } from '../../features/classroom/components/StatsGrid';
import { SyncStatusBadge } from '../../features/supabase-sync/components/SyncStatusBadge';
import { MASCOT_MESSAGES } from '../../constants/classroomData';
import { audioService } from '../../services/audioService';
import { Sparkles, Trophy, FolderUp, CheckCircle, Zap, Download, RotateCcw } from 'lucide-react';

interface HeaderBannerProps {
  classes: ClassItem[];
  currentClassId: string;
  currentClass: ClassItem;
  students: Student[];
  syncStatus: SyncStatus;
  minWheelPoints?: number;
  onSelectClass: (id: string) => void;
  onOpenClassModal: () => void;
  onEditClassInfo: () => void;
  onOpenWheelModal: () => void;
  onOpenLeaderboardModal: () => void;
  onOpenImportModal: () => void;
  onMarkAllPresent: () => void;
  onSetAllDefault2Points: () => void;
  onExportCSV: () => void;
  onResetDayAttendance: () => void;
  onManualSync: () => void;
  onShowToast: (msg: string, type?: 'success' | 'danger' | 'wheel' | 'rank' | 'info') => void;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  classes,
  currentClassId,
  currentClass,
  students,
  syncStatus,
  minWheelPoints = 5,
  onSelectClass,
  onOpenClassModal,
  onEditClassInfo,
  onOpenWheelModal,
  onOpenLeaderboardModal,
  onOpenImportModal,
  onMarkAllPresent,
  onSetAllDefault2Points,
  onExportCSV,
  onResetDayAttendance,
  onManualSync,
  onShowToast,
}) => {
  const [mascotBubble, setMascotBubble] = useState<string>('Chúc các em học tốt! 🌟');

  const qualifiedCount = students.filter((s) => (s.points || 0) >= minWheelPoints).length;

  const handleMascotClick = () => {
    audioService.play('plus');
    const randomMsg = MASCOT_MESSAGES[Math.floor(Math.random() * MASCOT_MESSAGES.length)];
    setMascotBubble(randomMsg);
    onShowToast(randomMsg, 'wheel');
  };

  return (
    <header className="bg-gradient-to-r from-sky-600 via-sky-700 to-teal-700 text-white rounded-3xl p-5 md:p-6 shadow-xl mb-6 relative overflow-hidden border border-white/20">
      {/* Background Decorative Bubble */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full pointer-events-none blur-xl" />

      {/* Top Illustrated Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-6 border border-white/30 shadow-lg min-h-[140px] md:min-h-[180px] flex items-center justify-between bg-sky-800">
        <img
          src="/banner-header.png"
          alt="Banner Sổ Tay Quản Lý Lớp Học"
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        <div className="relative z-10 w-full p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-black/25 backdrop-blur-[2px]">
          {/* Left Quote */}
          <div className="hidden lg:flex flex-col items-start gap-1">
            <div className="font-handwriting text-xl md:text-2xl text-amber-200 drop-shadow-md flex items-center gap-2">
              <span>Mỗi ngày đến trường là một ngày vui! ♡</span>
              <span className="animate-bounce">✈️</span>
            </div>
          </div>

          {/* Center 3D Titles */}
          <div className="text-center">
            <div className="text-xs md:text-sm font-black tracking-widest text-amber-300 uppercase drop-shadow-sm">
              SỔ TAY
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-md font-sans">
              QUẢN LÝ LỚP HỌC
            </h1>
            <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] md:text-xs font-bold text-sky-100 border border-white/30">
              ✨ Tổ chức - Kết nối - Truyền cảm hứng
            </div>
          </div>

          {/* Right Mascot & Planks */}
          <div className="flex items-center gap-3">
            <div
              onClick={handleMascotClick}
              className="relative cursor-pointer group flex flex-col items-center"
              title="Bấm vào tôi để nhận lời chúc học tập vui vẻ!"
            >
              <img
                src="/robot-mascot.png"
                alt="Robot Mascot"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/icon-wheel.png';
                }}
              />
              <div className="hidden sm:block text-[10px] font-extrabold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full shadow-md mt-1 truncate max-w-[120px]">
                {mascotBubble}
              </div>
            </div>
          </div>
        </div>
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

          {/* Import Button */}
          <button
            type="button"
            onClick={onOpenImportModal}
            className="px-3 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs md:text-sm border border-white/30 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
          >
            <FolderUp size={15} />
            <span>Tải DS</span>
          </button>

          {/* Mark All Present */}
          <button
            type="button"
            onClick={() => {
              if (confirm('Thầy/Cô có muốn điểm danh TẤT CẢ học sinh là CÓ MẶT (+2 điểm chuyên cần) không?')) {
                onMarkAllPresent();
              }
            }}
            className="px-3 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs md:text-sm border border-white/30 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle size={15} />
            <span>Có mặt tất cả (+2đ)</span>
          </button>

          {/* Set All Default 2 Points */}
          <button
            type="button"
            onClick={() => {
              if (confirm('Thầy/Cô có muốn thiết lập TẤT CẢ học sinh đều có 2 điểm tích lũy ban đầu không?')) {
                onSetAllDefault2Points();
              }
            }}
            className="px-3 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs md:text-sm border border-white/30 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
          >
            <Zap size={15} />
            <span>Cấp 2đ cả lớp</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={onExportCSV}
            className="px-3 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs md:text-sm border border-white/30 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
          >
            <Download size={15} />
            <span>Xuất Excel</span>
          </button>

          {/* Reset Day */}
          <button
            type="button"
            onClick={() => {
              if (confirm('Thầy/Cô có muốn ĐẶT LẠI buổi điểm danh mới (Tất cả Có mặt + 2 điểm chuyên cần)?')) {
                onResetDayAttendance();
              }
            }}
            className="px-3 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs md:text-sm border border-white/30 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw size={15} />
            <span>Điểm danh mới</span>
          </button>

          {/* Supabase Status Button */}
          <SyncStatusBadge status={syncStatus} onClick={onManualSync} />
        </div>
      </div>

      {/* Stats Dashboard Grid */}
      <StatsGrid students={students} minWheelPoints={minWheelPoints} />
    </header>
  );
};
