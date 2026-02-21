#!/usr/bin/env node

/**
 * Atlas Scheduler - Runs Atlas every 2 hours
 * 
 * Usage: node atlas-scheduler.js
 * Run in background: forever start atlas-scheduler.js
 */

const NODE_PATH = 'node';
const { spawn } = require('child_process');
const path = require('path');

const INTERVAL_HOURS = 2;
const ATLAS_PATH = path.join(__dirname, '../src/atlas-agent.js');

console.log(`\n🕐 Atlas Scheduler starting...`);
console.log(`   Interval: Every ${INTERVAL_HOURS} hours`);
console.log(`   Script: ${ATLAS_PATH}\n`);

// Run Atlas immediately on start
runAtlas();

// Then run every 2 hours
setInterval(() => {
  runAtlas();
}, INTERVAL_HOURS * 60 * 60 * 1000);

function runAtlas() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🚀 Running Atlas...`);
  
  const atlas = spawn(NODE_PATH, [ATLAS_PATH], {
    cwd: path.dirname(ATLAS_PATH),
    env: { ...process.env },
    stdio: 'inherit'
  });
  
  atlas.on('close', (code) => {
    const endTime = new Date().toISOString();
    if (code === 0) {
      console.log(`[${endTime}] ✅ Atlas completed successfully`);
    } else {
      console.log(`[${endTime}] ❌ Atlas exited with code ${code}`);
    }
  });
  
  atlas.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] 💥 Atlas error:`, err.message);
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Scheduler shutting down...');
  process.exit(0);
});
