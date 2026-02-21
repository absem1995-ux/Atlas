# Quick Deploy Reference — Agent System

**TL;DR:** Deploy Morgan + Atlas/Astra/Sentinel/Quinn to any OpenClaw system in 6 steps

---

## 60-Second Overview

| Component | What It Does | Time |
|-----------|------------|------|
| **Morgan** | Hires/fires agents, manages team | Always active |
| **Atlas** | Creative & marketing | On demand |
| **Astra** | Operations & workflows | On demand |
| **Sentinel** | Support & escalations | On demand |
| **Quinn** | Strategy & communications | On demand |

**Total:** 5 autonomous agents with learning + reliability + sub-agent spawning

---

## Deploy In 6 Steps

### STEP 1: Create Telegram Bots (5 minutes)

```
For each agent (Morgan, Atlas, Astra, Sentinel, Quinn):
  1. Message @BotFather on Telegram
  2. /newbot
  3. Name: "[Client] Morgan"
  4. Handle: "@[client-short]-morgan"
  5. Copy token (save all 5)
```

### STEP 2: Prepare Files (5 minutes)

```bash
cd ~/.openclaw/workspace
tar -xzf agent-system-v1.tar.gz
# OR
git clone agent-system-v1.bundle agents.git

# Verify
ls agents/morgan agents/atlas agents/astra agents/sentinel agents/quinn
```

### STEP 3: Backup Config (2 minutes)

```bash
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.backup.$(date +%s)
```

### STEP 4: Update OpenClaw Config (10 minutes)

**Option A: Interactive** (recommended)
```bash
openclaw configure
# Select: Telegram
# Enter: morgan bot token
# Done - repeat for other agents if desired
```

**Option B: Manual** (copy/paste one section)
```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "MORGAN_TOKEN_HERE",
      dmPolicy: "pairing",
      allowFrom: ["tg:OWNER_ID"],
      historyLimit: 50,
      streamMode: "partial"
    }
  },
  agents: {
    list: [
      { id: "morgan", default: true, workspace: "~/.openclaw/workspace" },
      { id: "atlas", workspace: "~/.openclaw/workspace/agents/atlas" },
      { id: "astra", workspace: "~/.openclaw/workspace/agents/astra" },
      { id: "sentinel", workspace: "~/.openclaw/workspace/agents/sentinel" },
      { id: "quinn", workspace: "~/.openclaw/workspace/agents/quinn" }
    ]
  }
}
```

### STEP 5: Validate & Restart (5 minutes)

```bash
# Check config
openclaw doctor
# Should show: ✅ Configuration is valid

# Restart
openclaw gateway restart

# Verify
openclaw status
# Should show: Gateway is running
```

### STEP 6: Deploy Team (20 minutes)

```
In Telegram:
  1. Message @[client]-morgan /start
  2. Tell Morgan about the business
  3. Morgan recommends team
  4. Say: "Yes, deploy"
  5. Morgan hires all agents
  6. Each agent introduces themselves
```

---

## That's It! ✅

Total time: **30-45 minutes per client**

---

## Verify Everything Works

```bash
# 1. All agents running
openclaw status
# Should see: morgan, atlas, astra, sentinel, quinn

# 2. Telegram bots responding
# Test in Telegram: "Morgan, show me team status"
# Morgan should respond with team overview

# 3. Each agent active
# Send to @[client]-atlas: "Create a content strategy"
# Send to @[client]-astra: "What's our biggest bottleneck?"
# Send to @[client]-sentinel: "How many support tickets today?"
# All should respond

# 4. Lessons system working
ls agents/*/lessons.md
# All should exist and be updating
```

---

## What Client Gets

✅ **5 Telegram bots:** One for each agent  
✅ **Team coordination:** All agents communicate  
✅ **Learning system:** Continuous improvement via lessons  
✅ **Reliability:** ZERO_ERRORS protocol embedded  
✅ **Management dashboard:** Morgan's control center  
✅ **Sub-agent capability:** Spawn specialists as needed

---

## File Reference

| File | Purpose | When |
|------|---------|------|
| `DEPLOYMENT_CHECKLIST.md` | Step-by-step guide | First time |
| `OPENCLAW_INTEGRATION.md` | Config reference | Setup questions |
| `SETUP_COMPLETE.md` | System overview | Show client |
| `agents/*/PERSONALITY.md` | Agent docs | Agent questions |
| `agents/ZERO_ERRORS.md` | Reliability | Technical review |

---

## Troubleshooting (30 seconds)

| Problem | Fix |
|---------|-----|
| "Bot not responding" | Restart: `openclaw gateway restart` |
| "Config error" | Validate: `openclaw doctor --fix` |
| "Agent not found" | Check: `openclaw config get agents.list` |
| "Lessons not updating" | Verify: `ls agents/*/lessons.md` |

---

## Success Criteria

- [ ] All 5 agents deployed
- [ ] All Telegram bots created
- [ ] OpenClaw restarted
- [ ] Morgan responds to messages
- [ ] Each agent introduces themselves
- [ ] Lessons files exist and updating
- [ ] Client ready to start using

---

## Next: Long-Term Operations

```
Every Friday:
  1. Message Morgan: "Team review"
  2. Morgan reviews all agents
  3. Reports progress + next week priorities
  4. Team improves continuously via lessons

Every Month:
  1. Check agent capacity
  2. Upgrade tier if needed (more agents)
  3. Review cost vs value
  4. Archive old lessons
```

---

## Client Checklist (What They Need)

Give them:
- [ ] Link to all 5 Telegram bots
- [ ] `SETUP_COMPLETE.md` (how system works)
- [ ] `agents/morgan/HIRING_CONTROLS.md` (how to hire/fire)
- [ ] Email support contact

---

**Ready? Start with STEP 1. See DEPLOYMENT_CHECKLIST.md for details.**

🚀
