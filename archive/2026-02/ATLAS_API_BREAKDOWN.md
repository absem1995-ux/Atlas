# Atlas APIs Complete Breakdown

## What Atlas Has Now (Extended from Larry)

Atlas is now a **complete content automation system** combining:
1. **Image Generation** (3 providers)
2. **Text Overlay** (node-canvas)
3. **Multi-Platform Posting** (Postiz API)
4. **Analytics** (Postiz + platform APIs)

---

## 1️⃣ IMAGE GENERATION APIs

Atlas supports **4 image generation options**:

### Option A: OpenAI (DALL-E 3) — ⭐ RECOMMENDED
**Provider:** `openai`  
**Model:** `gpt-image-1.5` (photorealistic)  
**Cost:** $0.04-0.08 per image  
**Speed:** ~30 seconds  
**Quality:** ⭐⭐⭐⭐⭐ (Best for social media)  

**Setup:**
```bash
# 1. Get API key: https://platform.openai.com/account/api-keys
# 2. Add to config.json:
{
  "imageGen": {
    "provider": "openai",
    "model": "gpt-image-1.5",
    "apiKey": "sk-..."
  }
}
# 3. Run:
node scripts/generate-images.js --config config.json --prompts prompts.json --output slides/
```

---

### Option B: Stability AI (Stable Diffusion XL)
**Provider:** `stability`  
**Model:** `stable-diffusion-xl-1024-v1-0`  
**Cost:** $0.02-0.03 per image (cheapest)  
**Speed:** ~20 seconds (fastest)  
**Quality:** ⭐⭐⭐⭐ (Very good)  

**Setup:**
```bash
# 1. Get API key: https://www.stability.ai/account/api-keys
# 2. Add to config.json:
{
  "imageGen": {
    "provider": "stability",
    "model": "stable-diffusion-xl-1024-v1-0",
    "apiKey": "sk-..."
  }
}
```

---

### Option C: Replicate (Flux 1.1 Pro)
**Provider:** `replicate`  
**Model:** `black-forest-labs/flux-1.1-pro` (or any Replicate model)  
**Cost:** $0.03-0.07 per image  
**Speed:** ~40 seconds  
**Quality:** ⭐⭐⭐⭐⭐ (Excellent, comparable to DALL-E 3)  

**Setup:**
```bash
# 1. Get API token: https://replicate.com/account/api-tokens
# 2. Add to config.json:
{
  "imageGen": {
    "provider": "replicate",
    "model": "black-forest-labs/flux-1.1-pro",
    "apiKey": "..."
  }
}
```

---

### Option D: Local (You Provide Images)
**Provider:** `local`  
**Cost:** Free  
**Setup:** Place images in output directory before running

```bash
# 1. Add to config.json:
{
  "imageGen": {
    "provider": "local"
  }
}
# 2. Place your images: slide1.png, slide2.png, etc.
# 3. Run (copies your images, no generation):
node scripts/generate-images.js --config config.json --prompts prompts.json --output slides/
```

---

## 2️⃣ TEXT OVERLAY API

**Provider:** `node-canvas` (local, no API key needed)  
**Cost:** Free (local processing)  
**What it does:** Adds captions/text on top of generated images  

**Features:**
- Auto word-wrap (fits text to image)
- Manual line breaks with `\n`
- Bold white text with black stroke (readable)
- Centered text vertically and horizontally

**Usage:**
```bash
node scripts/add-text-overlay.js \
  --input slides/ \
  --texts captions.json \
  --output slides-final/
```

**captions.json format:**
```json
[
  "Slide 1 caption\nwith line breaks",
  "Slide 2 caption",
  "Slide 3 caption",
  "Slide 4 caption",
  "Slide 5 caption",
  "Slide 6 caption"
]
```

---

## 3️⃣ MULTI-PLATFORM POSTING API

**Provider:** Postiz (unified posting service)  
**Cost:** $50-99/mo (all 5 platforms)  
**Platforms:** TikTok, Instagram, Twitter, Facebook, YouTube  

**Supported Actions:**
- Upload images
- Create posts
- Schedule posts
- Get platform account info

