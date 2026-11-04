import React from 'react';
import { ToastItem } from '../../types';

interface ToastContainerProps {
  toasts: ToastItem[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-[92vw] sm:max-w-md pointer-events-none">
      {toasts.map((t) => {
        let borderAndBg = 'bg-white text-slate-800 border-emerald-500 shadow-emerald-500/10';
        let icon = '✨';

        if (t.type === 'danger') {
          borderAndBg = 'bg-white text-slate-800 border-rose-500 shadow-rose-500/10';
          icon = '⚠️';
        } else if (t.type === 'wheel') {
          borderAndBg = 'bg-white text-purple-900 border-purple-500 shadow-purple-500/10';
          icon = '🎡';
        } else if (t.type === 'rank') {
          borderAndBg = 'bg-white text-amber-900 border-amber-500 shadow-amber-500/10';
          icon = '🏆';
        } else if (t.type === 'info') {
          borderAndBg = 'bg-white text-sky-900 border-sky-500 shadow-sky-500/10';
          icon = 'ℹ️';
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border-l-4 font-semibold text-sm transition-all duration-300 animate-slideInRight ${borderAndBg}`}
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span className="text-xl flex-shrink-0">{icon}</span>
              <div className="leading-snug text-xs sm:text-sm font-bold text-slate-800">{t.message}</div>
            </div>

            {t.action && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  t.action?.onClick();
                }}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1 border border-white/20 cursor-pointer"
              >
                <span>{t.action.label}</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
