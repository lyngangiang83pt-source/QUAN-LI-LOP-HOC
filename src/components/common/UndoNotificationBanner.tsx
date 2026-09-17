import React, { useEffect, useState } from 'react';
import { RotateCcw, X, AlertCircle } from 'lucide-react';

export interface UndoData {
  id: string;
  description: string;
  timestamp: number;
}

interface UndoNotificationBannerProps {
  undoData: UndoData | null;
  onUndo: () => void;
  onDismiss: () => void;
  durationMs?: number;
}

export const UndoNotificationBanner: React.FC<UndoNotificationBannerProps> = ({
  undoData,
  onUndo,
  onDismiss,
  durationMs = 7000,
}) => {
  const [progress, setProgress] = useState<number>(100);

  useEffect(() => {
    if (!undoData) return;

    setProgress(100);
    const startTime = Date.now();
    const interval = 50;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remainingPct);

      if (remainingPct <= 0) {
        clearInterval(timer);
        onDismiss();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [undoData, durationMs, onDismiss]);

  // Keyboard shortcut Ctrl+Z / Cmd+Z support
  useEffect(() => {
    if (!undoData) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        onUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoData, onUndo]);

  if (!undoData) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92%] sm:w-auto animate-scaleUp">
      <div className="relative overflow-hidden bg-slate-900/95 backdrop-blur-md text-white border border-amber-500/40 shadow-2xl rounded-2xl p-3.5 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 md:gap-5 ring-1 ring-white/10">
        {/* Left: Icon & Description */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
            <RotateCcw size={16} className="animate-spin-once" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider font-extrabold text-amber-300 flex items-center gap-1">
              <AlertCircle size={12} />
              <span>Thầy/Cô vừa thao tác:</span>
            </div>
            <div className="text-xs md:text-sm font-bold text-slate-100 truncate max-w-[200px] sm:max-w-xs" title={undoData.description}>
              {undoData.description}
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onUndo}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs md:text-sm shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            title="Khôi phục lại điểm số và trạng thái trước khi bấm (Phím tắt: Ctrl+Z)"
          >
            <RotateCcw size={14} className="stroke-[2.5]" />
            <span>Hoàn tác</span>
            <span className="hidden sm:inline text-[10px] opacity-75 font-mono">(Ctrl+Z)</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Đóng thông báo"
          >
            <X size={16} />
          </button>
        </div>

        {/* Bottom Countdown Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
