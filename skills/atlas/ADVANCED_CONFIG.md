# ADVANCED_CONFIG.md — Detailed Configuration & Options

## All Commands

### Onboarding & Setup

```bash
# Interactive setup
node scripts/onboarding.js

# Validate existing config
node scripts/onboarding.js --validate

# Pre-flight checklist
node scripts/validate-config.js
```

### Content Generation

```bash
# Generate N posts
node scripts/generate-content.js --count 3

# Generate with specific hook
node scripts/generate-content.js --hook narrative_001

# List available hooks
node scripts/generate-content.js --listHooks

# Mock mode (no API)
MOCK_MODE=true node scripts/generate-content.js --count 3
```

### Platform Adaptation

```bash
# Adapt all posts to all platforms
node scripts/adapt-for-platform.js --adaptAll

# Adapt to specific platform
node scripts/adapt-for-platform.js --platform tiktok

# List posts
node scripts/adapt-for-platform.js --listPosts

# List platforms
node scripts/adapt-for-platform.js --listPlatforms
```

### Scheduling

```bash
# Schedule N posts
node scripts/schedule-posts.js --posts 5

# Schedule to specific platform only
node scripts/schedule-posts.js --posts 5 --platform instagram

# Dry-run (preview, don't actually schedule)
node scripts/schedule-posts.js --posts 5 --dryRun

# Schedule starting at specific date
node scripts/schedule-posts.js --posts 20 --startDate 2026-02-24
```

### Analytics

```bash
# Yesterday's data
node scripts/collect-analytics.js

# Specific date
node scripts/collect-analytics.js --date 2026-02-18

# Last 7 days
node scripts/collect-analytics.js --days 7

# Specific platform only
node scripts/collect-analytics.js --platform tiktok --days 7
```

### Performance Analysis

```bash
# Default (7 days)
node scripts/analyze-performance.js

# 14 days
node scripts/analyze-performance.js --days 14

# Specific platform
node scripts/analyze-performance.js --platform instagram --days 7

# Show recommendations
node scripts/analyze-performance.js --recommendations
```

### Daily Report

```bash
# Print to console
node scripts/daily-report.js

# Save to file
node scripts/daily-report.js --save

# HTML format
node scripts/daily-report.js --format html

# Email (requires SMTP config)
node scripts/daily-report.js --email your@email.com
```

---

## Configuration Files

### atlas-config.json Structure

```json
{
  "business": {
    "name": "Your Business Name",
    "tagline": "Your unique value prop",
    "audience": "Primary audience",
    "positioning": "How you position yourself",
    "website": "https://example.com",
    "industry": "Your industry"
  },
  
  "platforms": {
    "tiktok": {
      "enabled": true,
      "accountHandle": "@yourhandle",
      "accountId": "optional_id",
      "postingSchedule": ["07:30", "16:30", "21:00"],
      "aspectRatio": "9:16",
      "slidesPerPost": 6,
      "textStyle": "dynamic"
    },
    "instagram": {
      "enabled": true,
      "accountHandle": "@yourhandle",
      "accountId": "optional_id",
      "postingSchedule": ["11:00", "18:00"],
      "aspectRatio": "9:16",
      "slidesPerPost": 5,
      "textStyle": "instagram",
      "postType": "reel"
    }
  },
  
  "imageGeneration": {
    "provider": "openai",
    "model": "gpt-image-1.5",
    "quality": "high",
    "style": "professional"
  },
  
  "postiz": {
    "enabled": true,
    "autoSchedule": true,
    "optimizeTimings": true,
    "retryFailed": true
  },
  
  "content": {
    "textLength": {
      "tiktok": { "min": 5, "max": 100 },
      "instagram": { "min": 5, "max": 80 }
    },
    "ctas": ["Subscribe", "Join our list", "Learn more"],
    "hashtags": {
      "tiktok": { "count": 3, "research": "auto" },
      "instagram": { "count": 15, "research": "auto" }
    },
    "toneOfVoice": "professional_friendly"
  },
  
  "analytics": {
    "trackHookPerformance": true,
    "dailyReports": true,
    "performanceThresholds": {
      "lowEngagementRate": 0.01,
      "lowConversionRate": 0.002
    }
  }
}
```

### atlas-strategy.json Structure

```json
{
  "contentStrategy": {
    "primaryGoal": "growth",
    "secondaryGoals": ["engagement", "conversions"],
    "contentTone": "educational",
    "frequency": {
      "tiktok": 3,
      "instagram": 2
    }
  },
  
  "hooks": [
    {
      "id": "narrative_001",
      "category": "narrative",
      "hook": "I spent 10 hours a week on repetitive tasks. Then I built this...",
      "context": "Problem-solution format",
      "status": "testing",
      "performanceData": {
        "impressions": 45000,
        "engagementRate": 0.087,
        "clickRate": 0.023
      }
    },
    {
      "id": "tutorial_001",
      "category": "tutorial",
      "hook": "3 mistakes every creator makes",
      "context": "How-to, tips, step-by-step",
      "status": "testing",
      "performanceData": {}
    }
  ],
  
  "contentMix": {
    "narratives": 0.40,
    "tutorials": 0.30,
    "showcases": 0.20,
    "engagement": 0.10
  },
  
  "contentCalendar": {
    "weekdayFrequency": 3,
    "weekendFrequency": 2,
    "peakDays": ["Tuesday", "Thursday"],
    "avoidDays": []
  }
}
```

