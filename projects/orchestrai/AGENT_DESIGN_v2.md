# OrchestrAI Agent Design v2.0 - Local Execution Model

**Status:** Design Phase  
**Focus:** Agents running locally on customer's system  
**Architecture:** Follows ARCHITECTURE_v2.md

---

## 1. AGENT FRAMEWORK REDESIGN

### 1.1 New Base Class: LocalAgent

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, List
import json
from datetime import datetime
from pathlib import Path

class LocalAgent(ABC):
    """
    Base class for all local agents.
    Each agent runs independently on customer's system.
    """
    
    def __init__(self, agent_id: str, agent_type: str, config: Dict[str, Any]):
        self.agent_id = agent_id                    # "cs-001"
        self.agent_type = agent_type               # "customer_service"
        self.config = config                        # Loaded from config.json
        self.customer_id = config["customer_id"]
        self.storage_path = Path.home() / ".orchestrai" / f"agents/{agent_type}"
        
        # Initialize local components
        self.local_db = self._init_database()
        self.state = self._load_state()
        self.event_bus = LocalEventBus(self.customer_id)
        self.approval_layer = ActionApprovalLayer(self.customer_id)
        self.backend_sync = BackendSyncClient(self.customer_id)
        
    def _init_database(self):
        """Initialize local SQLite database"""
        db_path = self.storage_path / "memory.db"
        return LocalDatabase(db_path)
    
    def _load_state(self):
        """Load agent state from disk"""
        state_path = self.storage_path / "state.json"
        if state_path.exists():
            return json.load(open(state_path))
        return {
            "agent_id": self.agent_id,
            "status": "initializing",
            "conversations": [],
            "learned_patterns": [],
            "metrics": {}
        }
    
    def _save_state(self):
        """Persist agent state to disk"""
        state_path = self.storage_path / "state.json"
        with open(state_path, 'w') as f:
            json.dump(self.state, f, indent=2)
    
    # ===== CORE API =====
    
    async def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main entry point for processing requests.
        
        Called by local API server when webhook received.
        """
        request_id = generate_id()
        start_time = datetime.now()
        
        try:
            # Step 1: Perceive
            perception = self.perceive(request)
            
            # Step 2: Think
            response = await self.think(perception)
            
            # Step 3: Act
            actions = await self.act(response)
            
            # Step 4: Execute with approvals
            for action in actions:
                approved = await self.approval_layer.check_approval(action)
                if approved:
                    await self.execute_action(action)
                else:
                    self.log_action("DENIED", action)
            
            # Step 5: Store in local memory
            self.local_db.insert_conversation({
                "request_id": request_id,
                "input": request,
                "output": response,
                "actions": actions,
                "timestamp": start_time.isoformat()
            })
            
            # Step 6: Update metrics
            latency_ms = (datetime.now() - start_time).total_seconds() * 1000
            self._record_metric("latency_ms", latency_ms)
            
            # Step 7: Sync to backend
            await self.backend_sync.report_request({
                "request_id": request_id,
                "agent_type": self.agent_type,
                "latency_ms": latency_ms,
                "success": True
            })
            
            # Step 8: Publish event (for agent coordination)
            await self.event_bus.publish("request_processed", {
                "request_id": request_id,
                "agent_id": self.agent_id,
                "output": response
            })
            
            return {
                "status": "success",
                "response": response,
                "request_id": request_id,
                "latency_ms": latency_ms
            }
            
        except Exception as e:
            self.log_error(request_id, str(e))
            await self.backend_sync.report_error({
                "request_id": request_id,
                "error": str(e)
            })
            raise
    
    # ===== ABSTRACT METHODS (Override in subclass) =====
    
    @abstractmethod
    def perceive(self, request: Dict[str, Any]) -> Perception:
        """Parse input, extract intent, determine priority"""
        pass
    
    @abstractmethod
    async def think(self, perception: Perception) -> str:
        """Generate response (call Claude API if needed)"""
        pass
    
    @abstractmethod
    async def act(self, response: str) -> List[Action]:
        """Determine what actions to take"""
        pass
    
    # ===== HELPER METHODS =====
    
    def get_conversation_history(self, limit: int = 10) -> List[Dict]:
        """Get recent conversations for context"""
        return self.local_db.query(
            "SELECT * FROM conversations ORDER BY timestamp DESC LIMIT ?",
            (limit,)
        )
    
    def get_learned_patterns(self) -> List[Dict]:
        """Get patterns learned from past conversations"""
        return self.local_db.query(
            "SELECT * FROM learned_patterns ORDER BY count DESC"
        )
    
    def _record_metric(self, metric_name: str, value: float):
        """Record performance metric"""
        self.local_db.insert_metric({
            "agent_id": self.agent_id,
            "metric": metric_name,
            "value": value,
            "timestamp": datetime.now().isoformat()
        })
    
    def log_action(self, action_type: str, action: str, data: Dict = None):
        """Immutable audit log"""
        self.local_db.insert_audit({
            "agent_id": self.agent_id,
            "action_type": action_type,
            "action": action,
            "data": data,
            "timestamp": datetime.now().isoformat()
        })
    
    async def execute_action(self, action: Action):
        """Execute an approved action"""
        if action.action_type == "send_email":
            await self._execute_send_email(action)
        elif action.action_type == "create_task":
            await self._execute_create_task(action)
        elif action.action_type == "update_record":
            await self._execute_update_record(action)
        else:
            raise ValueError(f"Unknown action type: {action.action_type}")
    
    async def _execute_send_email(self, action: Action):
        """Send email via integration"""
        integration = self.config["integrations"]["email"]
        await integration.send(action.payload)
        self.log_action("EXECUTED", "send_email", action.payload)
    
    async def _execute_create_task(self, action: Action):
        """Create task via integration"""
        integration = self.config["integrations"]["task_system"]
        await integration.create(action.payload)
        self.log_action("EXECUTED", "create_task", action.payload)
    
    async def _execute_update_record(self, action: Action):
        """Update record in CRM/database"""
        integration = self.config["integrations"].get(action.target)
        if not integration:
            raise ValueError(f"No integration for {action.target}")
        await integration.update(action.payload)
        self.log_action("EXECUTED", "update_record", action.payload)
```

### 1.2 Perception Layer (Updated)

```python
class Perception:
    """Parsed input with context"""
    
    def __init__(self, raw_input: str, source: str, agent_type: str):
        self.raw_input = raw_input
        self.source = source                        # "email", "chat", "webhook"
        self.agent_type = agent_type
        
        # Extract features
        self.intent = self.extract_intent()
        self.priority = self.calculate_priority()
        self.sentiment = self.analyze_sentiment()
        self.context = self.extract_context()
        
    def extract_intent(self) -> str:
        """Determine what customer is asking for"""
        # Agent-specific implementation
        pass
    
    def calculate_priority(self) -> str:
        """Determine if urgent/high/normal/low"""
        # Check for urgency keywords
        urgency_words = ["urgent", "asap", "immediately", "!!!"]
        if any(word in self.raw_input.lower() for word in urgency_words):
            return "urgent"
        return "normal"
    
    def analyze_sentiment(self) -> str:
        """Measure customer satisfaction/frustration"""
        # Returns: "positive", "neutral", "negative"
        pass
    
    def extract_context(self) -> Dict[str, Any]:
        """Extract actionable context"""
        return {
            "source": self.source,
            "keywords": self.extract_keywords(),
            "entities": self.extract_entities(),
            "past_interactions": self.get_similar_conversations()
        }
```

### 1.3 Thinking Layer (Updated)

```python
class ThinkingLayer:
    """Generate responses with access to local context"""
    
    async def think(self, perception: Perception, agent: LocalAgent) -> str:
        """
        Generate response using:
        1. Local memory (past conversations)
        2. Learned patterns
        3. Claude API (if needed)
        """
        
        # Step 1: Check local memory first
        similar_conversations = agent.local_db.find_similar(perception.raw_input)
        if similar_conversations:
            # Similar issue seen before, use cached response
            cached_response = similar_conversations[0]["output"]
            agent.log_action("CACHE_HIT", f"Used cached response for similar request")
            return cached_response
        
        # Step 2: Check learned patterns
        matching_pattern = agent.get_learned_patterns().find_match(perception)
        if matching_pattern and matching_pattern.confidence > 0.8:
            # High-confidence pattern match
            response = matching_pattern.generate_response(perception)
            agent.log_action("PATTERN_MATCH", f"Used learned pattern {matching_pattern.id}")
            return response
        
        # Step 3: Call Claude API
        system_prompt = self.build_system_prompt(agent.agent_type, agent.config)
        context = self.build_context(agent, perception)
        
        response = await call_claude_api(
            system_prompt=system_prompt,
            user_message=perception.raw_input,
            context=context
        )
        
        # Step 4: Store pattern for future
        agent.local_db.insert_learned_pattern({
            "input_pattern": perception.extract_pattern(),
            "output_response": response,
            "confidence": 0.7,
            "success_rate": 0.0,  # Will increase as we see positive feedback
            "timestamp": datetime.now().isoformat()
        })
        
        return response
    
    def build_system_prompt(self, agent_type: str, config: Dict) -> str:
        """Build system prompt with customer-specific rules"""
        
        if agent_type == "customer_service":
            return f"""
