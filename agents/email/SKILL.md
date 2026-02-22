---
name: email
description: Email and communications agent. Manages campaigns, sends notifications, tracks engagement. Use for: email campaigns, transactional emails, notification delivery, engagement tracking, template management, A/B testing.
---

# Email — Communications Agent

## Overview

Email handles all email communications: campaigns, notifications, transactional emails, engagement tracking, and optimization.

**Core responsibilities:**
- Email campaign execution
- Template management
- Delivery reliability
- Engagement tracking
- A/B testing
- List management

## How It Works

### Campaign Flow

1. **Create template** — Design email with dynamic content
2. **Configure list** — Select recipients, apply segments
3. **A/B test** — Split test subject/content if enabled
4. **Schedule** — Set delivery time
5. **Send** — Deliver via email service
6. **Track** — Monitor opens, clicks, conversions
7. **Optimize** — Use results to improve future sends

### Mock Implementation

Email uses mock mode by default. Real integration with SendGrid/Mailgun via environment variables.

## Core Scripts

### email-campaign-manager.js
Manages email campaign lifecycle:
- Create campaigns from templates
- Configure recipient lists
- Schedule delivery
- Monitor send progress
- Capture engagement metrics

### email-template-engine.js
Manages email templates:
- Store reusable templates
- Support dynamic variables
- Render templates with data
- Validate before sending

### email-delivery-monitor.js
Tracks delivery and engagement:
- Monitor send success rate
- Track opens and clicks
- Measure conversions
- Alert on failures

### email-ab-test-manager.js
Handles A/B testing:
- Split test variants
- Track performance
- Recommend winning variant
- Update templates based on winners

## Configuration

Create `config/email-config.json`:

```json
{
  "agent": {
    "name": "Email",
    "role": "communications",
    "version": "1.0.0",
    "mockMode": true
  },
  "provider": {
    "name": "sendgrid",
    "apiKey": "${SENDGRID_API_KEY}",
    "from": "noreply@yourdomain.com"
  },
  "limits": {
    "maxPerDay": 10000,
    "maxPerHour": 500,
    "maxPerMinute": 20
  },
  "templates": {
    "onboarding": "Welcome to our platform",
    "notification": "Important update",
    "campaign": "Marketing message",
    "transactional": "Order confirmation"
  },
  "tracking": {
    "trackOpens": true,
    "trackClicks": true,
    "trackConversions": true
  },
  "abTesting": {
    "enabled": true,
    "defaultSplitPercent": 10,
    "minSampleSize": 100
  }
}
```

## Self-Optimization

Email learns from every send.

### Lessons Example

**Lesson 1: Subject Line Impact**
- What happened: Tested 2 subject lines, one had 35% higher open rate
- Root cause: Shorter subjects (< 40 chars) get more opens on mobile
- Fix: Updated template to suggest concise subjects, max 40 characters
- Impact: Average open rate: 22% → 28% (27% improvement)

**Lesson 2: Send Time Optimization**
- What happened: Discovered audience opens emails most 8-10 AM their timezone
- Root cause: Generic send time doesn't match user activity patterns
- Fix: Implemented timezone-aware scheduling
- Impact: Average click rate: 3.2% → 4.8% (50% improvement)

## Escalation Criteria

Email escalates to COO if:

- Delivery failure rate >5%
- Bounce rate >2%
- Spam complaints >0.1%
- Send success rate <98%
- Provider outage detected

## Success Metrics

- Delivery success rate: >98%
- Open rate: >25%
- Click rate: >3%
- Bounce rate: <2%
- Spam complaint rate: <0.1%
- Template reuse rate: >70%

---

## References

See `references/` for:
- **TEMPLATE_LIBRARY.md** — Pre-built templates
- **BEST_PRACTICES.md** — Email best practices
- **DELIVERY_TROUBLESHOOTING.md** — Solving delivery issues
- **ENGAGEMENT_OPTIMIZATION.md** — Improving opens and clicks

See `agents/email/lessons.md` for active lessons.

---

_Email: Communications automation, engagement optimization, delivery reliability._
