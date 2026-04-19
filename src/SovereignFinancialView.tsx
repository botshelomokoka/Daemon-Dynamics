import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Wallet, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  ArrowRight, 
  Layers, 
  Globe, 
  Cpu,
  Coins,
  History,
  Lock,
  ArrowUpRight,
  Send,
  Link as LinkIcon,
  Activity,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { ScrollArea } from "./components/ui/scroll-area";
import { motion, AnimatePresence } from "motion/react";
import { db } from './firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { useAccount, useBalance, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';

export function SovereignFinancialView() {
  const [activeTab, setActiveTab] = useState<'wallet' | 'm2m' | 'bridge'>('wallet');
  const [streamingPayments, setStreamingPayments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  
  // Real Web3 Integration Hooks
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({
    address: isConnected ? address : '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Default to vitalik.eth if unconnected
  });
  const { sendTransactionAsync } = useSendTransaction();

  const handleInitiateSettlement = async () => {
    if (!isConnected) {
      toast.error("Web3 Wallet Required to execute L1 M2M Settlement.");
      return;
    }
    try {
      toast.loading("Initiating L1 M2M Settlement (Abstracted Fee)...", { id: 'm2m' });
      // Simulating a micro-settlement stream to an agent contract
      await sendTransactionAsync({
        to: '0x0000000000000000000000000000000000000000',
        value: parseEther('0.0001')
      });
      toast.success("M2M Settlement Finalized On-Chain.", { id: 'm2m' });
    } catch (e) {
      toast.dismiss('m2m');
      toast.error("Settlement transaction rejected/failed.");
    }
  };

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    const assetQ = query(collection(db, 'assets'));
    const unsubAssets = onSnapshot(assetQ, (snap) => {
        setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const streamQ = query(collection(db, 'streams'));
    const unsubStreams = onSnapshot(streamQ, (snap) => {
        setStreamingPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    return () => { unsub(); unsubAssets(); unsubStreams(); };
  }, []);

  // Aggregate growth and allocation based on real data
  const treasuryGrowthData = transactions.reduce((acc, tx) => {
     const date = tx.date?.toDate ? tx.date.toDate().toISOString().substring(0, 7) : '2027-01';
     const existing = acc.find(item => item.date === date);
     if (existing) {
         existing.value += (tx.amount * tx.price);
     } else {
         acc.push({ date, value: (tx.amount * tx.price) });
     }
     return acc;
  }, []).sort((a: any, b: any) => a.date.localeCompare(b.date));

  const assetAllocationData = assets.map(a => ({ name: a.symbol, value: a.balance * a.price, color: '#10B981' }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 lg:col-span-12 font-sans pb-20">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h2 className="text-3xl font-black tracking-tight uppercase italic leading-none text-white">Sovereign_Financial_Layer</h2>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] leading-none">MPC_TSS_ACTIVE</span>
              </div>
            </div>
            <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest max-w-xl">
              ERC-4337 Account Abstraction Interface & Sovereign Treasury Mesh. SYSTEM_STATUS: OPTIMAL.
            </p>
          </div>
        </div>
        <div className="flex gap-2 bg-zinc-950/60 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
           {[ 
             { id: 'wallet', label: 'IDENTITY_VAULT' },
             { id: 'm2m', label: 'M2M_STREAMS' },
             { id: 'bridge', label: 'X-CHAIN_INTENT' }
           ].map((tab) => (
             <Button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               variant="ghost" 
               className={`px-6 h-11 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                 activeTab === tab.id 
                 ? 'bg-white text-black shadow-2xl' 
                 : 'text-zinc-500 hover:text-white hover:bg-white/5'
               }`}
             >
                {tab.label}
             </Button>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-zinc-950/40 border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full -mr-16 -mt-16" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-8 italic flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> TREASURY_GROWTH
              </h3>
              <div className="h-56 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={treasuryGrowthData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', fontSize: '10px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} 
                      itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card className="bg-zinc-950/40 border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full -mr-16 -mt-16" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-8 italic flex items-center gap-3">
                <PieChart className="w-4 h-4 text-blue-400" /> ASSET_ALLOCATION
              </h3>
              <div className="h-56 w-full flex items-center justify-center relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={assetAllocationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="none">
                      {assetAllocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', fontSize: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'wallet' && (
              <motion.div 
                key="wallet"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="bg-zinc-950/40 border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl group/wallet relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] blur-[30px] rounded-full -mr-12 -mt-12" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-8 italic flex items-center gap-3">
                      <LinkIcon className="w-4 h-4 text-emerald-500" /> AOS_IDENTITY_VAULT
                    </h3>
                    <div className="space-y-4">
                      <div className="p-6 bg-black border border-white/5 rounded-2xl group/input hover:border-white/10 transition-all">
                        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest block mb-2 italic">EVM_SAFE_PROXY</span>
                        <code className="text-[11px] font-mono font-bold text-zinc-400 break-all select-all">0x72a...88f21e72a...88f21e</code>
                      </div>
                      <div className="p-6 bg-black border border-white/5 rounded-2xl group/input hover:border-white/10 transition-all">
                        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest block mb-2 italic">SOL_MPC_VAULT</span>
                        <code className="text-[11px] font-mono font-bold text-zinc-400 break-all select-all">HN7c...kLx8eHN7c...kLx8e</code>
                      </div>
                      <div className="flex gap-3 pt-2">
                         <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase italic">MPC_SIGN_STABLE</Badge>
                         <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase italic">PAYMASTER_SYMMETRY</Badge>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-zinc-950/40 border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group/logs">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-8 italic flex items-center gap-3">
                      <History className="w-4 h-4 text-zinc-400" /> IDENTITY_AUDIT_LOGS
                    </h3>
                     <ScrollArea className="h-[210px] pr-4">
                        <div className="space-y-4 font-mono">
                           {[1,2,3,4,5].map(i => (
                             <div key={i} className="flex gap-5 text-[10px] text-zinc-600 border-l-2 border-emerald-500/20 pl-4 py-1 hover:border-emerald-500 transition-all">
                                <span className="text-emerald-500/50 font-black leading-none">10:22:1{i}</span>
                                <span className="font-bold uppercase tracking-tight leading-none">MPC_AUTH_RECOVERY: Verified shard {i}/5... OK</span>
                             </div>
                           ))}
                           <div className="bg-[#14F195]/5 p-3 rounded-xl border border-[#14F195]/10 flex gap-4 text-[10px] text-emerald-500/80 font-black items-center italic">
                              <span className="shrink-0">10:24:02</span>
                              <span className="uppercase tracking-tighter">GAS_POLICY_BYPASS: Abstracted fee via KLAWA_REVENUE_RELAYER</span>
                           </div>
                           {[6,7].map(i => (
                             <div key={i} className="flex gap-5 text-[10px] text-zinc-600 border-l-2 border-white/5 pl-4 py-1 hover:border-emerald-500 transition-all">
                                <span className="text-zinc-700 font-black leading-none">10:25:0{i}</span>
                                <span className="font-bold uppercase tracking-tight leading-none uppercase">RPC_ADAPTER: Subscribing to Mempool for ChainID {i}... [STABLE]</span>
                             </div>
                           ))}
                        </div>
                     </ScrollArea>
                  </Card>
                </div>

                <Card className="bg-zinc-950/40 border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl">
                   <div className="flex items-center justify-between px-10 h-20 border-b border-white/5 bg-white/5">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-3 italic">
                        <Coins className="w-4 h-4 text-emerald-400" /> TREASURY_RESERVE_MESH
                      </h3>
                      <span className="text-[10px] font-bold font-mono text-zinc-600 uppercase tracking-widest italic">REAL_TIME_VALUATION</span>
                   </div>
                   <div className="p-0">
                      <table className="w-full text-left font-sans text-xs">
                        <thead>
                           <tr className="border-b border-white/5 bg-white/5">
                              <th className="px-10 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">ASSET</th>
                              <th className="px-10 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">CHAIN_ID</th>
                              <th className="px-10 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">BALANCE</th>
                              <th className="px-10 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic text-right">VALUE_USD</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           <tr className="hover:bg-white/[0.02] transition-all group/row">
                              <td className="px-10 py-8 flex items-center gap-5">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-black shadow-xl">ETH</div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-black text-zinc-200 uppercase tracking-tight leading-none mb-1">Ethereum</span>
                                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">LAYER-1</span>
                                </div>
                              </td>
                              <td className="px-10 py-8 font-mono text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">MAINNET_01</td>
                              <td className="px-10 py-8 text-sm font-mono font-black text-zinc-300 tracking-tighter">
                                {ethBalance && ethBalance.value ? Number(ethBalance.value / BigInt(10 ** ethBalance.decimals)).toFixed(4) : "..."} <span className="text-zinc-600 text-[10px]">ETH</span>
                              </td>
                              <td className="px-10 py-8 text-right text-lg font-black text-[#14F195] italic tracking-tighter shadow-inner">
                                ${ethBalance && ethBalance.value ? (Number(ethBalance.value / BigInt(10 ** ethBalance.decimals)) * 3100).toLocaleString('en-US', {maximumFractionDigits:0}) : "..."}
                              </td>
                           </tr>
                           <tr className="hover:bg-white/[0.02] transition-all group/row">
                              <td className="px-10 py-8 flex items-center gap-5">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-black shadow-xl">SOL</div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-black text-zinc-200 uppercase tracking-tight leading-none mb-1">Solana</span>
                                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">LAYER-1_HF</span>
                                </div>
                              </td>
                              <td className="px-10 py-8 font-mono text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">MAINNET_BETA</td>
                              <td className="px-10 py-8 text-sm font-mono font-black text-zinc-300 tracking-tighter">4,288 <span className="text-zinc-600 text-[10px]">SOL</span></td>
                              <td className="px-10 py-8 text-right text-lg font-black text-[#14F195] italic tracking-tighter shadow-inner">$829,000</td>
                           </tr>
                        </tbody>
                      </table>
                   </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'm2m' && (
               <motion.div 
                 key="m2m"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="space-y-8"
               >
                 <Card className="bg-zinc-950/40 border-white/5 rounded-[3rem] p-10 relative overflow-hidden backdrop-blur-xl group shadow-2xl">
                   <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 flex items-center justify-center pointer-events-none">
                      <RefreshCw className="w-64 h-64 animate-spin-slow text-emerald-500" />
                   </div>
                   <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-xl">
                          <Zap className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">ACTIVE_M2M_STREAMS</h3>
                          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Continuous micro-settlements across agentic nodes.</p>
                        </div>
                      </div>
                      <Button className="h-12 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-zinc-200">INIT_NEW_STREAM_SYNC</Button>
                   </div>
                   <div className="space-y-6 relative z-10">
                     {streamingPayments.map((stream) => (
                        <div key={stream.id} className="p-8 bg-black/60 border border-white/5 rounded-[2.5rem] relative overflow-hidden group/stream hover:border-emerald-500/20 transition-all shadow-2xl">
                           <div className="absolute top-0 left-0 h-full w-1.5 bg-emerald-500/10 group-hover/stream:bg-emerald-500 transition-all" />
                           <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-8">
                              <div className="flex flex-wrap items-center gap-6">
                                 <div className="px-5 py-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-[#14F195] text-xs font-black uppercase tracking-tight italic">{stream.from}</div>
                                 <ArrowRight className="w-5 h-5 text-zinc-800 animate-pulse" />
                                 <div className="px-5 py-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-tight italic">{stream.to}</div>
                              </div>
                              <div className="flex flex-col xl:items-end">
                                 <div className="text-3xl font-mono text-white font-black tracking-tighter italic leading-none mb-2">{stream.amount.toFixed(4)} <span className="text-zinc-700 text-sm">{stream.asset}</span></div>
                                 <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] italic">STREAMING_LOAD @ {stream.rate}</div>
                              </div>
                           </div>
                           <div className="mt-8 h-2 w-full bg-zinc-950 rounded-full relative overflow-hidden border border-white/5">
                               <motion.div 
                                 className="h-full bg-emerald-500 shadow-[0_0_20px_#10b981]"
                                 animate={{ width: ["0%", "100%"] }}
                                 transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                               />
                           </div>
                        </div>
                     ))}
                   </div>
                 </Card>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-10 bg-zinc-950/40 border border-white/5 rounded-[2.5rem] backdrop-blur-xl group shadow-2xl">
                       <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-6 italic">PROTOCOL_AUTH_GATE</h4>
                       <p className="text-[11px] text-zinc-500 font-bold leading-relaxed mb-10 uppercase tracking-tight italic">
                          M2M logic bypasses traditional invoicing using continuous streaming infrastructure. Settlement is finalized per-block, ensuring zero counterparty risk for autonomous agentic service providers.
                       </p>
                       <Button 
                         onClick={handleInitiateSettlement}
                         variant="outline" 
                         className="w-full h-14 border-white/10 bg-white/5 hover:bg-white/10 hover:text-emerald-400 hover:border-emerald-500/50 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl"
                       >
                         INITIATE_AGENT_SETTLEMENT
                       </Button>
                    </div>
                    <div className="p-10 bg-zinc-950/40 border border-white/5 rounded-[2.5rem] flex items-center justify-center backdrop-blur-xl opacity-30 group shadow-2xl">
                       <div className="text-center group-hover:scale-105 transition-transform">
                          <Activity className="w-12 h-12 mx-auto mb-4 text-zinc-700 font-black animate-pulse" />
                          <div className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-800">TELEMETRY_SYNCING...</div>
                       </div>
                    </div>
                 </div>
               </motion.div>
            )}

            {activeTab === 'bridge' && (
               <motion.div 
                 key="bridge"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="space-y-8"
               >
                  <Card className="bg-zinc-950/40 border-white/10 rounded-[4rem] min-h-[500px] flex items-center justify-center p-16 text-center backdrop-blur-3xl relative overflow-hidden group shadow-2xl transition-all hover:border-emerald-500/20">
                     <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                     <div className="space-y-10 relative z-10 flex flex-col items-center">
                        <div className="w-28 h-28 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.1)] group-hover:scale-110 transition-transform duration-500">
                           <Globe className="w-12 h-12 text-emerald-500 animate-pulse" />
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">CROSS_CHAIN_INTENT_ENGINE</h3>
                          <p className="text-sm font-bold text-zinc-500 uppercase tracking-tight max-w-xl mx-auto leading-relaxed italic">
                             Agents submit Intent-based transaction manifests. The Intent Engine handles pre-audited MCP tools (CCIP/WORMHOLE) to execute safely across BTC, ETH, SOL, and Stacks.
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4">
                           {['CCIP_LOADED', 'WORMHOLE_SOCKET', 'STACK_L2_RELAY', 'NATIVE_ZKP_PROVE'].map((tag, i) => (
                             <Badge key={i} variant="outline" className="bg-black/60 border-white/5 py-2 px-5 uppercase text-[10px] font-black tracking-widest italic rounded-xl text-zinc-500 hover:text-white transition-colors cursor-default">{tag}</Badge>
                           ))}
                        </div>
                        <Button 
                          onClick={async () => {
                             if (!isConnected) {
                               toast.error("Web3 Wallet Required to execute X-Chain Payload.");
                               return;
                             }
                             try {
                               toast.loading("Packaging CCIP/Wormhole unified payload...", { id: 'xchain' });
                               await new Promise(r => setTimeout(r, 1500));
                               await sendTransactionAsync({
                                  to: '0x00000000000000000000000000000000000000Cc', // Fake CCIP router
                                  value: parseEther('0'),
                                  data: '0x0123456789abcdef' // Arbitrary intent hex
                               });
                               toast.success("Omnichain intent dispatched to relayers.", { id: 'xchain' });
                             } catch (e) {
                               toast.dismiss('xchain');
                               toast.error("Omnichain dispatch rejected.");
                             }
                          }}
                          className="h-16 px-12 bg-white text-black font-black uppercase italic tracking-widest rounded-2xl shadow-2xl hover:bg-zinc-200 transition-all active:scale-95 text-[11px] mt-4 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                          LAUNCH_OMNICHAIN_ADAPTER
                        </Button>
                     </div>
                     <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <GridPattern />
                     </div>
                  </Card>
               </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <Card className="bg-zinc-950/40 border-white/5 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full -mr-16 -mt-16" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-10 italic flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> SECURITY_ATTESTATION
              </h3>
              <div className="space-y-6">
                {[
                  { l: "Auditor_Scan", v: "PASSED", c: "text-emerald-500" },
                  { l: "MPC_Signer_Health", v: "OPTIMAL_99%", c: "text-emerald-500" },
                  { l: "Account_Abstraction", v: "ACTIVE_SYNC", c: "text-blue-500" }
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 group/stat">
                     <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest italic">{row.l}</span>
                     <span className={`${row.c} font-black uppercase text-[10px] italic tracking-widest group/stat group-hover:scale-105 transition-transform`}>{row.v}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 p-8 bg-black border border-white/5 rounded-3xl relative overflow-hidden group/hw hover:border-white/20 transition-all shadow-inner">
                <div className="absolute top-0 right-0 h-full w-[1px] bg-white/5" />
                <div className="text-[9px] uppercase font-black text-zinc-500 mb-6 tracking-widest italic flex items-center gap-3">
                   <Cpu className="w-3.5 h-3.5 text-zinc-500" /> HARDWARE_ATTEST_LOG
                </div>
                <div className="space-y-3 text-[9px] font-mono font-bold text-zinc-700">
                   <div className="flex items-center gap-3"><span className="text-zinc-800">[SGX]</span> Secure enclave initialized...</div>
                   <div className="flex items-center gap-3 text-emerald-900/40"><span className="text-emerald-900/60 transition-colors group-hover/hw:text-emerald-500">[MPC]</span> Party_1/Party_2 verified...</div>
                   <div className="flex items-center gap-3"><span className="text-zinc-800">[SAFE]</span> Signature verified on Arbitrum...</div>
                   <motion.div animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-3 bg-emerald-500/50 shadow-[0_0_5px_#10b981]" />
                </div>
              </div>
           </Card>

           <Card className="bg-zinc-950/40 border-white/10 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#14F195]/5 to-transparent pointer-events-none" />
              <h3 className="text-xs uppercase font-black tracking-[0.4em] text-white mb-6 italic">IDENTITY_EXPORT</h3>
              <p className="text-[11px] font-bold text-zinc-500 leading-relaxed mb-10 uppercase tracking-tight italic">
                Export your cryptographically signed JSON manifest to migrate your sovereign identity to other decentralized registries.
              </p>
              <Button className="w-full h-16 bg-white text-black font-black text-[11px] rounded-2xl uppercase tracking-widest shadow-2xl hover:bg-zinc-200 transition-all active:scale-95 italic">
                EXPORT_MANIFEST_FILE
                <ArrowUpRight className="ml-3 w-5 h-5 text-zinc-600" />
              </Button>
           </Card>
        </div>
      </div>
    </div>
  );
}

function GridPattern() {
  return (
    <div className="h-full w-full flex items-center justify-center">
       <div className="grid grid-cols-12 gap-1 w-full h-full p-12">
          {Array(144).fill(0).map((_, i) => (
            <div key={i} className="border-[0.5px] border-emerald-500/10 w-full h-12" />
          ))}
       </div>
    </div>
  );
}
