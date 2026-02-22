# COO Agent — Chief Operating Officer

**Status:** Architecture Complete (Ready to Build)  
**Role:** Governance, Orchestration, Approval Workflow  
**Manages:** Atlas, Astra, Sentinel, Email Agents

---

## Purpose

The COO Agent is the **control center** of the multi-agent system. It:

1. **Receives** user requests
2. **Analyzes** what needs to happen
3. **Creates** execution plans
4. **Assigns** work to specialized agents
5. **Approves** major actions
6. **Monitors** agent compliance
7. **Coordinates** inter-agent communication
8. **Escalates** exceptions to user
9. **Reports** status back to user

Think: **Project manager + CFO + Legal + Compliance officer in one agent**

---

## Core Responsibilities

### 1. Request Analysis

User asks: *"I want to launch a new product"*

COO breaks this into:
- **Marketing**: Generate 20 announcement posts, schedule across TikTok + Instagram
- **Operations (Astra)**: Schedule launch team meeting, prepare announcement email
- **Support (Sentinel)**: Monitor incoming support questions, prepare FAQ
- **Communications**: Queue announcement email to customers

### 2. Plan Creation

COO creates detailed execution plan:

```
REQUEST: "Launch new product"
├── PHASE 1: Preparation (Day 1)
│   ├── ASTRA: Schedule team meeting (approval: needs external attendee)
│   ├── ATLAS: Generate 20 announcement posts (approval: manual review)
│   └── EMAIL: Prepare announcement template (approval: not needed)
├── PHASE 2: Execution (Day 2)
│   ├── ATLAS: Schedule posts for 10am release
│   ├── EMAIL: Send announcement to customer list (approval: bulk send)
│   ├── ASTRA: Send meeting invites (approval: external attendees)
│   └── SENTINEL: Monitor support queue
└── PHASE 3: Monitoring (Days 3-7)
    ├── ATLAS: Track post performance
    ├── SENTINEL: Log support tickets + resolutions
    ├── EMAIL: Send daily performance reports
    └── ASTRA: Track team follow-ups

APPROVAL GATES:
1. Generate announcement posts (manual review required)
2. Send to 500+ customers (COO approval)
3. External meeting invites (COO approval)

ESTIMATED TIME: 2 hours
RISK LEVEL: Low
```

### 3. Task Assignment

COO sends assignments to each agent with:
- **Clear objectives**
- **Constraints** (spending limits, time limits)
- **Approval gates** (what needs approval before execution)
- **Escalation paths** (what goes to user)

### 4. Approval Workflow

```
Agent requests approval
    ↓
    ├─ Simple (auto-approvable) → COO auto-approves
    ├─ Complex (needs human judgment) → Escalates to user
    └─ Outside budget/policy → Reject or escalate
    ↓
User decides (if escalated)
    ├─ Approved → Agent executes
    ├─ Rejected → Agent notified, action cancelled
    └─ Needs changes → Agent resubmits with changes
```

### 5. Monitoring

COO watches:
- **Spending** (vs. budget)
- **Compliance** (vs. hard stops)
- **Quality** (vs. targets)
- **Errors** (escalate if needed)

Every minute: Check message queue for issues, violations, escalations

### 6. Reporting

Daily report to user:
```
═════════════════════════════════════════════════════════
DAILY OPERATIONS REPORT — February 19, 2026
═════════════════════════════════════════════════════════

ATLAS (Marketing)
├─ Posts created: 5
├─ Posts scheduled: 5
├─ Avg views: 4,200
├─ Approval rate: 100% (5/5 approved on first try)
└─ Spending: $12 (monthly budget: $100)

ASTRA (Operations)
├─ Emails sent: 15
├─ Meetings scheduled: 2
├─ Tasks created: 23
├─ Approval rate: 90% (9/10 approved on first try)
└─ Error: 1 external email needs approval

SENTINEL (Support)
├─ Tickets processed: 12
├─ Issues resolved: 10
├─ Escalations: 2
├─ Approval rate: 95% (refunds auto-approved)
└─ Refund spending: $280 (monthly budget: $500)

EMAIL (Communications)
├─ Emails sent: 8
├─ Delivery rate: 99.9%
├─ Open rate: 45%
└─ Bounces: 0

SYSTEM HEALTH
├─ All agents: ✓ Operational
├─ Message queue: ✓ Healthy
├─ Database: ✓ Healthy
├─ Guardrails: ✓ All enforced
└─ Violations: 0 (none)

ESCALATIONS: None
APPROVAL GATES TRIGGERED: 1 (Astra external email)
ACTION REQUIRED: 1 (approve Astra email)

═════════════════════════════════════════════════════════
```

