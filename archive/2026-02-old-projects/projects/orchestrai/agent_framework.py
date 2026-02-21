#!/usr/bin/env python3

"""
OrchestrAI Agent Framework
Core base class for all intelligent agents
"""

import json
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import anthropic

# ============================================================================
# Data Models
# ============================================================================

class AgentType(Enum):
    CUSTOMER_SERVICE = "customer_service"
    VIRTUAL_ASSISTANT = "virtual_assistant"
    MARKETING = "marketing"

class IntegrationStatus(Enum):
    CONNECTED = "connected"
    PENDING = "pending"
    FAILED = "failed"

@dataclass
class AgentConfig:
    """Agent configuration"""
    id: str
    name: str
    agent_type: AgentType
    system_prompt: str
    model: str = "claude-3-5-sonnet-20241022"
    temperature: float = 0.7
    max_tokens: int = 2000
    integrations: Dict[str, bool] = None
    rules: List[str] = None
    
    def __post_init__(self):
        if self.integrations is None:
            self.integrations = {}
        if self.rules is None:
            self.rules = []

@dataclass
class Perception:
    """What agent perceives from input"""
    raw_input: str
    intent: str
    priority: str  # low, medium, high, urgent
    source: str  # email, chat, form, api
    context: Dict[str, Any]
    customer_id: Optional[str] = None
    timestamp: float = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()

@dataclass
class Action:
    """Action agent wants to take"""
    action_type: str  # send_email, create_ticket, process_refund, etc
    target: str  # where to take action
    payload: Dict[str, Any]
    confidence: float  # 0.0-1.0
    reason: str

@dataclass
class AgentResponse:
    """Agent's response to input"""
    agent_id: str
    response_text: str
    actions: List[Action]
    confidence: float  # overall confidence in response
    metadata: Dict[str, Any]
    timestamp: float = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()

# ============================================================================
# Base Agent Class
# ============================================================================

