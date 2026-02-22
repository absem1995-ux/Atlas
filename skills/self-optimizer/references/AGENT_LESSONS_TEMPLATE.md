# Agent Lessons Template

Use this template for each agent's `lessons.md` file. Copy to `agents/<agent-name>/lessons.md` and fill in as lessons are learned.

---

## Template Structure

```markdown
# <AgentName> - Lessons Learned

_Last updated: YYYY-MM-DD | Next review: YYYY-MM-DD_

## Active Lessons (Apply These Now)

These are your current guardrails. Review at session start.

### Lesson 1: [Pattern/Issue Name]
- **What happened:** [Context — what triggered this lesson]
- **Root cause:** [Why did this happen]
- **Fix:** [What changed to prevent/solve it]
- **Impact:** [Measurable improvement]
- **Date learned:** [When]
- **Status:** ✅ Active | ⏳ Pending Implementation | 🔧 Adjusting

### Lesson 2: [Next pattern]
...

## Pattern Tracking

Recurring issues that need monitoring:

| Pattern | Count | First | Last | Status | Fix Applied |
|---------|-------|-------|------|--------|------------|
| [Issue A] | 3 | 2026-02-10 | 2026-02-18 | Fixed | [Solution] |
| [Issue B] | 2 | 2026-02-12 | 2026-02-16 | Monitoring | [In progress] |

## Resolved Lessons (History)

Lessons that have been addressed and no longer need active attention.

### Resolved: [Old lesson]
- **Resolved date:** 2026-02-10
- **How it was resolved:** [Describe fix]
- **Current status:** This no longer applies because [reason]

---

## Archival Notes

Archive lessons when:
- The issue is permanently fixed and won't reoccur
- The pattern no longer appears (2+ weeks without incident)
- The lesson is no longer relevant to current operations

```

---

## Example: Atlas Agent Lessons

```markdown
# Atlas - Lessons Learned

_Last updated: 2026-02-18 | Next review: 2026-02-25_

## Active Lessons (Apply These Now)

### Lesson 1: TikTok Metadata Validation
- **What happened:** Attempted to post 5 videos to TikTok. 2 posts rejected with error "Missing required field: description". Videos had hashtags but no description text.
- **Root cause:** Validation step in `generate-content.js` was checking hashtags but not description field
- **Fix:** Updated validation to require BOTH description AND hashtags before scheduling. Added hard stop: cannot post to TikTok without both fields.
- **Impact:** Post success rate: 60% → 100% (40% improvement). Zero rejected posts in past 3 days.
- **Date learned:** 2026-02-15
- **Status:** ✅ Active

### Lesson 2: Post Timing Affects Engagement
- **What happened:** Analyzed 20 posts over 1 week. Posts scheduled at 7 PM averaged 168 likes; posts at 3 PM averaged 120 likes.
- **Root cause:** Audience is most active between 6-9 PM. Posts at 3 PM miss peak hours.
- **Fix:** Updated `schedule-posts.js` to schedule all posts between 6-9 PM (optimal window for this audience). Created preference in atlas-strategy.json.
- **Impact:** Average engagement: 120 likes → 168 likes (40% improvement). 5% increase in follower growth.
- **Date learned:** 2026-02-16
- **Status:** ✅ Active

### Lesson 3: Always Check Platform Account Status
- **What happened:** Attempted to post to Instagram; account was in "restricted" state due to unusual activity. Posts were being held for review.
- **Root cause:** Did not check account health before posting. Account was flagged by Instagram for security review.
- **Fix:** Added validation step: before posting, always check account status via platform API. If restricted/limited, skip posting and alert COO.
- **Impact:** Prevents wasted effort on posts that will be held for review. 0 held posts since fix (previously 2 per week).
- **Date learned:** 2026-02-17
- **Status:** ✅ Active

## Pattern Tracking

| Pattern | Count | First | Last | Status | Fix Applied |
|---------|-------|-------|------|--------|------------|
| Missing metadata (TikTok) | 5 | 2026-02-10 | 2026-02-15 | Fixed | Validation added |
| Low engagement (3 PM posts) | 8 | 2026-02-08 | 2026-02-16 | Fixed | Timing changed to 7 PM |
| Account status not checked | 3 | 2026-02-12 | 2026-02-17 | Fixed | Pre-posting validation added |
| Image generation timeout | 2 | 2026-02-14 | 2026-02-15 | Monitoring | Retry logic in place |

## Resolved Lessons (History)

### Resolved: Postiz API Rate Limiting
- **Resolved date:** 2026-02-14
- **How it was resolved:** Added exponential backoff retry logic to all Postiz API calls. Now waits 2s, 4s, 8s between retries.
- **Current status:** No rate limit errors in past 3 days. Issue is permanently resolved.

### Resolved: Missing Hashtags on LinkedIn
- **Resolved date:** 2026-02-13
- **How it was resolved:** LinkedIn doesn't require hashtags like TikTok; updated `adapt-for-platform.js` to NOT add hashtags to LinkedIn posts (LinkedIn doesn't promote hashtags). Added hashtags only to TikTok, Instagram, Twitter.
- **Current status:** LinkedIn posts now format correctly. No longer an issue.
```

