import React, { useState } from 'react';
import {
  Users,
  Search,
  Phone,
  Clock,
  Briefcase,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useGetTechniciansQuery, useToggleTechnicianAvailabilityMutation } from '../store/apiSlice';

export default function TechniciansPage() {
  const { data: techsData, isLoading, refetch } = useGetTechniciansQuery();
  const [toggleAvailability, { isLoading: isToggling }] = useToggleTechnicianAvailabilityMutation();

  const [search, setSearch] = useState('');
  const [filterShift, setFilterShift] = useState('');

  const technicians = techsData?.results || techsData || [];

  const filteredTechs = technicians.filter((tech) => {
    const matchSearch =
      tech.name.toLowerCase().includes(search.toLowerCase()) ||
      tech.skills?.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      tech.expertise_description?.toLowerCase().includes(search.toLowerCase());
    const matchShift = filterShift ? String(tech.shift) === filterShift : true;
    return matchSearch && matchShift;
  });

  const handleToggle = async (techId) => {
    try {
      await toggleAvailability(techId).unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-400" />
            <span>Technician Roster & Skill Matrix</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Internal database of certified maintenance specialists, domain expertise vectors, and live shift availability.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by technician name, skill, or tool..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {['', '1', '2', '3'].map((shift) => (
            <Button
              key={shift}
              size="sm"
              variant={filterShift === shift ? 'default' : 'outline'}
              onClick={() => setFilterShift(shift)}
              className="text-xs font-mono h-8"
            >
              {shift === '' ? 'All Shifts' : `Shift ${shift}`}
            </Button>
          ))}
        </div>
      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTechs.map((tech) => (
          <Card
            key={tech.id}
            className={`bg-slate-900/60 border-slate-800 transition-all ${
              tech.is_available ? 'hover:border-cyan-500/50' : 'opacity-80'
            }`}
          >
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-400 font-mono">
                    {tech.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-100">{tech.name}</CardTitle>
                    <p className="text-[11px] font-mono text-slate-400">
                      Shift {tech.shift} • {tech.experience_years || 5} yrs exp
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(tech.id)}
                  title="Click to toggle availability"
                  className="transition-transform active:scale-95"
                >
                  <Badge
                    variant={tech.is_available ? 'default' : 'outline'}
                    className={`cursor-pointer text-[10px] font-mono ${
                      tech.is_available
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/60'
                        : 'border-slate-700 text-slate-500'
                    }`}
                  >
                    {tech.is_available ? 'AVAILABLE' : 'OFF-SHIFT / BUSY'}
                  </Badge>
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {/* Expertise Bio */}
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {tech.expertise_description}
              </p>

              {/* Skills Chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {tech.skills?.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Contact info & Toggle Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-cyan-400" />
                  {tech.phone || 'Extension 404'}
                </span>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggle(tech.id)}
                  className="h-6 text-[10px] font-mono text-cyan-400 hover:text-cyan-300"
                >
                  Toggle Status
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTechs.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No technicians match your search query.
          </div>
        )}
      </div>
    </div>
  );
}