---

## Environment Variables (.env)

```bash
# API Keys
OPENAI_API_KEY=sk-...
POSTIZ_API_KEY=...

# Mode
MOCK_MODE=false              # Set to true for testing without APIs
LOG_LEVEL=info              # debug, info, warn, error

# Analytics (Optional)
GOOGLE_ANALYTICS_ID=...     # For tracking conversions
HOTJAR_ID=...              # For heatmaps

# Email Reports (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=app_password

# Advanced
POSTIZ_RETRY_ATTEMPTS=3
API_TIMEOUT_MS=30000
```

---

## Hook Performance Tracking

Atlas auto-tracks performance in `hooks-performance.json`:

```json
{
  "hooks": {
    "narrative_001": {
      "hook": "I spent 10 hours a week on repetitive tasks. Then I built this...",
      "category": "narrative",
      "tests": [
        {
          "date": "2026-02-18",
          "platform": "tiktok",
          "impressions": 15000,
          "engagementRate": 0.092,
          "clickRate": 0.024,
          "status": "success"
        }
      ],
      "summary": {
        "totalImpressions": 45000,
        "avgEngagementRate": 0.087,
        "status": "keep_testing",
        "recommendation": "Performance above average. Continue posting 2-3x/week."
      }
    }
  }
}
```

---

## Cost Breakdown

### Monthly Costs

| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| **Postiz** | Starter | $50/mo | All 6 platforms |
| **Postiz** | Growth | $99/mo | Better analytics |
| **OpenAI** | Pay-as-you-go | ~$10/mo | ~$0.04 per image |
| **ElevenLabs** | Light | $10/mo | Voice-overs (optional) |
| **ElevenLabs** | Pro | $99/mo | Unlimited (optional) |
| **Epidemic Sound** | Basic | $99/mo | Music (optional) |

**Total (core MVP):** $50-60/mo  
**Total (with voice + music):** $150-250/mo

### ROI Calculation

**Baseline (30 posts/month):**
- 30 posts × 5,000 views avg = 150,000 impressions
- 150,000 × 0.2% CTR = 300 clicks
- 300 clicks × 5% conversion = 15 conversions
- 15 conversions × $50 value = $750 revenue
- **ROI:** 12x on $60 cost

**Optimized (90 posts/month, higher CTR):**
- 90 posts × 8,000 views avg = 720,000 impressions
- 720,000 × 0.5% CTR = 3,600 clicks
- 3,600 clicks × 10% conversion = 360 conversions
- 360 conversions × $150 value = $54,000 revenue
- **ROI:** 450x on $120 cost

---

## Performance Optimization Tips

### Quick Wins
1. **Start with narratives** — Problem → Solution → Result format wins
2. **Keep hooks under 50 chars** — First impression matters
3. **Post 3x/day on TikTok** — Algorithm favors frequency
4. **Test Tuesday/Thursday** — Best engagement days
5. **Add CTAs consistently** — "Subscribe," "Join," "Learn more"

### Advanced Tactics
1. **Hook rotation** — Test 5 new hooks/month, kill bottom 2
2. **Time optimization** — Track what time gets best views for YOUR audience
3. **Platform-specific focus** — Master TikTok first, then Instagram
4. **Audio strategy** — TikTok trending sounds > original audio (for MVPs)
5. **Visual consistency** — Same filter, font, brand colors across all content

### Measure Success
- **Early stage:** 1% engagement rate = good
- **Established:** 3-5% engagement rate = strong
- **Viral:** 5%+ engagement rate = exceptional

### Stop Underperformers
When hook underperforms (<0.5% engagement):
1. Test 3 variations with different CTAs
2. If still low, archive and move to new hook
3. Revisit after 30 days if strategy changes

---

## Phase 2 Features (Coming)

### Video Generation
- Runway ML integration ($540/mo)
- Auto-generate 30-60 second videos from hooks
- B-roll sourcing + music sync
- ETA: Q2 2026

### Voice-Overs
- ElevenLabs TTS ($10-99/mo)
- Natural-sounding narration
- Multi-language support
- ETA: Q1 2026

### Advanced Analytics
- Cross-platform attribution
- Audience demographic insights
- Competitor benchmarking
- Custom dashboards
- ETA: Q2 2026

### Additional Platforms
- YouTube Shorts (native)
- LinkedIn (documents + Shorts)
- Reddit (community-aware posting)
- Facebook (Reels + feed)
- ETA: Q2 2026

### CRM Integration
- Zapier integration
- Sync leads to email list
- Track conversions end-to-end
- ETA: Q3 2026

---

## Troubleshooting

### "API rate limit exceeded"
**Fix:** Wait 5 minutes before retrying. Postiz has limits—check dashboard.

### "Invalid image aspect ratio"
**Fix:** Ensure `aspectRatio` in config matches platform expectations (e.g., "9:16" not "9/16").

### "TikTok posts not publishing"
**Fix:** TikTok requires manual audio selection. Posts go to drafts—add audio in-app before scheduled time.

### "Instagram Reels failing"
**Fix:** Ensure account is business/creator. Personal accounts can't post Reels via API.

### "Mock mode not working"
**Fix:** Set `MOCK_MODE=true` before running command: `MOCK_MODE=true node scripts/generate-content.js`

---

## Support

For issues, see `TROUBLESHOOTING.md` or check Discord community.
