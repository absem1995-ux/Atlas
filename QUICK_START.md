# QUICK_START.md — 5-Minute Setup

> **First time installing?** Start with `LAUNCH_CHECKLIST.md` for step-by-step setup.

## Step 1: Install (1 min)

```bash
cd skills/atlas
npm install
cp .env.template .env
```

## Step 2: Configure (2 min)

Interactive setup:
```bash
node scripts/onboarding.js
```

Answer 5 questions:
1. Business name + audience
2. Which platforms (TikTok, Instagram, both)
3. Posting schedule (how many posts/day)
4. Content style (professional, casual, technical)
5. Primary content hook category

Creates:
- `atlas-config.json` (your profile)
- `atlas-strategy.json` (your hooks)

## Step 3: Test in Mock Mode (2 min)

No API keys needed — test locally:

```bash
MOCK_MODE=true node scripts/generate-content.js --count 2
MOCK_MODE=true node scripts/adapt-for-platform.js --adaptAll
MOCK_MODE=true node scripts/schedule-posts.js --posts 2 --dryRun
```

You'll see:
- 2 generated images in `data/posts/`
- Adapted versions for TikTok + Instagram
- Dry-run scheduling output

## Step 4: Add Real Credentials (Optional)

Edit `.env`:
```
OPENAI_API_KEY=sk-...
POSTIZ_API_KEY=...
MOCK_MODE=false
```

Then run actual commands (no `MOCK_MODE`).

## Common Commands

```bash
# Generate 3 posts
node scripts/generate-content.js --count 3

# Adapt all posts to all platforms
node scripts/adapt-for-platform.js --adaptAll

# Schedule to platforms (dry-run first)
node scripts/schedule-posts.js --posts 3 --dryRun
node scripts/schedule-posts.js --posts 3

# Validate setup
node scripts/validate-config.js

# Collect analytics
node scripts/collect-analytics.js --days 7

# Analyze what's working
node scripts/analyze-performance.js

# Morning digest
node scripts/daily-report.js
```

## Troubleshooting Quick Fixes

| Problem | Fix |
|---------|-----|
| "Config not found" | Run `node scripts/onboarding.js` |
| "OpenAI key missing" | Add `OPENAI_API_KEY` to `.env` |
| "Postiz error" | Check `POSTIZ_API_KEY` in `.env` |
| "No posts found" | Run `node scripts/generate-content.js --count 3` first |
| "Want to test without APIs?" | Set `MOCK_MODE=true` |

## Daily Workflow (30 min)

```bash
# Morning
node scripts/daily-report.js

# During day
node scripts/generate-content.js --count 2

# Afternoon
node scripts/adapt-for-platform.js --adaptAll
node scripts/schedule-posts.js --posts 2
```

## Next: Full Reference

See `ADVANCED_CONFIG.md` for:
- All command options
- Custom hook configuration
- Platform-specific settings
- Performance optimization

See `references/PLATFORM_GUIDELINES.md` for:
- TikTok best practices
- Instagram best practices
- Platform-specific timing + formats
