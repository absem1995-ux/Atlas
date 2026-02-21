# OrchestrAI Testing Plan v2.0

**Purpose:** Complete testing strategy for all components  
**Timeline:** 1 day per component  
**Target:** 95%+ coverage, all happy + sad paths tested

---

## 1. UNIT TESTS

### Framework Tests

```python
# test_agent_framework.py

def test_agent_initialization():
    """Agent initializes correctly"""
    agent = CustomerServiceAgent("cs-001", config)
    assert agent.agent_id == "cs-001"
    assert agent.state.status == "initializing"

def test_perception_parsing():
    """Perception correctly parses input"""
    perception = agent.perceive({"body": "Where is my order?"})
    assert perception.intent == "order_tracking"
    assert perception.priority == "normal"

def test_local_database_storage():
    """Conversations stored locally"""
    agent.local_db.insert_conversation({
        "input": "test",
        "output": "response"
    })
    results = agent.local_db.query("SELECT * FROM conversations")
    assert len(results) == 1

def test_action_approval():
    """High-risk actions require approval"""
    action = Action(
        action_type="refund",
        payload={"amount": 150},
        requires_approval=True
    )
    approved = agent.approval_layer.check_approval(action)
    assert approved == False  # Needs review

def test_event_publishing():
    """Agent can publish events"""
    event_bus.publish("test_event", {"data": "test"})
    events = event_bus.local_db.query("SELECT * FROM events")
    assert events[-1]["type"] == "test_event"

def test_metric_recording():
    """Performance metrics recorded"""
    agent._record_metric("response_time_ms", 1234)
    metrics = agent.local_db.query("SELECT * FROM metrics WHERE metric='response_time_ms'")
    assert metrics[-1]["value"] == 1234
```

**Coverage target:** 95% of agent framework code

---

## 2. INTEGRATION TESTS

### Agent-to-Integration Communication

```python
# test_integration_shopify.py

def test_shopify_connection():
    """Can connect to Shopify"""
    integration = ShopifyIntegration(credentials)
    assert integration.authenticate() == True

def test_shopify_query():
    """Can retrieve orders from Shopify"""
    orders = integration.get_data("order:12345")
    assert orders is not None
    assert orders["id"] == "12345"

def test_shopify_update():
    """Can update Shopify data"""
    result = integration.send_data({
        "ticket_id": "12345",
        "update": {"status": "refunded"}
    })
    assert result["success"] == True

def test_shopify_error_handling():
    """Handles Shopify API errors gracefully"""
    # Try with invalid key
    bad_creds = {"api_key": "invalid"}
    integration = ShopifyIntegration(bad_creds)
    assert integration.authenticate() == False
```

**Similar tests for:** Zendesk, Gmail, Slack, Mailchimp

---

## 3. END-TO-END TESTS

### Full Request Lifecycle

```python
# test_e2e_customer_service.py

@pytest.mark.integration
def test_full_support_request_flow():
    """Complete request from input to output"""
    
    # 1. Start agent
    agent = CustomerServiceAgent("cs-001", config)
    assert agent.state.status == "ready"
    
    # 2. Send request
    request = {
        "source": "email",
        "body": "My order arrived damaged",
        "customer_id": "cust-001"
    }
    
    # 3. Process
    response = agent.process_request(request)
    
    # 4. Verify
    assert response["status"] == "success"
    assert response["latency_ms"] < 2000
    
    # 5. Check stored
    conversations = agent.local_db.query("SELECT * FROM conversations")
    assert len(conversations) > 0
    assert conversations[-1]["input"] == "My order arrived damaged"
    
    # 6. Check metrics
    metrics = agent.local_db.query("SELECT * FROM metrics")
    assert any(m["metric"] == "response_time_ms" for m in metrics)

@pytest.mark.integration
def test_escalation_flow():
    """Complex issue escalates to human"""
    
    request = {
        "source": "email",
        "body": "I'm very upset!!! The item doesn't work and I want a full refund immediately!!!",
        "customer_id": "cust-001"
    }
    
    response = agent.process_request(request)
    
    # Should detect escalation
    assert any(a.action_type == "escalate_to_human" for a in response.actions)

@pytest.mark.integration
def test_approval_workflow():
    """High-value refund requires approval"""
    
    request = {
        "source": "email",
        "body": "Process refund of $250",
        "customer_id": "cust-001"
    }
    
    response = agent.process_request(request)
    
    # Refund action exists
    refund_action = next((a for a in response.actions if a.action_type == "process_refund"), None)
    assert refund_action is not None
    
    # Marked as needing approval
    assert refund_action.requires_approval == True
```

