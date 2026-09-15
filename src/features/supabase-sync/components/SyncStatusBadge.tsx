import React from 'react';
import { SyncStatus } from '../../../types';

interface SyncStatusBadgeProps {
  status: SyncStatus;
  onClick: () => void;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ status, onClick }) => {
  let badgeStyle = 'bg-white/20 hover:bg-white/30 text-white border-white/30';

  if (status.state === 'connected') {
    badgeStyle = 'bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-100 border-emerald-400/60';
  } else if (status.state === 'syncing') {
    badgeStyle = 'bg-amber-500/30 hover:bg-amber-500/40 text-amber-100 border-amber-400/60 animate-pulse';
  } else if (status.state === 'error' || status.state === 'offline') {
    badgeStyle = 'bg-rose-500/30 hover:bg-rose-500/40 text-rose-100 border-rose-400/60';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full text-xs md:text-sm font-bold border backdrop-blur-md transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 ${badgeStyle}`}
      title="Trạng thái kết nối & đồng bộ đám mây Supabase (Bấm để chọn đồng bộ)"
    >
      <span>{status.message}</span>
    </button>
  );
};
