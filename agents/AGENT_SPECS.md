# Agent Specifications — Summary

**5 Agents, One Multi-Agent Operating System**

---

## Quick Reference

| Agent | Role | Manages | Hard Stops | Reports To |
|-------|------|---------|-----------|-----------|
| **COO** | Governance | All agents | LEVEL1-5 | User |
| **Atlas** | Marketing | TikTok, Instagram, YouTube, analytics | Spending, posting frequency | COO |
| **Astra** | Operations | Calendar, email, tasks, documents | External comms, hours scheduled | COO |
| **Sentinel** | Support | Tickets, refunds, escalations | Refund limits, user blocks | COO |
| **Email** | Communications | Sending, templates, rate limiting | Bulk sends, recipient validation | COO |

---

## ATLAS — Marketing Agent

### Purpose
Automate content creation and distribution across social media

### Responsibilities
- Generate AI content (images + hooks)
- Adapt for multiple platforms
- Schedule posts
- Collect analytics
- Analyze performance
- Optimize based on results

### Hard Stops

| Action | Level | Threshold | Approval |
|--------|-------|-----------|----------|
| Monthly spending | 2 | >$100 | COO |
| API spending | 2 | >$50 | COO |
| New platform | 2 | Any | COO |
| Posting frequency | 4 | >5/hour | Queue |
| Post without review | 2 | First 5 | COO |

### Success Metrics
- Posts generated per month: >20
- Average engagement rate: >2%
- Spending under budget: 100%
- No guardrail violations: 100%

### Skills
- marketing-discover (research)
- marketing-generate (create content)
- marketing-adapt-* (platform formats)
- marketing-schedule (postiz)
- marketing-collect (analytics)
- marketing-analyze (performance)

---

## ASTRA — Virtual Assistant

### Purpose
Automate scheduling, email, and operational tasks

### Responsibilities
- Schedule meetings and find time slots
- Draft and send emails
- Create and prioritize tasks
- Research and document
- Prepare meeting materials
- Track deadlines

### Hard Stops

| Action | Level | Threshold | Approval |
|--------|-------|-----------|----------|
| External emails | 2 | First 10 | COO |
| External meetings | 2 | >5 people | COO |
| Scheduling per day | 3 | >8 hours | Notify COO |
| Email sending rate | 4 | >50/hour | Queue |
| Delete operations | 1 | Any | User only |

### Success Metrics
- Meetings scheduled: >10/month
- Tasks created from emails: >50/month
- External communications: 100% approved before sending
- No missed deadlines: 100%

### Skills
- va-email-triage (inbox management)
- va-calendar-schedule (find slots, book)
- va-task-create (from emails/requests)
- va-task-prioritize (daily top 3)
- va-meeting-prep (research + agenda)
- va-research (find information)
- va-document-create (SOPs, guides)

---

## SENTINEL — Customer Support

### Purpose
Automate support operations and issue resolution

### Responsibilities
- Triage incoming support requests
- Resolve common issues (FAQ-based)
- Process refunds
- Escalate complex issues
- Track issue status
- Collect customer satisfaction data

### Hard Stops

| Action | Level | Threshold | Approval |
|--------|-------|-----------|----------|
| Refund amount | 2 | >$100 | COO |
| Refund amount | 1 | >$500 | User |
| User ban | 2 | Any | COO escalation |
| Commitment time | 2 | >48 hours | COO |
| Ticket processing | 4 | >50/hour | Queue |

### Success Metrics
- Tickets resolved same-day: >80%
- Customer satisfaction: >4/5 stars
- Refund refusal rate: <10%
- Escalation rate: <15%

### Skills
- support-triage (categorize)
- support-resolve (FAQ-based)
- support-escalate (complex issues)
- support-track (status updates)
- support-refund (process)
- support-survey (satisfaction)

---

## EMAIL AGENT — Communications

### Purpose
Centralized email handling for all agents

### Responsibilities
- Send emails on behalf of all agents
- Track delivery and opens
- Manage email templates
- Handle bounces and unsubscribes
- Rate limiting per agent
- Whitelist management

### Hard Stops

| Action | Level | Threshold | Approval |
|--------|-------|-----------|----------|
| Bulk send | 2 | >500 recipients | COO |
| Bulk send | 1 | >1000 recipients | User |
| New recipients | 2 | After 100 | Whitelist |
| Email rate | 4 | >50/hour per agent | Queue |
| Unsub override | 1 | Any | User only |