---

## 4. STRESS TESTS

### High Volume

```python
# test_stress.py

@pytest.mark.stress
def test_1000_concurrent_requests():
    """Can handle 1000 requests simultaneously"""
    
    import concurrent.futures
    
    def send_request():
        request = generate_random_request()
        return agent.process_request(request)
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:
        futures = [executor.submit(send_request) for _ in range(1000)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]
    
    # All succeeded
    assert len(results) == 1000
    assert all(r["status"] == "success" for r in results)
    
    # Response times acceptable
    latencies = [r["latency_ms"] for r in results]
    assert sum(latencies) / len(latencies) < 1500  # Avg < 1.5s

@pytest.mark.stress
def test_memory_usage_over_time():
    """Memory doesn't leak over time"""
    
    import psutil
    
    initial_memory = psutil.Process().memory_info().rss
    
    # Send 10K requests over 10 minutes
    for i in range(10000):
        agent.process_request(generate_random_request())
    
    final_memory = psutil.Process().memory_info().rss
    
    # Memory growth < 10%
    growth_pct = (final_memory - initial_memory) / initial_memory * 100
    assert growth_pct < 10
```

---

## 5. SECURITY TESTS

### Authorization & Access Control

```python
# test_security.py

def test_customer_isolation():
    """Customer A can't see Customer B's data"""
    
    # Create agents for two customers
    agent_a = create_agent("cust-001")
    agent_b = create_agent("cust-002")
    
    # Agent A stores conversation
    agent_a.process_request({"body": "secret info"})
    
    # Agent B tries to read Agent A's data
    agent_b_memory = agent_b.local_db.query("SELECT * FROM conversations")
    
    # Agent B sees nothing (different databases)
    assert len(agent_b_memory) == 0

def test_credential_encryption():
    """API keys are encrypted"""
    
    # Store credentials
    credentials = {"shopify_api_key": "secret123"}
    agent.encrypt_and_store_credentials(credentials)
    
    # Read file directly (should be encrypted)
    cred_file = open(CRED_PATH, "rb").read()
    
    # Can't find plain text
    assert b"secret123" not in cred_file

def test_audit_logging():
    """All actions logged immutably"""
    
    action = Action(
        action_type="process_refund",
        payload={"amount": 100}
    )
    
    agent.log_action("EXECUTED", action)
    
    # Read audit log
    logs = agent.local_db.query("SELECT * FROM audit_log")
    
    # Can verify action was taken
    assert logs[-1]["action_type"] == "EXECUTED"

def test_no_unauthorized_discount():
    """Agent can't give unauthorized discount"""
    
    # Try: Give 50% discount (violates 20% max)
    action = Action(
        action_type="apply_discount",
        payload={"discount_pct": 50}
    )
    
    # Approval layer blocks it
    approved = agent.approval_layer.check_approval(action)
    assert approved == False
```

---

## 6. PERFORMANCE TESTS

### Latency & Throughput

```python
# test_performance.py

def test_response_time_sla():
    """95% of requests < 2s latency"""
    
    latencies = []
    for i in range(1000):
        start = time.time()
        agent.process_request(generate_request())
        latency = time.time() - start
        latencies.append(latency)
    
    # P95 < 2s
    sorted_latencies = sorted(latencies)
    p95 = sorted_latencies[int(0.95 * len(sorted_latencies))]
    assert p95 < 2.0

def test_cache_effectiveness():
    """Caching reduces response time"""
    
    # Same request twice
    request = {"body": "Where is my order?"}
    
    # First: no cache
    start = time.time()
    agent.process_request(request)
    first_time = time.time() - start
    
    # Second: cached
    start = time.time()
    agent.process_request(request)
    second_time = time.time() - start
    
    # Second should be faster
    assert second_time < first_time * 0.5

def test_batch_processing():
    """Batch requests are efficient"""
    
    # 10 individual requests
    individual_time = 0
    for i in range(10):
        start = time.time()
        agent.process_request(generate_request())
        individual_time += time.time() - start
    
    # 10 requests in batch
    start = time.time()
    agent.process_batch([generate_request() for _ in range(10)])
    batch_time = time.time() - start
    
    # Batch should be 30% faster
    assert batch_time < individual_time * 0.7
```

---

