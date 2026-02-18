# Lesson Capture Protocol

## Lesson Structure (7 Fields)

Every lesson must have these fields:

### 1. Timestamp
- **Format:** ISO 8601 (e.g., `2026-02-18T14:30:00Z`)
- **Purpose:** Track when lesson was learned
- **Example:** `"timestamp": "2026-02-18T14:30:00Z"`

### 2. Event Type
- **Values:** `task_completed` | `task_failed` | `pattern_discovered` | `optimization_found`
- **Purpose:** Classify what triggered the lesson
- **Examples:**
  - `task_failed` — "Post was rejected by API"
  - `pattern_discovered` — "Posts at 7 PM get 40% more engagement"
  - `optimization_found` — "Batching image generation saves 20% time"

### 3. Agent
- **Value:** Agent name (e.g., `atlas`, `astra`, `sentinel`, `email`, `coo`)
- **Purpose:** Track which agent learned the lesson
- **Example:** `"agent": "atlas"`

### 4. Context (What Happened)
- **Format:** Detailed description of the situation
- **Purpose:** Capture the full picture so future-self understands
- **Length:** 2-5 sentences max
- **Good example:** "Attempted to post 5 videos to TikTok using Postiz API. 2 posts were rejected with error 'Missing required field: description'. Videos had hashtags but no description text."
- **Bad example:** "Post failed" (too vague)

### 5. Lesson (What Should We Remember)
- **Format:** A specific, actionable insight
- **Purpose:** Distill the learning into a rule or principle
- **Key:** Must be something you can act on
- **Good example:** "TikTok API rejects posts without both description AND hashtags. Missing either field causes rejection."
- **Bad example:** "Things are hard" (not actionable)

### 6. Action (What Changes)
- **Format:** Specific code/workflow change
- **Purpose:** Implement the lesson immediately
- **Examples:**
  - "Added validation function in generate-content.js to check description + hashtags"
  - "Changed post schedule from 3 PM to 7 PM based on engagement data"
  - "Added 60-second timeout to API calls instead of 30 seconds"
  - "Created hard stop: always read recent performance before posting"

### 7. Impact (What Gets Better)
- **Format:** Measurable improvement
- **Purpose:** Track ROI of the lesson
- **Examples:**
  - "Post success rate: 60% → 100% (40% improvement)"
  - "Content engagement: 120 avg likes → 168 avg likes (40% improvement)"
  - "Time to schedule posts: 15 min → 8 min (47% faster)"
  - "Support ticket volume: 10/day → 3/day (70% reduction)"

## JSON Format

```json
{
  "timestamp": "2026-02-18T14:30:00Z",
  "event": "task_failed",
  "agent": "atlas",
  "context": "Attempted to post 5 videos to TikTok. 2 posts rejected with 'Missing required field: description'. Videos had hashtags but no description.",
  "lesson": "TikTok API requires BOTH description AND hashtags. Missing either field causes rejection.",
  "action": "Added validation function in generate-content.js to check both fields before posting.",
  "impact": "Post success rate: 60% → 100% (40% improvement)",
  "status": "implemented"
}
```

## What Makes a Good Lesson

### ✅ Good Lessons

1. **Specific** — Not vague, narrow, actionable
   - ✅ "API times out after 30s on image uploads; add retry logic with 60s timeout"
   - ❌ "API is slow"

2. **Rooted in data** — Backed by evidence, numbers, or observations
   - ✅ "90% of posts scheduled at 7 PM get 40% more engagement than posts at 3 PM"
   - ❌ "7 PM might be better"

3. **Immediately actionable** — You can implement it right now
   - ✅ "Add validation step that checks X before Y"
   - ❌ "Things are complex"

4. **Preventive** — Stops future failures or unlocks improvements
   - ✅ "Never post without checking recent performance data first"
   - ❌ "That post failed"

5. **Measurable** — You can track improvement
   - ✅ "Post success rate increased from 60% to 100%"
   - ❌ "It's better now"

### ❌ Bad Lessons

| Bad | Why | Good |
|-----|-----|------|
| "Things are hard" | Too vague, not actionable | "Image generation times out after 30s; add timeout + retry" |
| "Didn't work today" | No root cause, no learning | "API fails when called without auth header; always include auth" |
| "Try harder" | Not specific | "Add validation step before posting to catch errors early" |
| "API issues" | Too broad | "TikTok API rejects posts without description; add pre-post validation" |

## Root Cause Analysis Checklist

