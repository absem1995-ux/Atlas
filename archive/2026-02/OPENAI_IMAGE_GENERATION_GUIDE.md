# OpenAI DALL-E 3 (gpt-image-1.5) — Complete Guide

## Overview

**OpenAI DALL-E 3** via `gpt-image-1.5` model is the **recommended image generation provider** for Atlas.

- **Quality:** ⭐⭐⭐⭐⭐ Photorealistic
- **Cost:** $0.04-0.08 per image
- **Speed:** ~30 seconds per image
- **Best for:** Social media content (TikTok, Instagram, YouTube)

---

## Why DALL-E 3 (gpt-image-1.5)?

### Comparison to Other Models

| Model | Quality | Speed | Cost | Realistic? |
|-------|---------|-------|------|-----------|
| **DALL-E 3 (1.5)** | ⭐⭐⭐⭐⭐ | 30s | $0.08 | Yes |
| DALL-E 3 (older) | ⭐⭐⭐ | 30s | $0.04 | Looks AI |
| Stable Diffusion XL | ⭐⭐⭐⭐ | 20s | $0.03 | Good |
| Flux 1.1 Pro | ⭐⭐⭐⭐⭐ | 40s | $0.07 | Yes |

**DALL-E 3 1.5 wins because:**
- Photorealistic output (looks like product photography)
- Follows prompts precisely
- No visible AI artifacts
- Best for professional content
- Perfect for app marketing

---

## Setup (5 Minutes)

### Step 1: Get OpenAI API Key

1. Go to: https://platform.openai.com/account/api-keys
2. Sign up or log in
3. Create → New secret key
4. Copy the key (starts with `sk-proj-`)
5. **Keep it secret** (revoke if exposed)

### Step 2: Configure Atlas

Edit `config/atlas-config.json`:

```json
{
  "imageGen": {
    "provider": "openai",
    "model": "gpt-image-1.5",
    "apiKey": "sk-proj-..."
  }
}
```

**Or use environment variable:**

```bash
export OPENAI_API_KEY="sk-proj-..."
```

### Step 3: Test

```bash
node scripts/generate-images.js \
  --config config.json \
  --prompts config/example-prompts.json \
  --output slides/
```

Expected output:
```
🎨 Generating 6 images using openai/gpt-image-1.5
   Provider: openai
   Model: gpt-image-1.5
   Output: slides/

  🔄 Slide 1...
  ✅ Slide 1 generated
  
  ... (repeat for slides 2-6)
  
✨ Generated 6/6 slides
```

---

## How It Works

### Image Request Format

```javascript
{
  model: "gpt-image-1.5",      // DALL-E 3 1.5 model
  prompt: "Your description",  // What to generate
  n: 1,                        // Number of images (always 1 for DALL-E 3)
  size: "1024x1536",          // Portrait format (perfect for TikTok/Instagram)
  quality: "hd"               // HD quality (higher cost, better results)
}
```

### API Response

```javascript
{
  created: 1708382940,
  data: [
    {
      b64_json: "base64-encoded-image-data",
      revised_prompt: "OpenAI's interpretation of your prompt"
    }
  ]
}
```

---

## Pricing (Detailed)

### DALL-E 3 Pricing

| Size | Quality | Cost per Image |
|------|---------|-----------------|
| 1024×1024 | Standard | $0.04 |
| 1024×1024 | HD | $0.08 |
| 1024×1536 | Standard | $0.06 |
| 1024×1536 | HD | $0.12 |

**Atlas uses:** 1024×1536 HD = **$0.12 per image** (max quality)

### Cost Examples

| Scenario | Calculation | Monthly Cost |
|----------|-------------|--------------|
| 10 posts (6 images each) | 60 images × $0.12 | $7.20 |
| 20 posts | 120 images × $0.12 | $14.40 |
| 30 posts | 180 images × $0.12 | $21.60 |
| 50 posts | 300 images × $0.12 | $36 |
| 100 posts | 600 images × $0.12 | $72 |

**Plus Postiz:** $75/mo (posting to 5 platforms)

**Total for 30 posts/month:** $75 + $21.60 = **~$97/mo**

---

## Writing Good Prompts

### Prompt Structure

**Formula:**
```
[Subject] + [Style] + [Details] + [Quality Indicators]
```

### Example Prompts for App Marketing

#### Good ❌ → Better ✅

