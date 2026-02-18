# Marketing Agent — Quick Start (5 Minutes)

Get your marketing agent running in 5 minutes.

## Prerequisites

- Node.js v18+ (`node --version`)
- API keys:
  - **OpenAI** (gpt-image-1.5) — [Get key](https://platform.openai.com/api-keys)
  - **Postiz** (all-platform posting) — [Sign up](https://postiz.pro/)
- Business accounts:
  - TikTok (Creator or Business account)
  - Instagram (Business account recommended)

## 1. Clone & Install (1 minute)

```bash
git clone https://github.com/ehi/marketing-agent
cd marketing-agent

npm install
cp .env.template .env
```

## 2. Add API Keys (1 minute)

Edit `.env`:

```bash
# API Keys
OPENAI_API_KEY=sk-... (paste your OpenAI key)
POSTIZ_API_KEY=... (paste your Postiz API key)

# Mode
MOCK_MODE=false        (use "true" for testing without real APIs)
LOG_LEVEL=info        (debug for verbose output)
```

## 3. Configure Your Business (2 minutes)

Run setup wizard:

```bash
node agents/marketing-orchestrator.js --setup
```

Generates `config/marketing-config.json`. Edit it to customize:

```json
{
  "business": {
    "name": "Your App Name",
    "audience": "Your target audience",
    "positioning": "Your unique value prop",
    "website": "https://yourapp.com"
  },
  "platforms": {
    "tiktok": {
      "enabled": true,
      "handle": "@yourhandle"
    },
    "instagram": {
      "enabled": true,
      "handle": "@yourhandle"
    }
  }
}
```

## 4. Test It (1 minute)

Generate 3 test posts:

```bash
node agents/marketing-orchestrator.js --generate --count 3
```

Check `data/posts/` for generated images + overlays.

## 5. Schedule to Platforms

Adapt content for each platform:

```bash
node agents/marketing-orchestrator.js --adapt
```

Schedule to posting queue:

```bash
node agents/marketing-orchestrator.js --run
```

Posts scheduled to TikTok and Instagram!

---

## Daily Operation

### Generate Content (30 seconds)

```bash
node agents/marketing-orchestrator.js --generate --count 2
```

### Schedule to Platforms (30 seconds)

```bash
node agents/marketing-orchestrator.js --adapt
node agents/marketing-orchestrator.js --schedule
```

Or run both:

```bash
node agents/marketing-orchestrator.js --run
```

---

## Optional: Automate with Cron

### Setup Daily Generation (5 AM)

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 5 AM)
0 5 * * * cd /path/to/marketing-agent && node agents/marketing-orchestrator.js --run
```

### Setup Daily Analytics (midnight)

```bash
0 0 * * * cd /path/to/marketing-agent && node agents/marketing-orchestrator.js --analyze --days 1
```

---

## First Week Workflow

**Day 1:** Setup + generate 3 posts  
**Days 2-7:** Generate 2-3 posts daily  
**End of week:** Analyze performance

```bash
# Daily (30 min)
node agents/marketing-orchestrator.js --generate --count 2
node agents/marketing-orchestrator.js --run

# Friday end-of-week (2 min)
node agents/marketing-orchestrator.js --analyze --days 7
```

---

## Testing Without Real APIs (MOCK_MODE)

Test the entire workflow without API keys:

```bash
MOCK_MODE=true node agents/marketing-orchestrator.js --run
```

Generates fake posts, schedules them, collects mock analytics. Perfect for testing.

---

## Troubleshooting

### "Config not found"

```bash
node agents/marketing-orchestrator.js --setup
```

### "OpenAI API key missing"

Add `OPENAI_API_KEY=sk-...` to `.env`

### "Postiz API error"

1. Check your API key in Postiz dashboard
2. Verify account has active platform integrations
3. Restart after updating

### "TikTok posts not showing in drafts"

1. New TikTok accounts need 7-14 days warmup
2. Scroll TikTok 30-60 min/day, like videos, follow creators
3. Posts go to **Drafts** — you add audio manually before publishing

### Posts stuck in "pending"

```bash
# Check status
node agents/marketing-orchestrator.js --status

# Force retry
node agents/marketing-orchestrator.js --retry-failed
```

---

## Next Steps

- Read **AGENT.md** for full architecture
- Check **SKILL_GRAPH_REFERENCE.md** for all available skills
- See **CLIENT_SETUP.md** for multi-client deployment
- Review **SECURITY_AUDIT.md** for what we audited

---

## Support

- **Docs:** See README.md for all documentation
- **Issues:** Check GitHub issues or email support
- **Community:** Join our Discord for questions

---

**That's it!** You now have a marketing automation agent.

Start simple: generate 3 posts, schedule them, analyze results at end of week.

Then expand: add YouTube, LinkedIn, email campaigns via the skill graph.

