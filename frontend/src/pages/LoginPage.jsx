import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, ShieldCheck, Lock, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('supervisor');
  const [password, setPassword] = useState('supervisor123');

  const handleLogin = (e) => {
    e.preventDefault();
    // For demo MVP, authenticate directly and redirect to command center
    navigate('/');
  };

  const fillCredentials = (role) => {
    if (role === 'supervisor') {
      setUsername('supervisor');
      setPassword('supervisor123');
    } else {
      setUsername('admin');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-400 items-center justify-center shadow-xl shadow-cyan-500/25">
            <Radar className="h-7 w-7 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-slate-100">
            Repair<span className="text-cyan-400">Radar</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">
            Industrial Maintenance Triage & Matching Platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-900/80 border-slate-800 shadow-2xl">
          <CardHeader className="pb-3 border-b border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-100">
              Supervisor Authentication
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Sign in to review AI triage reports and dispatch technicians
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2 font-bold shadow-lg shadow-cyan-500/20 mt-2">
                <span>Enter Operations Command</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="pt-4 border-t border-slate-800 text-center">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
                One-Click Demo Credentials
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillCredentials('supervisor')}
                  className="text-xs border-slate-700"
                >
                  Shift Supervisor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillCredentials('admin')}
                  className="text-xs border-slate-700"
                >
                  Plant Admin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] font-mono text-slate-600">
          Enterprise Security Protocol • Role-Based Access Control
        </p>
      </div>
    </div>
  );
}
