# OrchestrAI - Deployment Guide

**Status:** Production-Ready Deployment Framework  
**Target Deployment Time:** < 30 minutes per agent  
**Support:** 24/7 setup assistance available

---

## Quick Start (5 minutes)

### 1. Agent Selection
Choose your agent:
- **Customer Service Agent** - E-commerce support, returns, billing
- **Virtual Assistant Agent** - Scheduling, email, tasks, meeting prep
- **Marketing Agent** - Content, campaigns, lead gen, analytics

### 2. Environment Setup
```bash
# Clone OrchestrAI
git clone https://github.com/orchestrai/orchestrai.git
cd orchestrai

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export ANTHROPIC_API_KEY="your-api-key"
export AGENT_TYPE="customer_service"  # or assistant, marketing
```

### 3. Configure Integrations
```bash
# Create config file
cp config.example.json config.json

# Edit config.json with your integrations:
# - Shopify API (customer service)
# - Google Calendar API (virtual assistant)
# - LinkedIn API (marketing)

# Test connections
python deploy.py --test-integrations
```

### 4. Deploy
```bash
# Single command deployment
python deploy.py --agent-type customer_service --mode production

# You'll get:
# - Agent URL (https://api.orchestrai.io/agents/{agent_id})
# - API documentation
# - Integration test results
# - Success confirmation
```

**Done.** Agent is live in < 5 minutes.

---

## Detailed Deployment Process

### Phase 1: Pre-Deployment (10 minutes)

**Step 1: Gather API Keys**

For Customer Service Agent:
```
SHOPIFY_API_KEY=your_key
SHOPIFY_API_PASSWORD=your_password
ZENDESK_API_KEY=your_key
STRIPE_API_KEY=your_secret_key
GMAIL_API_CREDENTIALS=credentials.json
```

For Virtual Assistant Agent:
```
GOOGLE_CALENDAR_CREDENTIALS=calendar_creds.json
GOOGLE_DRIVE_CREDENTIALS=drive_creds.json
GMAIL_API_CREDENTIALS=gmail_creds.json
SLACK_BOT_TOKEN=xoxb-...
ASANA_API_TOKEN=your_token
```

For Marketing Agent:
```
LINKEDIN_API_KEY=your_key
TWITTER_API_KEY=your_key
INSTAGRAM_API_KEY=your_key
MAILCHIMP_API_KEY=your_key
GOOGLE_ADS_API_KEY=your_key
```

**Step 2: Create Configuration**

```json
{
  "agent": {
    "id": "csa-prod-001",
    "type": "customer_service",
    "name": "Customer Service Bot",
    "environment": "production"
  },
  "integrations": {
    "shopify": {
      "enabled": true,
      "api_key": "${SHOPIFY_API_KEY}",
      "store_url": "your-store.myshopify.com"
    },
    "zendesk": {
      "enabled": true,
      "api_key": "${ZENDESK_API_KEY}",
      "subdomain": "your-subdomain"
    }
  },
  "settings": {
    "response_time_sla_seconds": 120,
    "escalation_threshold": 0.7,
    "language": "en",
    "timezone": "US/Eastern"
  },
  "monitoring": {
    "enabled": true,
    "alerts_email": "ops@company.com"
  }
}
```

### Phase 2: Deployment (5 minutes)

```bash
# Validate configuration
python deploy.py --validate-config config.json

# Output:
# ✓ Config validated
# ✓ All API keys present
# ✓ Integrations reachable
# ✓ Ready for deployment

# Deploy agent
python deploy.py --config config.json --deploy

# Output:
# Deploying Customer Service Agent...
# ✓ Loading agent framework
# ✓ Initializing integrations
# ✓ Running pre-flight checks
# ✓ Agent deployed successfully
#
# Agent ID: csa-prod-001
# API Endpoint: https://api.orchestrai.io/agents/csa-prod-001
# Status: RUNNING
# Uptime: 99.9%
#
# Next: Configure your input sources (email, chat, forms)
```

### Phase 3: Integration Testing (10 minutes)

**Test 1: API Connectivity**
```bash
curl -X POST https://api.orchestrai.io/agents/csa-prod-001/test \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"test": "connection"}'

# Response:
# {
#   "status": "ok",
#   "integrations": {
#     "shopify": "connected",
#     "zendesk": "connected",
#     "stripe": "connected",
#     "email": "connected"
#   }
# }
```

**Test 2: Processing Sample Input**
```bash
curl -X POST https://api.orchestrai.io/agents/csa-prod-001/process \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Hi, I ordered ABC123 and havent received it",
    "source": "email"
  }'

# Response:
# {
#   "response": "I'd be happy to help track your order...",
#   "actions": [
#     {"type": "send_tracking", "confidence": 0.9},
#     {"type": "create_ticket", "confidence": 0.8}
#   ],
#   "processing_time_ms": 1200
# }
```

**Test 3: Escalation**
```bash
# Test urgent issue escalation
curl -X POST https://api.orchestrai.io/agents/csa-prod-001/process \
  -d '{
    "input": "This is urgent!!!!! The item arrived broken!!!!",
    "source": "email"
  }'

# Response includes escalate_to_human action with 0.99 confidence
```

