# Multi-Agent System Architecture

**Vision:** 5 specialized agents + 1 governance agent = autonomous business operations  
**Status:** Architecture Design (Ready to Build)  
**Timeline:** 3-4 weeks to production-ready

---

## System Overview

```
┌───────────────────────────────────────────────────────────┐
│                    COO AGENT                              │
│         (Chief Operating Officer - Governance)             │
│   • Receives user requests                                │
│   • Creates execution plans                               │
│   • Assigns work to agents                                │
│   • Approves major actions                                │
│   • Coordinates agent communication                        │
│   • Monitors compliance with hard stops                    │
└─────────┬────────────────┬─────────────┬──────────────────┘
          │                │             │
    ┌─────▼──────┐  ┌──────▼────┐  ┌────▼──────────┐
    │   ATLAS    │  │   ASTRA   │  │   SENTINEL   │
    │ (Marketing)│  │(Asst/Ops) │  │  (Support)   │
    │            │  │           │  │              │
    │ Skills:    │  │ Skills:   │  │ Skills:      │
    │• Generate  │  │• Schedule │  │• Triage      │
    │• Adapt     │  │• Respond  │  │• Resolve     │
    │• Schedule  │  │• Document │  │• Escalate    │
    │• Analyze   │  │• Research │  │• Track       │
    └─────┬──────┘  └──────┬────┘  └────┬─────────┘
          │                │             │
          │      ┌─────────┴─────────┐   │
          │      │                   │   │
          └──────┤  EMAIL AGENT      ├───┘
                 │  (Shared Service) │
                 │                   │
                 │ • Send emails     │
                 │ • Track delivery  │
                 │ • Manage templates│
                 │ • Rate limiting   │
                 └───────────────────┘

COMMUNICATION LAYER (Message Queue + API)
├── Inter-agent requests
├── Approval workflows
├── Status updates
├── Error escalation
└── Audit trail
```

---

## The 5 Agents

### 1. ATLAS — Marketing Agent

**Purpose:** Automate social media marketing and content creation

**Responsibilities:**
- Generate content (AI images + hooks)
- Adapt for platforms (TikTok, Instagram, YouTube)
- Schedule posts
- Analyze performance
- Optimize hooks

**Skills:**
- marketing-discover (research trends)
- marketing-generate (AI images)
- marketing-adapt-* (platform formats)
- marketing-schedule (Postiz)
- marketing-collect (analytics)
- marketing-analyze (performance)
- marketing-report (digests)

**Hard Stops (Must NOT exceed):**
- ❌ Cannot spend > $100/month on APIs without COO approval
- ❌ Cannot post without approval (first 10 posts must be approved)
- ❌ Cannot post to more than 6 platforms without COO review
- ❌ Cannot send more than 100 emails/day (via Email Agent)
- ❌ Cannot modify user's existing content
- ❌ Rate limit: 5 posts per hour per platform

**Approval Gates:**
- First 5 posts: Manual approval
- After 5 posts: Auto-post if hook performance > threshold
- Spending > $50: Requires COO approval
- New platform integration: COO approval required

**Reports to:** COO  
**Communicates with:** Email Agent, COO

---

### 2. ASTRA — Virtual Assistant

**Purpose:** Manage calendars, emails, tasks, and operations

**Responsibilities:**
- Schedule meetings
- Draft responses to emails
- Create and prioritize tasks
- Conduct research
- Prepare documents
- Send meeting prep materials

**Skills:**
- va-email-triage (priority inbox)
- va-calendar-schedule (find slots)
- va-task-create (from emails)
- va-task-prioritize (daily top 3)
- va-meeting-prep (research + agenda)
- va-research (find information)
- va-document-create (SOPs, guides)

**Hard Stops:**
- ❌ Cannot schedule > 8 hours of meetings/day
- ❌ Cannot send emails to external addresses without COO approval (first 10)
- ❌ Cannot delete or archive emails without user confirmation
- ❌ Cannot change calendar entries without notification
- ❌ Cannot share confidential documents
- ❌ Rate limit: 50 emails/hour, 100 tasks/day

**Approval Gates:**
- External emails: First 10 must be approved by COO
- After 10: Auto-send if task-appropriate
- Meeting invites > 5 people: COO approval
- Scheduling > 6 hours/day: COO notification
- Document sharing: User approval only

**Reports to:** COO  
**Communicates with:** Email Agent, Atlas, Sentinel, COO

---

### 3. SENTINEL — Customer Service

**Purpose:** Automate customer support and issue resolution

**Responsibilities:**
- Triage incoming support requests
- Resolve common issues
- Escalate complex problems
- Track issue status
- Send satisfaction surveys
- Log all interactions