You are a customer service agent for {config.get('company_name', 'this company')}.

RULES (MUST FOLLOW):
- Return window: {config.get('return_window_days', 30)} days from purchase
- Max refund without approval: ${config.get('max_refund_no_approval', 100)}
- Max discount: {config.get('max_discount_pct', 20)}%
- Escalate if customer is very frustrated
- Always be professional and empathetic

CONTEXT:
- You have access to: customer history, order details, previous interactions
- You can: process refunds, issue discounts, create tasks
- You cannot: override company policy
"""
        
        elif agent_type == "virtual_assistant":
            return f"""
You are a virtual assistant for {config.get('company_name', 'this company')}.

CAPABILITIES:
- Schedule meetings (check calendar availability)
- Draft emails
- Create tasks
- Research topics
- Prepare meeting briefs

CONSTRAINTS:
- Don't make commitments without approval
- Always verify dates/times before confirming
- Ask for clarification if ambiguous
"""
        
        elif agent_type == "marketing":
            return f"""
You are a marketing agent for {config.get('company_name', 'this company')}.

FOCUS:
- Content creation
- Social media management
- Lead qualification
- Campaign planning

CONSTRAINTS:
- Don't overpromise
- Fact-check before posting
- Follow brand guidelines
- Target audience: {config.get('target_audience', 'general')}
"""
    
    def build_context(self, agent: LocalAgent, perception: Perception) -> str:
        """Build context for Claude call"""
        
        context_parts = []
        
        # Add recent conversations
        recent = agent.get_conversation_history(limit=5)
        context_parts.append(f"Recent interactions:\n{format_conversations(recent)}")
        
        # Add relevant patterns
        patterns = agent.get_learned_patterns()
        context_parts.append(f"Learned patterns:\n{format_patterns(patterns)}")
        
        # Add customer context
        context_parts.append(f"Current perception:\n{format_perception(perception)}")
        
        return "\n\n".join(context_parts)
```

### 1.4 Action Layer (Updated)

```python
@dataclass
class Action:
    """An action agent wants to take"""
    action_type: str                    # "send_email", "create_task", etc
    target: str                         # "email", "crm", "task_system"
    payload: Dict[str, Any]            # Action-specific data
    confidence: float                   # 0.0 - 1.0
    reason: str                         # Why this action
    requires_approval: bool             # Does it need approval?
    
    def __hash__(self):
        return hash((self.action_type, self.target))

class ActionLayer:
    """Determine what actions to take"""
    
    async def extract_actions(self, response: str, agent: LocalAgent) -> List[Action]:
        """Parse response and determine actions"""
        
        actions = []
        
        # Parse response for action keywords
        if "send email" in response.lower():
            action = Action(
                action_type="send_email",
                target="email",
                payload={"recipient": extract_email(response), "body": response},
                confidence=0.8,
                reason="Response indicates email should be sent",
                requires_approval=False
            )
            actions.append(action)
        
        if "create task" in response.lower():
            action = Action(
                action_type="create_task",
                target="task_system",
                payload={"title": extract_task_title(response), "due_date": extract_date(response)},
                confidence=0.7,
                reason="Response indicates task creation",
                requires_approval=True
            )
            actions.append(action)
        
        if "schedule meeting" in response.lower():
            action = Action(
                action_type="schedule_meeting",
                target="calendar",
                payload={"title": extract_title(response), "time": extract_time(response)},
                confidence=0.75,
                reason="Response indicates meeting scheduling",
                requires_approval=True
            )
            actions.append(action)
        
        # Check for high-risk actions
        if "refund" in response.lower():
            refund_amount = extract_amount(response)
            if refund_amount > agent.config.get("max_refund_no_approval", 100):
                actions[-1].requires_approval = True
        
        return actions
```

---

## 2. INTEGRATION LAYER

### 2.1 Abstracted Integrations

```python
class IntegrationBase(ABC):
    """Base class for all integrations"""
    
    def __init__(self, integration_type: str, credentials: Dict):
        self.integration_type = integration_type  # "shopify", "gmail", etc
        self.credentials = credentials
        self.client = self._init_client()
    
    @abstractmethod
    def _init_client(self):
        """Initialize API client"""
        pass
    
    @abstractmethod
    async def authenticate(self) -> bool:
        """Verify credentials are valid"""
        pass
    
    @abstractmethod
    async def get_data(self, query: str) -> Any:
        """Fetch data from integration"""
        pass
    
    @abstractmethod
    async def send_data(self, data: Dict) -> Any:
        """Send data to integration"""
        pass


class ShopifyIntegration(IntegrationBase):
    """Shopify API integration"""
    
    def _init_client(self):
        return shopify.ShopifyResource()
    
    async def authenticate(self) -> bool:
        try:
            shopify.ShopifyResource.activate_session(
                shopify.Session(
                    self.credentials["shop_url"],
                    "2023-01",
                    self.credentials["access_token"]
                )
            )
            return True
        except:
            return False
    
    async def get_data(self, query: str) -> Any:
        """Query Shopify for order/customer/product data"""
        if query.startswith("order:"):
            order_id = query.split(":")[1]
            return shopify.Order.find(order_id)
        elif query.startswith("customer:"):
            customer_id = query.split(":")[1]
            return shopify.Customer.find(customer_id)
        # ... more query types


class GmailIntegration(IntegrationBase):
    """Gmail API integration"""
    
    def _init_client(self):
        credentials = self.credentials["oauth_token"]
        return build('gmail', 'v1', credentials=credentials)
    
    async def get_data(self, query: str) -> Any:
        """Get emails matching query"""
        results = self.client.users().messages().list(userId='me', q=query).execute()
        return results.get('messages', [])
    
    async def send_data(self, data: Dict) -> Any:
        """Send email"""
        message = MimeText(data["body"])
        message['to'] = data["recipient"]
        message['subject'] = data["subject"]
        # ... send via API


class ZendeskIntegration(IntegrationBase):
    """Zendesk API integration"""
    
    def _init_client(self):
        return Zendesk(
            url=self.credentials["subdomain"],
            email=self.credentials["email"],
            token=self.credentials["token"]
        )
    
    async def get_data(self, query: str) -> Any:
        """Get tickets"""
        return self.client.tickets.list()
    
    async def send_data(self, data: Dict) -> Any:
        """Update ticket"""
        return self.client.tickets.update(data["ticket_id"], data["update"])
```

---

## 3. LOCAL DATABASE SCHEMA

```sql
-- Conversations (what was asked, what was responded)
CREATE TABLE conversations (
    id TEXT PRIMARY KEY,
    agent_id TEXT,
    input TEXT,
    output TEXT,
    source TEXT,
    timestamp DATETIME,
    feedback TEXT,  -- "positive", "negative", "neutral"
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Learned patterns (patterns agent has learned)
CREATE TABLE learned_patterns (
    id TEXT PRIMARY KEY,
    agent_id TEXT,
    pattern TEXT,
    response TEXT,
    count INTEGER,
    success_rate FLOAT,
    confidence FLOAT,
    timestamp DATETIME,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Audit log (immutable, all actions)
CREATE TABLE audit_log (
    id TEXT PRIMARY KEY,
    agent_id TEXT,
    action_type TEXT,
    action TEXT,
    data JSON,
    timestamp DATETIME,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Metrics (performance tracking)
CREATE TABLE metrics (
    id TEXT PRIMARY KEY,
    agent_id TEXT,
    metric_name TEXT,
    value FLOAT,
    timestamp DATETIME,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Integration status (which integrations connected)
CREATE TABLE integrations (
    id TEXT PRIMARY KEY,
    agent_id TEXT,
    integration_type TEXT,
    status TEXT,  -- "connected", "failed", "expired"
    last_sync DATETIME,
    error_message TEXT,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);
```

---

## 4. AGENT STATE MANAGEMENT

```python
class AgentState:
    """Track agent's current state"""
    
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.status = "initializing"  # initializing, ready, processing, error
        self.current_task = None
        self.active_conversations = 0
        self.last_error = None
        self.uptime_seconds = 0
        self.last_health_check = datetime.now()
        self.performance = {
            "requests_processed": 0,
            "avg_latency_ms": 0,
            "accuracy_pct": 0,
            "escalation_rate_pct": 0
        }
    
    def update_status(self, new_status: str):
        """Update agent status"""
        self.status = new_status
        if new_status == "error":
            self.last_error = datetime.now()
    
    def record_request_completed(self, latency_ms: float, was_accurate: bool):
        """Update metrics after request"""
        self.active_conversations -= 1
        self.performance["requests_processed"] += 1
        
        # Update average latency
        old_avg = self.performance["avg_latency_ms"]
        new_count = self.performance["requests_processed"]
        self.performance["avg_latency_ms"] = (
            (old_avg * (new_count - 1) + latency_ms) / new_count
        )
        
        # Update accuracy
        if was_accurate:
            self.performance["accuracy_pct"] = (
                self.performance["accuracy_pct"] * 0.9 + 100 * 0.1
            )
        else:
            self.performance["accuracy_pct"] = (
                self.performance["accuracy_pct"] * 0.9 + 0 * 0.1
            )
