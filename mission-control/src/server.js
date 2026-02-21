#!/usr/bin/env node

/**
 * Mission Control — Real-Time Multi-Agent Dashboard
 * 
 * Expanded with:
 * - Tasks Board (track tasks, status, owner)
 * - Content Pipeline (idea → script → thumbnail → filming → done)
 * - Calendar (scheduled tasks, cron jobs)
 * - Memory Screen (view memories, search)
 * - Team Screen (agents as employees)
 * - Office View (visual agent status)
 * 
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

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Expanded in-memory state
const state = {
  // Core
  agents: {},
  tasks: {},
  lessons: [],
  alerts: [],
  hardStops: [],
  
  // NEW: Tasks Board
  tasks_board: [],
  
  // NEW: Content Pipeline
  content_pipeline: [],
  
  // NEW: Calendar
  calendar: [],
  
  // NEW: Team
  team: [],
  
  // NEW: Memories
  memories: [],
  
  // NEW: Office
  office: [],
  
  lastUpdate: Date.now()
};

const clients = new Set();

// Initialize with sample data
function initializeData() {
  // Sample tasks for Tasks Board
  state.tasks_board = [
    { id: 'task-1', title: 'Build Cash Flow Dashboard', status: 'in_progress', owner: 'Atlas', priority: 'high', created: Date.now() - 86400000 },
    { id: 'task-2', title: 'Research Reddit pain points', status: 'done', owner: 'Reaper', priority: 'high', created: Date.now() - 172800000 },
    { id: 'task-3', title: 'Set up Agent Vault', status: 'done', owner: 'James', priority: 'medium', created: Date.now() - 259200000 },
    { id: 'task-4', title: 'Deploy Mission Control', status: 'todo', owner: 'James', priority: 'medium', created: Date.now() },
    { id: 'task-5', title: 'Write outreach messages', status: 'todo', owner: 'Atlas', priority: 'low', created: Date.now() }
  ];
  
  // Sample content pipeline
  state.content_pipeline = [
    { id: 'cp-1', title: 'Cash Flow Problems Post', stage: 'idea', platform: 'linkedin', created: Date.now() - 86400000, assignee: 'Atlas' },
    { id: 'cp-2', title: 'SaaS Pricing Guide', stage: 'script', platform: 'twitter', created: Date.now() - 172800000, assignee: 'Atlas' },
    { id: 'cp-3', title: 'Founder Mistakes Thread', stage: 'thumbnail', platform: 'twitter', created: Date.now() - 43200000, assignee: 'Atlas' },
    { id: 'cp-4', title: 'AI Admin Assistant Demo', stage: 'filming', platform: 'youtube', created: Date.now() - 21600000, assignee: 'James' },
    { id: 'cp-5', title: 'Week 7 Recap', stage: 'done', platform: 'instagram', created: Date.now() - 86400000, assignee: 'Atlas', published: Date.now() - 86400000 }
  ];
  
  // Sample calendar
  state.calendar = [
    { id: 'cal-1', title: 'Daily standup', time: '2026-02-20T09:00:00Z', type: 'recurring', frequency: 'daily', owner: 'all' },
    { id: 'cal-2', title: 'Reddit harvest', time: '2026-02-20T06:00:00Z', type: 'recurring', frequency: 'daily', owner: 'Reaper' },
    { id: 'cal-3', title: 'Content generation', time: '2026-02-20T12:00:00Z', type: 'recurring', frequency: 'daily', owner: 'Atlas' },
    { id: 'cal-4', title: 'Weekly review', time: '2026-02-24T18:00:00Z', type: 'one-time', owner: 'James' }
  ];
  
  // Sample team (agents as employees)
  state.team = [
    { id: 'atlas', name: 'Atlas', role: 'Content Agent', status: 'working', avatar: '📱', skills: ['content_generation', 'posting', 'analytics'], manager: 'James' },
    { id: 'morgan', name: 'Morgan', role: 'COO', status: 'idle', avatar: '🏢', skills: ['oversight', 'decisions', 'hiring'], manager: 'James' },
    { id: 'astra', name: 'Astra', role: 'Operations', status: 'idle', avatar: '🔧', skills: ['task_dispatch', 'automation'], manager: 'Morgan' },
    { id: 'sentinel', name: 'Sentinel', role: 'Support', status: 'idle', avatar: '🛟', skills: ['ticket_intake', 'escalation'], manager: 'Morgan' },
    { id: 'quinn', name: 'Quinn', role: 'Communications', status: 'idle', avatar: '💬', skills: ['messaging', 'routing'], manager: 'Morgan' },
    { id: 'reaper', name: 'Reaper', role: 'Research', status: 'working', avatar: '🔍', skills: ['reddit_scraping', 'pain_detection'], manager: 'James' }
  ];
  
  // Sample office (visual workspace)
  state.office = [
    { id: 'atlas', station: 'desk-1', status: 'working', current_task: 'Generating content', computer_on: true },
    { id: 'morgan', station: 'desk-2', status: 'idle', current_task: null, computer_on: true },
    { id: 'astra', station: 'desk-3', status: 'idle', current_task: null, computer_on: false },
    { id: 'sentinel', station: 'desk-4', status: 'idle', current_task: null, computer_on: false },
    { id: 'quinn', station: 'desk-5', status: 'idle', current_task: null, computer_on: false },
    { id: 'reaper', station: 'desk-6', status: 'working', current_task: 'Scanning Reddit', computer_on: true }
  ];
  
  // Sample memories
  state.memories = [
    { id: 'mem-1', title: 'ehi is male', content: 'Correct gender reference: he/him. Never use she/her.', type: 'correction', timestamp: Date.now() - 3600000 },
    { id: 'mem-2', title: 'Agent Vault installed', content: 'Security skill added. API keys never exposed in plaintext.', type: 'learning', timestamp: Date.now() - 7200000 },
    { id: 'mem-3', title: 'Reddit pain points found', content: '7 real problems identified. Top: Cash Flow Forecasting, AI Admin, Auto-Bookkeeper.', type: 'discovery', timestamp: Date.now() - 14400000 },
    { id: 'mem-4', title: 'Atlas v3.0 directive', content: 'Full autonomy. Acts then reports. Self-initiates. Compresses memory.', type: 'system', timestamp: Date.now() - 28800000 }
  ];
}

initializeData();

// Broadcast to all WebSocket clients
function broadcast(message) {
  const data = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on('connection', (ws) => {
  console.log(`[WS] Client connected`);
  clients.add(ws);
  
  ws.send(JSON.stringify({ type: 'initial_state', ...state }));
  
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      
      if (data.event === 'subscribe') {
        console.log(`[WS] Subscribed to:`, data.channels);
      }
    } catch (e) {
      console.error('[WS] Error:', e.message);
    }
  });
  
  ws.on('close', () => {
    clients.delete(ws);
  });
});

// ============ TASKS BOARD API ============

app.get('/api/tasks-board', (req, res) => {
  res.json({ tasks: state.tasks_board, timestamp: new Date().toISOString() });
});

app.post('/api/tasks-board', (req, res) => {
  const task = {
    id: 'task-' + Date.now(),
    ...req.body,
    created: Date.now()
  };
  state.tasks_board.push(task);
  broadcast({ type: 'tasks_board_update', task });
  res.json({ success: true, task });
});

app.put('/api/tasks-board/:id', (req, res) => {
  const { id } = req.params;
  const task = state.tasks_board.find(t => t.id === id);
  if (task) {
    Object.assign(task, req.body);
    broadcast({ type: 'tasks_board_update', task });
  }
  res.json({ success: !!task });
});

// ============ CONTENT PIPELINE API ============

app.get('/api/content-pipeline', (req, res) => {
  res.json({ pipeline: state.content_pipeline, timestamp: new Date().toISOString() });
});

app.post('/api/content-pipeline', (req, res) => {
  const item = {
    id: 'cp-' + Date.now(),
    ...req.body,
    created: Date.now()
  };
  state.content_pipeline.push(item);
  broadcast({ type: 'content_pipeline_update', item });
  res.json({ success: true, item });
});

app.put('/api/content-pipeline/:id', (req, res) => {
  const { id } = req.params;
  const item = state.content_pipeline.find(i => i.id === id);
  if (item) {
    Object.assign(item, req.body);
    if (req.body.stage === 'done' && !item.published) {
      item.published = Date.now();
    }
    broadcast({ type: 'content_pipeline_update', item });
  }
  res.json({ success: !!item });
});

// ============ CALENDAR API ============

app.get('/api/calendar', (req, res) => {
  res.json({ events: state.calendar, timestamp: new Date().toISOString() });
});

app.post('/api/calendar', (req, res) => {
  const event = {
    id: 'cal-' + Date.now(),
    ...req.body
  };
  state.calendar.push(event);
  broadcast({ type: 'calendar_update', event });
  res.json({ success: true, event });
});

// ============ TEAM API ============

app.get('/api/team', (req, res) => {
  res.json({ team: state.team, timestamp: new Date().toISOString() });
});

app.post('/api/team', (req, res) => {
  const member = {
    id: 'member-' + Date.now(),
    ...req.body
  };
  state.team.push(member);
  broadcast({ type: 'team_update', member });
  res.json({ success: true, member });
});

app.put('/api/team/:id', (req, res) => {
  const { id } = req.params;
  const member = state.team.find(m => m.id === id);
  if (member) {
    Object.assign(member, req.body);
    broadcast({ type: 'team_update', member });
  }
  res.json({ success: !!member });
});

// ============ OFFICE API ============

app.get('/api/office', (req, res) => {
  res.json({ office: state.office, timestamp: new Date().toISOString() });
});

app.put('/api/office/:id', (req, res) => {
  const { id } = req.params;
  const station = state.office.find(s => s.id === id);
  if (station) {
    Object.assign(station, req.body);
    broadcast({ type: 'office_update', station });
  }
  res.json({ success: !!station });
});

// ============ MEMORIES API ============

app.get('/api/memories', (req, res) => {
  const query = req.query.q?.toLowerCase();
  let memories = state.memories;
  
  if (query) {
    memories = memories.filter(m => 
      m.title.toLowerCase().includes(query) || 
      m.content.toLowerCase().includes(query)
    );
  }
  
  res.json({ memories, timestamp: new Date().toISOString() });
});

app.post('/api/memories', (req, res) => {
  const memory = {
    id: 'mem-' + Date.now(),
    ...req.body,
    timestamp: Date.now()
  };
  state.memories.unshift(memory); // Add to top
  broadcast({ type: 'memory_update', memory });
  res.json({ success: true, memory });
});

// ============ EXISTING API (keep for compatibility) ============

app.get('/api/status', (req, res) => {
  const agentsOnline = Object.values(state.agents).filter(a => a.status !== 'offline').length;
  res.json({
    status: 'healthy',
    uptime: Date.now() - state.lastUpdate,
    agentsOnline: state.team.filter(t => t.status === 'working').length,
    agentsTotal: state.team.length,
    tasksActive: state.tasks_board.filter(t => t.status === 'in_progress').length,
    alerts: state.alerts.length,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/agents', (req, res) => {
  res.json({ agents: Object.values(state.agents), timestamp: new Date().toISOString() });
});

app.get('/api/tasks', (req, res) => {
  res.json({ tasks: Object.values(state.tasks), timestamp: new Date().toISOString() });
});

app.get('/api/lessons', (req, res) => {
  res.json({ lessons: state.lessons, timestamp: new Date().toISOString() });
});

app.get('/api/hard_stops', (req, res) => {
  res.json({ pending: state.hardStops, timestamp: new Date().toISOString() });
});

app.post('/api/agent_update', (req, res) => {
  const { agent, ...update } = req.body;
  if (state.agents[agent]) {
    Object.assign(state.agents[agent], update);
    state.agents[agent].lastUpdate = Date.now();
    broadcast({ type: 'agent_update', agent, data: state.agents[agent] });
  }
  res.json({ success: true });
});

// Serve dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
server.listen(PORT, () => {
  console.log(`\n🎯 MISSION CONTROL v3.0 starting...`);
  console.log(`   Dashboard: http://localhost:${PORT}`);
  console.log(`   Components: Tasks Board | Content Pipeline | Calendar | Memory | Team | Office\n`);
});

module.exports = { app, server, wss, state };
