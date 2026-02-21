# 🎓 Skills Workflow — How I Build & Organize Everything

**Effective Feb 19, 2026**

You asked: "Instead of saving everything to memory, create a skill for everything and keep your memory light."

This is how I do it now.

---

## The Pattern

### 1️⃣ When I Build Something New

```
Build → Test → Document → Create Skill → Add to Catalogue → Summarize in Memory
```

**Example: Mission Control Dashboard**

1. **Build:** Express + WebSocket + REST API (9.5K code)
2. **Test:** Full endpoint verification suite
3. **Document:** SKILL.md (full API), QUICK_START.md (3-min setup), README.md (overview)
4. **Create Skill:** Move to `/skills/mission-control/` with proper structure
5. **Add to Catalogue:** Add entry to `SKILLS_CATALOGUE.md`
6. **Summarize in Memory:** 200-word entry in `MEMORY.md` with link to skill

### 2️⃣ Skill Directory Structure

Every skill follows this pattern:

```
/skills/{skill-id}/
├── SKILL.md                    (Full API reference, architecture)
├── QUICK_START.md             (3-minute setup)
├── ADVANCED.md                (Advanced configuration)
├── README.md                  (GitHub-style overview)
├── _meta.json                 (Metadata: version, status, features)
├── package.json               (Dependencies)
├── src/
│   ├── server.js             (Main service logic)
│   ├── api.js                (REST endpoints)
│   ├── websocket.js          (Real-time updates)
│   └── config.js             (Configuration)
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── config/
│   └── default-config.json   (Example configuration)
└── tests/
    └── test-{skill-id}.js    (Full endpoint verification)
```

### 3️⃣ What Goes Where

| Content | Location |
|---------|----------|
| Code | `/skills/{id}/src/` |
| Full documentation | `/skills/{id}/SKILL.md` |
| Quick setup | `/skills/{id}/QUICK_START.md` |
| Advanced config | `/skills/{id}/ADVANCED.md` |
| API definitions | `/skills/{id}/SKILL.md` |
| Configuration | `/skills/{id}/config/` |
| Tests | `/skills/{id}/tests/` |
| **Decision log** | `MEMORY.md` (200 words) |
| **Key learnings** | `MEMORY.md` (200 words) |
| **Links to skills** | `MEMORY.md` (reference) |
| **Skill registry** | `SKILLS_CATALOGUE.md` |

---

## Memory Format

**For each skill, I write one entry in MEMORY.md:**

```markdown
## Skill: {Name} v{Version}

**Built:** Date  
**Why:** Problem it solves  
**Key decision:** What I chose + why  
**Learnings:** What I discovered  
**Next:** What's next to build  
**Link:** /skills/{id}/SKILL.md
```

**Example:**
```markdown
## Skill: Mission Control Dashboard v1.0

**Built:** Feb 19, 2026  
**Why:** ehi wanted unified visibility into all agents at once

**Key decision:** WebSocket for real-time (vs webhook polling)
- Reason: <100ms latency needed
- Tradeoff: More complex but much better UX

**Learnings:**
- Express + ws handles both HTTP + WebSocket well
- HTML dashboard with vanilla JS faster than React
- File monitoring enables real-time lessons feed

**Next:** Package Astra, Sentinel, Morgan as skills

**Link:** /skills/mission-control/SKILL.md
```

That's it. ~200 words summarizing a 30K+ skill. Memory stays light.

---

## Skill Registry

**SKILLS_CATALOGUE.md** is the authoritative index:

- Lists all skills (ID, version, status)
- One-line description of each
- Links to full documentation
- Search by feature, status, or dependency

**When I build a new skill, I add it to SKILLS_CATALOGUE.md.**

---

## Building a New Skill (Step-by-Step)

### 1. Create directory
```bash
mkdir -p skills/{skill-id}/{src,public,config,tests}
```

### 2. Write the code
```bash
# src/server.js (or api.js, websocket.js, etc.)
# public/index.html (or app.js, style.css)
# config/default-config.json
```

### 3. Create metadata
```bash
# Create _meta.json
{
  "id": "skill-id",
  "version": "1.0.0",
  "status": "production",
  "description": "...",
  ...
}
```

### 4. Write documentation
```bash
# SKILL.md (full reference)
# QUICK_START.md (3-minute setup)
# README.md (overview)
# ADVANCED.md (optional, advanced config)
```

### 5. Create tests
```bash
# tests/test-{skill-id}.js
# Verify all endpoints work
```

### 6. Package configuration
```bash
# package.json (dependencies)
# .env.example (environment variables)
```

