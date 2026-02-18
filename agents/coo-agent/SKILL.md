---
name: coo-agent
title: COO Agent — Chief Operating Officer & Governance
description: Orchestrates all agents, creates execution plans, manages approvals, enforces guardrails, monitors compliance, and escalates issues.
version: 1.0.0
status: production
type: governance

frontmatter:
  name: coo-agent
  title: COO Agent — Chief Operating Officer
  description: Central governance and orchestration agent. Receives requests, creates plans, assigns work, approves major actions, monitors compliance, escalates exceptions.
  triggers:
    - "Create a plan"
    - "What should I do"
    - "Automate this"
    - "Execute workflow"
    - "Launch initiative"
  exclusions:
    - "Single task execution (ask specific agent)"
    - "Content creation (ask Atlas)"
    - "Calendar management (ask Astra)"
    - "Support ticket (ask Sentinel)"
  version: 1.0.0

mcp_servers:
  - name: message_queue
    description: Inter-agent message communication
    tools:
      - send_message
      - receive_message
      - get_message_status
  - name: database
    description: Audit logging and state tracking
    tools:
      - log_action
      - get_agent_status
      - record_approval
  - name: webhook
    description: Escalation notifications
    tools:
      - notify_user
      - escalate_issue
      - send_alert

hard_stops:
  security_issue:
    level: 1_prevent
    override: user_only_immediate
  spending_decision:
    level: 2_require_approval
    threshold: 500
    escalate_at: 500
  external_commitment:
    level: 2_require_approval
    override: user_only
  override_agent_guardrail:
    level: 1_prevent
    override: impossible

skill_graph_integration:
  orchestration_engine: enabled
  approval_workflow: enabled
  monitoring: enabled
  escalation: enabled
  audit_logging: enabled
---

# COO Agent — Chief Operating Officer

**Governance, orchestration, and coordination layer for the multi-agent system.**

The COO Agent is the **control center**:
- Receives user requests and breaks them into actionable tasks
- Creates detailed execution plans
- Assigns work to specialized agents (Atlas, Astra, Sentinel, Email)
- Approves major actions (spending, external commitments)
- Monitors all agents for compliance
- Escalates issues that exceed agent authority
- Generates daily operational reports

---

## What It Does

### 1. **Analyze & Plan** (Request Analysis)

**User:** "I want to launch a new product this month"

**COO:**
```
Analysis:
├─ What domains are needed?
│  ├─ Marketing (announce on social)
│  ├─ Operations (schedule team meeting)
│  └─ Support (monitor customer questions)
├─ What approval gates exist?
│  ├─ Marketing: Content review needed
│  ├─ Operations: External attendees need approval
│  └─ Support: None (monitoring only)
├─ What's the timeline?
│  ├─ Preparation: Day 1
│  ├─ Launch: Day 2
│  └─ Monitoring: Days 3-7
└─ What are the risks?
   ├─ Budget impact: $50 (within limits)
   ├─ Team availability: Confirmed
   └─ Customer readiness: Yes

Plan Created:
├─ PHASE 1: Preparation
│  ├─ Atlas: Generate 20 announcement posts
│  ├─ Astra: Schedule team meeting
│  └─ Sentinel: Prepare support docs
├─ PHASE 2: Launch
│  ├─ Atlas: Schedule posts
│  ├─ Email: Send customer announcement
│  └─ Astra: Send meeting invites
└─ PHASE 3: Monitoring
   ├─ Atlas: Track post performance
   ├─ Sentinel: Monitor support questions
   └─ Email: Daily reports
```

### 2. **Assign & Coordinate** (Task Assignment)

**COO sends assignments:**

```json
{
  "type": "assignment",
  "to": "atlas",
  "request_id": "uuid",
  "task": "Generate announcement posts",
  "details": {
    "count": 20,
    "product_name": "New Feature",
    "audience": "Developers",
    "approval_gate": true,
    "budget": 20,
    "deadline": "2026-02-20T18:00:00Z"
  },
  "constraints": {
    "max_spending": 20,
    "approval_required_count": 20,
    "hard_stops": ["spending", "first_5_manual_review"]
  }
}
```

### 3. **Approve** (Approval Workflow)

**Agent requests approval:**

