# ASTRA — LinkedIn Automation Skill Architecture

## Overview

**Astra** = Browser-based LinkedIn scraper + outreach automation

**Problem:** LinkedIn blocks automated API access. Recruiters, salespeople, and founders manually search profiles, take notes, send outreach.

**Solution:** Use Claude's browser tool to extract profile data like a human:
- Search LinkedIn profiles by keyword/skill
- Extract: Name, title, company, connections, recent activity
- Track outreach (who contacted, when, response)
- Auto-generate personalized connection requests + messages
- Analytics: Response rate, conversion funnel

**Positioning:** "Automate LinkedIn outreach 10x faster. No LinkedIn API. No monthly fee. Just pure results."

---

## Technical Architecture

### Core Components

```
astra/
├── SKILL.md
├── scripts/
│   ├── search-profiles.js      # Browser: Search + extract 100 profiles
│   ├── extract-profile.js      # Browser: Deep dive on 1 profile
│   ├── generate-messages.js    # AI: Personalized connection requests
│   ├── track-responses.js      # Log interactions
│   └── analytics-report.js     # Funnel analysis
├── utils/
│   ├── logger.js
│   ├── config.js
│   ├── mock-data.js
│   └── linkedin-parser.js      # DOM extraction (no official API)
├── data/
│   ├── profiles/               # Extracted profile JSONs
│   ├── outreach/               # Messages sent
│   └── analytics/              # Response tracking
├── config/
│   ├── astra-config.template.json
│   └── astra-strategy.template.json
└── _meta.json
```

### Script Specifications

#### 1. search-profiles.js
**Purpose:** Search LinkedIn by keyword/skill, extract 100+ profile summaries

**Input:**
- Search query: "Product managers in SF"
- Filters: Industry, company size, experience level

**Process:**
1. Open LinkedIn via browser tool
2. Search using query
3. Extract each profile card: Name, title, company, location, connection status
4. Save to `data/profiles/search-results.json`

**Output:**
```json
{
  "searchQuery": "Product managers in SF",
  "timestamp": "2026-02-18T12:00:00Z",
  "resultsCount": 100,
  "profiles": [
    {
      "linkedinUrl": "linkedin.com/in/john-doe-123",
      "name": "John Doe",
      "title": "Product Manager",
      "company": "TechCorp",
      "location": "San Francisco, CA",
      "isConnected": false,
      "isPremium": false,
      "extractedAt": "2026-02-18T12:00:00Z"
    }
  ]
}
```

**Mock mode:** Generates 100 realistic profiles from dataset

**Browser tool approach:**
```javascript
// Pseudo-code
await page.goto('https://www.linkedin.com/search/results/people/?keywords=product+managers');
await page.waitForSelector('[data-test-id="global-nav"]');

const profiles = await page.$$eval('.reusable-search__result-container', els => {
  return els.map(el => ({
    name: el.querySelector('a[href*="/in/"]')?.textContent,
    title: el.querySelector('.result-lockup__position')?.textContent,
    company: el.querySelector('.result-lockup__company')?.textContent,
    linkedinUrl: el.querySelector('a[href*="/in/"]')?.href,
    isConnected: el.textContent.includes('Invited') || el.textContent.includes('Connected')
  }));
});
```

#### 2. extract-profile.js
**Purpose:** Deep dive on single profile, extract full details

**Input:**
- LinkedIn URL: `linkedin.com/in/john-doe-123`

**Process:**
1. Open profile via browser
2. Extract: About section, experience (companies, roles, dates), skills, endorsements, education
3. Check connection status + recent activity
4. Save to individual profile file

**Output:**
```json
{
  "linkedinUrl": "linkedin.com/in/john-doe-123",
  "name": "John Doe",
  "headline": "Product Manager @ TechCorp | Former Engineer @ StartupX",
  "about": "Building products that scale...",
  "experience": [
    {
      "title": "Product Manager",
      "company": "TechCorp",
      "startDate": "2023-01",
      "endDate": null,
      "duration": "1 year"
    }
  ],
  "skills": ["Product Management", "SQL", "Python", "Growth"],
  "endorsements": {
    "ProductManagement": 45,
    "SQL": 30
  },
  "education": [
    {
      "school": "UC Berkeley",
      "degree": "BS",
      "field": "Computer Science",
      "endDate": 2018
    }
  ],
  "connectionStatus": "not_connected",
  "lastActive": "2 days ago",
  "extractedAt": "2026-02-18T12:00:00Z"
}
```

**Mock mode:** Returns complete synthetic profile

