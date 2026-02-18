---
name: email-agent
title: Email Agent — Multi-Agent Communication Service
description: Centralized email handling for multi-agent system. Sends emails on behalf of all agents, tracks delivery, manages templates, enforces rate limiting and guardrails.
version: 1.0.0
status: production
type: shared-service

frontmatter:
  name: email-agent
  title: Email Agent
  description: Centralized email service for multi-agent system. Handles sending, tracking, templating, rate-limiting, and guardrails enforcement.
  triggers:
    - "Send email"
    - "Email notification"
    - "Send report"
    - "Bulk email"
    - "Email campaign"
  exclusions:
    - "Email composition (done by requesting agent)"
    - "Email template design (user responsibility)"
    - "Email content approval (COO responsibility)"
  version: 1.0.0

mcp_servers:
  - name: smtp
    description: SMTP server for email delivery
    tools:
      - send_email
      - schedule_email
      - check_delivery_status
  - name: email_tracking
    description: Email tracking and analytics
    tools:
      - track_delivery
      - track_opens
      - track_clicks
      - get_bounce_list

hard_stops:
  bulk_send:
    level: 2_require_approval
    threshold: 500
    escalate_at: 1000
  new_recipient:
    level: 2_require_approval
    condition: after_100_addresses
  rate_limit_per_agent:
    level: 4_rate_limit
    limit: 50
    period: per_hour
  unsubscribe_override:
    level: 1_prevent
    override: user_only

skill_graph_integration:
  message_protocol: inter_agent_messages
  requires_approval_path: coo
  audit_logging: enabled
---

# Email Agent — Multi-Agent Communication Service

**Centralized email handling for the multi-agent system.**

All agents (Atlas, Astra, Sentinel, COO) use Email Agent to send emails. This ensures:
- Consistent authentication (no scattered credentials)
- Rate limiting (prevent API abuse)
- Guardrails enforcement (approved recipients, bulk send limits)
- Audit trail (every email logged)
- Template consistency (standardized formats)

---

## What It Does

### 1. **Send Email**
```
REQUEST from [Agent]
  To: email-agent
  Action: send_email
  Payload:
    from: [Agent]
    to: recipient@example.com
    subject: "..."
    body: "..."
  
RESPONSE from email-agent
  Status: queued | sent | rejected
  Message: reason if rejected
  Timestamp: when sent
```

### 2. **Schedule Email**
```
REQUEST from [Agent]
  To: email-agent
  Action: schedule_email
  Payload:
    from: [Agent]
    to: recipient@example.com
    send_at: 2026-02-20T09:00:00Z
  
RESPONSE
  Status: scheduled
  Send_time: 2026-02-20T09:00:00Z
```

### 3. **Track Delivery**
```
REQUEST from [Agent]
  To: email-agent
  Action: get_delivery_status
  Payload:
    email_id: uuid
  
RESPONSE
  Status: delivered | bounced | failed | pending
  Open_count: N
  Click_count: N
  Last_status_update: timestamp
```

### 4. **Manage Rate Limits**
```
Per-agent limits (enforced automatically):
  Atlas: 50 emails/hour
  Astra: 50 emails/hour
  Sentinel: 50 emails/hour
  COO: 50 emails/hour
  
If limit exceeded:
  Action: Queue (auto-retry when quota available)
  Priority: Maintain order, no dropping
```

### 5. **Enforce Guardrails**

**Hard Stop: Bulk Send >500**
```
REQUEST from [Agent]
  Recipients: 600 people
  
Email Agent checks:
  Is 600 > 500? YES
  Hard stop triggered: LEVEL 2 (approval required)
  
Action: Queue and escalate to COO
  COO checks:
    Is 600 within budget? YES
    Is sender authorized? YES
  Decision: Approved
  
Email Agent proceeds: Send
```

