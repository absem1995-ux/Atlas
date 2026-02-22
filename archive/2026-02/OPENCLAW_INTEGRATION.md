# OpenClaw Integration Guide — Agent System

**For:** Integrating Morgan + Atlas/Astra/Sentinel/Quinn into OpenClaw systems
**Based on:** OpenClaw Configuration Reference v1.0+
**Updated:** 2026-02-19

---

## OpenClaw Config Locations

**System config:** `~/.openclaw/openclaw.json`
**Client workspace:** `~/.openclaw/workspace/`
**Agent files:** `~/.openclaw/workspace/agents/`

---

## CONFIG SECTIONS FOR AGENT SYSTEM

### 1. Channels Section (Telegram Integration)

OpenClaw supports multiple channels. For agents, we use Telegram.

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "YOUR_BOT_TOKEN_HERE",
      
      // DM Policy: How to handle direct messages
      // "pairing" - Unknown users get code, owner approves (default, secure)
      // "allowlist" - Only listed users allowed
      // "open" - Allow all (not recommended)
      // "disabled" - Block all DMs
      dmPolicy: "pairing",
      
      // Who can DM the bot (when pairing mode)
      allowFrom: ["tg:OWNER_TELEGRAM_ID"],
      
      // Group settings
      groups: {
        "*": {
          requireMention: true,  // Bot only responds when mentioned
        }
      },
      
      // History to keep (default: 50)
      historyLimit: 50,
      
      // How to handle message replies
      // "off" - Don't use reply feature
      // "first" - Reply only to first message
      // "all" - Reply to all messages
      replyToMode: "first",
      
      // Stream mode for long responses
      // "off" - Send complete response
      // "partial" - Stream as it's generated
      // "block" - Block until ready, then send
      streamMode: "partial",
      
      // Link preview (embeds in Telegram)
      linkPreview: true,
      
      // Max file size
      mediaMaxMb: 5,
      
      // Retry policy for failed sends
      retry: {
        attempts: 3,
        minDelayMs: 400,
        maxDelayMs: 30000,
        jitter: 0.1,
      }
    }
  }
}
```

### 2. Agents Section (Multi-Agent Setup)

If running multiple agents, register them:

```json5
{
  agents: {
    list: [
      {
        id: "morgan",
        default: true,  // Morgan is the default/main agent
        workspace: "~/.openclaw/workspace"
      },
      {
        id: "atlas",
        workspace: "~/.openclaw/workspace/agents/atlas"
      },
      {
        id: "astra",
        workspace: "~/.openclaw/workspace/agents/astra"
      },
      {
        id: "sentinel",
        workspace: "~/.openclaw/workspace/agents/sentinel"
      },
      {
        id: "quinn",
        workspace: "~/.openclaw/workspace/agents/quinn"
      }
    ]
  }
}
```

### 3. Bindings Section (Route to Correct Agent)

Maps channels to agents (advanced):

```json5
{
  bindings: [
    {
      agentId: "morgan",
      match: {
        channel: "telegram",
        text: ["morgan", "team status", "hire", "fire"]
      }
    },
    {
      agentId: "atlas",
      match: {
        channel: "telegram",
        text: ["atlas", "content", "campaign", "creative"]
      }
    },
    {
      agentId: "astra",
      match: {
        channel: "telegram",
        text: ["astra", "process", "workflow", "optimize"]
      }
    },
    {
      agentId: "sentinel",
      match: {
        channel: "telegram",
        text: ["sentinel", "support", "ticket", "customer"]
      }
    },
    {
      agentId: "quinn",
      match: {
        channel: "telegram",
        text: ["quinn", "strategy", "messaging", "align"]
      }
    }
  ]
}
```

### 4. Storage Section (For Agent State)

Agents need to persist lessons and state:

```json5
{
  storage: {
    type: "file",  // or "sqlite"
    path: "~/.openclaw/workspace/agents",
    
    // Auto-backup
    backup: {
      enabled: true,
      interval: 86400  // 24 hours in seconds
    }
  }
}
```

### 5. Gateway Section (Heartbeat & Monitoring)

For agent health monitoring:

```json5
{
  gateway: {
    // How often to check agent health (seconds)
    heartbeatSeconds: 60,
    
    // Timeout before considering agent dead
    heartbeatTimeoutSeconds: 30,
    
    // Log level
    logLevel: "info",  // debug | info | warn | error
    
    // Enable agent monitoring
    monitoring: {
      enabled: true,
      metricsPort: 9090
    }
  }
}
```

### 6. Skills & Workspace Section

For skills discovery:

```json5
{
  workspace: {
    // Where skills are located
    skillsPath: "~/.openclaw/workspace/skills",
    
    // Where agents are located
    agentsPath: "~/.openclaw/workspace/agents",
    
    // Lesson storage
    lessonsPath: "~/.openclaw/workspace/agents/*/lessons.md"
  }
}
```

---

## Complete Config Example

```json5
{
  // Channels configuration
  channels: {
    telegram: {
      enabled: true,
      botToken: "YOUR_MORGAN_BOT_TOKEN",
      dmPolicy: "pairing",
      allowFrom: ["tg:YOUR_ID"],
      groups: {
        "*": { requireMention: true }
      },
      historyLimit: 50,
      replyToMode: "first",
      streamMode: "partial",
      mediaMaxMb: 5
    }
  },

  // Multiple agents
  agents: {
    list: [
      { id: "morgan", default: true, workspace: "~/.openclaw/workspace" },
      { id: "atlas", workspace: "~/.openclaw/workspace/agents/atlas" },
      { id: "astra", workspace: "~/.openclaw/workspace/agents/astra" },
      { id: "sentinel", workspace: "~/.openclaw/workspace/agents/sentinel" },
      { id: "quinn", workspace: "~/.openclaw/workspace/agents/quinn" }
    ]
  },

  // Route messages to correct agent
  bindings: [
    { agentId: "morgan", match: { channel: "telegram", text: ["morgan", "team", "hire", "fire"] } },
    { agentId: "atlas", match: { channel: "telegram", text: ["atlas", "content", "campaign"] } },
    { agentId: "astra", match: { channel: "telegram", text: ["astra", "process", "optimize"] } },
    { agentId: "sentinel", match: { channel: "telegram", text: ["sentinel", "support", "ticket"] } },
    { agentId: "quinn", match: { channel: "telegram", text: ["quinn", "strategy", "messaging"] } }
  ],

  // Storage for agent state
  storage: {
    type: "file",
    path: "~/.openclaw/workspace/agents",
    backup: { enabled: true, interval: 86400 }
  },

  // Gateway monitoring
  gateway: {
    heartbeatSeconds: 60,
    logLevel: "info",
    monitoring: { enabled: true }
  }
}
```

---

## Setup Steps

### Step 1: Verify OpenClaw Config Format

```bash
# Check current config
openclaw config get

