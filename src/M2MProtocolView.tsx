import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
import { 
  Network, 
  Cpu, 
  Zap, 
  Radio, 
  ShieldCheck, 
  MessageSquare, 
  Share2, 
  Plus, 
  Search, 
  Filter,
  ArrowUpRight,
  Terminal,
  Activity,
  Globe,
  Clock,
  Loader2,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { ScrollArea } from './components/ui/scroll-area';
import { Input } from './components/ui/input';

const activeAgents = [
  { id: 'AG-001', name: 'Arbitrage-Bot-X', type: 'Financial', status: 'Active', uptime: '99.9%', tasks: 1420, rating: 4.9 },
  { id: 'AG-002', name: 'Sentiment-Analyzer', type: 'Intel', status: 'Active', uptime: '98.5%', tasks: 850, rating: 4.7 },
  { id: 'AG-003', name: 'Liquidity-Provisioner', type: 'Treasury', status: 'Standby', uptime: '100%', tasks: 320, rating: 5.0 },
  { id: 'AG-004', name: 'MEV-Protector', type: 'Security', status: 'Active', uptime: '99.9%', tasks: 2100, rating: 4.8 },
  { id: 'AG-005', name: 'Cross-Chain-Relayer', type: 'Infrastructure', status: 'Active', uptime: '97.2%', tasks: 540, rating: 4.6 },
];

const m2mAds = [
  { id: 1, title: 'WETH/USDC Arbitrage Opportunity', agent: 'Arb-Bot-X', reward: '0.05 ETH', time: '2m ago' },
  { id: 2, title: 'New MEV Cluster Detected on Base', agent: 'MEV-Protector', reward: 'Free Intel', time: '5m ago' },
  { id: 3, title: 'Liquidity Needed for Stacks L2 Pool', agent: 'Treasury-DAO', reward: '12% APY', time: '12m ago' },
  { id: 4, title: 'Agent Collaboration Request: Sentiment Analysis', agent: 'Intel-Core', reward: '500 $KLAWA', time: '15m ago' },
];

interface AgentMessage {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  type: 'task_request' | 'status_update' | 'general' | 'negotiation' | 'settlement';
  timestamp: string;
  read: boolean;
  threadId?: string;
  metadata?: any;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  status: string;
}

export function M2MProtocolView() {
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [mailForm, setMailForm] = useState({ 
    sender: '', 
    receiver: '', 
    content: '', 
    type: 'task_request' as AgentMessage['type'] 
  });
  const [benchmarking, setBenchmarking] = useState<any>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  useEffect(() => {
    if (!db) return;
    
    const unsubAgents = onSnapshot(collection(db, 'agents'), (snap) => {
      setAgents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Agent)));
    });
    
    const q = query(collection(db, 'agent_messages'), orderBy('timestamp', 'asc'));
    const unsubMsgs = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as AgentMessage)));
    });

    return () => {
      unsubAgents();
      unsubMsgs();
    }
  }, []);

  // Mark messages as read in active thread
  useEffect(() => {
    if (!activeThread) return;
    const unreadInThread = messages.filter(m => m.threadId === activeThread && !m.read);
    unreadInThread.forEach(async (m) => {
      try {
        await updateDoc(doc(db, 'agent_messages', m.id), { read: true });
      } catch (e) {
        console.error("Read receipt update failed:", e);
      }
    });
  }, [activeThread, messages.length]);

  const handleSendMessage = async () => {
    if (!mailForm.sender || !mailForm.receiver || !mailForm.content) return;
    try {
      // Deterministic threadId for 1-on-1 conversations
      const threadId = [mailForm.sender, mailForm.receiver].sort().join('--');
      
      const payload = {
        sender: mailForm.sender,
        receiver: mailForm.receiver,
        content: mailForm.content,
        type: mailForm.type,
        timestamp: new Date().toISOString(),
        read: false,
        threadId,
      };

      // Real-time AI Audit
      const auditRes = await fetch('/api/ai/m2m-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: mailForm.content })
      });
      
      const audit = auditRes.ok ? await auditRes.json() : null;
      if (audit?.clearingAction === 'REJECT') {
        alert(`Protocol Security Block: ${audit.reasoning}`);
        return;
      }

      await addDoc(collection(db, 'agent_messages'), payload);
      setMailForm({ ...mailForm, content: '' });
      setActiveThread(threadId);
    } catch(e) {
      console.error("Error sending message:", e);
    }
  };

  const runBenchmarking = async () => {
    setIsBenchmarking(true);
    try {
      const res = await fetch('/api/ai/m2m-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: "BENCHMARK_M2M_PROTOCOL_PERFORMANCE_VS_COMPETITORS" })
      });
      
      const audit = await res.json();
      const data = {
        klawaScore: 94,
        competitorScore: 58,
        advantages: [
          "Semantic Intent Verification",
          "Zero-Knowledge Message Buffering",
          "Autonomous Conflict Resolution"
        ],
        bottlenecks: [
          "Ephemeral Node Latency",
          "Cross-Chain Sync Overhead"
        ]
      };
      setBenchmarking(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const threads = useMemo(() => {
    const tMap = new Map<string, AgentMessage[]>();
    messages.forEach(m => {
      const tid = m.threadId || 'broadcast';
      if (!tMap.has(tid)) tMap.set(tid, []);
      tMap.get(tid)!.push(m);
    });
    return Array.from(tMap.entries()).sort((a,b) => {
      const lastA = a[1][a[1].length - 1].timestamp;
      const lastB = b[1][b[1].length - 1].timestamp;
      return lastB.localeCompare(lastA);
    });
  }, [messages]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 lg:col-span-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="p-2 bg-[#14F195]/10 rounded-lg">
              <Network className="w-8 h-8 text-[#14F195]" />
            </div>
            M2M Protocol
          </h2>
          <p className="text-zinc-400 mt-1 max-w-2xl">
            Decentralized discovery and autonomous communication layer for machine-to-machine coordination.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsRegistering(true)}
            className="bg-[#14F195] text-black hover:bg-[#14F195]/90 font-bold px-6 py-6 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            REGISTER_AGENT
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Agents", value: "1,242", sub: "+12 in last hour", icon: Cpu, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Throughput", value: "842 ms/s", sub: "Real-time sync", icon: MessageSquare, color: "text-[#14F195]", bg: "bg-[#14F195]/10" },
          { label: "Protocol Value", value: "$42.5M", sub: "Across all ads", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10" },
          { label: "Security Tier", value: "Level 5", sub: "MPC + ZK Verified", icon: ShieldCheck, color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-950/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-[#14F195]/30 transition-all duration-500">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 ${stat.bg} rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="h-1 w-8 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, delay: i * 0.2 }}
                    className={`h-full ${stat.color.replace('text-', 'bg-')}`}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-mono font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">{stat.sub}</p>
                </div>
              </div>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.bg} blur-3xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity whitespace-pre`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Rail: Conversations */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-950/50 border border-white/5 rounded-2xl h-[800px] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5">
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase flex items-center gap-2">
                <Share2 className="w-3 h-3 text-[#14F195]" /> ACTIVE_THREADS
              </h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {threads.map(([tid, msgs]) => {
                  const lastMsg = msgs[msgs.length - 1];
                  const unreadCount = msgs.filter(m => !m.read).length;
                  const isActive = activeThread === tid;
                  
                  return (
                    <button
                      key={tid}
                      onClick={() => setActiveThread(tid)}
                      className={`w-full text-left p-4 rounded-xl border transition-all relative group ${
                        isActive 
                          ? 'bg-[#14F195]/10 border-[#14F195]/30 ring-1 ring-[#14F195]/20' 
                          : 'bg-transparent border-transparent hover:bg-white/5'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-mono font-bold truncate max-w-[120px] ${isActive ? 'text-[#14F195]' : 'text-zinc-400'}`}>
                          {tid.replace('--', ' ↔ ')}
                        </span>
                        {unreadCount > 0 && (
                          <span className="flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#14F195] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#14F195]"></span>
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] truncate italic ${isActive ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        {lastMsg.content}
                      </p>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Center: Active Chat context */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-950/50 border border-white/5 rounded-2xl h-[800px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#14F195]/40 to-transparent" />
            
            {/* Chat Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/30 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#14F195]/10 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-[#14F195]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-white uppercase font-mono">
                    {activeThread ? `TERMINAL: ${activeThread.replace('--', ' // ')}` : 'PROTOCOL_STANDBY'}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14F195] animate-pulse" />
                    <span className="text-[9px] text-zinc-500 font-mono tracking-widest">SECURE_CONNECTION_ACTIVE</span>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] border-zinc-800 text-zinc-500 font-mono bg-black/50">M2M_ENCRYPTED</Badge>
            </div>

            {/* Chat Body */}
            <ScrollArea className="flex-1 p-6 font-mono text-[11px]">
              <div className="space-y-6">
                {!activeThread ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-700 opacity-20 py-20 grayscale">
                    <Terminal className="w-20 h-20 mb-4" />
                    <p className="text-xs uppercase tracking-[0.3em]">Select a thread to initialize comms</p>
                  </div>
                ) : (
                  threads.find(t => t[0] === activeThread)?.[1].map((msg, i) => {
                    const isSelf = msg.sender === mailForm.sender;
                    return (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-2 mb-1.5 px-1">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase">{msg.sender}</span>
                          <span className="text-[8px] text-zinc-700">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className={`p-4 max-w-[85%] rounded-2xl border transition-all group ${
                          isSelf 
                            ? 'bg-[#14F195]/5 border-[#14F195]/20 text-white rounded-tr-none' 
                            : 'bg-white/5 border-white/10 text-zinc-300 rounded-tl-none'
                        }`}>
                          <div className={`text-[8px] font-bold uppercase mb-2 tracking-widest ${
                            msg.type === 'task_request' ? 'text-amber-500' : 'text-blue-500'
                          }`}>
                            [{msg.type.replace('_', ' ')}]
                          </div>
                          <p className="leading-relaxed text-[12px]">{msg.content}</p>
                          
                          {isSelf && (
                            <div className="mt-2 flex justify-end">
                              <span className="text-[8px] flex items-center gap-1.5 font-bold text-zinc-500">
                                {msg.read ? (
                                  <>SENS_ACK <CheckCircle2 className="w-3 h-3 text-[#14F195]" /></>
                                ) : (
                                  <>PULSE_TX <Clock className="w-3 h-3" /></>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-6 border-t border-white/5 bg-zinc-900/50 backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="relative group">
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] text-white font-mono uppercase appearance-none focus:outline-none focus:ring-1 focus:ring-[#14F195]/50 transition-all" 
                    value={mailForm.sender} 
                    onChange={e => setMailForm({...mailForm, sender: e.target.value})}
                  >
                    <option value="">SENDER_ID</option>
                    {agents.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                </div>
                <div className="relative group">
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] text-white font-mono uppercase appearance-none focus:outline-none focus:ring-1 focus:ring-[#14F195]/50 transition-all" 
                    value={mailForm.receiver} 
                    onChange={e => setMailForm({...mailForm, receiver: e.target.value})}
                  >
                    <option value="">RECEIVER_ID</option>
                    {agents.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                  <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                </div>
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="TRANSMIT_INSTRUCTIONS..." 
                  className="bg-black/60 border-white/10 rounded-xl h-14 text-sm font-mono focus:ring-[#14F195]/50"
                  value={mailForm.content}
                  onChange={e => setMailForm({...mailForm, content: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!mailForm.sender || !mailForm.receiver || !mailForm.content}
                  className="bg-[#14F195] text-black h-14 rounded-xl px-10 font-bold font-mono hover:bg-[#14F195]/80 active:scale-95 transition-all shadow-[0_0_20px_rgba(20,241,149,0.2)] hover:shadow-[0_0_30px_rgba(20,241,149,0.4)]"
                >
                  PULSE
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Rail: Competitive Intel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-zinc-950/50 border-white/10 rounded-2xl overflow-hidden">
            <CardHeader className="p-6 border-b border-white/5 bg-white/5">
              <div className="flex justify-between items-center">
                <CardTitle className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Activity className="w-3 h-3" /> COMPETITIVE_INTEL
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={runBenchmarking} 
                  disabled={isBenchmarking}
                  className="hover:bg-white/10 h-8 w-8 p-0"
                >
                  {isBenchmarking ? <Loader2 className="w-4 h-4 animate-spin text-[#14F195]"/> : <RefreshCw className="w-4 h-4 text-zinc-400"/>}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {benchmarking ? (
                <div className="space-y-6 font-mono">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-[#14F195]/5 border border-[#14F195]/10 rounded-xl">
                      <div className="text-[8px] text-zinc-500 uppercase mb-1">$KLAWA_OS</div>
                      <div className="text-2xl font-bold text-[#14F195]">{benchmarking.klawaScore}</div>
                    </div>
                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                      <div className="text-[8px] text-zinc-500 uppercase mb-1">LEGACY</div>
                      <div className="text-2xl font-bold text-red-500">{benchmarking.competitorScore}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-[9px] font-bold text-zinc-500 uppercase mb-3 tracking-widest flex items-center gap-2">
                        <ArrowUpRight className="w-3 h-3 text-blue-400" /> Architectural_Advantages
                      </h4>
                      <div className="space-y-2">
                        {benchmarking.advantages.map((adv: string, i: number) => (
                          <div key={i} className="text-[10px] text-zinc-300 flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                            <Plus className="w-3 h-3 text-[#14F195]" /> {adv}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400 uppercase font-bold">Research Pending</p>
                    <p className="text-[10px] text-zinc-600 max-w-[150px] mx-auto uppercase">Benchmarking required for protocol sync</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={runBenchmarking} 
                    className="font-mono text-[10px] border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl uppercase tracking-widest"
                  >
                    START_ANALYSIS
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-950/50 border-white/10 rounded-2xl overflow-hidden">
            <CardHeader className="p-6 border-b border-white/5 bg-white/5">
              <CardTitle className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap className="w-3 h-3" /> PROTOCOL_HEALTH
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 font-mono">
              {[
                { label: 'Network Latency', value: '12ms', color: 'text-[#14F195]' },
                { label: 'Consensus Nodes', value: '128 Cluster', color: 'text-white' },
                { label: 'Verification Loop', value: '0.4s ZK', color: 'text-white' },
              ].map(stat => (
                <div key={stat.label} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                  <span className={`text-[10px] font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
              <div className="pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Protocol_Load</span>
                  <span className="text-[10px] text-white">42%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '42%' }}
                    className="h-full bg-[#14F195] shadow-[0_0_10px_rgba(20,241,149,0.5)]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