**Hard Stop: Unsubscribe Override**
```
REQUEST from [Agent]
  To: unsubscribed@example.com
  Override_unsubscribe: true
  
Email Agent checks:
  Is recipient unsubscribed? YES
  Requesting override? YES
  Hard stop triggered: LEVEL 1 (prevent)
  
Action: REJECT
  Cannot send to unsubscribed address
  Exception: Only user can override
```

---

## Prerequisites

### Required
- **Node.js** v18+ (`node --version`)
- **SMTP Server** (Gmail, SendGrid, AWS SES, or self-hosted)
- **API Key** (SMTP credentials in .env)
- **Message Queue** (Redis, shared with other agents)
- **Database** (PostgreSQL/Supabase for email logs)

### Recommended
- **Email Tracking** (SendGrid Event Webhook, Mailgun Webhooks)
- **Template Engine** (Handlebars for dynamic emails)

### Optional
- **Unsubscribe List** (external list management, e.g., Klaviyo)

---

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
cp .env.template .env
```

### 2. Set Up .env

```bash
# SMTP (choose one provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-password-here

# Or: SendGrid
SENDGRID_API_KEY=SG.xxxxx

# Or: AWS SES
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx

# Message Queue (Redis)
REDIS_URL=redis://localhost:6379

# Database
DATABASE_URL=postgres://user:pass@localhost:5432/agents

# Configuration
MOCK_MODE=false
LOG_LEVEL=info
RATE_LIMIT_PER_HOUR=50
MAX_BULK_SEND=500
```

### 3. Start Service

```bash
node agents/email-orchestrator.js
```

### 4. Test (Mock Mode)

```bash
MOCK_MODE=true node agents/email-orchestrator.js
```

---

## Commands

### Send Email (from any agent)

```bash
curl -X POST http://localhost:3000/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "from": "atlas",
    "to": "team@company.com",
    "subject": "Daily Report",
    "body": "Performance metrics...",
    "template": "daily-report"
  }'
```

### Schedule Email

```bash
curl -X POST http://localhost:3000/email/schedule \
  -d '{
    "from": "atlas",
    "to": "team@company.com",
    "subject": "Morning Digest",
    "body": "...",
    "send_at": "2026-02-20T09:00:00Z"
  }'
```

### Get Delivery Status

```bash
curl http://localhost:3000/email/status?email_id=uuid-here
```

### List Templates

```bash
curl http://localhost:3000/email/templates
```

---

## Hard Stops (Guardrails)

### LEVEL 1: PREVENT (Never Allow)
- ❌ Send to unsubscribed address (without user override)
- ❌ Send spam/malicious content
- ❌ Access other user's email lists

### LEVEL 2: REQUIRE APPROVAL
- ❌ Bulk send >500 recipients (needs COO approval)
- ❌ Bulk send >1000 recipients (needs user approval)
- ❌ New recipient after 100 approved (needs whitelist approval)

### LEVEL 4: RATE LIMIT
- ❌ >50 emails/hour per agent (auto-queue)
- ❌ >1000 emails/day (alert COO)

### LEVEL 5: BUDGET
- ❌ Monthly email budget enforced
- ❌ Alerts when approaching limit

---

## Configuration

### email-config.json

```json
{
  "service": {
    "name": "Email Agent",
    "version": "1.0.0",
    "port": 3000,
    "provider": "sendgrid"
  },

  "providers": {
    "gmail": {
      "host": "smtp.gmail.com",
      "port": 587,
      "auth": {
        "user": "${SMTP_USER}",
        "pass": "${SMTP_PASSWORD}"
      }
    },
    "sendgrid": {
      "api_key": "${SENDGRID_API_KEY}"
    },
    "aws-ses": {
      "region": "${AWS_SES_REGION}",
      "credentials": {
        "accessKeyId": "${AWS_ACCESS_KEY_ID}",
        "secretAccessKey": "${AWS_SECRET_ACCESS_KEY}"
      }
    }
  },

  "guardrails": {
    "bulk_send_threshold": 500,
    "bulk_send_escalate": 1000,
    "rate_limit_per_hour": 50,
    "rate_limit_per_day": 1000,
    "require_whitelist_after": 100
  },

  "templates": {
    "daily_report": {
      "subject": "Daily Report — {{date}}",
      "html_file": "templates/daily-report.html"
    },
    "approval_needed": {
      "subject": "Approval Required: {{action}}",
      "html_file": "templates/approval-needed.html"
    },
    "escalation_alert": {
      "subject": "⚠️ Escalation: {{issue}}",
      "html_file": "templates/escalation.html"
    }
  },

  "tracking": {
    "enabled": true,
    "track_opens": true,
    "track_clicks": true,
    "webhook_secret": "${TRACKING_WEBHOOK_SECRET}"
  },

  "audit_logging": {
    "enabled": true,
    "log_all_sends": true,
    "log_bounces": true,
    "log_guardrail_violations": true
  }
}
```

---

## Database Schema

### emails table
```sql
CREATE TABLE emails (
  id UUID PRIMARY KEY,
  from_agent VARCHAR(50),              -- atlas, astra, sentinel, coo
  to_address VARCHAR(255),
  subject VARCHAR(500),
  body TEXT,
  template_name VARCHAR(100),
  status VARCHAR(20),                  -- queued, sent, delivered, bounced, failed
  send_at TIMESTAMP,
  sent_at TIMESTAMP,
  delivery_status_updated_at TIMESTAMP,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  requires_approval BOOLEAN,
  approved_by VARCHAR(50),             -- coo, user
  approval_timestamp TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP,
  
  INDEX (from_agent, created_at),
  INDEX (status, created_at),
  INDEX (to_address)
);
```

### email_templates table
```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  subject VARCHAR(500),
  html_content TEXT,
  version INTEGER,
  created_by VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### email_whitelist table
