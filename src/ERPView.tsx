import React from 'react';
import { Network, Database, Briefcase, Zap, GitCommit, GitPullRequest, Search, FileCode2, Wallet, Users, Landmark, MonitorSmartphone, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/ui/card";
import { Badge } from "./components/ui/badge";

export function ERPView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3 italic uppercase leading-none mb-1">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Briefcase className="w-6 h-6 text-blue-500" />
            </div>
            Enterprise Resource Planning
          </h2>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mt-2">
            Global alignment of research, development, distributed offices, and payroll architecture.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase border-blue-500/20 text-blue-500 bg-blue-500/10 px-3 py-0.5 italic">
            OS_SYNC: STABLE
          </Badge>
          <div className="px-2 py-1 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] font-black text-emerald-500 tracking-widest">LIVE</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* R&D and Open Source Ethos */}
        <div className="technical-card p-6 flex flex-col hover:border-emerald-500/30 transition-all duration-500 group">
          <div className="mb-6">
            <h3 className="data-label text-emerald-500 flex items-center gap-2">
              <FileCode2 className="w-4 h-4" /> R&D & Open Source Ethos
            </h3>
            <p className="text-[10px] uppercase font-mono font-bold text-zinc-500 mt-2">Code repositories and architectural intelligence.</p>
          </div>
          <div className="space-y-3 mt-auto">
            {[
              { label: "Public GitHub Repos", desc: "Core infra 100% open-source.", value: "24 Active", icon: GitCommit, color: "text-zinc-400", valColor: "text-emerald-500" },
              { label: "Dev Bounties Paid", desc: "Rewarding global builders.", value: "$1.2M", icon: GitPullRequest, color: "text-blue-500", valColor: "text-blue-500" },
              { label: "AGI R&D Grants", desc: "Forward-funded alignment.", value: "4.5M USDC", icon: Search, color: "text-purple-500", valColor: "text-purple-500" },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-zinc-900/20 p-4 border border-zinc-800 rounded-xl hover:bg-zinc-900/40 transition-colors group/item">
                <div className="flex items-center gap-4">
                  <div className={`p-2 bg-zinc-950 rounded-lg border border-zinc-800 ${item.color} group-hover/item:scale-110 transition-transform`}>
                    <item.icon className="w-3 h-3" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black tracking-widest text-zinc-300 uppercase italic leading-none mb-1">{item.label}</h4>
                    <p className="text-[9px] text-zinc-500 font-medium">{item.desc}</p>
                  </div>
                </div>
                <span className={`text-xs font-mono font-bold italic ${item.valColor}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Office and Internal Structures */}
        <div className="technical-card p-6 flex flex-col hover:border-blue-500/30 transition-all duration-500 group">
          <div className="mb-6">
            <h3 className="data-label text-blue-500 flex items-center gap-2">
               <Users className="w-4 h-4" /> Office & Internal Structures
            </h3>
            <p className="text-[10px] uppercase font-mono font-bold text-zinc-500 mt-2">Fully distributed Autonomous Framework.</p>
          </div>
          <div className="space-y-4 mt-auto">
            <div className="flex items-start gap-4 p-5 bg-zinc-900/20 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="p-2 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                <MonitorSmartphone className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-1.5 text-zinc-300 italic leading-none">Decentralized HQ (Meta-Nodes)</h4>
                <p className="text-[9px] text-zinc-500 leading-relaxed font-medium">
                  Zero physical overhead. Talent operates via encrypted hardware clusters worldwide, linked by the <span className="text-zinc-300">Daemon OS</span> interface. All governance flows through multi-sig ExCo protocols.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-5 bg-zinc-900/20 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="p-2 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
                <GitCommit className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-1.5 text-zinc-300 italic leading-none">Asynchronous Workstreams</h4>
                <p className="text-[9px] text-zinc-500 leading-relaxed font-medium">
                  Internal communications handled strictly via <span className="text-zinc-300">PR reviews</span>, RFC documents, and embedded M2M agent workflows over encrypted APIs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Structures & Payments */}
        <div className="technical-card p-6 flex flex-col hover:border-emerald-500/30 transition-all duration-500 group">
          <div className="mb-6">
            <h3 className="data-label text-emerald-500 flex items-center gap-2">
              <Landmark className="w-4 h-4" /> Revenue Architecture
            </h3>
            <p className="text-[10px] uppercase font-mono font-bold text-zinc-500 mt-2">Treasury flow and automated billing.</p>
          </div>
          <div className="space-y-4 mt-auto">
            <div className="p-5 border border-zinc-800 rounded-xl bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors relative overflow-hidden group/item">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-50 group-hover/item:opacity-100 transition-opacity" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-2 italic leading-none pl-2">Internal Payload (Payroll)</h4>
              <p className="text-[9px] text-zinc-500 mb-4 leading-relaxed font-medium pl-2">
                Automated multi-sig payroll streams in stablecoins, dynamically routed across <span className="text-zinc-300">L2 networks</span> to optimize gas and ensure instant finality.
              </p>
              <div className="flex gap-2 pl-2">
                <span className="px-2 py-0.5 border border-blue-500/20 bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest rounded italic">SABL_STR</span>
                <span className="px-2 py-0.5 border border-blue-500/20 bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest rounded italic">SAFE_MSIG</span>
              </div>
            </div>

            <div className="p-5 border border-zinc-800 rounded-xl bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors relative overflow-hidden group/item">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-50 group-hover/item:opacity-100 transition-opacity" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-2 italic leading-none pl-2">External Payload (Client Revenue)</h4>
              <p className="text-[9px] text-zinc-500 mb-4 leading-relaxed font-medium pl-2">
                Tiered subscription models mapping directly to RPC usage. <span className="text-zinc-300">60%</span> flows to treasury buffers, <span className="text-zinc-300">40%</span> auto-compounds into yield-generating protocol infrastructure.
              </p>
              <div className="flex gap-2 pl-2">
                <span className="px-2 py-0.5 border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest rounded italic">S_CRYPTO</span>
                <span className="px-2 py-0.5 border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest rounded italic">SC_AUTO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Strategy */}
        <div className="technical-card p-6 flex flex-col hover:border-amber-500/30 transition-all duration-500 group">
          <div className="mb-6">
            <h3 className="data-label text-amber-500 flex items-center gap-2">
              <Database className="w-4 h-4" /> ERP Viewpoint
            </h3>
            <p className="text-[10px] uppercase font-mono font-bold text-zinc-500 mt-2">Global resource balancing protocol.</p>
          </div>
          <div className="space-y-6 mt-auto bg-zinc-900/20 border border-zinc-800 rounded-xl p-5">
            {[
              { 
                title: "Internal Perspective: Agility & Redundancy", 
                desc: "Treat physical resources like ephemeral nodes. We allocate capital to highest-yield talent without geographic bottleneck, using our agent workforce to cover repetitive QA tasks.",
                iconColor: "bg-amber-500"
              },
              { 
                title: "External Perspective: Institutional Scale", 
                desc: "To a client, Daemon Dynamics represents zero-downtime, fully compliant custody. We mask internal decentralization behind highly strict SLAs and enterprise-grade UI wrappers.",
                iconColor: "bg-emerald-500"
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start group/view">
                <div className="mt-1 flex-shrink-0">
                  <div className="w-3 h-3 rounded border border-zinc-700 flex items-center justify-center bg-zinc-950">
                    <div className={`w-1 h-1 rounded-full ${item.iconColor} opacity-50 group-hover/view:opacity-100 transition-opacity animate-pulse`} />
                  </div>
                </div>
                <div>
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-1.5 italic transition-colors leading-none">{item.title}</h5>
                  <p className="text-[9px] text-zinc-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
