# Multi-Agent Deployment Guide

## What You Have

Complete, production-ready multi-agent system with 5 specialized agents:

1. **Atlas** — Marketing automation (social media, content, scheduling)
2. **Astra** — Operations automation (tasks, workflows, scheduling, optimization)
3. **Sentinel** — Support automation (tickets, triage, escalation, SLA tracking)
4. **Email** — Communications automation (campaigns, templates, engagement)
5. **COO** — Governance and oversight (approvals, hard stops, system health)

## File Structure

```
agents/
├── atlas/
│   ├── SKILL.md
│   ├── lessons.md
│   ├── package.json
│   ├── scripts/ (8 scripts)
│   ├── lib/ (6 utilities)
│   ├── config/ (3 templates)
│   └── references/ (4 docs)
│
├── astra/
│   ├── SKILL.md
│   ├── lessons.md
│   ├── package.json
│   ├── scripts/ (4 scripts)
│   ├── config/astra-config.json
│   └── references/
│
├── sentinel/
│   ├── SKILL.md
│   ├── lessons.md
│   ├── package.json
│   ├── scripts/ (4 scripts)
│   ├── config/sentinel-config.json
│   └── references/
│
├── email/
│   ├── SKILL.md
│   ├── lessons.md
│   ├── package.json
│   ├── scripts/ (4 scripts)
│   ├── config/email-config.json
│   └── references/
│
├── coo/
│   ├── SKILL.md
│   ├── lessons.md
│   ├── package.json
│   ├── scripts/ (5 scripts)
│   ├── config/coo-config.json
│   └── references/
│
└── [Supporting files]
    ├── SYSTEM_OVERVIEW.md
    ├── SELF_OPTIMIZATION_INTEGRATION.md
    ├── QUICK_START_LESSONS.md
    └── NEW_AGENT_SCAFFOLD.md

skills/
└── self-optimizer/
    ├── SKILL.md
    ├── package.json
    ├── references/
    │   ├── LESSON_CAPTURE_PROTOCOL.md
    │   └── AGENT_LESSONS_TEMPLATE.md
    └── _meta.json
```

## Deployment Steps

### Step 1: Extract Files

Unzip the deployment package to your workspace:

```bash
unzip multi-agent-deployment.zip
cd agents
ls -la
# Should see: atlas/ astra/ sentinel/ email/ coo/
```

### Step 2: Configure Each Agent

Each agent has a config template. Copy and customize:

```bash
# Atlas
cp agents/atlas/config/atlas-config.template.json agents/atlas/config/atlas-config.json
# Edit with your API keys, settings

# Astra
cp agents/astra/config/astra-config.json.template agents/astra/config/astra-config.json
# Edit settings

# Sentinel
cp agents/sentinel/config/sentinel-config.json.template agents/sentinel/config/sentinel-config.json
# Edit thresholds, integrations

# Email
cp agents/email/config/email-config.json.template agents/email/config/email-config.json
# Edit API keys, templates

# COO
cp agents/coo/config/coo-config.json.template agents/coo/config/coo-config.json
# Edit budgets, limits, hard stops
```

### Step 3: Set Environment Variables

Create `.env` file in root:

```bash
# Atlas
export OPENAI_API_KEY="sk-..."
export POSTIZ_API_KEY="..."
export GOOGLE_CALENDAR_API_KEY="..."

# Email
export SENDGRID_API_KEY="..."

# Sentinel
export LINEAR_API_KEY="..."

# Add any other API keys needed
```

### Step 4: Verify Installation

Each agent can run standalone:

```bash
# Test Atlas
cd agents/atlas
npm install  # Install dependencies
npm start    # Run main script

# Test Astra
cd agents/astra
npm install
npm start

# Test others similarly
```

### Step 5: Initialize Lessons System

Each agent starts with lessons.md. Verify they exist:

```bash
# Check all agents have lessons files
for agent in atlas astra sentinel email coo; do
  if [ -f "agents/$agent/lessons.md" ]; then
    echo "✅ $agent: lessons.md exists"
  else
    echo "❌ $agent: lessons.md MISSING"
  fi
done
```

### Step 6: Set Up COO Oversight

COO oversees all agents. Configure:

```bash
# Edit agents/coo/config/coo-config.json
# Set:
# - Approval thresholds
# - Hard stop levels
# - Budget caps
# - Rate limits per agent
# - Lesson collection frequency

# Test COO can read all agent lessons
node agents/coo/scripts/coo-lesson-collector.js
# Should output: Found lessons from Atlas, Astra, Sentinel, Email
```

### Step 7: Deploy to Production

Once verified locally, deploy:

```bash
# Option A: Docker
docker build -t multi-agent-system .
docker run -e OPENAI_API_KEY="..." multi-agent-system

# Option B: Manual
npm install  # Install all dependencies
node agents/atlas/scripts/atlas-generate-content.js
node agents/astra/scripts/astra-task-dispatcher.js
# ... etc for each agent

# Option C: Managed (e.g., systemd, supervisor)
# Create systemd unit for each agent
# or use process manager like PM2
```

## Testing Each Agent

### Atlas (Marketing)

