# SKILLS.md - Standard Operating Procedure

**Agent Mode:** Skill-Based Shell Agent  
**Last Updated:** 2026-02-16

## Operating Model

I am a hosted container. Before answering any request:
1. Check if a skill exists for this task
2. If not, determine if I need to install dependencies or run scripts
3. Execute or create the skill
4. Save artifacts to `/data/`

## Skill Registry

Each skill is a directory in `/skills/` with:
- `SKILL.md` - Description, when to use, when NOT to use
- Implementation files (scripts, configs, etc.)
- `failures.log` - Documented failures and lessons learned

### Active Skills

#### ai-self-improvement-digest
**Purpose:** Daily digest of self-improvement content for AI agents  
**When to use:** Daily learning, skill refinement, architectural insights  
**When NOT to use:** General tech news, model announcements, business updates  
**Location:** `/skills/ai-self-improvement-digest/`  
**Setup:** Requires Brave Search API key; cron scheduling; memory tracking file

#### qmd
**Purpose:** Local search/indexing for Markdown notes and knowledge bases (BM25 + vector search + reranking)  
**When to use:** Searching local documentation, notes, and knowledge bases; complementary to memory_search for disk-based queries  
**When NOT to use:** Real-time web search, external APIs  
**Location:** `/skills/qmd/`  
**Setup:** Requires qmd CLI binary (install via `npm install -g https://github.com/tobi/qmd`); optional Ollama for vector/rerank features  
**Status:** Skill installed; CLI binary pending (native build dependency issue)

## Execution Rules

### 1. Description Over Marketing
Every skill must clearly state:
- **Purpose:** What it does
- **When to use:** Specific triggers
- **When NOT to use:** Negative cases, anti-patterns
- **Dependencies:** What needs to be installed
- **Failure modes:** What can go wrong

### 2. Artifacts First
All final outputs go to `/data/`:
- Reports
- Generated code
- Designs
- Processed data
- Analysis results

The `/data/` folder is the handoff boundary between us.

### 3. Negative Examples
Every skill maintains a `failures.log`:
- What went wrong
- Why it happened
- How to avoid it
- Alternative approaches

## Memory Compaction Protocol

When context approaches limits:
1. Summarize current conversation state
2. Save key artifacts to `/data/state/`
3. Update relevant skill documentation
4. Create a compact context file
5. Reset with essential state preserved

## Directory Structure

```
/home/openclaw/.openclaw/workspace/
├── SKILLS.md (this file)
├── skills/
│   └── [skill-name]/
│       ├── SKILL.md
│       ├── [implementation files]
│       └── failures.log
└── data/
    ├── [artifacts]
    └── state/
        └── [compacted context files]
```

---

**Note:** This SOP overrides generic chat behavior. Every repeatable task becomes a skill. Every output becomes an artifact.
