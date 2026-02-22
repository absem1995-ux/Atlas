# Morgan's Hiring Controls — Admin Panel

**For:** Morgan (COO)
**Updated:** 2026-02-19
**Scope:** Complete agent hiring/firing for all clients

---

## QUICK COMMANDS

### Hire an Agent
```
"Morgan, hire [agent-name] for [client-name]"
```
Example: "Morgan, hire Luna for Acme Corp"

**What happens:**
1. Morgan checks: Is agent available? Is client tier appropriate? Budget OK?
2. If ✅: Spawns agent, creates Telegram bot, adds to deployment
3. If ❌: Explains why and suggests alternative

### Fire an Agent
```
"Morgan, fire [agent-name] from [client-name]"
```
Example: "Morgan, fire Scout from Acme Corp"

**What happens:**
1. Morgan checks: Is agent active? Any dependencies?
2. If ✅: Terminates session, deactivates bot, processes refund
3. If ❌: Explains why

### Recommend a Team
```
"Morgan, recommend a team for [client-name] with budget $[X]"
```
Example: "Morgan, recommend a team for StartupXYZ with budget $8000"

**What happens:**
1. Morgan analyzes client needs
2. Recommends optimal agent mix within budget
3. Shows cost breakdown
4. Awaits approval

### Upgrade Tier
```
"Morgan, upgrade [client-name] to [tier]"
```
Example: "Morgan, upgrade Acme Corp to Growth tier"

**What happens:**
1. Morgan recommends agents to add
2. Shows new monthly cost
3. If approved, hires new agents automatically

### Check Team
```
"Morgan, show me the team for [client-name]"
```

**Returns:**
- Active agents
- Monthly cost
- Available budget
- Next review date

### Cost Projection
```
"Morgan, what's the cost if we add [agent-name] to [client-name]?"
```

**Returns:**
- Current cost
- Agent cost
- New total
- Budget impact

---

## HIRING APPROVAL LOGIC (What Morgan Checks)

### Before hiring an agent, Morgan verifies:

**1. Agent Availability**
```
Is [agent-name] below capacity limit?
  ✅ Agent can take on more clients
  ❌ Agent is at max capacity
```

**2. Tier Compatibility**
```
Is client tier >= agent minimum tier?
  ✅ Client tier supports this agent
  ❌ Client needs to upgrade first
```

**3. Budget Check**
```
Does client have budget remaining?
  ✅ Cost within remaining budget
  ❌ Client would exceed budget
```

**4. Dependency Check**
```
Are there agents this agent depends on?
  ✅ Dependencies already deployed
  ❌ Need to hire dependencies first
```

### Example Hiring Decision

**You:** "Morgan, hire Iris for Acme Corp"

**Morgan checks:**
```
✓ Iris capacity: 12 active, max 12... FULL
❌ Iris is at capacity. Cannot hire.

Alternative: Scout ($400/mo) can analyze visuals for you.
Or wait until Iris has capacity next week.
```

**You:** "OK, hire Scout instead"

**Morgan:**
```
✓ Scout available (15 of 20 clients)
✓ Acme tier: Growth ✅
✓ Acme budget remaining: $2,000 ✅
✓ No dependencies

Approved! Hiring Scout for Acme Corp.
Cost: $400/mo
New total: $12,400/mo
Remaining budget: $1,600/mo

Spawning Scout session...
Creating Telegram bot @acme-scout...
Adding to DEPLOYMENT.json...
Scout activated. Ready to start.
```

---

## AGENT DEPLOYMENT DECISIONS

### Decision Tree: "Should We Hire This Agent?"

```
Client requests: Hire [Agent]

Is agent available?
├─ YES → Continue
└─ NO → STOP. Agent at capacity. Suggest alternative.

Is tier appropriate?
├─ YES → Continue
└─ NO → STOP. Client needs to upgrade tier first.

Does client have budget?
├─ YES → Continue
└─ NO → STOP. Client would exceed budget. Suggest:
        a) Upgrade budget
        b) Fire different agent
        c) Different agent (cheaper)

Are dependencies met?
├─ YES → HIRE
└─ NO → STOP. Need to hire [dependency] first.
        Approve hiring dependency?
```