**What we're using from Postiz:**
- `/upload` — Upload image files
- `/posts` — Create/schedule posts
- Platform-specific settings (TikTok privacy level, etc.)

**Integration IDs Needed:**
```json
{
  "postiz": {
    "apiKey": "your-postiz-api-key",
    "integrationIds": {
      "tiktok": "integration-id-from-postiz",
      "instagram": "integration-id-from-postiz",
      "twitter": "integration-id-from-postiz",
      "facebook": "integration-id-from-postiz",
      "youtube": "integration-id-from-postiz"
    }
  }
}
```

**Usage:**
```bash
node scripts/atlas-post.js \
  --config config.json \
  --caption "Hook text" \
  --images slide1.png,slide2.png \
  --platforms tiktok,instagram,twitter,facebook,youtube
```

---

## 4️⃣ ANALYTICS API

**Provider:** Postiz API (pulls metrics)  
**Cost:** Free (included with Postiz subscription)  
**What it collects:**
- Views per post
- Likes per post
- Comments per post
- Engagement rates
- Performance by platform

**Metrics Tracked:**
```
TikTok:
  - Total views
  - Total likes
  - Total comments
  - Average views/post
  - Engagement rate (%)

Instagram:
  - Total reaches
  - Total likes
  - Total comments
  - Average reach/post
  - Engagement rate (%)

Twitter:
  - Total impressions
  - Total likes
  - Total retweets
  - Average impressions/post
  - Engagement rate (%)

Facebook:
  - Total reaches
  - Total reactions
  - Total comments
  - Average reach/post
  - Engagement rate (%)

YouTube:
  - Total views
  - Total likes
  - Total comments
  - Average views/post
  - Engagement rate (%)
```

**Usage:**
```bash
node scripts/collect-analytics.js \
  --config config.json \
  --days 7 \
  --output data/analytics/
```

**Output:**
```json
{
  "timestamp": "2025-02-19T11:31:00Z",
  "metrics": {
    "tiktok": {
      "posts": 5,
      "totalViews": 15000,
      "totalLikes": 1200,
      "totalComments": 340,
      "avgEngagement": 10.3
    },
    ...
  }
}
```

---

## Complete API Summary Table

| API | Purpose | Cost | Required? | Status |
|-----|---------|------|-----------|--------|
| **OpenAI DALL-E 3** | Image generation | $0.04-0.08/image | Optional | ✅ Integrated |
| **Stability AI** | Image generation (alt) | $0.02-0.03/image | Optional | ✅ Integrated |
| **Replicate** | Image generation (alt) | $0.03-0.07/image | Optional | ✅ Integrated |
| **node-canvas** | Text overlay | Free | Optional | ✅ Integrated |
| **Postiz** | Multi-platform posting | $50-99/mo | ✅ Required | ✅ Integrated |
| **Postiz Analytics** | Performance tracking | Free (with Postiz) | Optional | ✅ Integrated |

---

## Monthly Cost Examples

### Scenario 1: Minimal (Posting Only)
- Postiz: $75/mo
- Image generation: Free (you provide images)
- **Total: $75/mo**

### Scenario 2: Basic (With AI Generation — OpenAI)
- Postiz: $75/mo
- OpenAI DALL-E 3: 30 posts × 6 images × $0.06 = ~$11/mo
- **Total: ~$86/mo**

### Scenario 3: Advanced (Multiple Providers)
- Postiz: $75/mo
- Image generation: $15/mo (100+ images across providers)
- Potential: ElevenLabs voiceover: $10/mo
- **Total: ~$100/mo**

---

## Scripts Included

### 1. `generate-images.js` (8.6K)
Generates 6 images using your chosen provider.

```bash
node scripts/generate-images.js \
  --config config.json \
  --prompts prompts.json \
  --output slides/
```

**Features:**
- Supports 3 image generation providers
- Retry logic (2 retries on failure)
- Timeout handling (120 sec per image)
- Resume capability (skips already-generated images)

### 2. `add-text-overlay.js` (4.8K)
Adds text captions to images.

```bash
node scripts/add-text-overlay.js \
  --input slides/ \
  --texts captions.json \
  --output slides-final/
```

