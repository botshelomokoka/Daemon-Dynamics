import React, { useState, useEffect } from 'react';
import { Landmark, Vote, TrendingUp, Shield, Zap, Activity, CheckCircle2, MessageSquare, Database } from 'lucide-react';
import { useKlawaMetrics } from './KlawaContext';
import { db } from './firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';

const governanceProposals = [
  { id: 'DAO-088', title: 'Adjust Protocol Fee Split for Autonomous Agents', status: 'Active', votes: '1.2M $KLAWA', support: '92%', time: '12h' },
  { id: 'DAO-087', title: 'Whitelist Stacks L2 for Treasury Allocation', status: 'Passed', votes: '2.5M $KLAWA', support: '98%', time: 'Executed' },
  { id: 'DAO-086', title: 'Upgrade MPC Custody to v2.4.0', status: 'Passed', votes: '1.8M $KLAWA', support: '99%', time: 'Executed' },
  { id: 'DAO-085', title: 'Autonomous Workforce Expansion Cap Increase', status: 'Active', votes: '850K $KLAWA', support: '78%', time: '2d' },
];

export function GovernanceView() {
  const { klawaPrice, totalSupply, circulatingSupply, subgraphSynced, blockIndexed } = useKlawaMetrics();
  const [proposals, setProposals] = useState<any[]>([]);

  useEffect(() => {
    if (!db) return;
    const q = query(
      collection(db, 'proposals'), 
      where('type', '==', 'GOVERNANCE'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setProposals(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 lg:col-span-12 pb-20">
      <header className="technical-card p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-purple-500/10 rounded-2xl border border-purple-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.1)]">
            <Landmark className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white uppercase italic leading-none mb-2">
              DAO Governance
            </h2>
             <span className="data-label text-purple-400/70">OVERSIGHT_MANDATE</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`px-3 py-1.5 ${subgraphSynced ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'} border rounded-lg flex items-center gap-2`}>
            <div className={`w-1.5 h-1.5 rounded-full ${subgraphSynced ? 'bg-primary' : 'bg-yellow-500'} animate-pulse`}></div>
            <span className="text-[9px] font-bold uppercase tracking-widest">{subgraphSynced ? 'SUBGRAPH_SYNCED' : 'INDEXING_DATA...'}</span>
          </div>
          {subgraphSynced && (
             <span className="text-[8px] font-mono font-bold text-zinc-500 tracking-widest uppercase italic">
               BLOCK: {blockIndexed.toLocaleString()}
             </span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="technical-card p-8 group">
          <div className="flex items-center justify-between mb-8">
            <span className="data-label">KLAWA_MARKET_PRICE</span>
            <TrendingUp className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex items-baseline gap-4">
            <p className="text-4xl font-mono font-bold text-primary tracking-tighter italic leading-none">${klawaPrice.toFixed(4)}</p>
            <div className="flex items-center gap-1 text-primary text-[10px] font-bold bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
              <TrendingUp className="w-3 h-3" />
              <span>+8.4%</span>
            </div>
          </div>
          <p className="text-[9px] text-zinc-600 mt-6 font-mono font-bold tracking-widest uppercase flex items-center gap-2">
            <Activity className="w-3 h-3" /> INDEX: {subgraphSynced ? 'OK' : 'PENDING'}
          </p>
        </div>

        <div className="technical-card p-8 group">
          <div className="flex items-center justify-between mb-8">
            <span className="data-label">KLAWA_TOTAL_SUPPLY</span>
            <Database className="w-4 h-4 text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex items-baseline gap-4">
            <p className="text-4xl font-mono font-bold text-blue-400 tracking-tighter italic leading-none">{(totalSupply / 1000000).toFixed(0)}M</p>
            <div className="flex items-center gap-1 text-blue-400 text-[10px] font-bold bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">
              <Activity className="w-3 h-3" />
              <span>DYNAMIC</span>
            </div>
          </div>
          <p className="text-[9px] text-zinc-600 mt-6 font-mono font-bold tracking-widest uppercase">CIRCULATING: {(circulatingSupply / 1000000).toFixed(1)}M ({(circulatingSupply / totalSupply * 100).toFixed(1)}%)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Staked", val: "12.4M", sub: "+4.5%", color: "text-primary" },
          { label: "Participation", val: "88.2%", sub: "HIGH", color: "text-blue-400" },
          { label: "Proposals", val: "4", sub: "ACTIVE", color: "text-purple-400" },
          { label: "Treasury", val: "$3.65M", sub: "ASSETS", color: "text-emerald-400" }
        ].map((stat, i) => (
          <div key={i} className="technical-card p-8 relative overflow-hidden group">
            <span className="data-label block mb-6">{stat.label}</span>
            <p className={`text-2xl font-mono font-bold ${stat.color} tracking-tighter italic leading-none mb-3`}>{stat.val}</p>
            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 technical-card overflow-hidden">
          <div className="p-8 border-b border-zinc-900 bg-black/20 flex flex-row items-center justify-between">
            <span className="data-label">DAO_PROPOSALS.ARCHIVE</span>
            <button className="text-[9px] font-bold uppercase text-zinc-500 hover:text-white transition-colors">FULL_LEDGER</button>
          </div>
          <div className="p-4 space-y-2">
            {proposals.map((prop, idx) => (
              <div key={idx} className="group bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-zinc-800/40 transition-colors">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div className="w-10 h-10 rounded-lg bg-zinc-950 flex items-center justify-center border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                    <Vote className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[8px] font-mono font-bold text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">{prop.id}</span>
                      <h4 className="font-bold text-xs text-zinc-300 group-hover:text-white transition-colors uppercase">{prop.title}</h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <CheckCircle2 className={`w-3 h-3 ${prop.status === 'Passed' ? 'text-emerald-500' : 'text-purple-500'}`} />
                       <p className="text-[8px] text-zinc-500 font-mono font-bold uppercase tracking-widest">{prop.time === 'Executed' ? 'TX_EXECUTED' : `${prop.time}_REMAINING`}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mb-1">STAKED_VOTES</p>
                    <p className="text-xs font-bold font-mono text-zinc-300">{prop.votes}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mb-1">SUPPORT</p>
                    <p className="text-xs font-bold font-mono text-emerald-500">{prop.support}</p>
                  </div>
                  <div className="w-20 text-right">
                    <span className={`text-[8px] font-bold font-mono px-2 py-0.5 rounded border ${
                      prop.status === 'Active' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {prop.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="technical-card p-8 flex flex-col">
           <span className="data-label mb-8 block">GOVERNANCE_POWER</span>
          <div className="flex-1 flex flex-col">
            <div className="p-8 bg-black/40 border border-primary/20 rounded-2xl text-center mb-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/30 animate-pulse" />
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-2">VOTING_WEIGHT</p>
              <p className="text-3xl font-mono font-bold text-primary tracking-tighter italic">12,450</p>
              <p className="text-[8px] text-zinc-600 mt-2 font-mono font-bold uppercase">≈ 0.125%_CONSENSUS</p>
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-300 mb-1.5 uppercase tracking-widest">STAKING_APY</h4>
                  <p className="text-[9px] text-zinc-500 font-bold leading-relaxed">YIELD: 12.4% (EPOCH: 24h).</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Landmark className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-300 mb-1.5 uppercase tracking-widest">AUM_METRICS</h4>
                  <p className="text-[9px] text-zinc-500 font-bold leading-relaxed">RESERVES: $3.65M.</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => alert('Opening Staking Portal...')}
              className="w-full mt-8 h-12 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
            >
              <Zap className="w-4 h-4 mr-2" />
              Stake $KLAWA
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
