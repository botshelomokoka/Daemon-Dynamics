import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Play, 
  Search, 
  MoreVertical, 
  Plus, 
  User, 
  Mail, 
  Terminal, 
  Zap, 
  ShieldCheck, 
  TrendingUp,
  ArrowRight,
  LayoutDashboard,
  X,
  Loader2,
  Brain,
  Layers,
  Component,
  Database,
  Cpu,
  Workflow,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from './firebase';
import { processTaskChaining } from './services/taskService';
import { handleFirestoreError, OperationType } from './lib/firestore-utils';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  setDoc,
  getDocs
} from 'firebase/firestore';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { ScrollArea } from './components/ui/scroll-area';

interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  assignedAgent: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'VERIFICATION' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: any;
  updatedAt: any;
  dependentTaskId?: string;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'working' | 'offline';
  mailbox: string[];
}

export function MissionControlView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM' as Task['priority'],
    assignedAgent: ''
  });

  // Fetch Tasks
  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tasks');
    });

    return () => unsubscribe();
  }, []);

  // Fetch Agents
  useEffect(() => {
    const q = query(collection(db, 'agents'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const agentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Agent[];
      setAgents(agentsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'agents');
    });

    return () => unsubscribe();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    try {
      await addDoc(collection(db, 'tasks'), {
        ...newTask,
        status: 'TO_DO',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setIsAddingTask(false);
      setNewTask({ title: '', description: '', category: '', priority: 'MEDIUM', assignedAgent: '' });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const taskDocRef = doc(db, 'tasks', taskId);
      await updateDoc(taskDocRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      if (newStatus === 'DONE') {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
           await processTaskChaining(task);
        }
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'MEDIUM': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const columns = [
    { id: 'TO_DO', title: 'INIT_QUEUE', icon: <Layers className="w-3.5 h-3.5 text-zinc-500" /> },
    { id: 'IN_PROGRESS', title: 'EXEC_BUFFER', icon: <Cpu className="w-3.5 h-3.5 text-[#14F195]" /> },
    { id: 'VERIFICATION', title: 'AUDIT_LOCK', icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> },
    { id: 'DONE', title: 'FINAL_STATE', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> },
  ];

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#14F195] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 lg:col-span-12 font-sans pb-20">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#14F195]/10 rounded-2xl border border-[#14F195]/20 shadow-[0_0_20px_rgba(20,241,149,0.1)]">
            <LayoutDashboard className="w-8 h-8 text-[#14F195]" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h2 className="text-3xl font-black tracking-tight uppercase italic leading-none text-white">Billboard_Protocol</h2>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#14F195]/10 border border-[#14F195]/20">
                 <div className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse shadow-[0_0_8px_#14f195]" />
                 <span className="text-[10px] font-black text-[#14F195] uppercase tracking-[0.2em] leading-none">LIVE_STREAM</span>
              </div>
            </div>
            <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest max-w-xl">
              Sovereign OS Autonomous Task Orchestration Engine. Global broadcast for across-mesh compute resources.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button 
            onClick={() => setIsAddingTask(true)}
            className="flex-1 md:flex-none h-14 px-8 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-zinc-200 active:scale-95 transition-all shadow-2xl"
          >
            <Plus className="w-4 h-4 mr-2" /> EMIT_DIRECTIVE
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col gap-5">
            <div className="flex items-center justify-between px-3 h-10 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2.5">
                <span className="opacity-80">{column.icon}</span>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 italic leading-none">{column.title}</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-black/40 text-zinc-500 border border-white/5 rounded-lg">
                {tasks.filter(t => t.status === column.id).length || 0}
              </span>
            </div>

            <ScrollArea className="h-[650px] bg-zinc-950/40 rounded-[2rem] border border-white/5 p-3 relative overflow-hidden group/column">
              <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />
              <div className="space-y-4 p-1 relative z-10">
                {tasks.filter(t => t.status === column.id).map((task) => (
                  <motion.div 
                    layoutId={task.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={task.id}
                    className="bg-black/60 border border-white/5 rounded-2xl p-5 hover:border-[#14F195]/30 transition-all cursor-pointer group shadow-2xl backdrop-blur-md relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/[0.02] blur-[30px] rounded-full -mr-10 -mt-10 group-hover:bg-[#14F195]/5 transition-colors" />
                    <div className="flex items-start justify-between mb-6">
                      <div className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </div>
                      <span className="text-[9px] font-mono font-bold text-zinc-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">REF_{task.id.slice(-6).toUpperCase()}</span>
                    </div>
                    
                    <h4 className="text-[14px] font-bold leading-snug mb-8 tracking-tight group-hover:text-white transition-colors uppercase italic whitespace-pre-wrap text-zinc-200">{task.title}</h4>
                    
                    <div className="flex items-center justify-between pt-5 border-t border-white/[0.05]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-[#14F195]/20 transition-all">
                          <Bot className="w-4 h-4 text-zinc-600 group-hover:text-[#14F195] transition-colors" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-none mb-1 italic">ASSIGNED_OPERATIVE</span>
                           <span className="text-[10px] font-bold text-zinc-400 font-mono tracking-tighter uppercase truncate max-w-[100px] leading-none group-hover:text-[#14F195] transition-colors font-black">{task.assignedAgent || 'PROTOCOL_AUTO'}</span>
                        </div>
                      </div>
                      
                      {column.id !== 'DONE' && (
                        <Button 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextStatus = column.id === 'TO_DO' ? 'IN_PROGRESS' : column.id === 'IN_PROGRESS' ? 'VERIFICATION' : 'DONE';
                            updateTaskStatus(task.id, nextStatus as Task['status']);
                          }}
                          className="w-10 h-10 bg-white/5 hover:bg-[#14F195]/20 border border-white/5 hover:border-[#14F195]/30 text-zinc-500 hover:text-[#14F195] rounded-xl transition-all active:scale-90"
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
                {tasks.filter(t => t.status === column.id).length === 0 && (
                  <div className="h-40 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[2rem] opacity-20">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 italic mt-2">IDLE_BUFFER_SYNC</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-12">
        <section className="lg:col-span-8 bg-zinc-950/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl group">
          <div className="flex items-center justify-between px-8 h-16 border-b border-white/5 bg-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-3 italic">
              <Bot className="w-4 h-4 text-[#14F195]" /> OPERATIVE_NODE_NETWORK
            </h3>
            <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest">Active_Mesh_Latency: ~12.4ms</span>
          </div>
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {agents.map((agent) => (
              <motion.div 
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(20,241,149,0.2)' }}
                key={agent.id} 
                className="bg-black/60 border border-white/5 rounded-3xl p-6 flex items-center justify-between group/node transition-all shadow-xl"
              >
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full absolute -top-1 -right-1 ring-4 ring-black ${agent.status === 'idle' ? 'bg-zinc-800' : 'bg-[#14F195] shadow-[0_0_10px_#14f195]'}`}></div>
                    <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center group-hover/node:bg-black transition-all">
                      <Cpu className="w-6 h-6 text-zinc-600 group-hover/node:text-[#14F195] transition-colors" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-tight text-white group-hover/node:text-[#14F195] transition-colors leading-none mb-2">{agent.name}</h4>
                    <p className="text-[9px] text-zinc-600 font-mono font-bold italic tracking-widest uppercase whitespace-nowrap">NODE_TYPE_{agent.type?.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {agent.mailbox?.length > 0 && (
                    <div className="bg-[#14F195]/10 text-[#14F195] text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border border-[#14F195]/20 animate-pulse">
                      {agent.mailbox.length}_DIRECTIVES
                    </div>
                  )}
                  <Button variant="ghost" size="icon" className="h-10 w-10 bg-white/5 text-zinc-600 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-4 bg-zinc-950/40 border border-[#14F195]/10 rounded-[2.5rem] backdrop-blur-xl p-0 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#14F195]/5 blur-[60px] rounded-full -mr-20 -mt-20 group-hover:bg-[#14F195]/10 transition-colors" />
          <div className="flex items-center justify-between px-8 h-16 border-b border-[#14F195]/10 bg-[#14F195]/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#14F195] flex items-center gap-3 italic">
              <Terminal className="w-4 h-4" /> SYSTEM_CONSOLE_STREAM
            </h3>
          </div>
          <div className="p-8 space-y-8 flex-1 flex flex-col font-mono">
            <div className="flex-1 p-6 bg-black/80 border border-white/5 rounded-3xl text-[10px] text-zinc-600 overflow-hidden shadow-[inset_0_2px_20px_rgba(0,0,0,0.8)] font-mono relative group-hover:border-[#14F195]/20 transition-all">
               <div className="absolute top-0 right-0 w-[1px] h-full bg-[#14F195]/10" />
               <p className="text-[#14F195] font-black mb-5 text-[11px] animate-pulse flex items-center gap-2 tracking-widest tracking-tighter">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14F195] animate-pulse" />
                  HIVE_CORE_SEQUENCE_READY
               </p>
               <div className="space-y-2.5 overflow-y-auto h-[180px] scrollbar-none custom-scrollbar pb-4 pr-2">
                 {tasks.slice(0, 10).map(task => (
                   <p key={task.id} className="truncate whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity">
                     <span className="text-zinc-800 font-bold">[{new Date().toLocaleTimeString('en-GB')}]</span> 
                     <span className="text-blue-500/60 px-2 font-black">{task.assignedAgent || 'GLOBAL'}</span>
                     <span className={`${task.status === 'DONE' ? 'text-emerald-500' : 'text-[#14F195]'} font-bold`}> {task.status} </span> 
                     <span className="text-zinc-800 italic ml-2">...TX_ID_{task.id.slice(-4).toUpperCase()}</span>
                   </p>
                 ))}
               </div>
               <p className="text-zinc-800 mt-6 italic font-bold tracking-widest text-[9px] border-t border-white/5 pt-4">// THREAD_SYNC: HIVE_MEMORY_CLUSTER_01A</p>
            </div>
            
            <div className="space-y-4 pt-4">
              {[
                { label: "CONNECTED_OPERATIVES", val: `${agents.filter(a => a.status !== 'offline').length}/${agents.length}_NODES` },
                { label: "PROTOCOL_THROUGHPUT", val: `${tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'DONE').length / tasks.length) * 100) : 0}%_FINAL`, color: "text-[#14F195]" },
                { label: "MESH_CONSENSUS_DELAY", val: "12.4ms_SYNC", color: "text-blue-500" }
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] leading-none py-3 border-b border-white/[0.03] group/stat">
                  <span className="text-zinc-600 italic group-hover/stat:text-zinc-400 transition-colors">{stat.label}</span>
                  <span className={stat.color || "text-zinc-300"}>{stat.val}</span>
                </div>
              ))}
            </div>
            
            <Button className="w-full h-16 bg-white/5 border border-white/10 hover:bg-white text-zinc-500 hover:text-black text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl mt-auto transition-all shadow-2xl active:scale-95">
              BROADCAST_HIVE_HEARTBEAT
            </Button>
          </div>
        </section>
      </div>

      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogContent className="bg-black border-zinc-800 text-white rounded-3xl p-8 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tighter">EMIT_NEW_DIRECTIVE</DialogTitle>
            <CardDescription className="text-zinc-500">
              Input system requirements. The Hive Mind will automatically allocate compute resources.
            </CardDescription>
          </DialogHeader>

          <form onSubmit={handleAddTask} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Directive Title</Label>
              <Input 
                required
                value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
                className="h-12 bg-zinc-900 border-zinc-800 rounded-xl focus:border-[#14F195] transition-colors"
                placeholder="e.g. LIQUIDITY_INJECTION_HERMETIC_POOL_V3"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Category</Label>
              <Input 
                required
                value={newTask.category}
                onChange={e => setNewTask({...newTask, category: e.target.value})}
                className="h-12 bg-zinc-900 border-zinc-800 rounded-xl focus:border-[#14F195] transition-colors"
                placeholder="e.g. DEFI, SECURITY, INFRA"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Priority Level</Label>
                <select 
                  value={newTask.priority}
                  onChange={e => setNewTask({...newTask, priority: e.target.value as Task['priority']})}
                  className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-sm outline-none focus:border-[#14F195]"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Specific Operative</Label>
                <select 
                  value={newTask.assignedAgent}
                  onChange={e => setNewTask({...newTask, assignedAgent: e.target.value})}
                  className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-sm outline-none focus:border-[#14F195]"
                >
                  <option value="">AUTO_ALLOCATE</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.name}>{agent.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button 
              type="submit"
              className="w-full h-14 bg-[#14F195] text-black font-black uppercase tracking-widest rounded-xl hover:bg-[#14F195]/90 transition-all text-sm mt-4"
            >
              Post to Billboard
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
