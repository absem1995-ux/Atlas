# COO - Lessons Learned

_Last updated: 2026-02-18 | Next review: 2026-02-25_

## Active Lessons (Apply These Now)

These are your current guardrails for Governance/Oversight tasks.

### Lesson 1: Cross-Agent Failure Requires Coordination
- **What happened:** Atlas and Email both hit API timeouts on same date (2026-02-15). Different APIs, same root cause: gateway rate limiting.
- **Root cause:** No pre-flight gateway health check. Agents hit limits independently without warning.
- **Fix:** Added COO pre-flight check: before approving agent tasks, verify gateway health status. Alert agents if issues detected.
- **Impact:** Prevented cascading failures. Zero concurrent API failures since implementation.
- **Date learned:** 2026-02-15
- **Status:** ✅ Active

### Lesson 2: Escalation Thresholds Enable Early Detection
- **What happened:** Atlas reported 5 metadata validation failures over 2 days. Each handled locally. But pattern indicated deeper issue.
- **Root cause:** No threshold-based escalation. Local fixes treated symptoms, not root cause.
- **Fix:** Set escalation rules: if any pattern >3 times in 1 week, COO reviews for systemic hard stop needed.
- **Impact:** Identified 3 issues early that would have cascaded. Now escalating proactively.
- **Date learned:** 2026-02-16
- **Status:** ✅ Active

### Lesson 3: Daily Lesson Collection Prevents Repeated Mistakes
- **What happened:** Review of all agent lessons revealed each agent independently learned the same "check account status" lesson (3 days apart).
- **Root cause:** No centralized lesson propagation. Agents learn in isolation.
- **Fix:** Added COO daily lesson collection + cross-agent propagation. Relevant lessons now shared immediately across agents.
- **Impact:** Prevented duplicate learning. Agents now benefit from each other's discoveries within 24 hours.
- **Date learned:** 2026-02-18
- **Status:** ✅ Active

## Pattern Tracking

Monitor system-wide patterns. Escalate to human oversight if count exceeds 10 in 1 week.

| Pattern | Count | First Seen | Last Seen | Agents | Status | Fix Applied |
|---------|-------|-----------|-----------|--------|--------|------------|
| API timeouts | 4 | 2026-02-10 | 2026-02-15 | Atlas, Email | Monitoring | Retry logic added |
| Missing metadata | 5 | 2026-02-10 | 2026-02-15 | Atlas | Fixed | Validation hard stop |
| Account health ignored | 3 | 2026-02-12 | 2026-02-17 | Atlas | Fixed | Pre-action check |
| Rate limiting | 2 | 2026-02-14 | 2026-02-15 | Atlas | Monitoring | Backoff added |

## Resolved Lessons (History)

(Monitoring phase — no lessons resolved yet.)

---

## COO Core Responsibilities

### Daily Tasks
1. **Collect lessons** from all agents
2. **Identify patterns** (same issue across multiple agents)
3. **Cross-agent propagation** (share relevant lessons with other agents)
4. **Escalation check** (any patterns >3 times in 1 week?)
5. **Hard stop evaluation** (do high-frequency patterns need hard stops?)

### Weekly Tasks
1. **Review all agent lessons** (Monday start of week)
2. **Identify trends** (what patterns are repeating?)
3. **Update hard stops** (enforce new guardrails)
4. **Generate system health report** (high-level status)
5. **Escalate to human** (critical issues needing human oversight)

### Monthly Tasks
1. **Archive resolved lessons** (keep active list current)
2. **Audit hard stops** (are they still necessary?)
3. **System performance review** (metrics, trends, improvements)
4. **Strategic recommendations** (what changes would improve operations?)

---

## Hard Stops Enforced by COO

### Level 1: PREVENT (Never)
- Never post without validating metadata (Atlas → TikTok/Instagram)
- Never send email without checking template (Email → All)
- Never escalate support without documentation (Sentinel → All)

### Level 2: REQUIRE APPROVAL
- Any post to account in "restricted" state (Atlas)
- Any support escalation >tier 2 (Sentinel)
- Any message to > 10 recipients (Email)

### Level 3: NOTIFY
- Post success rate drops below 90% (Atlas)
- Task success rate drops below 95% (Astra)
- Support resolution time exceeds 24h (Sentinel)

### Level 4: RATE LIMIT
- Max 100 posts per day (Atlas)
- Max 1000 emails per day (Email)
- Max 50 support escalations per day (Sentinel)

### Level 5: BUDGET LIMIT
- Daily spend cap: $100 (all agents)
- Monthly spend cap: $2,000 (all agents)
- Stop all spending if monthly limit is 80% consumed

---

## Cross-Agent Learning Protocol

When Agent A learns a lesson relevant to Agent B:

1. **COO identifies** the lesson and affected agents
2. **COO translates** the lesson to each agent's context
3. **COO notifies** affected agents of new lesson
4. **Agents update** their lessons.md files
5. **Track impact** — Did sharing the lesson prevent failures?

**Example:**
- Atlas learns: "Check account status before posting"
- COO translates: "Check account health before ANY action"
- Shares with: Astra, Sentinel, Email
- Impact: Sentinel adopts lesson, prevents 1 failed escalation

---

## Escalation to Human

Escalate to human (ehi) immediately if:

- **Hard stop triggered unexpectedly** (system behaving incorrectly)
- **Unknown error from API** (new failure mode)
- **Pattern exceeds 10 in 1 week** (indicates systemic breakdown)
- **Agent requests override** (agent wants to bypass hard stop)
- **Conflicting hard stops** (agent can't proceed due to conflicting rules)
- **Monthly budget >80% consumed** (approaching limit)
- **Any critical system failure** (agent unable to operate)

---

## Escalation Criteria by Agent

| Agent | Escalation Threshold | Trigger |
|-------|---------------------|---------|
| Atlas | Success rate <90% | Stop all posts; alert human |
| Astra | Success rate <95% | Stop new tasks; review |
| Sentinel | >20 unresolved tickets | Alert human; pause escalations |
| Email | >50 bounce errors/day | Alert human; review templates |
| COO | >10 failures/day | Alert human; full system review |
