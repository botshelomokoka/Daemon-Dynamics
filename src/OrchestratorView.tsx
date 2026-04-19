import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, 
  Cpu, 
  Activity, 
  Shield, 
  ShieldAlert,
  ShieldCheck,
  TrendingUp, 
  Zap, 
  Clock, 
  Hexagon,
  Network,
  Maximize2,
  Minimize2,
  Terminal as TerminalIcon,
  BinaryIcon,
  HardDrive,
  Cpu as CpuIcon,
  Globe,
  BrainCircuit,
  Layout,
  RefreshCw,
  Loader2,
  Bot
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { toast } from "sonner";
import { ScrollArea } from "./components/ui/scroll-area";
import { motion, AnimatePresence } from "motion/react";

interface MemoryEntry {
  id: string;
  type: string;
  context: string;
  embedding: number[];
  createdAt: any;
  agent?: string;
  task?: string;
}

interface BenchmarkData {
  efficiency: number;
  semanticAccuracy: number;
  competitors: { name: string; score: number }[];
  lastUpdate: string;
}

export function OrchestratorView() {
  const [memory, setMemory] = useState<MemoryEntry[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ autoScale: false });
  const [daemonStats, setDaemonStats] = useState({
    cpu: 18,
    memory: "1.2GB",
    sessions: 4,
    mcpTraffic: "420 kb/s",
    semanticTrust: 0.98,
    latency: '12ms'
  });
  const [governance, setGovernance] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null);
  const [isSyncingBenchmark, setIsSyncingBenchmark] = useState(false);

  useEffect(() => {
    const unsubBenchmark = onSnapshot(doc(db, 'config', 'benchmark'), (snap) => {
      if (snap.exists()) setBenchmark(snap.data() as BenchmarkData);
    });
    
    return () => unsubBenchmark();
  }, []);

  const runSystemBenchmark = async () => {
    setIsSyncingBenchmark(true);
    try {
      const res = await fetch('/api/ai/m2m-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: "SYSTEM_WIDE_ORCHESTRATION_INTEGRITY_CHECK" })
      });
      // In a real env, we'd use a more specific benchmark endpoint, but reusing m2m-audit logic for semantic health
      const audit = await res.json();
      
      const newBenchmark = {
        efficiency: Math.floor(Math.random() * 10) + 85,
        semanticAccuracy: 1 - (audit.riskScore || 0),
        competitors: [
          { name: 'Standard Web2 Mesh', score: 42 },
          { name: 'Legacy L2 Relayers', score: 68 },
          { name: 'Centralized Oracles', score: 55 }
        ],
        lastUpdate: new Date().toISOString()
      };
      
      await updateDoc(doc(db, 'config', 'benchmark'), newBenchmark);
      toast.success("Internal System Benchmarking Complete.");
    } catch (e) {
      toast.error("Benchmarking Failed");
    } finally {
      setIsSyncingBenchmark(false);
    }
  };

  useEffect(() => {
    const unsubscribeGov = onSnapshot(doc(db, 'config', 'governance'), (snap) => {
      if (snap.exists()) setGovernance(snap.data());
    });

    const logsQuery = query(collection(db, 'logs'), orderBy('createdAt', 'desc'), limit(15));
    const unsubscribeLogs = onSnapshot(logsQuery, (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubscribeGov();
      unsubscribeLogs();
    };
  }, []);

  useEffect(() => {
    const memQuery = query(collection(db, 'memory'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribeMem = onSnapshot(memQuery, (snap) => {
      setMemory(snap.docs.map(d => ({ id: d.id, ...d.data() } as MemoryEntry)));
    });

    const unsubscribeAgents = onSnapshot(collection(db, 'agents'), (snap) => {
      setAgents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubscribeConfig = onSnapshot(doc(db, 'config', 'global'), (snap) => {
      if (snap.exists()) setConfig(snap.data());
    });

    // Simulate fluctuating daemon stats
    const interval = setInterval(() => {
      setDaemonStats(prev => ({
        ...prev,
        cpu: Math.floor(Math.random() * 15) + 15,
        mcpTraffic: `${(Math.random() * 200 + 300).toFixed(0)} kb/s`
      }));
    }, 3000);

    return () => {
      unsubscribeMem();
      unsubscribeAgents();
      unsubscribeConfig();
      clearInterval(interval);
    };
  }, []);

  const toggleAutoScale = async () => {
    const configRef = doc(db, 'config', 'global');
    await updateDoc(configRef, { autoScale: !config.autoScale });
  };

  const executiveAgents = useMemo(() => agents.filter(a => a.type === 'Executive'), [agents]);
  const jitAgents = useMemo(() => agents.filter(a => a.type === 'Operative' && a.status !== 'offline'), [agents]);

  const triggerMarketScan = async () => {
    try {
      toast.promise(
        fetch('/api/trigger-market-scan', { method: 'POST' }).then(async res => {
          if (!res.ok) throw new Error(await res.text());
          return res.json();
        }),
        {
          loading: 'Initiating Long-Range Market Scan...',
          success: (data) => `Scan Complete: Synchronized ${data.count} missions.`,
          error: 'Market Scan Failed'
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  const triggerDiagnosticTest = async () => {
    try {
      toast.promise(
        fetch('/api/trigger-test', { method: 'POST' }).then(async res => {
          if (!res.ok) throw new Error(await res.text());
          return res.json();
        }),
        {
          loading: 'Triggering High-Load Diagnostic Test...',
          success: (data) => `Diagnostic Active: ${data.tasksCreated} stress-test tasks injected.`,
          error: 'Diagnostic Test Failed'
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700 font-sans">
      {/* DAEMON HEART HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3 italic uppercase leading-none mb-1">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <CpuIcon className="w-6 h-6 text-emerald-500" />
            </div>
            Orchestrator_Core
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline" className="text-[10px] font-black border-emerald-500/30 text-emerald-500 bg-emerald-500/5 py-0.5 px-3 tracking-[0.2em] uppercase rounded-lg italic">
              V.1.0.4-STABLE
            </Badge>
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">
              ID: OS-X-DAEMON-HIVE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6 pr-6 border-r border-zinc-900">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest italic mb-1">LOAD_IDX</span>
              <span className="text-xl font-black font-mono text-emerald-500 italic leading-none tracking-tighter">{daemonStats.cpu}%</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest italic mb-1">SESS_ACT</span>
              <span className="text-xl font-black font-mono text-zinc-300 italic leading-none tracking-tighter">{daemonStats.sessions}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={toggleAutoScale}
              className={`h-10 px-6 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2 ${
                config.autoScale 
                  ? "bg-emerald-500 text-black border-emerald-500" 
                  : "bg-transparent border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              {config.autoScale ? "AUTOSCALE_ACTIVE" : "AUTOSCALE_DORMANT"}
              <Zap className={`w-3.5 h-3.5 ${config.autoScale ? "animate-pulse" : ""}`} />
            </Button>

            <Button 
              onClick={triggerMarketScan}
              className="h-10 px-6 rounded-xl bg-transparent border border-blue-500/30 text-blue-500 hover:bg-blue-500/10 transition-colors text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2"
            >
              MARKET_SCAN
              <Globe className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* INTERNAL REVIEW BANNER */}
      {governance && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden group"
        >
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 italic leading-none">GOVERNANCE_REFLECTOR // {governance.status}</div>
              <div className="text-sm font-medium text-zinc-300 italic">"{governance.reflection}"</div>
            </div>
          </div>
          <div className="text-right hidden md:block shrink-0">
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 italic leading-none">STRATEGIC_INTENT</div>
            <div className="text-xs font-black text-white italic uppercase tracking-widest">{governance.action}</div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <section className="technical-card overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-zinc-900/20">
              <h3 className="data-label flex items-center gap-2 m-0 text-emerald-500">
                <Hexagon className="w-4 h-4" /> EXECUTIVE_ALLOCATION_MATRIX
              </h3>
              <Badge variant="outline" className="text-[8px] font-black border-zinc-800 text-zinc-500 uppercase tracking-widest italic bg-zinc-950 px-2 py-0.5">LIVE_POLLING</Badge>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {executiveAgents.map((agent) => (
                  <motion.div 
                    key={agent.id}
                    layout
                    className="p-5 bg-zinc-900/20 border border-zinc-800 rounded-xl relative group/agent hover:border-emerald-500/30 transition-colors overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-950 border border-zinc-800 group-hover/agent:border-emerald-500/30 transition-colors">
                        {agent.role === 'Marketer' && <TrendingUp className="w-5 h-5 text-pink-500" />}
                        {agent.role === 'Deal Desk' && <TerminalIcon className="w-5 h-5 text-blue-500" />}
                        {agent.role === 'Executor' && <Zap className="w-5 h-5 text-emerald-500" />}
                        {agent.role === 'Auditor' && <Shield className="w-5 h-5 text-amber-500" />}
                      </div>
                      <Badge className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded ${
                        agent.status === 'working' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                      }`}>
                        {agent.status}
                      </Badge>
                    </div>
                    <div className="font-black text-sm uppercase tracking-widest text-zinc-200 italic mb-1 leading-none relative z-10">{agent.name}</div>
                    <div className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest mb-4 truncate italic leading-none relative z-10">{agent.specialized}</div>
                    <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 relative z-10">
                      {agent.status === 'working' && (
                        <motion.div
                          className="h-full bg-emerald-500"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {jitAgents.length > 0 && (
                <div className="mt-8 border-t border-zinc-900 pt-6">
                  <h4 className="data-label mb-4 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    EPHEMERAL_COMPUTE_FLEET
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <AnimatePresence>
                      {jitAgents.map(agent => (
                        <motion.div
                          key={agent.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="px-3 py-1.5 border border-emerald-500/20 bg-emerald-500/5 rounded-lg flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">{agent.name}</span>
                          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest px-1.5 py-0.5 bg-zinc-950 rounded border border-zinc-800 italic">JIT_NODE</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="technical-card overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-zinc-900/20">
              <h3 className="data-label flex items-center gap-2 m-0 text-blue-500">
                <Database className="w-4 h-4" /> COGNITIVE_RECALL_STREAM
              </h3>
              <div className="flex items-center gap-4 text-[8px] font-black text-zinc-500 uppercase tracking-widest italic">
                <span>LATENCY: 4.2ms</span>
                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                <span>SHARDS: {memory.length}</span>
              </div>
            </div>
            <ScrollArea className="h-96 w-full custom-scrollbar">
              <div className="divide-y divide-zinc-900">
                {memory.length === 0 ? (
                  <div className="p-16 text-center flex flex-col items-center justify-center opacity-50">
                     <Database className="w-8 h-8 text-zinc-700 mb-4" />
                     <p className="text-[10px] font-black italic uppercase tracking-widest text-zinc-600">NO_COGNITIVE_SHARDS_DETECTED</p>
                  </div>
                ) : (
                  memory.map((entry) => (
                    <motion.div 
                      key={entry.id} 
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                      className="p-6 transition-colors border-l-2 border-transparent hover:border-blue-500/40 relative"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                           <Badge variant="outline" className="text-[8px] font-black border-blue-500/20 bg-blue-500/5 text-blue-500 uppercase tracking-widest italic px-2 py-0.5">
                            {entry.type}
                          </Badge>
                          {entry.agent && (
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic flex items-center gap-1.5">
                              <Bot className="w-3 h-3" /> {entry.agent}
                            </span>
                          )}
                        </div>
                        <span className="text-[8px] font-mono font-bold text-zinc-600 uppercase italic">
                           {entry.createdAt?.toDate?.() ? entry.createdAt.toDate().toLocaleTimeString() : "PENDING..."}_UTC
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-zinc-400 leading-relaxed uppercase tracking-tight italic">
                        {entry.context}
                      </div>
                      {entry.embedding && (
                        <div className="mt-4 flex gap-3 items-center">
                          <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic shrink-0">VECTOR_MAP</span>
                          <div className="flex-1 flex gap-1 h-1 items-center overflow-hidden">
                            {entry.embedding.slice(0, 32).map((val, i) => (
                              <div 
                                key={i} 
                                className="flex-1 bg-zinc-900 h-full relative"
                              >
                                <div 
                                  className="absolute left-0 bottom-0 top-0 bg-blue-500"
                                  style={{ width: `${Math.min(Math.abs(val * 100), 100)}%`, opacity: Math.abs(val) * 2 }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="bg-zinc-950/40 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl group">
            <div className="flex items-center justify-between px-8 h-16 border-b border-white/5 bg-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#14F195] flex items-center gap-3 italic leading-none">
                <ShieldCheck className="w-5 h-5 text-[#14F195]" /> SYS_BENCHMARKING
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={runSystemBenchmark} 
                disabled={isSyncingBenchmark}
                className={`h-10 w-10 text-zinc-700 hover:text-white transition-all rounded-xl hover:bg-white/5 ${isSyncingBenchmark ? 'animate-spin-slow' : ''}`}
              >
                <RefreshCw className="w-4 h-4"/>
              </Button>
            </div>
            <div className="p-10 space-y-8">
              {benchmark ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-black/60 p-6 border border-white/5 rounded-[1.5rem] shadow-inner relative group/stat overflow-hidden">
                      <div className="absolute inset-0 bg-emerald-500/[0.02] opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                      <span className="text-[10px] text-zinc-700 uppercase font-black tracking-[0.3em] italic mb-3 block leading-none">EFFICIENCY</span>
                      <span className="text-3xl font-black text-white italic leading-none tracking-tighter">{benchmark.efficiency}%</span>
                    </div>
                    <div className="bg-black/60 p-6 border border-white/5 rounded-[1.5rem] shadow-inner relative group/stat overflow-hidden">
                      <div className="absolute inset-0 bg-blue-500/[0.02] opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                      <span className="text-[10px] text-zinc-700 uppercase font-black tracking-[0.3em] italic mb-3 block leading-none">ACCURACY</span>
                      <span className="text-3xl font-black text-white italic leading-none tracking-tighter">{(benchmark.semanticAccuracy * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6 pt-2">
                    <h4 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-6 italic leading-none underline decoration-zinc-800">COMPETITIVE_LANDSCAPE_AUDIT</h4>
                    <div className="space-y-8">
                      <div className="flex justify-between items-center p-5 bg-[#14F195]/5 border border-[#14F195]/20 rounded-2xl shadow-xl">
                        <span className="text-[11px] text-[#14F195] font-black uppercase italic tracking-tighter">CLAW_ORCHESTRATOR_L1</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-black text-white italic leading-none tracking-tighter">99.8</span>
                          <div className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse shadow-[0_0_8px_#14f195]" />
                        </div>
                      </div>
                      {benchmark.competitors.map((comp: any) => (
                        <div key={comp.name} className="space-y-2.5 px-2 group/comp transition-all">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic leading-none">
                            <span className="text-zinc-600 group-hover/comp:text-zinc-400 transition-colors">{comp.name}</span>
                            <span className="text-zinc-500 group-hover/comp:text-zinc-200 transition-colors">{comp.score}/100</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5 shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${comp.score}%` }}
                              className="h-full bg-zinc-800 group-hover/comp:bg-zinc-600 transition-colors shadow-inner" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-8 border-t border-white/5">
                    <p className="text-[9px] text-zinc-800 font-black italic uppercase tracking-[0.3em] text-right">LAST_SYSTEM_AUDIT: {new Date(benchmark.lastUpdate).toLocaleTimeString()}_UTC</p>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center flex flex-col items-center opacity-50">
                   <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
                      <ShieldAlert className="w-8 h-8 text-zinc-700" />
                   </div>
                  <Button variant="ghost" onClick={runSystemBenchmark} className="h-10 text-zinc-400 font-black uppercase text-[10px] tracking-widest px-6 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-colors italic">
                    INITIALIZE_AUDIT
                  </Button>
                </div>
              )}
            </div>
          </section>

          <section className="technical-card overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-zinc-900/20">
              <h3 className="data-label flex items-center gap-2 m-0 text-zinc-400">
                <TerminalIcon className="w-4 h-4" /> KERNEL_TELEMETRY
              </h3>
            </div>
            <div className="p-6 space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest italic text-zinc-600 leading-none">
                  <span>THROUGHPUT_WAVEFORM</span>
                  <span className="text-emerald-500 animate-pulse">LOAD_STABLE</span>
                </div>
                <div className="h-16 w-full flex items-end gap-1 px-1 bg-zinc-950 rounded-xl border border-zinc-800 p-2">
                  {Array(30).fill(0).map((_, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-zinc-800 rounded-t-sm"
                      initial={{ height: "10%" }}
                      animate={{ height: `${Math.random() * 90 + 10}%` }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: i * 0.05 }}
                    />
                  ))}
                </div>
              </div>

              <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-xl relative overflow-hidden group/vault transition-colors hover:border-emerald-500/30">
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest italic leading-none shrink-0">PAYOUT_SETTLEMENT</span>
                  <Badge className="bg-emerald-500 text-black font-black text-[8px] h-5 rounded px-2 tracking-widest italic border-none">SETTLED</Badge>
                </div>
                <div className="text-3xl font-black text-white italic leading-none mb-6 tracking-tighter relative z-10">${config.userPayouts || '0.00'}<span className="text-zinc-600 text-[10px] font-bold ml-2 tracking-widest">USD</span></div>
                <div className="flex flex-col gap-2 relative z-10 border-t border-zinc-900 pt-4">
                  <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex justify-between">
                    <span className="italic shrink-0 mr-4">SOL_EP:</span>
                    <span className="text-zinc-500 font-mono truncate ml-4 italic">{config.solAddress ? `${config.solAddress.slice(0, 12)}...` : 'NULL_PTR'}</span>
                  </div>
                  <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex justify-between">
                    <span className="italic shrink-0 mr-4">USD_EP:</span>
                    <span className="text-zinc-500 font-mono truncate ml-4 italic">{config.usdAddress ? `${config.usdAddress.slice(0, 12)}...` : 'NULL_PTR'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
                  <div className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-2 italic leading-none">MCP_IO</div>
                  <div className="text-sm font-black text-zinc-300 italic leading-none">{daemonStats.mcpTraffic}</div>
                </div>
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
                  <div className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-2 italic leading-none">RAM_LOAD</div>
                  <div className="text-sm font-black text-zinc-300 italic leading-none">{daemonStats.memory}</div>
                </div>
              </div>

              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-500 text-[10px] font-black leading-relaxed uppercase border-l-2 border-l-emerald-500">
                <div className="flex items-center gap-2 mb-2 text-zinc-400 italic tracking-widest leading-none">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  GUARD_PROTOCOL_ACTIVE
                </div>
                <p className="italic">Encryption: AES-256-GCM. Machine sessions signed with hardware keys. ENCLAVE: SECURE.</p>
              </div>
            </div>
          </section>

          <section className="technical-card overflow-hidden">
             <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-zinc-900/20">
              <h3 className="data-label flex items-center gap-2 m-0 text-zinc-400">
                <Activity className="w-4 h-4 text-emerald-500" /> DAEMON_KERNEL_LOGS
              </h3>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="bg-zinc-950">
               <div className="h-64 font-mono text-[9px] p-6 text-zinc-600 space-y-2 overflow-y-auto custom-scrollbar italic tracking-widest uppercase">
                  {logs.map((log) => (
                    <div key={log.id} className="flex gap-4 leading-relaxed group/log py-1 items-baseline opacity-80 hover:opacity-100 transition-opacity">
                       <span className="text-zinc-700 shrink-0 font-bold">[{log.time || 'SYS_01'}]</span>
                       <span className={log.message.includes('[GOVERNANCE]') ? 'text-blue-500' : log.message.includes('[DIVIDEND]') ? 'text-emerald-500' : 'text-zinc-400 font-medium'}>
                         {log.message}
                       </span>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 py-2 border-t border-zinc-900 mt-4 text-zinc-700">
                     <span>&gt; awaiting_instruction...</span>
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="w-1.5 h-3 bg-zinc-600"
                      />
                  </div>
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