### 7. Add to catalogue
```markdown
# In SKILLS_CATALOGUE.md

### {Skill Name} Skill
**ID:** `{skill-id}`  
**Version:** 1.0.0  
**Status:** Production  
**Location:** `/skills/{skill-id}/`  
**What it does:** ...
```

### 8. Memory entry
```markdown
# In MEMORY.md

## Skill: {Name} v1.0

**Built:** Date  
**Why:** Problem  
**Key decision:** Choice + reasoning  
**Learnings:** Insights  
**Next:** What's next  
**Link:** /skills/{skill-id}/SKILL.md
```

### 9. Git commit
```bash
git add skills/{skill-id}/ SKILLS_CATALOGUE.md MEMORY.md
git commit -m "feat: new skill {skill-id} v1.0.0 — description"
```

---

## Finding Skills

### Search by ID
```bash
ls skills/
```

### View skill metadata
```bash
cat skills/{id}/_meta.json
```

### View API reference
```bash
cat skills/{id}/SKILL.md
```

### View quick start
```bash
cat skills/{id}/QUICK_START.md
```

### Search by feature
```bash
grep -r "feature-name" skills/*/SKILL.md
```

### View all in catalogue
```bash
cat SKILLS_CATALOGUE.md
```

---

## Examples of Skills (Current)

### ✅ Mission Control Dashboard (v1.0)
- **What:** Real-time monitoring of all agents
- **Link:** `/skills/mission-control/SKILL.md`
- **Setup:** 3 minutes
- **Status:** Production-ready

### 📦 Atlas (Ready to package)
- **What:** Multi-platform content generation + optimization
- **Current:** `/agents/atlas/` (will move to `/skills/atlas/`)
- **Setup:** Already fully functional
- **Status:** Ready for skill packaging

### ✏️ Astra, Sentinel, Morgan, Quinn (Designed)
- **What:** Operations, support, COO, communications agents
- **When:** Will package as skills following same pattern
- **Setup:** 3-5 days each
- **Status:** Design complete, ready to build

---

## Memory Maintenance

### Weekly
- Review new skills created
- Update SKILLS_CATALOGUE.md
- Add light summaries to MEMORY.md

### Monthly
- Review MEMORY.md for patterns
- Consolidate similar skills
- Plan next skill generation

### Quarterly
- Full catalogue audit
- Identify consolidation opportunities
- Plan major version updates (v2.0, etc)

---

## Key Principles

1. **Skills are self-contained** — All code, docs, config in one place
2. **Memory is light** — Only decisions, learnings, links
3. **Catalogue is authoritative** — Single source of truth for all skills
4. **Documentation is complete** — Anyone can understand from SKILL.md
5. **Reusability is key** — Build once, use many times

---

## Benefits

### For You
- Easy to find what exists (`SKILLS_CATALOGUE.md`)
- Easy to understand how to use a skill (`QUICK_START.md`)
- Easy to integrate a skill (see `SKILL.md`)
- Memory stays light (summaries + links)

### For Me
- Code stays organized (`/skills/` directory)
- Documentation stays complete (SKILL.md per skill)
- Skills are reusable (standalone packages)
- Patterns emerge (compare similar skills)
- Build faster (follow established structure)

### For Scaling
- New agents can use existing skills
- Skills can be licensed/distributed
- Training is documentation (SKILL.md)
- Testing is automated (test suite)

---

## Next Skills to Build

1. **Atlas** (package existing code as skill) — 15 min
2. **Astra** (operations automation) — 3 days
3. **Sentinel** (support automation) — 3 days
4. **Morgan** (COO oversight) — 2 days
5. **Quinn** (communications routing) — 2 days

All follow same skill structure. All documented in SKILLS_CATALOGUE.md.

---

## Quick Reference

| When | I Do |
|------|------|
| Build new skill | Create `/skills/{id}/` with structure |
| Document skill | Write SKILL.md, QUICK_START.md, README.md |
| Register skill | Add entry to SKILLS_CATALOGUE.md |
| Summarize | 200-word entry in MEMORY.md + link |
| Commit | `git add skills/{id}/ && git commit` |
| Update | Bump version in _meta.json, update docs |
| Archive | Move old versions to `/skills/archive/` |

---

## Status

✅ **New skill-first workflow implemented**  
✅ **Mission Control packaged as production skill**  
✅ **SKILLS_CATALOGUE.md created as registry**  
✅ **Memory strategy updated (light summaries)**  
✅ **Ready for next skills (Atlas, Astra, Sentinel)**

---

_Effective immediately. All future work uses skills + light memory. Scalable, organized, reusable._
