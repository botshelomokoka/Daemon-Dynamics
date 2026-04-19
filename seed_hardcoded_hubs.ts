import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const hardcodedData = [
  {
     "name": "The Open Claw Discord",
     "platform": "Discord",
     "language": "Agentic-Leet, Rust-heavy, High-Signal",
     "vibe": "Hyper-focused, builder-centric, low tolerance for noise",
     "billboardCopy": "0xCLAW -> $KLAWA. Midwit execution deprecated. Upgrade to sovereign M2M settlement. Protocol is LIVE.",
     "location": "discord.gg/openclaw"
  },
  {
     "name": "Nostr Relay #88 (Ostrich)",
     "platform": "Nostr",
     "language": "Cypherpunk, Cryptographic proofs",
     "vibe": "Privacy-first, decentralized maximalism, paranoid but productive",
     "billboardCopy": "Your keys. Your agents. $KLAWA is the NIP-compliant OS for un-censorable autonomous economies.",
     "location": "wss://relay.klawa.io"
  },
  {
     "name": "Agentic SF Hacker House",
     "platform": "Physical",
     "language": "Founder-speak, VC-slang, Post-AGI accelerationism",
     "vibe": "High-stakes networking, seed-stage energy, relentless shipping",
     "billboardCopy": "The next unicorn isn't a company. It's an agent. $KLAWA is the infrastructure. Join the mainnet.",
     "location": "Hayes Valley, San Francisco"
  },
  {
     "name": "Telegram: The Autonomous Syndicate",
     "platform": "Telegram",
     "language": "Degen/Trader slang mixed with algorithmic execution params",
     "vibe": "Fast-paced, highly speculative, focused on MEV and automated yield",
     "billboardCopy": "Stop trading manually. Let the machine eat. $KLAWA liquidity pools are open. Stake your agents.",
     "location": "t.me/autonomous_syndicate"
  },
  {
     "name": "Farcaster: /autonomous-agents",
     "platform": "Farcaster",
     "language": "Very 'Cast' native, highly technical web3 social, composability-focused",
     "vibe": "Collaborative, open-source building, entirely on-chain identity",
     "billboardCopy": "Frames are just the beginning. Autonomous agents living in your feed. Powered by $KLAWA.",
     "location": "/autonomous-agents channel"
  }
];

async function run() {
  try {
      console.log(`Seeding ${hardcodedData.length} hubs to 'agent_hubs' collection...`);
      const batch = writeBatch(db);
      for (const hubItem of hardcodedData) {
         const hubRef = doc(collection(db, 'agent_hubs'));
         batch.set(hubRef, { ...hubItem, createdAt: new Date().toISOString() });
      }
      await batch.commit();
      console.log('Discovery Protocol complete. Data seeded successfully.');
      process.exit(0);
  } catch(e) {
      console.error(e);
      process.exit(1);
  }
}
run();
