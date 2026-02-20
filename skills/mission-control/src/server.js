#!/usr/bin/env node

/**
 * Mission Control — Real-Time Multi-Agent Dashboard
 * 
 * Provides unified visibility into all agents:
 * - Real-time status via WebSocket
 * - REST API for queries/decisions
 * - File monitoring for state changes
 * - Performance metrics aggregation
 * 
 * Start: node mission-control.js
 * Dashboard: http://localhost:3500
 */

const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PORT = process.env.MC_PORT || 3500;
const WORKSPACE = process.env.WORKSPACE || '/home/openclaw/.openclaw/workspace';

// Initialize app
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// In-memory state
const state = {
  agents: {},
  tasks: {},
  lessons: [],
  alerts: [],
  hardStops: [],
  lastUpdate: Date.now()
};

// Connected WebSocket clients
const clients = new Set();

// Agent status watchers
const agentDirs = ['atlas', 'astra', 'sentinel', 'quinn', 'morgan'];

/**
 * Initialize agent state from files
 */
function initializeAgents() {
  agentDirs.forEach(agentName => {
    state.agents[agentName] = {
      id: agentName,
      name: agentName.charAt(0).toUpperCase() + agentName.slice(1),
      status: 'offline',
      currentTask: null,
      progress: 0,
      lastUpdate: Date.now(),
      performance: {},
      lessons: []
    };
  });
}

/**
 * Load Atlas performance metrics
 */
function loadAtlasMetrics() {
  try {
    const configPath = path.join(WORKSPACE, 'agents/atlas/config/atlas-config.json');
    if (!fs.existsSync(configPath)) return;
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    state.agents.atlas.performance = {
      views: config.performance?.baseline?.views || 1500,
      engagement: config.performance?.baseline?.engagement || 0.08,
      postsMonth: config.performance?.optimization?.postsMonth || 30,
      costToday: Math.random() * 25, // Mock data
      costAvg: 3.22
    };
    
    state.agents.atlas.status = 'idle';
  } catch (e) {
    console.error('Failed to load Atlas metrics:', e.message);
  }
}

/**
 * Load lessons from agent files
 */
function loadLessons() {
  agentDirs.forEach(agentName => {
    try {
      const lessonsPath = path.join(WORKSPACE, `agents/${agentName}/lessons.md`);
      if (!fs.existsSync(lessonsPath)) return;
      
      const content = fs.readFileSync(lessonsPath, 'utf8');
      const lines = content.split('\n');
      
      // Parse lessons (simple extraction of recent entries)
      const lesson = {
        agent: agentName,
        timestamp: Date.now(),
        lesson: lines.slice(0, 5).join(' ').substring(0, 100),
        type: Math.random() > 0.5 ? 'success' : 'failure'
      };
      
      if (lesson.lesson.length > 10) {
        state.lessons.push(lesson);
      }
    } catch (e) {
      // Silently skip if file doesn't exist
    }
  });
  
  // Keep only last 10 lessons
  state.lessons = state.lessons.slice(-10);
}

/**
 * Broadcast update to all WebSocket clients
 */
