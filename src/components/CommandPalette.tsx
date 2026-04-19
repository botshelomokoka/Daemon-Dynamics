import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Terminal, Zap, Shield, GitMerge, Cpu, X, Bot, Activity } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, getDocs, serverTimestamp, query, where, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { audioEngine } from '../lib/audio';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
        if (!isOpen) {
          audioEngine.playBoot();
        }
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const commands = [
    {
      id: 'spawn-operative',
      title: 'Spawn Operative (Auditor)',
      icon: <Bot className="w-4 h-4 text-emerald-400" />,
      action: async () => {
        try {
          const tempId = `agent-manual-${Math.random().toString(36).substr(2, 5)}`;
          await setDoc(doc(db, 'agents', tempId), {
            id: tempId,
            name: `@MANUAL-Auditor-${tempId.substr(-3)}`,
            type: 'Auditor',
            role: 'Auditor',
            efficiency: 95,
            status: 'idle',
            earnings: 0,
            cut: 15,
            ephemeral: false
          });
          toast.success("Manual Operative Spawned Succesfully");
          audioEngine.playClick();
        } catch (e) {
          toast.error("Failed to spawn operative");
        }
      }
    },
    {
      id: 'inject-anomaly',
      title: 'Simulate Market Shock (Flash Crash)',
      icon: <Activity className="w-4 h-4 text-rose-500" />,
      action: async () => {
        await addDoc(collection(db, 'tasks'), {
          title: 'CRITICAL: High MEV Flash Crash on DEX Alpha',
          category: 'Security',
          status: 'TO_DO',
          complexity: 'Critical',
          source: 'OMNI_PROMPT',
          createdAt: serverTimestamp()
        });
        toast.error("Market Shock Injected into Queue");
        audioEngine.playAlert();
      }
    },
    {
      id: 'purge-idle',
      title: 'Purge Idle Ephemeral Units',
      icon: <Cpu className="w-4 h-4 text-purple-400" />,
      action: async () => {
        try {
          const q = query(collection(db, 'agents'), where('status', '==', 'idle'), where('ephemeral', '==', true));
          const snap = await getDocs(q);
          let count = 0;
          for (const d of snap.docs) {
            await updateDoc(d.ref, { status: 'offline', currentTask: 'Terminated' });
            count++;
          }
          toast.success(`Purged ${count} idle ephemeral units.`);
          audioEngine.playClick();
        } catch (e) {
          toast.error("Purge failed.");
        }
      }
    },
    {
      id: 'toggle-audio',
      title: 'Toggle Auditory Telemetry',
      icon: <Terminal className="w-4 h-4 text-blue-400" />,
      action: () => {
        audioEngine.toggle();
        toast.message(audioEngine.enabled ? "Auditory Telemetry: ONLINE" : "Auditory Telemetry: OFFLINE");
      }
    }
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[20vh]">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden flex flex-col"
          >
            <div className="flex items-center px-6 py-4 border-b border-white/5">
              <Search className="w-5 h-5 text-zinc-500 mr-4" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Daemon Omni-Prompt... (Spawn agent, inject anomaly)"
                className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder:text-zinc-600"
              />
              <div className="font-mono text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest bg-white/5 text-zinc-500 hover:bg-white/10 ml-4 hidden sm:block">ESC to close</div>
            </div>
            <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {filteredCommands.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 font-mono text-sm italic">
                  No recognized protocol commands...
                </div>
              ) : (
                filteredCommands.map((cmd, index) => (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      setIsOpen(false);
                      setSearch('');
                    }}
                    onMouseEnter={() => audioEngine.playHover()}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 text-left transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-black/50 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-white/20 transition-all">
                      {cmd.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white group-hover:text-[#14F195] transition-colors">{cmd.title}</h4>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5">SYS_CMD: {cmd.id}</p>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <Terminal className="w-4 h-4 text-zinc-600" />
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="px-6 py-3 border-t border-white/5 bg-black/40 flex justify-between items-center">
              <div className="flex items-center gap-2 text-zinc-600">
                <Shield className="w-3.5 h-3.5" />
                <span className="text-[9px] font-mono uppercase tracking-widest">Sovereign Kernel Access</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14F195] animate-pulse" />
                <span className="text-[9px] font-mono text-[#14F195] uppercase tracking-widest">Connected</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
