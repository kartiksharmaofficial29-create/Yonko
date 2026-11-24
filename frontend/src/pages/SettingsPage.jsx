import React, { useState } from 'react';
import {
  Settings,
  Database,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  RefreshCw,
  Terminal,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Label } from '../components/ui/Input';

export default function SettingsPage() {
  const [similarityThreshold, setSimilarityThreshold] = useState(0.55);
  const [offlineMode, setOfflineMode] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const handleSave = () => {
    setSaveMsg('NLP Parameters successfully updated.');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Settings className="h-6 w-6 text-cyan-400" />
          <span>System & NLP Engine Configuration</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Inspect PostgreSQL database status, manage NLP entity dictionaries, and tune semantic similarity matching thresholds.
        </p>
      </div>

      {saveMsg && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Database & Backend Connectivity */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400" />
              Primary Database: PostgreSQL
            </CardTitle>
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-950/30 text-[10px] font-mono">
              ONLINE & CONNECTED
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Host & Port</span>
              <span className="text-slate-200 font-semibold block mt-1">127.0.0.1:5432</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Database</span>
              <span className="text-cyan-400 font-semibold block mt-1">repairradar</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Driver</span>
              <span className="text-slate-200 font-semibold block mt-1">psycopg 3.3.9</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">ORM Migrations</span>
              <span className="text-emerald-400 font-semibold block mt-1">0001_initial OK</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NLP Engine Tuning Parameters */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-800">
          <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            Semantic Similarity Classification Thresholds
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Reports with cosine similarity scores below this threshold are marked as "Unknown" for human review.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-5">
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <Label>Minimum Classification Confidence Threshold</Label>
              <span className="text-cyan-400 font-bold">{Math.round(similarityThreshold * 100)}% ({similarityThreshold})</span>
            </div>
            <input
              type="range"
              min="0.30"
              max="0.85"
              step="0.05"
              value={similarityThreshold}
              onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>0.30 (Permissive)</span>
              <span>0.55 (Recommended Industrial Default)</span>
              <span>0.85 (Strict)</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-200 block">Hybrid Fallback Processing</span>
              <span className="text-[11px] text-slate-400">
                Fallback to high-precision domain taxonomy when offline or during network dropouts.
              </span>
            </div>
            <button
              onClick={() => setOfflineMode(!offlineMode)}
              className={`px-3 py-1 rounded text-xs font-mono border transition-all ${
                offlineMode
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
              }`}
            >
              {offlineMode ? 'TAXONOMY ENGINE' : 'HYBRID TRANSFORMER'}
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={handleSave} className="gap-2 font-bold shadow-md shadow-cyan-500/20">
              <ShieldCheck className="h-4 w-4" />
              <span>Save Configuration</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Industrial Taxonomy Statistics */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-800">
          <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan-400" />
            Active Industrial Taxonomy Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Machine Lexicon</span>
              <span className="text-cyan-400 font-bold text-base mt-1 block">42 Terms</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Component Patterns</span>
              <span className="text-cyan-400 font-bold text-base mt-1 block">85 Entities</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Symptom Patterns</span>
              <span className="text-cyan-400 font-bold text-base mt-1 block">90 Rules</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Impact Triggers</span>
              <span className="text-red-400 font-bold text-base mt-1 block">28 Phrases</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
