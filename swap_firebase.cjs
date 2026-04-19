const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf-8');

// Replace imports
const importTarget1 = "import { initializeApp } from 'firebase/app';";
const importTarget2 = "import { initializeFirestore, collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp, getDocs, limit, addDoc, setDoc, orderBy } from 'firebase/firestore';";

const newImports = `import * as admin from 'firebase-admin';`;

serverCode = serverCode.replace(importTarget1, newImports);
serverCode = serverCode.replace(importTarget2, "");

// Replace Init Block
const initRegex = /const firebaseConfigPath = path\.resolve[\s\S]*?console\.log\("\[SERVER\] Firebase initialized for Agent Hive \(Long Polling enabled\)\."\);\n\}/;

const newInit = `const firebaseConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
let db: any;

if (fs.existsSync(firebaseConfigPath)) {
  const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: firebaseConfig.projectId
    });
  }
  db = admin.firestore();
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
`;

serverCode = serverCode.replace(initRegex, newInit);

fs.writeFileSync('server.ts', serverCode);
console.log('Firebase admin swapped successfully');
