import React, { useState, useEffect } from 'react';
import { Users, Shield, Target, Zap, Briefcase, Activity, CheckCircle2, MessageSquare, Landmark } from 'lucide-react';
import { Button } from './components/ui/button';
import { useSignTypedData, useAccount } from 'wagmi';
import { toast } from 'sonner';
import { db } from './firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Badge } from './components/ui/badge';

const excoMembers = [
  { name: 'Sovereign Core', role: 'Autonomous Lead', status: 'Active', focus: 'Protocol Integrity', efficiency: '99.9%' },
  { name: 'Treasury AI', role: 'Capital Allocator', status: 'Active', focus: 'Yield Optimization', efficiency: '98.5%' },
  { name: 'Ops Sandbox', role: 'Workforce Manager', status: 'Active', focus: 'Scaling & Bounties', efficiency: '97.2%' },
  { name: 'Intel Recon', role: 'Security & Monitoring', status: 'Active', focus: 'Threat Mitigation', efficiency: '99.1%' },
];

export function ExCoView() {
  const { signTypedDataAsync } = useSignTypedData();
  const { isConnected } = useAccount();
  const [proposals, setProposals] = useState<any[]>([]);

  useEffect(() => {
    if (!db) return;
    const q = query(
      collection(db, 'proposals'), 
      where('type', '==', 'EXECUTIVE'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setProposals(data);
    });
    return () => unsubscribe();
  }, []);

  const handleVote = async (propId: string, title: string) => {
    if (!isConnected) {
      toast.error("Web3 Wallet Required to sign Snapshot vote.");
      return;
    }
    try {
      toast.loading("Awaiting Web3 Signature...");
      await signTypedDataAsync({
        domain: {
          name: 'Daemon Snapshot Protocol',
          version: '1',
        },
        types: {
          Vote: [
            { name: 'proposalId', type: 'string' },
            { name: 'choice', type: 'uint32' },
            { name: 'reason', type: 'string' },
          ],
        },
        primaryType: 'Vote',
        message: {
          proposalId: propId,
          choice: 1, // FOR
          reason: 'Automated consensus from Sovereign OS',
        },
      } as any);
      toast.dismiss();
      toast.success(`Vote cast on ${propId} successfully via off-chain signature.`);
    } catch (e) {
      toast.dismiss();
      toast.error("Vote signature rejected.");
    }
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3 italic uppercase leading-none mb-1">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            ExCo Board
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-[10px] font-black border-blue-500/20 text-blue-500 bg-blue-500/10 px-3 py-0.5 tracking-[0.3em] uppercase italic">
            CONSENSUS_ACTIVE
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {excoMembers.map((member, idx) => (
          <div key={idx} className="technical-card p-6 relative overflow-hidden group">
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-900/50 flex items-center justify-center border border-zinc-800">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-[9px] font-mono font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                {member.status}_ONLINE
              </span>
            </div>
            <h3 className="data-value uppercase text-white mb-1 group-hover:text-blue-400 transition-colors">{member.name}</h3>
            <p className="data-label mb-6">{member.role}</p>
            
            <div className="space-y-4 pt-5 border-t border-zinc-900">
              <div>
                <p className="data-label mb-1.5 text-right text-zinc-500">NODE_PRIMARY_FOCUS</p>
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-2 text-center">
                  <span className="text-[10px] font-bold text-zinc-300 uppercase leading-none">{member.focus}</span>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <span className="data-label text-zinc-500">EFFICIENCY</span>
                <span className="data-value text-blue-500">{member.efficiency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 technical-card overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-900 bg-black/20 flex items-center justify-between">
            <div>
               <h3 className="data-label text-white text-xs">Active Directives</h3>
            </div>
          </div>
          <div className="p-6 space-y-3 overflow-y-auto custom-scrollbar flex-1">
            {proposals.map((prop, idx) => (
              <div key={idx} className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between hover:border-zinc-800 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    <Landmark className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                       <span className="text-[9px] font-mono font-bold text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{prop.id}</span>
                       {prop.executionReady && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-black uppercase tracking-widest px-2 py-0">TIMELOCK</Badge>}
                       <h4 className="data-value text-zinc-200 truncate pr-4">{prop.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${prop.executionReady ? 'bg-emerald-500' : 'bg-blue-500'} animate-pulse`}></div>
                       <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{prop.time}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-4 md:mt-0 shrink-0">
                  <div className="text-right">
                    <p className="data-label mb-1 text-zinc-600">CONSENSUS</p>
                    <p className="text-sm font-bold font-mono text-emerald-500">{prop.support}</p>
                  </div>
                  {prop.status === 'Voting' ? (
                    <Button 
                      onClick={() => handleVote(prop.id, prop.title)}
                      className="px-4 py-2 h-9 border border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-[10px] font-black tracking-widest uppercase rounded-lg transition-all"
                    >
                      SIGN
                    </Button>
                  ) : prop.executionReady ? (
                     <Button 
                      onClick={() => {
                         toast.loading(`Simulating Timelock execution...`, { id: prop.id });
                         setTimeout(() => {
                           toast.success(`Proposal ${prop.id} executed to L1!`, { id: prop.id });
                         }, 2000);
                      }}
                      className="px-4 py-2 h-9 border border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-[10px] font-black tracking-widest uppercase rounded-lg transition-all"
                    >
                      COMMIT
                    </Button>
                  ) : (
                    <Button variant="outline" size="icon" disabled className="w-9 h-9 border-zinc-800 bg-transparent opacity-50">
                      <CheckCircle2 className="w-4 h-4 text-zinc-600" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="technical-card p-6 flex flex-col relative overflow-hidden">
          <h3 className="data-label mb-6">System Health</h3>
          <div className="space-y-4 flex-1">
            <div className="flex items-start gap-4 p-4 bg-zinc-900/20 border border-emerald-500/10 rounded-xl hover:bg-zinc-900/40 transition-colors">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Shield className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h4 className="data-label text-zinc-300 mb-1">PROTOCOL_SECURITY</h4>
                <p className="text-[10px] text-zinc-500 uppercase">MPC-secured vaults. NO_BREACH_DETECTED.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-zinc-900/20 border border-blue-500/10 rounded-xl hover:bg-zinc-900/40 transition-colors">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Zap className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h4 className="data-label text-zinc-300 mb-1">EXECUTION_VELOCITY</h4>
                <p className="text-[10px] text-zinc-500 uppercase">Avg consensus 12.4s. Optimizing for sub-10s latency.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-zinc-900/20 border border-purple-500/10 rounded-xl hover:bg-zinc-900/40 transition-colors">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Activity className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <h4 className="data-label text-zinc-300 mb-1">GOVERNANCE_ENGAGEMENT</h4>
                <p className="text-[10px] text-zinc-500 uppercase">98% Active participation. QUORUM_ESTABLISHED.</p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => alert('Opening Governance Forum... (Redirecting to DAO Portal)')}
            variant="outline"
            className="w-full mt-6 h-12 bg-white/5 border-zinc-800 hover:bg-white/10 text-zinc-300 transition-all font-bold tracking-widest text-[10px] uppercase"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            DAO FORUM
          </Button>
        </div>
      </div>
    </div>
  );
}
