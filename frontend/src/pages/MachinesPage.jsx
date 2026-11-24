import React, { useState } from 'react';
import {
  Cpu,
  PlusCircle,
  Search,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Activity,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Label, Textarea } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/Dialog';
import { useGetMachinesQuery, useCreateMachineMutation } from '../store/apiSlice';
import { formatRelativeTime } from '../lib/utils';

export default function MachinesPage() {
  const { data: machinesData, isLoading, refetch } = useGetMachinesQuery();
  const [createMachine, { isLoading: isCreating }] = useCreateMachineMutation();

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [machineType, setMachineType] = useState('CNC');
  const [location, setLocation] = useState('Bay 1');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const machines = machinesData?.results || machinesData || [];

  const filteredMachines = machines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.machine_type.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddMachine = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Machine name is required.');
      return;
    }

    try {
      await createMachine({
        name: name.trim(),
        machine_type: machineType,
        location: location.trim(),
        description: description.trim(),
      }).unwrap();
      setDialogOpen(false);
      setName('');
      setDescription('');
      setErrorMsg('');
      refetch();
    } catch (err) {
      setErrorMsg(err.data?.name?.[0] || 'Failed to register machine asset.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Cpu className="h-6 w-6 text-cyan-400" />
            <span>Industrial Machinery Registry</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Catalog of monitored factory floor assets, workstation bays, and linked fault tickets.
          </p>
        </div>

        <Button onClick={() => setDialogOpen(true)} className="gap-2 shadow-md shadow-cyan-500/20">
          <PlusCircle className="h-4 w-4" />
          <span>Register New Machine</span>
        </Button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by name, type, or bay..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-xs font-mono text-slate-400">
          Total Monitored Assets: <span className="text-cyan-400 font-bold">{machines.length}</span>
        </div>
      </div>

      {/* Machine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMachines.map((machine) => (
          <Card key={machine.id} className="bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-all">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-100">{machine.name}</CardTitle>
                  <CardDescription className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-mono">
                    <MapPin className="h-3 w-3 text-cyan-400" />
                    {machine.location}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] border-cyan-500/40 text-cyan-400 bg-cyan-950/20 font-mono">
                  {machine.machine_type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {machine.description || 'Industrial production equipment.'}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-500">
                <span>Active Tickets: {machine.active_tickets_count || 0}</span>
                <span>ID #{machine.id}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredMachines.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No machines matched your search criteria.
          </div>
        )}
      </div>

      {/* Register Machine Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>Register Machine Asset</DialogTitle>
          <DialogDescription>
            Add a new industrial workstation or machinery unit to the database.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddMachine} className="space-y-4 py-2">
          {errorMsg && (
            <p className="text-xs text-red-400 p-2 rounded bg-red-950/50 border border-red-500/50">
              {errorMsg}
            </p>
          )}

          <div>
            <Label htmlFor="mach-name">Machine Name *</Label>
            <Input
              id="mach-name"
              placeholder="e.g. CNC Horizontal Boring Mill #2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="mach-type">Type Category</Label>
              <Select id="mach-type" value={machineType} onChange={(e) => setMachineType(e.target.value)}>
                <option value="CNC">CNC Milling / Lathe</option>
                <option value="Press">Stamping / Hydraulic Press</option>
                <option value="Conveyor">Conveyor / Assembly Drive</option>
                <option value="Robotics">Robotic Arm / Cell</option>
                <option value="Compressor">Pneumatic / Compressor</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="mach-loc">Facility Location</Label>
              <Input
                id="mach-loc"
                placeholder="e.g. Bay 4 - Line 2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="mach-desc">Description & Specs</Label>
            <Textarea
              id="mach-desc"
              rows={3}
              placeholder="Operational details, motor ratings, critical components..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isCreating} className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold">
              {isCreating ? 'Registering...' : 'Register Asset'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