**Skills:**
- support-triage (categorize issues)
- support-resolve (FAQ, templates)
- support-escalate (flag for human)
- support-track (status updates)
- support-survey (satisfaction)
- support-refund (process returns)

**Hard Stops:**
- ❌ Cannot refund > $500 without COO approval
- ❌ Cannot promise deliverables outside scope
- ❌ Cannot commit timelines > 48 hours without approval
- ❌ Cannot block/ban users without COO escalation
- ❌ Cannot access user data beyond support context
- ❌ Rate limit: 50 tickets/hour, 5 refunds/day

**Approval Gates:**
- Refunds > $100: COO approval required
- Escalations to human: Automatic (no gate)
- Promises > 24h: COO approval
- User blocks: COO + user approval
- Discount codes: COO approval only

**Reports to:** COO  
**Communicates with:** Email Agent, COO, Atlas (for upsell opportunities)

---

### 4. EMAIL AGENT — Shared Communication Service

**Purpose:** Centralized email management and delivery

**Responsibilities:**
- Send emails (reports, notifications, confirmations)
- Track delivery and opens
- Manage email templates
- Rate limiting for all agents
- Bounce handling and list cleanup

**Skills:**
- email-send (authenticated SMTP)
- email-schedule (send at specific times)
- email-track (delivery + opens)
- email-template (manage templates)
- email-rate-limit (enforce limits per agent)
- email-unsubscribe (handle opt-outs)

**Hard Stops:**
- ❌ Cannot send to > 1,000 people in one batch
- ❌ Cannot send to email addresses not in whitelist (first 100)
- ❌ Cannot override rate limits (agents must queue)
- ❌ Cannot modify email headers
- ❌ Cannot access user passwords
- ❌ Cannot send spam or unsolicited email

**Approval Gates:**
- Bulk sends > 500: COO approval
- New email templates: COO review
- Whitelist changes: COO approval
- Unsubscribe override: User only

**Reports to:** COO  
**Shared by:** All agents (Atlas, Astra, Sentinel, COO)

---

### 5. COO AGENT — Governance & Orchestration

**Purpose:** Oversight, approval workflow, and inter-agent coordination

**Responsibilities:**
- Receive user requests
- Analyze and create execution plans
- Assign work to appropriate agents
- Approve major actions
- Monitor agent compliance
- Escalate exceptions
- Generate daily reports
- Make strategic decisions

**Skills:**
- coo-plan (create execution plans)
- coo-assign (delegate to agents)
- coo-approve (permission workflow)
- coo-monitor (compliance tracking)
- coo-escalate (flag exceptions)
- coo-report (daily summary)
- coo-communicate (inter-agent messaging)

**Hard Stops:**
- ❌ Cannot override other agent guardrails
- ❌ Cannot make decisions beyond scope (ask user)
- ❌ Cannot approve duplicate requests within 1 hour
- ❌ Cannot spend > 10% of budget without user confirmation
- ❌ Cannot make promises on behalf of other agents
- ❌ Must escalate security/privacy concerns immediately

**Authority Gates:**
- Spending < $50: Auto-approve (within budget)
- Spending $50-500: COO approval required
- Spending > $500: COO + user approval required
- External commitments: Always requires user confirmation
- Security issues: Immediate escalation (no approval gate)

**Reports to:** User  
**Communicates with:** All agents + User

---

## Inter-Agent Communication Protocol

### Message Format

```json
{
  "messageId": "uuid",
  "from": "agent_name",
  "to": "agent_name | coo",
  "type": "request | response | notification | escalation",
  "priority": "low | normal | high | critical",
  "payload": {
    "action": "what is being requested",
    "params": {},
    "context": "relevant background"
  },
  "requiresApproval": true | false,
  "approvalPath": "immediate | coo | user",
  "timestamp": "ISO-8601",
  "requiresResponse": true | false,
  "responseDeadline": "ISO-8601 (optional)"
}
```

### Message Types

**REQUEST** — Agent asking another agent to do something
```json
{
  "type": "request",
  "from": "atlas",
  "to": "email",
  "action": "send_email",
  "payload": {
    "to": "team@company.com",
    "subject": "Weekly Marketing Report",
    "body": "..."
  },
  "requiresApproval": false
}
```

**APPROVAL_REQUEST** — Agent asking COO for permission
```json
{
  "type": "approval_request",
  "from": "astra",
  "to": "coo",
  "action": "schedule_external_meeting",
  "payload": {
    "recipient": "external@company.com",
    "time": "2026-02-20T14:00:00Z"
  },
  "requiresApproval": true,
  "approvalPath": "coo"
}
```