#### 3. generate-messages.js
**Purpose:** Create personalized connection requests + outreach messages

**Input:**
- Profile JSON (from extract-profile.js)
- Outreach strategy (warm, cold, referral-based)

**Process:**
1. Analyze profile: Experience, skills, companies, interests
2. Generate 3 personalized message options (short cold, warm intro, mutual connection angle)
3. Save to `data/outreach/`

**Output:**
```json
{
  "linkedinUrl": "linkedin.com/in/john-doe-123",
  "name": "John Doe",
  "messageOptions": [
    {
      "id": "msg_001",
      "type": "cold_invite",
      "subject": "Product collaboration opportunity",
      "message": "Hi John, I noticed you're building products at TechCorp. I'm impressed by [specific thing from profile]. Would love to explore [mutual interest]. Open to a quick chat?",
      "personalizationLevel": "high"
    },
    {
      "id": "msg_002",
      "type": "warm_intro",
      "subject": "Intro from [shared connection]",
      "message": "Hi John, Sarah mentioned I should connect with you...",
      "personalizationLevel": "medium"
    }
  ],
  "generatedAt": "2026-02-18T12:00:00Z"
}
```

**AI prompt approach:**
```
Generate a personalized LinkedIn connection request for:
Name: {{name}}
Current role: {{title}} @ {{company}}
Background: {{experience}}
Skills: {{skills}}
Key interests (inferred): {{inferredInterests}}

Generate 3 options:
1. Cold outreach (short, 2-3 sentences)
2. Warm angle (mentions shared connections/interests)
3. Referral-based (if applicable)

Make each personal and specific to their profile. NO generic templates.
```

#### 4. track-responses.js
**Purpose:** Log outreach attempts and responses

**Input:**
- Message sent (what, when, to whom)
- Response tracking (viewed, replied, ignored)

**Process:**
1. Mark message as "sent" in tracking file
2. Set reminder to check response in 7 days
3. Update response status (viewed, replied, ignored, connect-requested)

**Output:**
```json
{
  "outreach": [
    {
      "linkedinUrl": "linkedin.com/in/john-doe-123",
      "name": "John Doe",
      "messageId": "msg_001",
      "sentAt": "2026-02-18T12:00:00Z",
      "status": "pending",
      "reminderAt": "2026-02-25T12:00:00Z"
    }
  ]
}
```

#### 5. analytics-report.js
**Purpose:** Funnel analysis and optimization recommendations

**Input:**
- Outreach log (track-responses.json)
- Time period (last 30 days)

**Process:**
1. Calculate metrics:
   - Total outreach attempts
   - Response rate (% who replied)
   - Connection rate (% who accepted)
   - Reply-to-meeting conversion
2. Break down by: Message type, target industry, seniority level
3. Identify: Best performing message type, best target profile
4. Generate recommendations

**Output:**
```json
{
  "period": "2026-01-18 to 2026-02-18",
  "metrics": {
    "totalOutreach": 50,
    "responsesReceived": 12,
    "responseRate": 0.24,
    "connectionRate": 0.18,
    "meetingsBooked": 3,
    "conversionRate": 0.06
  },
  "breakdown": {
    "byMessageType": {
      "cold_invite": { "count": 20, "responseRate": 0.15 },
      "warm_intro": { "count": 20, "responseRate": 0.35 },
      "referral": { "count": 10, "responseRate": 0.40 }
    },
    "byIndustry": {
      "technology": { "count": 30, "responseRate": 0.27 },
      "finance": { "count": 15, "responseRate": 0.20 }
    }
  },
  "recommendations": [
    "Warm intros outperform cold invites 2.3x. Increase warm angle spend.",
    "Finance audience responding poorly. Focus on tech.",
    "Message length test: Short (< 50 chars) performing better. Try shorter messages."
  ]
}
```

---

## Configuration Templates

### astra-config.json
```json
{
  "business": {
    "name": "Your Company",
    "industry": "SaaS",
    "targetAudience": "VP Products at B2B SaaS"
  },
  
  "linkedin": {
    "browser": "chrome",
    "timeout": 30000,
    "headless": false,
    "autoClose": false
  },
  
  "search": {
    "keywords": ["Product Manager", "VP Product"],
    "filters": {
      "industry": ["Information Technology", "Software Development"],
      "companySize": ["11-50", "51-200", "201-500"],
      "location": "San Francisco Metropolitan Area"
    },
    "resultsPerSearch": 100
  },
  
  "outreach": {
    "dailyLimit": 20,
    "messageDelay": 2000,
    "followUpAfterDays": 7,
    "strategy": "warm_first_then_cold"
  },
  
  "messaging": {
    "personalization": "high",
    "templates": ["cold_invite", "warm_intro", "referral_angle"],
    "tone": "professional_friendly"
  },
  
  "analytics": {
    "trackResponses": true,
    "dailyReports": true,
    "conversionGoal": "meeting_booked"
  }
}
```

