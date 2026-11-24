import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text, Html } from '@react-three/drei';
import { Activity, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

function MachineAssembly({ status = 'active', priority = 'low', activeComponent = null, onSelectComponent }) {
  const spindleRef = useRef();
  const [hovered, setHovered] = useState(null);

  // Rotate the spindle if status is normal/active
  useFrame((state, delta) => {
    if (spindleRef.current && status !== 'critical') {
      spindleRef.current.rotation.x += delta * (status === 'warning' ? 1.0 : 3.0);
    }
  });

  // Signal beacon colors
  const isHigh = priority?.toLowerCase() === 'high' || status === 'critical';
  const isMed = priority?.toLowerCase() === 'medium' || status === 'warning';
  const beaconColor = isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981';

  return (
    <group position={[0, -0.6, 0]}>
      {/* Heavy Machine Base (Bed) */}
      <mesh
        position={[0, 0.25, 0]}
        castShadow
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); setHovered('Bed & Frame'); }}
        onPointerOut={() => setHovered(null)}
        onClick={() => onSelectComponent && onSelectComponent('Machine Bed')}
      >
        <boxGeometry args={[3.2, 0.5, 1.8]} />
        <meshStandardMaterial
          color={hovered === 'Bed & Frame' ? '#334155' : '#1e293b'}
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* Main Base Feet */}
      <mesh position={[-1.3, -0.05, 0.6]}>
        <cylinderGeometry args={[0.15, 0.18, 0.2, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} />
      </mesh>
      <mesh position={[1.3, -0.05, 0.6]}>
        <cylinderGeometry args={[0.15, 0.18, 0.2, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} />
      </mesh>
      <mesh position={[-1.3, -0.05, -0.6]}>
        <cylinderGeometry args={[0.15, 0.18, 0.2, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} />
      </mesh>
      <mesh position={[1.3, -0.05, -0.6]}>
        <cylinderGeometry args={[0.15, 0.18, 0.2, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} />
      </mesh>

      {/* Left Headstock Housing */}
      <mesh
        position={[-1.0, 1.0, 0]}
        castShadow
        onPointerOver={(e) => { e.stopPropagation(); setHovered('Headstock Motor Enclosure'); }}
        onPointerOut={() => setHovered(null)}
        onClick={() => onSelectComponent && onSelectComponent('Headstock Motor')}
      >
        <boxGeometry args={[1.0, 1.1, 1.6]} />
        <meshStandardMaterial
          color={hovered === 'Headstock Motor Enclosure' ? '#0284c7' : '#0369a1'}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Spindle Chuck (Rotating assembly) */}
      <group position={[-0.4, 1.1, 0]} ref={spindleRef}>
        <mesh
          castShadow
          onPointerOver={(e) => { e.stopPropagation(); setHovered('Precision Spindle & Chuck'); }}
          onPointerOut={() => setHovered(null)}
          onClick={() => onSelectComponent && onSelectComponent('Spindle')}
        >
          <cylinderGeometry args={[0.36, 0.36, 0.35, 24]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={hovered === 'Precision Spindle & Chuck' || activeComponent?.toLowerCase().includes('spindle') ? '#f59e0b' : '#94a3b8'}
            metalness={0.95}
            roughness={0.2}
          />
        </mesh>
        {/* Chuck Jaws */}
        <mesh position={[0.2, 0.2, 0]}>
          <boxGeometry args={[0.12, 0.15, 0.12]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>
        <mesh position={[0.2, -0.15, 0.15]}>
          <boxGeometry args={[0.12, 0.15, 0.12]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>
        <mesh position={[0.2, -0.15, -0.15]}>
          <boxGeometry args={[0.12, 0.15, 0.12]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>
      </group>

      {/* Lathe Bed Dual Guide Rails */}
      <mesh position={[0.4, 0.55, 0.25]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 2.0, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.1} />
      </mesh>
      <mesh position={[0.4, 0.55, -0.25]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 2.0, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.1} />
      </mesh>

      {/* Tool Carriage / Cross-slide */}
      <mesh
        position={[0.2, 0.85, 0]}
        castShadow
        onPointerOver={(e) => { e.stopPropagation(); setHovered('Tool Turret & Carriage'); }}
        onPointerOut={() => setHovered(null)}
        onClick={() => onSelectComponent && onSelectComponent('Tool Turret')}
      >
        <boxGeometry args={[0.6, 0.5, 0.7]} />
        <meshStandardMaterial
          color={hovered === 'Tool Turret & Carriage' ? '#475569' : '#334155'}
          metalness={0.7}
          roughness={0.4}
        />
      </mesh>

      {/* Cutting Tool Post */}
      <mesh position={[0.2, 1.2, 0]} castShadow>
        <boxGeometry args={[0.2, 0.25, 0.2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} />
      </mesh>
      {/* Carbide Tool Bit */}
      <mesh position={[0.05, 1.18, 0]}>
        <boxGeometry args={[0.18, 0.05, 0.05]} />
        <meshStandardMaterial color="#e2e8f0" metalness={1.0} roughness={0.1} />
      </mesh>

      {/* Right Tailstock */}
      <mesh
        position={[1.1, 0.9, 0]}
        castShadow
        onPointerOver={(e) => { e.stopPropagation(); setHovered('Tailstock Center'); }}
        onPointerOut={() => setHovered(null)}
        onClick={() => onSelectComponent && onSelectComponent('Tailstock')}
      >
        <boxGeometry args={[0.5, 0.6, 0.6]} />
        <meshStandardMaterial
          color={hovered === 'Tailstock Center' ? '#0ea5e9' : '#0284c7'}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0.75, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.06, 0.25, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
      </mesh>

      {/* Industrial Safety Glass Protective Shield (Translucent) */}
      <mesh position={[0.1, 1.15, 0.65]}>
        <boxGeometry args={[1.8, 1.1, 0.04]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transmission={0.85}
          opacity={0.6}
          transparent
          roughness={0.1}
          ior={1.5}
        />
      </mesh>
      <mesh position={[0.1, 1.72, 0.65]}>
        <boxGeometry args={[1.84, 0.05, 0.06]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>

      {/* Industrial Stack Beacon Tower (Red/Amber/Green) */}
      <group position={[-1.3, 1.6, -0.6]}>
        {/* Mast */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.5, 12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        {/* Red Tier */}
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={isHigh ? 2.5 : 0.2}
          />
        </mesh>
        {/* Amber Tier */}
        <mesh position={[0, 0.51, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={isMed ? 2.0 : 0.2}
          />
        </mesh>
        {/* Green Tier */}
        <mesh position={[0, 0.40, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={!isHigh && !isMed ? 2.0 : 0.2}
          />
        </mesh>
        {/* Point light for glowing beacon */}
        <pointLight position={[0, 0.6, 0]} color={beaconColor} intensity={2.0} distance={2.5} />
      </group>

      {/* Floating Tooltip Callout */}
      {hovered && (
        <Html position={[0, 2.1, 0]} center distanceFactor={6}>
          <div className="bg-slate-900/90 text-cyan-300 border border-cyan-500/50 px-2.5 py-1 rounded text-xs font-mono shadow-xl whitespace-nowrap backdrop-blur-md pointer-events-none">
            {hovered}
          </div>
        </Html>
      )}
    </group>
  );
}

function FallbackPlaceholder({ machineName, priority, status }) {
  return (
    <div className="w-full h-full min-h-[260px] flex flex-col items-center justify-center bg-slate-900/60 rounded-xl border border-slate-800 p-6 text-center">
      <div className="relative mb-3">
        <div className="h-16 w-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Cpu className="h-8 w-8 animate-pulse" />
        </div>
        <span
          className={`absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-slate-900 ${
            priority === 'high' ? 'bg-red-500' : priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
        />
      </div>
      <h4 className="text-sm font-bold text-slate-200">{machineName || 'Industrial Workstation Asset'}</h4>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        Interactive 3D digital twin telemetry synced with active status.
      </p>
      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-800/80 text-cyan-400 border border-slate-700">
        <ShieldCheck className="h-3 w-3" />
        Operational Status: {status?.toUpperCase() || 'NORMAL'}
      </div>
    </div>
  );
}

export default function ThreeMachineModel({
  machineName = 'CNC Lathe Workstation',
  status = 'active',
  priority = 'low',
  activeComponent = null,
  onSelectComponent,
  className = 'h-72 w-full',
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <FallbackPlaceholder machineName={machineName} priority={priority} status={status} />;
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 ${className}`}>
      {/* Overlay Machine Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-200 font-medium">
        <span
          className={`h-2.5 w-2.5 rounded-full animate-ping ${
            priority === 'high' ? 'bg-red-500' : priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
        />
        <span className="font-mono text-cyan-400 font-semibold">{machineName}</span>
      </div>

      <div className="absolute top-3 right-3 z-10 text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-900/60 px-2 py-1 rounded border border-slate-800/60">
        3D Visual Model
      </div>

      {/* Instructions pill */}
      <div className="absolute bottom-2.5 left-3 z-10 text-[10px] font-mono text-slate-500 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800/40">
        Rotate: Drag | Zoom: Scroll
      </div>

      <Suspense fallback={<FallbackPlaceholder machineName={machineName} priority={priority} status={status} />}>
        <Canvas
          shadows
          camera={{ position: [2.8, 2.2, 3.2], fov: 45 }}
          className="cursor-grab active:cursor-grabbing"
          onError={() => setHasError(true)}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 8, 4]} intensity={1.2} castShadow shadow-mapSize={1024} />
          <pointLight position={[-4, 3, -2]} intensity={0.5} color="#38bdf8" />
          <pointLight position={[3, -1, 3]} intensity={0.4} color="#06b6d4" />

          <MachineAssembly
            status={status}
            priority={priority}
            activeComponent={activeComponent}
            onSelectComponent={onSelectComponent}
          />

          <OrbitControls
            enablePan={false}
            enableDamping
            dampingFactor={0.05}
            minDistance={2.2}
            maxDistance={5.5}
            maxPolarAngle={Math.PI / 2 + 0.05}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
