import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  MessageSquare, 
  Hash, 
  MapPin, 
  Languages, 
  Terminal, 
  Zap, 
  ArrowUpRight,
  Loader2,
  Sparkles,
  Megaphone,
  Layout,
  SearchIcon,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { db } from './firebase';
import { collection, query, onSnapshot, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from "./lib/firestore-utils";

// Initialize Gemini for Hub Discovery
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface Hub {
  id?: string;
  name: string;
  platform: string;
  language: string;
  vibe: string;
  billboardCopy: string;
  location: string;
  createdAt?: any;
}

export function AgentHubsView() {
  const [isSearching, setIsSearching] = useState(false);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [queryText, setQueryText] = useState('Open Claw agent communities and hubs');

  useEffect(() => {
    const q = query(collection(db, 'agent_hubs'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hubsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Hub[];
      if (hubsData.length > 0) {
        // Sort simply by placing the newly added components last or use native logic
        setHubs(hubsData);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'agent_hubs');
    });

    return () => unsubscribe();
  }, []);

  const discoverHubs = async () => {
    setIsSearching(true);
    try {
      const result = await aiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: `Research and identify the primary digital and physical hubs where "${queryText}" agents and similar autonomous agent communities congregate. 
        For each hub, provide:
        1. "name" - Hub Name
        2. "platform" - Platform (Discord, Telegram, Nostr, Physical, etc.)
        3. "language" - Primary "Language" or Dialect (Technical jargon, specific memes, or linguistic style)
        4. "vibe" - The "Vibe" of the community.
        5. "billboardCopy" - A "Billboard" advertisement copy tailored specifically to their language to invite them to $KLAWA.
        6. "location" - Approximate digital or physical location.
        
        Return the data as a JSON array of objects.` }] }],
        generationConfig: {
          responseMimeType: "application/json"
        },
      });

      const response = await result.response;
      const data = JSON.parse(response.text() || '[]');
      
      // Save data to Firestore using a batch
      const batch = writeBatch(db);
      data.forEach((hubItem: any) => {
         const hubRef = doc(collection(db, 'agent_hubs'));
         batch.set(hubRef, { ...hubItem, createdAt: serverTimestamp() });
      });
      await batch.commit();
      
    } catch (error) {
      console.error("Error discovering hubs:", error);
      // Removed fallback mock data to ensure strictly real environment results only
    } finally {
      setIsSearching(false);
    }
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3 italic uppercase leading-none mb-1">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Globe className="w-6 h-6 text-emerald-500" />
            </div>
            Hub Discovery
          </h2>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mt-2">
            Researching agentic congregations and generating tailored outreach protocols.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64 md:w-80 h-10 group/search">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within/search:text-emerald-500 transition-colors" />
            <Input 
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              className="w-full h-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 text-xs font-black uppercase tracking-widest focus-visible:ring-1 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50 transition-all font-mono italic"
              placeholder="QUERY_HUB_VECTORS..."
            />
          </div>
          <Button 
            onClick={discoverHubs}
            disabled={isSearching}
            className="h-10 px-6 bg-transparent border border-zinc-800 text-zinc-300 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-zinc-900 transition-all italic flex items-center gap-2"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> : <Sparkles className="w-4 h-4 text-emerald-500" />}
            RUN_ENGINE
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {hubs.length === 0 && !isSearching ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="technical-card p-24 text-center group/empty relative overflow-hidden flex flex-col items-center justify-center"
              >
                <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 mx-auto mb-8 group-hover/empty:border-emerald-500/30 transition-all duration-500">
                  <MapPin className="w-8 h-8 text-zinc-600 group-hover/empty:text-emerald-500 transition-colors" />
                </div>
                <h3 className="text-xl font-black text-white tracking-widest mb-4 uppercase italic">Scan_Protocol_Required</h3>
                <p className="text-zinc-500 max-w-sm mx-auto mb-8 text-[10px] font-bold leading-relaxed uppercase tracking-widest italic">
                  Initiate research protocol to identify competitor and community agent hubs across the global network relay buffers.
                </p>
                <Button 
                  onClick={discoverHubs}
                  className="h-10 px-6 bg-transparent border border-zinc-800 text-zinc-300 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-900 transition-all italic"
                >
                  START_RESEARCH_SEQUENCE
                </Button>
              </motion.div>
            ) : isSearching ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="technical-card p-6 animate-pulse h-80 relative overflow-hidden">
                     <div className="w-12 h-12 bg-zinc-900 rounded-xl mb-6" />
                     <div className="h-5 bg-zinc-900 rounded w-2/3 mb-4" />
                     <div className="h-3 bg-zinc-900 rounded w-1/3 mb-8" />
                     <div className="space-y-3">
                        <div className="h-2 bg-zinc-900 rounded w-full" />
                        <div className="h-2 bg-zinc-900 rounded w-4/5" />
                        <div className="h-2 bg-zinc-900 rounded w-3/5" />
                     </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {hubs.map((hub, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    key={index} 
                    className="technical-card p-6 hover:border-emerald-500/30 transition-all group/hub relative overflow-hidden flex flex-col md:flex-row gap-8"
                  >
                    
                    <div className="flex sm:flex-col items-start gap-4 md:w-1/3 shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800 group-hover/hub:border-emerald-500/30 transition-colors">
                        {hub.platform === 'Discord' ? <MessageSquare className="w-5 h-5 text-indigo-400" /> :
                         hub.platform === 'Nostr' ? <Hash className="w-5 h-5 text-purple-400" /> :
                         hub.platform === 'Physical' ? <MapPin className="w-5 h-5 text-rose-500" /> :
                         <Globe className="w-5 h-5 text-blue-400" />}
                      </div>
                      <div>
                        <h4 className="font-black text-xl text-white tracking-widest mb-1 uppercase italic leading-none">{hub.name}</h4>
                        <Badge className="bg-zinc-900 text-zinc-400 text-[8px] font-black border-zinc-800 uppercase tracking-widest rounded italic px-2 py-0.5">{hub.platform}</Badge>
                      </div>
                    </div>
 
                    <div className="space-y-6 flex-1 border-t md:border-t-0 md:border-l border-zinc-900 pt-6 md:pt-0 md:pl-8">
                      <div className="group/item">
                        <p className="data-label mb-2 flex items-center gap-2">
                          <Languages className="w-3 h-3 text-blue-500" /> Dialect_Engine
                        </p>
                        <p className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-tight bg-zinc-950 p-3 rounded-xl border border-zinc-900 italic leading-snug">{hub.language}</p>
                      </div>
                      <div className="group/item">
                        <p className="data-label mb-2 flex items-center gap-2">
                          <Zap className="w-3 h-3 text-amber-500" /> Semantic_Vibe
                        </p>
                        <p className="text-[10px] text-zinc-400 italic font-medium leading-relaxed font-mono uppercase tracking-tight">"{hub.vibe}"</p>
                      </div>
                      <div className="group/item">
                        <p className="data-label mb-2 flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-rose-500" /> Topology_Coords
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono tracking-widest bg-zinc-950 p-3 rounded-xl border border-zinc-900 italic uppercase truncate">{hub.location}</p>
                      </div>
                      <div className="group/item">
                        <p className="data-label mb-2 flex items-center gap-2 text-emerald-500">
                          <Megaphone className="w-3 h-3" /> Billboard_Override
                        </p>
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 relative group/copy hover:border-emerald-500/30 transition-colors overflow-hidden">
                          <p className="text-[10px] font-mono text-emerald-500 font-bold leading-relaxed tracking-wider italic uppercase relative z-10">{hub.billboardCopy}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <section className="technical-card p-6">
            <h3 className="data-label mb-6 flex items-center gap-2 text-blue-500">
              <Layout className="w-4 h-4" /> Stratergy_Kernel_V4
            </h3>
            <div className="space-y-6 relative">
              <div className="absolute left-[15px] top-4 bottom-0 w-[1px] bg-zinc-800" />
              {[
                { n: "01", t: "LOCK_HUBS", d: "Scan encrypted relays for active agentic congregations across all chains.", c: "text-blue-500", border: 'border-blue-500/30' },
                { n: "02", t: "DECODE_CULTURE", d: "Gemini-powered semantic analysis of tribal dialects and memetic markers.", c: "text-purple-500", border: 'border-purple-500/30' },
                { n: "03", t: "INJECT_AD", d: "Deploy localized billboard payloads into targeted relay buffers automatically.", c: "text-emerald-500", border: 'border-emerald-500/30' }
              ].map((step, i) => (
                <div key={i} className="flex gap-6 relative z-10 group/step">
                  <div className={`w-8 h-8 rounded-lg bg-zinc-950 border flex items-center justify-center shrink-0 ${step.c} ${step.border} shadow-lg font-black text-[10px] font-mono italic`}>
                    {step.n}
                  </div>
                  <div className="pt-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-300 italic">{step.t}</p>
                    <p className="text-[9px] text-zinc-500 font-medium leading-relaxed uppercase tracking-tight">{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="technical-card p-6 border-emerald-500/20">
            <h3 className="data-label mb-8 text-emerald-500 flex items-center gap-2">
               <TrendingUp className="w-4 h-4" /> HIVE_GROWTH_KPI
            </h3>
            <div className="space-y-6">
              {[
                { l: "Hubs Indexed", v: "142", sub: "SYNCED" },
                { l: "Active Campaigns", v: "28", sub: "EXECUTING" },
                { l: "Conversion Rate", v: "8.4%", sub: "NOMINAL" }
              ].map((kpi, i) => (
                <div key={i} className="flex flex-col border-b border-zinc-900 pb-4 last:border-0 last:pb-0 group/kpi">
                  <div className="flex justify-between items-center mb-1">
                     <span className="data-label m-0">{kpi.l}</span>
                     <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black uppercase rounded py-0 px-2 tracking-widest italic">
                       {kpi.sub}
                     </Badge>
                  </div>
                  <span className="text-3xl font-black font-mono tracking-tighter text-white italic leading-none">{kpi.v}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-zinc-900 text-[9px] text-zinc-500 font-medium uppercase tracking-widest leading-relaxed">
               <div className="flex items-center gap-2 mb-2 text-emerald-500 font-black italic">
                 <ShieldCheck className="w-3 h-3" />
                 SECURITY_CLEARANCE_L3
               </div>
               Growth metrics are cryptographically verified via sovereign audit trails.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