## 7. INSTALLATION TESTS

### Installer EXE

```python
# test_installer.py

def test_installer_extracts():
    """Installer extracts files correctly"""
    
    run_installer("orchestrai-installer.exe")
    
    # Check: Directory created
    assert Path.home() / ".orchestrai" exists
    
    # Check: Database created
    assert Path.home() / ".orchestrai/agents/customer_service/memory.db" exists
    
    # Check: Config created
    assert Path.home() / ".orchestrai/config.yaml" exists

def test_installer_integrations():
    """Installer successfully connects integrations"""
    
    run_installer_with_config({
        "agents": ["customer_service"],
        "integrations": {
            "shopify": {"api_key": TEST_SHOPIFY_KEY},
            "zendesk": {"subdomain": TEST_ZENDESK_SUBDOMAIN}
        }
    })
    
    # Verify connections
    agent = load_agent()
    assert agent.integrations["shopify"].authenticate() == True
    assert agent.integrations["zendesk"].authenticate() == True

def test_installer_uninstall():
    """Uninstall removes everything"""
    
    run_installer("orchestrai-installer.exe")
    orchestrai_dir = Path.home() / ".orchestrai"
    assert orchestrai_dir.exists()
    
    run_uninstaller()
    
    # Gone
    assert not orchestrai_dir.exists()
```

---

## 8. MANUAL TESTING CHECKLIST

### Happy Path

```
□ Download installer
□ Run installer
□ Choose 1 agent (CS)
□ Select 2 integrations (Shopify, Zendesk)
□ Paste API keys
□ Configure settings (return window, max refund)
□ Review and install
□ Wait for installation to complete
□ See "✓ Installation Complete"
□ Open dashboard
□ Send test request
□ Agent responds correctly
□ Metrics show in dashboard
□ Cost tracked accurately
```

### Sad Path

```
□ Try installer with no disk space
□ Try installer with invalid API key
□ Try to create refund > $100 (need approval)
□ Disconnect integration mid-process
□ Test with agent offline
□ Restart agent and verify recovery
□ Simulate integration failure
□ Verify local queue and recovery
□ Test with corrupted database
□ Verify restore from backup
```

---

## 9. CUSTOMER UAT (User Acceptance Test)

### Beta Customer Testing

```
Week 1: Internal testing
├─ Engineering tests all paths
├─ Support tests customer experience
└─ Operations tests monitoring

Week 2: Alpha customer (friendly)
├─ Deploy to 1 friendly customer
├─ Monitor closely
├─ Gather feedback
└─ Fix any issues

Week 3: Beta customers (5-10)
├─ Deploy to 5-10 beta customers
├─ Monitor metrics carefully
├─ Gather feedback
├─ Fix issues as found

Week 4: General availability
├─ Ready for production launch
└─ Monitor first 100 customers closely
```

### Success Criteria

```
Performance:
├─ P95 response time < 2s
├─ Availability > 99%
└─ Accuracy > 90%

Customer Experience:
├─ Installation success rate > 95%
├─ Support tickets < 1 per 100 customers/month
├─ NPS > 40
└─ Churn rate < 3%

Operations:
├─ Monitoring alerts working
├─ Auto-recovery functions
├─ No manual interventions needed
└─ Cost tracking accurate
```

---

## 10. TEST AUTOMATION

### CI/CD Pipeline

```
On every commit:
├─ Run unit tests (< 5 min)
├─ Run linting + security scan (< 2 min)
├─ Build installer (< 10 min)
└─ If all pass: Deploy to staging

On daily schedule:
├─ Run integration tests (< 30 min)
├─ Run stress tests (< 1 hour)
├─ Run performance tests (< 30 min)
└─ Report results

Before production release:
├─ Manual code review
├─ Security audit
├─ Performance review
├─ Customer UAT approval
└─ Production deployment
```

---

## Summary

**Testing Strategy:**
- ✅ Unit tests (framework)
- ✅ Integration tests (agents ↔ APIs)
- ✅ E2E tests (full workflows)
- ✅ Stress tests (high volume)
- ✅ Security tests (isolation, encryption)
- ✅ Performance tests (latency, throughput)
- ✅ Installation tests (EXE)
- ✅ Manual UAT (real customers)
- ✅ CI/CD automation (continuous verification)

**Coverage target:** 95% of code + all workflows

**Confidence level:** When complete, we'll be confident this works in production.

---

**All design docs complete. Ready to review with user.**