### Success Metrics
- Email delivery rate: >99%
- Bounce rate: <1%
- Open rate: >40%
- Unsubscribe rate: <0.5%

### Skills
- email-send (authenticated SMTP)
- email-schedule (delayed send)
- email-track (delivery + opens)
- email-template (manage templates)
- email-rate-limit (enforce limits)
- email-whitelist (manage recipients)

---

## COO AGENT — Governance & Orchestration

### Purpose
Control center for entire multi-agent system

### Responsibilities
- Analyze user requests
- Create execution plans
- Assign work to agents
- Approve major actions
- Monitor compliance
- Escalate exceptions
- Generate reports

### Hard Stops

| Action | Level | Threshold | Approval |
|--------|-------|-----------|----------|
| Spending decision | 2 | >$500 | User |
| External commitment | 2 | Any | User |
| Security issue | 1 | Any | Immediate escalation |
| Privacy concern | 1 | Any | Immediate escalation |
| Override hard stop | 1 | Any | Impossible |

### Success Metrics
- Plan creation time: <5 min
- Approval accuracy: >95%
- Agent compliance: 100%
- Escalation resolution: <1 hour

### Skills
- coo-plan (create plans)
- coo-assign (delegate work)
- coo-approve (decision workflow)
- coo-monitor (compliance)
- coo-escalate (flag exceptions)
- coo-report (summaries)
- coo-communicate (agent messaging)

---

## Communication Between Agents

### Atlas → Email
```
Atlas: "Send daily performance report to team@company.com"
Email: "✓ Queued for 9am send"
```

### Astra → COO
```
Astra: "User requested meeting with CEO. Need approval (external)."
COO: "✓ Approved. Proceed with scheduling."
```

### Sentinel → COO
```
Sentinel: "Refund request $250. Customer upset. Within budget?"
COO: "✓ Approved. Monthly budget available: $350 remaining."
```

### COO → All Agents
```
COO: "New user request: Launch feature.
  Atlas: Generate announcement posts (approval gate)
  Astra: Schedule team meeting
  Sentinel: Monitor for questions
  Email: Queue customer notification"
```

---

## Inter-Agent Message Types

### REQUEST
One agent asks another to do something

```json
{
  "type": "request",
  "from": "atlas",
  "to": "email",
  "action": "send_report",
  "payload": {...},
  "requiresApproval": false
}
```

### APPROVAL_REQUEST
Agent asks COO for permission before acting

```json
{
  "type": "approval_request",
  "from": "astra",
  "to": "coo",
  "action": "schedule_external_meeting",
  "payload": {...},
  "approvalPath": "coo"
}
```

### ESCALATION
Agent reports problem to COO

```json
{
  "type": "escalation",
  "from": "sentinel",
  "to": "coo",
  "priority": "high",
  "action": "refund_exceeds_limit",
  "payload": {...}
}
```

### STATUS_UPDATE
Agent reports progress

```json
{
  "type": "status_update",
  "from": "atlas",
  "to": "coo",
  "action": "posts_scheduled",
  "payload": {
    "count": 10,
    "status": "complete"
  }
}
```

---

## Hard Stop Levels Explained

### LEVEL 1: PREVENT (Never Allow)
- Cannot execute under any circumstances
- Only override: User manual approval required
- Examples:
  - Delete user data
  - Violate GDPR
  - Access other user's data

### LEVEL 2: REQUIRE APPROVAL
- Agent can request, but COO/user must approve
- If denied, action cancelled
- Examples:
  - Spending >$100
  - External communications
  - User blocks

### LEVEL 3: NOTIFY
- Agent executes, but COO/user notified
- Can halt within 5 minutes
- Examples:
  - Scheduling >6 hours meetings
  - New platform integration
  - Large task volumes

### LEVEL 4: RATE LIMIT
- Agent can execute, but frequency limited
- Auto-queue if limit exceeded
- Examples:
  - Email rate: 50/hour
  - Posts: 5/hour
  - Tickets: 50/hour

### LEVEL 5: BUDGET LIMIT
- Agent can execute within monthly/daily budget
- Tracked by COO
- Examples:
  - Atlas: $100/month
  - Sentinel: $500/month refunds
  - Total: $1,000/month

