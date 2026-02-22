# LarryBrain / PAI Skill — Personal AI Infrastructure

**Status:** Research Complete — Ready to Install  
**Purpose:** Give your agent skills, hooks, memory, and agent system like Larry has  
**Reference:** https://github.com/danielmiessler/Personal_AI_Infrastructure

---

## What It Does

LarryBrain (PAI) gives your agent:

| Component | Count | Description |
|-----------|-------|-------------|
| **Skills** | 23+ | Modular capabilities (Research, CreateCLI, Art, Browser, etc.) |
| **Hooks** | 30+ | Lifecycle automation (SessionStart, UserPromptSubmit, PreCompact, etc.) |
| **Memory** | 2 files | Active memory + diary that auto-loads |
| **Agents** | 20+ | Specialized agents (Explore, Plan, Engineer, Researcher, etc.) |

---

## Key Components

### Skills (23+)
- **CORE** — Identity, response format, stack preferences
- **Research** — Multi-agent parallel research
- **CreateCLI** — Generate production TypeScript CLIs
- **Art** — Visual content generation (Tron-meets-Excalidraw)
- **Browser** — Playwright automation with debug-first visibility
- **BrightData** — Progressive 4-tier URL scraping
- **Prompting** — Meta-prompting system
- **Agents** — Dynamic agent composition
- **Observability** — Real-time monitoring dashboard
- **+ 14 more**

### Hooks (30+)
- **SessionStart** — Load memory and context
- **UserPromptSubmit** — Route queries, inject context
- **PreCompact** — Save state before context reset
- **SessionEnd** — Update memory and learning logs
- **Stop** — Cleanup and finalization
- **+ 25 more**

### Memory
- **MEMORY.md** — Active memory (auto-loads at session start)
- **MEMORY/DIARY.md** — Personal thoughts and meta-awareness
- **History/** — Conversation transcripts

### Agents (20+)
- Explore, Plan, Engineer, Researcher, Architect, Designer, etc.

---

## Installation

```bash
# Option 1: Clone PAI to ~/.claude/
git clone https://github.com/danielmiessler/Personal_AI_Infrastructure.git ~/.claude

# Option 2: Selective - copy specific skills
cp -r Personal_AI_Infrastructure/skills/core ~/.claude/skills/

# Option 3: Our adapted version (below)
```

---

## Our Integration

We already have many of these components built:
- ✅ Skills system (`/skills/`)
- ✅ Memory system (`/memory/`, `MEMORY.md`)
- ✅ Agent system (`/agents/`)
- ✅ Hooks (in SOUL.md, FEEDBACK_LOG.md)

**We can either:**
1. **Adopt PAI wholesale** — Replace our system with theirs
2. **Hybrid** — Keep ours, add specific PAI skills we lack
3. **Reference only** — Use their patterns to improve ours

---

## Recommendation

**Hybrid approach:**

| We Have | PAI Has (Add) |
|---------|---------------|
| Skills system | More skills (23+) |
| Memory | DIARY.md, History/ |
| Agents | More agents (20+) |
| Hooks (basic) | Full hooks (30+) |

**Next steps:**
1. Review PAI skills we don't have
2. Add missing hooks
3. Expand agent roster

---

## Resources

- **PAI Repo:** https://github.com/danielmiessler/Personal_AI_Infrastructure
- **Discussion:** https://github.com/danielmiessler/Personal_AI_Infrastructure/discussions/392
- **Larry's Story:** https://nixfred.com/Larry

---

*Researched: Feb 20, 2026*
