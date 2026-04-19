import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Search, 
  Radio, 
  Target, 
  Zap, 
  Globe, 
  Eye, 
  AlertTriangle, 
  Crosshair, 
  BarChart3, 
  Database, 
  Loader2,
  Cpu,
  Layers,
  Fingerprint,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { ScrollArea } from "./components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

function generateCID(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hex = Math.abs(hash).toString(36);
  return `Qm${hex}${'zWv8pG6a2K9N57dM'.padEnd(42, 'xXyY' + hex)}`.slice(0, 46);
}

export function IntelView() {
  const [activeScan, setActiveScan] = useState(false);
  const [agentCount, setAgentCount] = useState(0);
  const [signals, setSignals] = useState(142500);
  const [intelLogs, setIntelLogs] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeAgents = onSnapshot(collection(db, 'agents'), (snap) => {
      setAgentCount(snap.size);
    });

    const q = query(collection(db, 'logs'), orderBy('createdAt', 'desc'), limit(15));
    const unsubscribeLogs = onSnapshot(q, (snap) => {
      setIntelLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const interval = setInterval(() => {
      setSignals(prev => prev + Math.floor(Math.random() * 25));
    }, 3000);

    return () => {
      unsubscribeAgents();
      unsubscribeLogs();
      clearInterval(interval);
    };
  }, []);

  const initiateScan = async () => {
    setActiveScan(true);
    
    await addDoc(collection(db, 'logs'), {
      message: 'DEEP_SCAN_SEQ: Initiated across 12 omnichain protocols. Analyzing liquidity depth and threat vectors.',
      type: 'intel',
      createdAt: serverTimestamp()
    });

    setTimeout(() => {
      setActiveScan(false);
    }, 5000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 lg:col-span-12 font-sans pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3 italic uppercase leading-none mb-1">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Eye className="w-6 h-6 text-blue-500" />
            </div>
            Intelligence Hub
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-[10px] font-black border-blue-500/20 text-blue-500 bg-blue-500/10 px-3 py-0.5 tracking-[0.3em] uppercase italic">
            RECON_UNIT_v4.2
          </Badge>
          <Button 
            variant="outline"
            onClick={initiateScan}
            disabled={activeScan}
            className={`h-9 px-4 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 border-zinc-800 italic active:scale-95 ${
              activeScan ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' : 'bg-transparent text-white hover:bg-zinc-900'
            }`}
          >
            {activeScan ? <Loader2 className="w-3 h-3 animate-spin" /> : <RadarIcon className="w-3 h-3 text-blue-500" />}
            {activeScan ? 'SCANNING_FEED' : 'INITIALIZE_SCAN'}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Radio, label: "Signals", val: (signals / 1000).toFixed(2) + "K", sub: "STREAM_LAST_24H", color: "text-blue-500" },
          { icon: Target, label: "Neutralized", val: "184", sub: "AUTO_DEFENSE", color: "text-rose-500" },
          { icon: Fingerprint, label: "Profiles", val: "8,402", sub: "IDENTITY_MESH", color: "text-purple-500" },
          { icon: Zap, label: "Sentiment", val: "+14.2%", sub: "SOCIAL_NETWORK", color: "text-emerald-500" }
        ].map((stat, i) => (
          <div key={i} className="technical-card p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="data-label">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color} opacity-50`} />
            </div>
            <p className="text-3xl font-mono font-bold tracking-tighter text-white mb-2 relative z-10 italic leading-none">{stat.val}</p>
            <div className="flex items-center gap-2 relative z-10">
               <span className="text-[9px] font-mono font-black uppercase tracking-widest italic text-zinc-500">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 technical-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-black/20">
            <h3 className="data-label text-white text-xs flex items-center gap-2">
              OPERATIONAL_FEED.LOG
            </h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded border border-zinc-800">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">ENCRYPTED_SYNC</span>
            </div>
          </div>
          <ScrollArea className="h-[600px] custom-scrollbar flex-1">
            <div className="p-6 space-y-1 bg-zinc-950">
              <AnimatePresence initial={false}>
                {intelLogs.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    key={log.id}
                    className="group flex gap-4 p-2 rounded hover:bg-zinc-900/50 transition-all items-baseline border-b border-zinc-900 last:border-0"
                  >
                    <div className="shrink-0 flex items-center gap-2">
                       <span className="data-label opacity-50 group-hover:opacity-100 transition-opacity">
                         {log.createdAt?.toDate ? log.createdAt.toDate().toLocaleTimeString() : 'T_ZERO_001'}
                       </span>
                    </div>
                    
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                       <span className={`text-[9px] font-black uppercase tracking-widest shrink-0 ${
                          log.type === 'error' ? 'text-rose-500' : 
                          log.type === 'warning' ? 'text-amber-500' :
                          log.type === 'intel' ? 'text-blue-500' : 'text-emerald-500'
                       }`}>
                         [{log.type || 'SYS'}]
                       </span>
                      <p className={`text-[10px] font-mono leading-relaxed uppercase truncate ${
                         log.type === 'error' ? 'text-rose-400' : 'text-zinc-400 group-hover:text-zinc-300'
                      }`}>
                        {log.message}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="technical-card p-6">
             <div className="flex items-center justify-between mb-6">
               <span className="data-label text-rose-500">Targeting Vectors</span>
               <div className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded text-[8px] font-black text-rose-500 tracking-[0.2em] uppercase animate-pulse">LOCK_ACTIVE</div>
             </div>

             <div className="space-y-3">
               {[
                 { id: "VEC-92", title: "Liquidity_ZK", desc: "Mapping dark pools for block execution", progress: 84, color: "bg-blue-500" },
                 { id: "VEC-14", title: "Sentiment_NLP", desc: "Profiling agent cultural hubs on Nostr", progress: 92, color: "bg-emerald-500" },
                 { id: "VEC-08", title: "Audit_Mainnet", desc: "Bytecode level audit of protocols", progress: 42, color: "bg-amber-500" }
               ].map((target, i) => (
                 <div key={i} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 transition-colors group/target">
                   <div className="flex justify-between items-center mb-2">
                     <span className="data-label text-white">{target.title}</span>
                     <span className="text-[9px] font-mono font-bold text-zinc-500">{target.id}</span>
                   </div>
                   <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest mb-1.5">
                     <span className="text-zinc-600">TELEMETRY_LOCK</span>
                     <span className="text-zinc-300">{target.progress}%</span>
                   </div>
                   <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${target.progress}%` }}
                       className={`h-full ${target.color}`}
                     />
                   </div>
                 </div>
               ))}
             </div>
          </div>

          <div className="technical-card p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
            <div className="mb-8 relative">
              <Globe className="w-16 h-16 text-emerald-500/10 animate-spin-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                </div>
              </div>
            </div>
            <h3 className="data-label text-emerald-500 mb-2">Network Relay</h3>
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-6 max-w-[200px] leading-relaxed">
              Global agentic propagation across 14 clusters.
            </p>
            <Button variant="outline" className="w-full bg-transparent border-zinc-800 text-zinc-300 hover:text-white font-black uppercase tracking-widest text-[9px] h-10 rounded-lg hover:bg-zinc-900 transition-all">
              Launch Mapper
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RadarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19.07 4.93a10 10 0 0 0-14.14 0" />
      <path d="M15.53 8.47a5 5 0 0 0-7.07 0" />
      <path d="M12 12v.01" />
      <circle cx="12" cy="12" r="10" />
      <path d="m16 16-4-4" />
    </svg>
  )
}
