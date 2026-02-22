# Multi-Agent System Overview

## Components

### 1. Core Agents (5 Specialized)

| Agent | Role | Responsibilities | Lessons Location |
|-------|------|------------------|-------------------|
| **Atlas** | Marketing | Content generation, scheduling, analytics | `agents/atlas/lessons.md` |
| **Astra** | Operations/VA | Task management, automation, scheduling | `agents/astra/lessons.md` |
| **Sentinel** | Support | Customer escalation, issue tracking | `agents/sentinel/lessons.md` |
| **Email** | Communications | Email campaigns, notifications, reminders | `agents/email/lessons.md` |
| **COO** | Governance | Oversight, approval, hard stops, coordination | `agents/coo/lessons.md` |

### 2. Cross-Cutting Skills

| Skill | Purpose | Location |
|-------|---------|----------|
| **self-optimizer** | Lesson capture, continuous improvement, pattern tracking | `skills/self-optimizer/` |
| **multi-agent** | Inter-agent communication, message routing, coordination | (To be built) |
| **hard-stops** | Governance enforcement, guardrails, approval workflows | (To be built) |

### 3. Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Message Queue** | Redis/Bull | Reliable inter-agent messaging |
| **Database** | PostgreSQL | State management, audit logs |
| **Config** | JSON/YAML | Environment variables, hard stops |
| **Monitoring** | TBD | Health checks, alerts, metrics |

---

## Self-Optimizer Integration

The self-optimizer skill is the core of the system's continuous improvement:

### Each Agent Has

1. **Lessons.md file** — Captures active lessons and patterns
2. **Lesson capture workflow** — Documents failures, successes, patterns
3. **Pattern tracking** — Monitors recurring issues
4. **Session startup review** — Reads lessons at start of each session

### COO Oversight

1. **Daily collection** — Reads all agent lessons
2. **Cross-agent propagation** — Shares relevant lessons across agents
3. **Pattern escalation** — Identifies system-wide patterns
4. **Hard stop creation** — Enforces lessons as hard stops

### Knowledge Flows

```
Atlas (learns) ──→ captures lesson ──→ COO (collects)
                                          ↓
                                    identifies pattern
                                    (if >3 occurrences)
                                          ↓
                              propagates to: Astra, Sentinel, Email
                                          ↓
Astra, Sentinel, Email
(benefit from learning)
    ↓
apply lesson
(prevent same failure)
```

---

## Hard Stops Framework (5 Levels)

Hard stops are enforced rules that prevent mistakes:

### Level 1: PREVENT (Never)
- Never post without metadata validation
- Never send without auth check
- Never escalate without documentation

### Level 2: REQUIRE APPROVAL
- Post to restricted account → COO approval required
- Email to >10 recipients → COO approval required
- Support escalation >tier 2 → COO approval required

### Level 3: NOTIFY
- Success rate drops below threshold → Alert COO
- New error type encountered → Alert COO
- Pattern emerges → Alert COO

### Level 4: RATE LIMIT
- Max 100 posts/day (Atlas)
- Max 1000 emails/day (Email)
- Max 50 escalations/day (Sentinel)

### Level 5: BUDGET LIMIT
- Daily spend: $100 cap
- Monthly spend: $2,000 cap
- At 80% budget → Stop operations, alert human

---

## How Lessons Become Hard Stops

```
Step 1: CAPTURE
  Agent encounters failure/pattern
  → Captures lesson in lessons.md

Step 2: TRACK
  Lesson appears 3+ times in 1 week
  → COO identifies pattern

Step 3: ESCALATE
  Pattern is recurring/critical
  → COO proposes hard stop

Step 4: ENFORCE
  Hard stop created in hard_stops.json
  → System enforces at runtime
  → Prevents future failures

Step 5: MONITOR
  Track hard stop effectiveness
  → Measure impact (failures prevented)
  → Archive if no longer needed
```

---

## System Architecture

```
┌────────────────────────────────────────────────────────┐
│                 External APIs                          │
│    OpenAI, Postiz, TikTok, Instagram, etc.           │
└────────────────────┬─────────────────────────────────┘
                     │
         ┌───────────┴──────────┐
         │                      │
    ┌────▼────────┐     ┌──────▼────┐
    │   Agents    │     │  Hard Stops│
    │  (5 total)  │     │ (Enforced) │
    └────┬────────┘     └──────┬────┘
         │                      │
         └───────────┬──────────┘
                     │
         ┌───────────▼──────────┐
         │  Message Queue       │
         │  (Redis/Bull)        │
         └───────────┬──────────┘
                     │
         ┌───────────▼──────────┐
         │  Database            │
         │  (PostgreSQL)        │
         │  - Messages          │
         │  - State             │
         │  - Audit logs        │
         └──────────────────────┘
                     │
         ┌───────────▼──────────┐
         │  Self-Optimizer      │
         │  (Lesson tracking)   │
         │  - Patterns          │
         │  - Cross-agent       │
         │  - Escalation        │
         └──────────────────────┘
```

