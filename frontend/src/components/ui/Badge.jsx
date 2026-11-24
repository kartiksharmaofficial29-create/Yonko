import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ children, className, variant = 'default', ...props }) {
  const base = "inline-flex items-center font-medium px-2.5 py-0.5 rounded-full text-xs border transition-colors";

  const variants = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    outline: "bg-transparent text-slate-600 border-slate-300",
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
