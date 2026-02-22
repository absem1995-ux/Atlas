# Agent System Deployment Checklist

**Version:** 1.0.0
**Date:** 2026-02-19
**For:** Deploying Morgan + Atlas/Astra/Sentinel/Quinn to Client OpenClaw Systems

---

## PRE-DEPLOYMENT (Your Setup)

### Prepare Agent Files

- [ ] Verify all agent files are complete:
  - [ ] `agents/morgan/` (PERSONALITY.md, lessons.md, ZERO_ERRORS.md, HIRING_CONTROLS.md, CONTROL_CENTER.md)
  - [ ] `agents/atlas/` (PERSONALITY.md, lessons.md, ZERO_ERRORS.md, SKILL_MAP.md)
  - [ ] `agents/astra/` (PERSONALITY.md, lessons.md, ZERO_ERRORS.md, SKILL_MAP.md)
  - [ ] `agents/sentinel/` (PERSONALITY.md, lessons.md, ZERO_ERRORS.md)
  - [ ] `agents/quinn/` (PERSONALITY.md, lessons.md, ZERO_ERRORS.md)

- [ ] All files committed to git:
  ```bash
  git status  # Should be clean
  git log --oneline -5  # Verify latest commit
  ```

### Package for Distribution

- [ ] Create deployment package:
  ```bash
  tar -czf agent-system-v1.tar.gz agents/
  ```

- [ ] Or create git bundle for easy transfer:
  ```bash
  git bundle create agent-system-v1.bundle --all
  ```

---

## CLIENT OPENCLAW SETUP

### Step 1: Verify Client OpenClaw Installation

**On client's machine:**

- [ ] OpenClaw is installed:
  ```bash
  openclaw --version  # Should print version
  which openclaw      # Should show path
  ```

- [ ] OpenClaw status is healthy:
  ```bash
  openclaw status
  ```
  Expected: "Gateway is running", "Status: healthy"

- [ ] Config file exists:
  ```bash
  ls -la ~/.openclaw/openclaw.json
  ```
  If missing: `openclaw onboard` to create it

### Step 2: Backup Existing Config

- [ ] Backup client's current config:
  ```bash
  cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.backup.$(date +%s)
  ```

- [ ] Store backup safely (send to client or secure location)

### Step 3: Extract Agent Files

- [ ] Extract agent system files to client's workspace:
  ```bash
  cd ~/.openclaw/workspace
  tar -xzf agent-system-v1.tar.gz
  # OR if using git bundle:
  git clone --bare agent-system-v1.bundle agents.git
  ```

- [ ] Verify extraction:
  ```bash
  ls -la agents/
  # Should show: morgan/, atlas/, astra/, sentinel/, quinn/
  ```

- [ ] Verify all PERSONALITY.md files exist:
  ```bash
  find agents/ -name "PERSONALITY.md" | wc -l
  # Should show: 5
  ```

---

## TELEGRAM BOT SETUP (For Each Agent)

### Step 4a: Create Telegram Bots (Morgan, Atlas, Astra, Sentinel, Quinn)

**For each agent, do this once:**

1. **Open Telegram**, message @BotFather
2. **Send:** `/newbot`
3. **Answer questions:**
   - Name: `[Client Name] Morgan` (or Atlas/Astra/Sentinel/Quinn)
   - Handle: `@[client-shortname]-morgan` (e.g., `@acme-morgan`)