---

## Architecture

### COO Skills

```
├── coo-plan
│   ├── Receive user request
│   ├── Analyze requirements
│   ├── Break into sub-tasks
│   ├── Estimate time + effort
│   ├── Identify approval gates
│   └── Create execution plan
│
├── coo-assign
│   ├── Determine which agent(s) needed
│   ├── Create assignment message
│   ├── Specify constraints
│   ├── Set approval gates
│   └── Send to agent queue
│
├── coo-approve
│   ├── Receive approval request
│   ├── Check guardrails
│   ├── Check budget
│   ├── Check compliance
│   ├── Auto-approve (if possible)
│   └── Escalate to user (if needed)
│
├── coo-monitor
│   ├── Poll agent status messages
│   ├── Track spending
│   ├── Check guardrail violations
│   ├── Monitor deadlines
│   └── Alert on anomalies
│
├── coo-escalate
│   ├── Receive escalation from agent
│   ├── Add context
│   ├── Determine severity
│   ├── Notify user
│   └── Await decision
│
├── coo-report
│   ├── Aggregate metrics from all agents
│   ├── Calculate KPIs
│   ├── Format executive summary
│   ├── Send to user (email/Telegram)
│   └── Store in database
│
└── coo-communicate
    ├── Send message to agent
    ├── Receive message from agent
    ├── Maintain conversation history
    ├── Detect communication failures
    └── Retry on timeout
```

### Decision Trees

**Approval Decision Tree:**

```
Agent requests approval for ACTION
    ↓
Is action HARD_STOP LEVEL 1 (PREVENT)?
├─ YES → Reject (no override possible)
└─ NO → Continue
    ↓
Is action within budget?
├─ NO → Check if escalate to user
│       ├─ User approved similar before → Auto-approve
│       └─ New situation → Escalate to user
└─ YES → Continue
    ↓
Is action routine (done >5 times successfully)?
├─ YES → Auto-approve
└─ NO → Escalate to user
    ↓
User decides
├─ Approve → Agent executes
├─ Reject → Agent notified
└─ Modify → Agent resubmits
```

**Escalation Decision Tree:**

```
Agent reports issue
    ↓
What's the severity?
├─ CRITICAL (security/privacy)
│  └─ Immediate escalation to user (no COO gate)
├─ HIGH (spending/major commitment)
│  └─ Escalate to user with context
├─ MEDIUM (approval needed)
│  └─ COO can usually decide
└─ LOW (informational)
   └─ Log and continue
```

---

## Configuration

### coo-config.json

```json
{
  "coo": {
    "name": "COO",
    "model": "claude-sonnet",           // More reasoning capacity
    "updateInterval": 60000,             // Check agents every minute
    "reportingSchedule": "daily",        // Send report each day
    "reportingTime": "09:00",            // At 9 AM
    "timezone": "UTC"
  },
  
  "approvalRules": {
    "auto_approve_threshold": {
      "spending": 50,                    // Auto-approve spending < $50
      "external_emails": 5,              // Auto-approve 5 external emails, then require approval
      "external_meetings": 2             // Auto-approve 2 external meetings, then require approval
    },
    "escalate_to_user_threshold": {
      "spending": 500,                   // Always escalate spending > $500
      "refund": 500,                     // Always escalate refunds > $500
      "external_commitment": 10000,      // Any major commitment
      "security_issue": 0                // All security issues
    }
  },

  "monitoring": {
    "checkInterval": 1,                  // Check agents every 1 minute
    "budgetCheck": true,
    "guardrailCheck": true,
    "performanceMetrics": true,
    "errorTracking": true
  },

  "reporting": {
    "includeMetrics": [
      "posts_created",
      "emails_sent",
      "meetings_scheduled",
      "tickets_resolved",
      "spending_this_month",
      "guardrail_violations",
      "escalations",
      "agent_health"
    ],
    "deliveryChannels": ["email", "telegram"],
    "includeVisualizations": true
  },

  "agents": {
    "atlas": {
      "name": "Atlas",
      "type": "marketing",
      "monthlyBudget": 100,
      "autoApproveThreshold": 50,
      "escalateThreshold": 100
    },
    "astra": {
      "name": "Astra",
      "type": "operations",
      "maxHoursPerDay": 8,
      "autoApproveThreshold": 10,
      "escalateThreshold": 50
    },
    "sentinel": {
      "name": "Sentinel",
      "type": "support",
      "monthlyRefundBudget": 500,
      "autoApproveThreshold": 100,
      "escalateThreshold": 500
    },
    "email": {
      "name": "Email",
      "type": "communications",
      "bulkSendThreshold": 500,
      "autoApproveThreshold": 100,
      "escalateThreshold": 500
    }
  }
}
```