```sql
CREATE TABLE email_whitelist (
  id UUID PRIMARY KEY,
  address VARCHAR(255),
  approved_by VARCHAR(50),
  approved_at TIMESTAMP,
  active BOOLEAN DEFAULT true
);
```

### rate_limit_tracking table
```sql
CREATE TABLE rate_limit_tracking (
  id UUID PRIMARY KEY,
  agent VARCHAR(50),
  hour_start TIMESTAMP,
  email_count INTEGER,
  status VARCHAR(20),                  -- within_limit, exceeded, queued
  created_at TIMESTAMP,
  INDEX (agent, hour_start)
);
```

---

## Workflow: Atlas Sends Daily Report

```
1. ATLAS AGENT
   └─ Generates daily performance report
   └─ Wants to email to team@company.com
   └─ Calls: email-agent.send(...)

2. EMAIL AGENT RECEIVES REQUEST
   ├─ Check guardrails:
   │  ├─ Is recipient whitelisted? YES ✓
   │  ├─ Is bulk send? NO ✓
   │  └─ Is rate limit OK? YES ✓
   └─ No approval needed

3. EMAIL AGENT AUTHENTICATES
   ├─ Load SMTP credentials from .env
   ├─ Verify provider (SendGrid, Gmail, AWS SES)
   └─ Connect to SMTP server

4. EMAIL AGENT SENDS
   ├─ Format email (subject, body, headers)
   ├─ Add tracking pixel (if enabled)
   ├─ Send via provider
   └─ Get delivery status

5. EMAIL AGENT LOGS
   ├─ Store in database: sent, timestamp, status
   ├─ Track: opens, clicks, bounces (webhooks)
   └─ Return to Atlas: "✓ Sent to team@company.com"

6. ATLAS REPORTS TO COO
   └─ Message: "Email sent successfully"
```

---

## Workflow: COO Bulk Email (Escalation)

