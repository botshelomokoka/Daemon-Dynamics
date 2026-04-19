import React from 'react';
import { ArrowRightLeft, Globe, Zap, Shield, Activity, TrendingUp, Bot, ChevronRight, MessageSquare, Database, Layers } from 'lucide-react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';

const crossChainRoutes = [
  { id: 'ROUTE-001', source: 'Ethereum', dest: 'Stacks L2', status: 'Active', type: 'Liquidity Bridge', agent: '@DAEMON-Treasury', volume: '$1.2M', apy: '12.4%' },
  { id: 'ROUTE-002', source: 'Solana', dest: 'Arbitrum', status: 'Active', type: 'Yield Router', agent: '@DAEMON-Strategy', volume: '$850K', apy: '15.8%' },
  { id: 'ROUTE-003', source: 'Base', dest: 'Optimism', status: 'Optimizing', type: 'Fee Arbitrage', agent: '@DAEMON-Ops', volume: '$420K', apy: '8.2%' },
  { id: 'ROUTE-004', source: 'Polygon', dest: 'zkEVM', status: 'Active', type: 'Asset Tokenizer', agent: '@DAEMON-Treasury', volume: '$650K', apy: '10.5%' },
];

export function CrossChainView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3 italic uppercase leading-none mb-1">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Globe className="w-6 h-6 text-emerald-500" />
            </div>
            Cross-Chain Operations
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-[10px] font-black border-emerald-500/20 text-emerald-500 bg-emerald-500/10 px-3 py-0.5 tracking-[0.3em] uppercase italic">
            OMNICHAIN_ACTIVE
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Bridged Volume', val: '$245.8M', icon: Globe, color: 'text-emerald-500' },
          { label: 'Active Omnichain Agents', val: '84', icon: Bot, color: 'text-blue-500' },
          { label: 'Avg. Finality Time', val: '12.4s', icon: Zap, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="technical-card p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="data-label">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color} opacity-50`} />
            </div>
            <p className="text-3xl font-mono font-bold tracking-tighter text-white relative z-10 italic leading-none">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="technical-card overflow-hidden">
        <div className="flex items-center justify-between px-6 p-6 border-b border-zinc-900 bg-black/20">
          <h3 className="data-label flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-emerald-500" /> AUTONOMOUS_X-CHAIN_ROUTES
          </h3>
          <span className="data-label text-zinc-600">REAL_TIME_DISPERSION_LOGS</span>
        </div>
        <div className="p-6 space-y-3">
          {crossChainRoutes.map((route) => (
            <div key={route.id} className="bg-zinc-900/20 border border-zinc-800 rounded-xl p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:border-zinc-700 transition-all group/route relative overflow-hidden">
              <div className="flex flex-wrap items-center gap-4 relative z-10">
                <div className="flex items-center gap-3 bg-zinc-950 px-4 h-9 rounded-lg border border-zinc-800">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">{route.source}</span>
                  <ArrowRightLeft className="w-3 h-3 text-zinc-600 animate-pulse" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">{route.dest}</span>
                </div>
                <div className={`px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-widest border transition-all ${
                  route.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                }`}>
                  {route.status}
                </div>
                <span className="text-[8px] font-mono font-black text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 uppercase tracking-widest hidden md:block">
                  {route.type}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-8 relative z-10">
                <div>
                  <p className="data-label mb-1">OPERATIVE</p>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Bot className="w-3 h-3 text-emerald-500" />
                    <span className="data-value">{route.agent}</span>
                  </div>
                </div>
                <div>
                  <p className="data-label mb-1">24H_VOL</p>
                  <p className="data-value">{route.volume}</p>
                </div>
                <div>
                  <p className="data-label mb-1">YIELD_APY</p>
                  <p className="data-value text-emerald-500">{route.apy}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="technical-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="data-label flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" /> NETWORK_TELEMETRY
            </h3>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Ethereum Mainnet', latency: '12.4s', status: 'STABLE' },
              { name: 'Stacks L2', latency: '5.2s', status: 'OPTIMAL' },
              { name: 'Solana', latency: '0.4s', status: 'OPTIMAL' },
              { name: 'Arbitrum One', latency: '1.2s', status: 'STABLE' },
              { name: 'Base', latency: '1.5s', status: 'STABLE' },
            ].map((net, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-zinc-900/20 border border-zinc-800 rounded-xl hover:bg-zinc-900/40 transition-colors">
                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic">{net.name}</span>
                <div className="flex items-center gap-4">
                  <span className="data-label m-0">{net.latency}</span>
                  <div className="flex items-center gap-1.5 border border-zinc-800 px-2 py-0.5 rounded bg-zinc-950">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{net.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="technical-card p-6 flex flex-col">
          <h3 className="data-label text-emerald-500 mb-6 flex items-center gap-2">
             <Shield className="w-4 h-4 text-emerald-500" /> OMNICHAIN_SECURITY
          </h3>
          <div className="space-y-4 flex-1">
            <div className="flex items-start gap-4 p-4 bg-zinc-900/20 border border-zinc-800 rounded-xl hover:border-emerald-500/30 transition-colors">
              <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0 border border-emerald-500/20">
                <Shield className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h4 className="data-label text-zinc-300 m-0 mb-1">MPC_PROTOCOL_LOCK</h4>
                <p className="text-[10px] font-medium text-zinc-500">Threshold Signatures & Multi-Party Computation.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-zinc-900/20 border border-zinc-800 rounded-xl hover:border-blue-500/30 transition-colors">
              <div className="p-2 bg-blue-500/10 rounded-lg shrink-0 border border-blue-500/20">
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h4 className="data-label text-zinc-300 m-0 mb-1">REAL-TIME_RECON</h4>
                <p className="text-[10px] font-medium text-zinc-500">24/7 bridge monitoring mitigating liquidity risks.</p>
              </div>
            </div>
          </div>
          
          <Button variant="outline" className="w-full mt-6 h-10 bg-transparent border-zinc-800 hover:bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-300">
            EXPLORE TOPOLOGY
          </Button>
        </div>
      </div>

      <div className="technical-card p-8">
        <h3 className="data-label mb-6 flex items-center gap-2 text-blue-500">
          <Database className="w-4 h-4" /> Native CRM <span className="text-zinc-600 ml-2 font-normal">(70% TAM)</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Base (L2)', desc: 'Smart wallet integrations & low-latency micro-txs.', ph: 'Phase 1: Active', color: 'text-emerald-500 border-emerald-500/20' },
            { name: 'Arbitrum (Olas)', desc: 'Olas network for decentralized coordination.', ph: 'Phase 2: R&D', color: 'text-blue-500 border-blue-500/20' },
            { name: 'Morpheus / Lumerin', desc: 'Decentralized inference routing.', ph: 'Phase 3: Slated', color: 'text-amber-500 border-amber-500/20' },
            { name: 'Solana (DePIN)', desc: 'High TPS for complex HF multi-agent engines.', ph: 'Phase 3: Slated', color: 'text-amber-500 border-amber-500/20' },
          ].map((item, idx) => (
             <div key={idx} className="bg-zinc-900/20 p-5 border border-zinc-800 rounded-xl flex flex-col justify-between h-full hover:border-zinc-700 transition-colors">
              <div className="mb-4">
                <h4 className="data-value text-zinc-200 mb-1">{item.name}</h4>
                <p className="text-[10px] text-zinc-500">{item.desc}</p>
              </div>
              <span className={`text-[8px] font-black uppercase text-center py-1.5 rounded border bg-zinc-950 ${item.color} tracking-widest`}>
                {item.ph}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