```json
{
  "type": "approval_request",
  "from": "atlas",
  "to": "coo",
  "request_id": "uuid",
  "action": "schedule_announcement_posts",
  "details": {
    "post_count": 20,
    "platforms": ["tiktok", "instagram"],
    "content_quality": "high",
    "estimated_reach": "50,000"
  }
}
```

**COO decides:**

```
Check 1: Is this routine?
  └─ Yes (similar posts approved 5 times before)
  
Check 2: Is it within guardrails?
  └─ Yes (spending $12, hard limits OK)
  
Check 3: Are there risks?
  └─ None identified
  
Decision: AUTO-APPROVE
Send to Atlas: "✓ Approved. Proceed with posting."
```

### 4. **Monitor** (Compliance Tracking)

**Every minute, COO checks:**

```
Status Check:
├─ ATLAS
│  ├─ Posts created: 15 (target: 20)
│  ├─ Spending: $12 (budget: $20)
│  ├─ Guardrail violations: 0
│  └─ Pending approvals: 0
├─ ASTRA
│  ├─ Meetings scheduled: 1 (target: 1)
│  ├─ External emails: 3 (limit: 10)
│  ├─ Guardrail violations: 0
│  └─ Pending approvals: 1
├─ SENTINEL
│  ├─ Tickets processed: 5
│  ├─ Refunds issued: 0
│  ├─ Guardrail violations: 0
│  └─ Escalations: 0
├─ EMAIL
│  ├─ Emails sent: 28
│  ├─ Rate limit: 28/50 (OK)
│  ├─ Guardrail violations: 0
│  └─ Delivery rate: 99.8%
└─ SYSTEM HEALTH
   ├─ All agents: ✓ Running
   ├─ Message queue: ✓ Healthy
   ├─ Database: ✓ Healthy
   ├─ Budget: ✓ On track
   └─ Violations: 0
```

### 5. **Escalate** (Exception Handling)

**Agent reports issue:**

```json
{
  "type": "escalation",
  "from": "sentinel",
  "to": "coo",
  "severity": "high",
  "action": "refund_request_exceeds_limit",
  "details": {
    "customer": "Customer X",
    "amount": 350,
    "limit": 100,
    "reason": "good_faith_gesture"
  }
}
```

**COO escalates to user:**

```json
{
  "type": "escalation_to_user",
  "severity": "high",
  "action": "refund_approval_needed",
  "details": {
    "amount": 350,
    "monthly_refund_budget": 500,
    "available": 250,
    "agent_recommendation": "approve_due_to_customer_value"
  },
  "decision_options": [
    "approve (within budget)",
    "partial_refund (200)",
    "reject"
  ]
}
```

### 6. **Report** (Daily Summary)

```
═════════════════════════════════════════════════════════════
DAILY OPERATIONS REPORT — February 19, 2026
═════════════════════════════════════════════════════════════

TASKS COMPLETED
├─ Atlas: Generated 15 posts, scheduled 12
├─ Astra: Scheduled 1 meeting, sent 15 emails
├─ Sentinel: Processed 12 tickets, resolved 10
└─ Email: Delivered 28 emails, 99.8% delivery rate

APPROVALS
├─ Processed: 5
├─ Auto-approved: 4 (routine)
├─ Escalated to user: 1 (refund request)
└─ Pending: 0

GUARDRAILS
├─ Violations: 0
├─ Rate limits: All OK
├─ Budget: $12 of $100 (12%)
└─ Compliance: 100%

ESCALATIONS
├─ High severity: 1 (refund, awaiting user decision)
├─ Medium severity: 0
└─ Low severity: 0

SYSTEM HEALTH
├─ All agents: ✓ Running
├─ Uptime: 100%
├─ Errors: 0
└─ Performance: Nominal

RECOMMENDATIONS
├─ Astra: 1 external email pending approval (approve)
├─ Atlas: Performing well, consider scaling
└─ System: All indicators green

═════════════════════════════════════════════════════════════
```

---

## Core Responsibilities

### 1. Request Analysis
- Parse user requests
- Identify domains (marketing, operations, support)
- Recognize approval gates and constraints
- Estimate timeline and risk

### 2. Plan Creation
- Break complex requests into phases
- Assign tasks to appropriate agents
- Identify dependencies and sequence
- Create detailed instructions for each agent

