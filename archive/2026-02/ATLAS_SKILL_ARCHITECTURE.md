# ATLAS Skill Architecture Design

**Status:** Milestone 2 — Complete Blueprint  
**Date:** February 18, 2026  
**Ready for:** Implementation (Milestone 3)

---

## PART 1: DIRECTORY STRUCTURE

```
skills/atlas/
│
├── SKILL.md                              # Main skill documentation + onboarding
├── _meta.json                            # Metadata (version, owner, slug)
│
├── scripts/                              # All executable modules
│   ├── onboarding.js                     # Config setup & validation
│   ├── generate-content.js               # Image gen + text overlay
│   ├── schedule-posts.js                 # Multi-platform posting via Postiz
│   ├── collect-analytics.js              # Pull metrics from all platforms
│   ├── analyze-performance.js            # Hook performance + trending
│   ├── adapt-for-platform.js             # Platform-specific content tweaks
│   ├── add-voiceover.js                  # Optional: ElevenLabs integration
│   ├── daily-report.js                   # Morning digest of what worked
│   └── validate-config.js                # Pre-flight checklist
│
├── references/                           # Supporting docs
│   ├── platform-guidelines.md            # TikTok, Instagram, YouTube, LinkedIn specs
│   ├── content-formats.md                # What works where (dimensions, length, hooks)
│   ├── hook-library.md                   # Proven hooks by category
│   ├── api-integration-guide.md          # How to set up each platform API
│   ├── analytics-metrics.md              # What we measure per platform
│   ├── adaptation-rules.md               # How to convert content between platforms
│   └── troubleshooting.md                # Common issues + fixes
│
├── config/                               # Template configs
│   ├── atlas-config.template.json        # User fills this in
│   ├── atlas-strategy.template.json      # Content strategy
│   └── audio-strategy.template.json      # Optional voiceovers
│
├── data/                                 # Runtime data (gitignored)
│   ├── posts/                            # Generated content + metadata
│   ├── analytics/                        # Daily analytics snapshots
│   ├── hooks-performance.json            # Hook testing results
│   ├── platform-tokens.json              # OAuth tokens (encrypted)
│   └── campaign-state.json               # Current campaign tracking
│
└── .clawhub/                             # ClawHub metadata
    └── manifest.json                     # Skill listing

```

---

## PART 2: CONFIG SCHEMAS

### 2.1 atlas-config.json (Core Setup)

```json
{
  "business": {
    "name": "OpenClaw",
    "description": "AI-powered workflow automation platform",
    "audience": "Developers, entrepreneurs, automation enthusiasts",
    "positioning": "Set-it-and-forget-it automation that works",
    "website": "https://openclaw.ai",
    "callToAction": "Join the Discord for setup help"
  },

  "imageGeneration": {
    "provider": "openai",
    "model": "gpt-image-1.5",
    "apiKey": "${OPENAI_API_KEY}",
    "defaultResolution": "1024x1024",
    "style": "photorealistic"
  },

  "postiz": {
    "apiKey": "${POSTIZ_API_KEY}",
    "workspace": "oliverhenry",
    "integrationIds": {
      "tiktok": "tiktok_integration_123",
      "instagram": "instagram_integration_456",
      "youtube": "youtube_integration_789",
      "linkedin": "linkedin_integration_abc",
      "reddit": "reddit_integration_def",
      "facebook": "facebook_integration_ghi"
    }
  },

  "platforms": {
    "tiktok": {
      "enabled": true,
      "accountType": "creator",
      "username": "@openclaw",
      "postingSchedule": ["07:30", "16:30", "21:00"],
      "privacyLevel": "SELF_ONLY",
      "warmupComplete": false,
      "warmupStartDate": "2026-02-18"
    },
    "instagram": {
      "enabled": true,
      "accountType": "creator",
      "username": "openclaw",
      "postingSchedule": ["09:00", "18:00"],
      "contentType": "reels",
      "privacyLevel": "PUBLIC"
    },
    "youtube": {
      "enabled": true,
      "channelId": "UC...",
      "postingSchedule": ["12:00"],
      "contentType": "shorts",
      "privacyLevel": "PUBLIC"
    },
    "linkedin": {
      "enabled": true,
      "profileUrl": "https://linkedin.com/company/openclaw",
      "accountType": "organization",
      "postingSchedule": ["09:00", "14:00"],
      "contentType": "posts"
    },
    "reddit": {
      "enabled": false,
      "subreddits": [],
      "postingSchedule": [],
      "postingMode": "manual"
    },
    "facebook": {
      "enabled": false,
      "pageId": "",
      "postingSchedule": []
    }
  },

  "content": {
    "hookMix": {
      "narratives": 0.40,
      "tutorials": 0.30,
      "showcases": 0.20,
      "engagement": 0.10
    },
    "callsToAction": [
      "Join our Discord: discord.gg/clawd",
      "Check out the docs: docs.openclaw.ai",
      "DM for setup help",
      "Star us on GitHub: github.com/openclaw/openclaw"
    ],
    "toneOfVoice": "Practical, developer-focused, no fluff"
  },

  "audio": {
    "voiceoverEnabled": false,
    "voiceoverProvider": "elevenlabs",
    "voiceoverApiKey": "${ELEVENLABS_API_KEY}",
    "nativeAudioStrategy": "use_platform_defaults",
    "musicLicense": "platform_native"
  },

  "analytics": {
    "trackingMode": "platform_apis",
    "minimumViewsToReport": 500,
    "dailyReportTime": "08:00",
    "reportingTimezone": "UTC"
  }
}
```