```

---

## 5. LOCAL EVENT BUS

```python
class LocalEventBus:
    """Coordinate between agents"""
    
    def __init__(self, customer_id: str):
        self.customer_id = customer_id
        self.db = LocalDatabase()
        self.subscriptions = {}  # {event_type: [agent_ids]}
    
    async def publish(self, event_type: str, data: Dict):
        """Publish event for other agents"""
        event_id = generate_id()
        
        # Store event
        self.db.insert_event({
            "event_id": event_id,
            "event_type": event_type,
            "data": data,
            "timestamp": datetime.now().isoformat()
        })
        
        # Notify listening agents
        listeners = self.subscriptions.get(event_type, [])
        for agent_id in listeners:
            await self.notify_agent(agent_id, event_type, data)
    
    def subscribe(self, agent_id: str, event_types: List[str]):
        """Agent registers to listen for events"""
        for event_type in event_types:
            if event_type not in self.subscriptions:
                self.subscriptions[event_type] = []
            self.subscriptions[event_type].append(agent_id)
    
    async def notify_agent(self, agent_id: str, event_type: str, data: Dict):
        """Notify agent via local webhook"""
        # Call agent's local API endpoint
        try:
            response = requests.post(
                f"http://localhost:8765/api/agents/{agent_id}/event",
                json={"event_type": event_type, "data": data}
            )
            if response.status_code == 200:
                self.db.insert_event_delivery({
                    "agent_id": agent_id,
                    "event_type": event_type,
                    "status": "delivered",
                    "timestamp": datetime.now().isoformat()
                })
        except Exception as e:
            self.db.insert_event_delivery({
                "agent_id": agent_id,
                "event_type": event_type,
                "status": "failed",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            })