**ESCALATION** — Agent reporting a problem
```json
{
  "type": "escalation",
  "from": "sentinel",
  "to": "coo",
  "priority": "high",
  "action": "escalate_refund_request",
  "payload": {
    "reason": "Refund requested > $500",
    "amount": 750,
    "requiresApproval": true,
    "approvalPath": "user"
  }
}
```

### Communication Flow

```
1. Agent initiates action
   ↓
2. Check if action requires approval
   ├─ No → Execute immediately, log action
   └─ Yes → Send approval_request to COO
   ↓
3. COO receives approval_request
   ├─ Can decide automatically → Approve/Reject
   └─ Needs user input → Escalate to user
   ↓
4. Decision made (COO or user)
   ├─ Approved → Agent executes, sends response
   └─ Rejected → Agent notified, action cancelled
   ↓
5. All messages logged to audit trail
```

---

## Hard Stops & Guardrails Framework

### Hard Stop Levels

**LEVEL 1: Prevent Execution**
- Agent cannot execute action under any circumstances
- Exception: Only user can override (manually)
- Examples:
  - Sentinel: Cannot refund > $1,000 without user
  - Astra: Cannot delete user data
  - Email: Cannot send to unsubscribed addresses

**LEVEL 2: Require Approval**
- Agent can request to execute
- COO or user must approve
- If denied, action cancelled
- Examples:
  - Atlas: Spending > $100/month
  - Astra: External emails (first 10)
  - Sentinel: Refunds > $100

**LEVEL 3: Require Notification**
- Agent executes, but COO/user notified immediately
- Can be halted within 5 minutes
- Examples:
  - Atlas: Posting to new platform
  - Astra: Scheduling > 6 hours meetings
  - Sentinel: Creating high-priority ticket

**LEVEL 4: Rate Limiting**
- Agent can execute, but limited frequency
- Automatic queuing if limit exceeded
- Examples:
  - Email: 50 emails/hour per agent
  - Atlas: 5 posts/hour per platform
  - Sentinel: 50 tickets/hour

### Enforcement Mechanism

```javascript
// Every agent action goes through this gatekeeper
async function executeWithGuardrails(agent, action, params) {
  // 1. Check hard stops
  const hardStop = guardrails[agent][action].hardStop;
  if (hardStop === 'PREVENT') {
    if (!userOverride) throw new Error('Action not permitted');
  }

  // 2. Check approval requirements
  const requiresApproval = guardrails[agent][action].requiresApproval;
  if (requiresApproval && !approved) {
    return sendApprovalRequest(agent, action, params);
  }

  // 3. Check rate limits
  const rateLimit = guardrails[agent][action].rateLimit;
  if (currentRate > rateLimit) {
    return queueAction(agent, action, params);
  }

  // 4. Execute action
  const result = await agent.execute(action, params);

  // 5. Log to audit trail
  auditLog.record({
    agent,
    action,
    params,
    result,
    timestamp,
    approvals: approvalChain
  });

  return result;
}
```

---

## Execution Workflows

### User: "I want to grow my business"

```
User Request → COO Agent
    ↓
COO creates plan:
  1. Atlas: Generate 30 posts for month
  2. Email: Send daily digest with performance
  3. Astra: Schedule team meetings around posting times
  4. Sentinel: Monitor customer feedback
    ↓
COO sends assignments:
  Atlas: "Generate 30 posts, adapt for TikTok+Instagram, schedule daily"
    ├─ Approval gate: First 5 posts manual approval
    └─ Execution: Generate → Adapt → Schedule
  
  Astra: "Schedule 3 team syncs for strategy reviews"
    ├─ Approval gate: External attendees need COO OK
    └─ Execution: Find slots → Create meetings → Send invites
  
  Email: "Send daily performance reports"
    ├─ Approval gate: Auto-approved (no external sends)
    └─ Execution: Aggregate data → Generate report → Send
  
  Sentinel: "Alert on customer feedback related to posted content"
    ├─ Approval gate: None (internal only)
    └─ Execution: Monitor → Triage → Report
    ↓
COO monitors:
  • Spending (Atlas: $50/mo OK, $150 needs approval)
  • Compliance (All guardrails being followed)
  • Quality (Performance metrics tracking)
  • Issues (Any escalations → handled)
    ↓
Daily report to user:
  "Atlas posted 10 times, avg 5K views per post.
   Email sent 10 reports, 95% open rate.
   Astra scheduled 3 meetings, team confirmed.
   Sentinel logged 15 support tickets, resolved 12.
   No escalations. All systems nominal."
```

### User: "A customer is upset about a refund"

