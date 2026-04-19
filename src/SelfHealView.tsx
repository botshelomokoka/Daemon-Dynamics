import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestore-utils';
import { 
  Activity, ShieldAlert, Cpu, CheckCircle2, AlertTriangle, Play, Loader2, Database, Network, GitPullRequest, Code2, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';

interface RepairLog {
  id: string;
  anomaly: string;
  rootCause: string;
  resolution: string;
  status: string;
  confidenceScore: number;
  timestamp: any;
  contextTrigger: string;
}

export function SelfHealView() {
  const [repairs, setRepairs] = useState<RepairLog[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanContext, setScanContext] = useState('');

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'repairs'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setRepairs(snap.docs.map(d => ({ id: d.id, ...d.data() } as RepairLog)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'repairs');
    });
    return () => unsub();
  }, []);

  const triggerRepair = async () => {
    if (!scanContext) return;
    setIsScanning(true);
    try {
      const res = await fetch('/api/ai/self-repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anomalyContext: scanContext })
      });
      if (res.ok) {
        setScanContext('');
      } else {
        console.error("Failed repair scan");
      }
    } catch(e) {
      console.error("AI Repair Endpoint Error", e);
    }
    setIsScanning(false);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-[#14F195]';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 lg:col-span-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <ShieldAlert className="w-8 h-8 text-rose-400" />
            </div>
            Self-Healing Nexus
          </h2>
          <p className="text-zinc-400 mt-1 max-w-2xl">
            AI-driven autonomic maintenance and real-time state correction protocols for internal systems.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-[10px] font-mono border-rose-500/30 text-rose-400 bg-rose-500/5 px-3 py-1 uppercase tracking-widest">
            AUTOMIC_REPAIR_ACTIVE
          </Badge>
          <Button 
            variant="outline"
            className="border-zinc-800 bg-zinc-900 text-zinc-300 font-bold px-6 py-6 rounded-xl hover:bg-zinc-800 transition-all"
          >
            <Database className="w-4 h-4 mr-2" /> GLOBAL_AUDIT
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-zinc-950/50 border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 py-10">
            <Cpu className="w-24 h-24 text-blue-500" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-blue-500/10 rounded-2xl">
                <ShieldAlert className="w-6 h-6 text-blue-400" />
              </div>
              <Badge className="bg-blue-500/10 text-blue-400 border-none text-[8px] font-bold py-1">DIAGNOSTIC_MODE</Badge>
            </div>
            
            <h3 className="font-bold text-xl text-white mb-2 uppercase tracking-tight">Trigger Anomaly Scan</h3>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              Identify protocol drift or latency bottlenecks. The Intelligence Core will formulate and deploy a localized patch.
            </p>
            
            <textarea 
              className="w-full h-32 bg-black border border-white/10 rounded-2xl p-4 text-sm text-zinc-300 mb-4 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-700 font-mono"
              placeholder="Ex: 'Stale transaction nonces freezing agent dispatch in node-12'"
              value={scanContext}
              onChange={(e) => setScanContext(e.target.value)}
            />

            <Button 
              disabled={isScanning || !scanContext}
              onClick={triggerRepair}
              className="w-full h-14 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:bg-blue-50 active:scale-95 transition-all shadow-xl shadow-white/5"
            >
              {isScanning ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> COMPILING_PATCH...</>
              ) : (
                <><Play className="w-4 h-4 mr-2 text-blue-500" /> INITIALIZE_REPAIR</>
              )}
            </Button>
          </div>
        </div>

        <div className="md:col-span-2 bg-zinc-950/50 border border-white/5 rounded-3xl overflow-hidden flex flex-col relative">
          <div className="border-b border-white/5 p-6 bg-white/5 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#14F195]/10 rounded-lg">
                <Activity className="w-4 h-4 text-[#14F195]" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Autonomic Repair Log</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Live_Monitoring</span>
            </div>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto max-h-[500px] space-y-4 font-mono custom-scrollbar">
            <AnimatePresence>
              {repairs.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-zinc-800 opacity-40">
                  <CheckCircle2 className="w-16 h-16 mb-4" />
                  <p className="text-xs font-bold tracking-widest">SYSTEM_OPTIMAL_NO_FAULTS_DETECTED</p>
                </div>
              ) : (
                repairs.map((repair) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={repair.id} 
                    className="bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          repair.status.includes('Resolved') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                        }`}>
                          {repair.status}
                        </span>
                        <span className="text-[10px] text-zinc-600 italic">
                          {repair.timestamp?.toDate ? new Date(repair.timestamp.toDate()).toLocaleTimeString() : 'Just now'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${getConfidenceColor(repair.confidenceScore)}`}>
                          CONF: {repair.confidenceScore}%
                        </span>
                        <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${getConfidenceColor(repair.confidenceScore).replace('text-', 'bg-')}`} style={{ width: `${repair.confidenceScore}%` }} />
                        </div>
                      </div>
                    </div>

                    <h4 className="font-bold text-[14px] text-white mb-2 italic">"{repair.anomaly}"</h4>
                    <p className="text-[11px] text-zinc-500 mb-6 border-l border-zinc-800 pl-4 py-1 leading-relaxed">TRIG: {repair.contextTrigger}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 rounded-xl border border-white/5">
                      <div>
                        <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                          <AlertTriangle className="w-3 h-3 text-orange-400" /> Root Cause
                        </span>
                        <p className="text-[11px] text-zinc-400 leading-relaxed italic">{repair.rootCause}</p>
                      </div>
                      <div>
                        <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                          <Code2 className="w-3 h-3 text-[#14F195]" /> Resolution deployed
                        </span>
                        <p className="text-[11px] text-emerald-400 leading-relaxed font-bold tracking-tight">{repair.resolution}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Cpu />, label: "Compute Nodes", status: "STABLE", sub: "1.2ms Variance", color: "text-blue-400" },
          { icon: <Network />, label: "Mesh Routing", status: "OPTIMIZED", sub: "99.9% Delivery", color: "text-[#14F195]" },
          { icon: <Database />, label: "Semantic State", status: "SYNCED", sub: "Zero Collisions", color: "text-purple-400" },
          { icon: <RefreshCw />, label: "Auto-Patching", status: "STANDBY", sub: "Active Listen", color: "text-orange-400" }
        ].map((sys, idx) => (
          <div key={idx} className="bg-zinc-950/50 border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:border-white/10 transition-all">
             <div className="flex items-center gap-4">
               <div className={`p-2 bg-white/5 rounded-xl ${sys.color} group-hover:scale-110 transition-transform`}>
                 <div className="w-5 h-5">{sys.icon}</div>
               </div>
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{sys.label}</p>
                 <p className="text-sm font-bold text-white tracking-tight">{sys.status}</p>
               </div>
             </div>
             <p className="text-[9px] font-mono text-zinc-600 text-right uppercase tracking-tighter">{sys.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
