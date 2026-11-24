import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Radar,
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Cpu,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  Activity,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Database,
  Terminal,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useGetDashboardStatsQuery } from '../store/apiSlice';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Tickets', path: '/tickets', icon: Ticket },
  { name: 'New Triage', path: '/tickets/new', icon: PlusCircle, highlight: true },
  { name: 'Machine Assets', path: '/machines', icon: Cpu },
  { name: 'Technician Roster', path: '/technicians', icon: Users },
  { name: 'System & NLP Settings', path: '/settings', icon: Settings },
];

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: stats } = useGetDashboardStatsQuery(undefined, { pollingInterval: 15000 });

  const activeTicketCount = stats?.summary?.open || 0;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Radar className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-mono text-base font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                Repair<span className="text-cyan-400">Radar</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Maintenance Triage
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* System Health Status Bar */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>NLP Engine Active</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Database className="h-3 w-3 text-cyan-400" />
            <span>PostgreSQL</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : item.highlight
                      ? 'bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.name === 'Tickets' && activeTicketCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {activeTicketCount}
                  </span>
                )}
                {item.highlight && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                    + AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Supervisor Profile Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60">
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-400 font-mono">
                MV
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">Marcus Vance</p>
                <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">Shift Supervisor</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              title="Sign Out"
              className="text-slate-500 hover:text-red-400 transition-colors p-1"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-slate-500">FACILITY-01</span>
              <span>/</span>
              <span className="text-cyan-400 uppercase font-semibold">
                {location.pathname === '/'
                  ? 'OPERATIONAL OVERVIEW'
                  : location.pathname.replace('/', '').toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => navigate('/tickets/new')}
              className="gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Report Fault</span>
            </Button>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
