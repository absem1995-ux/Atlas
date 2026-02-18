# OrchestrAI Skills Roadmap v2.0

**Purpose:** Skills that support agent deployment, monitoring, testing  
**Strategy:** Build each skill to solve one specific problem  
**Location:** `/skills/orchestrai-*/`  
**Automation:** Run via cron jobs, manual triggers, or OpenClaw integration

---

## Skill 1: Integration Tester

**Purpose:** Verify integrations work before going live

**When runs:**
- During installation (Step 4 of onboarding)
- Manual: customer clicks "Test Connection"
- Scheduled: daily at 2 AM (health check)

**What it does:**

```python
class IntegrationTesterSkill:
    def test_shopify(self):
        """Test Shopify API connection"""
        # Try: Get store info
        # Try: List recent orders
        # Try: Read customer data
        # Returns: "✓ healthy" or "❌ failed - check API key"
    
    def test_zendesk(self):
        """Test Zendesk API connection"""
        # Try: Authenticate
        # Try: List tickets
        # Try: Create test ticket (then delete)
        # Returns: success/failure + error message
    
    def test_gmail(self):
        """Test Gmail OAuth"""
        # Try: Verify token valid
        # Try: List recent emails
        # Try: Send test email to self
        # Returns: success/failure
    
    def test_all(self):
        """Run all integration tests"""
        results = {
            "shopify": self.test_shopify(),
            "zendesk": self.test_zendesk(),
            "gmail": self.test_gmail(),
            "timestamp": now()
        }
        return results
```

**Output:**
```json
{
  "integrations": {
    "shopify": {
      "status": "healthy",
      "latency_ms": 245,
      "last_sync": "2 minutes ago"
    },
    "zendesk": {
      "status": "healthy",
      "latency_ms": 189,
      "last_sync": "5 minutes ago"
    },
    "gmail": {
      "status": "failed",
      "error": "Token expired",
      "action": "Re-authenticate needed"
    }
  }
}
```

**File:** `/skills/orchestrai-integration-tester/integration_tester.py`

---

## Skill 2: Agent Health Monitor

**Purpose:** Continuous monitoring of agent status

**When runs:**
- Every 5 minutes (background)
- Manual: user clicks "Check Health"

**What it does:**

```python
class AgentHealthMonitorSkill:
    def check_agent_status(self, agent_id: str):
        """Is agent responding?"""
        # Ping: http://localhost:8765/api/agents/{agent_id}/health
        # Timeout: 5 seconds
        # Returns: status + latency
    
    def check_api_server(self):
        """Is local API server running?"""
        # Ping: http://localhost:8765/health
        # Check: All endpoints responding
        # Returns: up/down
    
    def check_database(self):
        """Is local database accessible?"""
        # Try: Read 1 row
        # Try: Insert 1 row (then delete)
        # Returns: healthy/offline
    
    def check_disk_space(self):
        """Do we have disk space?"""
        # Check: Available space > 100 MB
        # If < 100 MB: warning
        # If < 10 MB: critical
    
    def check_resources(self):
        """CPU/RAM usage normal?"""
        # CPU: < 80%
        # RAM: < 80%
        # If exceeded: alert
    
    def run_all_checks(self):
        """Run complete health check"""
        return {
            "agents": self.check_all_agents(),
            "api": self.check_api_server(),
            "database": self.check_database(),
            "disk": self.check_disk_space(),
            "resources": self.check_resources(),
            "timestamp": now()
        }
```

**Output:**

```json
{
  "overall": "healthy",
  "agents": {
    "cs": "healthy",
    "va": "healthy",
    "mk": "offline"  // Alert needed
  },
  "api_server": "healthy",
  "database": "healthy",
  "disk": "97 GB available (healthy)",
  "cpu": "23%",
  "ram": "45%",
  "alerts": ["Marketing agent offline for 15 minutes"]
}
```

**Alert logic:**
```python
if agent_offline_minutes > 5:
    send_alert("Agent offline", severity="high")
elif agent_latency_ms > 3000:
    send_alert("Agent slow", severity="medium")
elif integration_failed:
    send_alert("Integration failed", severity="high")
```

**File:** `/skills/orchestrai-health-monitor/health_monitor.py`

---

## Skill 3: Deployment Verifier

**Purpose:** Verify installation succeeded

**When runs:**
- End of installation (Step 8 of onboarding)
- Manual: customer clicks "Verify Setup"

**What it does:**

