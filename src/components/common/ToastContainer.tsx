import React from 'react';
import { ToastItem } from '../../types';

interface ToastContainerProps {
  toasts: ToastItem[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
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
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border-l-4 font-semibold text-sm transition-all duration-300 animate-slideInRight ${borderAndBg}`}
          >
            <span className="text-lg flex-shrink-0">{icon}</span>
            <div className="flex-1 leading-snug">{t.message}</div>
          </div>
        );
      })}
    </div>
  );
};