**❌ Bad:** "Mobile app dashboard"
**✅ Good:** "Modern mobile app dashboard with colorful metrics, clean minimalist design, professional typography, high quality product photography, 3D rendering style"

**❌ Bad:** "Person using app"
**✅ Good:** "Happy young professional using mobile app on smartphone, bright office setting, natural lighting, professional photography, high quality, realistic"

**❌ Bad:** "App login screen"
**✅ Good:** "Beautiful app login screen with gradient background, modern UI design, smooth rounded corners, professional aesthetic, high quality render, product shot"

### Prompt Elements That Work

**✅ What Works:**
- Specific styles: "professional photography", "3D rendering", "product photography"
- Quality words: "high quality", "professional", "realistic", "detailed"
- Lighting: "natural lighting", "bright", "soft shadows", "studio lighting"
- Design terms: "minimalist", "modern", "clean", "sleek", "professional"
- Details: "high resolution", "sharp focus", "vibrant colors"

**❌ What Doesn't:**
- "AI-generated" (confuses the model)
- "Cartoon" or "simple" (doesn't improve quality)
- Too many instructions (use base + additions instead)
- Contradictions ("realistic AND cartoon")

### Base + Custom Formula (Atlas Approach)

**base.json:**
```json
{
  "base": "A modern mobile app screenshot showing a beautiful user interface, professional design, vibrant colors, high quality, 3D rendering, product photography style, clean typography, minimalist layout",
  "slides": [
    "Main dashboard with colorful metrics and charts",
    "User profile page with gradient background",
    "Settings panel with toggle switches",
    "Notifications page showing alerts",
    "Data visualization with interactive charts",
    "Call to action screen with prominent button"
  ]
}
```

**Result:**
- All 6 images have consistent style (base)
- Each has unique focus (slides)
- Professional, cohesive output

---

## Quality Settings

### Standard vs HD

**Standard ($0.04-0.06):**
- Good for web
- Fine for Twitter
- Good enough for Instagram

**HD ($0.08-0.12):** ← Atlas uses this
- Best for TikTok (mobile first)
- Professional appearance
- No visible compression
- Worth the extra cost for social media

---

## Common Issues & Fixes

### Issue: "Image looks AI-generated"

**Cause:** Using old DALL-E 3 model (not 1.5)

**Fix:**
```json
{
  "imageGen": {
    "model": "gpt-image-1.5"  ← Use THIS
  }
}
```

### Issue: "Colors washed out"

**Cause:** Prompt doesn't specify colors/vibrancy

**Fix:**
```
Add to prompt: "vibrant colors", "bright", "saturated colors"

Example: "Mobile app with vibrant colors, bright UI, saturated design..."
```

### Issue: "Takes too long (>60 sec)"

**Cause:** API rate limiting or network issue

**Fix:**
```bash
# Atlas retries automatically with backoff
# But if persistent, try:
# 1. Wait 30 seconds
# 2. Try again
# 3. Check API status: https://status.openai.com
```

### Issue: "API key rejected"

**Cause:** Invalid key, revoked, or expired billing

**Fix:**
```bash
# Check key is correct
echo $OPENAI_API_KEY

# Verify in OpenAI dashboard:
# https://platform.openai.com/account/api-keys

# Check billing:
# https://platform.openai.com/account/billing/overview

# Add payment method if needed
```

### Issue: "Quota exceeded"

**Cause:** Monthly API spending limit reached

**Fix:**
```
1. Go to: https://platform.openai.com/account/billing/usage
2. Check current spending
3. Set higher limit or increase account

Default: $3/month (very low for image generation)
Recommended: $100-500/month (for regular use)
```

---

## Best Practices

### 1. Batch Generation

Generate all 6 images in one session (faster than one-by-one)

```bash
node scripts/generate-images.js \
  --config config.json \
  --prompts prompts.json \
  --output slides/

# Generates 6 images: ~3-4 minutes total
```

### 2. Resume on Failure

If generation stops, re-run the same command. Already-completed images are skipped.

```bash
# Run failed
# Fix issue (billing, network, etc.)
# Re-run same command
# Completed slides 1-3 are skipped
# Slides 4-6 retry
```

### 3. Consistent Prompts

Use base + custom formula for visual consistency

```json
{
  "base": "Shared style for all images",
  "slides": [
    "Unique detail for image 1",
    "Unique detail for image 2",
    ...
  ]
}
```

### 4. Monitor Costs

Check spending regularly

```bash
# https://platform.openai.com/account/billing/usage

# At $0.12/image:
# 100 images = $12
# 1,000 images = $120
# 10,000 images = $1,200
```

### 5. A/B Test Prompts

Track which prompts generate best-performing images

```json
{
  "base": "... style A ...",
  "slides": [...]
}

// Later:
{
  "base": "... style B ...",
  "slides": [...]
}

// Compare performance, use better one
```

---

## Example: Real Workflow

### Scenario: App Marketing Campaign

**Day 1: Generate Images**

```bash
# Create prompts.json with your app details
cat > prompts.json << 'EOF'
{
  "base": "A modern SaaS productivity app screenshot showing a beautiful dashboard, professional design, clean interface, vibrant blue and white colors, high quality product photography, realistic rendering, minimalist UI, modern typography",
  "slides": [
    "Main dashboard with task metrics and statistics, colorful charts, clean layout",
    "User profile page with avatar and settings, gradient background, smooth design",
    "Settings panel with feature toggles and options, professional aesthetic",
    "Notifications center showing alerts and updates, organized layout",
    "Data export and analytics page with interactive visualizations",
    "Call to action screen with prominent blue button and testimonials"
  ]
}
EOF

# Generate
node scripts/generate-images.js \
  --config config.json \
  --prompts prompts.json \
  --output slides/

# Time: ~3-4 minutes
# Cost: 6 × $0.12 = $0.72
```

**Day 2: Add Captions**

```bash
# Create captions.json with hooks
cat > captions.json << 'EOF'
[
  "Wait, this actually works?\n✨",
  "Finally, a dashboard\nthat makes sense 🎯",
  "Your workflow\njust got easier",
  "Never miss\na deadline again 🔔",
  "See everything\nat a glance 📊",
  "Try it free\nno credit card"
]
EOF

# Add captions
node scripts/add-text-overlay.js \
  --input slides/ \
  --texts captions.json \
  --output slides-final/

# Time: ~10 seconds
# Cost: Free
```

**Day 3: Post to Platforms**

```bash
# Post to 5 platforms
node scripts/atlas-post.js \
  --config config.json \
  --caption "🚀 We rebuilt your productivity app. Here's what changed." \
  --images slides-final/slide*.png \
  --platforms tiktok,instagram,twitter,facebook,youtube

# Time: ~1 minute
# Cost: Included in Postiz ($75/mo)
```

**Day 4: Check Results**

```bash
# Collect analytics
node scripts/collect-analytics.js \
  --config config.json \
  --days 1

# See views, engagement per platform
# Identify best performers
```

**Weekly Cost:** 
- OpenAI: 6 images × $0.12 = $0.72
- Postiz: $75/mo ÷ 4 weeks = $18.75/week
- **Total: ~$19.47/week** (or ~$78/month for regular posting)

---

## Advanced: Image Revisions

### Using OpenAI's Revised Prompts

DALL-E 3 sometimes rewrites your prompt for clarity. See what it changed:

```javascript
const response = await fetch(...);
const data = await response.json();

console.log("Your prompt:", originalPrompt);
console.log("OpenAI's interpretation:", data.data[0].revised_prompt);
```

This helps you understand what works:

**Your prompt:** "App dashboard"  
**Revised:** "A modern mobile app dashboard interface showing analytics metrics and user data in a clean, minimalist design with professional typography and soft shadows."

Learn from revisions to write better prompts.

---

## Troubleshooting Checklist

- [ ] API key correct? (`echo $OPENAI_API_KEY`)
- [ ] Billing active? (Check account at OpenAI dashboard)
- [ ] Quota set high enough? (Set to $100+)
- [ ] Model is `gpt-image-1.5`?
- [ ] Size is `1024x1536`?
- [ ] Quality is `hd`?
- [ ] Internet connection stable?
- [ ] Prompts are specific enough?
- [ ] Images look photorealistic (not cartoony)?

---

## Summary

**OpenAI DALL-E 3 (gpt-image-1.5):**
- Best quality for social media
- $0.12 per HD image at 1024×1536
- ~30 seconds per image
- Perfect for app marketing
- Photorealistic output

**In Atlas:**
- Integrated and working
- 6 images per content set
- ~3-4 minutes to generate all 6
- Easy setup (1 API key)
- Automatic retry on failure

**Result:** Professional social media content at scale.

---

_Ready to generate images? See ATLAS_COMPLETE.md for full workflow._