### 2.2 atlas-strategy.json (Content Strategy)

```json
{
  "campaign": {
    "name": "OpenClaw Launch",
    "startDate": "2026-02-18",
    "theme": "Workflow automation wins"
  },

  "hooks": {
    "narratives": [
      {
        "id": "narrative_001",
        "hook": "I spent 10 hours a week on repetitive tasks. Then I built this...",
        "pattern": "Problem → Solution → Result",
        "keywords": ["automation", "workflow", "time saved"],
        "category": "before_after",
        "status": "testing"
      },
      {
        "id": "narrative_002",
        "hook": "This agent handles my entire customer support pipeline",
        "pattern": "Showcase → Technical detail → CTA",
        "keywords": ["agent", "automation", "support"],
        "category": "showcase",
        "status": "testing"
      }
    ],
    "tutorials": [
      {
        "id": "tutorial_001",
        "hook": "3 ways to automate your email management",
        "steps": 3,
        "keywords": ["email", "automation", "productivity"],
        "category": "how_to",
        "status": "testing"
      }
    ],
    "showcases": [
      {
        "id": "showcase_001",
        "hook": "Building a multi-agent system in 100 lines of code",
        "keywords": ["agents", "coding", "architecture"],
        "category": "technical",
        "status": "testing"
      }
    ],
    "engagement": [
      {
        "id": "engagement_001",
        "hook": "What's the most annoying repetitive task you do daily?",
        "questionType": "open_ended",
        "category": "community_poll"
      }
    ]
  },

  "contentCalendar": {
    "weeklyStructure": {
      "monday": ["narrative"],
      "tuesday": ["tutorial", "showcase"],
      "wednesday": ["narrative"],
      "thursday": ["tutorial", "engagement"],
      "friday": ["showcase"],
      "saturday": ["narrative"],
      "sunday": ["engagement"]
    },
    "postingFrequency": {
      "tiktok": 3,
      "instagram": 2,
      "youtube": 1,
      "linkedin": 2
    }
  },

  "performance": {
    "topPerformers": [],
    "underperformers": [],
    "recommendations": []
  }
}
```

### 2.3 hooks-performance.json (Tracking)

```json
{
  "hooks": [
    {
      "hookId": "narrative_001",
      "hookText": "I spent 10 hours a week on repetitive tasks...",
      "category": "narrative",
      "tests": [
        {
          "postId": "tiktok_post_12345",
          "platform": "tiktok",
          "postedAt": "2026-02-18T07:30:00Z",
          "metrics": {
            "views": 15420,
            "likes": 823,
            "comments": 156,
            "shares": 42,
            "completionRate": 0.78
          },
          "performance": "above_average"
        }
      ],
      "stats": {
        "totalTests": 3,
        "avgViews": 12100,
        "engagementRate": 0.067,
        "status": "proven"
      }
    }
  ],

  "rules": {
    "doubleDown": ["narrative_001", "showcase_001"],
    "testing": ["tutorial_002", "engagement_001"],
    "dropped": []
  }
}
```

