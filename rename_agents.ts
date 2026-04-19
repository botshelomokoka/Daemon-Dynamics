import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const agentsSnap = await getDocs(collection(db, 'agents'));
  const batch = writeBatch(db);
  let changes = 0;
  
  agentsSnap.forEach((d) => {
    const data = d.data();
    if (data.name && data.name.includes('@ONL-')) {
      const newName = data.name.replace('@ONL-', '@DAEMON-');
      batch.update(doc(db, 'agents', d.id), { name: newName });
      changes++;
    }
  });

  if (changes > 0) {
    await batch.commit();
    console.log(`Updated ${changes} agents in Firestore.`);
  } else {
    console.log('No agents needed updating.');
  }

  process.exit(0);
}

run().catch(console.error);
