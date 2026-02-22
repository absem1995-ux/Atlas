# Mission Control Dashboard

Real-time unified monitoring of all agents, tasks, performance, and decisions.

**Status:** Production Ready (v1.0.0)

## Features

- 🟢 **Command Center** — Real-time agent status
- 📊 **Task Board** — Multi-step workflow tracking
- 📈 **Analytics** — Performance metrics (views, engagement, costs)
- 🧠 **Lessons** — Auto-captured agent learnings
- ⚠️ **Hard Stops** — Approval decisions, budget overages

## Quick Start

```bash
npm install
npm start
# http://localhost:3500
```

## Integration

Agent publishes status:
```javascript
fetch('http://localhost:3500/api/agent_update', {
  method: 'POST',
  body: JSON.stringify({
    agent: 'atlas',
    status: 'active',
    currentTask: 'Generate posts',
    progress: 0.5
  })
});
```

Dashboard updates in real-time.

## Documentation

- **QUICK_START.md** — 3-minute setup
- **SKILL.md** — Complete API reference
- **ADVANCED.md** — Advanced configuration
- **INTEGRATION.md** — Agent integration patterns

## Architecture

```
Dashboard (WebSocket)
  ↓
Express Server + REST API
  ↓
Agents (Publish Status)
```

## Performance

- Latency: <50ms (REST), <100ms (WebSocket)
- Throughput: 10K+ req/sec
- Capacity: 1000+ concurrent connections

## License

MIT