---

## Communication Flow

### Message Format

All inter-agent messages use standardized JSON:

```json
{
  "id": "msg-unique-id",
  "from": "atlas",
  "to": "coo",
  "action": "request_approval",
  "payload": {
    "task": "schedule_post",
    "details": { ... }
  },
  "timestamp": "2026-02-18T14:30:00Z",
  "status": "pending|approved|rejected|completed"
}
```

### Message Flow Examples

#### Example 1: Post Approval
```
Atlas → wants to post 5 videos to TikTok
  ↓
Atlas sends: {from: "atlas", to: "coo", action: "request_approval", ...}
  ↓
COO receives message
  ↓
COO checks: metadata valid? account healthy? post limits ok?
  ↓
COO responds: {from: "coo", to: "atlas", status: "approved"}
  ↓
Atlas executes post
  ↓
Atlas captures lesson (if success/failure)
```

#### Example 2: Cross-Agent Learning
```
Atlas discovers lesson: "Post timing affects engagement"
  ↓
Atlas updates: agents/atlas/lessons.md
  ↓
COO collects daily: reads atlas/lessons.md
  ↓
COO identifies: lesson relevant to Astra, Email
  ↓
COO propagates: adds to astra/lessons.md, email/lessons.md
  ↓
Astra reads lesson at next session start
  ↓
Astra applies: considers timing for all VA tasks
```

---

## Deployment Phases

### Phase 1: Foundation (Week 1)
- Set up message queue
- Create database schema
- Build message handlers
- Test inter-agent messaging

### Phase 2: Agents (Week 2)
- Refactor Atlas to multi-agent format
- Build Astra, Sentinel, Email
- Implement self-optimizer integration
- Test agent communication

### Phase 3: Governance (Week 3)
- Implement COO logic
- Build approval workflows
- Add hard stops enforcement
- Create monitoring dashboard

### Phase 4: Production (Week 4)
- End-to-end testing
- Load testing
- Security audit
- Deploy to production

---

## Key Decisions

1. **Self-optimizer is core** — Every agent has it, COO oversees it
2. **Lessons drive hard stops** — Not arbitrary rules, but learned patterns
3. **COO is single approval source** — Consistent governance
4. **Message queue for reliability** — No lost communications
5. **Database for audit trail** — Full history of decisions/lessons
6. **5-level hard stops** — Graduated enforcement from prevention to alerts

---

## Success Metrics

### Per-Agent Metrics
- Lesson success rate >90% (lessons lead to improvements)
- Repeat failure rate <5% (resolved issues don't reoccur)
- Task success rate >95% (agents complete reliably)
- Time to resolve <1 day (issues caught and fixed quickly)

### System-Wide Metrics
- System health score >95% (all agents operating well)
- Pattern detection <2 days (issues caught early)
- Hard stop effectiveness >80% (hard stops prevent failures)
- Escalation accuracy >80% (escalations actually need human action)

---

## Files & References

### Agent Files
- `agents/atlas/lessons.md` — Atlas active lessons
- `agents/astra/lessons.md` — Astra active lessons
- `agents/sentinel/lessons.md` — Sentinel active lessons
- `agents/email/lessons.md` — Email active lessons
- `agents/coo/lessons.md` — COO governance lessons

### Skill Files
- `skills/self-optimizer/SKILL.md` — Skill documentation
- `skills/self-optimizer/references/LESSON_CAPTURE_PROTOCOL.md` — How to capture lessons
- `skills/self-optimizer/references/AGENT_LESSONS_TEMPLATE.md` — Template examples

### Integration Documentation
- `agents/SELF_OPTIMIZATION_INTEGRATION.md` — How self-optimizer integrates
- `agents/SYSTEM_OVERVIEW.md` — This file

---

## What's Next

1. **Phase 1 Infrastructure** — Message queue + database setup
2. **Agent Deployment** — Each agent begins capturing lessons
3. **COO Oversight** — Daily lesson collection and propagation
4. **Hard Stop Creation** — Convert high-frequency patterns into hard stops
5. **Continuous Improvement** — System learns and adapts over time

---

_System ready for Phase 1 execution. Self-optimizer skill fully integrated._
