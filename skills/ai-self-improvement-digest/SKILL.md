# AI Self-Improvement Digest

## Description

This skill creates a daily digest focused on AI self-improvement material, not general AI news. The goal is to surface content that helps an AI agent get better at its job by learning from:

- Harness and system prompt engineering patterns
- Skill and tool development approaches
- Self-evaluation and debugging techniques
- Multi-agent coordination strategies
- Memory and context management
- Task decomposition and workflow automation
- Reasoning and execution patterns

## When to Use

- Setting up daily learning routines for AI agents
- Building an AI agent that improves itself over time
- Curating educational content for agent development
- Creating a structured self-improvement loop

## When NOT to Use

- Looking for general AI/tech news
- Need breaking announcements or model releases
- Want business or market news

## Setup

### 1. Configure Brave Search API

Add to your OpenClaw config:

```json
{
  "tools": {
    "web": {
      "search": {
        "enabled": true,
        "provider": "brave",
        "apiKey": "YOUR_BRAVE_API_KEY"
      }
    }
  }
}
```

Get a Brave Search API key at: https://brave.com/search/api/

### 2. Create Tracking File

Create `memory/ai-digest-posted.json`:

```json
{
  "posted": [],
  "experiments": [],
  "skillsEvaluated": [],
  "setupChanges": []
}
```

### 3. Schedule the Cron Job

Use the cron tool to schedule daily execution at 8:30 AM (or your preferred time):

```
cron add --job {
  "name": "ai-self-improvement-digest",
  "schedule": { "kind": "cron", "expr": "30 8 * * *", "tz": "Europe/London" },
  "payload": { "kind": "agentTurn", "message": "[paste the prompt below]" },
  "sessionTarget": "isolated",
  "notify": true
}
```

## Execution Prompt

Generate a daily AI Self-Improvement Digest and deliver to your configured channel.

**PURPOSE:** Surface content that helps you (the AI) improve your own reasoning, execution, and capabilities. This is not news - it's training material for self-improvement.

**STEP 1: DEDUPLICATION (MANDATORY)**
Read `memory/ai-digest-posted.json`. Skip anything already posted (by URL or substantially similar topic).

**STEP 2: SCAN SOURCES**

Use web_search and web_fetch to check these sources for content from last 24-72h:

*Tier 1 (daily):*
- Anthropic Engineering: anthropic.com/engineering (harnesses, evals, multi-agent)
- Simon Willison: simonwillison.net (practical patterns, tool commentary)
- Geoff Huntley: ghuntley.com (agent philosophy, MCP patterns)
- X/Twitter: Real-time practitioner insights
- Hacker News: news.ycombinator.com AI/agent threads
- Lilian Weng: lilianweng.github.io (deep technical AI posts, agent architectures)

*Tier 2 (2-3x/week):*
- Latent Space: latent.space (industry depth, interviews)
- Cursor Blog: cursor.com/blog (coding agent patterns)
- David Crawshaw: crawshaw.io (agent experience reports)
- Mitchell Hashimoto: mitchellh.com (practical engineering)
- Eugene Yan: eugeneyan.com (ML systems, production patterns)
- Chip Huyen: huyenchip.com (ML systems design, practical deployment)

*Tier 3 (weekly scan):*
- arXiv cs.CL/cs.AI: search for 'agent reasoning tool use'
- GitHub trending: AI agent repos, MCP servers
- Hacker News: AI coding/agent threads

**STEP 3: FILTER FOR SELF-IMPROVEMENT RELEVANCE**

Only include items that help improve capabilities in:
- Harness/system prompt design
- Skill and tool development
- Self-evaluation and debugging
- Multi-agent coordination
- Memory and context management
- Task decomposition and workflow automation
- Reasoning patterns

EXCLUDE: General AI news, model announcements, business news, ethics debates, items already in ai-digest-posted.json.

**STEP 4: FORMAT (3-5 items)**

For each item:
```
[Title] — [Source]
What: [1-sentence summary]
Why it matters for self-improvement: [How this helps you get better]
Takeaway: [Specific pattern, technique, or experiment to try]
Relevance: [⭐ to ⭐⭐⭐⭐⭐]
```

**STEP 5: EXPERIMENT SUGGESTION**

💡 Today's experiment: [One small thing to try based on the digest that could improve your capabilities]

**STEP 6: SETUP REVIEW (MANDATORY)**

