---
name: atlas
title: Atlas — Multi-Platform Marketing Automation
description: Automate social media content for TikTok and Instagram. Generate AI images, schedule posts across platforms, track analytics, and optimize hook performance.
version: 0.1.0-framework-aligned
status: production
triggers:
  - "Generate content for TikTok"
  - "Schedule posts to Instagram"
  - "Create multi-platform posts"
  - "Analyze social media performance"
  - "Automate content posting"
exclusions:
  - One-off social media advice ("What should I post about?")
  - Manual content editing or design
  - Account creation or setup assistance
  - Influencer outreach
---

# Atlas — Social Media Automation

**Generate, adapt, schedule, and optimize content across TikTok and Instagram.** One hook. Multiple platforms. Automated posting. Daily analytics.

---

## What It Does

1. **Generate** — AI images + text overlays based on your content hooks
2. **Adapt** — Platform-specific formatting (TikTok 9:16 vs Instagram 1:1)
3. **Schedule** — Multi-platform posting via Postiz
4. **Track** — Daily performance metrics and insights
5. **Optimize** — Identify top-performing hooks, stop underperformers

---

## Quick Start

### 1. Setup (2 minutes)

```bash
npm install
cp .env.template .env
node scripts/onboarding.js  # Answer 5 questions about your business
```

### 2. Generate Posts (1 minute)

```bash
node scripts/generate-content.js --count 3
```

Creates 3 images + text overlays in `data/posts/`.

### 3. Schedule (1 minute)

```bash
node scripts/schedule-posts.js --posts 3
```

Posts scheduled to all enabled platforms. **TikTok:** Must add audio manually in-app.

### 4. Monitor Performance (1 minute)

```bash
node scripts/daily-report.js
```

Tomorrow's digest shows views, engagement, hook performance.

---

## Core Commands

| Task | Command |
|------|---------|
| **Setup config** | `node scripts/onboarding.js` |
| **Validate setup** | `node scripts/validate-config.js` |
| **Generate posts** | `node scripts/generate-content.js --count N` |
| **Adapt platforms** | `node scripts/adapt-for-platform.js --adaptAll` |
| **Schedule posts** | `node scripts/schedule-posts.js --posts N` |
| **Collect metrics** | `node scripts/collect-analytics.js --days 7` |
| **Analyze hooks** | `node scripts/analyze-performance.js` |
| **Daily report** | `node scripts/daily-report.js` |

See `QUICK_START.md` for detailed command reference.

---

## Configuration

### Create Your Config
```bash
node scripts/onboarding.js
```

Generates:
- **atlas-config.json** — Business profile + platform settings
- **atlas-strategy.json** — Content hooks + posting schedule

### Customize (Optional)
Edit `atlas-config.json`:
```json
{
  "business": {
    "name": "Your Name",
    "audience": "Your Target Audience",
    "positioning": "Your Unique Value"
  },
  "platforms": {
    "tiktok": { "enabled": true, "postingSchedule": ["07:30", "16:30"] },
    "instagram": { "enabled": true, "postingSchedule": ["11:00", "18:00"] }
  }
}
```

Edit `atlas-strategy.json` to customize content hooks, posting frequency, content mix.

---

## Prerequisites

**Required:**
- Node.js v18+
- OpenAI API key (gpt-image-1.5)
- Postiz account + API key
- Creator accounts on TikTok and/or Instagram

**Optional (Phase 2):**
- ElevenLabs (voice-overs)
- Other platforms (YouTube, LinkedIn, etc.)

---

## How It Works

**Daily workflow (30 min):**

```bash
# Morning: Review yesterday
node scripts/daily-report.js

# Midday: Create new content
node scripts/generate-content.js --count 2
node scripts/adapt-for-platform.js --adaptAll

# Afternoon: Schedule for later
node scripts/schedule-posts.js --posts 2
```

**Weekly workflow:**
```bash
# Analyze performance
node scripts/collect-analytics.js --days 7
node scripts/analyze-performance.js

# Generate week's content
node scripts/generate-content.js --count 14
node scripts/schedule-posts.js --posts 14
```

See `QUICK_START.md` for full workflow guide.

---

## Key Concepts

### Hooks
A "hook" is your content idea. Examples:
- "I spent 10 hours a week on repetitive tasks. Then I built this..."
- "3 mistakes every creator makes"
- "How to save 5 hours/week with automation"

Atlas recommends content mix:
- 40% narratives (before/after, lessons)
- 30% tutorials (how-to, tips)
- 20% showcases (demos, social proof)
- 10% engagement (questions, polls)

### Performance Tracking
Each hook is tracked:
- Views, engagement rate, conversion rate
- Platform-by-platform breakdowns
- Recommendations (keep, test more, stop)

### Adapting for Platforms
One hook → Multiple versions:
- **TikTok:** 9:16, 6 slides, dynamic text
- **Instagram:** 9:16, 5 slides, Instagram style
- **Phase 2:** YouTube Shorts, LinkedIn, Reddit, Facebook

---

## Platform Notes

### TikTok
- New accounts need 7-14 days warmup (30-60 min/day native usage)
- Posts go to **drafts** — you must manually add audio before publishing
- Best results: 3x daily posting, trending sounds

### Instagram
- Reels perform 40-67% better than feed posts
- Best times: 11am-1pm, 5-7pm
- Post 1-2x daily for algorithm boost

See `references/PLATFORM_GUIDELINES.md` for all platform details.

---

## Testing Framework

### Trigger Testing (Does it activate correctly?)
- ✓ "Generate TikTok content" → activates
- ✓ "Schedule posts to Instagram" → activates
- ✗ "Write me a blog post" → does NOT activate

### Functionality Testing (Does it work end-to-end?)
- [ ] Config creation works
- [ ] Image generation works (mock or real)
- [ ] Platform adaptation works
- [ ] Scheduling works (dry-run or real)
- [ ] Analytics collection works

### Reliability Testing (Does it consistently work?)
- [ ] 10 runs without errors
- [ ] Handles missing files gracefully
- [ ] Clear error messages
- [ ] Recovery from API failures

**Run tests:**
```bash
MOCK_MODE=true node scripts/generate-content.js --count 5
MOCK_MODE=true node scripts/schedule-posts.js --posts 5 --dryRun
node scripts/validate-config.js
```

---

## Cost & ROI

**Monthly cost:** ~$50-100 (Postiz $50-99, OpenAI pay-as-you-go ~$10)

**Example ROI:**
- 30 posts/mo × 5K views = 150K views
- 150K views × 0.2% conversion = 300 sign-ups
- 300 sign-ups × $50 value = $15K revenue
- **ROI:** 150x on $100 investment

See `references/ADVANCED_CONFIG.md` for detailed cost breakdown.

---

## Next: Phase 2

- Video generation (Runway ML)
- Voice-overs (ElevenLabs)
- Additional platforms (YouTube, LinkedIn, Reddit, Facebook)
- Advanced A/B testing
- CRM integration

See `PHASE_2_ROADMAP.md` for timeline.

---

## Support

- **Detailed setup:** See `QUICK_START.md`
- **Advanced config:** See `ADVANCED_CONFIG.md`
- **Platform specifics:** See `references/PLATFORM_GUIDELINES.md`
- **Troubleshooting:** See `TROUBLESHOOTING.md`

---

**Ready to automate?**
```bash
npm install && node scripts/onboarding.js
```