class OrchestrAIAgent:
    """Base class for all OrchestrAI agents"""
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.client = anthropic.Anthropic()
        self.conversation_history: List[Dict[str, str]] = []
        self.action_history: List[Action] = []
        
    def process(self, input_text: str, source: str = "api") -> AgentResponse:
        """
        Main processing pipeline:
        Input -> Perception -> Brain -> Actions -> Response
        """
        
        # Step 1: Perception (understand input)
        perception = self.perceive(input_text, source)
        
        # Step 2: Brain (reasoning with Claude)
        reasoning = self.think(perception)
        
        # Step 3: Extract actions from reasoning
        actions = self.extract_actions(reasoning, perception)
        
        # Step 4: Execute actions (in real implementation)
        # For now, just log them
        self.action_history.extend(actions)
        
        # Step 5: Build response
        response = AgentResponse(
            agent_id=self.config.id,
            response_text=reasoning,
            actions=actions,
            confidence=self.calculate_confidence(actions),
            metadata={
                "agent_type": self.config.agent_type.value,
                "perception": asdict(perception),
                "rules_applied": self.get_applied_rules(perception)
            }
        )
        
        return response
    
    def perceive(self, input_text: str, source: str) -> Perception:
        """Understand and parse input"""
        
        # Determine intent and priority
        intent = self.determine_intent(input_text)
        priority = self.determine_priority(input_text, intent)
        
        perception = Perception(
            raw_input=input_text,
            intent=intent,
            priority=priority,
            source=source,
            context=self.extract_context(input_text)
        )
        
        return perception
    
    def determine_intent(self, text: str) -> str:
        """Determine what user is trying to do"""
        # This is agent-specific, overridden in subclasses
        keywords = {
            "order": "order_inquiry",
            "return": "return_request",
            "refund": "refund_request",
            "help": "support_request",
            "problem": "issue_report"
        }
        
        text_lower = text.lower()
        for keyword, intent in keywords.items():
            if keyword in text_lower:
                return intent
        
        return "general_inquiry"
    
    def determine_priority(self, text: str, intent: str) -> str:
        """Determine urgency"""
        urgent_keywords = ["urgent", "critical", "asap", "emergency", "broken", "not working"]
        text_lower = text.lower()
        
        for keyword in urgent_keywords:
            if keyword in text_lower:
                return "urgent"
        
        if intent in ["refund_request", "issue_report"]:
            return "high"
        
        return "normal"
    
    def extract_context(self, text: str) -> Dict[str, Any]:
        """Extract relevant context from input"""
        return {
            "text_length": len(text),
            "has_email": "@" in text,
            "has_phone": any(c.isdigit() for c in text),
            "sentiment_hints": self.detect_sentiment_hints(text)
        }
    
    def detect_sentiment_hints(self, text: str) -> str:
        """Simple sentiment detection"""
        positive = ["good", "great", "excellent", "happy", "satisfied"]
        negative = ["bad", "terrible", "angry", "frustrated", "disappointed"]
        text_lower = text.lower()
        
        neg_count = sum(1 for word in negative if word in text_lower)
        pos_count = sum(1 for word in positive if word in text_lower)
        
        if neg_count > pos_count:
            return "negative"
        elif pos_count > neg_count:
            return "positive"
        return "neutral"
    
    def think(self, perception: Perception) -> str:
        """Use Claude to reason about input"""
        
        # Build system prompt with agent-specific instructions
        system_prompt = self._build_system_prompt(perception)
        
        # Add to conversation history
        self.conversation_history.append({
            "role": "user",
            "content": perception.raw_input
        })
        
        # Call Claude API
        response = self.client.messages.create(
            model=self.config.model,
            max_tokens=self.config.max_tokens,
            temperature=self.config.temperature,
            system=system_prompt,
            messages=self.conversation_history[-5:]  # Keep last 5 messages for context
        )
        
        reasoning = response.content[0].text
        
        # Add to history
        self.conversation_history.append({
            "role": "assistant",
            "content": reasoning
        })
        
        return reasoning
    
    def _build_system_prompt(self, perception: Perception) -> str:
        """Build system prompt with context"""
        
        base_prompt = self.config.system_prompt
        
        # Add contextual instructions
        context_instructions = f"""

Current Context:
- Intent: {perception.intent}
- Priority: {perception.priority}
- Source: {perception.source}
- Sentiment: {perception.context.get('sentiment_hints', 'neutral')}

Available Rules:
{chr(10).join([f"- {rule}" for rule in self.config.rules])}

Respond with:
1. Your reasoning (why you're taking this action)
2. The action you want to take (if any)
3. Any escalation needed (if applicable)

Keep response concise and actionable.
"""
        
        return base_prompt + context_instructions
    
    def extract_actions(self, reasoning: str, perception: Perception) -> List[Action]:
        """Extract structured actions from reasoning"""
        
        # For now, simple extraction based on keywords
        # In production, would use more sophisticated parsing
        
        actions = []
        reasoning_lower = reasoning.lower()
        
        action_keywords = {
            "send email": ("send_email", 0.8),
            "create ticket": ("create_ticket", 0.85),
            "process refund": ("process_refund", 0.9),
            "escalate": ("escalate", 0.95),
            "schedule": ("schedule_meeting", 0.75),
            "update": ("update_record", 0.7)
        }
        
        for keyword, (action_type, confidence) in action_keywords.items():
            if keyword in reasoning_lower:
                action = Action(
                    action_type=action_type,
                    target=f"{self.config.agent_type.value}_system",
                    payload={"reasoning_context": reasoning},
                    confidence=confidence,
                    reason=f"Detected '{keyword}' in reasoning"
                )
                actions.append(action)
        
        return actions
    
    def calculate_confidence(self, actions: List[Action]) -> float:
        """Calculate overall confidence in response"""
        if not actions:
            return 0.6  # Lower confidence if no clear actions
        
        avg_confidence = sum(a.confidence for a in actions) / len(actions)
        return min(avg_confidence, 0.95)  # Cap at 0.95
    
    def get_applied_rules(self, perception: Perception) -> List[str]:
        """Determine which rules were applied"""
        applied = []
        
        for rule in self.config.rules:
            rule_lower = rule.lower()
            
            # Simple rule matching based on intent and priority
            if "urgent" in rule_lower and perception.priority == "urgent":
                applied.append(rule)
            elif "escalate" in rule_lower and perception.priority in ["urgent", "high"]:
                applied.append(rule)
            elif "customer" in rule_lower and "customer" in perception.intent:
                applied.append(rule)
        
        return applied
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert agent state to dictionary"""
        return {
            "config": asdict(self.config),
            "conversation_history": self.conversation_history,
            "action_history": [asdict(a) for a in self.action_history]
        }
    
    def save_state(self, filepath: str):
        """Save agent state to file"""
        with open(filepath, 'w') as f:
            json.dump(self.to_dict(), f, indent=2, default=str)
    
    @classmethod
    def load_state(cls, filepath: str) -> 'OrchestrAIAgent':
        """Load agent state from file"""
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        # Recreate config
        config_data = data['config']
        config_data['agent_type'] = AgentType(config_data['agent_type'])
        config = AgentConfig(**config_data)
        
        # Create agent
        agent = cls(config)
        agent.conversation_history = data.get('conversation_history', [])
        
        return agent

# ============================================================================
# Example Usage
# ============================================================================

if __name__ == "__main__":
    # Create a simple customer service agent
    config = AgentConfig(
        id="csa-001",
        name="Customer Service Agent",
        agent_type=AgentType.CUSTOMER_SERVICE,
        system_prompt="""You are a helpful customer service representative for an e-commerce company.
Your goal is to:
1. Understand customer issues quickly
2. Resolve simple issues (tracking, FAQs, policies)
3. Escalate complex issues to humans
4. Always be empathetic and professional""",
        integrations={
            "shopify": True,
            "zendesk": True,
            "stripe": True,
            "email": True
        },
        rules=[
            "Always verify customer identity before processing refunds",
            "Escalate to human if issue is complex or emotional",
            "Response time must be < 2 minutes",
            "Be empathetic to frustrated customers"
        ]
    )
    
    # Create agent
    agent = OrchestrAIAgent(config)
    
    # Test input
    test_input = "Hi, I ordered item #12345 three days ago and it hasn't arrived yet. I need it for tomorrow!"
    
    # Process
    response = agent.process(test_input, source="email")
    
    # Print result
    print("\n=== Agent Response ===")
    print(f"Agent: {response.agent_id}")
    print(f"Confidence: {response.confidence:.2%}")
    print(f"\nResponse:\n{response.response_text}")
    print(f"\nActions: {len(response.actions)} action(s)")
    for action in response.actions:
        print(f"  - {action.action_type}: {action.reason}")