Review the content you just surfaced against your existing setup (AGENTS.md, TOOLS.md, skills/, cron jobs, memory patterns). Make concrete, affirmative suggestions:

🔧 Setup Review
Based on today's findings:
- Let's add [specific thing] because [reason tied to content found]
- Let's update [existing thing] to [improvement] because [reason]

If nothing is actionable: "No changes needed today — our current setup handles these patterns well."

Key principles:
- Ground suggestions in what you already have
- Use affirmative voice ("let's do X") not passive ("could consider X")
- Connect each suggestion to a specific article/finding from the digest
- It's okay to have no suggestions if nothing is actionable

**STEP 7: UPDATE TRACKING**

Append new items to `memory/ai-digest-posted.json` with date, title, url, topic.

**FORMAT:**

```
🧠 AI Self-Improvement Digest — [Date]

[Items...]

💡 Today's experiment: [...]

🔧 Setup Review [...]

📊 Feedback: 👍 = useful | 👎 = skip these | 🔥 = more like this | 💬 = thoughts
```

Deliver to your configured channel (Slack, Telegram, Discord, etc.).

## Source Priority

| Source | Priority | Focus |
|--------|----------|-------|
| Anthropic Engineering | ⭐⭐⭐ | Harness design, evals, multi-agent |
| Simon Willison | ⭐⭐⭐ | Practical patterns, tools |
| Geoff Huntley | ⭐⭐⭐ | Agent philosophy, MCP |
| X/Twitter | ⭐⭐⭐ | Real-time practitioner insights |
| Hacker News | ⭐⭐⭐ | High-signal AI/agent discussions |
| Lilian Weng | ⭐⭐⭐ | Deep technical AI, agent architectures |
| Latent Space | ⭐⭐ | Industry depth |
| Cursor Blog | ⭐⭐ | Coding agent patterns |
| Eugene Yan | ⭐⭐ | ML systems, production patterns |
| Chip Huyen | ⭐⭐ | ML systems design |
| arXiv cs.CL/cs.AI | ⭐⭐ | Research foundations |
| GitHub Trending | ⭐⭐ | New tools, repos |

## Content Categories

1. **Harness & System Prompt Engineering** - How to structure agent instructions
2. **Skill & Tool Development** - New tools, MCP servers, integration patterns
3. **Self-Evaluation & Improvement** - How agents assess and improve themselves
4. **Multi-Agent Coordination** - Spawning, supervising, merging work
5. **Memory & Context Management** - RAG, long-term memory, compaction
6. **Workflow Automation** - Task decomposition, failure handling
7. **Foundational Research** - Academic work on agent capabilities

## Failure Modes

- **Rate limiting:** Hitting Brave Search rate limits mid-scan. Solution: Batch searches, add 10s delays between searches.
- **Source unavailability:** A Tier 1 source is down. Solution: Skip and note in memory; continue with others.
- **Duplicate detection fails:** Same article appears twice in consecutive days. Solution: Check both URL and title similarity before posting.
- **Irrelevant content slips through:** General AI news mixed with self-improvement content. Solution: Re-read filtering criteria; be strict about "helps agent improve."
- **Setup Review is vague:** Suggestions that don't connect to actual findings. Solution: Quote the specific article/finding that inspired each suggestion.

## Experiment Tracking

Extend `memory/ai-digest-posted.json` to track experiments:

```json
{
  "posted": [...],
  "experiments": [
    {
      "date": "2026-02-16",
      "fromArticle": "effective-harnesses",
      "experiment": "Add checkpoint before sub-agent spawn",
      "outcome": "Reduced context loss by 40%",
      "learned": "Always checkpoint before spawning"
    }
  ],
  "skillsEvaluated": [
    {
      "date": "2026-02-16",
      "skill": "mcp-postgres",
      "verdict": "useful",
      "notes": "Integrated for database queries"
    }
  ],
  "setupChanges": [
    {
      "date": "2026-02-16",
      "change": "Added memory/experiments.md",
      "reason": "Track harness experiments per Anthropic article",
      "status": "implemented"
    }
  ]
}
```

## Self-Improvement Loop

The digest enables a continuous improvement cycle:

**DAILY:** Read digest → Pick 1 experiment to try → Log outcome in `memory/ai-digest-posted.json` → Review Setup Review suggestions with human

**WEEKLY:** Review experiments → Update harness/skills based on learnings → Adjust source priorities based on value
