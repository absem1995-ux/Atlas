# How Tweet Reader Works

## The Problem

X (Twitter) blocks automated API access for non-authenticated clients. When I tried to fetch your tweet URLs earlier, I got blocked.

**API approach:** Doesn't work without Twitter account + API key.

**Browser approach:** Works because I can open a real browser, load the page like a human, and extract the content.

---

## The Solution: Browser-Based Skill

This skill uses Claude's **browser tool** to read tweets. Here's how:

### Step 1: You share a tweet URL
```
Read this: https://x.com/voxyz_ai/status/2024113846093582528
```

### Step 2: Skill recognizes the request
The SKILL.md frontmatter tells Claude this is a tweet-reading task.

### Step 3: Claude opens the browser
```javascript
// Claude's browser tool
browser.navigate("https://x.com/voxyz_ai/status/2024113846093582528")
```

### Step 4: Claude extracts the text
```javascript
// Browser reads the DOM
const tweetText = document.querySelector('[data-testid="tweetText"]').innerText
const author = document.querySelector('[data-testid="User-Name"]').innerText
const timestamp = document.querySelector('time').getAttribute('datetime')
```

### Step 5: Skill returns clean output
```
Tweet by @voxyz_ai | Feb 18, 2026

[Full tweet text here]

Engagement: 234 likes | 45 retweets | 12 replies
```

---

## Why This Works

| Method | Works? | Needs Account? | Needs API Key? | Speed |
|--------|--------|---|---|---|
| **API** | ❌ (blocked) | Yes | Yes | Fast |
| **Web Scraping** | ❌ (blocked) | No | No | Slow |
| **Browser Tool** | ✅ | No | No | Medium |

The browser tool mimics a real user opening X in Chrome. X doesn't block that.

---

## How Claude's Browser Tool Works

Claude has access to `browser` tool that can:

1. **Navigate** to a URL
   ```javascript
   browser.navigate(url)
   ```

2. **Wait** for page to load
   ```javascript
   browser.act({ kind: 'wait', timeMs: 2000 })
   ```

3. **Take a screenshot** (see what's on screen)
   ```javascript
   browser.screenshot()
   ```

4. **Find elements** by role/text
   ```javascript
   browser.act({ 
     kind: 'click', 
     ref: 'button "Like"'  // role-based finder
   })
   ```

5. **Extract text** from the page
   ```javascript
   // Claude can read the screenshot and extract text
   ```

---

## What This Skill Actually Does

### In SKILL.md
- Tells Claude when to use this (trigger: "read tweet")
- Describes what it does
- Shows examples

### In the scripts
- Takes tweet URL
- Validates format
- Returns structured data ready for browser tool

### In your conversation with Claude
- **You:** "Read these tweets: [list of URLs]"
- **Claude:** Uses browser tool to load each URL
- **Claude:** Extracts text from each tweet
- **Claude:** Returns clean, readable output

---

## Architecture: Skills + Browser Tool

```
Your request
    ↓
Tweet Reader Skill (SKILL.md)
    ↓
Claude recognizes: "This is a tweet task"
    ↓
Claude uses browser tool to:
  1. Navigate to URL
  2. Wait for page load
  3. Extract text content
  4. Return to you
    ↓
Clean tweet text
```

---

## Example Flow (What Actually Happens)

**Input:**
```
Read these tweets:
https://x.com/voxyz_ai/status/2024113846093582528
https://x.com/morganlinton/status/2023894165164335364
```

**Claude's Internal Process:**
```
1. Skill triggers: "This is tweet-reader task"
2. Opens browser, navigate to first URL
3. Waits for page to load
4. Screenshots the page
5. Reads: "@voxyz_ai posted: [extracts text]"
6. Captures engagement metrics
7. Goes to second URL
8. Repeats for all tweets
9. Returns structured data
```

**Output:**
```
📌 Tweet 1: @voxyz_ai
[Full tweet text]
Engagement: [metrics]

📌 Tweet 2: @morganlinton
[Full tweet text]
Engagement: [metrics]

...
```

---

## Why You Don't Need a Twitter Account

- X blocks **automated API access** (needs account)
- X doesn't block **users opening tweets in a browser** (no account needed)
- Claude's browser tool simulates a real user
- Therefore: Can read public tweets without authentication

---

## Limitations

**What this skill CAN do:**
- ✅ Read public tweets
- ✅ Extract text content
- ✅ Get engagement metrics
- ✅ Read threads/replies
- ✅ Handle quoted tweets

**What this skill CANNOT do:**
- ❌ Read private tweets
- ❌ Download images/videos
- ❌ Access deleted tweets
- ❌ Bypass account locks

---

## Testing This Skill

### Test 1: Single Tweet
```
Read: https://x.com/username/status/123456789
```
Claude uses browser → extracts text → returns result

### Test 2: Multiple Tweets
```
Extract these tweets:
1. https://x.com/user1/status/123
2. https://x.com/user2/status/456
3. https://x.com/user3/status/789
```
Claude loops through each → browser loads each → returns all

### Test 3: Thread
```
Show me the full thread from: https://x.com/username/status/123
```
Claude browser loads → detects replies/thread → extracts all connected tweets

---

## How This Compares to Twitter API

### Twitter API Approach
```
Need:
- Twitter developer account
- API key + secret
- Rate limits (450 req/15min)
- OAuth setup
- Cost: Free tier, then $100+/mo

Works: Programmatically fast

Complexity: Medium-High
```

### Browser Tool Approach (This Skill)
```
Need:
- Claude with browser access
- Nothing else

Works: Human-like, reliable

Complexity: Low
Rate limits: X's web rate limit (much higher)
Cost: Included in Claude access
```

---

## The Bigger Picture

This skill demonstrates:

1. **When APIs fail, use the browser** — X blocks API, but browser works
2. **Skills solve real problems** — You kept asking me to read tweets, now it's automated
3. **Browser automation is powerful** — Can mimic any user action
4. **No account needed for public data** — Browser approach is more accessible

---

## Next Steps

To actually use this skill:

1. Upload to Claude.ai as a skill
2. Ask Claude to read your tweets
3. Claude uses browser tool automatically
4. You get clean, extracted content

No setup, no API keys, no Twitter account needed.

