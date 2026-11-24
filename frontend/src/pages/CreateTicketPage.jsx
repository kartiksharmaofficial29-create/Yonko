import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  Send,
  AlertCircle,
  HelpCircle,
  Zap,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea, Label } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { useGetMachinesQuery, useCreateTicketMutation, useAnalyzeTicketMutation } from '../store/apiSlice';

const SAMPLE_SCENARIOS = [
  {
    title: 'CNC Spindle Grinding',
    badge: 'Mechanical - High',
    badgeColor: 'border-red-500/50 text-red-400 bg-red-950/20',
    machineKeyword: 'CNC',
    text: 'CNC milling center making severe grinding noise near spindle chuck. Production stopped on line 2.',
  },
  {
    title: 'Hydraulic Seal Rupture',
    badge: 'Hydraulic - High',
    badgeColor: 'border-red-500/50 text-red-400 bg-red-950/20',
    machineKeyword: 'Press',
    text: 'Hydraulic press cylinder seal ruptured, fluid spraying and pooling on floor. Entire assembly line halted.',
  },
  {
    title: 'Motor Overheat (Negation Test)',
    badge: 'Electrical - Medium',
    badgeColor: 'border-amber-500/50 text-amber-400 bg-amber-950/20',
    machineKeyword: 'Conveyor',
    text: 'Conveyor drive motor running very hot with burning electrical smell, but no smoke or sparks observed.',
  },
  {
    title: 'Robotic Arm Jitter',
    badge: 'Electrical / Mech',
    badgeColor: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/20',
    machineKeyword: 'Arm',
    text: 'Robotic welding arm servo motor experiencing position encoder jitter during repeatable weld sequence.',
  },
  {
    title: 'Ambiguous / Routine Request',
    badge: 'Unknown - Low',
    badgeColor: 'border-purple-500/50 text-purple-400 bg-purple-950/20',
    machineKeyword: 'Lathe',
    text: 'Machine feels slightly sluggish today. Operator requesting routine shift maintenance check when convenient.',
  },
];

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { data: machinesData, isLoading: machinesLoading } = useGetMachinesQuery();
  const [createTicket, { isLoading: isSubmitting }] = useCreateTicketMutation();

  const [machineId, setMachineId] = useState('');
  const [reporterName, setReporterName] = useState('Marcus Vance (Shift Supervisor)');
  const [reportText, setReportText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const machines = machinesData?.results || machinesData || [];

  const handleSelectScenario = (scenario) => {
    setReportText(scenario.text);
    // Find matching machine if available
    const matchedMachine = machines.find((m) =>
      m.name.toLowerCase().includes(scenario.machineKeyword.toLowerCase())
    );
    if (matchedMachine) {
      setMachineId(matchedMachine.id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!machineId) {
      setErrorMsg('Please select an industrial machine asset.');
      return;
    }
    if (!reportText.trim()) {
      setErrorMsg('Please enter a natural-language fault description.');
      return;
    }

    setErrorMsg('');
    try {
      const payload = {
        machine: machineId,
        reporter_name: reporterName,
        raw_report_text: reportText.trim(),
      };
      const result = await createTicket(payload).unwrap();
      // Instantly route to the dedicated NLP analysis screen
      navigate(`/tickets/${result.id}/nlp`);
    } catch (err) {
      setErrorMsg(err.data?.error || err.data?.detail || 'Failed to submit maintenance report.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <FileText className="h-6 w-6 text-cyan-400" />
          <span>New Maintenance Fault Report</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Submit unstructured operator reports. The embedded NLP engine automatically classifies category, extracts components/symptoms, and determines operational priority.
        </p>
      </div>

      {/* Preset Test Case Scenarios (Quick Demo Fillers) */}
      <Card className="bg-slate-900/40 border-slate-800">
        <CardHeader className="pb-2.5">
          <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            Quick Test Cases & Industrial Prompts
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Click any real-world scenario to populate the form and evaluate NLP extraction accuracy:
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {SAMPLE_SCENARIOS.map((scenario, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectScenario(scenario)}
                className="text-left p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/60 transition-all group"
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                    {scenario.title}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${scenario.badgeColor}`}>
                    {scenario.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  "{scenario.text}"
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Form */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader className="border-b border-slate-800 pb-3">
          <CardTitle className="text-sm font-semibold text-slate-200">
            Report Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Machine Selection */}
              <div>
                <Label htmlFor="machine-select">Target Machine Asset *</Label>
                <Select
                  id="machine-select"
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value)}
                  disabled={machinesLoading}
                  required
                >
                  <option value="">Select an asset...</option>
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.machine_type} - {m.location})
                    </option>
                  ))}
                </Select>
              </div>

              {/* Reporter Name */}
              <div>
                <Label htmlFor="reporter-name">Reporter / Operator Name</Label>
                <Input
                  id="reporter-name"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  required
                />
              </div>
            </div>

            {/* Natural Language Fault Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="fault-desc">Unstructured Fault Report *</Label>
                <span className="text-[11px] text-slate-500 font-mono">
                  Preserves original wording & negations
                </span>
              </div>
              <Textarea
                id="fault-desc"
                rows={5}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Describe the machine behavior, audible symptoms, visual observations, and operational impact..."
                className="font-sans text-sm"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-cyan-400" />
                Tip: Mention machine parts (spindle, seal, motor), symptoms (grinding, leakage), and operational state (stopped, halted).
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tickets')}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 shadow-lg shadow-cyan-500/20 font-bold"
              >
                {isSubmitting ? (
                  <>Processing NLP Engine...</>
                ) : (
                  <>
                    <span>Submit & Launch AI Triage</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
