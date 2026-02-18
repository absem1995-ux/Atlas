# Quick Start: Self-Optimizer for Agents

## For Agents (Atlas, Astra, Sentinel, Email)

### 5-Minute Setup

1. **Read your lessons.md file:**
   - `agents/atlas/lessons.md`
   - `agents/astra/lessons.md`
   - `agents/sentinel/lessons.md`
   - `agents/email/lessons.md`

2. **Understand what you see:**
   - **Active Lessons** = Your guardrails today
   - **Pattern Tracking** = Issues you're watching
   - **Resolved Lessons** = Problems already fixed

3. **Apply lessons during work:**
   - Before you do something risky, check your Active Lessons
   - Ask: "Is this covered by a lesson? Should I apply it?"

4. **Capture lessons when something happens:**
   - Task failed? → Document it
   - Found a pattern? → Track it
   - Fixed a problem? → Add it to Active Lessons

5. **Update your lessons.md file:**
   - Add new lessons when you learn something significant
   - Update pattern counts when issues repeat
   - Archive old lessons when they're no longer relevant

---

## For COO (Governance Agent)

### Daily Workflow (15 minutes)

**Each morning:**

1. **Collect all agent lessons** (3 min)
   - Read: agents/atlas/lessons.md
   - Read: agents/astra/lessons.md
   - Read: agents/sentinel/lessons.md
   - Read: agents/email/lessons.md

2. **Look for patterns** (5 min)
   - Same issue in multiple lessons? → Cross-agent pattern
   - Issue count >3 in 1 week? → Escalation check
   - New issue types? → Investigation needed

3. **Propagate lessons** (5 min)
   - Is Lesson from Atlas relevant to Astra? → Add to Astra's lessons.md
   - Is Lesson from Sentinel relevant to Email? → Add to Email's lessons.md
   - Update all agents with cross-agent learnings

4. **Create hard stops** (2 min)
   - Pattern >3 in 1 week? → Create hard stop
   - High severity issue? → Hard stop prevents it
   - Add to hard_stops.json

---

## What a Lesson Looks Like

### Example: Atlas Post Failure

```markdown
### Lesson 1: TikTok Metadata Validation Required
- **What happened:** Attempted to post 5 videos to TikTok. 2 posts rejected with error "Missing required field: description"
- **Root cause:** Validation was checking hashtags but not description field
- **Fix:** Updated validation to require BOTH description AND hashtags
- **Impact:** Post success rate: 60% → 100% (40% improvement)
- **Date learned:** 2026-02-15
- **Status:** ✅ Active
```

### Key Fields to Fill

1. **What happened** — Describe the situation (2-5 sentences)
2. **Root cause** — Why did it happen? (be specific)
3. **Fix** — What changed to prevent/solve it?
4. **Impact** — What improved? (use numbers)
5. **Date** — When did you learn this?
6. **Status** — Is this active or resolved?

---

## When to Escalate (Tell COO)

### Escalate Immediately If:

- **Same failure >3 times in 1 day** → Indicates critical bug
- **Success rate drops below threshold** → Something's broken
  - Atlas: <90%
  - Astra: <95%
  - Sentinel: <95%
  - Email: <95%
- **Account gets restricted** → Requires human intervention
- **Unknown error from API** → New failure mode
- **Monthly budget >80% consumed** → Approaching limit

### COO Escalates to Human If:

- **Pattern exceeds 10 in 1 week** → System breakdown
- **Multiple agents affected** → Systemic issue
- **Hard stop contradiction** → Can't proceed
- **Budget limit approaching** → Financial oversight needed

---

## Pattern Tracking Template

Keep a table of recurring issues:

| Issue | Count | When? | Status | Fix |
|-------|-------|-------|--------|-----|
| Missing metadata | 5 | Feb 10-15 | Fixed | Validation added |
| API timeout | 3 | Feb 12-18 | Monitoring | Retry logic added |
| Account restricted | 2 | Feb 14-17 | Fixed | Account check added |

**When to escalate:** Count reaches 5+ in one week

---

## Common Mistakes (Avoid These)

❌ **Bad:** "Post failed" → Too vague
✅ **Good:** "TikTok API rejected post missing description field"

❌ **Bad:** "Seems faster" → Not measurable
✅ **Good:** "Time to post: 15 min → 8 min (47% faster)"

❌ **Bad:** Document but don't fix → Lessons are useless
✅ **Good:** Document + fix + measure impact