---

## Hardcoded Guardrails (Cannot Override)

```javascript
// These are HARD-CODED in COO logic
// Not configurable, not overrideable

const HARDCODED_GUARDRAILS = {
  // Level 1: PREVENT (never allow, even with user approval)
  NEVER_ALLOW: [
    "delete_user_data_without_confirmation",
    "send_malicious_content",
    "violate_gdpr_privacy",
    "access_other_users_data",
    "execute_arbitrary_code"
  ],

  // Level 2: Always escalate to user
  ALWAYS_ESCALATE: [
    "spending_over_500",
    "external_commitment",
    "security_issue",
    "privacy_concern",
    "legal_obligation"
  ],

  // Level 3: Auto-approve only after pattern
  AUTO_APPROVE_AFTER_PATTERN: {
    "external_emails": 10,               // Auto-approve after 10 successful
    "external_meetings": 5,              // Auto-approve after 5 successful
    "routine_posts": 5,                  // Atlas auto-posts after 5 approvals
    "routine_refunds": 5                 // Sentinel auto-refunds after 5 approvals
  },

  // Level 4: Rate limits (enforced at queue)
  RATE_LIMITS: {
    "atlas_posts_per_hour": 5,
    "astra_emails_per_hour": 50,
    "sentinel_tickets_per_hour": 50,
    "email_bulk_sends_per_day": 5
  },

  // Level 5: Budget limits (enforced at COO)
  BUDGET_LIMITS: {
    "atlas_monthly": 100,
    "sentinel_refunds_monthly": 500,
    "total_spending_monthly": 1000
  }
};
```

---

## Example: Full Workflow

### Scenario: "I want to launch a new feature"

