import * as React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, children }) {
  return <div className={cn('flex flex-col space-y-1.5 text-left mb-4', className)}>{children}</div>;
}

export function DialogTitle({ className, children }) {
  return <h3 className={cn('text-lg font-bold text-slate-100 flex items-center justify-between', className)}>{children}</h3>;
}

export function DialogDescription({ className, children }) {
  return <p className={cn('text-xs text-slate-400', className)}>{children}</p>;
}

export function DialogFooter({ className, children }) {
  return <div className={cn('flex items-center justify-end space-x-2 mt-6 pt-4 border-t border-slate-800', className)}>{children}</div>;
}

export function DialogClose({ onClose }) {
  return (
    <button
      onClick={onClose}
      className="absolute top-4 right-4 rounded-sm text-slate-400 hover:text-slate-100 transition-colors"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