---

## Approval Decision Matrix

```
Is action HARD_STOP LEVEL 1?
├─ YES → Reject (no override)
└─ NO → Continue

Is action routine (done >5 times)?
├─ YES → Auto-approve
└─ NO → Continue

Is spending involved?
├─ YES:
│  ├─ <$50 → Auto-approve
│  ├─ $50-500 → COO decides
│  └─ >$500 → Escalate to user
└─ NO:
   ├─ External comm? → Escalate
   └─ Internal? → Auto-approve
```

---

## Budget Allocation (Monthly)

```
ATLAS (Marketing)
├─ OpenAI API: $20
├─ Postiz: $50
└─ Buffer: $30
= $100 total

SENTINEL (Support)
├─ Refunds: $500
└─ Other: $0
= $500 total

EMAIL (Communications)
├─ SMTP: $10
└─ Buffer: $40
= $50 total

ASTRA (Operations)
├─ Google Calendar: $0 (free)
├─ Gmail: $0 (free)
└─ Buffer: $50
= $50 total

TOTAL MONTHLY BUDGET: $700
(Flexible based on usage patterns)
```

---

## Monitoring & Alerts

### COO Monitors Every Minute:

1. **Spending** — Is any agent over budget?
2. **Guardrails** — Any violations?
3. **Queue** — Any pending approvals?
4. **Errors** — Any agent failures?
5. **Deadlines** — Any approaching limits?

### Alerts Triggered When:

- Spending >80% of budget
- Guardrail violation detected
- Agent fails 3+ times
- Approval pending >30 min
- Critical error occurs

---

## Testing Each Agent

### Atlas Tests
- [ ] Generate 5 posts, verify quality
- [ ] Schedule to 2 platforms, verify delivery
- [ ] Collect analytics, verify accuracy
- [ ] Test spending limit (try to exceed)
- [ ] Test posting rate limit

### Astra Tests
- [ ] Schedule meeting with external attendee (need approval)
- [ ] Draft email, verify quality
- [ ] Create 10 tasks from emails
- [ ] Try deleting email (should fail)
- [ ] Test rate limiting

### Sentinel Tests
- [ ] Process 5 support tickets
- [ ] Attempt $150 refund (need approval)
- [ ] Attempt $600 refund (escalate to user)
- [ ] Block user (need approval)
- [ ] Test rate limiting

### Email Tests
- [ ] Send email to 10 people (OK)
- [ ] Send email to 600 people (need approval)
- [ ] Track delivery rate
- [ ] Test rate limiting per agent
- [ ] Handle bounces

### COO Tests
- [ ] Process user request, create plan
- [ ] Auto-approve routine action
- [ ] Escalate to user when needed
- [ ] Generate daily report
- [ ] Monitor all agents for 24 hours

---

## Deployment Checklist

- [ ] Message queue (Redis) running
- [ ] Database schema created
- [ ] All agents implemented
- [ ] Hard stops enforced
- [ ] Approval workflow tested
- [ ] Escalation flow tested
- [ ] Rate limiting tested
- [ ] Budget tracking tested
- [ ] Audit logging verified
- [ ] Monitoring dashboard working
- [ ] Daily reports generating
- [ ] Documentation complete

---

## Success Criteria for Full System

✅ All 5 agents running simultaneously  
✅ COO successfully coordinates all agents  
✅ No guardrail violations in 7 days  
✅ 0 budget overages  
✅ >95% approval accuracy  
✅ <1 hour escalation resolution  
✅ All agents complete assigned tasks  
✅ Daily reports generated and sent  
✅ Audit logs complete and accurate  
✅ System handles 100+ daily tasks without issues  

---

## Next Steps

1. ✅ **Architecture complete** (MULTI_AGENT_SYSTEM.md + COO_AGENT.md + this doc)
2. ⏳ **Build message queue** (Redis implementation)
3. ⏳ **Implement guardrails** (enforcement engine)
4. ⏳ **Build approval workflow** (COO logic)
5. ⏳ **Create database schema** (audit trail + state)
6. ⏳ **Implement all agents** (using skill graph pattern)
7. ⏳ **End-to-end testing** (full system test)
8. ⏳ **Deploy to production** (multi-agent system live)

---

**All specifications complete. Ready to build.**