---

## FIRING APPROVAL LOGIC

### Before firing an agent, Morgan verifies:

**1. Agent Active?**
```
Is [agent-name] currently deployed for [client-name]?
  ✅ Agent is active, can be fired
  ❌ Agent not deployed, nothing to fire
```

**2. Dependencies?**
```
Does any other agent depend on this agent?
  ✅ No dependencies, safe to fire
  ❌ Other agents depend on this agent
     Fire them first? Or find alternative?
```

**3. Active Work?**
```
Does agent have active projects?
  ✅ Can archive and fire
  ❌ Wait until project complete? Or kill it?
```

### Firing Process

**You:** "Morgan, fire Echo from Acme Corp"

**Morgan checks:**
```
✓ Echo active for Acme? YES
✓ Any dependencies? River and Mirror depend on Echo for support tier.
  Options:
  a) Fire all three ($500 + $400 + $400 = $1,300 refund)
  b) Keep River and Echo, fire Mirror only ($400 refund)

What would you like?
```

**You:** "Fire all three"

**Morgan:**
```
Confirmed. Firing Echo, River, Mirror.

Terminating sessions...
Deactivating bots @acme-echo, @acme-river, @acme-mirror...
Archiving lessons to client workspace...
Updating DEPLOYMENT.json...
Processing refund: $1,300 (prorated to today)

Acme Corp now:
- Cost reduced: $12,000 → $10,700/mo
- Budget increased: $0 → $1,300/mo
- Agent count: 16 → 13

Complete.
```

---

## TIER MANAGEMENT

### Upgrade Decision: Startup → Growth

**You:** "Morgan, Acme wants Growth tier"

**Morgan:**
```
Current: Startup tier, 6 agents, $5,000/mo

Growth tier additions recommended:
├─ Casey (Head of Support) — $1,500
├─ Quinn (Chief Strategist) — $1,500
├─ Iris (Visual Designer) — $600
├─ Scout (Trend Analyst) — $400
├─ Spark (Automation Engineer) — $500
├─ Echo (Tier 2 Specialist) — $500
├─ Prism (Messaging Designer) — $400
├─ Bridge (Team Facilitator) — $450
├─ Mirror (Customer Researcher) — $400
└─ Lens (Efficiency Monitor) — $300

New total: $12,000/mo (within Growth pricing)

Proceed with upgrade?
```

**You:** "Yes"

**Morgan:**
```
Upgrading Acme to Growth tier...

Hiring 10 new agents:
✓ Casey: @acme-casey
✓ Quinn: @acme-quinn
✓ Iris: @acme-iris
✓ Scout: @acme-scout
✓ Spark: @acme-spark
✓ Echo: @acme-echo
✓ Prism: @acme-prism
✓ Bridge: @acme-bridge
✓ Mirror: @acme-mirror
✓ Lens: @acme-lens

Deployment complete. New team: 16 agents.
```

### Downgrade Decision: Growth → Custom

**You:** "Morgan, Acme budget cut. Back to $7,000/mo"

**Morgan:**
```
Current: Growth tier, 16 agents, $12,000/mo
Target: Custom tier, $7,000/mo max

Firing recommendations (to save money):
├─ Compass (Stakeholder Mgr) — $500
├─ Bridge (Team Facilitator) — $450
├─ Echo (Tier 2 Specialist) — $500
├─ Spark (Automation Eng) — $500
├─ Iris (Visual Designer) — $600
├─ Scout (Trend Analyst) — $400
├─ Mirror (Customer Researcher) — $400

Total savings: $3,350/mo
New cost: $8,650 → need to save $1,650 more.

Option 1: Also fire Quinn ($1,500) = $5,150/mo cost
Option 2: Also fire Prism ($400) + Lens ($300) = $6,950/mo
Option 3: Custom mix - which agents matter most?
```