4. **BotFather responds with token:** Copy this
5. **Save token** in a secure place (you'll need for config)

**Repeat for each agent (5 bots total):**
- Morgan: `@[client]-morgan`
- Atlas: `@[client]-atlas`
- Astra: `@[client]-astra`
- Sentinel: `@[client]-sentinel`
- Quinn: `@[client]-quinn`

**Telegram tokens look like:** `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`

---

## OPENCLAW CONFIG MODIFICATION

### Step 5: Update OpenClaw Config

**On client's machine, edit** `~/.openclaw/openclaw.json`

#### Option A: Interactive (Recommended)

```bash
openclaw configure
# Follow prompts to add channels
```

#### Option B: Manual Edit

Edit `~/.openclaw/openclaw.json` directly. Add/modify Telegram sections:

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "MORGAN_BOT_TOKEN_HERE",
      dmPolicy: "pairing",
      allowFrom: ["tg:OWNER_ID"],
      groups: {
        "*": { requireMention: true }
      },
      historyLimit: 50,
      replyToMode: "first",
      streamMode: "partial"
    }
  }
}
```

### Step 6: Multi-Agent Routing (Optional for Advanced Setup)

If client wants separate channels for each agent, use bindings:

```json5
{
  agents: {
    list: [
      { 
        id: "morgan",
        default: true,
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
  },
  bindings: [
    {
      agentId: "morgan",
      match: { channel: "telegram", botToken: "MORGAN_TOKEN" }
    },
    {
      agentId: "atlas",
      match: { channel: "telegram", botToken: "ATLAS_TOKEN" }
    },
    // ... repeat for other agents
  ]
}
```

### Step 7: Verify Config

- [ ] Check config is valid:
  ```bash
  openclaw doctor
  # Should show: "✅ Configuration is valid"
  ```

- If errors: `openclaw doctor --fix` to auto-repair

### Step 8: Apply Config & Restart

- [ ] Restart OpenClaw to apply changes:
  ```bash
  openclaw gateway restart
  ```

- [ ] Verify restart succeeded:
  ```bash
  openclaw status
  # Should show: "Gateway is running"
  ```

---

## AGENT INITIALIZATION

### Step 9: Initialize Morgan (First)

- [ ] Open Telegram, find **@[client]-morgan** bot
- [ ] Send: `/start`
- [ ] Morgan should respond with introduction
- [ ] Send: `Hi Morgan, here's my business: [client info]`

Expected Morgan response:
```
I'm Morgan. I need to understand your business.

1. What does your business do?
2. Who are your customers?
3. What's your biggest pain point?
4. What would success look like?
5. What's your budget per month?
```

- [ ] Client provides business information

- [ ] Morgan analyzes and recommends team:
```
Based on what you've told me, I recommend:
- Morgan (COO) - $2,000/mo
- Atlas (Creative) - $2,000/mo
- [Other agents] - $X/mo
Total: $Y/mo
Approve?
```

### Step 10: Deploy Recommended Team

- [ ] Client confirms: `Yes, deploy the team`

- [ ] Morgan hires all agents:
  ```
  ✅ Hiring Morgan...
  ✅ Hiring Atlas...
  ✅ Hiring Astra...
  ✅ Hiring Sentinel...
  ✅ Hiring Quinn...
  ✅ Team deployed!
  ```

### Step 11: Each Agent Introduces Themselves

- [ ] Check Telegram for new bots (should see @[client]-atlas, @[client]-astra, etc.)

- [ ] Each agent sends introduction via Telegram:

**From Atlas:**
```
Hi! I'm Atlas, your Creative Director.
I handle marketing, content strategy, and campaigns.
What would you like me to work on?
```

**From Astra:**
```
Hi! I'm Astra, your Operations Director.
I design workflows, eliminate bottlenecks, optimize processes.
What operations challenge should we tackle?
```

(Similar for Sentinel, Quinn, Morgan)

- [ ] Test each agent by sending a simple message:
  - Atlas: "Create a content strategy for [topic]"
  - Astra: "What's our biggest bottleneck?"
  - Sentinel: "Customer says [issue]"
  - Quinn: "How should we position [product]?"
  - Morgan: "Show me the team status"

---

## VERIFICATION & TESTING

### Step 12: Verify All Agents Active

```bash
# On client machine
openclaw status

# Should show all agents running with proper session info
```

### Step 13: Test ZERO_ERRORS Protocol

- [ ] Send each agent a complex question (tests verification logic)
- [ ] Agents should:
  - ✅ Verify before responding
  - ✅ Flag uncertain statements
  - ✅ Say "I don't know" when uncertain
  - ✅ Ask clarifying questions

### Step 14: Test Lessons System

- [ ] Each agent reads their lessons.md:
  ```bash
  ls -la agents/*/lessons.md
  # Should all exist
  ```

- [ ] Agents capture lessons during work (update happens automatically)

- [ ] Verify lessons updating:
  ```bash
  grep "Active Lessons" agents/atlas/lessons.md
  # Should show recent updates
  ```

### Step 15: Test Morgan's Control Center

- [ ] Message Morgan: `Show me the team for [client-name]`

Expected response:
```
TEAM STATUS:
├─ Atlas: ACTIVE
├─ Astra: ACTIVE
├─ Sentinel: ACTIVE
└─ Quinn: ACTIVE

Total cost: $X/mo
Budget remaining: $Y/mo
```

- [ ] Test hiring command: `Morgan, show me agent capacity`

---

## ONGOING OPERATIONS

### Step 16: Set Up Weekly Reviews

- [ ] Schedule Friday reviews with Morgan:
  ```
  Morgan, schedule a team review for Friday 5pm
  ```

- [ ] Morgan will:
  - Review each agent's work
  - Identify patterns
  - Report progress
  - Assign next week's priorities

### Step 17: Document Client Setup

- [ ] Create client record with:
  - Client name
  - OpenClaw system location
  - Telegram bots deployed
  - Agents active
  - Tier (Startup/Growth/Custom)
  - Monthly cost
  - Deployment date
  - Telegram group link (if created)

### Step 18: Create Client Workspace

- [ ] Set up client folder:
  ```bash
  mkdir -p ~/clients/[client-name]
  touch ~/clients/[client-name]/DEPLOYMENT.json
  ```

- [ ] DEPLOYMENT.json contents:
  ```json
  {
    "client": "[Client Name]",
    "deploymentDate": "2026-02-19",
    "tier": "Startup|Growth|Enterprise|Custom",
    "monthlyBudget": 5000,
    "agents": ["morgan", "atlas", "astra", "sentinel", "quinn"],
    "telegramBots": {
      "morgan": "@[client]-morgan",
      "atlas": "@[client]-atlas",
      "astra": "@[client]-astra",
      "sentinel": "@[client]-sentinel",
      "quinn": "@[client]-quinn"
    },
    "openclaw": {
      "location": "~/.openclaw",
      "configBackup": "~/.openclaw/openclaw.json.backup.[timestamp]"
    },
    "notes": "Client deployment notes..."
  }
  ```

---

## TROUBLESHOOTING

### Agent Not Responding

```bash
# Check if agent is running
openclaw status

# Check logs
openclaw logs agent:morgan

# Restart agent
openclaw gateway restart
```

### Telegram Bot Not Working

```bash
# Verify bot token is correct
openclaw config get channels.telegram.botToken

# Check Telegram bot exists (test in Telegram directly)
# If not responding, try:
openclaw configure  # Re-setup channel
openclaw gateway restart
```

### Config Validation Error

```bash
# Check what's wrong
openclaw doctor

# Auto-fix common issues
openclaw doctor --fix

# Or manually validate
openclaw config get  # View current config
```

### Agents Not Coordinating

- [ ] Verify all agents are active: `openclaw status`
- [ ] Check each agent's lessons.md is updating
- [ ] Verify Morgan can see all agents: `Morgan, show me the team`
- [ ] If stuck, try: `openclaw gateway restart`

---

## POST-DEPLOYMENT CHECKLIST

- [ ] All 5 agents deployed and active
- [ ] All Telegram bots created and responding
- [ ] OpenClaw config updated and restarted
- [ ] Each agent has read their PERSONALITY.md
- [ ] ZERO_ERRORS protocol verified (agents verify before output)
- [ ] Lessons system active (each agent has lessons.md)
- [ ] Morgan can hire/fire agents
- [ ] Client workspace documented
- [ ] Friday review scheduled
- [ ] Backup config saved

---

## CLIENT HANDOFF PACKAGE

Give client:

1. **Introduction Doc** (`SETUP_COMPLETE.md`)
   - How the system works
   - What each agent does
   - Quick start guide

2. **Agent Reference** (`AGENT_SYSTEM_GUIDE.md`)
   - How to work with each agent
   - What each owns/doesn't own
   - Communication patterns

3. **Morgan's Guide** (`agents/morgan/HIRING_CONTROLS.md`)
   - How to hire/fire agents
   - Cost management
   - Tier upgrades

4. **Telegram Group Link**
   - All 5 agent bots ready
   - Team coordination channel (optional)

5. **Support Contact**
   - How to reach you for help
   - Escalation process

---

## DEPLOYMENT STATS

| Item | Value |
|------|-------|
| Agents to deploy | 5 (Morgan, Atlas, Astra, Sentinel, Quinn) |
| Telegram bots needed | 5 |
| Config changes | ~20 lines (can use interactive `openclaw configure`) |
| Time to deploy | 30-45 minutes (first time) |
| Restart required | 1 (after config change) |
| Testing needed | ~15 minutes per agent |
| Total time | ~1.5-2 hours (first deployment) |

---

**Ready to deploy? Start with Step 1: PRE-DEPLOYMENT**

🚀 **Deployment checklist complete. Good luck!**