---

## PART 3: DATA STRUCTURES

### 3.1 Post Object (Generated Content)

```json
{
  "postId": "atlas_post_001",
  "campaignId": "openclaw_launch_001",
  "createdAt": "2026-02-18T10:00:00Z",
  "content": {
    "hookId": "narrative_001",
    "hookText": "I spent 10 hours a week on repetitive tasks. Then I built this...",
    "imageUrl": "file:///posts/narrative_001_slide1.png",
    "slides": [
      {
        "slideNumber": 1,
        "text": "10 hours per week → wasted on repetitive tasks",
        "imageUrl": "...",
        "duration": 4
      }
    ],
    "voiceover": null,
    "audioTrack": "platform_default",
    "cta": "Join our Discord: discord.gg/clawd"
  },
  "posting": {
    "scheduledFor": "2026-02-18T07:30:00Z",
    "platforms": ["tiktok", "instagram"],
    "status": "scheduled",
    "postizDraftId": "draft_xyz789"
  },
  "analytics": {
    "views": 0,
    "engagement": 0,
    "lastUpdated": null
  }
}
```

### 3.2 Analytics Snapshot (Daily)

```json
{
  "date": "2026-02-18",
  "platform": "tiktok",
  "posts": [
    {
      "postId": "tiktok_post_001",
      "hookCategory": "narrative",
      "metrics": {
        "views": 15420,
        "likes": 823,
        "comments": 156,
        "shares": 42,
        "completionRate": 0.78,
        "engagement": 0.067
      },
      "performance": "above_average"
    }
  ],
  "platformStats": {
    "totalViews": 187650,
    "totalEngagement": 12456,
    "topPost": "narrative_001",
    "avgEngagementRate": 0.065
  },
  "insights": [
    "Narrative hooks outperforming tutorials 3.2x",
    "Best time: 7:30 AM UTC (42% higher views)",
    "Shorts format getting 2x more shares than feed posts"
  ]
}
```

---

## PART 4: SCRIPT SPECIFICATIONS

### 4.1 onboarding.js

**Purpose:** Conversational setup, config generation, validation

**Flow:**
1. Ask business questions (name, audience, positioning)
2. Ask platform preferences (which to enable)
3. Ask posting schedule preferences
4. Validate API credentials (TikTok, Instagram, YouTube, LinkedIn, Postiz)
5. Generate `atlas-config.json`
6. Prompt for strategy input (hooks, content mix)
7. Generate `atlas-strategy.json`
8. Run validation tests

**Output:** Complete, validated config files

**Usage:**
```bash
node onboarding.js --init
node onboarding.js --validate --config atlas-config.json
```

### 4.2 generate-content.js

**Purpose:** Generate images, add text overlays, create posts

**Flow:**
1. Load atlas-config.json + atlas-strategy.json
2. Select hook based on content calendar
3. Generate image via OpenAI gpt-image-1.5
4. Create slides (up to 6 per post)
5. Add text overlays using node-canvas
6. Save to `/posts` directory
7. Create post metadata JSON

**Output:** 
- Generated image files
- Post metadata + scheduling info

**Usage:**
```bash
node generate-content.js --platform tiktok --hook narrative_001
node generate-content.js --platform instagram --count 3
```

### 4.3 schedule-posts.js

**Purpose:** Send posts to Postiz, schedule for all platforms

**Flow:**
1. Load generated posts from `/posts`
2. Adapt content per platform (resolution, text, dimensions)
3. Call Postiz API to create drafts
4. Schedule for specified times
5. Return Postiz draft IDs
6. Update post metadata with scheduling info

**Output:** Scheduled posts, draft IDs

**Usage:**
```bash
node schedule-posts.js --posts 5 --startDate 2026-02-19
node schedule-posts.js --platform tiktok --time 07:30
```

### 4.4 collect-analytics.js

