import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function runDiagnostics() {
  console.log("--- Daemon Dynamics Sovereign OS Diagnostics ---");
  
  // 1. Check Environment Variables
  console.log("\n[1] Checking Environment Variables...");
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    console.log("✅ GEMINI_API_KEY: Detected");
  } else {
    console.error("❌ GEMINI_API_KEY: Missing");
  }

  // 2. Check Firebase Configuration
  console.log("\n[2] Checking Firebase Configuration...");
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log("✅ firebase-applet-config.json: Present and valid JSON");
      
      // Initialize Firebase to test connectivity
      const app = initializeApp(config);
      const db = getFirestore(app, config.firestoreDatabaseId);
      console.log("✅ Firebase App Initialized");

      try {
        const q = query(collection(db, 'config'), limit(1));
        await getDocs(q);
        console.log("✅ Firestore Connectivity: Success");
      } catch (err) {
        console.error("❌ Firestore Connectivity: Failed", err);
      }
    } catch (err) {
      console.error("❌ firebase-applet-config.json: Invalid JSON", err);
    }
  } else {
    console.warn("⚠️ firebase-applet-config.json: Missing (Manual setup might be active)");
  }

  // 3. Check AI Service
  console.log("\n[3] Checking AI Service (Gemini)...");
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent("Diagnostics test: answer with 'OK'");
      const response = await result.response;
      console.log(`✅ Gemini API Test: ${response.text().trim()}`);
    } catch (err) {
      console.error("❌ Gemini API Test: Failed", err);
    }
  }

  // 4. Check critical files
  console.log("\n[4] Checking Critical Files...");
  const criticalFiles = [
    'server.ts',
    'src/App.tsx',
    'src/OrchestratorView.tsx',
    'src/SovereignFinancialView.tsx',
    'firestore.rules',
    'firebase-blueprint.json'
  ];

  criticalFiles.forEach(file => {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      console.log(`✅ ${file}: Found`);
    } else {
      console.error(`❌ ${file}: Missing`);
    }
  });

  console.log("\n--- Diagnostics Complete ---");
}

runDiagnostics().catch(err => {
  console.error("Unexpected Diagnostic Error:", err);
  process.exit(1);
});
