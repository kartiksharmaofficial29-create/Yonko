import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Search,
  Filter,
  PlusCircle,
  Clock,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useGetTicketsQuery } from '../store/apiSlice';
import { formatRelativeTime, getPriorityBadgeVariant, getStatusBadgeVariant, getCategoryColor } from '../lib/utils';

export default function TicketsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: ticketsData, isLoading } = useGetTicketsQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    category: categoryFilter || undefined,
  });

  const tickets = ticketsData?.results || ticketsData || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Ticket className="h-6 w-6 text-cyan-400" />
            <span>Maintenance Tickets Registry</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete database of reported machine faults, automated NLP triage states, and technician assignments.
          </p>
        </div>
        <Button onClick={() => navigate('/tickets/new')} className="gap-2 shadow-md shadow-cyan-500/20">
          <PlusCircle className="h-4 w-4" />
          <span>Report New Fault</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search ticket #, machine, or fault text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="open">Open (Needs Triage)</option>
              <option value="in_triage">In Triage</option>
              <option value="assigned">Technician Assigned</option>
              <option value="in_progress">Work In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </Select>

            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </Select>

            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
              <option value="Hydraulic">Hydraulic</option>
              <option value="Unknown">Unknown / Ambiguous</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List Table */}
      <Card className="bg-slate-900/60 border-slate-800 overflow-hidden">
        <CardHeader className="p-4 border-b border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-200">
              Indexed Tickets ({tickets.length})
            </CardTitle>
          </div>
          {(statusFilter || priorityFilter || categoryFilter || search) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setPriorityFilter('');
                setCategoryFilter('');
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              Reset Filters
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Ticket ID</TableHead>
                <TableHead>Machine & Reporter</TableHead>
                <TableHead>Raw Report Excerpt</TableHead>
                <TableHead>NLP Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-400 text-xs font-mono">
                    Loading maintenance tickets from PostgreSQL...
                  </TableCell>
                </TableRow>
              ) : tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="cursor-pointer hover:bg-slate-800/50"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <TableCell className="font-mono text-xs font-bold text-cyan-400">
                      {ticket.ticket_id}
                      <span className="block text-[10px] font-normal text-slate-500 font-sans">
                        {formatRelativeTime(ticket.created_at)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-slate-200 text-xs">
                        {ticket.machine_name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Rep: {ticket.reporter_name}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-slate-300 max-w-xs truncate" title={ticket.raw_report_text}>
                        {ticket.raw_report_text}
                      </div>
                      {ticket.extracted_symptoms && ticket.extracted_symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ticket.extracted_symptoms.map((s, idx) => (
                            <span key={idx} className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${getCategoryColor(ticket.extracted_category)}`}>
                        {ticket.extracted_category || 'Pending'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(ticket.extracted_priority)} className="text-[10px]">
                        {ticket.extracted_priority || 'Low'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(ticket.status)} className="text-[10px]">
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {ticket.assigned_technician_name ? (
                        <div className="text-xs font-medium text-emerald-400">
                          {ticket.assigned_technician_name}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Unassigned</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {ticket.status === 'open' && (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/tickets/${ticket.id}/nlp`)}
                            className="h-7 text-xs bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
                          >
                            Triage
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                          className="h-7 text-xs text-slate-400 hover:text-white"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-500 text-xs">
                    No tickets match your filter criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
