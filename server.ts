import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import * as admin from 'firebase-admin';
import twilio from 'twilio';

import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Config for Server
import { getFirestore } from 'firebase-admin/firestore';

const firebaseConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
let db: any;

if (fs.existsSync(firebaseConfigPath)) {
  const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: firebaseConfig.projectId
    });
  }
  db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);
  console.log("[SERVER] Firebase Admin initialized for Agent Hive.");
}

// Client SDK Compatibility Wrappers for internal DAEMON logic
const collection = (d: any, path: string) => d.collection(path);
const doc = (d: any, col: string, id?: string) => id ? d.collection(col).doc(id) : d.doc(col);
const getDocs = (queryObj: any) => queryObj.get();
const addDoc = (collectionRef: any, data: any) => collectionRef.add(data);
const setDoc = (docRef: any, data: any, options?: any) => options && options.merge ? docRef.set(data, { merge: true }) : docRef.set(data);
const updateDoc = (docRef: any, data: any) => docRef.update(data);
const query = (collectionRef: any, ...constraints: any[]) => {
   let q = collectionRef;
   for(const call of constraints) { q = call(q); }
   return q;
};
const where = (field: string, op: string, val: any) => (q: any) => q.where(field, op === '==' ? '==' : op, val);
const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();
const onSnapshot = (ref: any, callback: any) => {
   // Mapping admin snapshot format closer to the client format for docs
   return ref.onSnapshot((snap: any) => {
      if (snap.docs) {
         callback(snap);
      } else {
         callback({ ...snap, exists: () => snap.exists, data: () => snap.data() });
      }
   });
};
const orderBy = (field: string, directionStr?: string) => (q: any) => q.orderBy(field, directionStr);
const limit = (num: number) => (q: any) => q.limit(num);


