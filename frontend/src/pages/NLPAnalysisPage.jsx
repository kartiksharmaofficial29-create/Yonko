import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sliders,
  Check,
  FileText,
  ShieldCheck,
  Layers,
  Cpu,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Label } from '../components/ui/Input';
import {
  useGetTicketQuery,
  useAnalyzeTicketMutation,
  useUpdateTicketMutation,
} from '../store/apiSlice';
import { getCategoryColor, getPriorityBadgeVariant } from '../lib/utils';

export default function NLPAnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: ticket, isLoading, refetch } = useGetTicketQuery(id);
  const [analyzeTicket, { isLoading: isAnalyzing }] = useAnalyzeTicketMutation();
  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();

  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [supervisorNotes, setSupervisorNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when ticket loads
  React.useEffect(() => {
    if (ticket) {
      setSelectedCategory(ticket.extracted_category || 'Unknown');
      setSelectedPriority(ticket.extracted_priority || 'Low');
    }
  }, [ticket]);

  const handleReAnalyze = async () => {
    try {
      await analyzeTicket(id).unwrap();
      refetch();
    } catch (err) {
      console.error('Re-analysis failed:', err);
    }
  };

  const handleConfirmTriage = async () => {
    try {
      await updateTicket({
        id,
        status: 'in_triage',
        extracted_category: selectedCategory,
        extracted_priority: selectedPriority,
        supervisor_notes: supervisorNotes || 'Confirmed triage classification by supervisor.',
      }).unwrap();
      setSavedSuccess(true);
      // Navigate to recommendation engine
      setTimeout(() => {
        navigate(`/tickets/${id}/recommendations`);
      }, 500);
    } catch (err) {
      console.error('Failed to update ticket:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 space-y-3 font-mono text-xs">
        <Sparkles className="h-8 w-8 text-cyan-400 animate-spin" />
        <p>Extracting industrial entities, parsing negations, and computing semantic embeddings...</p>
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

  const confidenceScore = Math.round((ticket.confidence_score || 0.85) * 100);

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2 mt-1">
            <Sparkles className="h-6 w-6 text-cyan-400" />
            <span>Automated NLP Triage Analysis</span>
          </h1>
          <p className="text-sm text-slate-400">
            Review model entity extractions, verified negations, semantic category match, and operational priority triggers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReAnalyze}
            disabled={isAnalyzing}
            className="text-xs gap-1.5 border-slate-700"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Re-run NLP Engine</span>
          </Button>

          <Button
            size="sm"
            onClick={handleConfirmTriage}
            disabled={isUpdating}
            className="gap-2 shadow-lg shadow-cyan-500/20 font-bold"
          >
            <span>Proceed to Technician Matching</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Grid: Original Raw Report vs Structured Extractions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Original Natural Language Input */}
        <div className="space-y-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  Original Unstructured Operator Report
                </CardTitle>
                <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
                  RAW INPUT PRESERVED
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-sans leading-relaxed shadow-inner">
                "{ticket.raw_report_text}"
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Reporter: {ticket.reporter_name}</span>
                <span>Asset: {ticket.machine_name}</span>
              </div>
            </CardContent>
          </Card>

          {/* Model Operational Explanation */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Info className="h-4 w-4 text-cyan-400" />
                Explainable Decision Reasoning
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2">
                <p className="font-semibold text-cyan-400 font-mono text-[11px] uppercase tracking-wider">
                  Category Determination:
                </p>
                <p className="text-slate-300">
                  {ticket.explanation || 'Semantic embeddings matched mechanical vibration and spindle grinding profiles.'}
                </p>
              </div>

              {ticket.triggering_phrase && (
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <p className="font-semibold text-amber-400 font-mono text-[11px] uppercase tracking-wider">
                    Priority Trigger Phrase:
                  </p>
                  <p className="text-slate-200 font-medium">
                    "{ticket.triggering_phrase}"
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Flagged as an operational production impact constraint.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Structured Extracted Entities */}
        <div className="space-y-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-cyan-400" />
                  NLP Entity Extractions
                </CardTitle>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  spaCy + Transformers
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Components */}
              <div>
                <Label className="text-slate-400">Identified Components</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {ticket.extracted_components && ticket.extracted_components.length > 0 ? (
                    ticket.extracted_components.map((comp, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40"
                      >
                        {comp}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No specific component mentioned</span>
                  )}
                </div>
              </div>

              {/* Symptoms & Negations */}
              <div>
                <Label className="text-slate-400">Reported Symptoms & Negation Status</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ticket.extracted_symptoms && ticket.extracted_symptoms.length > 0 ? (
                    ticket.extracted_symptoms.map((sym, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-950/60 text-amber-300 border border-amber-500/40 flex items-center gap-1.5"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {sym}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">None detected</span>
                  )}

                  {/* Explicit Negated Symptoms */}
                  {ticket.negated_symptoms && ticket.negated_symptoms.length > 0 && (
                    ticket.negated_symptoms.map((neg, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-500/50 flex items-center gap-1.5"
                        title="Negation confirmed: explicitly ruled out by operator"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <s>{neg}</s>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-tight">(Ruled Out)</span>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Operational Impact */}
              <div>
                <Label className="text-slate-400">Production Impact Phrase</Label>
                <div className="mt-1">
                  {ticket.extracted_impact ? (
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-red-950/60 text-red-300 border border-red-500/40">
                      {ticket.extracted_impact}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 italic">No direct impact phrase</span>
                  )}
                </div>
              </div>

              {/* Classification Confidence Progress Bar */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-mono">Semantic Category Confidence</span>
                  <span className="font-mono text-cyan-400 font-bold">{confidenceScore}% Match</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full"
                    style={{ width: `${confidenceScore}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supervisor Confirmation & Override Controls */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-cyan-400" />
                  Supervisor Review & Confirmation
                </CardTitle>
                <span className="text-[11px] text-slate-400 font-mono">Human in the Loop</span>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Category Override */}
                <div>
                  <Label>Assigned Category</Label>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Hydraulic">Hydraulic</option>
                    <option value="Unknown">Unknown / Ambiguous</option>
                  </Select>
                </div>

                {/* Priority Override */}
                <div>
                  <Label>Operational Priority</Label>
                  <Select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                  >
                    <option value="High">High (Immediate)</option>
                    <option value="Medium">Medium (Scheduled)</option>
                    <option value="Low">Low (Routine)</option>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Supervisor Dispatch Notes (Optional)</Label>
                <input
                  type="text"
                  placeholder="e.g. Approved mechanical assignment. Verify spindle runout."
                  value={supervisorNotes}
                  onChange={(e) => setSupervisorNotes(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end">
                <Button
                  onClick={handleConfirmTriage}
                  disabled={isUpdating}
                  className="w-full gap-2 shadow-md shadow-cyan-500/20 font-bold"
                >
                  <Check className="h-4 w-4" />
                  <span>Confirm Triage & Match Technicians</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
