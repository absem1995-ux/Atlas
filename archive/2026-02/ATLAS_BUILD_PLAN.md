# Atlas Skill — Complete Build Plan

**Status:** Milestone 3 — Full Implementation  
**Approach:** Build complete package first, test APIs later  
**Target:** Production-ready skill for deployment on any system

---

## Build Phases

### Phase 3A: Core Posting Pipeline (Weeks 1-2)

**Goal:** Generate → Adapt → Schedule → Deploy to all platforms

**Scripts to Build:**
1. ✅ `scripts/onboarding.js` — Interactive setup, config generation, validation
2. ✅ `scripts/generate-content.js` — Image generation + text overlays
3. ✅ `scripts/adapt-for-platform.js` — Platform-specific content adaptation
4. ✅ `scripts/schedule-posts.js` — Postiz API integration, multi-platform posting
5. ✅ `scripts/validate-config.js` — Pre-flight checklist

**Deliverable:** First end-to-end flow working (generate → schedule)

---

### Phase 3B: Analytics & Optimization (Weeks 2-3)

**Goal:** Collect metrics, analyze performance, optimize hooks

**Scripts to Build:**
1. ✅ `scripts/collect-analytics.js` — Pull metrics from all 6 platforms
2. ✅ `scripts/analyze-performance.js` — Hook analysis + recommendations
3. ✅ `scripts/daily-report.js` — Morning digest + insights

**Deliverable:** Full feedback loop (post → track → optimize)

---

### Phase 3C: Integration & Deployment (Week 3-4)

**Goal:** Package as standalone skill, ready for deployment

**Tasks:**
1. ✅ `SKILL.md` — Main documentation + conversational onboarding guide
2. ✅ `.clawhub/manifest.json` — ClawHub metadata
3. ✅ Comprehensive error handling throughout
4. ✅ Mock API integration for testing without real credentials
5. ✅ Deployment guide for others
6. ✅ Troubleshooting guide

**Deliverable:** Complete, deployable skill package

---

## Implementation Strategy

### A. Build Without Real APIs (Using Mocks)

Each script will have:
- **Real API code** (Postiz, TikTok, Instagram, etc.)
- **Mock mode** (for testing without credentials)
- **Test data** (sample posts, analytics, responses)

```javascript
// Example pattern
class PostizAPI {
  constructor(apiKey, mockMode = false) {
    this.apiKey = apiKey;
    this.mockMode = mockMode;
  }

  async scheduleDraft(draftData) {
    if (this.mockMode) {
      return this.mockScheduleDraft(draftData);
    }
    return this.realScheduleDraft(draftData);
  }

  mockScheduleDraft(draftData) {
    // Return fake but realistic response
    return {
      success: true,
      draftId: `draft_mock_${Date.now()}`,
      platforms: draftData.platforms,
      scheduledFor: draftData.scheduledFor,
      message: '[MOCK] Draft scheduled successfully'
    };
  }

  realScheduleDraft(draftData) {
    // Real API call
    // ...
  }
}
```

### B. Configuration-Driven Design

Users can:
1. Run `onboarding.js` to answer questions
2. Get generated `atlas-config.json`
3. Input their API credentials
4. Run `validate-config.js` to test connection
5. Start generating posts

### C. Error Handling Strategy

Every script includes:
- Try-catch with specific error types
- Helpful error messages ("Missing TikTok API key. Get it from: ...")
- Retry logic with exponential backoff
- Fallback options (e.g., if image gen fails, use placeholder)
- Detailed logging for debugging

### D. Testing Without Real APIs

Each script has:
- `--mock` flag for testing
- Sample data for all operations
- Validation of config structure
- Mock responses that match real API format

```bash
# Run in mock mode (no credentials needed)
node generate-content.js --mock --count 3
node schedule-posts.js --mock --platform tiktok
node collect-analytics.js --mock --date 2026-02-18
```

---

## Script Specifications

### 1. onboarding.js

**Purpose:** Interactive setup, config generation, OAuth credential gathering

**Features:**
- Conversational Q&A (ask one thing at a time)
- Guide through business info
- Platform selection
- Posting schedule preferences
- API credential collection
- OAuth flow instructions for each platform
- Validation of provided credentials
- Generate `atlas-config.json`
- Generate `atlas-strategy.json` with seed hooks

**Input:** User answers to questions
**Output:** Complete, validated config files ready to use

**Error Handling:**
- Invalid input → ask again
- Missing credentials → provide setup links
- Failed validation → specific error + fix instructions