```
1. COO AGENT
   └─ Wants to send announcement to 600 customers
   └─ Calls: email-agent.send(recipients=600, ...)

2. EMAIL AGENT RECEIVES REQUEST
   ├─ Check guardrails:
   │  ├─ Is 600 > 500 (bulk threshold)? YES ⚠️
   │  └─ Hard stop triggered: LEVEL 2 (approval needed)
   └─ Action: Queue and escalate

3. EMAIL AGENT ESCALATES TO COO
   └─ Message: "Bulk send (600 recipients) requires approval"

4. COO CHECKS
   ├─ Is this authorized? (check user's previous bulk sends)
   ├─ Is 600 > 1000 (escalate to user)? NO
   └─ COO auto-approves

5. EMAIL AGENT RECEIVES APPROVAL
   ├─ Load from approval queue
   ├─ Update status: approved
   └─ Proceed with sending

6. EMAIL AGENT SENDS
   ├─ Format bulk email
   ├─ Add personalization ({{name}}, {{company}})
   ├─ Add unsubscribe link
   └─ Send in batches (respect API limits)

7. EMAIL AGENT REPORTS
   ├─ Sent: 595
   ├─ Bounced: 3
   ├─ Undeliverable: 2
   └─ Return to COO: "Sent successfully"

8. COO REPORTS TO USER
   └─ "600 customer emails sent. 595 delivered, 5 issues."
```

---

## Features

### ✅ Multiple SMTP Providers
- Gmail (SMTP)
- SendGrid (API)
- AWS SES (API)
- Generic SMTP servers

### ✅ Rate Limiting
- Per-agent limits (50/hour by default)
- Auto-queue when exceeded
- Maintain order, no dropping

### ✅ Guardrails Enforcement
- Hard stop 1 (Prevent): Unsubscribed addresses
- Hard stop 2 (Approve): Bulk sends >500
- Hard stop 4 (Rate limit): Frequency limits
- Hard stop 5 (Budget): Monthly limits

### ✅ Email Tracking
- Delivery status (sent, delivered, bounced)
- Open tracking (pixel)
- Click tracking (link rewriting)
- Bounce handling

### ✅ Templates
- Handlebars for dynamic content
- Pre-defined templates (report, alert, approval)
- Custom template support

### ✅ Audit Logging
- Every email logged
- Approval chain recorded
- Guardrail violations tracked
- Bounce/delivery issues logged

### ✅ Mock Mode
- Test without real SMTP
- Generates fake delivery status
- Perfect for testing workflows

---

## Testing (Mock Mode)

```bash
# Start in mock mode
MOCK_MODE=true node agents/email-orchestrator.js

# Test: Send simple email
curl -X POST http://localhost:3000/email/send \
  -d '{
    "from": "atlas",
    "to": "test@example.com",
    "subject": "Test",
    "body": "Hello"
  }'
# Response: {"status": "sent", "message_id": "uuid", "timestamp": "..."}

# Test: Bulk send (should escalate)
curl -X POST http://localhost:3000/email/send \
  -d '{
    "from": "coo",
    "recipients": 600,
    "subject": "Announcement",
    "body": "..."
  }'
# Response: {"status": "requires_approval", "escalation_id": "uuid"}

# Test: Check rate limits
curl http://localhost:3000/email/rate-limit?agent=atlas
# Response: {"agent": "atlas", "hourly_count": 45, "limit": 50, "status": "ok"}
```

---

## Next Steps

1. **Setup:** Copy .env.template → .env, add credentials
2. **Start:** `node agents/email-orchestrator.js`
3. **Test:** Use mock mode to verify functionality
4. **Deploy:** Add to message queue, connect to COO agent
5. **Monitor:** Check audit logs, track delivery rates

---

## Success Criteria

✅ All agents can send emails via Email Agent  
✅ Rate limits enforced (no agent exceeds 50/hour)  
✅ Bulk sends require approval (>500)  
✅ Guardrails prevent violations  
✅ Delivery tracked accurately  
✅ Audit trail complete  
✅ 99%+ delivery rate (for valid addresses)  
✅ <1% bounce rate  

---

**Email Agent Ready for Deployment**

Next: Build COO Agent (orchestration layer)