---

## Input Sources Configuration

### Email Integration
```yaml
Email Gateway Integration:
  - Forward support@company.com to: webhook.orchestrai.io/incoming/email
  - Whitelist OrchestrAI IP ranges
  - Enable OAuth for reply-via-email
  - Test: Send test email, verify response
```

### Chat Integration
```yaml
Slack Bot Setup:
  - Create bot in workspace
  - Grant scopes: chat:write, users:read, files:read
  - Subscribe to message events
  - Enable app in channel
  - Test: Mention bot, verify response

Intercom Setup:
  - Add OrchestrAI app
  - Configure assignment rules
  - Set agent availability
  - Test with customer message
```

### Form Integration
```yaml
Web Form Submission:
  - Add webhook to form platform
  - POST to: api.orchestrai.io/agents/{agent_id}/webhook
  - Verify SSL certificate
  - Test form submission
  - Check response queue
```

---

## Monitoring & Operations

### Health Check
```bash
# Check agent health
curl https://api.orchestrai.io/agents/csa-prod-001/health

# Response:
# {
#   "status": "healthy",
#   "uptime_percent": 99.9,
#   "last_request": "2 seconds ago",
#   "queue_length": 3,
#   "processing_time_p95": 1400
# }
```

### Metrics Dashboard
Access at: https://dashboard.orchestrai.io/agents/{agent_id}

Metrics:
- **Response Time:** P50, P95, P99
- **Accuracy:** % of responses requiring escalation
- **Volume:** Requests per hour
- **Integration Health:** Status of each connected system
- **Uptime:** % availability SLA

### Alerting

Auto-alerts for:
- Agent downtime > 5 minutes
- Response time SLA miss
- Integration failures
- Queue depth > 100
- Error rate > 5%

Configure alerts:
```bash
python deploy.py --configure-alerts config.json
```

---

## Scaling & Performance

### Single-Agent Limits
- **Throughput:** 100 requests/second
- **Concurrent conversations:** 500
- **Response time SLA:** < 2 seconds (p95)
- **Uptime target:** 99.9%

### Scaling Beyond Single Agent
```bash
# Deploy multiple agent instances
python deploy.py --agent-type customer_service --instances 3

# Load balancer automatically distributes traffic
# Each instance handles 100 req/sec
# Total: 300 req/sec capacity
```

### Database Scaling
```bash
# Use managed Postgres for conversation history
python deploy.py --database-type postgres --db-size large

# Includes:
# - 30-day retention
# - Full-text search
# - Backups every 1 hour
# - Point-in-time recovery
```

---

## Customization

### Modify Agent Behavior
```python
# Edit agent config
from orchestrai import CustomerServiceAgent

agent = CustomerServiceAgent()

# Override rules
agent.config.rules.append("New rule: Always apologize for delays")

# Adjust parameters
agent.config.temperature = 0.8  # More creative responses
agent.config.max_tokens = 3000  # Longer responses

# Retrain on custom data
agent.train(training_data_file="custom_faq.json")
agent.save_state("models/custom_csa_model.pkl")
```

### Add Custom Integrations
```python
# Create custom integration
class CustomERPIntegration:
    def connect(self, api_key):
        # Authentication logic
        pass
    
    def get_customer(self, customer_id):
        # Fetch customer from ERP
        pass

# Register with agent
agent.register_integration("custom_erp", CustomERPIntegration())
```

---

## Support & Maintenance

### Getting Help
- **Setup Questions:** setup@orchestrai.io
- **Integration Issues:** integrations@orchestrai.io
- **Performance Tuning:** performance@orchestrai.io
- **24/7 Emergency:** +1-555-0199

### Regular Maintenance
- Check agent health: daily
- Review metrics: weekly
- Update integrations: monthly
- Retrain on new data: quarterly

### Backup & Recovery
```bash
# Backup agent configuration
python deploy.py --backup --output backup_2026-02-17.tar.gz

# Restore from backup
python deploy.py --restore backup_2026-02-17.tar.gz
```

---

## Production Checklist

Before going live, verify:

- [ ] All API keys configured
- [ ] Integrations tested (all 3+ sources)
- [ ] Load testing completed (>50 req/sec)
- [ ] Fallback strategy for integration failures
- [ ] Monitoring/alerts configured
- [ ] Runbook for common issues
- [ ] Team training completed
- [ ] Customer communication plan
- [ ] Success metrics defined
- [ ] Support process documented

---

## 30-Day Success Plan

**Week 1:** Deploy and test
- [ ] Day 1-2: Setup & configuration
- [ ] Day 3-4: Integration testing
- [ ] Day 5-7: Soft launch (10% traffic)

**Week 2-3:** Ramp up
- [ ] Day 8-14: 50% traffic, monitor closely
- [ ] Collect feedback from teams
- [ ] Make tuning adjustments

**Week 4:** Full production
- [ ] Day 22-30: 100% traffic
- [ ] Monitor SLAs closely
- [ ] Plan Phase 2 improvements

---

**Next:** See SALES_GUIDE.md for customer onboarding
