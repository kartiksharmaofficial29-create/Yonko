import * as React from 'react';
import { cn } from '../../lib/utils';

export function Tabs({ defaultValue, value, onValueChange, children, className }) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  const current = value !== undefined ? value : activeTab;
  const changeTab = onValueChange || setActiveTab;

  return (
    <div className={cn('w-full', className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;
        return React.cloneElement(child, { current, changeTab });
      })}
    </div>
  );
}

export function TabsList({ children, className, current, changeTab }) {
  return (
    <div className={cn('inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 p-1 border border-slate-800 text-slate-400', className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;
        return React.cloneElement(child, { current, changeTab });
      })}
    </div>
  );
}

export function TabsTrigger({ value, children, className, current, changeTab }) {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={() => changeTab && changeTab(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all',
        isActive
          ? 'bg-slate-800 text-cyan-400 shadow-sm border border-cyan-500/30'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40',
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className, current }) {
  if (current !== value) return null;
  return <div className={cn('mt-4 focus:outline-none', className)}>{children}</div>;
}