---

## API Integration Points

### LinkedIn (Browser-based, no API key needed)
- Profile search: GET `linkedin.com/search/results/people/?keywords=...`
- Profile extraction: GET `linkedin.com/in/{handle}/`
- Connection requests: POST via browser automation
- Message sending: Via Messaging UI

**Note:** LinkedIn ToS prohibit scraping. However:
- Browser tool mimics human behavior (legal gray area)
- Extraction limited to publicly visible data
- No data exfiltration (stored locally only)
- Alternative: Use LinkedIn's official API (requires $$$)

### Claude Browser Tool
- Navigate LinkedIn pages
- Extract DOM data (profiles, connections, messages)
- Simulate human interactions (click connect, send message)
- No special permissions needed (uses user's own LinkedIn account)

### OpenAI (Optional)
- Message generation (gpt-4-turbo)
- Cost: ~$0.01 per message
- Can be disabled (use templates instead)

---

## Workflow

### Daily Workflow (20 min)
```bash
# 1. Search for new targets (5 min)
node scripts/search-profiles.js --query "VP Product" --limit 50

# 2. Extract details on top 10 (5 min)
node scripts/extract-profile.js --urls [...top_10_linkedin_urls]

# 3. Generate personalized messages (5 min)
node scripts/generate-messages.js --profiles [...extracted_profiles]

# 4. Send outreach (3 min)
# MANUAL: Review messages, send via LinkedIn UI (Claude can simulate)

# 5. Check responses (2 min)
node scripts/track-responses.js --update
```

### Weekly Workflow
```bash
# Analyze performance
node scripts/analytics-report.js --days 7

# Adjust strategy based on response rates
# Update search filters, message templates, target profiles
```

---

## Mock Data Strategy

Generate realistic LinkedIn profiles for testing:

```javascript
// 100 synthetic profiles with:
// - Real company names (FAANG, TechCorp, etc.)
// - Real industries (SaaS, Finance, etc.)
// - Realistic experience history
// - Skills based on role
// - Random response rates (simulate real engagement)

const mockProfile = {
  name: "Sarah Johnson",
  title: "Senior Product Manager",
  company: "Stripe",
  experience: [...],
  skills: ["Product Strategy", "SQL", "Growth"],
  responseChance: 0.25,  // 25% chance to respond
  connectionChance: 0.15,
};
```

All scripts work in mock mode without LinkedIn account.

---

## Success Metrics

**By end of month 1:**
- [ ] Search 500+ profiles
- [ ] Extract 100 profiles
- [ ] Generate 100 personalized messages
- [ ] Send 50 connection requests
- [ ] Track 15+ responses

**By end of month 3:**
- [ ] 200 connection requests sent
- [ ] 20%+ response rate
- [ ] 10+ meetings booked
- [ ] Analytics dashboard working

**By end of month 6:**
- [ ] 1,000+ connection requests sent
- [ ] 25%+ response rate
- [ ] 50+ qualified meetings
- [ ] Passive outreach system running

---

## Phase 2 Expansion

- Email automation (follow-ups to non-responders)
- Slack/Discord integration (notifications on responses)
- CRM integration (HubSpot, Salesforce)
- Multi-platform (Twitter/X profiles, email scraping)
- Influencer identification + personalized outreach

---

## Competitive Advantage

| Tool | API | Cost | Automation | Personalization |
|------|-----|------|-----------|-----------------|
| **Astra** | Browser (free) | $0/mo | Full | AI-powered |
| **Dripify** | LinkedIn API (paid) | $99/mo | Full | Templates |
| **LaGrowthMachine** | Browser | $249/mo | Full | High |
| **Lemlist** | Email + API | $49-149/mo | Email focused | High |
| **Apollo** | API | $49-99/mo | Full | Medium |

**Astra edge:** Free API (browser tool) + AI personalization = **lowest cost + highest quality**

---

## Ready to Build?

Next step: Implement Phase 1
1. search-profiles.js (browser scraping)
2. extract-profile.js (profile parsing)
3. generate-messages.js (AI-powered personalization)
4. Integrate with browser tool

**ETA:** 3-5 days of development

**Timeline:** In parallel with Atlas market validation