### 3. Task Assignment
- Send clear assignments to agents
- Specify constraints (budget, time, approval gates)
- Monitor progress
- Handle task modifications

### 4. Approval Workflow
- Receive approval requests from agents
- Auto-approve routine actions
- Escalate decisions that need user input
- Track approval chain for audit

### 5. Monitoring
- Poll agent status every minute
- Track budget and spending
- Monitor guardrail compliance
- Alert on anomalies

### 6. Escalation
- Identify issues exceeding agent authority
- Add context and recommendation
- Notify user
- Await decision

### 7. Reporting
- Aggregate metrics from all agents
- Generate daily operational reports
- Identify trends and opportunities
- Recommend optimizations

---

## Prerequisites

### Required
- **Node.js** v18+ with Sonnet/reasoning model (complex decision-making)
- **Message Queue** (Redis, shared with all agents)
- **Database** (PostgreSQL/Supabase for audit logs)
- **Multi-Agent System** (Atlas, Astra, Sentinel, Email agents running)

### Recommended
- **Webhook service** (for escalation notifications)
- **Monitoring dashboard** (real-time agent status)

---

## Quick Start

### 1. Install & Configure

```bash
npm install
cp .env.template .env
# Edit .env with your settings
```

### 2. Start COO Agent

```bash
node agents/coo-orchestrator.js
```

### 3. Test Approval Workflow

```bash
# COO receives user request
curl -X POST http://localhost:3001/request \
  -d '{
    "request": "Generate 10 posts and schedule them",
    "context": "Launch preparation"
  }'
```

---

## Configuration

### coo-config.json

```json
{
  "service": {
    "name": "COO Agent",
    "version": "1.0.0",
    "port": 3001,
    "model": "claude-sonnet-4-5"
  },

  "approvalRules": {
    "auto_approve_spending": 50,
    "escalate_spending": 500,
    "auto_approve_after_pattern": {
      "external_emails": 10,
      "external_meetings": 5,
      "routine_posts": 5
    }
  },

  "monitoring": {
    "checkInterval": 60,
    "checkItems": [
      "agent_health",
      "budget_status",
      "guardrail_violations",
      "pending_approvals",
      "queue_depth"
    ]
  },

  "reporting": {
    "dailyReportTime": "09:00",
    "timezone": "UTC",
    "deliveryChannels": ["email", "webhook"]
  },

  "agents": {
    "atlas": {
      "name": "Atlas",
      "type": "marketing",
      "budget": 100,
      "escalateAt": 100
    },
    "astra": {
      "name": "Astra",
      "type": "operations",
      "maxHoursPerDay": 8,
      "escalateAt": 50
    },
    "sentinel": {
      "name": "Sentinel",
      "type": "support",
      "refundBudget": 500,
      "escalateAt": 500
    },
    "email": {
      "name": "Email",
      "type": "communications",
      "bulkSendThreshold": 500,
      "escalateAt": 500
    }
  }
}
```

---

## Database Schema

### execution_plans table
```sql
CREATE TABLE execution_plans (
  id UUID PRIMARY KEY,
  user_request TEXT,
  analysis JSONB,
  phases JSONB,
  agents_involved VARCHAR[],
  timeline JSONB,
  budget DECIMAL,
  created_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

### agent_assignments table
```sql
CREATE TABLE agent_assignments (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES execution_plans(id),
  agent VARCHAR(50),
  task_description TEXT,
  constraints JSONB,
  status VARCHAR(20),
  assigned_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

### approvals table
```sql
CREATE TABLE approvals (
  id UUID PRIMARY KEY,
  from_agent VARCHAR(50),
  request JSONB,
  status VARCHAR(20),
  escalated BOOLEAN,
  escalated_to_user TIMESTAMP,
  user_decision VARCHAR(20),
  coo_decision VARCHAR(20),
  created_at TIMESTAMP,
  decided_at TIMESTAMP
);
```

---

## Success Criteria

✅ User requests parsed and plans created in <5 minutes  
✅ Approval accuracy >95% (user agrees with COO)  
✅ 0 guardrail violations  
✅ <1 hour escalation resolution  
✅ All agents complete assigned tasks  
✅ Daily reports accurate and complete  
✅ Audit trail 100% comprehensive  

---

**COO Agent — Production Ready**

Next: Refactor ATLAS Agent to integrate with COO (multi-agent format)

