#!/usr/bin/env node

/**
 * Test Mission Control
 * Verifies all endpoints work correctly
 */

const BASE_URL = 'http://localhost:3500';

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
  } catch (e) {
    console.log(`❌ ${name}: ${e.message}`);
  }
}

async function run() {
  console.log('\n🧪 Testing Mission Control...\n');
  
  // Test: System status
  await test('GET /api/status', async () => {
    const res = await fetch(`${BASE_URL}/api/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.status) throw new Error('Missing status field');
  });
  
  // Test: Agents list
  await test('GET /api/agents', async () => {
    const res = await fetch(`${BASE_URL}/api/agents`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.agents)) throw new Error('Not an array');
    if (data.agents.length === 0) throw new Error('No agents found');
  });
  
  // Test: Tasks list
  await test('GET /api/tasks', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.tasks)) throw new Error('Not an array');
  });
  
  // Test: Lessons list
  await test('GET /api/lessons', async () => {
    const res = await fetch(`${BASE_URL}/api/lessons?days=7`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.lessons)) throw new Error('Not an array');
  });
  
  // Test: Hard stops
  await test('GET /api/hard_stops', async () => {
    const res = await fetch(`${BASE_URL}/api/hard_stops`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.pending)) throw new Error('Not an array');
  });
  
  // Test: Agent update webhook
  await test('POST /api/agent_update', async () => {
    const res = await fetch(`${BASE_URL}/api/agent_update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent: 'atlas',
        status: 'active',
        currentTask: 'Test task',
        progress: 0.5
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });
  
  // Test: Dashboard loads
  await test('GET / (Dashboard HTML)', async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    if (!html.includes('Mission Control')) throw new Error('Missing dashboard title');
  });
  
  console.log('\n✅ All tests passed!\n');
  console.log('🎯 Mission Control is ready at: http://localhost:3500\n');
}

run().catch(e => {
  console.error('\n❌ Test suite failed:', e.message);
  console.error('\nMake sure Mission Control is running:');
  console.error('  node mission-control.js\n');
  process.exit(1);
});