```python
class DeploymentVerifierSkill:
    def verify_installation(self):
        """Complete verification of new installation"""
        
        # 1. Check agents created
        agents_exist = self.check_agents_exist()
        
        # 2. Check database initialized
        db_initialized = self.check_database()
        
        # 3. Check credentials encrypted
        credentials_safe = self.check_credentials()
        
        # 4. Check API server running
        api_running = self.check_api_server()
        
        # 5. Send test request to each agent
        agents_responding = self.test_agent_requests()
        
        # 6. Test integrations
        integrations_working = self.test_integrations()
        
        # 7. Test event bus
        events_working = self.test_event_bus()
        
        all_passed = all([
            agents_exist,
            db_initialized,
            credentials_safe,
            api_running,
            agents_responding,
            integrations_working,
            events_working
        ])
        
        return {
            "verified": all_passed,
            "details": {
                "agents_created": agents_exist,
                "database_initialized": db_initialized,
                "credentials_encrypted": credentials_safe,
                "api_running": api_running,
                "agents_responding": agents_responding,
                "integrations_connected": integrations_working,
                "event_bus_working": events_working
            }
        }
    
    def test_agent_request(self, agent_type: str):
        """Send test request to agent"""
        test_input = self.get_test_input(agent_type)
        response = requests.post(
            f"http://localhost:8765/api/agents/{agent_type}/process",
            json={"input": test_input, "source": "test"}
        )
        return response.status_code == 200
```

**Output:**

```json
{
  "verified": true,
  "summary": "✓ All systems ready",
  "details": {
    "agents_created": "✓ 1 agent (customer_service)",
    "database_initialized": "✓ SQLite created",
    "credentials_encrypted": "✓ 2 integrations secured",
    "api_running": "✓ Listening on :8765",
    "agents_responding": "✓ Customer Service responding",
    "integrations_connected": "✓ Shopify, Zendesk working",
    "event_bus_working": "✓ Subscriptions active"
  },
  "ready_to_go_live": true
}
```

**File:** `/skills/orchestrai-deployment-verifier/deployment_verifier.py`

---

## Skill 4: Onboarding Wizard (Backend)

**Purpose:** Guide customer through setup process

**When runs:**
- During installation (GUI handles this)
- Can also run as backend API for programmatic setup

**What it does:**

```python
class OnboardingWizardSkill:
    async def step_1_system_check(self):
        """Verify system requirements"""
        return self.check_system()
    
    async def step_2_agent_selection(self, selected_agents: List[str]):
        """User selected agents"""
        self.user_agents = selected_agents
        return {"selected": selected_agents}
    
    async def step_3_integration_selection(self, selected_integrations: List[str]):
        """User selected integrations"""
        self.user_integrations = selected_integrations
        return {"selected": selected_integrations}
    
    async def step_4_configure_credentials(self, credentials: Dict):
        """User provided credentials"""
        # Validate each
        # Test connections
        # Encrypt and store
        results = {}
        for integration, cred in credentials.items():
            results[integration] = await self.validate_and_store(integration, cred)
        return results
    
    async def step_5_configure_settings(self, settings: Dict):
        """User configured business rules"""
        # Validate settings
        # Save to config
        return {"saved": settings}
    
    async def step_6_install(self):
        """Execute installation"""
        # Create directories
        # Initialize database
        # Start agents
        # Register with backend
        return {"status": "installed", "customer_id": self.customer_id}
    
    async def run_full_onboarding(self, user_input: Dict):
        """Run entire onboarding"""
        # Validates, guides, handles errors
        # Returns: customer ready to go
```

**File:** `/skills/orchestrai-onboarding-wizard/wizard.py`

---

## Skill 5: Cost Tracker

**Purpose:** Monitor spending in real-time

**When runs:**
- Every request (local tracking)
- Every hour (backend sync)
- Manual: customer clicks "View Usage"

**What it does:**

```python
class CostTrackerSkill:
    def track_request(self, agent_type: str, latency_ms: float):
        """Record cost of one request"""
        
        # Calculate cost
        claude_cost = self.calculate_claude_cost(latency_ms)
        infra_cost = 0.001
        total_cost = claude_cost + infra_cost
        
        # Store locally
        self.local_db.insert_request({
            "agent_type": agent_type,
            "cost": total_cost,
            "timestamp": now()
        })
        
        return total_cost
    
    def get_monthly_usage(self):
        """Get this month's usage"""
        requests = self.local_db.query(
            "SELECT * FROM requests WHERE month = CURRENT_MONTH"
        )
        
        return {
            "requests_processed": len(requests),
            "total_cost": sum([r["cost"] for r in requests]),
            "agents": self.group_by_agent(requests),
            "forecast": self.forecast_end_of_month()
        }
    
    def alert_if_approaching_limit(self):
        """Alert if nearing tier limit"""
        usage = self.get_monthly_usage()
        tier_limit = self.get_tier_limit()
        
        pct_used = (usage["requests_processed"] / tier_limit) * 100
        
        if pct_used > 85:
            severity = "high" if pct_used > 95 else "medium"
            send_alert(
                f"Approaching request limit: {pct_used:.0f}%",
                severity=severity,
                recommendation="Consider upgrading to next tier"
            )
```

