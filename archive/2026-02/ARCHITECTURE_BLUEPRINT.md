# Architecture Blueprint — The 5 Things That Actually Move the Needle

**Based on:** Vibe-Marketing's 32,000-line architecture (11 skills, proven at $199 × 700 users)
**For:** Our 5-agent system (Morgan, Atlas, Astra, Sentinel, Quinn)

---

## The Insight

Most people think AI skill = "well-written instruction file with examples."

That's baseline.

The gains come from architecture.

Here's what actually moves the needle:

---

## 1. PERSISTENT MEMORY (Structured Ownership)

### What Vibe-Marketing Does

Not just "append lessons" but **structured files with clear ownership:**

```
/brand/
├── voice-profile.md       ← Only /atlas-skill writes (with diff + confirmation)
├── positioning.md         ← Only /quinn-skill writes
├── audience-research.md   ← Only /astra-skill writes
├── keyword-plan.md        ← Only /atlas-skill writes
├── assets.md             ← All skills append (never truncate)
└── learnings.md          ← All skills append (accumulated feedback)
```

**Key rule:** Append-only files never truncate. They only grow. Time-stamped. Skill-tagged.

**Result:** Session 1 builds context → Session 20 uses it → Session 40 knows you deeply

### What We Have

```
agents/*/lessons.md
- Active Lessons (guardrails)
- Pattern Tracking (recurring issues)
- Resolved Lessons (history)
```

### The Gap

We have unstructured learning. Vibe-Marketing has **structured memory with ownership boundaries**.

### How to Close It

Add to each agent:

```
agents/*/memory/
├── brand-profile.md       ← Agent's understanding of client (only this agent writes)
├── context-log.md         ← All work history (all agents append)
├── schema-outputs/        ← Structured outputs for other agents to read
│   ├── atlas-creative.json
│   ├── astra-workflow.json
│   ├── sentinel-tickets.json
│   ├── quinn-strategy.json
│   └── morgan-decisions.json
└── performance-log.md     ← Feedback + learnings (append-only)
```

**Implementation:**
- Each agent owns 1 file (brand-profile.md)
- All agents append to shared log (context-log.md, performance-log.md)
- Structured outputs enable other agents to consume
- Never truncate (only append + archive)

---

## 2. SCORED CONTEXT LOADING (Smart Context, Not More Context)

### What Vibe-Marketing Does

```
The naive approach:
  Email skill gets: [keyword plan, competitor analysis, creative kit, voice profile]
  Result: Muddy emails. Tries to honor everything. Attention is finite.

The scored approach:
  Email skill gets ONLY: [voice profile, subject-line learnings]
  Email skill DOESN'T get: [competitor analysis, creative kit, keyword plan]
  Result: Sharp emails. Focused on what matters.
```

**Context Matrix:**
```
Skill               | Needs           | Doesn't Need        | TTL Rule
─────────────────────────────────────────────────────────────
atlas (creative)    | voice, audience | positioning, tech   | 7 days
astra (ops)         | workflows, SLAs | creative, audience  | 14 days
sentinel (support)  | tickets, SLAs   | creative, audience  | 3 days
quinn (strategy)    | positioning     | assets, keywords    | 30 days
morgan (oversight)  | all (summary)   | none                | 7 days
```

**Freshness Rules:**
- < 7 days → Pass as-is
- 7-30 days → Flag age + pass
- 30-90 days → Summary only
- 90+ days → Don't load (stale)

### What We Have

All agents read all memory. No scoring. No freshness gates.

### The Gap

**More context ≠ Better output.** We need intelligent context selection.

### How to Close It

Create `agents/memory/CONTEXT_MATRIX.md`:

```markdown
# Context Scoring Matrix

## Atlas (Creative)
- HIGH PRIORITY: voice-profile.md, audience-research.md, learnings.md (creative)
- MEDIUM PRIORITY: positioning.md
- DEPRIORITIZE: workflows, technical details
- TTL: Audience data >7 days gets flagged, >30 days summarized

## Astra (Operations)
- HIGH PRIORITY: workflows.md, metrics.md, learnings.md (process)
- MEDIUM PRIORITY: positioning.md
- DEPRIORITIZE: creative assets, audience details
- TTL: Process data >14 days gets reviewed, >30 days archived

## Sentinel (Support)
- HIGH PRIORITY: tickets.json, SLAs.md, learnings.md (support)
- MEDIUM PRIORITY: audience.md (for context)
- DEPRIORITIZE: creative, positioning
- TTL: Support data >3 days needs review, >7 days archive

## Quinn (Strategy)
- HIGH PRIORITY: positioning.md, competitive-analysis.md, learnings.md (strategy)
- MEDIUM PRIORITY: audience.md
- DEPRIORITIZE: day-to-day operations, creative
- TTL: Strategy data >30 days still useful, >90 days archive

## Morgan (Oversight)
- HIGH PRIORITY: All (but summarized)
- SPECIAL: Receives summaries, not full files
- TTL: Override—Morgan needs latest
```