❌ **Bad:** Keep outdated lessons forever → Noise accumulates
✅ **Good:** Archive old lessons; keep active list under 10 items

---

## Before Your First Session

### Agents (Do This Once)

1. Read `skills/self-optimizer/SKILL.md` — Understand how it works (10 min)
2. Read your `agents/<name>/lessons.md` file — See what's active (5 min)
3. Read `skills/self-optimizer/references/LESSON_CAPTURE_PROTOCOL.md` — Learn how to capture (10 min)

**Total:** 25 minutes

### COO (Do This Once)

1. Read `agents/SELF_OPTIMIZATION_INTEGRATION.md` — Full integration guide (20 min)
2. Read `agents/SYSTEM_OVERVIEW.md` — System architecture (15 min)
3. Review all agent lessons.md files — Understand the baseline (10 min)

**Total:** 45 minutes

---

## Daily Checklist

### Every Agent

- [ ] Read Active Lessons at session start (5 min)
- [ ] Apply lessons as guardrails during work
- [ ] Capture significant events (2-3 min per event)
- [ ] Update lessons.md before session end (5 min)

### COO

- [ ] Collect all agent lessons (3 min)
- [ ] Identify patterns (5 min)
- [ ] Propagate cross-agent learnings (5 min)
- [ ] Create hard stops if needed (2 min)

---

## Real Example: How It Works

### Day 1 (Monday)

**Atlas works:**
- Posts 5 videos to TikTok
- 2 posts rejected: "Missing description"
- Investigates: TikTok API requires description + hashtags
- **Captures lesson:** "Always validate description + hashtags before posting"
- Adds to: `agents/atlas/lessons.md` (Active Lessons section)
- Implements: Adds validation check to code
- **Impact:** Future posts have 100% success rate

### Day 2 (Tuesday)

**COO works:**
- Reads: `agents/atlas/lessons.md`
- Finds: "Always validate description + hashtags before posting"
- Thinks: "This is relevant to Astra, Sentinel, Email"
- **Propagates to:** Each agent's lessons.md
- Astra: "Always validate required fields before task submission"
- Sentinel: "Always validate documentation before escalation"
- Email: "Always validate recipient list before sending"

### Day 3 (Wednesday)

**Other agents benefit:**
- Astra encounters form validation issue → Lesson prevents it
- Sentinel tries to escalate without docs → Lesson prevents it
- Email sends to huge list → Lesson checks and throttles it
- **Result:** 3 agents prevented failures from 1 agent's learning

---

## Success = Less Repeating Mistakes

### Before Self-Optimizer
- Failure → Manual investigation → Fix → Hope it doesn't happen again
- **Result:** Same issues repeat every week

### After Self-Optimizer
- Failure → Capture lesson → Apply as guardrail → Hard stop prevents future failures
- **Result:** Issues are caught and prevented automatically

---

## Questions?

1. **How do I capture a lesson?**
   → See `LESSON_CAPTURE_PROTOCOL.md` (detailed step-by-step)

2. **What if I'm not sure it's a lesson?**
   → If it's significant (failure, pattern, improvement), capture it. COO will review.

3. **What if my lesson contradicts another agent's lesson?**
   → COO resolves conflicts. System-level lesson takes precedence.

4. **When should I archive old lessons?**
   → When the pattern no longer appears for 2+ weeks. Keep active list under 10 items.

5. **How often should I review my lessons?**
   → At every session start (5 min). Weekly deep review (15 min). Monthly archive (30 min).

---

## Files You Need to Know

| File | When to Read | Purpose |
|------|-------------|---------|
| `agents/<name>/lessons.md` | Session start | Your active lessons + patterns |
| `skills/self-optimizer/SKILL.md` | Once, at start | How the skill works |
| `LESSON_CAPTURE_PROTOCOL.md` | When capturing | How to structure lessons |
| `SELF_OPTIMIZATION_INTEGRATION.md` | Once (COO) | Full integration details |
| `SYSTEM_OVERVIEW.md` | Once (COO) | System architecture |

---

## Ready to Start?

1. ✅ Skill created and documented
2. ✅ Agent lessons.md files created
3. ✅ Atlas has 3 active lessons ready
4. ✅ Integration guide complete
5. ✅ COO workflow defined

**→ You're ready to deploy and start capturing lessons immediately.**

---

_Self-optimizer is ready for production. Start with this Quick Start, then reference the detailed guides as needed._