# Validate config
openclaw doctor

# If errors, try auto-fix
openclaw doctor --fix
```

### Step 2: Add Telegram Section

Use interactive setup:
```bash
openclaw configure
# Select: Telegram
# Enter bot token: YOUR_TOKEN
# Select: pairing
# Done
```

Or manually edit `~/.openclaw/openclaw.json`:
```bash
# Backup first
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.backup

# Edit config
nano ~/.openclaw/openclaw.json
# Add channels.telegram section above
```

### Step 3: Add Agents Section

Add to config:
```json5
"agents": {
  "list": [
    { "id": "morgan", "default": true, "workspace": "~/.openclaw/workspace" },
    { "id": "atlas", "workspace": "~/.openclaw/workspace/agents/atlas" },
    // ... etc
  ]
}
```

### Step 4: Add Bindings (Optional)

For routing different topics to different agents:
```json5
"bindings": [
  { "agentId": "morgan", "match": { "channel": "telegram", "text": ["morgan", "team", "hire"] } },
  // ... etc
]
```

### Step 5: Restart Gateway

```bash
# Validate config first
openclaw doctor

# Restart to apply changes
openclaw gateway restart

# Verify
openclaw status
```

---

## Testing Integration

### Test Telegram Channel

```bash
# 1. In Telegram, find your bot and send /start
# Bot should respond with introduction

# 2. Send a test message
# Monitor logs:
openclaw logs channel:telegram

# 3. Check config is active
openclaw config get channels.telegram
```

### Test Agent Routing

```bash
# Send message mentioning each agent in Telegram
# "Morgan, show me team status"
# "Atlas, create content"
# "Astra, optimize workflow"
# "Sentinel, support issue"
# "Quinn, strategy alignment"

# Monitor which agent responds:
openclaw logs agent:*