**Purpose:** Pull daily metrics from all platforms

**Flow:**
1. Connect to each platform API (TikTok, Instagram, YouTube, LinkedIn)
2. Fetch yesterday's post metrics
3. Aggregate by hook category
4. Calculate engagement rates
5. Save to `/analytics` directory
6. Identify top/bottom performers

**Output:** Daily analytics JSON

**Usage:**
```bash
node collect-analytics.js --date 2026-02-18
node collect-analytics.js --platform tiktok
```

### 4.5 analyze-performance.js

**Purpose:** Identify what's working, recommend optimizations

**Flow:**
1. Load recent analytics + hook-performance.json
2. Calculate average performance per hook
3. Flag underperformers (< 1K views, < 5% engagement)
4. Flag overperformers (> 20K views, > 10% engagement)
5. Analyze patterns (timing, format, content type)
6. Generate recommendations
7. Update `hooks-performance.json`

**Output:** Insights + optimization recommendations

**Usage:**
```bash
node analyze-performance.js --days 7
node analyze-performance.js --report daily
```

### 4.6 adapt-for-platform.js

**Purpose:** Convert content between platforms

**Flow:**
1. Load generated post (designed for TikTok)
2. Adapt for target platform:
   - **Instagram:** Crop to 9:16, add borders if needed
   - **YouTube Shorts:** Same (9:16)
   - **LinkedIn:** Convert to 1:1 or 4:5, add professional text
   - **Reddit:** Resize for subreddit specs, adjust text
   - **Facebook:** Convert to 1:1 for feed, 9:16 for stories
3. Adjust text overlay (platform-specific max char limits)
4. Optimize CTA for platform (TikTok: "follow", LinkedIn: "comment", etc.)
5. Save adapted version

**Output:** Platform-specific post files

**Usage:**
```bash
node adapt-for-platform.js --from tiktok --to linkedin --postId post_001
node adapt-for-platform.js --adaptAll
```

### 4.7 add-voiceover.js (Optional, Phase 2)

**Purpose:** Add voice narration to posts (optional feature)

**Flow:**
1. Check if voiceoverEnabled in config
2. Load post content + hook
3. Generate script (optional, or use provided)
4. Call ElevenLabs API
5. Generate MP3 audio file
6. Overlay audio with video/slideshow
7. Return voiceover version

**Output:** Posts with audio

**Usage:**
```bash
node add-voiceover.js --postId post_001 --voice "Nova"
```

### 4.8 daily-report.js

**Purpose:** Morning digest of performance + recommendations

**Flow:**
1. Load yesterday's analytics
2. Load top performers
3. Load recommendations from analyze-performance.js
4. Format as readable report
5. Send to user (via Telegram, email, or print)

**Output:** Daily digest report

**Usage:**
```bash
node daily-report.js --send telegram
node daily-report.js --date 2026-02-18
```

### 4.9 validate-config.js

**Purpose:** Pre-flight checklist before posting

**Flow:**
1. Check all required configs present
2. Validate API credentials (test calls)
3. Check Postiz integrations active
4. Verify platform accounts connected
5. Warn about warmup status (TikTok)
6. List ready/not-ready status

**Output:** Validation report

**Usage:**
```bash
node validate-config.js
```

---

## PART 5: API INTEGRATION PATTERNS

### 5.1 OAuth Token Management

```javascript
// Pattern for platforms needing OAuth (Instagram, YouTube, LinkedIn, TikTok)

class PlatformAuth {
  async getValidToken(platform) {
    let token = this.loadStoredToken(platform);
    
    if (this.isExpired(token)) {
      token = await this.refreshToken(token);
      this.storeToken(platform, token);
    }
    
    return token;
  }

  async testConnection(platform) {
    const token = await this.getValidToken(platform);
    // Make test API call
    // Return true/false
  }
}
```

### 5.2 Postiz API Integration

```javascript
// All posting goes through Postiz

const postiz = new PostizAPI(config.postiz.apiKey);

async function schedulePost(postData) {
  // 1. Create container/draft
  const draft = await postiz.createDraft({
    platforms: postData.platforms,
    content: postData.content,
    scheduledTime: postData.scheduledFor
  });

  // 2. Get draft ID
  const draftId = draft.id;

  // 3. Schedule for later
  await postiz.scheduleDraft(draftId, postData.scheduledFor);

  return { draftId, status: 'scheduled' };
}
```

