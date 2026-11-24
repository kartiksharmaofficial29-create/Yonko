import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Cpu,
  ArrowRight,
  TrendingUp,
  Flame,
  ShieldCheck,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import ThreeMachineModel from '../components/ThreeMachineModel';
import { useGetDashboardStatsQuery, useGetTicketsQuery } from '../store/apiSlice';
import { formatRelativeTime, getPriorityBadgeVariant, getStatusBadgeVariant, getCategoryColor } from '../lib/utils';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading, refetch } = useGetDashboardStatsQuery(undefined, { pollingInterval: 15000 });
  const { data: ticketsData, isLoading: ticketsLoading } = useGetTicketsQuery({ limit: 6 });
  const [selectedComponent, setSelectedComponent] = useState(null);

  const summary = stats?.summary || {};
  const recentTickets = ticketsData?.results || ticketsData || [];
  const recentEvents = stats?.recent_events || [];

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <span>Maintenance Operations Command</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Live Feed
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automated NLP fault report parsing, triage classification, and explainable technician matching.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => navigate('/tickets/new')} className="gap-1.5 shadow-md shadow-cyan-500/20">
            <FileText className="h-4 w-4" />
            Report Fault Ticket
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Reports</p>
              <h3 className="text-2xl font-bold font-mono text-slate-100 mt-1">{summary.total || 0}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Indexed fault tickets</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Needs Triage / Open */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-amber-400 uppercase tracking-wider">Open / In Triage</p>
              <h3 className="text-2xl font-bold font-mono text-amber-400 mt-1">{summary.open || 0}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Pending supervisor review</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* High Priority Alerts */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-red-400 uppercase tracking-wider">High Priority</p>
              <h3 className="text-2xl font-bold font-mono text-red-400 mt-1">{summary.high_priority || 0}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Impacts production line</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Available Technicians */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Available Techs</p>
              <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {summary.available_technicians || 0}
                <span className="text-sm font-normal text-slate-500 ml-1">/ {summary.total_technicians || 0}</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Ready for instant assignment</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: 3D Machine Digital Twin + Category/Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Visual Twin (2 Cols) */}
        <Card className="lg:col-span-2 bg-slate-900/40 border-slate-800 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-cyan-400" />
                  Primary Workstation Digital Twin: CNC Milling Lathe
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Interactive assembly visualization. Click sub-components to inspect telemetry or view active beacons.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 font-mono text-[10px]">
                TELEMETRY ACTIVE
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 flex-1 flex flex-col justify-center">
            <ThreeMachineModel
              machineName="CNC Multi-Axis Milling Center #4"
              status={summary.high_priority > 0 ? 'critical' : summary.open > 0 ? 'warning' : 'active'}
              priority={summary.high_priority > 0 ? 'high' : 'medium'}
              activeComponent={selectedComponent}
              onSelectComponent={(name) => setSelectedComponent(name)}
              className="h-80 w-full"
            />
            {selectedComponent && (
              <div className="mt-3 p-2.5 rounded-lg bg-slate-900/80 border border-cyan-500/40 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Selected Component: <strong className="text-cyan-400 font-mono">{selectedComponent}</strong>
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[11px] text-slate-400 hover:text-white"
                  onClick={() => setSelectedComponent(null)}
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribution & NLP Classifications (1 Col) */}
        <div className="space-y-6">
          {/* Category Breakdown */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-300">
                NLP Category Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                { name: 'Mechanical', count: stats?.categories?.Mechanical || 0, color: 'bg-blue-500', text: 'text-blue-400' },
                { name: 'Electrical', count: stats?.categories?.Electrical || 0, color: 'bg-amber-500', text: 'text-amber-400' },
                { name: 'Hydraulic', count: stats?.categories?.Hydraulic || 0, color: 'bg-cyan-500', text: 'text-cyan-400' },
                { name: 'Unknown / Ambiguous', count: stats?.categories?.Unknown || 0, color: 'bg-purple-500', text: 'text-purple-400' },
              ].map((cat) => {
                const total = summary.total || 1;
                const pct = Math.round((cat.count / total) * 100);
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className={cat.text}>{cat.name}</span>
                      <span className="font-mono text-slate-400">{cat.count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick NLP Pipeline Verification Card */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>NLP Pipeline Status</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2 text-xs text-slate-400 font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Domain Taxonomy:</span>
                <span className="text-emerald-400">Active (450+ Tokens)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Negation Detection:</span>
                <span className="text-emerald-400">Strict Rule Layer</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Embedding Model:</span>
                <span className="text-cyan-400">all-MiniLM-L6-v2</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Matching Engine:</span>
                <span className="text-cyan-400">Explainable Composite</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Tickets Table + Live Event Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets Table (2 cols) */}
        <Card className="lg:col-span-2 bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-100">Recent Maintenance Reports</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Incoming tickets awaiting triage or technician assignment
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/tickets')}
              className="text-xs gap-1 border-slate-700"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Ticket</TableHead>
                  <TableHead>Machine / Issue</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTickets.slice(0, 5).map((ticket) => (
                  <TableRow key={ticket.id} className="cursor-pointer hover:bg-slate-800/60" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                    <TableCell className="font-mono text-xs font-bold text-cyan-400">
                      {ticket.ticket_id}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-200 text-xs truncate max-w-xs">
                        {ticket.machine_name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                        {ticket.raw_report_text}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${getCategoryColor(ticket.extracted_category)}`}>
                        {ticket.extracted_category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(ticket.extracted_priority)} className="text-[10px]">
                        {ticket.extracted_priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(ticket.status)} className="text-[10px]">
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(ticket.status === 'open' ? `/tickets/${ticket.id}/nlp` : `/tickets/${ticket.id}`);
                        }}
                        className="h-7 text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        {ticket.status === 'open' ? 'Triage' : 'Details'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {recentTickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                      No maintenance tickets found. Click "Report Fault Ticket" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Real-time Audit Timeline Feed (1 col) */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              Live Operational Timeline
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Immutable event log of triage and assignments
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4 max-h-[380px] overflow-y-auto">
            {recentEvents.length > 0 ? (
              recentEvents.map((evt) => (
                <div key={evt.id} className="relative pl-5 border-l border-slate-800 space-y-1 text-xs">
                  <span className="absolute -left-1.5 top-0.5 h-3 w-3 rounded-full bg-cyan-500/20 border border-cyan-400" />
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-cyan-400 font-semibold">{evt.ticket_id}</span>
                    <span>{formatRelativeTime(evt.timestamp)}</span>
                  </div>
                  <p className="text-slate-200 font-medium">{evt.description}</p>
                  <p className="text-[10px] text-slate-500 font-mono">By: {evt.performed_by}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                No recent activity recorded.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
