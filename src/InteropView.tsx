import React from 'react';
import { 
  ShieldCheck, 
  Globe, 
  Zap, 
  Link as LinkIcon, 
  Cpu, 
  FileJson, 
  Network, 
  CheckCircle2,
  ExternalLink,
  Code,
  Layers,
  Fingerprint
} from 'lucide-react';
import { Button } from './components/ui/button';

const standards = [
  { 
    id: 'W3C-DID', 
    name: 'W3C Decentralized Identifiers', 
    status: 'Compliant', 
    description: 'Universal agent identity layer (did:klawa).',
    icon: Fingerprint,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10'
  },
  { 
    id: 'NIP-ALL', 
    name: 'Nostr Protocol (NIPs)', 
    status: 'Active', 
    description: 'Censorship-resistant M2M discovery & messaging.',
    icon: Radio,
    color: 'text-[#14F195]',
    bg: 'bg-[#14F195]/10'
  },
  { 
    id: 'ERC-4337', 
    name: 'Account Abstraction', 
    status: 'Implemented', 
    description: 'Programmable agent wallets & session keys.',
    icon: ShieldCheck,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10'
  },
  { 
    id: 'JSON-LD', 
    name: 'Semantic Web (JSON-LD)', 
    status: 'Compliant', 
    description: 'Structured data for agent-to-agent understanding.',
    icon: FileJson,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10'
  },
  { 
    id: 'CCIP', 
    name: 'Chainlink CCIP', 
    status: 'Integrated', 
    description: 'Cross-chain asset & command interoperability.',
    icon: LinkIcon,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  { 
    id: 'AGENT-P', 
    name: 'Agent Protocol', 
    status: 'Active', 
    description: 'Standardized API for AI agent communication.',
    icon: Cpu,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10'
  },
];

import { Radio } from 'lucide-react';

export function InteropView() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 lg:col-span-12 font-sans pb-20">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <Globe className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h2 className="text-3xl font-black tracking-tight uppercase italic leading-none text-white">Universal_Interoperability</h2>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
                 <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] leading-none">GLOBAL_SYNC_ACTIVE</span>
              </div>
            </div>
            <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest max-w-xl">
              Integrating $KLAWA onto every platform via decentralized and semantic protocols. M2M consensus standards orchestration.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {standards.map((std) => (
          <div key={std.id} className="bg-zinc-950/40 border border-white/5 rounded-[2rem] p-8 hover:border-white/10 transition-all group relative overflow-hidden flex flex-col shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] blur-[30px] rounded-full -mr-12 -mt-12 group-hover:bg-white/[0.03] transition-colors" />
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className={`w-14 h-14 rounded-2xl ${std.bg} flex items-center justify-center border border-white/5 shadow-inner`}>
                <std.icon className={`w-7 h-7 ${std.color}`} />
              </div>
              <span className="text-[9px] font-mono font-black px-3 py-1 rounded-lg bg-black/60 border border-white/5 text-zinc-600 uppercase tracking-widest italic leading-none">
                {std.id}
              </span>
            </div>
            <h3 className="text-base font-black mb-3 group-hover:text-[#14F195] transition-colors uppercase italic tracking-tight text-zinc-200">{std.name}</h3>
            <p className="text-[11px] text-zinc-500 font-bold leading-relaxed uppercase tracking-tight mb-8 flex-1">{std.description}</p>
            <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#14F195]" />
                <span className="text-[10px] font-black text-[#14F195] uppercase tracking-[0.2em] italic">{std.status}</span>
              </div>
              <Button size="icon" variant="ghost" className="w-9 h-9 rounded-xl bg-white/5 text-zinc-600 hover:text-white hover:bg-white/10 border border-white/5 transition-all">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-zinc-950/40 border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden backdrop-blur-xl group">
          <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                <Layers className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">THE_$KLAWA_INTEGRATION_MESH</h3>
            </div>
            <div className="space-y-10">
              {[
                { n: "01", t: "SEMANTIC_DISCOVERY", d: "Agents broadcast capabilities using JSON-LD schemas over Nostr relays, allowing any system to 'understand' compute capabilities." },
                { n: "02", t: "TRUSTLESS_EXECUTION", d: "Commands verified via ZK-Proofs and executed through ERC-4337 session keys, ensuring agents only perform authorized operational logs." },
                { n: "03", t: "OMNICHAIN_SETTLEMENT", d: "Value moves across chains via CCIP, allowing $KLAWA agents to manage treasuries on Ethereum while operating on Solana or Stacks." }
              ].map((step, i) => (
                <div key={i} className="flex gap-6 group/step">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center shrink-0 text-xs font-mono font-black text-zinc-700 group-hover/step:text-purple-400 group-hover/step:border-purple-500/30 transition-all shadow-xl">{step.n}</div>
                  <div>
                    <h4 className="text-sm font-black mb-2 uppercase tracking-tight text-white italic">{step.t}</h4>
                    <p className="text-[11px] text-zinc-500 font-bold uppercase leading-relaxed tracking-tight group-hover/step:text-zinc-400 transition-colors">{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/5 blur-[80px] rounded-full -mb-40 -mr-40 group-hover:bg-purple-500/10 transition-colors"></div>
        </div>

        <div className="lg:col-span-5 bg-zinc-950/40 border border-[#14F195]/10 rounded-[2.5rem] p-10 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#14F195]/5 blur-[60px] rounded-full -mr-20 -mt-20" />
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-[#14F195]/10 rounded-2xl border border-[#14F195]/20 shadow-[0_0_20px_rgba(20,241,149,0.1)]">
              <Code className="w-6 h-6 text-[#14F195]" />
            </div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">INTEGRATION_CONSOLE</h3>
          </div>
          
          <div className="bg-black border border-white/5 rounded-3xl p-8 font-mono text-[10px] text-zinc-600 shadow-[inset_0_2px_30px_rgba(0,0,0,0.8)] relative overflow-hidden group-hover:border-[#14F195]/20 transition-all">
            <div className="absolute top-0 right-0 w-[1px] h-full bg-[#14F195]/10" />
            <div className="space-y-3 relative z-10">
              <p className="text-emerald-500 font-black tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                INIT_UNIVERSAL_DID_RESOLVER...
              </p>
              <p className="text-blue-500 font-black italic tracking-tighter">RESOLVING: did:klawa:agent_0x88... [STABLE_SUCCESS]</p>
              <p className="text-zinc-800 font-bold uppercase tracking-widest italic">FETCHING: nostr://relay.klawa.io/nip-05/verify... [OK]</p>
              <p className="text-zinc-800 font-bold uppercase tracking-widest italic">CHECKING: erc4337://entrypoint/validate_op... [OK]</p>
              <p className="text-purple-500 font-black italic tracking-tighter">SESSION: active_key_0x123... [EXPIRES_IN_120M]</p>
              <div className="pt-8 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse shadow-[0_0_10px_#14f195]"></span>
                <span className="text-[#14F195] font-black tracking-[0.2em] uppercase text-[9px]">LISTENING_GLOBAL_M2M_BROADCASTS...</span>
              </div>
            </div>
          </div>
          
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" className="h-14 border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-500 hover:text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all">
              DOWNLOAD_SDK_SPEC
            </Button>
            <Button className="h-14 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-zinc-200 shadow-2xl transition-all active:scale-95">
              CONNECT_TO_RELAY
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