**Output:**

```json
{
  "monthly_usage": {
    "requests_processed": 342,
    "included_in_tier": 1000,
    "percentage_used": 34.2,
    "total_cost_to_us": 15.20,
    "your_cost": 700.00,
    "our_margin": "97%",
    "forecast_end_of_month": 856,
    "alert": null
  }
}
```

**File:** `/skills/orchestrai-cost-tracker/cost_tracker.py`

---

## Skill 6: Approval Workflow Engine

**Purpose:** Handle approval workflows for high-risk actions

**When runs:**
- Before executing: refunds > $100, discounts > 20%, rule overrides

**What it does:**

```python
class ApprovalWorkflowSkill:
    async def check_action_needs_approval(self, action: Action) -> bool:
        """Does this action need approval?"""
        
        if action.type == "refund":
            return action.payload["amount"] > 100
        elif action.type == "discount":
            return action.payload["percent"] > 20
        elif action.type == "override_rule":
            return True
        
        return False
    
    async def request_approval(self, action: Action) -> bool:
        """Request approval from customer"""
        
        approval_request = {
            "action": action.type,
            "details": action.payload,
            "risk_level": self.assess_risk(action),
            "reason": action.reason
        }
        
        # Send to customer
        # Option 1: Auto-approve (if whitelisted)
        if self.is_whitelisted(action):
            return True
        
        # Option 2: Email for approval
        send_approval_email(approval_request)
        
        # Wait for response (timeout 1 hour)
        response = await self.wait_for_approval(approval_request, timeout=3600)
        
        return response == "approved"
    
    def get_whitelist(self) -> Dict:
        """Get customer's whitelist rules"""
        # Example:
        # "auto_approve_refunds_under_50": true
        # "auto_approve_returns_within_30_days": true
        # "require_approval_for_everything": false
        return self.local_db.query("SELECT * FROM approval_rules")
```

**File:** `/skills/orchestrai-approval-workflow/approval_workflow.py`

---

## Skill 7: Error Recovery & Self-Healing

**Purpose:** Automatically fix common issues

**When runs:**
- Continuous (background)
- When health check detects problem

**What it does:**

```python
class ErrorRecoverySkill:
    async def recover_from_error(self, error: str):
        """Attempt to recover from error"""
        
        if "agent_offline" in error:
            self.restart_agent()
        
        elif "integration_auth_failed" in error:
            self.attempt_reauth_integration()
        
        elif "database_locked" in error:
            self.restart_database()
        
        elif "api_rate_limited" in error:
            self.throttle_requests()
        
        # Log recovery attempt
        self.log_recovery_attempt(error)
        
        # Verify recovery worked
        if await self.verify_recovery():
            self.clear_alert(error)
        else:
            self.escalate_to_human(error)
```

**File:** `/skills/orchestrai-error-recovery/recovery.py`

---

## Skill Schedule

**Cron jobs:**

```yaml
integration-tester:
  schedule: "0 2 * * *"  # Daily at 2 AM
  task: "Verify all integrations healthy"

health-monitor:
  schedule: "*/5 * * * *"  # Every 5 minutes
  task: "Check agent health, disk, resources"

cost-tracker:
  schedule: "0 * * * *"  # Every hour
  task: "Sync usage data to backend"

approval-workflow:
  schedule: "*/15 * * * *"  # Every 15 minutes
  task: "Check for pending approvals"

error-recovery:
  schedule: "*/10 * * * *"  # Every 10 minutes
  task: "Scan logs for issues and recover"
```

---

## Summary

**7 Skills Build Complete System:**
1. ✅ Integration Tester - Verify connections
2. ✅ Health Monitor - 24/7 monitoring
3. ✅ Deployment Verifier - Installation success
4. ✅ Onboarding Wizard - Setup automation
5. ✅ Cost Tracker - Usage monitoring
6. ✅ Approval Workflow - Action verification
7. ✅ Error Recovery - Self-healing

**Each skill:**
- Solves one problem
- Runs independently
- Can be tested separately
- Logs all actions
- Integrates with others

**All skills stored in:**
```
/skills/orchestrai-integration-tester/
/skills/orchestrai-health-monitor/
/skills/orchestrai-deployment-verifier/
/skills/orchestrai-onboarding-wizard/
/skills/orchestrai-cost-tracker/
/skills/orchestrai-approval-workflow/
/skills/orchestrai-error-recovery/
```

Next: Operations guide