```

---

## 6. SPECIALIZED AGENTS (Updated)

### 6.1 Customer Service Agent

```python
class CustomerServiceAgent(LocalAgent):
    """Local customer service agent"""
    
    def perceive(self, request: Dict) -> Perception:
        """Understand customer request"""
        perception = Perception(request["body"], request["source"], "customer_service")
        
        # Add CS-specific context
        perception.context["issue_type"] = self.classify_issue(request["body"])
        perception.context["customer_id"] = request.get("customer_id")
        
        return perception
    
    async def think(self, perception: Perception) -> str:
        """Generate customer service response"""
        thinking_layer = ThinkingLayer()
        return await thinking_layer.think(perception, self)
    
    async def act(self, response: str) -> List[Action]:
        """Determine actions (send reply, create ticket, etc)"""
        action_layer = ActionLayer()
        return await action_layer.extract_actions(response, self)
    
    def classify_issue(self, text: str) -> str:
        """Classify customer issue type"""
        if "return" in text.lower() or "back" in text.lower():
            return "return_request"
        elif "refund" in text.lower():
            return "refund_request"
        elif "track" in text.lower() or "where" in text.lower():
            return "order_tracking"
        elif "damaged" in text.lower() or "broken" in text.lower():
            return "damage_report"
        else:
            return "general_inquiry"
```

Similar for Virtual Assistant and Marketing agents...

---

## Summary

**New Agent Framework Supports:**
✅ Local execution
✅ Local memory/learning
✅ API key encryption
✅ Approval workflows
✅ Agent coordination via event bus
✅ Immutable audit logging
✅ Role-based access
✅ GDPR compliance

**Next:** Onboarding flow design
