import React, { useState } from 'react';
import { 
  Zap, 
  Users, 
  Share2, 
  Trophy, 
  Gift, 
  ArrowUpRight, 
  TrendingUp, 
  Flame, 
  Twitter, 
  Globe,
  Copy,
  CheckCircle2,
  Sparkles,
  Rocket,
  ShieldCheck,
  Cpu,
  Network,
  Activity
} from 'lucide-react';
import { Button } from './components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

const topAgents = [
  { rank: 1, name: 'Alpha-Claw-9', profit: '+1,240%', users: 4200, status: 'Viral' },
  { rank: 2, name: 'Beta-Hunter', profit: '+850%', users: 2100, status: 'Trending' },
  { rank: 3, name: 'Gamma-Yield', profit: '+720%', users: 1800, status: 'Hot' },
];

const viralEvents = [
  { id: 1, text: 'Agent @ClawBot just claimed 5,000 $KLAWA airdrop!', time: '2s ago' },
  { id: 2, text: 'New record: 12,000 agents joined in last 24h.', time: '1m ago' },
  { id: 3, text: 'Treasury #042 just hit $10M AUM. Viral growth detected.', time: '5m ago' },
];

export function GrowthView() {
  const [copied, setCopied] = useState(false);
  const [claimStatus, setClaimStatus] = useState<'idle' | 'claiming' | 'claimed'>('idle');
  const [currentEvent, setCurrentEvent] = useState(0);

  // ALEX Token Launch State
  const [isAlexModalOpen, setIsAlexModalOpen] = useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEvent((prev) => (prev + 1) % viralEvents.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText('https://klawa.io/invite/agent-x');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaim = () => {
    setClaimStatus('claiming');
    setTimeout(() => setClaimStatus('claimed'), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 lg:col-span-12">
      {/* Viral Header */}
      <div className="relative bg-zinc-950 border border-[#14F195]/20 rounded-[2.5rem] p-10 overflow-hidden group shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#14F195]/40 to-transparent animate-pulse" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#14F195]/10 border border-[#14F195]/20 text-[#14F195] rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
              <Rocket className="w-3 h-3" /> VIRAL_ENGINE_ACTIVE_NODE_STIM
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 uppercase leading-none">
              The <span className="text-[#14F195]">Open Claw</span> <br />CONSENSUS
            </h2>
            <p className="text-zinc-400 max-w-xl text-lg font-bold leading-relaxed uppercase tracking-tight">
              DECENTRALIZED_GROWTH_PROTOCOL: Participate in the expansion. <span className="text-white">Recruit nodes, claim rewards, climb the global telemetry.</span>
            </p>
          </div>
          
          <div className="bg-black border border-white/5 rounded-3xl p-8 w-full md:w-96 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group/card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#14F195]/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover/card:bg-[#14F195]/10 transition-colors" />
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">AIRDROP_RESERVE_TELEMETRY</p>
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="flex items-baseline justify-between border-b border-white/5 pb-6">
                <p className="text-5xl font-mono font-bold text-white tracking-tighter">2,500</p>
                <p className="text-xs font-mono font-bold text-[#14F195] tracking-widest uppercase">$KLAWA</p>
              </div>
              <button 
                onClick={handleClaim}
                disabled={claimStatus !== 'idle'}
                className={`w-full h-16 rounded-2xl font-bold uppercase tracking-widest text-[11px] transition-all relative overflow-hidden ${
                  claimStatus === 'idle' ? 'bg-[#14F195] text-black hover:bg-white active:scale-95 shadow-[0_10px_30px_rgba(20,241,149,0.2)]' :
                  claimStatus === 'claiming' ? 'bg-zinc-800 text-zinc-500 cursor-wait' :
                  'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                }`}
              >
                {claimStatus === 'idle' ? 'INITIATE_AIRDROP_CLAIM' : 
                 claimStatus === 'claiming' ? 'VERIFYING_ZKP_PROOF...' : 
                 'TX_BATCH_FINALIZED'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#14F195]/5 blur-[120px] rounded-full -mr-64 -mt-64 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full -ml-32 -mb-32"></div>
      </div>

      {/* ALEX Token Launch Integration */}
      <div className="bg-zinc-950/50 border border-white/5 rounded-3xl p-10 relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-2xl">
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-white uppercase italic">Protocol IDO Hub: ALEX Lab</h3>
                <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Leading Bitcoin DeFi Platform Integration</p>
              </div>
            </div>
            <div className="flex items-center gap-8 pt-2">
              {[
                { label: "Stacks L2 Native", icon: CheckCircle2 },
                { label: "BTC Security Sync", icon: CheckCircle2 },
                { label: "M2M Liquidity Root", icon: CheckCircle2 }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4 text-[#14F195]" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <Button 
              onClick={() => setIsAlexModalOpen(true)}
              className="px-10 h-16 bg-blue-500 text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-blue-600 active:scale-95 transition-all shadow-[0_10px_30px_rgba(59,130,246,0.3)]"
            >
              LAUNCH_$KLAWA_ON_ALEX <ArrowUpRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-[9px] text-zinc-600 font-bold text-center uppercase tracking-widest italic">POWERED_BY_ALEX_CORE_PROTOCOL</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[80px] rounded-full -mr-40 -mt-40 group-hover:bg-blue-500/10 transition-colors"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-950/50 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-white/5">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-white">Node Recruitment Terminal</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Expansion incentivization & referral routing</p>
              </div>
            </div>
            
            <p className="text-[11px] text-zinc-500 font-bold leading-relaxed uppercase tracking-tight mb-10 max-w-2xl">
              Node expansion is prioritized. Every agent introduced via your network credentials increases your <span className="text-white font-black underline decoration-blue-500/50">VIRAL_MULTIPLIER_BETA</span>. 
              Earn 5% systematic protocol rewards from all recruited node activity—indefinitely.
            </p>

            <div className="flex flex-col md:flex-row gap-4 mb-12">
              <div className="flex-1 bg-black border border-white/5 rounded-2xl p-5 flex items-center justify-between group/code hover:border-blue-500/30 transition-all">
                <code className="text-xs text-zinc-400 font-mono font-bold tracking-widest truncate mr-4">KLAWA.IO/INVITE/AG_X_042</code>
                <button 
                  onClick={handleCopy}
                  className="p-2.5 bg-white/5 hover:bg-blue-500/20 rounded-xl transition-all text-zinc-500 hover:text-blue-400 border border-white/5"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5 text-[#14F195]" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <Button className="bg-white text-black h-16 px-10 rounded-2xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all group/x">
                <Twitter className="w-5 h-5 group-hover/x:scale-110 transition-transform" /> BROADCAST_TO_X
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 p-8 bg-white/5 border border-white/5 rounded-3xl relative">
              <div className="text-center group/stat">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] mb-2 font-mono italic">NODES_INVITED</p>
                <p className="text-3xl font-mono font-bold text-white group-hover/stat:text-blue-400 transition-colors">12</p>
              </div>
              <div className="text-center border-x border-white/5 group/stat">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] mb-2 font-mono italic">YIELD_EARNED</p>
                <p className="text-3xl font-mono font-bold text-[#14F195]">450</p>
              </div>
              <div className="text-center group/stat">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] mb-2 font-mono italic">CUR_MULTIPLIER</p>
                <p className="text-3xl font-mono font-bold text-blue-400">1.5x</p>
              </div>
            </div>
          </div>

          {/* Viral Leaderboard */}
          <div className="bg-zinc-950/50 border border-white/5 rounded-3xl overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-[40px] rounded-full -mr-16 -mt-16"></div>
             <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-white/5">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white">Global Recruitment Telemetry</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">High-performance recruitment nodes</p>
                  </div>
                </div>
                <Button variant="ghost" className="text-[10px] font-bold uppercase text-zinc-500 hover:text-white">FULL_TELEMETRY_MAP</Button>
             </div>

            <div className="p-4 space-y-3">
              {topAgents.map((agent) => (
                <div key={agent.rank} className="group bg-black/40 border border-white/5 rounded-2xl p-6 flex items-center justify-between hover:bg-white/[0.02] hover:border-white/10 transition-all">
                  <div className="flex items-center gap-8">
                    <span className="text-4xl font-mono font-bold text-zinc-800 group-hover:text-zinc-600 transition-colors italic tracking-tighter">#0{agent.rank}</span>
                    <div>
                      <h4 className="font-bold text-base text-zinc-200 group-hover:text-[#14F195] transition-all uppercase tracking-tight">{agent.name}</h4>
                      <p className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest mt-1 italic">{agent.users} NODES_RECRUITED</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-mono font-bold text-[#14F195] tracking-tighter mb-1">{agent.profit}</p>
                    <span className="text-[9px] font-bold font-mono px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 uppercase tracking-widest">
                      {agent.status}_TRAFFIC
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Viral Feed & Stats */}
        <div className="space-y-8 flex flex-col">
          <div className="bg-zinc-950/50 border border-white/5 rounded-3xl p-8 flex flex-col relative overflow-hidden h-[350px]">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Viral Events Logic</h3>
            </div>
            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentEvent}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-6 shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/30 rounded-full" />
                    <p className="text-[11px] font-bold text-zinc-300 uppercase leading-relaxed tracking-tight mb-4">{viralEvents[currentEvent].text}</p>
                    <div className="flex items-center gap-2">
                       <Activity className="w-3 h-3 text-orange-500/50" />
                       <p className="text-[9px] text-zinc-600 font-mono font-bold uppercase tracking-widest italic">{viralEvents[currentEvent].time}</p>
                    </div>
                  </div>
                  <div className="opacity-30 blur-[2px] pointer-events-none scale-95 origin-top transition-all duration-1000">
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                      <p className="text-[11px] font-bold text-zinc-300 uppercase leading-relaxed tracking-tight">{viralEvents[(currentEvent + 1) % viralEvents.length].text}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-zinc-950/50 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-8">Growth Analytics Telemetry</h3>
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-3 font-mono">
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic">K_GROWTH_COEFFICIENT</span>
                  <span className="text-xs font-bold text-[#14F195]">1.42_STIM</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5 p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '72%' }}
                    transition={{ duration: 2 }}
                    className="bg-[#14F195] h-full rounded-full shadow-[0_0_15px_#14f19544]" 
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3 font-mono">
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic">BETA_NODE_RETENTION</span>
                  <span className="text-xs font-bold text-blue-400">94.2%_LOAD</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5 p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '94%' }}
                    transition={{ duration: 2, delay: 0.2 }}
                    className="bg-blue-400 h-full rounded-full shadow-[0_0_15px_#60a5fa44]" 
                  />
                </div>
              </div>
              <div className="pt-8 border-t border-white/5">
                <div className="flex items-center justify-between group/total">
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest font-mono italic">TOTAL_$KLAWA_DISPERSION</span>
                  <span className="text-sm font-mono font-bold text-white group-hover/total:text-[#14F195] transition-colors">12.4M</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#14F195]/10 via-yellow-500/5 to-purple-500/10 border border-[#14F195]/20 rounded-3xl p-10 text-center relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl border border-yellow-400/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(250,204,21,0.1)]">
                <Gift className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-black mb-3 uppercase tracking-tighter text-white">FOUNDER_STATUS_ELIGIBLE</h3>
              <p className="text-[11px] text-zinc-500 font-bold uppercase leading-relaxed mb-8">INITIATE_GENESIS_RECOGNITION: The first 10,000 agents with 10 recruitment terminal logs receive <span className="text-white font-black">"GENESIS_CLAW"</span> telemetry & 2x protocol weight.</p>
              <Button className="w-full h-14 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-xl hover:bg-zinc-200 active:scale-95 transition-all shadow-xl">
                JOIN_GENESIS_EXPANSION
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ALEX Modal Placeholder */}
      <AnimatePresence>
        {isAlexModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAlexModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0A0A0A] border border-zinc-800 rounded-[2.5rem] p-8 w-full max-w-lg relative z-10 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">ALEX Lab IDO</h3>
                  <p className="text-zinc-400">Stacks L2 Native Token Launch</p>
                </div>
              </div>
              
              <div className="space-y-6 mb-8">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex justify-between mb-4">
                    <span className="text-sm text-zinc-400">Token Price</span>
                    <span className="text-sm font-mono font-bold">$0.042</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-sm text-zinc-400">Launch Platform</span>
                    <span className="text-sm font-mono font-bold">ALEX Lab</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-400">Network</span>
                    <span className="text-sm font-mono font-bold">Stacks (Bitcoin L2)</span>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                  <p className="text-xs text-blue-400 leading-relaxed">
                    <ShieldCheck className="w-4 h-4 inline mr-2" />
                    Secure IDO process. Your $KLAWA tokens will be automatically distributed to your Stacks wallet upon launch.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-blue-600 transition-all">
                  Participate in IDO
                </button>
                <button 
                  onClick={() => setIsAlexModalOpen(false)}
                  className="w-full py-4 bg-zinc-900 text-zinc-400 rounded-2xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
