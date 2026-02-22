#!/usr/bin/env python3

"""
OrchestrAI Local Agent Framework v2.0
Foundation Phase: Core agent execution model

This is the base class for all local agents.
Agents run on customer's system, store data locally.
"""

import json
import sqlite3
import os
from abc import ABC, abstractmethod
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
import hashlib
from cryptography.fernet import Fernet
import logging

# ============================================================================
# CONFIGURATION
# ============================================================================

ORCHESTRAI_HOME = Path.home() / ".orchestrai"
ORCHESTRAI_HOME.mkdir(exist_ok=True)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(ORCHESTRAI_HOME / "agent_framework.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("OrchestrAI")

# ============================================================================
# DATA MODELS
# ============================================================================

@dataclass
class Perception:
    """Parsed input with context"""
    raw_input: str
    source: str  # "email", "chat", "webhook", "test"
    intent: str
    priority: str  # "urgent", "high", "normal", "low"
    sentiment: str  # "positive", "neutral", "negative"
    context: Dict[str, Any]

@dataclass
class Action:
    """An action agent wants to take"""
    action_type: str  # "send_email", "create_task", etc
    target: str  # "email", "crm", "task_system"
    payload: Dict[str, Any]
    confidence: float  # 0.0 - 1.0
    reason: str
    requires_approval: bool = False

@dataclass
class AgentResponse:
    """Response from processing a request"""
    status: str  # "success", "error", "escalation"
    response_text: str
    actions: List[Action]
    confidence: float
    latency_ms: float
    request_id: str

# ============================================================================
# ENCRYPTION UTILITIES
# ============================================================================

class CredentialManager:
    """Manage encrypted credentials"""
    
    def __init__(self, customer_id: str):
        self.customer_id = customer_id
        self.cred_dir = ORCHESTRAI_HOME / "credentials"
        self.cred_dir.mkdir(exist_ok=True)
        self.key_file = self.cred_dir / "master_key"
        self.cred_file = self.cred_dir / f"{customer_id}.enc"
        self.key = self._get_or_create_key()
    
    def _get_or_create_key(self) -> bytes:
        """Get encryption key or create if missing"""
        if self.key_file.exists():
            return open(self.key_file, 'rb').read()
        else:
            key = Fernet.generate_key()
            self.key_file.write_bytes(key)
            self.key_file.chmod(0o600)  # Read/write for owner only
            logger.info(f"Created encryption key: {self.key_file}")
            return key
    
    def encrypt_credentials(self, credentials: Dict[str, Any]) -> None:
        """Encrypt and store credentials"""
        cipher = Fernet(self.key)
        plaintext = json.dumps(credentials).encode()
        encrypted = cipher.encrypt(plaintext)
        self.cred_file.write_bytes(encrypted)
        self.cred_file.chmod(0o600)
        logger.info(f"Encrypted credentials for {self.customer_id}")
    
    def decrypt_credentials(self) -> Dict[str, Any]:
        """Decrypt and retrieve credentials"""
        if not self.cred_file.exists():
            return {}
        cipher = Fernet(self.key)
        encrypted = self.cred_file.read_bytes()
        plaintext = cipher.decrypt(encrypted)
        return json.loads(plaintext)

# ============================================================================
# LOCAL DATABASE
# ============================================================================

class LocalDatabase:
    """SQLite database for local agent storage"""
    
    def __init__(self, customer_id: str):
        self.customer_id = customer_id
        self.agent_dir = ORCHESTRAI_HOME / "agents" / "data"
        self.agent_dir.mkdir(parents=True, exist_ok=True)
        self.db_path = self.agent_dir / f"{customer_id}.db"
        self.connection = None
        self._init_database()
    
    def _init_database(self):
        """Initialize database schema"""
        self.connection = sqlite3.connect(str(self.db_path))
        self.connection.row_factory = sqlite3.Row
        cursor = self.connection.cursor()
        
        # Conversations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                input TEXT,
                output TEXT,
                source TEXT,
                timestamp DATETIME,
                feedback TEXT,
                latency_ms INTEGER
            )
        ''')
        
        # Learned patterns table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS learned_patterns (
                id TEXT PRIMARY KEY,
                pattern TEXT,
                response TEXT,
                count INTEGER,
                success_rate REAL,
                confidence REAL,
                timestamp DATETIME
            )
        ''')
        
        # Audit log (immutable)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS audit_log (
                id TEXT PRIMARY KEY,
                action_type TEXT,
                action TEXT,
                data TEXT,
                timestamp DATETIME
            )
        ''')
        
        # Metrics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS metrics (
                id TEXT PRIMARY KEY,
                metric_name TEXT,
                value REAL,
                timestamp DATETIME
            )
        ''')
        
        # Integrations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS integrations (
                id TEXT PRIMARY KEY,
                integration_type TEXT,
                status TEXT,
                last_sync DATETIME,
                error_message TEXT
            )
        ''')
        
        self.connection.commit()
        logger.info(f"Database initialized: {self.db_path}")
    
    def insert_conversation(self, data: Dict[str, Any]) -> None:
        """Store a conversation"""
        cursor = self.connection.cursor()
        cursor.execute('''
            INSERT INTO conversations 
            (id, input, output, source, timestamp, feedback, latency_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('id', hashlib.md5(str(datetime.now()).encode()).hexdigest()),
            data['input'],
            data['output'],
            data.get('source', 'unknown'),
            datetime.now().isoformat(),
            data.get('feedback'),
            data.get('latency_ms', 0)
        ))
        self.connection.commit()
    
    def get_recent_conversations(self, limit: int = 10) -> List[Dict]:
        """Get recent conversations"""
        cursor = self.connection.cursor()
        cursor.execute('''
            SELECT * FROM conversations 
            ORDER BY timestamp DESC 
            LIMIT ?
        ''', (limit,))
        return [dict(row) for row in cursor.fetchall()]
    
    def insert_audit_log(self, data: Dict[str, Any]) -> None:
        """Immutable audit log"""
        cursor = self.connection.cursor()
        cursor.execute('''
            INSERT INTO audit_log 
            (id, action_type, action, data, timestamp)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            hashlib.md5(str(datetime.now()).encode()).hexdigest(),
            data['action_type'],
            data['action'],
            json.dumps(data.get('data', {})),
            datetime.now().isoformat()
        ))
        self.connection.commit()
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()

# ============================================================================
# LOCAL AGENT BASE CLASS
# ============================================================================

class LocalAgent(ABC):
    """
    Base class for all local agents.
    
    Each agent runs independently on customer's system.
    Stores data locally, encrypts credentials, communicates with backend.
    """
    
    def __init__(self, agent_id: str, agent_type: str, customer_id: str, config: Dict[str, Any]):
        self.agent_id = agent_id
        self.agent_type = agent_type  # "customer_service", "virtual_assistant", "marketing"
        self.customer_id = customer_id
        self.config = config
        
        # Initialize local components
        self.db = LocalDatabase(customer_id)
        self.cred_manager = CredentialManager(customer_id)
        self.state = self._load_state()
        
        logger.info(f"Initialized {agent_type} agent: {agent_id} for customer: {customer_id}")
    
    def _load_state(self) -> Dict[str, Any]:
        """Load agent state from file"""
        agent_state_dir = ORCHESTRAI_HOME / "agents" / "state"
        agent_state_dir.mkdir(parents=True, exist_ok=True)
        state_file = agent_state_dir / f"{self.agent_id}.json"
        
        if state_file.exists():
            return json.load(open(state_file))
        else:
            state = {
                "agent_id": self.agent_id,
                "agent_type": self.agent_type,
                "customer_id": self.customer_id,
                "status": "initializing",
                "requests_processed": 0,
                "created_at": datetime.now().isoformat()
            }
            self._save_state(state)
            return state
    
    def _save_state(self, state: Dict[str, Any]) -> None:
        """Persist agent state"""
        agent_state_dir = ORCHESTRAI_HOME / "agents" / "state"
        state_file = agent_state_dir / f"{self.agent_id}.json"
        with open(state_file, 'w') as f:
            json.dump(state, f, indent=2)
    
    def perceive(self, request: Dict[str, Any]) -> Perception:
        """Parse input and extract context"""
        return Perception(
            raw_input=request.get('body', ''),
            source=request.get('source', 'unknown'),
            intent=self._extract_intent(request.get('body', '')),
            priority=self._calculate_priority(request.get('body', '')),
            sentiment=self._analyze_sentiment(request.get('body', '')),
            context={
                "source": request.get('source'),
                "timestamp": datetime.now().isoformat()
            }
        )
    
    def _extract_intent(self, text: str) -> str:
        """Override in subclass"""
        return "unknown"
    
    def _calculate_priority(self, text: str) -> str:
        """Determine priority"""
        urgent_words = ["urgent", "asap", "immediately", "!!!"]
        if any(word in text.lower() for word in urgent_words):
            return "urgent"
        return "normal"
    
    def _analyze_sentiment(self, text: str) -> str:
        """Simple sentiment analysis"""
        positive_words = ["great", "thank", "excellent", "love"]
        negative_words = ["bad", "hate", "terrible", "worst"]
        
        text_lower = text.lower()
        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)
        
        if neg_count > pos_count:
            return "negative"
        elif pos_count > neg_count:
            return "positive"
        return "neutral"
    
    async def think(self, perception: Perception) -> str:
        """Generate response - override in subclass"""
        return f"Received: {perception.raw_input[:50]}..."
    
    async def act(self, response: str) -> List[Action]:
        """Determine actions - override in subclass"""
        return []
    
    async def process_request(self, request: Dict[str, Any]) -> AgentResponse:
        """Process a request end-to-end"""
        start_time = datetime.now()
        request_id = hashlib.md5(str(datetime.now()).encode()).hexdigest()
        
        try:
            # Step 1: Perceive
            perception = self.perceive(request)
            
            # Step 2: Think
            response_text = await self.think(perception)
            
            # Step 3: Act
            actions = await self.act(response_text)
            
            # Step 4: Store in local memory
            self.db.insert_conversation({
                "id": request_id,
                "input": perception.raw_input,
                "output": response_text,
                "source": perception.source
            })
            
            # Step 5: Log action
            self.db.insert_audit_log({
                "action_type": "PROCESSED_REQUEST",
                "action": "Request processed successfully",
                "data": {"request_id": request_id}
            })
            
            # Step 6: Update metrics
            latency_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            self._record_metric("latency_ms", latency_ms)
            self.state["requests_processed"] += 1
            self._save_state(self.state)
            
            # Step 7: Update status
            self.state["status"] = "ready"
            
            return AgentResponse(
                status="success",
                response_text=response_text,
                actions=actions,
                confidence=0.85,
                latency_ms=latency_ms,
                request_id=request_id
            )
        
        except Exception as e:
            logger.error(f"Error processing request: {str(e)}")
            self.db.insert_audit_log({
                "action_type": "ERROR",
                "action": "Request processing failed",
                "data": {"error": str(e)}
            })
            return AgentResponse(
                status="error",
                response_text=f"Error: {str(e)}",
                actions=[],
                confidence=0.0,
                latency_ms=int((datetime.now() - start_time).total_seconds() * 1000),
                request_id=request_id
            )
    
    def _record_metric(self, metric_name: str, value: float) -> None:
        """Record performance metric"""
        self.db.insert_audit_log({
            "action_type": "METRIC",
            "action": metric_name,
            "data": {"value": value}
        })
    
    def get_status(self) -> Dict[str, Any]:
        """Get agent status"""
        return {
            "agent_id": self.agent_id,
            "agent_type": self.agent_type,
            "status": self.state.get("status"),
            "requests_processed": self.state.get("requests_processed", 0),
            "created_at": self.state.get("created_at")
        }
    
    def close(self):
        """Cleanup"""
        if self.db:
            self.db.close()

# ============================================================================
# TEST AGENT (for verification)
# ============================================================================

class TestAgent(LocalAgent):
    """Simple test agent for verification"""
    
    async def think(self, perception: Perception) -> str:
        """Echo back the input with metadata"""
        return f"Echo test: {perception.raw_input} [Source: {perception.source}, Priority: {perception.priority}]"
    
    async def act(self, response: str) -> List[Action]:
        """Simple test action"""
        return [
            Action(
                action_type="test_action",
                target="test",
                payload={"message": "Test action executed"},
                confidence=0.9,
                reason="Test workflow",
                requires_approval=False
            )
        ]

# ============================================================================
# EXPORT
# ============================================================================

if __name__ == "__main__":
    # Example usage
    print("OrchestrAI Local Agent Framework - Ready to import")
    print(f"Agent home: {ORCHESTRAI_HOME}")