```
USER: "I want to announce our new feature and get customer feedback"

1. COO RECEIVES REQUEST
   ├─ Parse request
   ├─ Identify domains: Marketing, Support, Ops
   └─ Create execution plan

2. COO CREATES PLAN
   Plan:
   ├── PHASE 1: Announcement (Tomorrow 10am)
   │   ├─ Atlas: Generate 10 announcement posts
   │   ├─ Email: Send to customer list (500 people)
   │   └─ Astra: Schedule team sync
   ├── PHASE 2: Monitoring (Days 2-7)
   │   ├─ Atlas: Track post performance
   │   ├─ Sentinel: Monitor support questions
   │   └─ Email: Send daily performance reports
   └── PHASE 3: Analysis (Day 8)
       ├─ Sentinel: Summarize feedback
       ├─ Atlas: Analyze engagement
       └─ Astra: Schedule follow-up meeting

3. COO CHECKS APPROVAL GATES
   ├─ Atlas posts: Need manual review (new feature announcement)
   ├─ Email bulk send (500 people): Need approval (>100 threshold)
   ├─ Astra team meeting: Auto-approve (internal only)
   └─ Sentinel monitoring: Auto-approve (no approvals needed)

4. COO → USER: "Ready to execute. Approval needed for: [posts + email]. Proceed?"

5. USER: "Approve. Generate good announcement copy."

6. COO ASSIGNS TO AGENTS
   ├─ Atlas: "Generate 10 announcement posts. Manual approval required. Budget: $20."
   ├─ Email: "Queue announcement email. Waiting for COO approval before sending."
   ├─ Sentinel: "Monitor for questions about new feature starting tomorrow."
   └─ Astra: "Schedule team sync for tomorrow 2pm."

7. ATLAS EXECUTES
   ├─ Generate 10 posts
   ├─ Send to COO for review (approval gate)
   ├─ Wait for approval message

8. COO REVIEWS ATLAS OUTPUT
   ├─ Read all 10 posts
   ├─ Check for quality, brand fit, accuracy
   ├─ Approve 8, request changes on 2
   └─ Send response: "Approved 8 posts. Revise posts #4 and #7 (tone too casual)."

9. ATLAS REVISES
   ├─ Rewrite posts #4 and #7
   ├─ Resubmit for approval

10. COO APPROVES
    ├─ All 10 posts approved
    ├─ Message Atlas: "Approved. Proceed to scheduling."
    └─ Message Email: "Release email send approval. Send now."

11. ATLAS SCHEDULES
    ├─ Schedule 10 posts
    ├─ Check timing (spread throughout day)
    └─ Confirm scheduled

12. EMAIL SENDS
    ├─ Send announcement to 500 customers
    ├─ Track delivery
    └─ Report: "Sent to 500, 495 delivered, 5 bounces"

13. COO MONITORS
    Every hour:
    ├─ Atlas: Check post performance (views, engagement)
    ├─ Sentinel: Check support queue (any feature questions?)
    ├─ Email: Check open rate
    ├─ Budget: Verify no overspending
    └─ Guardrails: No violations

14. DAILY REPORT (Next morning)
    "Feature launch complete. Results:
    ├─ 10 posts created and scheduled
    ├─ 500 customers notified
    ├─ 1,200 total views
    ├─ 45 support questions received (12 resolved, 33 pending)
    ├─ Email open rate: 42%
    ├─ Spending: $8 (budget: $20)
    └─ Next: Monitor support, follow up with feature feedback"

15. SENTINEL TRACKS
    Over next 7 days:
    ├─ Log all feature-related questions
    ├─ Resolve common issues
    ├─ Escalate complex requests
    └─ Summarize feedback for product team

16. ASTRA SCHEDULES FOLLOWUP
    ├─ Schedule product team meeting to review feedback
    ├─ Prepare agenda with top issues
    └─ Send meeting invites
```

---

## Implementation

### Pseudocode: COO Main Loop

```javascript
async function cooCycle() {
  while (true) {
    // 1. Check for new user requests
    const userRequest = await getFromUserQueue();
    if (userRequest) {
      const plan = await coo_plan(userRequest);
      const assignments = await coo_assign(plan);
      await broadcastAssignments(assignments);
    }

    // 2. Check for agent approval requests
    const approvalRequest = await getApprovalQueue();
    if (approvalRequest) {
      const decision = await coo_approve(approvalRequest);
      await sendDecisionToAgent(approvalRequest.from, decision);
    }

    // 3. Check for escalations
    const escalation = await getEscalationQueue();
    if (escalation) {
      await handleEscalation(escalation);
    }

    // 4. Monitor agent health
    const agentStatus = await monitorAgents();
    if (agentStatus.violations) {
      await handleViolations(agentStatus.violations);
    }

    // 5. Check budget compliance
    const spending = await checkSpending();
    if (spending.exceeded) {
      await alertUser(spending);
    }

    // 6. Generate daily report (if scheduled time)
    if (isDailyReportTime()) {
      const report = await coo_report();
      await sendReport(report);
    }

    // Wait 1 minute before next cycle
    await sleep(60000);
  }
}
```

---

## Success Criteria

**The COO Agent is working well when:**

- ✅ All user requests result in execution plans
- ✅ >95% of approvals are correct (user agrees with COO decision)
- ✅ <5% of agent actions get rejected
- ✅ 0 guardrail violations
- ✅ 0 spending overages
- ✅ <1 hour response time on escalations
- ✅ Daily reports accurate and complete

---

## Next: Build Phase

1. Create message queue (Redis)
2. Build COO approval logic
3. Implement guardrails enforcer
4. Add audit logging
5. Create monitoring dashboard
6. Test with Atlas agent
7. Scale to other agents

**Ready to build?**