```
Customer contacts Sentinel
    ↓
Sentinel triages:
  ├─ Issue: Refund request for $250
  ├─ Customer anger: High
  └─ Complexity: Beyond standard policy
    ↓
Sentinel escalates to COO:
  "Customer wants $250 refund. Reason: product didn't meet expectations.
   Standard policy: $100 max. This exceeds limit.
   Requires approval."
    ↓
COO checks:
  ├─ Customer history: Loyal, 3 previous purchases
  ├─ Request reasonableness: Moderate (product issue valid)
  ├─ Budget: Monthly refund budget $500, $150 used, $350 available
  └─ Decision: Approve (within budget, customer value)
    ↓
COO → Sentinel: "Approved. Process $250 refund."
    ↓
Sentinel executes:
  ├─ Process refund
  ├─ Send confirmation email (via Email Agent)
  ├─ Log to audit trail
  └─ Update customer record
    ↓
Email Agent:
  ├─ Receive send request from Sentinel
  ├─ Check guardrails: ✓ Internal recipient OK
  ├─ Send apology + refund confirmation
  └─ Track delivery
    ↓
COO notifies user:
  "Refund processed: $250 to customer X. Reason: good-faith.
   Monthly refund budget: $350 remaining. All within policy."
```

---

## Deployment Architecture

### Single VPS Deployment

```
┌─────────────────────────────────────────┐
│            VPS / Server                 │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Agent Runner (Node.js)        │   │
│  │  ┌─────────────────────────────┐│   │
│  │  │ COO                        ││   │
│  │  │ Atlas                      ││   │
│  │  │ Astra                      ││   │
│  │  │ Sentinel                   ││   │
│  │  │ Email                      ││   │
│  │  └─────────────────────────────┘│   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Message Queue (Redis/Bull)     │   │
│  │  - Inter-agent messages         │   │
│  │  - Task queue                   │   │
│  │  - Rate limiting                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Database (Supabase/PostgreSQL) │   │
│  │  - Agent state                  │   │
│  │  - Audit logs                   │   │
│  │  - Guardrail records            │   │
│  │  - User preferences             │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
         ↕
  ┌──────────────────┐
  │ External APIs    │
  │ • OpenAI         │
  │ • Postiz         │
  │ • Gmail/SMTP     │
  │ • Google Calendar│
  │ • Slack/Discord  │
  └──────────────────┘
```

---

## Database Schema

### agents table
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  name VARCHAR(50),                    -- atlas, astra, sentinel, email, coo
  type VARCHAR(50),                    -- marketing, assistant, support, email, governance
  status VARCHAR(20),                  -- active, paused, disabled
  config JSONB,                        -- agent-specific settings
  hard_stops JSONB,                    -- guardrails for this agent
  rate_limits JSONB,                   -- requests/hour, posts/day, etc
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### inter_agent_messages table
```sql
CREATE TABLE inter_agent_messages (
  id UUID PRIMARY KEY,
  from_agent VARCHAR(50),
  to_agent VARCHAR(50),
  message_type VARCHAR(20),            -- request, response, escalation
  priority VARCHAR(20),                -- low, normal, high, critical
  payload JSONB,
  requires_approval BOOLEAN,
  approval_status VARCHAR(20),         -- pending, approved, rejected
  approval_path VARCHAR(100),          -- immediate, coo, user
  created_at TIMESTAMP,
  responded_at TIMESTAMP
);
```

