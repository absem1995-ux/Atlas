# 🚀 Atlas Launch Checklist

Welcome to Atlas! Follow this checklist to get up and running.

---

## Step 1: Get Your API Keys

You'll need accounts with these services:

| Service | Why | Sign Up |
|---------|-----|---------|
| **OpenAI** | Generate images | https://platform.openai.com |
| **Postiz** | Schedule to social platforms | https://postiz.app |

---

## Step 2: Configure Atlas

### Option A: Use the Template (Recommended)

```bash
# Copy the template config
cp config/atlas-config.template.json config/atlas-config.json
```

Then edit `config/atlas-config.json` with your details:

```json
{
  "business": {
    "name": "Your Business Name",
    "description": "What you do",
    "audience": "Who your customers are"
  },
  "imageGeneration": {
    "apiKey": "sk-..."  // Your OpenAI API key
  },
  "postiz": {
    "apiKey": "...",           // Your Postiz API key
    "workspace": "your-workspace"
  }
}
```

### Option B: Interactive Setup

Run the onboarding script:

```bash
node scripts/onboarding.js
```

---

## Step 3: Connect Your Social Platforms

1. Log into **Postiz** (https://app.postiz.com)
2. Go to **Settings → Integrations**
3. Connect the platforms you want to use:
   - TikTok
   - Instagram
   - LinkedIn
   - YouTube
   - Twitter/X
   - Threads
4. Copy each **Integration ID** from the URL or settings
5. Add them to your `atlas-config.json`:

```json
{
  "postiz": {
    "integrationIds": {
      "tiktok": "your-tiktok-id",
      "instagram": "your-instagram-id"
    }
  }
}
```

---

## Step 4: Update Your Platform Settings

In `config/atlas-config.json`, update each platform you want to use:

```json
{
  "platforms": {
    "tiktok": {
      "enabled": true,
      "username": "@your_handle",
      "postingSchedule": ["08:00", "14:00", "20:00"]
    },
    "instagram": {
      "enabled": true,
      "username": "your_handle",
      "postingSchedule": ["09:00", "15:00"]
    }
  }
}
```

---

## Step 5: Validate Your Config

Run the validation script:

```bash
node scripts/validate-config.js
```

If everything is set up correctly, you'll see:
```
✅ Config valid - Atlas is ready to generate content!
```

---

## Step 6: Enable Scheduling (Optional)

To run Atlas automatically every 2 hours:

```bash
# Edit config and set:
"schedule": {
  "enabled": true
}
```

Or run manually:

```bash
node scripts/atlas-scheduler.js
```

---

## Quick Reference

| Command | What it does |
|---------|--------------|
| `node scripts/onboarding.js` | Interactive setup wizard |
| `node scripts/validate-config.js` | Check config is valid |
| `node scripts/generate-content.js` | Generate new content |
| `node scripts/schedule-posts.js` | Post to platforms |
| `node scripts/atlas-scheduler.js` | Run on a schedule |

---

## Troubleshooting

**"Missing API key" error**
→ Check your `atlas-config.json` has valid keys

**"Integration not found" error**
→ Verify your integration IDs in Postiz dashboard

**"Platform disabled" warning**
→ Set `"enabled": true` for that platform in config

See `TROUBLESHOOTING.md` for more help.

---

## Need Help?

- Check `SKILL.md` for full documentation
- Check `ADVANCED_CONFIG.md` for detailed options
- Open an issue on GitHub
