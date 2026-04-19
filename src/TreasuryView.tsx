import React from 'react';
import { Landmark, TrendingUp, Zap, Shield, ArrowRightLeft, DollarSign, Activity, PieChart, Database } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useKlawaMetrics } from './KlawaContext';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';

const treasuryData = [
  { time: '00:00', value: 3450000 },
  { time: '04:00', value: 3480000 },
  { time: '08:00', value: 3420000 },
  { time: '12:00', value: 3550000 },
  { time: '16:00', value: 3580000 },
  { time: '20:00', value: 3620000 },
  { time: '23:59', value: 3650000 },
];

export function TreasuryView() {
  const { klawaPrice, totalSupply, circulatingSupply } = useKlawaMetrics();

  return (
    <div className="space-y-6 animate-in fade-in duration-700 lg:col-span-12 font-sans pb-20">
      <header className="technical-card p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <Landmark className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white uppercase italic leading-none">Treasury Hub</h2>
              <div className="flex items-center gap-2 mt-2">
                 <span className="data-label text-emerald-400/70">RESERVE_MANAGEMENT_v8.4</span>
                 <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                   <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">LIVE_LIQUIDITY_OPTIMIZATION</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
           <div className="flex flex-col text-right">
             <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">GLOBAL_LIQUIDITY</span>
             <span className="text-xs font-mono font-bold text-emerald-400 whitespace-nowrap">$128.4M_SYNC</span>
           </div>
           <div className="w-[1px] h-6 bg-zinc-800" />
           <div className="flex flex-col text-right">
             <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">TOTAL_RESERVES</span>
             <span className="text-xs font-mono font-bold text-blue-400 whitespace-nowrap">$3.65M_NET</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="technical-card p-8 group overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="data-label">KLAWA_MARKET_PRICE</span>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex items-baseline gap-4">
            <p className="text-4xl font-mono font-bold text-emerald-400 tracking-tighter italic leading-none">${klawaPrice.toFixed(4)}</p>
            <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 italic">
              <TrendingUp className="w-3 h-3" />
              <span>+8.4%</span>
            </div>
          </div>
          <p className="text-[9px] text-zinc-600 mt-8 font-mono font-bold tracking-widest uppercase italic border-l border-emerald-500/20 pl-4 py-1">RPC_LATENCY: 42ms</p>
        </div>

        <div className="technical-card p-8 group overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="data-label">KLAWA_CIRC_SUPPLY</span>
            </div>
            <Database className="w-4 h-4 text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex items-baseline gap-4">
            <p className="text-4xl font-mono font-bold text-blue-400 tracking-tighter italic leading-none">42.5M</p>
            <div className="flex items-center gap-1 text-blue-400 text-[10px] font-bold bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10 italic">
              <Activity className="w-3 h-3" />
              <span>42.5%</span>
            </div>
          </div>
          <p className="text-[9px] text-zinc-600 mt-8 font-mono font-bold tracking-widest uppercase italic border-l border-blue-500/20 pl-4 py-1">SNAPSHOT_HEIGHT: 18,402,125</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Assets Mgmt", val: "$3.65M", sub: "+4.2%_CYCLE", color: "text-emerald-400", icon: Landmark },
          { label: "Protocol Rev", val: "$12.4K", sub: "YIELD_LOCKED", color: "text-blue-400", icon: Zap },
          { label: "Efficiency", val: "98.2%", sub: "MAX_THROUGH", color: "text-purple-400", icon: Activity },
          { label: "Risk Buffer", val: "$850K", sub: "MPC_SECURED", color: "text-orange-400", icon: Shield }
        ].map((stat, i) => (
          <div key={i} className="technical-card p-8 group relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <span className="data-label">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
            </div>
            <p className={`text-2xl font-mono font-bold ${stat.color} tracking-tighter italic leading-none`}>{stat.val}</p>
            <p className="text-[9px] text-zinc-600 font-bold mt-3 uppercase tracking-widest italic">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 technical-card p-10 overflow-hidden relative group backdrop-blur-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="data-label block">Treasury Growth Curve</span>
              <p className="text-[8px] text-zinc-600 font-bold uppercase mt-1 tracking-widest italic leading-none">AUM_VALUATION_MESH_TELEMETRY</p>
            </div>
            <div className="flex items-center gap-3 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest italic">AUM_SYNC</span>
            </div>
          </div>
          <div className="h-[400px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={treasuryData}>
                <defs>
                  <linearGradient id="treasuryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14F195" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#14F195" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#27272a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#3f3f46', fontWeight: '900' }}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', fontSize: '10px', fontFamily: 'monospace', fontWeight: '900' }}
                  itemStyle={{ color: '#14F195' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#14F195" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#treasuryGradient)" 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute bottom-10 left-12 right-12 flex items-center justify-between pointer-events-none relative z-10">
             <div className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.5em] italic leading-none">HISTORICAL_YIELD_INDEX</div>
             <div className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.5em] italic leading-none">PREDICTIVE_THROUGHPUT_v4.2</div>
          </div>
        </div>

        <div className="lg:col-span-4 technical-card p-10 flex flex-col group backdrop-blur-sm">
          <span className="data-label mb-10 block">Asset Allocation</span>
          <div className="space-y-8 flex-1">
            {[
              { l: "Bitcoin", v: "42%", c: "bg-[#F7931A]", sub: "RESERVE_MESH" },
              { l: "Ethereum", v: "35%", c: "bg-[#627EEA]", sub: "SMART_YIELD" },
              { l: "USDC", v: "18%", c: "bg-[#2775CA]", sub: "BUFFER_SYC" },
              { l: "Solana", v: "5%", c: "bg-[#14F195]", sub: "ALPHA_SWARM" }
            ].map((asset, i) => (
              <div key={i} className="group/asset">
                <div className="flex justify-between items-end mb-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-white uppercase group-hover/asset:text-primary transition-colors">{asset.l}</span>
                    <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-tight">{asset.sub}</p>
                  </div>
                  <span className="text-xl font-mono font-bold text-zinc-300 italic leading-none">{asset.v}</span>
                </div>
                <div className="h-0.5 bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: asset.v }}
                    transition={{ duration: 1.5, delay: i * 0.1 }}
                    className={`${asset.c} h-full`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-900">
            <Button 
              onClick={() => alert(`Initiating Treasury Rebalance...`)}
              className="w-full h-12 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-zinc-200 active:scale-95 transition-all shadow-2xl italic flex items-center justify-center gap-3"
            >
              <PieChart className="w-4 h-4" />
              Rebalance
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
