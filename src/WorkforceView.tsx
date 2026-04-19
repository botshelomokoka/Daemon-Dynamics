import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  UserMinus, 
  UserPlus, 
  Briefcase, 
  Code, 
  DollarSign, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  Github, 
  Layers, 
  Terminal, 
  ShieldAlert, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Brain,
  Info
} from 'lucide-react';
import { db } from './firebase';
import { collection, onSnapshot, query, orderBy, limit, addDoc, deleteDoc, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { generateAgentReflection, AgentReflection } from './services/aiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    if (!text) return;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [text]);
  return <span>{displayed}<span className="animate-pulse font-mono opacity-50">_</span></span>;
}

function generateDeterministicAddress(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hex = (hash & 0x00FFFFFF).toString(16).padEnd(6, '0');
  const bufferBytes = 'c0ffeeffff14f195' + hex + '1337deaddaemon'.padEnd(20, '0');
  return `0x${hex}${bufferBytes}`.slice(0, 42).toLowerCase();
}

export function WorkforceView() {
  const [agents, setAgents] = useState<any[]>([]);
  const [isHiring, setIsHiring] = useState(false);
  const [autoScale, setAutoScale] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [reflections, setReflections] = useState<Record<string, AgentReflection>>({});

  useEffect(() => {
    // Listen to Agents
    const unsubscribeAgents = onSnapshot(collection(db, 'agents'), (snapshot) => {
      setAgents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setIsHiring(false);
    });

    // Listen to Logs
    const logsQuery = query(collection(db, 'logs'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      setLogs(snapshot.docs.map(d => d.data()));
    });

    // Listen to Config
    const unsubscribeConfig = onSnapshot(doc(db, 'config', 'global'), (snap) => {
      if (snap.exists()) {
        setAutoScale(snap.data().autoScale);
      }
    });

    return () => {
      unsubscribeAgents();
      unsubscribeLogs();
      unsubscribeConfig();
    };
  }, []);

  // Effect to trigger AI reflections for working agents
  useEffect(() => {
    const workingAgents = agents.filter(a => a.status === 'working' || a.status === 'Building' || a.status === 'Scanning');
    
    workingAgents.forEach(async (agent) => {
      if (!reflections[agent.id]) {
        const reflection = await generateAgentReflection(agent.name, agent.type || agent.role || 'Operative', agent.currentTask || agent.task || 'Unknown Task');
        if (reflection) {
          setReflections(prev => ({ ...prev, [agent.id]: reflection }));
        }
      }
    });
  }, [agents]);

  const hireAgent = async () => {
    setIsHiring(true);
    const types = ['Strategy', 'Operations', 'Security', 'Finance', 'Development'];
    const type = types[Math.floor(Math.random() * types.length)];
    const name = `@DAEMON-${type.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`;
    
    const newAgent = {
      id: `agent-${Date.now()}`,
      name,
      type,
      status: 'idle',
      earnings: 0,
      cut: 10.0,
      cutTrend: 'stable',
      cutReason: 'Initial Deployment',
      currentTask: 'Awaiting Orders'
    };

    await setDoc(doc(db, 'agents', newAgent.id), newAgent);
  };

  const fireAgent = async (id: string) => {
    await deleteDoc(doc(db, 'agents', id));
  };

  const toggleAutoScale = async () => {
    await updateDoc(doc(db, 'config', 'global'), {
      autoScale: !autoScale
    });
  };

  const totalEarnings = agents.reduce((acc, a) => acc + (a.earnings || 0), 0);
  const goalProgress = (totalEarnings / 1000000) * 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 lg:col-span-12 font-sans pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3 italic uppercase leading-none mb-1">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            Sovereign Workforce
          </h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="text-[10px] font-black border-primary/20 text-primary bg-primary/10 px-3 py-0.5 tracking-[0.3em] uppercase italic">
             HIVE_ACTIVE: SYNC
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center gap-2 cursor-help">
                  <Activity className="w-3 h-3 text-primary animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary italic">ENG_v2.4</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-900 border-zinc-800 text-zinc-300 font-bold text-[10px] uppercase p-3 rounded-lg">
                Dynamic Intelligence Scaling Active
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            onClick={toggleAutoScale}
            className={`h-9 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all italic ${autoScale ? 'bg-primary text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
          >
            <Cpu className={`w-3 h-3 mr-2 ${autoScale ? 'animate-pulse' : ''}`} />
            {autoScale ? 'SCALE: ON' : 'SCALE: OFF'}
          </Button>

          <Button 
            onClick={hireAgent}
            disabled={isHiring || agents.length >= 25}
            className="h-9 px-5 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-lg hover:bg-zinc-200 transition-all active:scale-95 flex items-center gap-2 italic"
          >
            {isHiring ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
            PROVISION
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Briefcase, label: "EARNINGS", val: `$${totalEarnings.toLocaleString()}`, color: "text-blue-500", sub: "Distributed Hive Rev" },
          { icon: DollarSign, label: "PROGRESS", val: `${goalProgress.toFixed(2)}%`, color: "text-primary", sub: "Target: $1.0B AUM", progress: goalProgress },
          { icon: Bot, label: "CLUSTERS", val: `${agents.length}/25`, color: "text-purple-500", sub: "Compute shards" },
          { icon: Zap, label: "CAPABILITIES", val: "12", color: "text-rose-500", sub: "Verified protocols" }
        ].map((stat, i) => (
          <div key={i} className="technical-card p-6 relative overflow-hidden group">
             <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="data-label">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color} opacity-40`} />
             </div>
             <p className={`text-3xl font-mono font-bold tracking-tighter ${stat.color} mb-2 relative z-10 italic leading-none`}>{stat.val}</p>
             <div className="flex flex-col gap-3 relative z-10">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">{stat.sub}</span>
                {stat.progress !== undefined && (
                  <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.progress}%` }}
                      className={`h-full ${stat.color.replace('text-', 'bg-')} transition-all`}
                    />
                  </div>
                )}
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="technical-card overflow-hidden group">
            <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-black/20">
              <h3 className="data-label flex items-center gap-3">
                <Code className="w-4 h-4 text-blue-500" /> DYNAMO_QUEUE
              </h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded border border-blue-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">LIVE</span>
              </div>
            </div>
            <div className="divide-y divide-zinc-900">
              {[
                { name: "Conxiut System", desc: "Initializing autonomous kernel", agent: "@DAEMON-Ops", progress: 15, color: "blue", tag: "KERNEL" },
                { name: "DeFi Yield Router", desc: "Dynamic liquidity probing", agent: "@DAEMON-TRE", progress: 68, color: "green", tag: "FINANCE" },
                { name: "Aave Audit", desc: "Security posture validation", agent: "@DAEMON-SEC", progress: 42, color: "purple", tag: "SECURITY" }
              ].map((task, i) => (
                <div key={i} className="p-6 hover:bg-zinc-900/50 transition-colors group/task relative">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-950 flex items-center justify-center border border-zinc-800">
                        <Github className="w-5 h-5 text-zinc-500 group-hover/task:text-zinc-300 transition-colors" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="data-value text-zinc-200 uppercase italic">{task.name}</h4>
                          <Badge variant="outline" className="text-[8px] font-black px-1.5 py-0 border-zinc-800 text-zinc-500 bg-zinc-900 uppercase tracking-widest">{task.tag}</Badge>
                        </div>
                        <p className="data-label text-zinc-500 normal-case tracking-normal">{task.desc}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-[9px] mb-2 font-mono font-black">
                    <div className="flex items-center gap-2 text-zinc-500 uppercase tracking-widest">
                      <Bot className="w-3 h-3 text-zinc-600"/>
                      {task.agent}
                    </div>
                    <span className="text-zinc-500 tracking-widest">PHASE_0{i+1}</span>
                  </div>
                  
                  <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress}%` }}
                      className={`h-full ${task.color === 'green' ? 'bg-primary' : task.color === 'purple' ? 'bg-purple-500' : 'bg-blue-500'} transition-all`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="technical-card overflow-hidden group">
            <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-black/20">
              <h3 className="data-label flex items-center gap-3">
                <Terminal className="w-4 h-4 text-primary" /> HIVE_LOGS
              </h3>
              <span className="text-[8px] font-black font-mono text-zinc-500 uppercase tracking-widest">HEARTBEAT_OK</span>
            </div>
            <div className="p-6">
              <div className="font-mono text-[10px] h-64 overflow-y-auto space-y-1 custom-scrollbar pr-2">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-4 hover:bg-zinc-900/50 transition-colors py-1.5 px-2 rounded items-start">
                    <span className="text-zinc-600 shrink-0">[{log.time}]</span>
                    <div className="flex gap-3">
                      <span className="text-blue-500/80 uppercase tracking-widest text-[8px] shrink-0 mt-0.5 font-black">SYS_AUDIT</span>
                      <span className="text-zinc-400 capitalize-first">{log.message}</span>
                    </div>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="flex items-center gap-2 text-zinc-600 font-mono text-[10px] uppercase tracking-widest py-10 justify-center">
                    <Loader2 className="w-3 h-3 animate-spin"/>
                    Waiting for heartbeats...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="technical-card flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-black/20">
               <h3 className="data-label flex items-center gap-2">
                 <Terminal className="w-4 h-4 text-zinc-500" /> ROSTER
               </h3>
               <div className="flex items-center gap-2 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                 <span className="text-[8px] font-black font-mono text-primary uppercase tracking-[0.2em]">{agents.length} PROV</span>
               </div>
            </div>

            <div className="p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1">
              <AnimatePresence>
                {agents.map((agent) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    key={agent.id} 
                    className="p-5 bg-zinc-900/20 border border-zinc-800 rounded-xl group/agent hover:border-primary/30 transition-colors relative"
                  >
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-950 flex flex-col items-center justify-center border border-zinc-800">
                          <Bot className="w-4 h-4 text-zinc-500 group-hover/agent:text-primary transition-colors" />
                        </div>
                        <div>
                          <h4 className="data-value text-zinc-200 uppercase italic">
                            {agent.name.replace(/\[TIER \d\]$/, "").trim()}
                          </h4>
                          <span className="data-label text-primary m-0 block">
                            {agent.type || agent.role || 'SWARM_UNIT'} 
                          </span>
                        </div>
                      </div>
                      <Badge className={`px-2 py-0 text-[8px] font-black uppercase tracking-widest rounded ${
                        agent.status === 'working' || agent.status === 'Building' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                        agent.status === 'Scanning' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        'bg-zinc-900 text-zinc-500 border bg-zinc-800'
                      }`} variant="outline">
                        {agent.status}
                      </Badge>
                    </div>

                    <div className="bg-zinc-950/50 border border-zinc-900 rounded-lg p-4 mb-4">
                      <p className="data-label mb-2 flex items-center gap-2">
                        <Info className="w-3 h-3 text-blue-500"/> TASKING
                      </p>
                      <p className={`text-[10px] font-mono leading-relaxed border-l border-zinc-800 pl-3 ${
                        (agent.currentTask || '').includes('[SUPPORT SHARD]') ? 'text-purple-400 border-purple-500/30' : 'text-zinc-400'
                      }`}>
                        {agent.currentTask || agent.task || 'IDLE'}
                      </p>
                      
                      {(agent.status === 'working' || agent.status === 'Building') && reflections[agent.id] && (
                        <div className="pt-3 border-t border-zinc-900/50 mt-3">
                          <p className="data-label mb-2 flex items-center gap-2 text-purple-500">
                            <Brain className="w-3 h-3 text-purple-500"/> LOG
                          </p>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                            <p className="text-[10px] text-zinc-500 tracking-tight leading-relaxed italic"><TypewriterText text={reflections[agent.id].reflection} /></p>
                            <div className="flex items-start gap-2">
                              <span className="text-[8px] font-black text-purple-500 uppercase tracking-widest mt-0.5">NEXT:</span>
                              <span className="text-[10px] text-zinc-400 leading-relaxed"><TypewriterText text={reflections[agent.id].nextStep} /></span>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="data-label mb-1">YIELD</p>
                        <p className="text-sm font-mono font-bold text-primary leading-none">${(agent.earnings || 0).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="data-label mb-1">ENERGY</p>
                        <div className="flex items-center justify-end gap-1 font-mono text-[10px] font-bold leading-none">
                          <span className={agent.energy < 30 ? 'text-rose-500' : agent.energy < 70 ? 'text-amber-500' : 'text-emerald-500'}>
                            {agent.energy ?? 100}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {agents.length === 0 && (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="w-10 h-10 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center mb-3">
                    <Bot className="w-4 h-4 text-zinc-600" />
                  </div>
                  <p className="data-label">NO_ACTIVE_SWARM</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