**Features:**
- Auto word-wrap
- Manual line breaks support
- Centered text positioning
- Black stroke outline for readability

### 3. `atlas-post.js` (5.4K)
Main orchestrator — posts to all platforms.

```bash
node scripts/atlas-post.js \
  --config config.json \
  --caption "Your hook" \
  --images slide1.png,slide2.png \
  --platforms tiktok,instagram,twitter,facebook,youtube
```

**Features:**
- Multi-platform posting
- Rate limiting between uploads
- Error handling per platform
- Summary reporting

### 4. `postiz-adapter.js` (10.2K)
Core Postiz API wrapper.

**Methods:**
- `uploadImage()` — Upload single image
- `uploadImages()` — Batch upload with rate limiting
- `postToTikTok()`, `postToInstagram()`, etc.
- `postToMultiplePlatforms()` — Orchestrate all

### 5. `collect-analytics.js` (6.8K)
Pull and aggregate performance data.

```bash
node scripts/collect-analytics.js \
  --config config.json \
  --days 7
```

**Features:**
- Fetches posts from Postiz API
- Aggregates metrics by platform
- Calculates engagement rates
- Generates formatted report
- Saves JSON output

---

## Configuration Required

### .env File (Credentials)
```bash
# Pick ONE image generation provider
OPENAI_API_KEY=sk-...
# OR
STABILITY_API_KEY=sk-...
# OR
REPLICATE_API_TOKEN=...

# Postiz (required for posting)
POSTIZ_API_KEY=...
POSTIZ_TIKTOK_ID=...
POSTIZ_INSTAGRAM_ID=...
POSTIZ_TWITTER_ID=...
POSTIZ_FACEBOOK_ID=...
POSTIZ_YOUTUBE_ID=...
```

### config.json (Settings)
```json
{
  "imageGen": {
    "provider": "openai",
    "model": "gpt-image-1.5",
    "apiKey": "sk-..."
  },
  "postiz": {
    "apiKey": "...",
    "integrationIds": {
      "tiktok": "...",
      "instagram": "...",
      "twitter": "...",
      "facebook": "...",
      "youtube": "..."
    }
  }
}
```

---

## Getting API Keys (Step-by-Step)

### OpenAI (Recommended for Image Generation)
1. Go: https://platform.openai.com/account/api-keys
2. Create new API key
3. Copy to config or .env
4. Cost: Pay-as-you-go ($0.04-0.08 per image)

### Stability AI (Cheapest Option)
1. Go: https://www.stability.ai/account/api-keys
2. Create new API key
3. Copy to config or .env
4. Cost: Pay-as-you-go ($0.02-0.03 per image)

### Replicate (Best for Flux)
1. Go: https://replicate.com/account/api-tokens
2. Create new API token
3. Copy to config or .env
4. Cost: Pay-as-you-go ($0.03-0.07 per image)

### Postiz (Required for Posting)
1. Go: https://postiz.com
2. Sign up or log in
3. Settings → API → Generate API Key
4. Connect each platform (TikTok, Instagram, Twitter, Facebook, YouTube)
5. Copy integration IDs for each platform
6. Cost: $50-99/mo

---

## What This Means

✅ **Complete Automation Pipeline:**
- Generate images (AI or local)
- Add captions/text
- Post to 5 platforms simultaneously
- Track performance

✅ **Flexible Provider Choice:**
- Multiple image generation options
- Fallback to local images
- Pay-as-you-go pricing

✅ **Production Ready:**
- Error handling and retries
- Rate limiting
- Analytics integration
- Comprehensive documentation

✅ **Cost Effective:**
- Starting at $75/mo (Postiz only)
- ~$86/mo for full automation with OpenAI
- Scale up as needed

---

## Next Steps

1. **Choose your provider:** OpenAI (best), Stability (cheapest), Replicate (excellent), or Local (free)
2. **Get API keys:** Follow links above
3. **Configure Atlas:** Update config.json with credentials
4. **Test:** Generate images → Add text → Post to one platform
5. **Deploy:** Use with real content

---

_Complete Atlas API system ready to ship. All from Larry's proven architecture, extended to 5 platforms._
