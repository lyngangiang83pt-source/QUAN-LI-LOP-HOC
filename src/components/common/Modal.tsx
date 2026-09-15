import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  headerTheme?: 'primary' | 'wheel' | 'rank' | 'class' | 'import' | 'danger';
  maxWidth?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  headerTheme = 'primary',
  maxWidth = 'max-w-xl',
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const headerColors = {
    primary: 'bg-gradient-to-r from-sky-600 to-teal-600 text-white',
    wheel: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
    rank: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white',
    class: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white',
    import: 'bg-gradient-to-r from-indigo-600 to-sky-700 text-white',
    danger: 'bg-gradient-to-r from-rose-600 to-red-700 text-white',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full ${maxWidth} bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-scaleUp`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between font-bold ${headerColors[headerTheme]}`}>
          <div className="text-lg flex items-center gap-2">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
