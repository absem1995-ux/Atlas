# TROUBLESHOOTING.md — Common Issues & Fixes

## Setup Issues

### "npm ERR! Cannot find module"
**Cause:** Dependencies not installed  
**Fix:**
```bash
rm -rf node_modules
npm install
```

### "EACCES: permission denied"
**Cause:** File permissions issue  
**Fix:**
```bash
chmod 755 scripts/*.js
npm install --force
```

### ".env not found"
**Cause:** You forgot to copy template  
**Fix:**
```bash
cp .env.template .env
```

---

## Configuration Issues

### "Config not found: atlas-config.json"
**Cause:** First-time setup not run  
**Fix:**
```bash
node scripts/onboarding.js
```

### "Invalid JSON in atlas-config.json"
**Cause:** Syntax error in your config file  
**Fix:**
```bash
# Validate JSON
node -e "console.log(JSON.parse(require('fs').readFileSync('atlas-config.json', 'utf8')))"
```

If syntax error shown, fix the JSON and retry.

### "Unknown platform: xxx"
**Cause:** Typo in platform name  
**Fix:** Supported platforms are: `tiktok`, `instagram`, `youtube`, `linkedin`, `reddit`, `facebook`

Check `atlas-config.json` for typos.

---

## API & Credential Issues

### "OPENAI_API_KEY is not set"
**Cause:** Missing OpenAI key in .env  
**Fix:**
```bash
# Get key from https://platform.openai.com/api-keys
echo "OPENAI_API_KEY=sk-..." >> .env
node scripts/validate-config.js
```

### "Invalid OpenAI key format"
**Cause:** Key doesn't start with `sk-`  
**Fix:**
1. Go to https://platform.openai.com/api-keys
2. Create new key
3. Copy entire key (should start with `sk-proj-`)
4. Paste into .env

### "POSTIZ_API_KEY is not set"
**Cause:** Missing Postiz key in .env  
**Fix:**
```bash
# Get key from https://postiz.com/dashboard/settings
echo "POSTIZ_API_KEY=..." >> .env
node scripts/validate-config.js
```

### "OpenAI API error: 401 Unauthorized"
**Cause:** Invalid or expired key  
**Fix:**
1. Check key in .env matches exactly (no extra spaces)
2. Verify key still active: https://platform.openai.com/api-keys
3. If expired, create new key and update .env

### "Postiz API error: 403 Forbidden"
**Cause:** Invalid key or account permissions  
**Fix:**
1. Verify key in Postiz dashboard (Settings → API)
2. Ensure account has active integrations on platforms
3. Check rate limits (Postiz dashboard → Usage)

---

## Content Generation Issues

### "MOCK_MODE is undefined" or "Mock data not loading"
**Cause:** Environment variable not set  
**Fix:**
```bash
# Explicitly set before command
MOCK_MODE=true node scripts/generate-content.js --count 3
```

### "Image generation failed: Invalid prompt"
**Cause:** OpenAI rejected the prompt  
**Fix:**
1. Check prompt length (should be <1000 chars)
2. Ensure no restricted content (violence, hate, etc.)
3. Try simpler prompt

### "Canvas error: font not found"
**Cause:** System fonts not available (Linux/Docker)  
**Fix:**
```bash
# Install fonts
apt-get install fonts-dejavu
```

Then retry.

### "No posts found in data/posts/"
**Cause:** You haven't generated content yet  
**Fix:**
```bash
node scripts/generate-content.js --count 3
```

---

## Platform-Specific Issues

### TikTok

#### "TikTok account not found"
**Cause:** Account handle not set in config  
**Fix:**
```bash
# Edit atlas-config.json and set:
"tiktok": {
  "accountHandle": "@yourhandle",
  "enabled": true
}
```

#### "Posts not appearing in TikTok drafts"
**Cause:** Postiz integration not active  
**Fix:**
1. Go to Postiz dashboard
2. Connect TikTok account (OAuth)
3. Wait 2-3 minutes for sync
4. Retry scheduling

#### "TikTok says 'account warming up'"
**Cause:** New account needs native usage  
**Fix:**
1. Open TikTok app on phone
2. Scroll feed 30-60 min/day for 7-14 days
3. Like videos, follow creators in your niche
4. Once account is warmed, can start posting via API

