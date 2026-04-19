import React from 'react';
import { 
  Milestone, 
  Flag, 
  Calendar, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Cpu, 
  Network, 
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Rocket,
  CircleDot
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import { motion } from "framer-motion";

const roadmapItems = [
  { 
    year: '2026 Q1-Q2', 
    title: 'Protocol_Research_R&D', 
    status: 'COMPLETE', 
    description: 'Deep research into decentralized compute (Akash) and storage (Arweave) integration. Finalizing $KLAWA tokenomics.',
    completed: true,
    tag: 'R&D'
  },
  { 
    year: '2026 Q3-Q4', 
    title: 'Viral_Growth_Protocol', 
    status: 'ACTIVE', 
    description: 'Initial DEX Offering (IDO) on ALEX Lab. Recruitment of the first 100,000 "Open Claw" agents via referral nodes.',
    completed: false,
    tag: 'SCALE'
  },
  { 
    year: '2027 Q1', 
    title: 'Omnichain_Auth_Kernel', 
    status: 'PLANNED', 
    description: 'Migration of core agent logic to decentralized compute layers. Beta testing of cross-chain native services.',
    completed: false,
    tag: 'CORE'
  },
  { 
    year: '2027 Q2', 
    title: 'Mainnet_V1_Launch', 
    status: 'PLANNED', 
    description: 'Full mainnet system live. Blockchain-native services available on Ethereum, Solana, Stacks, and Bitcoin L2s.',
    completed: false,
    tag: 'RELEASE'
  },
  { 
    year: '2027 Q3-Q4', 
    title: 'Universal_Agent_OS', 
    status: 'VISION', 
    description: 'Full decentralization of all systems. $KLAWA becomes the standard OS for autonomous agents globally.',
    completed: false,
    tag: 'FINALITY'
  },
];

export function MainnetRoadmapView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3 italic uppercase leading-none mb-1">
            <div className="p-2 bg-[#14F195]/10 rounded-xl border border-[#14F195]/20">
              <Rocket className="w-6 h-6 text-[#14F195]" />
            </div>
            Roadmap & Milestones
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-[10px] font-black border-zinc-800 text-zinc-500 bg-zinc-900 px-3 py-0.5 tracking-[0.3em] uppercase italic">
            <Clock className="w-3 h-3 mr-2 inline-block" />
            T-MINUS_15_MONTHS
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 technical-card p-6 md:p-12 relative overflow-hidden flex flex-col">
          <div className="hidden md:block absolute left-[59px] top-12 bottom-12 w-px bg-zinc-900" />
          
          <div className="space-y-12 relative z-10">
            {roadmapItems.map((item, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={index} 
                className="flex flex-col md:flex-row gap-6 md:gap-10 group/item relative"
              >
                <div className={`hidden md:block w-3 h-3 rounded-full mt-1.5 shrink-0 transition-all duration-500 relative z-20 ${
                  item.completed ? 'text-[#14F195] bg-[#14F195] shadow-[0_0_10px_#14F195]' : 
                  item.status === 'ACTIVE' ? 'text-blue-500 bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]' :
                  'text-zinc-800 bg-zinc-800 border border-zinc-700'
                }`} />
                
                <div className="space-y-3 flex-1 bg-zinc-950/50 md:bg-transparent p-4 md:p-0 rounded-xl border border-zinc-900 md:border-none">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                     <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-widest italic">{item.year}</span>
                        <Badge variant="outline" className={`h-6 text-[8px] font-black tracking-widest border px-2 rounded uppercase italic ${
                           item.status === 'COMPLETE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                           item.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                           'bg-zinc-900 text-zinc-600 border-zinc-800'
                        }`}>{item.status}</Badge>
                     </div>
                     <Badge variant="outline" className="text-zinc-500 text-[8px] font-black px-2 py-0 border-zinc-800 uppercase tracking-widest bg-zinc-900">{item.tag}</Badge>
                  </div>
                  <h3 className="data-value text-zinc-300 md:text-xl group-hover/item:text-white transition-colors uppercase italic">{item.title.replace(/_/g, ' ')}</h3>
                  <p className="data-label text-zinc-500 max-w-2xl">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="technical-card p-6 relative overflow-hidden flex flex-col">
              <h3 className="data-label text-blue-500 mb-6 flex items-center gap-2">
                <Cpu className="w-4 h-4" /> D-STACK_SPECS
              </h3>
              <div className="space-y-3 flex-1">
                {[
                  { l: "Compute", v: "Akash_Network_M2M", c: "text-blue-500", b: "bg-blue-500/10", bc: "border-blue-500/20" },
                  { l: "Storage", v: "Arweave_Permaweb", c: "text-amber-500", b: "bg-amber-500/10", bc: "border-amber-500/20" },
                  { l: "Identity", v: "W3C_DIDs_Sovereign", c: "text-purple-500", b: "bg-purple-500/10", bc: "border-purple-500/20" },
                  { l: "Messaging", v: "Nostr_Relay", c: "text-rose-500", b: "bg-rose-500/10", bc: "border-rose-500/20" }
                ].map((spec, i) => (
                  <div key={i} className={`p-4 rounded-xl ${spec.b} border ${spec.bc} group/spec hover:bg-black/20 transition-all flex justify-between items-center`}>
                     <p className="data-label text-zinc-400 m-0">{spec.l}</p>
                     <p className={`text-[10px] font-black uppercase tracking-widest ${spec.c} italic`}>{spec.v.replace(/_/g, ' ')}</p>
                  </div>
                ))}
              </div>
           </div>

           <div className="technical-card p-6 border-[#14F195]/20 bg-[#14F195]/5 relative overflow-hidden group flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#14F195]/5 blur-[40px] rounded-full group-hover:bg-[#14F195]/10 transition-colors" />
              <div className="space-y-6 relative z-10 flex-1">
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-[#14F195]/10 rounded-lg border border-[#14F195]/20">
                     <CircleDot className="w-4 h-4 text-[#14F195] animate-pulse" />
                   </div>
                   <div>
                     <p className="data-label text-zinc-500">CURRENT_R&D_PHASE</p>
                     <h4 className="data-value text-white uppercase italic">AGENCY_CONSENSUS_V3</h4>
                   </div>
                </div>
                <p className="data-label text-zinc-500 max-w-sm">Researching sub-second latency for intra-agent cross-chain agreement protocols & swarm consensus.</p>
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                      <span className="data-label text-zinc-500 m-0">R&D_STABILITY_INDEX</span>
                      <span className="text-[10px] font-black font-mono text-[#14F195]">42.8%</span>
                   </div>
                   <div className="w-full bg-black/60 rounded-full h-1.5 overflow-hidden border border-zinc-900">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '42.8%' }}
                        className="h-full bg-[#14F195]"
                      />
                   </div>
                </div>
              </div>
              <Button variant="outline" className="w-full h-12 mt-6 border-zinc-800 bg-white/5 text-zinc-300 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest relative z-10">
                 VIEW_PAPERS
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