function broadcast(message) {
  const data = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

/**
 * Publish status update (called by agents)
 */
function publishUpdate(agentName, update) {
  if (state.agents[agentName]) {
    Object.assign(state.agents[agentName], update);
    state.agents[agentName].lastUpdate = Date.now();
    
    broadcast({
      type: 'agent_update',
      agent: agentName,
      data: state.agents[agentName]
    });
  }
}

/**
 * WebSocket handler
 */
wss.on('connection', (ws) => {
  console.log(`[WS] Client connected (total: ${clients.size})`);
  clients.add(ws);
  
  // Send initial state
  ws.send(JSON.stringify({
    type: 'initial_state',
    agents: state.agents,
    tasks: state.tasks,
    lessons: state.lessons,
    alerts: state.alerts,
    hardStops: state.hardStops
  }));
  
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      
      if (data.event === 'subscribe') {
        console.log(`[WS] Client subscribed to:`, data.channels);
      } else if (data.event === 'task_start') {
        state.tasks[data.taskId] = {
          id: data.taskId,
          agent: data.agent,
          name: data.name,
          progress: 0,
          started: Date.now(),
          steps: data.steps || []
        };
        
        broadcast({
          type: 'task_created',
          task: state.tasks[data.taskId]
        });
      }
    } catch (e) {
      console.error('[WS] Message parse error:', e.message);
    }
  });
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected (total: ${clients.size})`);
  });
});

/**
 * REST Endpoints
 */

// System status
app.get('/api/status', (req, res) => {
  const agentsOnline = Object.values(state.agents).filter(a => a.status !== 'offline').length;
  const tasksActive = Object.values(state.tasks).filter(t => t.progress < 1).length;
  
  res.json({
    status: agentsOnline > 0 ? 'healthy' : 'degraded',
    uptime: Date.now() - state.lastUpdate,
    agentsOnline,
    agentsTotal: agentDirs.length,
    tasksActive,
    alerts: state.alerts.length,
    timestamp: new Date().toISOString()
  });
});

// All agents status
app.get('/api/agents', (req, res) => {
  res.json({
    agents: Object.values(state.agents),
    timestamp: new Date().toISOString()
  });
});

// Single agent status
app.get('/api/agents/:id', (req, res) => {
  const agent = state.agents[req.params.id];
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  res.json(agent);
});

// Active tasks
app.get('/api/tasks', (req, res) => {
  const tasks = Object.values(state.tasks)
    .filter(t => t.progress < 1)
    .sort((a, b) => b.started - a.started);
  
  res.json({
    tasks,
    active: tasks.length,
    timestamp: new Date().toISOString()
  });
});

// Recent lessons
app.get('/api/lessons', (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const since = Date.now() - (days * 24 * 60 * 60 * 1000);
  
  const lessons = state.lessons.filter(l => l.timestamp > since);
  
  res.json({
    lessons,
    count: lessons.length,
    timestamp: new Date().toISOString()
  });
});

// Hard stops requiring action
app.get('/api/hard_stops', (req, res) => {
  res.json({
    pending: state.hardStops.filter(hs => !hs.resolved),
    timestamp: new Date().toISOString()
  });
});

// Submit hard stop decision
app.post('/api/hard_stops/:id/decision', (req, res) => {
  const { id } = req.params;
  const { decision, reason } = req.body;
  
  const hs = state.hardStops.find(h => h.id === id);
  if (!hs) {
    return res.status(404).json({ error: 'Hard stop not found' });
  }
  
  hs.resolved = true;
  hs.decision = decision;
  hs.reason = reason;
  hs.resolvedAt = new Date().toISOString();
  
  broadcast({
    type: 'hard_stop_resolved',
    hardStop: hs
  });
  
  console.log(`[DECISION] ${hs.agent}: ${decision} (${reason})`);
  
  res.json({
    success: true,
    hardStop: hs
  });
});

// Agent update webhook (called by agents)
app.post('/api/agent_update', (req, res) => {
  const { agent, ...update } = req.body;
  
  publishUpdate(agent, update);
  
  res.json({ success: true });
});

// Task progress update
app.post('/api/task_progress', (req, res) => {
  const { taskId, progress, currentStep } = req.body;
  
  if (state.tasks[taskId]) {
    state.tasks[taskId].progress = progress;
    state.tasks[taskId].currentStep = currentStep;
    
    broadcast({
      type: 'task_progress',
      task: state.tasks[taskId]
    });
  }
  
  res.json({ success: true });
});

// Serve dashboard HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

/**
 * Mock data generator (for demo)
 */
function generateMockUpdates() {
  // Simulate Atlas generating content
  if (Math.random() < 0.1) {
    publishUpdate('atlas', {
      status: 'active',
      currentTask: 'Generate 4 posts',
      progress: Math.random() * 0.8
    });
  }
  
  // Simulate Astra dispatching tasks
  if (Math.random() < 0.05) {
    publishUpdate('astra', {
      status: Math.random() > 0.7 ? 'active' : 'idle',
      currentTask: 'Dispatch tasks'
    });
  }
}

/**
 * Startup
 */
function startup() {
  console.log(`\n🎯 MISSION CONTROL starting...\n`);
  
  initializeAgents();
  loadAtlasMetrics();
  loadLessons();
  
  // Mock hard stop for demo
  state.hardStops.push({
    id: 'hs-001',
    agent: 'atlas',
    type: 'BUDGET_LIMIT',
    level: 4,
    message: 'Image generation costs hit $21.60 today (limit: $20 soft, $25 hard)',
    actionRequired: true,
    options: ['approve', 'pause', 'adjust_limit'],
    resolved: false,
    createdAt: new Date().toISOString()
  });
  
  // Start server
  server.listen(PORT, () => {
    console.log(`✅ Dashboard: http://localhost:${PORT}`);
    console.log(`✅ WebSocket: ws://localhost:${PORT}/ws`);
    console.log(`✅ API: http://localhost:${PORT}/api/\n`);
  });
  
  // Mock updates every 3 seconds
  setInterval(generateMockUpdates, 3000);
  
  // Reload lessons every 30 seconds
  setInterval(loadLessons, 30000);
}

// Start on require or direct execution
if (require.main === module) {
  startup();
}

module.exports = { app, server, wss, state, publishUpdate, broadcast };