#### "Audio required but not provided"
**Cause:** Atlas can't add audio automatically (TikTok limitation)  
**Fix:**
1. Posts go to **drafts** only
2. You manually open draft in TikTok app
3. Select audio from TikTok library
4. Publish

This is intentional — TikTok requires original or trending audio.

### Instagram

#### "Instagram posts failing"
**Cause:** Account is personal (not business/creator)  
**Fix:**
1. Go to Instagram settings
2. Switch to Business or Creator account
3. Reconnect in Postiz
4. Retry scheduling

#### "Reels format not supported"
**Cause:** API limitation on personal accounts  
**Fix:** See above — switch to Business/Creator account.

### YouTube

#### "YouTube not enabled in Phase 1"
**Info:** YouTube Shorts support coming in Phase 2 (Q2 2026)  
**Workaround:** Disable in config for now

```json
"youtube": { "enabled": false }
```

---

## Analytics Issues

### "No analytics data found"
**Cause:** Metrics not collected yet (wait 24-48h after posting)  
**Fix:**
```bash
# Check when data was last collected
ls -la data/analytics/

# Manually collect
node scripts/collect-analytics.js --days 7
```

### "Platform API error: 401"
**Cause:** Platform API token expired  
**Fix:**
1. Postiz handles this automatically
2. If persistent, re-authenticate platform in Postiz dashboard
3. Wait 5 minutes, retry

### "Analytics permission denied"
**Cause:** Account doesn't have analytics permission  
**Fix:**
1. Ensure account is Business/Creator (not personal)
2. Ensure you have admin access
3. Reconnect in Postiz

---

## Performance Issues

### "Script running very slowly"
**Cause:** API timeouts or network issues  
**Fix:**
```bash
# Increase timeout
API_TIMEOUT_MS=60000 node scripts/generate-content.js --count 3
```

### "Memory error: JavaScript heap out of memory"
**Cause:** Trying to process too many images at once  
**Fix:**
```bash
# Generate fewer at a time
node scripts/generate-content.js --count 5  # Instead of --count 100
```

### "Postiz rate limit hit"
**Cause:** Too many requests too fast  
**Fix:**
```bash
# Wait 5 minutes
# Then retry with fewer posts
node scripts/schedule-posts.js --posts 5  # Instead of 50
```

---

## Testing & Development

### "Want to test without real APIs?"
**Fix:**
```bash
MOCK_MODE=true node scripts/[script].js
```

All scripts support mock mode. No credentials needed.

### "Generate test data only"
**Fix:**
```bash
MOCK_MODE=true node scripts/generate-content.js --count 10
MOCK_MODE=true node scripts/collect-analytics.js --days 7
```

Outputs realistic mock data for testing workflows.

### "Validate setup without posting"
**Fix:**
```bash
node scripts/validate-config.js
node scripts/schedule-posts.js --posts 3 --dryRun
```

Both test without making changes.

---

## Advanced Debugging

### "Enable debug logging"
```bash
LOG_LEVEL=debug node scripts/[script].js
```

Shows detailed execution logs.

### "Save debug output to file"
```bash
LOG_LEVEL=debug node scripts/[script].js > debug.log 2>&1
```

### "Test individual script"
```bash
# Generate only
node scripts/generate-content.js --count 1

# Validate only
node scripts/validate-config.js

# Collect analytics only
node scripts/collect-analytics.js --days 1
```

Each script can run independently for testing.

---

## Still Stuck?

1. **Check logs:** `LOG_LEVEL=debug node scripts/...`
2. **Validate config:** `node scripts/validate-config.js`
3. **Test in mock mode:** `MOCK_MODE=true node scripts/...`
4. **Check API keys:** Ensure keys are valid in respective dashboards
5. **Try dry-run:** `node scripts/schedule-posts.js --dryRun`
6. **Wait & retry:** Some issues (rate limits) resolve after 5 minutes

If still not working, report with:
```bash
# Get system info
node -v
npm -v
cat .env | grep -E "KEY|MODE"  # Only keys/settings, no secrets

# Get error output
LOG_LEVEL=debug node scripts/[failing-script].js 2>&1 | head -50
```