**Mock Mode:**
- Simulate all Q&A
- Generate sample config files
- No user interaction needed

---

### 2. generate-content.js

**Purpose:** Generate images via OpenAI, add text overlays, create posts

**Features:**
- Load atlas-config.json + atlas-strategy.json
- Select hook based on content calendar
- Generate image via OpenAI gpt-image-1.5
- Add text overlays using node-canvas
- Create up to 6 slides per post
- Save images + metadata to `/data/posts`
- Return post object ready for scheduling

**Input:** 
- `--hook hookId` or `--count 3` (generate N posts)
- `--platform tiktok` (optional, defaults to all)

**Output:** 
- Generated image files
- Post metadata JSON
- Ready for scheduling

**Error Handling:**
- OpenAI API errors → retry with exponential backoff
- Canvas errors → fall back to single image
- Missing config → exit with helpful message

**Mock Mode:**
- Generate fake images (solid color + text)
- Create realistic post metadata
- No API calls

---

### 3. adapt-for-platform.js

**Purpose:** Convert content between platforms

**Features:**
- Load post from `/data/posts/`
- Adapt for target platform:
  - TikTok: 9:16, 6 slides max, dynamic text
  - Instagram: 9:16, 5 slides, Instagram-style text
  - YouTube Shorts: 9:16, 6 slides, YouTube CTAs
  - LinkedIn: 1:1, 4-5 slides, professional tone
  - Reddit: 4:3, Reddit-style captions
  - Facebook: 16:9 feed or 9:16 reels
- Adjust text overlay (platform char limits)
- Optimize CTA for platform
- Save adapted version

**Input:**
- `--from tiktok --to linkedin --postId post_001`
- `--adaptAll` (adapt all posts to all enabled platforms)

**Output:**
- Platform-specific post files
- Metadata with platform variants

**Error Handling:**
- Invalid aspect ratio → resize with letterbox/crop
- Text too long → truncate intelligently
- Missing source post → exit with error

**Mock Mode:**
- Simulate resizing
- Simulate text adaptation
- Create mock platform variants

---

### 4. schedule-posts.js

**Purpose:** Send posts to Postiz, schedule for all platforms

**Features:**
- Load posts from `/data/posts/`
- Validate platform configs
- Create Postiz drafts for each platform
- Set scheduling times
- Store draft IDs for later tracking
- Handle TikTok special case (drafts only, manual audio selection)
- Return scheduling confirmation

