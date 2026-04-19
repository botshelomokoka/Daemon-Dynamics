import React from 'react';
import { Briefcase, TrendingUp, Shield, Zap, Globe, Landmark, Activity, CheckCircle2, ChevronRight, MessageSquare, Database, Layers, BarChart3, Star, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { ScrollArea } from "./components/ui/scroll-area";
import { toast } from "sonner";

const businessServices = [
  { name: 'White-Label Vaults', category: 'Institutional SaaS', status: 'Active', clients: '12 Family Offices', revenue: '$450K/mo', growth: '+15%', icon: Landmark },
  { name: 'Yield-as-a-Service', category: 'DeFi Infrastructure', status: 'Active', clients: '8 Hedge Funds', revenue: '$320K/mo', growth: '+22%', icon: BarChart3 },
  { name: 'MPC Custody API', category: 'Security SaaS', status: 'Beta', clients: '4 Fintechs', revenue: '$120K/mo', growth: '+45%', icon: Shield },
  { name: 'Sovereign Compliance', category: 'RegTech', status: 'Active', clients: '15 Protocols', revenue: '$280K/mo', growth: '+10%', icon: CheckCircle2 },
];

export function BusinessServicesView() {
  const [intel, setIntel] = React.useState<any[]>([]);
  const [isScanning, setIsScanning] = React.useState(false);

  const researchOps = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/ai/biz-intel', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIntel(data.enhancements);
        toast.success("Strategic Operations Intelligence Synchronized.");
      }
    } catch (e) {
      toast.error("Research Interrupted: Intelligence Core Offline.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3 italic uppercase leading-none mb-1">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Landmark className="w-6 h-6 text-blue-500" />
            </div>
            SaaS & Infra
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-[10px] font-black border-blue-500/20 text-blue-500 bg-blue-500/10 px-3 py-0.5 tracking-[0.3em] uppercase italic">
            B2B_ACTIVE
          </Badge>
        </div>
      </header>

      {intel.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {intel.map((item, i) => (
            <Card key={i} className="bg-blue-500/5 border-blue-500/20 rounded-2xl overflow-hidden group hover:border-blue-500/40 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-blue-500 text-black text-[9px] font-bold px-2 py-0.5">{item.category}</Badge>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <h4 className="text-sm font-bold uppercase italic mb-2 text-white">{item.name}</h4>
                <p className="text-[10px] text-zinc-500 font-mono leading-tight italic">"{item.description}"</p>
                <div className="pt-4 mt-4 border-t border-blue-500/10">
                  <p className="text-[9px] font-bold text-blue-400 uppercase mb-2 tracking-widest">Technical_Alignment</p>
                  <div className="flex flex-wrap gap-2">
                    {item.techStack.map((tech: string, j: number) => (
                      <span key={j} className="text-[8px] font-bold text-zinc-400 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 truncate max-w-full font-mono">{tech}</span>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-500/10 flex justify-between items-center">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">Est_Yield</span>
                    <span className="text-sm font-bold text-emerald-500 font-mono tracking-tighter italic">{item.potentialRevenue}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: TrendingUp, label: "Recurring Revenue", val: "$1.17M", sub: "+18.5% MoM", color: "text-emerald-500" },
          { icon: Zap, label: "Inst. Partners", val: "39", sub: "HIGH_RETENTION", color: "text-blue-500" },
          { icon: Activity, label: "SLA Uptime", val: "99.99%", sub: "ENTERPRISE_TIER", color: "text-purple-500" },
          { icon: Shield, label: "Compliance", val: "AAA+", sub: "SOC2_VERIFIED", color: "text-emerald-500" }
        ].map((stat, i) => (
          <div key={i} className="technical-card p-6 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="data-label">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color} opacity-50`} />
              </div>
              <p className="text-3xl font-mono font-bold tracking-tighter text-white mb-1">{stat.val}</p>
              <p className="text-[10px] text-zinc-500 font-mono italic">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 technical-card overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-900 bg-black/20">
            <h3 className="data-label text-white text-xs flex items-center gap-2">
               <Briefcase className="w-4 h-4 text-blue-500" />
               Service Portfolio
            </h3>
          </div>
          <ScrollArea className="flex-1 custom-scrollbar">
             <div className="p-6 space-y-3">
                {businessServices.map((service, idx) => (
                  <div key={idx} className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-5 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800">
                        <service.icon className="w-5 h-5 text-zinc-500 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <div>
                        <h4 className="data-value text-white mb-0.5">{service.name}</h4>
                        <p className="data-label text-zinc-500">{service.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="text-right hidden md:block">
                        <p className="data-label mb-1">REVENUE</p>
                        <p className="text-sm font-mono font-bold text-emerald-500">{service.revenue}</p>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="data-label mb-1 whitespace-pre">GROWTH</p>
                        <p className="text-sm font-mono font-bold text-blue-500">{service.growth}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={`h-6 text-[9px] font-black uppercase tracking-widest border rounded px-3 ${
                          service.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                          {service.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </ScrollArea>
        </div>

        <div className="lg:col-span-4 technical-card p-6 flex flex-col">
          <h3 className="data-label mb-6 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" /> INFRA_HEALTH
          </h3>
          <div className="space-y-4 flex-1">
            {[
              { icon: Database, title: "Tenant Isolation", desc: "Cryptographic vault protocols", status: "SECURE", color: "text-emerald-500", border: "border-emerald-500/20" },
              { icon: Activity, title: "API Throughput", desc: "12.4K req/min (Normal range)", status: "NOMINAL", color: "text-blue-500", border: "border-blue-500/20" },
              { icon: Globe, title: "Edge Nodes", desc: "12 active / 4 global regions", status: "STABLE", color: "text-purple-500", border: "border-purple-500/20" }
            ].map((infra, i) => (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/50 group transition-all hover:bg-zinc-900/40`}>
                <div className={`p-2 bg-white/5 rounded-lg ${infra.color}`}>
                  <infra.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                   <div className="flex items-center justify-between mb-1">
                      <h4 className="data-label text-zinc-300">{infra.title}</h4>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${infra.color}`}>{infra.status}</span>
                   </div>
                   <p className="text-[10px] text-zinc-500 uppercase">{infra.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full h-12 mt-6 bg-white/5 border-zinc-800 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 text-zinc-300 transition-all">
            <MessageSquare className="w-4 h-4 mr-2" />
            CLIENT PORTAL
          </Button>
        </div>
      </div>
    </div>
  );
}
