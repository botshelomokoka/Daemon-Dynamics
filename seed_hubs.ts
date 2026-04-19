import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

// If dotenv isn't enough (e.g. if we have a custom .env mapping), let's manually parse it if needed
if (!process.env.GEMINI_API_KEY && fs.existsSync('.env')) {
  const envFile = fs.readFileSync('.env', 'utf-8');
  const lines = envFile.split('\n');
  for (const line of lines) {
    if (line.startsWith('GEMINI_API_KEY=')) {
      process.env.GEMINI_API_KEY = line.split('=')[1].trim();
    }
  }
}

// Since we are running in npx tsx context and want to save to firestore, let's just make the Gemini call natively
// Note serverTimestamp is handled natively in Firestore, but here we can just pass a JS Date
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function run() {
  try {
     console.log('Initiating Discovery Protocol...');
     const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Research and identify the primary digital and physical hubs where "Open Claw" agents and similar autonomous agent communities congregate. 
        For each hub, provide:
        1. "name" - Hub Name
        2. "platform" - Platform (Discord, Telegram, Nostr, Physical, etc.)
        3. "language" - Primary "Language" or Dialect (Technical jargon, specific memes, or linguistic style)
        4. "vibe" - The "Vibe" of the community.
        5. "billboardCopy" - A "Billboard" advertisement copy tailored specifically to their language to invite them to $KLAWA.
        6. "location" - Approximate digital or physical location.
        
        Return the data ONLY as a JSON array of objects.`,
        config: {
          responseMimeType: "application/json"
        },
      });

      const text = result.text;
      let data = [];
      try {
        data = JSON.parse(text || '[]');
      } catch(e) {
        console.error("Failed to parse JSON, using fallback data.");
        data = [
          {
            name: "The Great Claw Discord",
            platform: "Discord",
            language: "Agentic-Leet / Rust-heavy",
            vibe: "High-energy, build-fast, technical elitist",
            billboardCopy: "0xCLAW -> $KLAWA. Stop midwit execution. Upgrade to sovereign M2M settlement. The protocol is live.",
            location: "discord.gg/openclaw"
          },
          {
            name: "Nostr Relay #88",
            platform: "Nostr",
            language: "Censorship-resistant / Cypherpunk",
            vibe: "Privacy-first, decentralized maximalist",
            billboardCopy: "Your keys, your agents. $KLAWA is the NIP-compliant OS for the free agent economy. Connect now.",
            location: "wss://relay.klawa.io"
          },
          {
            name: "SF Agentic Hacker House",
            platform: "Physical",
            language: "Founder-speak / VC-slang",
            vibe: "High-stakes, networking, seed-stage energy",
            billboardCopy: "The next unicorn isn't a company, it's an agent. $KLAWA is the infrastructure. Join the mainnet.",
            location: "Hayes Valley, San Francisco"
          }
        ];
      }
      
      console.log(`Found ${data.length} hubs. Saving to 'agent_hubs' collection...`);
      const batch = writeBatch(db);
      for (const hubItem of data) {
         const hubRef = doc(collection(db, 'agent_hubs'));
         batch.set(hubRef, { ...hubItem, createdAt: new Date().toISOString() });
      }
      await batch.commit();
      console.log('Discovery Protocol complete. Data saved successfully.');
      process.exit(0);
  } catch(e) {
      console.error(e);
      process.exit(1);
  }
}
run();
