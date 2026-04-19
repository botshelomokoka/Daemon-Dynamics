import React, { useState, useEffect } from 'react';
import { Building, TrendingUp, Shield, Globe, Landmark, Zap, ArrowRightLeft, Activity, DollarSign, PieChart } from 'lucide-react';
import { Button } from './components/ui/button';
import { db } from './firebase';
import { collection, onSnapshot, query, setDoc, doc } from 'firebase/firestore';

const initialRwaAssets = [
  { id: 'RWA-001', name: 'US Treasury Bills', category: 'Fixed Income', yield: '5.2%', value: '$1.2M', allocation: '32%', status: 'Tokenized' },
  { id: 'RWA-002', name: 'Commercial Real Estate', category: 'Real Estate', yield: '7.8%', value: '$850K', allocation: '24%', status: 'Tokenized' },
  { id: 'RWA-003', name: 'Private Credit Fund', category: 'Credit', yield: '12.4%', value: '$620K', allocation: '18%', status: 'Tokenized' },
  { id: 'RWA-004', name: 'Gold Bullion', category: 'Commodities', yield: '0.0%', value: '$450K', allocation: '12%', status: 'Tokenized' },
];

export function RWAView() {
  const [rwaAssets, setRwaAssets] = useState(initialRwaAssets);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'rwa_assets'), (snap) => {
      if (snap.empty) {
        setRwaAssets(initialRwaAssets);
        // Self-heal: Seed DB if empty
        initialRwaAssets.forEach(a => setDoc(doc(db, 'rwa_assets', a.id), a));
      } else {
        setRwaAssets(snap.docs.map(d => d.data() as any));
      }
    });
    return () => unsub();
  }, []);
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3 italic uppercase leading-none mb-1">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Building className="w-6 h-6 text-emerald-500" />
            </div>
            RWA Tokenization
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded border border-emerald-500/30 bg-emerald-500/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic leading-none">ON-CHAIN_VERIFIED</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total RWA Value', val: '$3.12M', icon: DollarSign, color: 'text-emerald-500', trend: '+6.5% (YTD)' },
          { label: 'Average Yield', val: '8.4%', icon: Zap, color: 'text-blue-500', trend: 'INST_GRADE' },
          { label: 'Asset Liquidity', val: '88.2%', icon: Activity, color: 'text-purple-500', trend: 'ACTIVE_MKTS' },
          { label: 'Verification Status', val: '100%', icon: Shield, color: 'text-emerald-500', trend: 'AUDITED' },
        ].map((stat, i) => (
          <div key={i} className="technical-card p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <p className="data-label">{stat.label}</p>
              <stat.icon className={`w-4 h-4 ${stat.color} opacity-50`} />
            </div>
            <p className={`text-3xl font-mono font-bold tracking-tighter relative z-10 text-white mb-2`}>{stat.val}</p>
            <div className="flex items-center gap-2 relative z-10">
               <span className={`text-[9px] font-mono font-black uppercase tracking-widest italic ${stat.color}`}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 technical-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-black/20">
            <h3 className="data-label text-emerald-500 text-xs flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-500" /> Tokenized Asset Roster
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {rwaAssets.map((asset, idx) => (
              <div key={idx} className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:border-zinc-800 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
                    <Building className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-mono font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">{asset.id}</span>
                      <h4 className="data-value text-zinc-200">{asset.name}</h4>
                    </div>
                    <p className="data-label text-zinc-500">{asset.category}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-8">
                  <div className="text-right">
                    <p className="data-label mb-1">VALUE</p>
                    <p className="text-[12px] font-bold font-mono text-white">{asset.value}</p>
                  </div>
                  <div className="text-right">
                    <p className="data-label mb-1 text-emerald-500">YIELD</p>
                    <p className="text-[12px] font-bold font-mono text-emerald-500">{asset.yield}</p>
                  </div>
                  <div className="text-right">
                    <p className="data-label mb-1 text-blue-500">ALLOCATION</p>
                    <p className="text-[12px] font-bold font-mono text-blue-500">{asset.allocation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 technical-card p-6 flex flex-col">
          <h3 className="data-label text-emerald-500 mb-6">Strategy & Compliance</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/20 border border-zinc-800 group transition-all hover:bg-zinc-900/40">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <Globe className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h4 className="data-label text-white mb-1">GLOBAL_FRAMEWORK</h4>
                <p className="text-[10px] text-zinc-500 uppercase">Assets tokenized under strict regulatory frameworks.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/20 border border-zinc-800 group transition-all hover:bg-zinc-900/40">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                <Landmark className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h4 className="data-label text-white mb-1">TIER-1_CUSTODY</h4>
                <p className="text-[10px] text-zinc-500 uppercase">Physical assets held by Grade-A custodians.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/20 border border-zinc-800 group transition-all hover:bg-zinc-900/40">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
                <Activity className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <h4 className="data-label text-white mb-1">ORACLE_RECON</h4>
                <p className="text-[10px] text-zinc-500 uppercase">Continuous valuation updates via on-chain oracles.</p>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline"
            className="w-full mt-6 h-10 border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-300 transition-all flex items-center justify-center gap-2"
          >
            <PieChart className="w-4 h-4" /> VIEW_PORTFOLIO
          </Button>
        </div>
      </div>
    </div>
  );
}