# All should route correctly based on keywords
```

### Test Lessons Storage

```bash
# Check lessons files are being created/updated
ls -la ~/.openclaw/workspace/agents/*/lessons.md

# Verify lessons are updating
tail -20 ~/.openclaw/workspace/agents/atlas/lessons.md
# Should show recent activity

# Monitor storage
openclaw logs storage
```

---

## Multi-Client Setup (Advanced)

If running multiple clients:

```bash
# Each client gets separate workspace
mkdir -p ~/.openclaw/workspaces/client-1
mkdir -p ~/.openclaw/workspaces/client-2

# Update config to use correct workspace
openclaw config set workspace ~/.openclaw/workspaces/client-1

# Or use environment variable
export OPENCLAW_WORKSPACE=~/.openclaw/workspaces/client-1
openclaw status
```

---

## Common Issues & Solutions

### Issue: "Bot not responding"

```bash
# Check channel is enabled
openclaw config get channels.telegram.enabled

# Check bot token is correct
openclaw config get channels.telegram.botToken

# Check Telegram channel logs
openclaw logs channel:telegram

# Try restart
openclaw gateway restart
```

### Issue: "Agent not found"

```bash
# Check agents are registered
openclaw config get agents.list

# Check workspace path exists
ls -la ~/.openclaw/workspace/agents/

# Verify agent files exist
ls -la ~/.openclaw/workspace/agents/morgan/PERSONALITY.md
```

### Issue: "Binding not routing correctly"

```bash
# Check bindings config
openclaw config get bindings

# Check logs to see which agent receives message
openclaw logs binding

# Verify agent is responding
# Test manually: send direct mention to @agent-name bot
```

### Issue: "Config validation error"

```bash
# Get detailed error
openclaw doctor

# Try auto-fix
openclaw doctor --fix

# Manual validation
openclaw config get | jq .  # Check JSON syntax

# Revert to backup if needed
cp ~/.openclaw/openclaw.json.backup ~/.openclaw/openclaw.json
```

---

## Environment Variables

Override config with env vars:

```bash
# Telegram bot token
export TELEGRAM_BOT_TOKEN="your-token"

# Workspace location
export OPENCLAW_WORKSPACE="~/.openclaw/workspace"

# Log level
export OPENCLAW_LOG_LEVEL="debug"

# Gateway host/port
export GATEWAY_HOST="localhost"
export GATEWAY_PORT="8080"
```

---

## Performance Tuning

### Optimize for Multiple Agents

```json5
{
  gateway: {
    // Increase message processing capacity
    maxConcurrentMessages: 50,
    
    // Batch process messages
    batchSize: 10,
    batchTimeoutMs: 100,
    
    // Connection pooling
    maxConnections: 100
  }
}
```

### Optimize Telegram Channel

```json5
{
  channels: {
    telegram: {
      // Reduce history to speed up lookups
      historyLimit: 20,
      
      // Disable preview for faster sends
      linkPreview: false,
      
      // Use partial streaming for long responses
      streamMode: "partial",
      
      // Cache responses
      cache: {
        enabled: true,
        ttlSeconds: 300
      }
    }
  }
}
```

---

## Security Best Practices

✅ **Do:**
- Use environment variables for bot tokens
- Enable `dmPolicy: "pairing"` for security
- Keep config file permissions: `chmod 600`
- Backup config before changes
- Use `allowFrom` to limit who can use bots
- Enable monitoring and logging

❌ **Don't:**
- Hardcode bot tokens in config
- Use `dmPolicy: "open"` in production
- Share config file with tokens visible
- Store backups without encryption
- Log sensitive information

---

## Validation Checklist

Before deploying to production:

- [ ] Config is valid: `openclaw doctor` passes
- [ ] All agents are registered: `openclaw config get agents.list`
- [ ] Telegram channel is enabled: `openclaw config get channels.telegram.enabled`
- [ ] Bot token is valid: `openclaw config get channels.telegram.botToken`
- [ ] DM policy is secure: `dmPolicy: "pairing"`
- [ ] Storage is configured: `openclaw config get storage`
- [ ] Gateway monitoring is enabled
- [ ] Backup exists: `~/.openclaw/openclaw.json.backup`
- [ ] Lessons paths are correct
- [ ] All agent workspaces exist

---

**Ready for integration? Start with Step 1 of Setup Steps above.**

🚀 **Integration checklist complete.**
