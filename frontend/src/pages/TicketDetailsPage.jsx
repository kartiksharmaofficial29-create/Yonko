import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Ticket,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Phone,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/Dialog';
import { Label, Textarea } from '../components/ui/Input';
import {
  useGetTicketQuery,
  useGetTicketEventsQuery,
  useUpdateTicketStatusMutation,
} from '../store/apiSlice';
import { formatRelativeTime, getPriorityBadgeVariant, getStatusBadgeVariant, getCategoryColor } from '../lib/utils';

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: ticket, isLoading: ticketLoading, refetch: refetchTicket } = useGetTicketQuery(id);
  const { data: events, isLoading: eventsLoading, refetch: refetchEvents } = useGetTicketEventsQuery(id);
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateTicketStatusMutation();

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('in_progress');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleOpenStatusModal = (status) => {
    setTargetStatus(status);
    setStatusModalOpen(true);
  };

  const handleConfirmStatusUpdate = async () => {
    try {
      await updateStatus({
        id,
        status: targetStatus,
        notes: resolutionNotes || `Status updated to ${targetStatus}`,
      }).unwrap();
      setStatusModalOpen(false);
      setResolutionNotes('');
      refetchTicket();
      refetchEvents();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (ticketLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 space-y-3 font-mono text-xs">
        <Sparkles className="h-8 w-8 text-cyan-400 animate-spin" />
        <p>Loading maintenance ticket lifecycle data...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Ticket not found.</p>
        <Button onClick={() => navigate('/tickets')} className="mt-4">
          Back to Tickets
        </Button>
      </div>
    );
  }

  const timelineEvents = events || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 text-sm font-bold">{ticket.ticket_id}</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">{ticket.machine_name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3 mt-1">
            <span>Fault Ticket Overview</span>
            <Badge variant={getStatusBadgeVariant(ticket.status)} className="text-xs uppercase font-mono">
              {ticket.status.replace('_', ' ')}
            </Badge>
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/tickets/${id}/nlp`)}
            className="text-xs gap-1.5 border-slate-700"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>NLP Triage Screen</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/tickets/${id}/recommendations`)}
            className="text-xs gap-1.5 border-slate-700"
          >
            <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>{ticket.assigned_technician ? 'Reassign Tech' : 'Assign Tech'}</span>
          </Button>

          {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <Button
              size="sm"
              onClick={() => handleOpenStatusModal(ticket.status === 'assigned' ? 'in_progress' : 'resolved')}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{ticket.status === 'assigned' ? 'Start Work' : 'Mark Resolved'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Overview & Assigned Tech */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Ticket Details & Raw Report (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fault Details Card */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-300">
                Machine Fault Description
              </CardTitle>
              <span className="text-[11px] font-mono text-slate-500">
                Logged {formatRelativeTime(ticket.created_at)}
              </span>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-sans leading-relaxed">
                "{ticket.raw_report_text}"
              </div>

              {/* Badges Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Category</span>
                  <Badge variant="outline" className={`mt-1 text-xs ${getCategoryColor(ticket.extracted_category)}`}>
                    {ticket.extracted_category}
                  </Badge>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Priority</span>
                  <Badge variant={getPriorityBadgeVariant(ticket.extracted_priority)} className="mt-1 text-xs">
                    {ticket.extracted_priority}
                  </Badge>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Reporter</span>
                  <span className="text-xs font-medium text-slate-200 block mt-1 truncate">
                    {ticket.reporter_name}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Location</span>
                  <span className="text-xs font-medium text-cyan-400 font-mono block mt-1 truncate">
                    {ticket.machine_location || 'Bay 3'}
                  </span>
                </div>
              </div>

              {/* Extracted Symptoms */}
              {ticket.extracted_symptoms && ticket.extracted_symptoms.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1.5">
                    Recognized Symptoms:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ticket.extracted_symptoms.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Event Timeline */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                Immutable Event History & Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {timelineEvents.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative space-y-1">
                    <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-slate-950 border-2 border-cyan-400" />
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-cyan-400 uppercase tracking-wide">
                        {evt.event_type.replace('_', ' ')}
                      </span>
                      <span className="text-slate-500">{formatRelativeTime(evt.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-200">{evt.description}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Operator: {evt.performed_by}</p>
                  </div>
                ))}
                {timelineEvents.length === 0 && (
                  <p className="text-xs text-slate-500 italic">No historical events recorded yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Assigned Technician Card & Status Controls (1 Col) */}
        <div className="space-y-6">
          {/* Assigned Technician Profile */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-cyan-400" />
                Assigned Specialist
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {ticket.assigned_technician_name ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center font-mono font-bold text-cyan-400 text-sm">
                      {ticket.assigned_technician_name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{ticket.assigned_technician_name}</h4>
                      <p className="text-[11px] text-emerald-400 font-mono">Active on Ticket</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assignment:</span>
                      <span className="text-slate-200 font-mono">{formatRelativeTime(ticket.assigned_at)}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/tickets/${id}/recommendations`)}
                    className="w-full text-xs border-slate-700"
                  >
                    Change Assignment
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="h-10 w-10 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">No Technician Assigned</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Run recommendation engine to select an available expert.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/tickets/${id}/recommendations`)}
                    className="w-full text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950"
                  >
                    Run Recommendation Engine
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Lifecycle Status Transition */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-300">
                Update Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-2">
              {['open', 'in_triage', 'assigned', 'in_progress', 'resolved', 'closed'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleOpenStatusModal(st)}
                  disabled={ticket.status === st}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium border transition-all ${
                    ticket.status === st
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-bold'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="capitalize">{st.replace('_', ' ')}</span>
                  {ticket.status === st && <CheckCircle2 className="h-4 w-4 text-cyan-400" />}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Update Modal */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogHeader>
          <DialogTitle>Update Ticket Status</DialogTitle>
          <DialogDescription>
            Transition ticket status to <strong className="text-cyan-400 capitalize">{targetStatus.replace('_', ' ')}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="status-notes">Supervisor / Action Note</Label>
            <Textarea
              id="status-notes"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Technician commenced repair on spindle chuck assembly..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setStatusModalOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirmStatusUpdate}
            disabled={isUpdatingStatus}
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
          >
            {isUpdatingStatus ? 'Saving...' : 'Confirm Update'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