```bash
# Generate content
node agents/atlas/scripts/generate-content.js

# Schedule posts
node agents/atlas/scripts/schedule-posts.js

# Collect analytics
node agents/atlas/scripts/collect-analytics.js

# Check lessons
cat agents/atlas/lessons.md
```

### Astra (Operations)

```bash
# Dispatch a task
node agents/astra/scripts/astra-task-dispatcher.js

# Check lessons
cat agents/astra/lessons.md
```

### Sentinel (Support)

```bash
# Intake a ticket
node agents/sentinel/scripts/sentinel-ticket-intake.js

# Check lessons
cat agents/sentinel/lessons.md
```

### Email (Communications)

```bash
# Send campaign
node agents/email/scripts/email-campaign-manager.js

# Check lessons
cat agents/email/lessons.md
```

### COO (Governance)

```bash
# Collect all lessons
node agents/coo/scripts/coo-lesson-collector.js

# Check system health
node agents/coo/scripts/coo-system-monitor.js

# Check enforcement
node agents/coo/scripts/coo-hard-stop-enforcer.js
```

## Configuration Checklist

- [ ] All `.env` variables set (API keys, secrets)
- [ ] All agent configs customized (thresholds, limits)
- [ ] COO hard stops configured
- [ ] Budget caps set per environment (dev vs prod)
- [ ] Lesson collection enabled
- [ ] Monitoring/alerting configured
- [ ] Backup strategy for state files

## Deployment Checklist

- [ ] All agents tested individually
- [ ] All agents can read self-optimizer skill
- [ ] COO can collect lessons from all agents
- [ ] Hard stops enforced correctly
- [ ] Approval workflow tested
- [ ] Escalation path clear
- [ ] Monitoring dashboard set up
- [ ] Logging enabled
- [ ] Backup of config files

## Running the System

### Local Development

```bash
# Run all agents in foreground for debugging
node agents/atlas/scripts/atlas-task-dispatcher.js &
node agents/astra/scripts/astra-task-dispatcher.js &
node agents/sentinel/scripts/sentinel-task-dispatcher.js &
node agents/email/scripts/email-dispatcher.js &
node agents/coo/scripts/coo-approval-engine.js &

# Monitor output
tail -f agents/*/logs/*.log
```

### Production

```bash
# Use process manager (PM2 recommended)
pm2 start agents/atlas/scripts/atlas-task-dispatcher.js --name atlas
pm2 start agents/astra/scripts/astra-task-dispatcher.js --name astra
pm2 start agents/sentinel/scripts/sentinel-ticket-intake.js --name sentinel
pm2 start agents/email/scripts/email-campaign-manager.js --name email
pm2 start agents/coo/scripts/coo-approval-engine.js --name coo

# Monitor
pm2 monit
pm2 logs

# Setup auto-restart on boot
pm2 startup
pm2 save
```

## Success Criteria

After deployment, verify:

- ✅ **Atlas**: Can generate and schedule content
- ✅ **Astra**: Can dispatch and execute tasks
- ✅ **Sentinel**: Can intake and triage support tickets
- ✅ **Email**: Can send campaigns and track engagement
- ✅ **COO**: Can collect lessons, enforce hard stops, approve actions
- ✅ **Self-Optimizer**: All agents capturing lessons
- ✅ **Lessons propagation**: COO sharing lessons across agents
- ✅ **Hard stops enforced**: Prevent violations at runtime
- ✅ **Monitoring**: System health tracked and reported

## Troubleshooting

### Agent won't start

```bash
# Check Node.js installed
node --version

# Check dependencies installed
cd agents/<agent-name>
npm install

# Check config file exists
ls config/<agent-name>-config.json

# Check logs
cat logs/<agent-name>.log
```

### API integration failing

```bash
# Verify API keys in .env
echo $OPENAI_API_KEY

# Check mock mode is enabled (for testing)
grep mockMode agents/<agent>config/<agent>-config.json

# Test API call manually
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

### Lessons.md not updating

```bash
# Verify lessons.md file exists
ls agents/*/lessons.md

# Check COO collector can read it
node agents/coo/scripts/coo-lesson-collector.js

# Check permissions
chmod 644 agents/*/lessons.md
```

### Hard stops not enforcing

```bash
# Verify hard_stops.json exists
ls agents/coo/config/hard_stops.json

# Check hard stop enforcement is enabled
grep "enforced" agents/coo/config/coo-config.json

# Test hard stop manually
node agents/coo/scripts/coo-hard-stop-enforcer.js
```

## Next Steps

1. **Customize each agent** for your specific use case
2. **Add your business rules** to hard stops
3. **Set up monitoring** and alerting
4. **Deploy to production** gradually (canary deployment)
5. **Monitor lessons** and metrics daily
6. **Iterate** based on real-world performance

## Support

Refer to:
- `agents/SYSTEM_OVERVIEW.md` — System architecture
- `agents/QUICK_START_LESSONS.md` — Self-optimizer guide
- Each agent's `SKILL.md` — Agent-specific documentation
- `skills/self-optimizer/SKILL.md` — Self-optimization framework

---

**Deployment Package Version:** 1.0.0
**Created:** 2026-02-19
**Status:** Production Ready
