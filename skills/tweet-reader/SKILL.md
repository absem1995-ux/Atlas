---
name: tweet-reader
description: |
  Read and extract text from X (Twitter) tweets and threads.
  
  Fetches tweet content, cleans formatting, extracts replies and quoted tweets.
  Works with public tweets, threads, and conversation threads.
  
  Use when: User shares tweet URLs and wants to read the content,
  analyze tweet threads, extract tweet text for processing.
---

# Tweet Reader

**Read X (Twitter) tweets without needing a Twitter account.**

Extracts clean, readable text from tweets and threads. Perfect for analyzing, summarizing, or processing tweet content.

---

## What It Does

1. Takes a tweet URL
2. Opens it in browser (no account needed for public tweets)
3. Extracts clean text content
4. Returns formatted output
5. Handles threads, replies, quoted tweets

---

## How to Use

### Single Tweet
```
Read this tweet: https://x.com/username/status/1234567890
```

### Multiple Tweets
```
Extract text from these tweets:
1. https://x.com/user1/status/123
2. https://x.com/user2/status/456
3. https://x.com/user3/status/789
```

### Thread Analysis
```
Show me the full thread from: https://x.com/username/status/1234567890
```

---

## What You'll Get

**For each tweet:**
- Author name + handle
- Tweet text (full, untruncated)
- Posted date/time
- Engagement (likes, retweets, replies)
- Any quoted tweets or replies
- Thread structure (if applicable)

**Output format:** Clean, readable text. No HTML, no clutter.

---

## Examples

### Input:
```
Read: https://x.com/voxyz_ai/status/2024113846093582528
```

### Output:
```
Tweet by @voxyz_ai | Feb 18, 2026

[Full tweet text here]

Engagement: 234 likes | 45 retweets | 12 replies

Quoted tweet by @someone_else:
[Quoted tweet text]
```

---

## How It Works

1. Browser opens the tweet URL
2. Waits for page to load
3. Extracts text from tweet container
4. Cleans formatting (removes HTML, extra whitespace)
5. Captures replies and quoted tweets if present
6. Returns clean, structured output

---

## What It Can't Do

❌ Read private tweets (only public tweets)
❌ Download media (images/videos — links only)
❌ Access deleted tweets
❌ Bypass account-locked content

---

## Edge Cases

**Tweet deleted?**
→ Returns error with message

**Thread very long?**
→ Extracts first 50 tweets, flags if more exist

**Rate limited?**
→ Waits and retries automatically

**Quote tweet within quote tweet?**
→ Extracts all nested levels

---

## Tips

- Paste full URL: `https://x.com/user/status/123` ✓
- Short URL works too: `x.com/user/status/123` ✓
- Twitter.com links redirect automatically ✓
- Works with threads, replies, conversations ✓

---

## What Happens Under the Hood

1. **URL validation** — Checks format is valid X URL
2. **Browser load** — Opens in background (you don't see it)
3. **Content extraction** — Finds tweet text in DOM
4. **Cleaning** — Removes HTML, normalizes whitespace
5. **Structure** — Detects thread/reply relationships
6. **Return** — Clean, readable output

All happens in 2-5 seconds.

---

## Troubleshooting

**"Tweet not found"**
- URL might be wrong
- Tweet might be deleted
- Account might be private
→ Check URL, try a different tweet

**"Page took too long"**
- X might be slow or rate-limiting
- Script will retry automatically
→ Try again in a moment

**"No text extracted"**
- Unusual tweet format
- Possibly a poll or media-only tweet
→ Check tweet manually, might not have readable text

**"Thread incomplete"**
- Very long thread (50+ tweets)
→ Specify which tweets you want analyzed

---

## Version

0.1.0 — Initial release

---

## How to Use with Multiple Tweets

Just paste all the URLs and I'll read them all:

```
Read these tweets:
1. https://x.com/voxyz_ai/status/2024113846093582528
2. https://x.com/morganlinton/status/2023894165164335364
3. https://x.com/arscontexta/status/2023957499183829467
...and the rest
```

I'll extract all of them and present the content cleanly.