### 5.3 Platform-Specific Analytics

```javascript
// Each platform has different API format; we normalize

async function fetchPlatformMetrics(platform, postId) {
  const metrics = {};

  if (platform === 'tiktok') {
    const data = await tiktokAPI.getPostStats(postId);
    metrics.views = data.video_view_count;
    metrics.likes = data.like_count;
    metrics.engagement = (data.like_count + data.comment_count) / data.video_view_count;
  } else if (platform === 'instagram') {
    const data = await instagramAPI.getInsights(postId);
    metrics.views = data.impressions;
    metrics.likes = data.likes;
    metrics.engagement = data.engagement / data.impressions;
  }
  // ... etc for each platform

  return metrics;
}
```

---

## PART 6: SKILL.md STRUCTURE (Preview)

The main SKILL.md will include:

### Section 1: Welcome & Overview
- What Atlas does
- Why multi-platform matters
- Proven results

### Section 2: Onboarding (Conversational)
- "Hey! Let's set up Atlas for you"
- Walk through business questions
- Platform selection
- Account warmup explanation

### Section 3: How It Works
- Flow diagram: generate → adapt → schedule → track → optimize
- Each script's role
- Config files explained

### Section 4: First Run Checklist
- API credentials needed
- Platform account requirements
- Postiz integration setup

### Section 5: Daily Operations
- How to generate content
- How scheduling works
- How to read the daily report

### Section 6: Troubleshooting
- Common issues
- Error messages
- Support resources

---

## PART 7: IMPLEMENTATION READINESS CHECKLIST

### Pre-Build Validation

- [ ] All platform APIs tested (TikTok, Instagram, YouTube, LinkedIn)
- [ ] Postiz API confirmed working
- [ ] OpenAI gpt-image-1.5 confirmed working
- [ ] node-canvas installed and tested
- [ ] OAuth flows mapped for each platform
- [ ] Rate limits documented
- [ ] Error handling strategy defined

### Build Phase Checklist (Milestone 3)

**Phase 3A (Core Pipeline):**
- [ ] onboarding.js working
- [ ] generate-content.js working (image gen + text overlay)
- [ ] schedule-posts.js working (Postiz integration)
- [ ] adapt-for-platform.js working
- [ ] validate-config.js working

**Phase 3B (Analytics Loop):**
- [ ] collect-analytics.js working
- [ ] analyze-performance.js working
- [ ] daily-report.js working

**Phase 3C (Testing):**
- [ ] End-to-end test: generate → schedule → post → track
- [ ] Multi-platform test (all 4 core platforms)
- [ ] Error handling + recovery tests
- [ ] Load testing (what if we post 50 posts at once?)

---

## PART 8: DEPLOYMENT MODEL

**Once skills are built, deploy as standalone agent:**

```
Agent: "Atlas" (Multi-Platform Marketing)
├── Run triggers:
│   ├── Daily at 7:00 AM: Collect analytics from yesterday
│   ├── Daily at 8:00 AM: Generate today's content
│   ├── Scheduled times: Post to platforms (7:30, 16:30, 21:00 etc)
│   └── Daily at 8:30 AM: Send digest report
│
├── Manual triggers:
│   ├── User: "Generate 5 TikTok posts"
│   ├── User: "What's working best this week?"
│   ├── User: "Schedule these posts for Friday"
│
├── Integration points:
│   ├── Receives: Customer questions from Sentinel agent
│   ├── Sends: Marketing insights to other agents
│   └── Shared: Hook library + content patterns with Astra agent
```

---

## NEXT STEPS

**Milestone 3 begins with:**
1. Set up directory structure
2. Create all template files (.template.json)
3. Create references/ documentation
4. Build onboarding.js (Step 1 of build)
5. Build generate-content.js (Step 2)
6. Continue through all scripts

**Timeline:** 8-10 weeks to full deployment

**Current Status:** Architecture complete, ready to build.