### audit_log table
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  agent VARCHAR(50),
  action VARCHAR(100),
  params JSONB,
  result JSONB,
  approval_chain JSONB,              -- who approved/rejected
  execution_time_ms INTEGER,
  status VARCHAR(20),                -- success, failed, pending
  error_message TEXT,
  created_at TIMESTAMP,
  INDEX (agent, created_at),
  INDEX (action, created_at)
);
```

### guardrails_violations table
```sql
CREATE TABLE guardrail_violations (
  id UUID PRIMARY KEY,
  agent VARCHAR(50),
  action VARCHAR(100),
  violation_type VARCHAR(50),        -- hard_stop, rate_limit, approval_required
  severity VARCHAR(20),              -- warning, alert, critical
  details JSONB,
  resolution VARCHAR(50),            -- blocked, queued, escalated, approved
  created_at TIMESTAMP,
  resolved_at TIMESTAMP
);
```

---

## Hard Stops Configuration

```json
{
  "atlas": {
    "post_content": {
      "hardStop": "LEVEL2_REQUIRE_APPROVAL",
      "approvalPath": "coo",
      "approvalCondition": "first_5_posts",
      "rateLimitAfter": "5 approved posts"
    },
    "spend_budget": {
      "hardStop": "LEVEL2_REQUIRE_APPROVAL",
      "approvalPath": "coo",
      "threshold": 100,
      "period": "monthly"
    },
    "post_frequency": {
      "hardStop": "LEVEL4_RATE_LIMIT",
      "limit": 5,
      "period": "per_hour",
      "action": "queue"
    }
  },
  "astra": {
    "external_email": {
      "hardStop": "LEVEL2_REQUIRE_APPROVAL",
      "approvalPath": "coo",
      "approvalCondition": "first_10_emails",
      "rateLimitAfter": "10 approved emails"
    },
    "meeting_schedule": {
      "hardStop": "LEVEL3_NOTIFICATION",
      "notifyOn": "meetings_per_day > 6",
      "cancelWindow": 5,
      "unit": "minutes"
    },
    "delete_operations": {
      "hardStop": "LEVEL1_PREVENT",
      "override": "user_only",
      "requireConfirmation": true
    }
  },
  "sentinel": {
    "refund_amount": {
      "hardStop": "LEVEL2_REQUIRE_APPROVAL",
      "approvalPath": "coo",
      "threshold": 100,
      "escalateAt": 500,
      "escalationPath": "user"
    },
    "user_block": {
      "hardStop": "LEVEL2_REQUIRE_APPROVAL",
      "approvalPath": "coo",
      "escalateAt": "any_block",
      "escalationPath": "user"
    },
    "ticket_rate": {
      "hardStop": "LEVEL4_RATE_LIMIT",
      "limit": 50,
      "period": "per_hour",
      "action": "queue"
    }
  },
  "email": {
    "bulk_send": {
      "hardStop": "LEVEL2_REQUIRE_APPROVAL",
      "approvalPath": "coo",
      "threshold": 500,
      "escalateAt": 1000,
      "escalationPath": "user"
    },
    "new_recipient": {
      "hardStop": "LEVEL2_REQUIRE_APPROVAL",
      "approvalPath": "whitelist",
      "approvalCondition": "first_100",
      "rateLimitAfter": "100 approved addresses"
    },
    "rate_limit_per_agent": {
      "hardStop": "LEVEL4_RATE_LIMIT",
      "limit": 50,
      "period": "per_hour",
      "action": "queue"
    }
  },
  "coo": {
    "spending_decision": {
      "hardStop": "LEVEL2_REQUIRE_APPROVAL",
      "approvalPath": "user",
      "threshold": 500,
      "escalateAt": 1000
    },
    "external_commitment": {
      "hardStop": "LEVEL2_REQUIRE_APPROVAL",
      "approvalPath": "user",
      "neverAuto": true
    },
    "security_issue": {
      "hardStop": "LEVEL1_PREVENT_EXECUTION",
      "escalateImmediately": "user",
      "requireManualReview": true
    }
  }
}
```

---

## Benefits of This Architecture

### 1. Specialization
Each agent is expert in its domain (marketing, operations, support)

### 2. Parallelization
All agents work simultaneously (faster than sequential)

### 3. Governance
COO ensures compliance and prevents rogue agents

### 4. Safety
Hard stops prevent agents from exceeding instructions

### 5. Auditability
Every action logged with approval chain

### 6. Scalability
Easy to add new agents (same pattern)

### 7. Communication
Agents coordinate through standardized messaging

### 8. User Control
User retains veto power over major decisions

---

## Implementation Timeline

### Phase 1: Foundation (Week 1)
- [ ] Design message queue
- [ ] Build communication protocol
- [ ] Create database schema
- [ ] Build guardrails engine
- [ ] Test message passing

### Phase 2: Core Agents (Week 2)
- [ ] Refactor Atlas to multi-agent format
- [ ] Build Astra agent
- [ ] Build Sentinel agent
- [ ] Build Email agent
- [ ] Test inter-agent communication

### Phase 3: COO Governance (Week 3)
- [ ] Design COO logic
- [ ] Build approval workflow
- [ ] Implement hard stops enforcement
- [ ] Add audit logging
- [ ] Build monitoring dashboard

### Phase 4: Integration & Testing (Week 4)
- [ ] End-to-end testing
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation
- [ ] Deploy to production

### Phase 5: Operations (Ongoing)
- [ ] Monitor agent health
- [ ] Track guardrail violations
- [ ] Iterate on configurations
- [ ] User feedback loop

---

## Next Steps

1. **Approve architecture** — Does this match your vision?
2. **Prioritize** — Start with COO + Atlas + Email (most important)?
3. **Design details** — Flesh out message queue choice (Redis/Bull)?
4. **Build phase 1** — Start message queue + communication layer?

**What should we tackle first?**

