import React, { useState, useEffect } from 'react';
import { Building2, Landmark, TrendingDown, DollarSign, Wallet, Shield, Zap, Wrench, Settings, Play, CheckCircle2, Factory } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { db } from './firebase';
import { collection, onSnapshot, query, setDoc, doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

const initialBudgets = {
  capex: {
    allocated: '$0',
    spent: '$0',
    remaining: '$0',
    status: 'FROZEN'
  },
  opex: {
    allocated: '$50/mo',
    spent: '$0',
    remaining: '$50',
    status: 'LOCKED'
  }
};

const initialFacilities = [
  { id: 'DB-01',    name: 'Cloud Database / Ops',        type: 'Database (Free Tier)', status: 'ACTIVE',    capex_ytd: '$0', opex_monthly: '$0',  util: '45%' },
  { id: 'CLD-02',   name: 'Vercel / Edge Network',       type: 'Digital Infra',        status: 'OPTIMIZED', capex_ytd: '$0', opex_monthly: '$35', util: '90%' },
  { id: 'API-03',   name: 'AI Agents & Twilio SDK',      type: 'SaaS / Comms',         status: 'OPTIMIZED', capex_ytd: '$0', opex_monthly: '$15', util: '85%' }
];

const initialProductionConfig = {
  isGenerating: false,
  hqWalletBalance: 0,
  targetRequired: 150, // $50 OpEx + $100 Profit
  activeAgents: 0
};

export function OpenshawBOSView() {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [facilities, setFacilities] = useState(initialFacilities);
  const [productionConfig, setProductionConfig] = useState(initialProductionConfig);
  const [showDeploySuccess, setShowDeploySuccess] = useState(false);
  
  useEffect(() => {
    if (!db) return;
    
    // Listen to Openshaw Facilities in DB
    const unsub = onSnapshot(collection(db, 'openshaw_facilities'), (snap) => {
      if (snap.empty) {
        setFacilities(initialFacilities);
        initialFacilities.forEach(f => setDoc(doc(db, 'openshaw_facilities', f.id), f));
      } else {
        setFacilities(snap.docs.map(d => d.data() as any));
      }
    });
    
    // Listen to Openshaw Budgets in DB
    const unsubBudgets = onSnapshot(doc(db, 'openshaw_budgets', 'global'), (snap) => {
      if (!snap.exists()) {
        setBudgets(initialBudgets);
        setDoc(doc(db, 'openshaw_budgets', 'global'), initialBudgets);
      } else {
        setBudgets(snap.data() as any);
      }
    });

    // Listen to Production Core
    const unsubProduction = onSnapshot(doc(db, 'openshaw_production', 'core'), (snap) => {
      if (!snap.exists()) {
        setProductionConfig(initialProductionConfig);
        setDoc(doc(db, 'openshaw_production', 'core'), initialProductionConfig);
      } else {
        setProductionConfig(snap.data() as any);
      }
    });

    return () => {
      unsub();
      unsubBudgets();
      unsubProduction();
    };
  }, []);

  // Emulate agentic production running in background
  useEffect(() => {
    if (!productionConfig.isGenerating) return;
    
    const interval = setInterval(async () => {
      if (db) {
        // Generate random income block from agent output ($1 - $5)
        const incomeGenerated = Math.floor(Math.random() * 5) + 1;
        const newBalance = productionConfig.hqWalletBalance + incomeGenerated;
        await updateDoc(doc(db, 'openshaw_production', 'core'), {
          hqWalletBalance: newBalance
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [productionConfig.isGenerating, productionConfig.hqWalletBalance]);

  const handleDeployProduction = async () => {
    if (!db) return;
    
    // Safety check: Don't rapidly restart if already transitioning
    if (productionConfig.isGenerating) return;

    try {
        await updateDoc(doc(db, 'openshaw_production', 'core'), {
          isGenerating: true,
          activeAgents: 2, // Low staff proof
        });
        setShowDeploySuccess(true);
        setTimeout(() => setShowDeploySuccess(false), 3000);
    } catch (e: any) {
        console.error("Error starting production", e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3 italic uppercase leading-none mb-1">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <Building2 className="w-6 h-6 text-indigo-500" />
            </div>
            Openshaw BOS
          </h2>
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest mt-2 flex items-center gap-2">
             <Settings className="w-4 h-4 text-zinc-400" />
             Business Operating System
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded border border-indigo-500/30 bg-indigo-500/10">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_#6366f1]" />
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic leading-none">WhatsApp_AGENT_ONLINE</span>
          </div>
        </div>
      </header>

      {/* Production Swarm Income Generation */}
      <Card className="bg-gradient-to-br from-indigo-900/40 via-black to-black border-indigo-500/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Factory className="w-48 h-48 text-indigo-500" />
        </div>
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4">
              <div>
                 <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> Profit Proof Wallet
                 </h3>
                 <p className="text-zinc-400 text-xs mt-1 max-w-sm leading-relaxed">
                   Current operations cost locked at $50/mo. Total required profit proof projection: $150. Scaling is strictly prohibited until positive margin is achieved with low staff.
                 </p>
              </div>
              <div className="flex items-end gap-3">
                 <span className="text-4xl font-mono font-black text-white">
                    ${productionConfig.hqWalletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </span>
                 <span className="text-zinc-500 font-mono text-sm uppercase tracking-widest pb-1 mb-1">/ ${productionConfig.targetRequired.toLocaleString()} req</span>
              </div>
              
              {/* Progress Bar towards minimum required */}
              <div className="w-full max-w-md bg-zinc-900 rounded-full h-2 overflow-hidden mt-2">
                <motion.div 
                  className="bg-indigo-500 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (productionConfig.hqWalletBalance / productionConfig.targetRequired) * 100)}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            <div className="bg-black/50 border border-indigo-500/20 rounded-xl p-4 min-w-[250px] space-y-4 shadow-xl">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Agents</span>
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 font-mono">
                     {productionConfig.activeAgents} / 2 (Low Staff)
                  </Badge>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Production Rate</span>
                  <span className="text-sm font-mono text-emerald-400 flex items-center gap-1">
                     <Zap className="w-3 h-3" /> {productionConfig.isGenerating ? '~$5/hr' : '$0/hr'}
                  </span>
               </div>
               
               <Button 
                  onClick={handleDeployProduction} 
                  disabled={productionConfig.isGenerating}
                  className={`w-full font-black uppercase tracking-widest text-xs transition-all ${
                     productionConfig.isGenerating 
                     ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20' 
                     : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] shadow-indigo-500/50 hover:shadow-indigo-500'
                  }`}
               >
                 {productionConfig.isGenerating ? (
                   <span className="flex items-center gap-2"><Zap className="w-4 h-4 fill-current animate-pulse" /> Generating Proof</span>
                 ) : (
                   <span className="flex items-center gap-2"><Play className="w-4 h-4" /> Run Profit Proof</span>
                 )}
               </Button>
               
               <AnimatePresence>
                 {showDeploySuccess && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0 }}
                     className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest text-center flex items-center justify-center gap-1 mt-2"
                   >
                     <CheckCircle2 className="w-3 h-3" /> Staff Deployed
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CapEx & OpEx Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black/40 border-zinc-800 backdrop-blur-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Landmark className="w-24 h-24 text-blue-500" />
           </div>
           <CardHeader>
              <CardTitle className="text-lg font-black uppercase italic tracking-wider flex justify-between items-center z-10 relative">
                 <span className="flex items-center gap-2 text-white"><Landmark className="w-5 h-5 text-blue-500" /> CapEx Tracker</span>
                 <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-[10px]">{budgets.capex.status}</Badge>
              </CardTitle>
              <CardDescription className="text-zinc-500 text-xs tracking-widest uppercase">Capital Expenditures / Fixed Assets</CardDescription>
           </CardHeader>
           <CardContent className="relative z-10 space-y-4">
              <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
                 <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Allocated YTD</span>
                 <span className="text-2xl font-mono text-white">{budgets.capex.allocated}</span>
              </div>
              <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
                 <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Spent YTD</span>
                 <span className="text-2xl font-mono text-red-400">{budgets.capex.spent}</span>
              </div>
              <div className="flex justify-between items-end">
                 <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Remaining</span>
                 <span className="text-2xl font-mono text-emerald-400">{budgets.capex.remaining}</span>
              </div>
           </CardContent>
        </Card>

        <Card className="bg-black/40 border-zinc-800 backdrop-blur-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingDown className="w-24 h-24 text-orange-500" />
           </div>
           <CardHeader>
              <CardTitle className="text-lg font-black uppercase italic tracking-wider flex justify-between items-center z-10 relative">
                 <span className="flex items-center gap-2 text-white"><TrendingDown className="w-5 h-5 text-orange-500" /> OpEx Monitor</span>
                 <Badge variant="outline" className="border-orange-500/50 text-orange-400 text-[10px]">{budgets.opex.status}</Badge>
              </CardTitle>
              <CardDescription className="text-zinc-500 text-xs tracking-widest uppercase">Operational Expenditures / Monthly</CardDescription>
           </CardHeader>
           <CardContent className="relative z-10 space-y-4">
              <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
                 <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Monthly Allocation</span>
                 <span className="text-2xl font-mono text-white">{budgets.opex.allocated}</span>
              </div>
              <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
                 <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Spent Current Mo</span>
                 <span className="text-2xl font-mono text-red-400">{budgets.opex.spent}</span>
              </div>
              <div className="flex justify-between items-end">
                 <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Buffer</span>
                 <span className="text-2xl font-mono text-emerald-400">{budgets.opex.remaining}</span>
              </div>
           </CardContent>
        </Card>
      </div>

      {/* Digital Infrastructure & Workspace */}
      <Card className="bg-black/40 border-zinc-800 backdrop-blur-xl">
        <CardHeader>
           <CardTitle className="text-white flex items-center gap-2 uppercase tracking-widest font-black italic">
              <Wrench className="w-5 h-5 text-indigo-500" /> Workspace & Digital Infra
           </CardTitle>
           <CardDescription className="text-zinc-500 uppercase tracking-widest text-xs">Managed by WhatsApp Office Agent</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase tracking-widest">
                       <th className="pb-3 font-semibold">Asset ID</th>
                       <th className="pb-3 font-semibold">Name</th>
                       <th className="pb-3 font-semibold">Classification</th>
                       <th className="pb-3 font-semibold text-right">CapEx YTD</th>
                       <th className="pb-3 font-semibold text-right">OpEx / Mo</th>
                       <th className="pb-3 font-semibold text-right">Utilization</th>
                       <th className="pb-3 font-semibold text-right">Status</th>
                    </tr>
                 </thead>
                 <tbody className="text-sm">
                    {facilities.map((fac: any) => (
                       <tr key={fac.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                          <td className="py-4 font-mono text-zinc-400 text-xs">{fac.id}</td>
                          <td className="py-4 font-medium text-zinc-200">{fac.name}</td>
                          <td className="py-4 text-zinc-400 text-xs uppercase tracking-widest">{fac.type}</td>
                          <td className="py-4 text-right font-mono text-zinc-500">{fac.capex_ytd}</td>
                          <td className="py-4 text-right font-mono text-orange-400/80">{fac.opex_monthly}</td>
                          <td className="py-4 text-right font-mono text-indigo-400/80">{fac.util}</td>
                          <td className="py-4 text-right">
                             <Badge variant="outline" className={`text-[9px] ${
                                fac.status === 'OPTIMIZED' || fac.status === 'ACTIVE' ? 'text-emerald-400 border-emerald-500/30' : 'text-amber-400 border-amber-500/30'
                             }`}>
                                {fac.status}
                             </Badge>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </CardContent>
      </Card>
      
      <div className="p-4 rounded border border-indigo-500/20 bg-indigo-500/5 mt-4">
        <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-2">
           <Zap className="w-4 h-4" /> Agentic Workspace Integration
        </h4>
        <p className="text-xs text-zinc-400 leading-relaxed">
           The Openshaw Office Manager AI Agent is connected via Twilio WhatsApp SDK. You can message the agent on WhatsApp to log requests, record OpEx spending (e.g. Cloud server limits, API quotas), or query our 100% cloud-native infrastructure health.
           Send a message to the Webhook to test logic.
        </p>
      </div>

    </div>
  );
}
