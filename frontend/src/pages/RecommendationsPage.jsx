import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Award,
  CheckCircle2,
  AlertCircle,
  Phone,
  Clock,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../components/ui/Dialog';
import { Label } from '../components/ui/Input';
import {
  useGetTicketQuery,
  useGetMatchesQuery,
  useAssignTicketMutation,
} from '../store/apiSlice';
import { getCategoryColor, getPriorityBadgeVariant } from '../lib/utils';

export default function RecommendationsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: ticket, isLoading: ticketLoading } = useGetTicketQuery(id);
  const { data: matches, isLoading: matchesLoading, refetch } = useGetMatchesQuery(id);
  const [assignTicket, { isLoading: isAssigning }] = useAssignTicketMutation();

  const [selectedTech, setSelectedTech] = useState(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenAssignModal = (tech) => {
    setSelectedTech(tech);
    setAssignmentNotes(`Dispatched for ${ticket?.extracted_category || 'maintenance'} issue.`);
    setDialogOpen(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedTech) return;
    try {
      await assignTicket({
        id,
        technician_id: selectedTech.id,
        notes: assignmentNotes,
      }).unwrap();
      setDialogOpen(false);
      navigate(`/tickets/${id}`);
    } catch (err) {
      console.error('Assignment failed:', err);
    }
  };

  if (ticketLoading || matchesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 space-y-3 font-mono text-xs">
        <Sparkles className="h-8 w-8 text-cyan-400 animate-spin" />
        <p>Evaluating technician skill matrices, availability schedules, and domain expertise vectors...</p>
      </div>
    );
  }

  const recommendations = matches || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <button
            onClick={() => navigate(`/tickets/${id}/nlp`)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-mono mb-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to NLP Analysis</span>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-400" />
            <span>Technician Recommendation Engine</span>
          </h1>
          <p className="text-sm text-slate-400">
            Explainable matching ranked by verified domain skills, semantic expertise vector alignment, and real-time shift availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 font-mono text-xs px-3 py-1">
            {recommendations.length} Available Matches
          </Badge>
        </div>
      </div>

      {/* Ticket Context Header Card */}
      {ticket && (
        <Card className="bg-slate-900/40 border-slate-800">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400">{ticket.ticket_id}</span>
                <span className="text-slate-600">•</span>
                <span className="text-sm font-semibold text-slate-200">{ticket.machine_name}</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">
                "{ticket.raw_report_text}"
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <Badge variant="outline" className={`text-xs ${getCategoryColor(ticket.extracted_category)}`}>
                {ticket.extracted_category}
              </Badge>
              <Badge variant={getPriorityBadgeVariant(ticket.extracted_priority)} className="text-xs">
                {ticket.extracted_priority} Priority
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ranked Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const isTopMatch = index === 0;
          const score = Math.round(rec.match_score);

          return (
            <Card
              key={rec.technician_id || rec.id}
              className={`bg-slate-900/60 border-slate-800 transition-all duration-200 hover:border-slate-700 ${
                isTopMatch ? 'ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-950/20' : ''
              }`}
            >
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Tech Info & Scores */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Rank Badge / Score Circle */}
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <div
                        className={`h-16 w-16 rounded-2xl flex flex-col items-center justify-center border ${
                          isTopMatch
                            ? 'bg-gradient-to-tr from-cyan-950 to-slate-900 border-cyan-500/60 text-cyan-400'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="text-lg font-bold font-mono leading-none">{score}%</span>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 mt-1">Match</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 mt-1">
                        Rank #{index + 1}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                          {rec.name}
                          {isTopMatch && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              TOP RECOMMENDATION
                            </span>
                          )}
                        </h3>
                        <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400 bg-emerald-950/30">
                          Available (Shift {rec.shift || 1})
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-cyan-400" />
                          {rec.phone || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          Active Tickets: {rec.active_tickets_count || 0}
                        </span>
                      </div>

                      {/* Skills Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rec.skills && rec.skills.map((skill, sIdx) => {
                          const isMatched = rec.matching_skills && rec.matching_skills.includes(skill);
                          return (
                            <span
                              key={sIdx}
                              className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                                isMatched
                                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60 font-semibold'
                                  : 'bg-slate-950 text-slate-400 border-slate-800'
                              }`}
                            >
                              {skill}
                            </span>
                          );
                        })}
                      </div>

                      {/* Explainable Decision Factors */}
                      <div className="mt-3 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                          Explainable Matching Factors
                        </p>
                        <ul className="text-xs text-slate-300 space-y-1">
                          {rec.explanation ? (
                            Array.isArray(rec.explanation) ? (
                              rec.explanation.map((exp, eIdx) => (
                                <li key={eIdx} className="flex items-start gap-1.5">
                                  <span className="text-cyan-400 mt-0.5">•</span>
                                  <span>{exp}</span>
                                </li>
                              ))
                            ) : (
                              <li className="flex items-start gap-1.5">
                                <span className="text-cyan-400 mt-0.5">•</span>
                                <span>{rec.explanation}</span>
                              </li>
                            )
                          ) : (
                            <li className="flex items-start gap-1.5">
                              <span className="text-cyan-400 mt-0.5">•</span>
                              <span>Strong category alignment with current shift availability.</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Right: Assign CTA */}
                  <div className="lg:border-l lg:border-slate-800 lg:pl-6 flex flex-col justify-center shrink-0">
                    <Button
                      onClick={() => handleOpenAssignModal(rec)}
                      className={`gap-2 font-bold ${
                        isTopMatch
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                          : ''
                      }`}
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Assign Technician</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {recommendations.length === 0 && (
          <Card className="bg-slate-900/40 border-slate-800 p-8 text-center text-slate-400">
            <AlertCircle className="h-8 w-8 text-amber-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-200">No Currently Available Technicians</h3>
            <p className="text-xs text-slate-500 mt-1">
              All specialized technicians are currently assigned or off-shift. Check the Technician Roster to toggle availability.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/technicians')}
              className="mt-4 text-xs"
            >
              Manage Technician Roster
            </Button>
          </Card>
        )}
      </div>

      {/* Assignment Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>
            <span>Confirm Technician Assignment</span>
          </DialogTitle>
          <DialogDescription>
            You are assigning <strong className="text-cyan-400">{selectedTech?.name}</strong> to ticket{' '}
            <span className="font-mono text-slate-200">{ticket?.ticket_id}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Machine:</span>
              <span className="font-semibold text-slate-200">{ticket?.machine_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Triage Category:</span>
              <span className="font-semibold text-cyan-400">{ticket?.extracted_category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Technician Match:</span>
              <span className="font-mono text-emerald-400 font-bold">{Math.round(selectedTech?.match_score || 0)}%</span>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Supervisor Dispatch Notes</Label>
            <input
              id="notes"
              type="text"
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirmAssignment}
            disabled={isAssigning}
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
          >
            {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