When capturing a lesson, always identify the root cause. Use this checklist:

- [ ] **What failed?** (Be specific: API error, timeout, validation error, etc.)
- [ ] **Why did it fail?** (Missing field? Wrong format? API limitation? Configuration?)
- [ ] **Is this preventable?** (Can we add validation? Change config? Add retry logic?)
- [ ] **Have we seen this before?** (Check pattern tracking below)
- [ ] **What's the permanent fix?** (Code change, hard stop, workflow change?)

### Root Cause Examples

**Bad root cause:** "Post failed"
**Good root cause:** "TikTok API requires description field; validation was skipped"

**Bad root cause:** "API is slow"
**Good root cause:** "Image uploads timeout after 30 seconds; added retry logic with 60-second timeout"

**Bad root cause:** "Engagement is low"
**Good root cause:** "Posts scheduled at 3 PM get 40% fewer likes than posts at 7 PM; changing schedule strategy"

## Impact Scoring

When documenting impact, use this framework:

### High Impact (Do this first)
- Prevents complete failure (e.g., "Post success rate 0% → 100%")
- Saves significant time (e.g., 50%+ reduction)
- Affects multiple agents (e.g., all agents hit this timeout)
- Directly increases revenue (e.g., higher engagement → more sales)

**Example:** "Fix: API timeout. Impact: All posting workflows were failing 40% of the time; fix brings success rate to 100%."

### Medium Impact (Do this next)
- Improves performance (10-49% improvement)
- Reduces some errors (but not all)
- Affects one agent's workflow

**Example:** "Optimization: Post timing. Impact: Engagement improved 25% by scheduling at 7 PM instead of 3 PM."

### Low Impact (Nice to have)
- Minor improvements (<10%)
- Edge cases only
- Documentation/process improvements

**Example:** "Lesson: Always read recent performance data before posting. Impact: Prevents occasional posting mistakes (1-2/week)."

## Pattern Tracking Template

Keep a running count of recurring issues:

| Pattern | Count | First Seen | Last Seen | Status | Fix |
|---------|-------|-----------|-----------|--------|-----|
| API timeout | 5 | 2026-02-10 | 2026-02-18 | Fixed | Added retry + 60s timeout |
| Missing metadata | 3 | 2026-02-15 | 2026-02-18 | Fixed | Added validation |
| Auth failures | 2 | 2026-02-12 | 2026-02-16 | Resolved | Updated credentials |

**When to escalate:**
- Same issue >3 times = High priority fix needed
- Same issue >5 times = Critical, needs hard stop
- Pattern across multiple agents = Escalate to COO immediately

## Avoiding Repeat Failures

### Strategy 1: Hard Stops
When a failure is critical and repeating, make it a hard stop:

```
Rule: API_AUTH_ALWAYS
Level: PREVENT
Action: Never make API call without checking auth credentials first
Trigger: Any API call attempt
```

### Strategy 2: Validation
Add validation before risky operations:

```javascript
// Before posting, validate:
- Description exists and is not empty
- Hashtags exist and is not empty
- Title is under platform character limit
- Throw error if any validation fails
```

### Strategy 3: Workflow Changes
Update the operational workflow:

```
Old: Generate → Schedule → Collect metrics
New: Generate → Validate → Review → Schedule → Monitor → Collect metrics
```

### Strategy 4: Monitoring + Alerts
Set up monitoring for known issues:

```
Alert: "If 3+ posts fail in 1 hour, send notification to COO"
Action: Stop posting, investigate, fix issue before resuming
```

## Session Start: Review Your Lessons

At the start of each agent session, read your `lessons.md`:

1. **Active lessons** — These are your guardrails today
   - "Never post without checking performance data"
   - "Always validate description + hashtags before posting"
   
2. **Pattern tracking** — Which failures repeat?
   - "API timeouts: 5 times in past 8 days"
   - "Missing metadata: 3 times in past 3 days"

3. **Recent changes** — What workflows were updated?
   - "Retry logic added to all API calls"
   - "Post timing changed to 7 PM"

4. **Lessons to deprecate** — Which no longer apply?
   - Remove old lessons that are outdated
   - Archive to history section

## Maintenance

- **Daily:** Review active lessons at session start
- **Weekly:** Review pattern tracking; escalate high-count patterns
- **Monthly:** Archive resolved lessons; identify new patterns
- **Quarterly:** Review all lessons; deprecate outdated ones

Keep active lessons list under 10 items. If you have more, combine related lessons or escalate to COO.