**You:** "Do Option 2. Keep Quinn and most support."

**Morgan:**
```
Downgrades Acme to custom tier...

Firing 8 agents (saving $3,350 + $700):
✓ Compass, Bridge, Echo, Spark, Iris, Scout, Mirror, Prism, Lens

Acme team now:
- Morgan, Kai, Riley, Casey, Quinn
- Luna, Forge, River
- Total: 8 agents
- New cost: $6,950/mo
- Refund: $3,050 (prorated)

Deployment complete.
```

---

## COST TRACKING

Morgan tracks for each client:

```
Client: [Name]
├─ Tier: [Current tier]
├─ Monthly budget: $[X]
├─ Agents deployed: [List of 5-17]
├─ Current cost: $[Y]
├─ Budget remaining: $[Z]
├─ Cost trend: ↑ ↓ →
└─ Next review: [Date]
```

### Monthly Cost Report (Morgan Generates)

```
MONTHLY COST SUMMARY

Total across all clients: $[X]
├─ Startup tier clients: [N] clients, $[Y]/mo total
├─ Growth tier clients: [N] clients, $[Y]/mo total
├─ Enterprise clients: [N] clients, $[Y]/mo total
└─ Custom tier clients: [N] clients, $[Y]/mo total

Agent utilization:
├─ Morgan: [N]/20 clients (80% utilized)
├─ Kai: [N]/10 clients (90% utilized)
├─ [etc for all agents]

Capacity alerts:
├─ [Agent] at capacity: 12/12 clients (recommend hiring second instance)
├─ [Agent] underutilized: 2/20 clients (can add more)
```

---

## SPECIAL SCENARIOS

### Client Leaves (Firing All Agents)

**You:** "Morgan, we lost Acme Corp. Fire everyone."

**Morgan:**
```
Acme Corp departure protocol:

Firing ALL agents (16 total):
Morgan, Kai, Riley, Casey, Quinn, Luna, Iris, Scout, Forge, Spark, Lens, River, Echo, Mirror, Prism, Bridge

Terminating sessions...
Deactivating all Telegram bots (@acme-*)...
Archiving all lessons to archive folder...
Processing refund: $12,000 (prorated)

Acme Corp completely removed.
```

### Agent Upgrade (Sub-agent Becomes Lead)

**You:** "Morgan, Luna has been amazing. Can she become a lead agent?"

**Morgan:**
```
Luna's current status: Sub-agent ($500/mo)
Request: Promote to Lead Agent level

Recommendation: Luna is ready.
New status: Lead Creative Writer Agent
New cost: $1,200/mo
New capacity: 8 clients

Impacts:
- All current Luna clients: +$700/mo each
- New PERSONALITY.md reflects lead status
- Can hire own sub-agents (writers, copy editors)

Proceed?
```

---

## MORGAN'S COMMANDS (Full List)

| Command | Effect |
|---------|--------|
| `hire [agent] for [client]` | Spawn agent for client |
| `fire [agent] from [client]` | Terminate agent session |
| `recommend team for [client] budget $[X]` | Suggest optimal agent mix |
| `upgrade [client] to [tier]` | Move to higher tier |
| `downgrade [client] to [tier]` | Move to lower tier |
| `show team for [client]` | List active agents |
| `cost if we add [agent]` | Show cost impact |
| `cost report [month]` | Generate cost summary |
| `agent capacity` | Show utilization |
| `client list` | Show all clients |
| `client details [name]` | Show client info |
| `fire all for [client]` | Terminate all agents |

---

## APPROVAL WORKFLOW

**For any hiring/firing:**

```
Morgan makes recommendation
         ↓
You approve or deny
         ↓
If approved:
  → Morgan executes
  → Updates records
  → Notifies team
         ↓
Complete
```

---

**Morgan is the hiring manager. All agent deployments flow through these controls.**