**Input:**
- `--posts 5` (schedule next 5 posts)
- `--platform tiktok` (schedule only to one platform)
- `--startDate 2026-02-19` (start scheduling from this date)
- `--dryRun` (preview what would be scheduled, don't actually schedule)

**Output:**
- Scheduled posts confirmed
- Draft IDs returned
- Metadata updated with scheduling info

**Error Handling:**
- Postiz API errors → retry or queue for later
- Platform not configured → skip with warning
- Rate limits hit → queue rest for next batch
- Account not ready → helpful message (e.g., "TikTok warmup in progress")

**Mock Mode:**
- Simulate Postiz API responses
- Generate fake draft IDs
- Create mock scheduling confirmation

---

### 5. validate-config.js

**Purpose:** Pre-flight checklist before posting

**Features:**
- Load atlas-config.json
- Check all required fields present
- Test API credentials (mock or real)
- Verify platform accounts connected
- Check Postiz integrations
- Warn about TikTok warmup status
- List ready/not-ready status
- Suggest next steps

**Input:** No arguments (reads config from `atlas-config.json`)

**Output:**
- Validation report (JSON + human-readable)
- List of blockers
- Actionable next steps

**Error Handling:**
- Missing config → create from template
- Invalid credentials → guide to get them
- Incomplete config → show what's missing + how to fix

---

### 6. collect-analytics.js

**Purpose:** Pull daily metrics from all platforms

**Features:**
- Load atlas-config.json
- Connect to each enabled platform API
- Fetch yesterday's post metrics
- Normalize data to common schema
- Aggregate by hook category + platform
- Calculate engagement rates
- Identify top/bottom performers
- Save to `/data/analytics/YYYY-MM-DD.json`
- Return summary

**Input:**
- `--date 2026-02-18` (fetch metrics for this date)
- `--platform tiktok` (fetch only one platform)
- `--days 7` (fetch last 7 days)

**Output:**
- Daily analytics JSON
- Performance summary
- Top/bottom performers list

**Error Handling:**
- API rate limits → queue for later
- Missing token → guide to refresh
- No posts from that date → return empty
- API connection error → retry with backoff

**Mock Mode:**
- Generate realistic fake analytics
- Create sample performance data
- Return mock responses matching real API format

---

### 7. analyze-performance.js

**Purpose:** Identify what's working, recommend optimizations

**Features:**
- Load recent analytics files
- Load hook-performance.json
- Calculate average performance per hook
- Identify underperformers (flag for review)
- Identify overperformers (double down)
- Analyze patterns (timing, format, content type)
- Generate actionable recommendations
- Update hooks-performance.json
- Return insights

**Input:**
- `--days 7` (analyze last 7 days)
- `--report daily` or `--report weekly`

**Output:**
- Hook performance update (JSON)
- Insights + recommendations
- Actionable next steps

**Error Handling:**
- Insufficient data → note that more posts needed
- No analytics yet → suggest running collect-analytics.js first
- Invalid hook IDs → skip with warning

---

### 8. daily-report.js

**Purpose:** Morning digest of performance + recommendations

**Features:**
- Load yesterday's analytics
- Load hook performance
- Calculate key metrics (total views, avg engagement)
- Identify top 3 posts
- Identify underperformers
- Surface recommendations from analyze-performance.js
- Format as readable report
- Send to user (print, or optional integration)

**Input:**
- `--date 2026-02-18` (report for this date)
- `--format json` or `--format text` or `--format html`

**Output:**
- Daily digest report
- Ready to send to user

**Error Handling:**
- No analytics yet → suggest posting more content
- No config → exit with error
- Format error → default to text

**Mock Mode:**
- Generate sample reports
- Show realistic data

---

### 9. add-voiceover.js (Optional, Phase 2+)

**Purpose:** Add voice narration to posts (optional feature)

**Status:** Designed but not built for MVP

**Future Implementation:**
- Check if voiceoverEnabled in config
- Load post content + hook
- Generate script (auto or provided)
- Call ElevenLabs API
- Overlay audio with slideshow
- Return voiceover version

---

## Dependency Management

### Required NPM Packages

```json
{
  "dependencies": {
    "canvas": "^2.11.0",
    "openai": "^4.50.0",
    "axios": "^1.6.0",
    "dotenv": "^16.4.0",
    "yargs": "^17.7.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.0"
  }
}
```

**Why each:**
- `canvas` — Text overlays on images
- `openai` — gpt-image-1.5 integration
- `axios` — HTTP requests (Postiz, platform APIs)
- `dotenv` — Environment variables for API keys
- `yargs` — CLI argument parsing
- `chalk` — Colored terminal output
- `ora` — Loading spinners

### .env Template

```
# Atlas Configuration

# Image Generation
OPENAI_API_KEY=sk-...

# Postiz
POSTIZ_API_KEY=...

# TikTok
TIKTOK_API_KEY=...
TIKTOK_API_SECRET=...

# Instagram / Facebook
INSTAGRAM_ACCESS_TOKEN=...

# YouTube
YOUTUBE_API_KEY=...

# LinkedIn
LINKEDIN_ACCESS_TOKEN=...

# Reddit
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...

# Optional
ELEVENLABS_API_KEY=...

# Mode
MOCK_MODE=true  # Set to 'true' for testing without real APIs
```

---

## File Structure (Complete)

```
skills/atlas/
│
├── SKILL.md                                    # Main documentation (to write)
├── _meta.json                                  ✅
├── package.json                                # Dependencies (to write)
├── .env.template                               # Env var template (to write)
├── .gitignore                                  # Exclude sensitive files
│
├── scripts/
│   ├── onboarding.js                           # Build phase 3A
│   ├── generate-content.js                     # Build phase 3A
│   ├── adapt-for-platform.js                   # Build phase 3A
│   ├── schedule-posts.js                       # Build phase 3A
│   ├── validate-config.js                      # Build phase 3A
│   ├── collect-analytics.js                    # Build phase 3B
│   ├── analyze-performance.js                  # Build phase 3B
│   ├── daily-report.js                         # Build phase 3B
│   ├── add-voiceover.js                        # Phase 2+ (skip for now)
│   └── _test-mock.js                           # Mock testing (to write)
│
├── lib/                                        # Shared utilities
│   ├── config.js                               # Config loader + validator
│   ├── logger.js                               # Logging utility
│   ├── postiz-api.js                           # Postiz API wrapper
│   ├── platform-adapters/
│   │   ├── tiktok.js
│   │   ├── instagram.js
│   │   ├── youtube.js
│   │   ├── linkedin.js
│   │   ├── reddit.js
│   │   └── facebook.js
│   ├── openai-api.js                           # Image generation
│   └── text-overlay.js                         # Canvas text overlays
│
├── config/
│   ├── atlas-config.template.json              ✅
│   ├── atlas-strategy.template.json            ✅
│   └── hooks-performance.template.json         ✅
│
├── references/                                 ✅ (all created)
│   ├── PLATFORM_GUIDELINES.md
│   ├── CONTENT_FORMATS.md
│   ├── ANALYTICS_METRICS.md
│   ├── API_INTEGRATION_GUIDE.md                # To write
│   ├── DEPLOYMENT_GUIDE.md                     # To write
│   └── TROUBLESHOOTING.md                      # To write
│
├── data/
│   ├── posts/                                  # Generated content
│   ├── analytics/                              # Daily metrics
│   └── .gitkeep                                # Keep directories
│
├── tests/                                      # Testing
│   ├── mock-data.js                            # Sample posts, analytics
│   ├── unit/                                   # Unit tests
│   └── integration/                            # End-to-end tests
│
└── .clawhub/
    └── manifest.json                           # ClawHub metadata (to write)
```

---

## Build Checklist

### Phase 3A: Core Pipeline (Weeks 1-2)

- [ ] Set up package.json with dependencies
- [ ] Create lib/config.js (config loader + validator)
- [ ] Create lib/logger.js (logging utility)
- [ ] Create lib/openai-api.js (image generation)
- [ ] Create lib/text-overlay.js (canvas overlays)
- [ ] Build scripts/onboarding.js
- [ ] Build scripts/generate-content.js
- [ ] Build scripts/adapt-for-platform.js
- [ ] Create lib/postiz-api.js
- [ ] Build scripts/schedule-posts.js
- [ ] Build scripts/validate-config.js
- [ ] Test end-to-end: generate → adapt → schedule (in mock mode)

### Phase 3B: Analytics & Optimization (Weeks 2-3)

- [ ] Create lib/platform-adapters/ (TikTok, Instagram, YouTube, LinkedIn, Reddit, Facebook)
- [ ] Build scripts/collect-analytics.js
- [ ] Build scripts/analyze-performance.js
- [ ] Build scripts/daily-report.js
- [ ] Test analytics loop: post → collect → analyze → report (in mock mode)

### Phase 3C: Integration & Deployment (Week 3-4)

- [ ] Write SKILL.md (main documentation)
- [ ] Write .clawhub/manifest.json
- [ ] Write API_INTEGRATION_GUIDE.md
- [ ] Write DEPLOYMENT_GUIDE.md
- [ ] Write TROUBLESHOOTING.md
- [ ] Create comprehensive error handling throughout
- [ ] Build lib/mock-data.js (realistic test data)
- [ ] Build lib/_test-mock.js (full mock test suite)
- [ ] Test all scripts in mock mode
- [ ] Documentation review + polish
- [ ] Final package ready for deployment

---

## Mock Mode Testing Strategy

### Test Flow (Without Real APIs)

```bash
# 1. Initialize skill
node scripts/onboarding.js --mock --auto

# 2. Validate config
node scripts/validate-config.js

# 3. Generate content
node scripts/generate-content.js --mock --count 3

# 4. Adapt for platforms
node scripts/adapt-for-platform.js --adaptAll

# 5. Schedule posts
node scripts/schedule-posts.js --mock --dryRun

# 6. Simulate time passing, collect analytics
node scripts/collect-analytics.js --mock --date 2026-02-19

# 7. Analyze performance
node scripts/analyze-performance.js --days 1

# 8. Generate daily report
node scripts/daily-report.js --format text
```

**All of this works WITHOUT real API credentials.**

---

## Deployment for Others

Once complete, others can:

1. Clone the skill
2. Copy `.env.template` → `.env`
3. Fill in their API credentials
4. Run `node scripts/validate-config.js` to verify
5. Run `node scripts/onboarding.js` to set up
6. Run `node scripts/generate-content.js` to create posts
7. Posts automatically schedule and track

---

## Timeline

- **Week 1:** Phase 3A (core pipeline)
- **Week 2:** Phase 3B (analytics) + Phase 3A refinement
- **Week 3:** Phase 3C (integration + docs) + testing
- **Week 4:** Polish, final testing, ready to release

---

## Success Criteria

✅ All 8 scripts working (9th is Phase 2+)  
✅ Full mock mode testing (no APIs needed)  
✅ Complete documentation  
✅ Error handling + recovery  
✅ Deployable package for others  
✅ Ready for real API integration (just add credentials)