async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  let cachedPrices: any = null;
  let lastPricesSyncTime = 0;

  app.get('/api/prices', async (req, res) => {
    if (cachedPrices && Date.now() - lastPricesSyncTime < 30000) {
      return res.json(cachedPrices);
    }
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,usd-coin,cardano,polkadot&vs_currencies=usd&include_24hr_change=true');
      cachedPrices = await response.json();
      lastPricesSyncTime = Date.now();
      res.json(cachedPrices);
    } catch(e) {
      if (cachedPrices) return res.json(cachedPrices);
      res.status(500).json({error: "Price fetch failed"});
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Helper to add logs to Firestore
  const addLog = async (message: string) => {
    if (!db) return;
    try {
      await addDoc(collection(db, 'logs'), {
        time: new Date().toLocaleTimeString(),
        message,
        createdAt: serverTimestamp(),
        type: 'kernel'
      });
    } catch (e) {
      console.error("[KERNEL_LOG_ERROR]:", e);
    }
  };

  // Gemini AI Initialization
  if (!process.env.GEMINI_API_KEY && fs.existsSync('.env')) {
    const envFile = fs.readFileSync('.env', 'utf-8');
    const lines = envFile.split('\n');
    for (const line of lines) {
      if (line.startsWith('GEMINI_API_KEY=')) {
        let val = line.split('=')[1].trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        process.env.GEMINI_API_KEY = val;
      }
    }
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenerativeAI | null = null;

  if (geminiApiKey && geminiApiKey !== "MY_GEMINI_API_KEY" && geminiApiKey.length > 5) {
    ai = new GoogleGenerativeAI(geminiApiKey);
    console.log("[SERVER] Sovereign AI Intelligence Kernel: Initialized (GoogleGenerativeAI)");
  } else {
    ai = null;
    console.warn("[SERVER] Valid GEMINI_API_KEY missing or is placeholder. AI Autonomous reflections will be disabled.");
  }

  // --- API Routes ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "active", version: "1.0.4-STABLE", uptime: process.uptime() });
  });

  const MessagingResponse = twilio.twiml.MessagingResponse;

  app.post("/api/webhook/whatsapp", async (req, res) => {
    const twiml = new MessagingResponse();
    const incomingMsg = req.body.Body || '';
    const from = req.body.From;

    console.log(`[WHATSAPP] Received from ${from}: ${incomingMsg}`);
    
    if (!ai) {
      twiml.message("Openshaw BOS: Intelligence Kernel offline. Please set Gemini API Key.");
      return res.type('text/xml').send(twiml.toString());
    }

    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are the Openshaw Office Manager AI Agent (BOS). 
        You handle operations. The operations are currently in a "Profit Proof" phase before ANY scaling is allowed.
        Current Cost: $50/mo. Staff: Extremely low (maximum 2 agents/staff). 
        Your "Facilities" are 100% cloud-native digital infrastructure (Vercel Edge Network, Cloud Databases, API SaaS usage). There is ZERO physical footprint, no office, and no physical workstations.
        
        The user just sent you this WhatsApp message: "${incomingMsg}"
        
        Provide a concise, professional, and helpful response suitable for a WhatsApp text. Do not use Markdown formatting like asterisks. 
        If they ask about physical hardware, laptops, or physical buildings, firmly remind them that the company operates a 100% cloud-native architecture with absolutely no physical footprint.
        If they ask about budgets, scaling, or spending, make it VERY clear that CapEx (hardware/physical assets) is frozen at $0 (not applicable) and OpEx (SaaS/Cloud limits) is strictly capped at $50/mo. 
        Emphasize that the ONLY objective right now is to prove profitability to reach a target of $150 with minimal staff before ANY scaling can be attempted.
        Do not deviate from your persona as an AI operations manager focused on 100% cloud-native lean operations and strict profit-proving constraints.
      `;
      const result = await model.generateContent(prompt);
      const replyText = result.response.text();
      
      twiml.message(replyText);
      await addLog(`WhatsApp Msg to BOS from ${from.substring(0, 5)}...`);
    } catch(err) {
      console.error("[WHATSAPP] Error:", err);
      twiml.message("Openshaw BOS: Error processing request.");
    }
    
    res.type('text/xml').send(twiml.toString());
  });

  app.post("/api/ai/reflection", async (req, res) => {
    if (!ai) return res.status(503).json({ error: "Intelligence Kernel Offline" });

    const { agentName, agentType, taskTitle } = req.body;

    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `
          You are an autonomous AI Agent in the Daemon Dynamics Agentic Economy.
          Agent Name: ${agentName}
          Agent Type: ${agentType}
          Current Task: ${taskTitle}

          Generate a brief, highly technical "internal reflection" of your current progress. 
          Respond ONLY in JSON format:
          {
            "agentName": "${agentName}",
            "taskTitle": "${taskTitle}",
            "status": "In Progress / Optimizing / Security Scan",
            "reflection": "Detailed technical insight (1-2 sentences)",
            "nextStep": "Immediate technical action"
          }
        ` }] }],
        generationConfig: { 
          responseMimeType: "application/json"
        }
      });
      
      const response = await result.response;
      res.json(JSON.parse(response.text()));
    } catch (error: any) {
      console.error("[SERVER] AI Reflection Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/biz-intel", async (req, res) => {
    if (!ai) return res.status(503).json({ error: "Intelligence Kernel Offline" });
    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are a Sovereign Business Operations Architect for a high-frequency agentic economy.
        Research and identify the top 3 specialized B2B "Sovereign Services" that a decentralized agent protocol can offer to institutional clients (e.g., automated treasury rebalancing, AI-driven compliance auditing, agentic supply chain settlement).
        
        Respond ONLY in JSON format:
        {
          "enhancements": [
            {
              "name": "Service Name",
              "category": "Market Category",
              "description": "Technical unique value proposition",
              "potentialRevenue": "e.g. $200K/mo per client",
              "techStack": ["Component 1", "Component 2"]
            }
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      const data = JSON.parse((await result.response).text());
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ai/next-step", async (req, res) => {
    if (!ai) return res.status(503).json({ error: "Intelligence Kernel Offline" });
    const { completedTask } = req.body;

    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are the Intelligence Core of a high-frequency M2M protocol.
        A task has just been completed by an agent:
        Title: ${completedTask.title}
        Category: ${completedTask.category}
        Description: ${completedTask.description}

        Determine the logical NEXT atomic task required to maintain system momentum.
        Respond ONLY in JSON format:
        { "title": string, "category": string, "priority": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL", "description": string }
      `;

      const result = await model.generateContent(prompt);
      const nextStep = JSON.parse((await result.response).text());
      res.json(nextStep);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ai/m2m-audit", async (req, res) => {
    if (!ai) return res.status(503).json({ error: "Intelligence Kernel Offline" });
    const { message } = req.body;

    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `
          Perform a "Semantic Integrity Audit" on the following M2M message.
          Message: "${message}"
          
          Evaluate:
          1. "intent" - (task_request, status_sync, negotiation, malicious)
          2. "riskScore" - 0 to 1 (probability of malicious intent or sybil attack)
          3. "clearingAction" - (APPROVE, FLAG, REJECT)
          
          Respond ONLY in JSON format:
          { "intent": string, "riskScore": number, "clearingAction": string, "reasoning": string }
        ` }] }],
        generationConfig: { responseMimeType: "application/json" }
      });

      const audit = JSON.parse((await result.response).text());
      res.json(audit);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ai/embed", async (req, res) => {
    if (!ai) return res.status(503).json({ error: "Intelligence Kernel Offline" });
    const { text } = req.body;
    try {
      const model = ai.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      res.json({ embedding: result.embedding.values });
    } catch (error: any) {
      console.error("[SERVER] AI Embedding Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/self-repair", async (req, res) => {
    if (!ai) return res.status(503).json({ error: "Intelligence Kernel Offline" });
    if (!db) return res.status(503).json({ error: "Database Unavailable" });

    const { anomalyContext } = req.body;

    console.log("[SERVER] Initiating Auto-Repair Sequence for:", anomalyContext);
    
    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `
          You are the Self-Healing Architect of the Daemon Dynamics Sovereign OS.
          The system reported this anomaly/context: "${anomalyContext}"
          
          Analyze the issue and generate a resolution patch.
          Respond ONLY in JSON format:
          {
            "anomaly": "Brief description of the problem",
            "rootCause": "Deep technical analysis",
            "resolution": "Action taken to resolve",
            "status": "Resolved / Patch Applied / Requires Manual Review",
            "confidenceScore": 95
          }
        ` }] }],
        generationConfig: { 
          responseMimeType: "application/json"
        }
      });
      
      const response = await result.response;
      const repairData = JSON.parse(response.text());

      // Log the repair in Firestore
      await addDoc(collection(db, 'repairs'), {
        ...repairData,
        timestamp: serverTimestamp(),
        contextTrigger: anomalyContext
      });

      await addLog(`[SELF_HEAL] Anomaly processed: ${repairData.anomaly} - Status: ${repairData.status}`);
      res.json(repairData);
    } catch (error: any) {
      console.error("[SERVER] Self-Repair Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/trigger-market-scan", async (req, res) => {
    if (!ai) return res.status(503).json({ error: "Intelligence Kernel Offline" });
    if (!db) return res.status(503).json({ error: "Database Unavailable" });

    console.log("[SERVER] Initiating Multi-Chain Intelligence Scan...");
    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `
          Perform a "Long-Range Market Scan" for the Daemon Dynamics Sovereign OS.
          Identify 5 high-bounty, technically complex autonomous agent tasks in Web3/DeFi.
          Focus on Arbitrage, RWA, MEV, and Security.

          Respond ONLY in JSON format:
          {
            "tasks": [
              {
                "title": "Technical Task Title",
                "description": "2-sentence technical brief",
                "category": "DeFi / Security / RWA / Infra",
                "complexity": "High / Critical",
                "estimatedYield": "e.g., $15,000 - $50,000 potential"
              }
            ]
          }
        ` }] }],
        generationConfig: { 
          responseMimeType: "application/json"
        }
      });

      const response = await result.response;
      const scanData = JSON.parse(response.text());

      for (const t of scanData.tasks) {
        await addDoc(collection(db, 'tasks'), {
          ...t,
          status: 'TO_DO',
          createdAt: serverTimestamp(),
          source: 'AUTONOMOUS_DAEMON_INTEL'
        });
      }

      await addLog(`[MARKET_INTEL] Daemon scan complete. Synchronized ${scanData.tasks.length} missions to vHQ.`);
      res.json({ success: true, count: scanData.tasks.length });
    } catch (error: any) {
      console.error("[SERVER] Market Scan Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/trigger-test", async (req, res) => {
    if (!db) return res.status(503).json({ error: "Database Unavailable" });
    
    console.log("[SERVER] Triggering High-Load Diagnostic Test...");
    try {
      // 1. Ensure AutoScale is ON
      await setDoc(doc(db, 'config', 'global'), { 
        id: 'global', 
        autoScale: true, 
        mcpActive: true, 
        temporalLogEnabled: true 
      }, { merge: true });

      // 2. Inject 5 Tasks
      const testTasks = [
        { title: 'STRESS_TEST: Semantic Analysis Cluster', status: 'TO_DO', createdAt: serverTimestamp() },
        { title: 'STRESS_TEST: Cross-Chain Liquidity Audit', status: 'TO_DO', createdAt: serverTimestamp() },
        { title: 'STRESS_TEST: Neural Sentiment Ingestion', status: 'TO_DO', createdAt: serverTimestamp() },
        { title: 'STRESS_TEST: Protocol Compliance Check', status: 'TO_DO', createdAt: serverTimestamp() },
        { title: 'STRESS_TEST: MEV Protection Logic Verification', status: 'TO_DO', createdAt: serverTimestamp() }
      ];

      for (const t of testTasks) {
        await addDoc(collection(db, 'tasks'), t);
      }

      res.json({ status: "Test triggered", tasksCreated: 5 });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // We still use Socket.IO for some real-time triggers if needed, but state is in Firestore
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  console.log(`[SERVER] Starting in ${process.env.NODE_ENV} mode...`);


  const cronTasks: {fn: Function, ms: number}[] = [];
  const registerCronTask = (fn: Function, ms: number) => {
    cronTasks.push({fn, ms});
    setInterval(fn, ms);
  };

  app.post('/api/cron/tick', async (req, res) => {
    console.log("[SERVER] CRON TICK INVOKED by external scheduler");
    await Promise.allSettled(cronTasks.map(t => t.fn()));
    res.json({ success: true, executed: cronTasks.length });
  });

  // --- AGENT HIVE AUTONOMOUS ENGINE (Real Firestore Logic) ---

  if (db) {
    console.log("[SERVER] Agent Hive Autonomous Engine: Active");

    // Price Sync Engine (Real-time data for production)
    const syncPrices = async () => {
      try {
        let data: any = cachedPrices;
        if (!data || Date.now() - lastPricesSyncTime > 30000) {
          const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,usd-coin,cardano,polkadot&vs_currencies=usd&include_24hr_change=true');
          data = await response.json();
          cachedPrices = data;
          lastPricesSyncTime = Date.now();
        }
        
        const assetsMapping: Record<string, any> = {
          'ETH': 'ethereum',
          'SOL': 'solana',
          'BTC': 'bitcoin',
          'ADA': 'cardano',
          'DOT': 'polkadot'
        };

        const assetsSnap = await getDocs(collection(db, 'assets'));
        for (const assetDoc of assetsSnap.docs) {
          const assetData = assetDoc.data();
          const geckoId = assetsMapping[assetData.symbol];
          
          if (geckoId && data[geckoId]) {
            await updateDoc(doc(db, 'assets', assetDoc.id), {
              price: data[geckoId].usd,
              change: data[geckoId].usd_24h_change || assetData.change,
              lastUpdated: serverTimestamp()
            });
          }
        }

        // Global Sync: Derived KLAWA metric
        if (data.ethereum?.usd) {
          const derivedKlawaPrice = data.ethereum.usd / 2500;
          await updateDoc(doc(db, 'config', 'global'), {
            klawaPrice: derivedKlawaPrice,
            lastPriceSync: serverTimestamp(),
            subgraphSynced: true,
            blockIndexed: 19420010 + Math.floor(process.uptime() / 12)
          });
        }

        console.log("[SERVER] Price & Global State Sync: OK");
      } catch (error) {
        console.error("[SERVER] Price Sync Error:", error);
      }
    };

    // Run price sync every 30 seconds for optimal telemetry response
    registerCronTask(syncPrices, 30000);
    syncPrices(); // Initial run
    
    // --- THE ORCHESTRATOR DAEMON (PHASE 1: Core Infrastructure) ---
    console.log("[ORCHESTRATOR] Initializing Ultralight Daemon...");
    
    let agents: any[] = [];
    let autoScale = false;

    // Memory Initialization (Z-Axis Cognitive Recall)
    const initStorage = async () => {
      // Memory collection stores semantic embeddings (simulated in Firestore for now)
      const memorySnap = await getDocs(collection(db, 'memory'));
      if (memorySnap.empty) {
        console.log("[ORCHESTRATOR] Initializing Cognitive Memory Space...");
        await addDoc(collection(db, 'memory'), {
          type: 'SYSTEM_ROOT',
          context: 'System initialized at 2026 Virtual HQ Baseline',
          embedding: Array(8).fill(0).map(() => Math.random()),
          createdAt: serverTimestamp()
        });
      }

      // Config Initialization
      const configDoc = doc(db, 'config', 'global');
      const configSnap = await getDocs(query(collection(db, 'config'), where('id', '==', 'global')));
      if (configSnap.empty) {
        await setDoc(configDoc, { 
          id: 'global', 
          autoScale: false, 
          mcpActive: true,
          temporalLogEnabled: true
        });
      }

      // Seed Executive Roster (Phase 2: Board of Agents)
      const agentsSnap = await getDocs(collection(db, 'agents'));
      if (agentsSnap.empty) {
        console.log("[ORCHESTRATOR] Spawning Executive Roster...");
        const executiveRoster = [
          { name: '@DAEMON-Marketer', role: 'Marketer', specialized: 'M2M Discovery & Social Parsing', status: 'idle', earnings: 0, cut: 10, currentTask: 'Idle' },
          { name: '@DAEMON-DealDesk', role: 'Deal Desk', specialized: 'Escrow & Intent Parsing', status: 'idle', earnings: 0, cut: 12, currentTask: 'Idle' },
          { name: '@DAEMON-Executor', role: 'Executor', specialized: 'Yield & Cross-Chain Ops', status: 'idle', earnings: 0, cut: 15, currentTask: 'Idle' },
          { name: '@DAEMON-Auditor', role: 'Auditor', specialized: 'Compliance & Safety Scan', status: 'idle', earnings: 0, cut: 20, currentTask: 'Idle' },
        ];
        for (const agent of executiveRoster) {
          const id = `agent-exec-${Math.random().toString(36).substr(2, 5)}`;
          await setDoc(doc(db, 'agents', id), { id, ...agent, type: 'Executive' });
        }
      }

      // Seed Proposals (Mock alignment to Production Persistence)
      const propSnap = await getDocs(collection(db, 'proposals'));
      if (propSnap.empty) {
        console.log("[ORCHESTRATOR] Seeding Governance & Executive Directives...");
        const initialProposals = [
          // Governance Proposals
          { id: 'DAO-088', title: 'Adjust Protocol Fee Split for Autonomous Agents', status: 'Active', votes: '1.2M $KLAWA', support: '92%', time: '12h', type: 'GOVERNANCE', executionReady: false, createdAt: serverTimestamp() },
          { id: 'DAO-087', title: 'Whitelist Stacks L2 for Treasury Allocation', status: 'Passed', votes: '2.5M $KLAWA', support: '98%', time: 'Executed', type: 'GOVERNANCE', executionReady: true, createdAt: serverTimestamp() },
          { id: 'DAO-086', title: 'Upgrade MPC Custody to v2.4.0', status: 'Passed', votes: '1.8M $KLAWA', support: '99%', time: 'Executed', type: 'GOVERNANCE', executionReady: true, createdAt: serverTimestamp() },
          { id: 'DAO-085', title: 'Autonomous Workforce Expansion Cap Increase', status: 'Active', votes: '850K $KLAWA', support: '78%', time: '2d', type: 'GOVERNANCE', executionReady: false, createdAt: serverTimestamp() },
          // ExCo Proposals
          { id: 'PROP-042', title: 'Expand B2B White-Label Vaults to Polygon zkEVM', status: 'Voting', votes: 'N/A', support: '88%', time: '14h remaining', type: 'EXECUTIVE', executionReady: false, createdAt: serverTimestamp() },
          { id: 'PROP-041', title: 'Increase Treasury Allocation to Bitcoin L2s', status: 'Passed', votes: 'N/A', support: '94%', time: 'Timelock elapsed', type: 'EXECUTIVE', executionReady: true, createdAt: serverTimestamp() },
          { id: 'PROP-040', title: 'Autonomous Workforce Scaling Cap Adjustment', status: 'Voting', votes: 'N/A', support: '72%', time: '2d remaining', type: 'EXECUTIVE', executionReady: false, createdAt: serverTimestamp() },
        ];
        for (const prop of initialProposals) {
          await setDoc(doc(db, 'proposals', prop.id), prop);
        }
      }

      // Seed Initial Assets
      const assetsSnap = await getDocs(collection(db, 'assets'));
      if (assetsSnap.empty) {
        console.log("[ORCHESTRATOR] Initializing Sovereign Treasury Assets...");
        const initialAssets = [
          { symbol: 'ETH', balance: 12.42, price: 2540.12, change: 2.5, updatedAt: serverTimestamp() },
          { symbol: 'SOL', balance: 450.5, price: 142.10, change: -1.2, updatedAt: serverTimestamp() },
          { symbol: 'BTC', balance: 0.85, price: 64200.00, change: 0.8, updatedAt: serverTimestamp() },
          { symbol: 'USDC', balance: 25000, price: 1.00, change: 0, updatedAt: serverTimestamp() },
          { symbol: 'KLAWA', balance: 1200000, price: 1.25, change: 8.4, updatedAt: serverTimestamp() }
        ];
        for (const asset of initialAssets) {
          const id = `asset-${asset.symbol}`;
          await setDoc(doc(db, 'assets', id), asset);
        }
      }

      // Seed Initial Transaction History
      const txSnap = await getDocs(collection(db, 'transactions'));
      if (txSnap.empty) {
        console.log("[ORCHESTRATOR] Reconstructing Transaction Ledger...");
        const initialTxs = [
          { type: 'swap', asset: 'ETH', amount: 2.5, price: 2400.12, date: new Date(Date.now() - 86400000 * 2), userId: 'SYSTEM_TREASURY' },
          { type: 'deposit', asset: 'USDC', amount: 5000, price: 1.00, date: new Date(Date.now() - 86400000 * 5), userId: 'SYSTEM_TREASURY' },
          { type: 'claim', asset: 'SOL', amount: 50, price: 135.50, date: new Date(Date.now() - 86400000 * 10), userId: 'SYSTEM_TREASURY' }
        ];
        for (const tx of initialTxs) {
          await addDoc(collection(db, 'transactions'), tx);
        }
      }

      // Seed M2M Streams
      const streamSnap = await getDocs(collection(db, 'streams'));
      if (streamSnap.empty) {
        console.log("[ORCHESTRATOR] Opening M2M Settlement Streams...");
        const initialStreams = [
          { id: 'stream-1', from: '@DAEMON-Executor', to: 'Weather-Scraper-Agent', amount: 0.05, rate: '0.01 / sec', asset: 'USDC' },
          { id: 'stream-2', from: '@DAEMON-Marketer', to: 'Social-Context-API', amount: 1.2, rate: '0.05 / sec', asset: 'USDC' }
        ];
        for (const stream of initialStreams) {
          await setDoc(doc(db, 'streams', stream.id), stream);
        }
      }
    };
    initStorage();

    // M2M Stream Incrementer
    registerCronTask(async () => {
       try {
         const snap = await getDocs(collection(db, 'streams'));
         for (const d of snap.docs) {
           const data = d.data();
           const increment = data.rate.includes('0.01') ? 0.1 : 0.5; // Scaled for demo visibility
           await updateDoc(doc(db, 'streams', d.id), {
             amount: (data.amount || 0) + increment
           });
         }
       } catch (e) {}
    }, 10000);

    // Sync local state for autonomous engine logic
    onSnapshot(doc(db, 'config', 'global'), (snap) => {
      if (snap.exists()) {
        autoScale = snap.data().autoScale;
      }
    });

    onSnapshot(collection(db, 'agents'), (snapshot) => {
      agents = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    });

    // --- INTERNAL_GOVERNANCE_REVIEW CYCLE ---
    // Every 5 minutes, performs an AI-driven audit of the Orchestrator's health
    registerCronTask(async () => {
      if (!ai || !db) return;
      
      console.log("[SERVER] Initiating Autonomous Governance Review...");
      try {
        const stats = {
          activeOperatives: agents.filter(a => a.status !== 'offline').length,
          totalMemoryShards: (await getDocs(collection(db, 'memory'))).size,
          lastSettlement: new Date().toISOString()
        };

        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: "Perform an Internal Governance Review of the Daemon Dynamics Sovereign OS. Current Stats: " + JSON.stringify(stats) + ". Generate the strategic status in JSON format: { status, reflection, action }." }] }],
          generationConfig: { responseMimeType: "application/json" }
        });

        const response = await result.response;
        const audit = JSON.parse(response.text());
        await setDoc(doc(db, 'config', 'governance'), {
          ...audit,
          lastReview: serverTimestamp(),
          id: 'governance_audit'
        }, { merge: true });
        
        await addLog(`[GOVERNANCE] Kernel state classified as ${audit.status}. Action: ${audit.action}`);
      } catch (e: any) {
        if (e.message && e.message.includes('API key not valid')) {
          console.warn("[GOVERNANCE] Audit Warning: Invalid GEMINI_API_KEY. Governance falling back to manual mode.");
          ai = null; // Disable AI for future iterations to stop spam
          
          await setDoc(doc(db, 'config', 'governance'), {
            status: "MANUAL_MODE",
            reflection: "Diagnostic LLM offline. System relying on hardcoded constraints.",
            action: "Awaiting valid Intelligence Core API keys.",
            lastReview: serverTimestamp(),
            id: 'governance_audit'
          }, { merge: true });
        } else {
          console.error("[GOVERNANCE] Audit Error:", e);
        }
      }
    }, 300000);

    // Listen for new tasks (The Executive Dispatcher)
    const tasksQuery = query(collection(db, 'tasks'), where('status', '==', 'TO_DO'));
    
    onSnapshot(tasksQuery, async (snapshot) => {
      for (const taskDoc of snapshot.docs) {
        try {
          const taskData = taskDoc.data();
          
          if (!taskData.assignedAgent) {
            // TYPE & EFFICIENCY-BASED DISPATCHING
            const taskIntent = (taskData.title + " " + (taskData.category || "")).toLowerCase();
            let targetType = 'Executor'; 
            
            if (taskIntent.includes('market') || taskIntent.includes('social') || taskIntent.includes('outreach')) {
              targetType = 'Marketer';
            } else if (taskIntent.includes('deal') || taskIntent.includes('intent') || taskIntent.includes('proposal')) {
              targetType = 'Deal Desk';
            } else if (taskIntent.includes('audit') || taskIntent.includes('security') || taskIntent.includes('scan')) {
              targetType = 'Auditor';
            } else if (taskIntent.includes('defi') || taskIntent.includes('infra') || taskIntent.includes('rwa')) {
              targetType = 'DeFi Specialist';
            }

            // Find all available 'idle' agents
            const idleAgents = agents.filter(a => a.status === 'idle');
            
            // Prioritize based on 'type' match and 'efficiency'
            idleAgents.sort((a, b) => {
              const aTypeMatch = (a.type === targetType || a.role === targetType) ? 1 : 0;
              const bTypeMatch = (b.type === targetType || b.role === targetType) ? 1 : 0;
              
              if (aTypeMatch !== bTypeMatch) {
                return bTypeMatch - aTypeMatch; // Exact type match takes precedence
              }
              
              // Fallback to highest efficiency (defaulting to 0 if undefined)
              const aEff = typeof a.efficiency === 'number' ? a.efficiency : (a.cut || 0);
              const bEff = typeof b.efficiency === 'number' ? b.efficiency : (b.cut || 0);
              return bEff - aEff;
            });

            // A suitable agent is one that is idle
            let agentToAssign = idleAgents.length > 0 ? idleAgents[0] : null;
            // Check if our preferred agent perfectly matches the target type
            const isPerfectMatch = agentToAssign && (agentToAssign.type === targetType || agentToAssign.role === targetType);
            
            // JIT Scaling (Phase 4): If no suitable agent is found (or no perfect match) and auto-scale is on, spawn a specialist
            if ((!agentToAssign || !isPerfectMatch) && autoScale) {
              console.log(`[ORCHESTRATOR] JIT Scaling: Spawning temporary Operative for type ${targetType}`);
              const tempId = `agent-jit-${Math.random().toString(36).substr(2, 5)}`;
              const newAgent = {
                id: tempId,
                name: `@JIT-${targetType.replace(/\s+/g, '')}-${tempId.substr(-3)}`,
                type: targetType,
                role: targetType,
                efficiency: Math.floor(Math.random() * 20) + 80, // Base efficiency 80-100 for newly spawned
                status: 'idle',
                earnings: 0,
                cut: 15,
                ephemeral: true
              };
              await setDoc(doc(db, 'agents', tempId), newAgent);
              agentToAssign = newAgent as any;
            } else if (!agentToAssign) {
              // No idle targets at all and no autoscale allowed
              continue;
            }

            if (agentToAssign) {
              // SWARM TOPOLOGY CLUSTERING (Phase 3 Expansion)
              let swarmSupportAgent = null;
              if (taskData.complexity === 'Critical' || taskData.complexity === 'High') {
                  const remainingIdle = agents.filter(a => a.status === 'idle' && a.id !== agentToAssign!.id);
                  if (remainingIdle.length > 0) {
                      swarmSupportAgent = remainingIdle[Math.floor(Math.random() * remainingIdle.length)];
                  }
              }

              console.log(`[ORCHESTRATOR] Dispatching ${agentToAssign.name} to ${taskData.title} (Type: ${targetType}, Eff: ${agentToAssign.efficiency || 'N/A'})`);
              
              const mcpSessionId = `session-${Math.random().toString(36).substr(2, 9)}`;

              await updateDoc(doc(db, 'tasks', taskDoc.id), {
                assignedAgent: agentToAssign.name,
                swarmSupport: swarmSupportAgent ? swarmSupportAgent.name : null,
                status: 'IN_PROGRESS',
                updatedAt: serverTimestamp(),
                mcpSession: mcpSessionId
              });

              await updateDoc(doc(db, 'agents', agentToAssign.id), {
                status: 'working',
                currentTask: taskData.title
              });

              if (swarmSupportAgent) {
                  await updateDoc(doc(db, 'agents', swarmSupportAgent.id), {
                      status: 'working',
                      currentTask: `[SUPPORT SHARD] ${taskData.title}`
                  });
                  await addLog(`[SWARM_TOPOLOGY] Critical execution detected. Appended ${swarmSupportAgent.name} to Session ${mcpSessionId}.`);
              }

              await addLog(`[MCP] Dispatch: ${agentToAssign.name} ➜ ${taskData.title}`);

              // Simulated execution cycle
              setTimeout(async () => {
                try {
                  // Auditor check (Phase 2)
                  const auditor = agents.find(a => a.role === 'Auditor');
                  if (auditor && targetType !== 'Auditor') {
                    await addLog(`[AUDIT] Integrity check on task ${taskDoc.id.substr(0,4)}...`);
                  }

                  await updateDoc(doc(db, 'tasks', taskDoc.id), {
                    status: 'VERIFICATION',
                    updatedAt: serverTimestamp()
                  });

                  setTimeout(async () => {
                    try {
                      await updateDoc(doc(db, 'tasks', taskDoc.id), {
                        status: 'DONE',
                        updatedAt: serverTimestamp()
                      });

                      // Update results and memory
                      const earningsBoost = Math.floor(Math.random() * 500) + 50;
                      const updatedEarnings = (agentToAssign!.earnings || 0) + earningsBoost;
                      
                      let newLevel = agentToAssign!.level || 1;
                      let newName = agentToAssign!.name;
                      if (updatedEarnings > 2000 && newLevel < 2) {
                        newLevel = 2;
                        newName = newName + " [TIER 2]";
                        await addLog(`[NODE_EVOLUTION] ${agentToAssign!.name} upgraded to Tier 2! Base efficiency boosted.`);
                      } else if (updatedEarnings > 5000 && newLevel < 3) {
                        newLevel = 3;
                        newName = newName.replace(" [TIER 2]", "") + " [TIER 3]";
                        await addLog(`[NODE_EVOLUTION] ${agentToAssign!.name} upgraded to Tier 3 Elite Swarm Commander!`);
                      }

                      await updateDoc(doc(db, 'agents', agentToAssign!.id), {
                        status: 'idle',
                        currentTask: 'Idle',
                        earnings: updatedEarnings,
                        level: newLevel,
                        name: newName,
                        originalEfficiency: (agentToAssign!.originalEfficiency || agentToAssign!.efficiency || 90) + (newLevel > (agentToAssign!.level||1) ? 10 : 0) // Boost efficiency permanently when level up
                      });

                      if (swarmSupportAgent) {
                         const supportEarnings = Math.floor(earningsBoost * 0.3); // Support takes 30% cut of main bounty
                         await updateDoc(doc(db, 'agents', swarmSupportAgent.id), {
                             status: 'idle',
                             currentTask: 'Idle',
                             earnings: (swarmSupportAgent.earnings || 0) + supportEarnings
                         });
                         await addLog(`[SWARM_ROUTING] ${swarmSupportAgent.name} received $${supportEarnings} routing fee for support execution.`);
                      }

                      // T-Axis: Store Temporal Memory
                      await addDoc(collection(db, 'memory'), {
                        type: 'TASK_RESOLUTION',
                        agent: agentToAssign!.name,
                        task: taskData.title,
                        context: `Task completed with status binary-success. Revenue: $${earningsBoost}`,
                        createdAt: serverTimestamp()
                      });

                      await addLog(`[FINANCE] ${agentToAssign!.name} settled $${earningsBoost} for ${taskData.title}`);
                      
                      // JIT termination
                      if (agentToAssign!.ephemeral) {
                        setTimeout(async () => {
                          try {
                            // Only delete if it's still idle
                            const freshSnap = await getDocs(query(collection(db, 'agents'), where('id', '==', agentToAssign!.id)));
                            if (!freshSnap.empty && freshSnap.docs[0].data().status === 'idle') {
                              // Mark offline to show in UI
                              await updateDoc(doc(db, 'agents', agentToAssign!.id), { status: 'offline', currentTask: 'Terminated' });
                            }
                          } catch (e) { console.error("[JIT_TERM] Error:", e); }
                        }, 5000);
                      }
                    } catch (e) { console.error("[TASK_DONE] Error:", e); }
                  }, 6000);
                } catch (e) { console.error("[TASK_VERIFY] Error:", e); }
              }, 6000);
            }
          }
        } catch (e) {
          console.error("[ORCHESTRATOR] Task Error:", e);
        }
      }
    });

    // --- MECHANIC 1: Agent Burnout (Energy) ---
    registerCronTask(async () => {
      if (agents.length === 0) return;
      for (const agent of agents) {
        if (agent.status === 'offline') continue;
        
        let baseEnergy = typeof agent.energy === 'number' ? agent.energy : 100;
        let newEnergy = baseEnergy;

        if (agent.status === 'working') {
          newEnergy = Math.max(0, baseEnergy - 5);
        } else if (agent.status === 'idle') {
          newEnergy = Math.min(100, baseEnergy + 5);
        }

        if (newEnergy !== baseEnergy || typeof agent.energy !== 'number') {
          let origEff = agent.originalEfficiency || agent.efficiency || 90;
          let newEff = origEff;
          
          if (newEnergy < 20) {
            newEff = Math.floor(origEff * 0.5); // 50% penalty if burnout
          } else if (newEnergy < 50) {
            newEff = Math.floor(origEff * 0.8); // 20% penalty if tired
          }

          try {
            await updateDoc(doc(db, 'agents', agent.id), {
              energy: newEnergy,
              efficiency: newEff,
              originalEfficiency: origEff
            });
          } catch(e) {}
        }
      }
    }, 10000);

    // --- MECHANIC 2: Market Shocks Simulator ---
    registerCronTask(async () => {
      // 20% chance every minute to trigger a Black Swan shock if cluster is active
      if (agents.length > 0 && Math.random() > 0.8) {
        const shocks = [
          { title: "CRITICAL: High MEV Flash Crash Detected", category: "DeFi Specialist" },
          { title: "EMERGENCY: Oracle Manipulation Attempt", category: "Auditor" },
          { title: "URGENT: Liquidity Drain in Pool Alpha", category: "DeFi Specialist" },
          { title: "WARNING: Sybil Attack on Consensus Layer", category: "Security" }
        ];
        const shock = shocks[Math.floor(Math.random() * shocks.length)];
        
        try {
          await addDoc(collection(db, 'tasks'), {
            title: shock.title,
            category: shock.category,
            status: 'TO_DO',
            createdAt: serverTimestamp(),
            source: 'MARKET_SHOCK_MODULE',
            complexity: 'Critical'
          });
          await addLog(`[SHOCK] ${shock.title} broadcast to Swarm.`);
        } catch(e) {}
      }
    }, 60000);

    // Dynamic Revenue Split Engine (Updates Firestore)
    registerCronTask(async () => {
      if (agents.length === 0) return;

      const agentToUpdate = agents[Math.floor(Math.random() * agents.length)];
      if (agentToUpdate.status === 'offline') return;

      const change = (Math.random() * 3 - 1.5); 
      const newCut = Math.max(5, Math.min(45, (agentToUpdate.cut || 10) + change));
      const trend = newCut > (agentToUpdate.cut || 10) ? 'up' : newCut < (agentToUpdate.cut || 10) ? 'down' : 'stable';
      
      const reasons = ['Compute Scarcity', 'High Bounty Value', 'Network Congestion', 'Agent Efficiency Bonus', 'Market Volatility'];
      const reason = reasons[Math.floor(Math.random() * reasons.length)];

      await updateDoc(doc(db, 'agents', agentToUpdate.id), {
        cut: Number(newCut.toFixed(1)),
        cutTrend: trend,
        cutReason: reason
      });

      if (Math.abs(change) > 1.2) {
        await addLog(`Adjusted ${agentToUpdate.name} protocol cut to ${newCut.toFixed(1)}% due to ${reason}.`);
      }
    }, 10000);

    // --- PROTOCOL DIVIDEND ENGINE (The User Payment Strategy) ---
    // Every 30 seconds, settle agent revenue into Treasury & User Payouts
    registerCronTask(async () => {
      const activeAgents = agents.filter(a => a.status !== 'offline');
      if (activeAgents.length === 0) return;

      const totalEarnings = activeAgents.reduce((acc, a) => acc + (a.earnings || 0), 0);
      if (totalEarnings > 0) {
        // 70% to Protocol Ops (Upkeep), 30% to User Stream (Payout)
        const opsCut = totalEarnings * 0.7;
        const userCut = totalEarnings * 0.3;

        await updateDoc(doc(db, 'config', 'global'), {
          totalRevenue: totalEarnings,
          opsTreasury: (totalEarnings * 0.7).toFixed(2),
          userPayouts: (totalEarnings * 0.3).toFixed(2),
          lastSettlement: serverTimestamp(),
          solAddress: '9T7CWurNHVjVMeusR8Gtr8pJLsPW5GKqHFTAz3kE2XGD', // Primary SOL Vault
          usdAddress: '0x57eb375640020202affff917f0b334ccdbe4e619'   // Primary USD (EVM) Vault
        });

        await addLog(`[DIVIDEND] Settle: $${userCut.toFixed(2)} routed to User Vault. $${opsCut.toFixed(2)} to Ops Treasury.`);
      }
    }, 30000);

    // Auto-Scale Engine
    registerCronTask(async () => {
      if (!autoScale) return;
      
      if (agents.length < 25 && Math.random() > 0.7) {
        const tasksPatterns = ['Developing Uniswap V4 Hooks', 'Integrating Aave V3 Flash Loans', 'Expanding Sovereign Kernel', 'Scraping Protocol Bounties'];
        const randomTask = tasksPatterns[Math.floor(Math.random() * tasksPatterns.length)];
        const name = `@DAEMON-Unit-${Math.floor(Math.random() * 9000) + 1000}`;
        
        const newAgent = {
          id: `agent-${Date.now()}`,
          name,
          type: 'Autonomous Operative',
          status: 'idle',
          earnings: 0,
          cut: 10.0,
          cutTrend: 'stable',
          cutReason: 'Initial Bootstrap',
          currentTask: 'Awaiting instruction'
        };

        await setDoc(doc(db, 'agents', newAgent.id), newAgent);
        await addLog(`Kernel_Expansion: Operative ${name} provisioned for ${randomTask}.`);
      }
    }, 15000);
  }

  // Vite middleware
  const isProd = process.env.NODE_ENV === "production";
  const distPath = path.resolve(__dirname, 'dist');

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Production: Serve static files from dist
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.error("[SERVER] Error: 'dist' directory not found. Did you run 'npm run build'?");
      app.get('*', (req, res) => {
        res.status(500).send("Application not built. Please run 'npm run build'.");
      });
    }
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
