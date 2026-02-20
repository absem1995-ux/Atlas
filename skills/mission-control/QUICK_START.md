# Mission Control Quick Start

Real-time multi-agent dashboard. **3-minute setup.**

---

## Installation

```bash
cd skills/mission-control
npm install
```

---

## Start Server

```bash
npm start
```

Output:
```
✅ Dashboard: http://localhost:3500
✅ WebSocket: ws://localhost:3500/ws
✅ API: http://localhost:3500/api/
```

---

## Open Dashboard

```
http://localhost:3500
```

You should see:
- Command Center tab (all agents)
- System status indicator
- Empty agent list (no agents reporting yet)

---

## Integrate First Agent

In your agent code, add status update:

```javascript
// After agent completes a task
fetch('http://localhost:3500/api/agent_update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agent: 'atlas',
    status: 'active',
    currentTask: 'Generate posts',
    progress: 0.5
  })
});
```

**Dashboard updates in real-time.**

---

## Quick API Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/status` | GET | System health |
| `/api/agents` | GET | All agents |
| `/api/tasks` | GET | Active tasks |
| `/api/lessons` | GET | Recent learnings |
| `/api/hard_stops` | GET | Pending decisions |
| `/api/agent_update` | POST | Agent publishes status |
| `/api/task_progress` | POST | Update task progress |
| `/api/hard_stops/:id/decision` | POST | Approve/deny decision |

---

## Environment Variables

Create `.env`:
```bash
MC_PORT=3500
NODE_ENV=production
MC_API_TOKEN=optional-secret
```

---

## Testing

```bash
node tests/test-mission-control.js
```

Verifies all endpoints work.

---

## Common Tasks

### See all agents
```bash
curl http://localhost:3500/api/agents
```

### Check system status
```bash
curl http://localhost:3500/api/status
```

### View recent lessons
```bash
curl http://localhost:3500/api/lessons?days=7
```

### Approve a hard stop decision
Click button on dashboard or:
```bash
curl -X POST http://localhost:3500/api/hard_stops/hs-001/decision \
  -H "Content-Type: application/json" \
  -d '{"decision": "approve", "reason": "Budget spike expected"}'
```

---

## Troubleshooting

**Dashboard not loading:**
```bash
curl http://localhost:3500
```

**Check port:**
```bash
lsof -i :3500
```

**See logs:**
```bash
node src/server.js  # Run in foreground
```

---

## Next Steps

1. ✅ Server running
2. ✅ Dashboard loading
3. → Integrate agents (add `/api/agent_update` calls)
4. → Monitor in real-time
5. → Deploy to production (see ADVANCED.md)

---

For full documentation, see **SKILL.md**.