---

## Example: COO Agent Lessons

```markdown
# COO - Lessons Learned

_Last updated: 2026-02-18 | Next review: 2026-02-25_

## Active Lessons (Apply These Now)

### Lesson 1: Cross-Agent Failures Need Immediate Coordination
- **What happened:** Atlas and Email both hit API timeouts on same date (2026-02-15). Different APIs, but same root cause: gateway rate limiting was triggered.
- **Root cause:** No pre-flight check for gateway health before agents start operations. Agents hit limits independently.
- **Fix:** Added COO pre-flight check: before approving agent tasks, verify gateway health. If issues detected, notify agents before they start.
- **Impact:** Prevented cascading failures. 0 concurrent API failures since implementation.
- **Date learned:** 2026-02-15
- **Status:** ✅ Active

### Lesson 2: Escalation Thresholds Matter
- **What happened:** Atlas reported 5 metadata validation failures over 2 days. Each was handled locally. But pattern indicated a broader issue.
- **Root cause:** No threshold-based escalation. Local fixes addressed symptoms, not root cause.
- **Fix:** Set escalation rules: if any pattern appears >3 times in 1 week, COO reviews and decides if hard stop is needed.
- **Impact:** Identified 3 issues early that would have cascaded. Now escalating issues proactively.
- **Date learned:** 2026-02-16
- **Status:** ✅ Active

## Pattern Tracking

| Pattern | Count | Agents | Status | Action |
|---------|-------|--------|--------|--------|
| API timeouts | 4 | Atlas, Email | Monitoring | Retry logic added; monitoring for recurrence |
| Missing metadata | 5 | Atlas | Fixed | Validation hard stop added |
| Account status ignored | 3 | Atlas | Fixed | Pre-posting check added |

## Resolved Lessons (History)

(No resolved lessons yet — this is first week of COO operations)
```

---

## Example: Astra Agent Lessons (Placeholder)

```markdown
# Astra - Lessons Learned

_Last updated: 2026-02-18 | Next review: 2026-02-25_

## Active Lessons (Apply These Now)

(No lessons yet — Astra is in initial deployment phase)

## Pattern Tracking

(No patterns tracked yet)

## Resolved Lessons (History)

(None)
```

---

## Maintenance Instructions

### For Each Agent

1. **Create file:** Copy this template to `agents/<agent-name>/lessons.md`
2. **At session start:** Read "Active Lessons" section
3. **During operations:** Capture lessons using LESSON_CAPTURE_PROTOCOL.md
4. **After tasks:** Add new lessons to "Active Lessons" section
5. **Weekly:** Review pattern tracking; escalate high-frequency patterns
6. **Monthly:** Archive resolved lessons; keep active list under 10 items

### For COO

1. **Collect lessons** from all agents daily
2. **Identify cross-agent patterns** (same issue across multiple agents)
3. **Escalate critical issues** (>3 occurrences = escalation)
4. **Propagate learnings** (share relevant lessons across agents)
5. **Update hard stops** when lessons require enforcement

### Review Cadence

- **Agent session start:** Read Active Lessons (5 minutes)
- **After each task:** Add new lesson if significant event occurred (2 minutes)
- **Weekly (Monday):** Review pattern tracking; escalate issues (15 minutes)
- **Monthly (1st of month):** Archive old lessons; identify trends (30 minutes)
- **Quarterly (1st of month + 0/3/6/9):** Full review; update hard stops (1 hour)

---

## Dos and Don'ts

✅ **Do:**
- Be specific (not "it failed" but "API timeout after 30s")
- Root cause first (why, not just what)
- Actionable fix (code/workflow change, not vague)
- Measurable impact (numbers, percentages)
- Review regularly (prevents repeat failures)

❌ **Don't:**
- Keep vague lessons ("things are hard")
- Document without fixing (lessons are useless if not implemented)
- Hoard lessons (archive old ones; keep active list short)
- Forget to measure impact (how do you know if it worked?)
- Neglect pattern tracking (recurring issues need escalation)
