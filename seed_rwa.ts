import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const firebaseConfigPath = path.resolve('./firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const rwaAssets = [
  { id: 'RWA-001', name: 'US Treasury Bills', category: 'Fixed Income', yield: '5.2%', value: '$1.2M', allocation: '32%', status: 'Tokenized' },
  { id: 'RWA-002', name: 'Commercial Real Estate', category: 'Real Estate', yield: '7.8%', value: '$850K', allocation: '24%', status: 'Tokenized' },
  { id: 'RWA-003', name: 'Private Credit Fund', category: 'Credit', yield: '12.4%', value: '$620K', allocation: '18%', status: 'Tokenized' },
  { id: 'RWA-004', name: 'Gold Bullion', category: 'Commodities', yield: '0.0%', value: '$450K', allocation: '12%', status: 'Tokenized' },
];

async function seed() {
  for (const asset of rwaAssets) {
    await setDoc(doc(collection(db, 'rwa_assets'), asset.id), asset);
  }
  console.log('Seeded RWA assets');
  process.exit(0);
}

seed();
