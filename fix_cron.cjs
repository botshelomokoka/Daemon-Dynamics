const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf-8');

// Insert registerCronTask definition at the top of the DB setup
const cronDef = `
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
`;

serverCode = serverCode.replace('  // --- AGENT HIVE AUTONOMOUS ENGINE (Real Firestore Logic) ---', cronDef);

// Replace setInterval(async () => { ... } with registerCronTask
// We have several. We only want to replace the ones *after* Agent Hive Autonomous Engine

const splitIndex = serverCode.indexOf('Agent Hive Autonomous Engine');
let topHalf = serverCode.substring(0, splitIndex);
let botHalf = serverCode.substring(splitIndex);

botHalf = botHalf.replaceAll('setInterval(async () => {', 'registerCronTask(async () => {');
// also fix syncPrices
botHalf = botHalf.replace('setInterval(syncPrices, 30000);', 'registerCronTask(syncPrices, 30000);');

fs.writeFileSync('server.ts', topHalf + botHalf);
console.log('Fixed cron tasks.');