**Implementation Rule:**
```
Before loading context, agent checks:
1. Is this file scored as HIGH for me? → Load full
2. Is this file MEDIUM? → Load summary + flag age
3. Is this file in DEPRIORITIZE? → Skip
4. TTL check: How old is it? Adjust detail level accordingly
```

---

## 3. SCHEMA CONTRACTS (Typed Interfaces Between Agents)

### What Vibe-Marketing Does

Skills don't work in isolation. They output structured data.

```
/atlas-skill (creative)
  ├── Reads: voice-profile.md, audience.md
  └── Outputs: creative-output.json (schema: CreativeOutput)
       {
         "hook": string,
         "body": string,
         "cta": string,
         "variant_a": string,
         "variant_b": string,
         "platform": enum[tiktok|instagram|linkedin],
         "performance_predicted": number,
         "keywords_used": string[]
       }

/email-skill (communications)
  ├── Reads: creative-output.json (as schema contract)
  ├── Reads: audience.md
  └── Outputs: email-output.json (schema: EmailOutput)
       {
         "subject": string,
         "preview": string,
         "body": string,
         "cta": string,
         "performance_predicted": number
       }
```

**No copy-pasting between sessions. No re-explaining. Data flows through typed interfaces.**

### What We Have

Agents message each other. But no defined schemas.

### The Gap

Communication is unstructured. Agents repeat work because they can't consume each other's output reliably.

### How to Close It

Create `agents/memory/SCHEMA_CONTRACTS.md`:

```markdown
# Schema Contracts Between Agents

## Atlas → Creative Output Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "deliverable": { "type": "string" },
    "hook": { "type": "string" },
    "body": { "type": "string" },
    "cta": { "type": "string" },
    "variants": {
      "type": "array",
      "items": { "type": "string" }
    },
    "platform": { "enum": ["tiktok", "instagram", "linkedin", "twitter"] },
    "performance_predicted": { "type": "number" },
    "keywords_used": { "type": "array", "items": { "type": "string" } }
  }
}
```

## Astra → Workflow Output Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "workflow_name": { "type": "string" },
    "steps": { 
      "type": "array",
      "items": { "type": "object" }
    },
    "bottlenecks": { "type": "array", "items": { "type": "string" } },
    "improvements": { "type": "array", "items": { "type": "string" } },
    "time_saved": { "type": "number" },
    "dependencies": { "type": "array", "items": { "type": "string" } }
  }
}
```

## Sentinel → Support Output Schema
[Similar structure for support tickets]

## Usage Pattern

When atlas-skill finishes:
```
1. Output in schema: creative-output.json
2. Tag with timestamp
3. Quinn can read it directly (no re-explaining)
4. Astra can consume it for workflow planning
```

When other agents need atlas's output:
```
agents/atlas/memory/schema-outputs/latest-creative.json
→ Typed interface, no guessing
→ Can be consumed programmatically
→ Data flows through pipeline
```
```

---

## 4. LEARNING LOOPS (Session N Learns From Session 1)

### What Vibe-Marketing Does

After every major deliverable:
```
System asks: "How did this perform?"
  a) Shipped as-is
  b) Minor edits
  c) Rewrote significantly

Answer → Logged (date-stamped, skill-tagged)
         ↓
Next time skill runs → Reads those learnings
         ↓
Example: Email skill stops writing question-based subject lines
         Copy skill drops polish, gets direct
         System gets smarter the more you use it
```

### What We Have

lessons.md captures what happened. But no performance feedback loop.

### The Gap

We log lessons. We don't log **how well the lessons worked**.

### How to Close It

Create `agents/*/memory/performance-log.md`:

```markdown
# Performance Learning Log

## Session-Based Learnings (Append-Only)

### 2026-02-19 | Atlas | Creative Work
- Deliverable: 5 content hooks
- Approach: Question-based opening
- Feedback: a) Shipped as-is ✅
- Performance: 34% CTR (vs 18% baseline)
- **Learning:** Keep question-based approach. Works for this audience.
- Applied Next: Yes (Session 2 used this approach)

### 2026-02-20 | Atlas | Creative Work
- Deliverable: Email subject lines
- Approach: Curiosity gap + number
- Feedback: c) Rewrote significantly ❌
- Performance: 12% CTR (vs 18% baseline)
- **Learning:** Curiosity gap doesn't work for this audience. Too generic.
- Adjustment: Switch to benefit-driven, specific-to-them
- Applied Next: Yes (Session 3 changed approach)

### 2026-02-21 | Atlas | Creative Work
- Deliverable: Email subject lines (revised)
- Approach: Benefit-driven, specific to client
- Feedback: a) Shipped as-is ✅
- Performance: 31% CTR
- **Learning:** Benefit-driven + specificity works. Keep this approach.

## Pattern Extraction (From Performance Log)

```
Atlas Creative Patterns:
- Question-based: 34% average CTR ✅
- Curiosity gap: 12% average CTR ❌
- Benefit-driven + specific: 31% average CTR ✅
→ Recommendation: Use benefit-driven + specific, avoid curiosity gap
```

## How Agents Use This

```
atlas-skill starts writing
  → Reads performance-log.md
  → Sees: "Question-based: 34% ✅, Curiosity gap: 12% ❌"
  → Prioritizes question-based approach
  → Result: More effective output
```
```

### Implementation

After each agent deliverable, capture:
- What was tried
- Performance feedback (shipped / minor edits / rewrote)
- Outcome (if measurable)
- What to apply next time

---

## 5. SHARED PROTOCOL LAYER (One Spec, All Agents Follow)

### What Vibe-Marketing Does

11 skills each implementing their own memory logic, freshness rules, feedback collection.

Solution: **One protocol document. All skills follow it.**

```
PROTOCOL.md
├── How to read brand files
├── How to write brand files
├── When context is too stale to use
├── How to collect feedback
├── How to degrade when files are missing
├── TTL rules (when things are fresh/stale)
├── Schema contract rules
├── Performance logging format
└── Context scoring rules

No runtime enforces it. Skills just follow the spec. Like HTTP.
Result: One document. 11 skills. System-wide coherence.
```

### What We Have

Each agent has its own operating logic. No unified protocol.

### The Gap

No system-wide coherence. Agents might access memory differently. Inconsistent feedback loops.

### How to Close It

Create `agents/AGENT_PROTOCOL.md`:

```markdown
# Agent Protocol v1.0

## Memory Access Rules

### 1. Reading Memory
All agents follow this order:
1. Check /memory/brand-profile.md (owned by this agent)
2. Check /memory/context-log.md (append-only, all agents)
3. Check /memory/performance-log.md (append-only, all agents)
4. Score context using CONTEXT_MATRIX.md
5. Apply freshness rules (see TTL section)
6. Construct context window

### 2. Writing Memory
All agents follow this order:
1. Reading (check what exists first)
2. If brand-profile.md (agent is owner):
   - Create diff
   - Request confirmation before overwriting
   - Log change with reason
3. If append-only file (context-log.md, performance-log.md):
   - Append with timestamp + agent-tag
   - Never truncate
   - Format: [YYYY-MM-DD HH:MM | agent-name] Message

### 3. Freshness Rules (TTL)

| Age | Action |
|-----|--------|
| < 7 days | Pass as-is, full detail |
| 7-30 days | Flag age in context, pass with note |
| 30-90 days | Pass summary only, not full file |
| 90+ days | Don't load, it's stale |

### 4. Schema Contracts
All inter-agent communication uses typed schemas.
- Atlas output → Atlas schema (JSON)
- Astra output → Astra schema (JSON)
- Other agents consume via schema, not freeform text

### 5. Performance Feedback Collection
After every major deliverable, all agents:
1. Ask: "How did this work?" (shipped / minor edits / rewrote)
2. Log answer + context to performance-log.md
3. Extract pattern (what worked / what didn't)
4. Apply pattern to next run

### 6. Degradation When Files Missing
If /memory/brand-profile.md missing:
- Continue working (no halt)
- Mark output as "generic" (lower confidence)
- Log: "brand-profile missing, output may be generic"
- Suggest: "Please provide brand guidance"

If /memory/context-log.md missing:
- Continue working (no halt)
- This is first session—expected
- Log: "No prior context, output is baseline"

### 7. Error Handling
```
Error: File not found
Action: Check if append-only (context-log, performance-log)
  → Yes: Create file (it's new)
  → No: Log error, use defaults

Error: Stale data (>90 days)
Action: Don't load, skip context
  → Log: "Context too old, skipped"
  → Result: Output is generic but reliable
```

## Protocol Governance

This protocol is living. Update when:
- A new pattern emerges (add to Protocol v1.1)
- An agent discovers a better way (propose change)
- Performance data suggests optimization (update TTL, scoring)

**All updates must:**
1. Be documented (reason + date)
2. Be tested (before applying to all agents)
3. Be announced (Morgan notifies team)
```

---

## What This Adds Up To

### Day 1 (No Context)
```
No setup required.
Morgan: "Run atlas"
Atlas: Works, generates generic output
Result: "It works"
```

### Week 1 (Context Building)
```
brand-profile.md populated
context-log.md growing
performance-log.md recording feedback
Atlas: Reads your voice, audience, learnings
Result: "It sounds like me"
```

### Week 2 (Data Flow)
```
Schema contracts active
Agents consuming each other's outputs
Workflows connected
Result: "It knows what we're building"
```

### Week 3+ (Learning Loops)
```
Performance feedback loops active
Patterns extracted from learnings
Bad approaches avoided
Good approaches repeated
Result: "It works better every week"
```

### Month 1+
```
Full architecture active
System knows your brand
System knows your audience
System knows what works
System knows what doesn't
Result: "It's like having a team"
```

---

## Gap Analysis: Us vs Vibe-Marketing

| Component | Vibe-Marketing | Our Agents (Now) | Our Agents (With This) |
|-----------|---|---|---|
| Structured memory | ✅ Typed files | ❌ Unstructured | ✅ Typed files |
| Ownership rules | ✅ Clear | ❌ None | ✅ Clear |
| Append-only logs | ✅ | ❌ | ✅ |
| Context scoring | ✅ Matrix | ❌ | ✅ Matrix |
| Freshness rules | ✅ TTL | ❌ | ✅ TTL |
| Schema contracts | ✅ JSON | ❌ | ✅ JSON |
| Pipeline data flow | ✅ | ❌ | ✅ |
| Performance loops | ✅ | Partial | ✅ Full |
| Shared protocol | ✅ | ❌ | ✅ |
| System coherence | ✅ | Partial | ✅ Full |

---

## Implementation Priority

### Phase 1 (Week 1): Foundation
- [ ] Create memory directory structure
- [ ] Add CONTEXT_MATRIX.md
- [ ] Add SCHEMA_CONTRACTS.md
- [ ] Add AGENT_PROTOCOL.md

### Phase 2 (Week 2): Integration
- [ ] Implement context scoring in each agent
- [ ] Implement schema output for inter-agent communication
- [ ] Implement TTL freshness rules

### Phase 3 (Week 3): Learning Loops
- [ ] Add performance-log.md
- [ ] Implement feedback collection after deliverables
- [ ] Extract and apply patterns

### Phase 4 (Week 4+): Optimization
- [ ] Monitor what actually moves the needle
- [ ] Refine context scoring
- [ ] Optimize performance loops
- [ ] Update protocol based on learnings

---

## Why This Matters

**Without architecture:**
- Day 1 = Day 90 (same output quality)
- Sessions in isolation (no learning)
- Context overload (more data = worse output)
- Agents can't compose work

**With architecture:**
- Day 1 < Day 30 < Day 90 (improving continuously)
- Sessions compound (Session 1 teaches Session 90)
- Scored context (less is more)
- Agents as pipeline nodes

---

## The Real Competitive Advantage

Vibe-Marketing sold 700 copies at $199 because **the architecture moved the needle.**

Not the skill file. The architecture.

We can do the same. 

But scaled to 5 agents × N clients × continuous improvement.

The difference:
- Vibe-Marketing: 1 user per skill instance
- Us: N clients per Morgan instance
- Vibe-Marketing: $199 × 700 = $139K
- Us: $5-25K/month × scale = ∞

---

**This is what separates "good" multi-agent systems from "elite" ones.**

Time to implement it.

---

*Blueprint credit: James, Vibe Marketer (32,000 lines, 11 skills, proven model)*
