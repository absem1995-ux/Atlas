#!/usr/bin/env python3

"""
OrchestrAI Customer Service Agent
Handles customer inquiries, returns, refunds, and support tickets
"""

from agent_framework import OrchestrAIAgent, AgentConfig, AgentType, Perception, Action
from typing import Dict, List, Any
import json

class CustomerServiceAgent(OrchestrAIAgent):
    """Specialized agent for customer service operations"""
    
    def __init__(self):
        config = AgentConfig(
            id="csa-prod-001",
            name="Customer Service Agent",
            agent_type=AgentType.CUSTOMER_SERVICE,
            system_prompt="""You are an expert customer service agent for an e-commerce company.

Your responsibilities:
1. Handle customer inquiries about orders, products, and policies
2. Process returns and refunds efficiently
3. Provide tracking information
4. Escalate complex issues to human agents
5. Always maintain a professional, empathetic tone

Key capabilities:
- Order lookup and status updates
- Return/refund processing
- Shipping and delivery information
- Product recommendations and FAQs
- Issue escalation and ticket creation

When responding:
1. Address the customer's concern directly
2. Provide specific solutions or next steps
3. Offer alternatives if the main solution isn't possible
4. Ask clarifying questions if needed
5. Always confirm understanding before taking action""",
            integrations={
                "shopify": True,
                "zendesk": True,
                "stripe": True,
                "email": True,
                "sms": False
            },
            rules=[
                "Always verify customer identity before processing refunds over $100",
                "Returns window is 30 days from purchase date",
                "Escalate to human if customer is very frustrated or issue is technical",
                "Response time < 2 minutes for urgent issues",
                "Always provide tracking information when available",
                "Process simple refunds (<$50) immediately",
                "Offer discount code for future purchase if refunding due to our error"
            ]
        )
        
        super().__init__(config)
        
        # CSA-specific knowledge base
        self.faq = self._load_faq()
        self.policies = self._load_policies()
    
    def _load_faq(self) -> Dict[str, str]:
        """Load FAQs for quick reference"""
        return {
            "shipping": "We offer standard (5-7 days) and express (2-3 days) shipping. Free shipping on orders over $50.",
            "returns": "We accept returns within 30 days of purchase. Items must be unused and in original packaging.",
            "refunds": "Refunds are processed within 3-5 business days after return is received. Original shipping is non-refundable.",
            "exchange": "You can exchange items for a different size or color within 30 days at no extra cost.",
            "payment": "We accept all major credit cards, PayPal, and Apple Pay.",
            "tracking": "You'll receive a tracking number via email within 24 hours of order dispatch.",
            "damaged": "If your item arrives damaged, contact us immediately with photos for a replacement or refund."
        }
    
    def _load_policies(self) -> Dict[str, Any]:
        """Load business policies"""
        return {
            "return_window_days": 30,
            "refund_processing_days": 3,
            "max_auto_refund": 100.00,  # Refund automatically if under $100
            "free_shipping_threshold": 50.00,
            "escalation_triggers": [
                "damaged",
                "lost_package",
                "wrong_item",
                "customer_angry",
                "refund_dispute"
            ]
        }
    
    def perceive(self, input_text: str, source: str = "email") -> Perception:
        """Specialized perception for customer service"""
        
        perception = super().perceive(input_text, source)
        
        # Enhance context with CSA-specific information
        perception.context.update({
            "issue_type": self.classify_issue(input_text),
            "requires_verification": self.requires_identity_check(input_text),
            "sentiment_severity": self.assess_customer_frustration(input_text),
            "possible_escalation": self.should_escalate(input_text)
        })
        
        return perception
    
    def classify_issue(self, text: str) -> str:
        """Classify the type of customer issue"""
        text_lower = text.lower()
        
        issue_map = {
            "order": ["order", "purchase", "bought", "order number", "order id"],
            "tracking": ["track", "where", "when", "arrive", "delivery", "shipped"],
            "return": ["return", "send back", "wrong", "not right", "doesn't fit"],
            "refund": ["refund", "money back", "cancel", "charge"],
            "damaged": ["damaged", "broken", "defective", "doesn't work"],
            "missing": ["missing", "incomplete", "didn't receive", "not in"],
            "payment": ["charge", "payment", "card", "billing", "invoice"],
            "general": []
        }
        
        for issue_type, keywords in issue_map.items():
            if any(kw in text_lower for kw in keywords):
                return issue_type
        
        return "general"
    
    def requires_identity_check(self, text: str) -> bool:
        """Check if customer needs verification"""
        keywords = ["refund", "cancel", "charge", "payment", "dispute"]
        return any(kw in text.lower() for kw in keywords)
    
    def assess_customer_frustration(self, text: str) -> str:
        """Assess how frustrated the customer is"""
        frustration_markers = {
            "very_angry": ["!", "!!!!", "hate", "terrible", "never", "worst"],
            "angry": ["!", "disappointed", "frustrated", "upset"],
            "neutral": [],
            "happy": ["thank", "great", "excellent", "love"]
        }
        
        text_lower = text.lower()
        
        for level, markers in frustration_markers.items():
            if any(marker in text_lower for marker in markers):
                return level
        
        return "neutral"
    
    def should_escalate(self, text: str) -> bool:
        """Determine if issue should be escalated"""
        escalation_keywords = [
            "very angry",
            "frustrated",
            "lost package",
            "damaged",
            "dispute",
            "need supervisor",
            "speak to manager"
        ]
        text_lower = text.lower()
        return any(kw in text_lower for kw in escalation_keywords)
    
    def determine_intent(self, text: str) -> str:
        """Override to add CSA-specific intents"""
        issue_type = self.classify_issue(text)
        
        intent_map = {
            "order": "order_inquiry",
            "tracking": "tracking_request",
            "return": "return_request",
            "refund": "refund_request",
            "damaged": "damage_report",
            "missing": "missing_item_report",
            "payment": "billing_inquiry",
            "general": "general_support"
        }
        
        return intent_map.get(issue_type, "general_support")
    
    def extract_actions(self, reasoning: str, perception: Perception) -> List[Action]:
        """Extract CSA-specific actions"""
        
        actions = []
        reasoning_lower = reasoning.lower()
        
        # CSA-specific action mapping
        csa_actions = {
            "send tracking": ("send_tracking_info", 0.9, "email"),
            "process refund": ("process_refund", 0.95, "payment_system"),
            "create return": ("generate_return_label", 0.9, "shipping"),
            "verify customer": ("verify_identity", 0.95, "auth_system"),
            "escalate": ("escalate_to_human", 0.99, "support_queue"),
            "send replacement": ("ship_replacement", 0.85, "warehouse"),
            "apply discount": ("apply_coupon_code", 0.7, "ecommerce")
        }
        
        for keyword, (action_type, confidence, target) in csa_actions.items():
            if keyword in reasoning_lower:
                action = Action(
                    action_type=action_type,
                    target=target,
                    payload={
                        "customer_context": perception.context,
                        "issue_type": perception.context.get("issue_type"),
                        "reasoning": reasoning
                    },
                    confidence=confidence,
                    reason=f"Detected '{keyword}' in reasoning for {perception.intent}"
                )
                actions.append(action)
        
        # Always create ticket for urgent issues
        if perception.priority in ["urgent", "high"]:
            actions.append(Action(
                action_type="create_support_ticket",
                target="zendesk",
                payload={
                    "priority": perception.priority,
                    "issue_type": perception.context.get("issue_type"),
                    "customer_message": perception.raw_input
                },
                confidence=0.95,
                reason="High priority issue automatically ticketed"
            ))
        
        return actions


# ============================================================================
# Demo Workflows
# ============================================================================

def demo_workflow_1():
    """Demo: Customer asking about order tracking"""
    print("\n" + "="*60)
    print("DEMO 1: Tracking Request")
    print("="*60)
    
    agent = CustomerServiceAgent()
    
    customer_message = "Hi, I ordered item ABC123 5 days ago and haven't received it yet. Can you check on this?"
    
    response = agent.process(customer_message, source="email")
    
    print(f"\nCustomer: {customer_message}")
    print(f"\nAgent Response ({response.confidence:.0%} confidence):")
    print(response.response_text[:500] + "...")
    print(f"\nActions to take: {len(response.actions)}")
    for action in response.actions:
        print(f"  • {action.action_type} ({action.confidence:.0%})")
        print(f"    Reason: {action.reason}")


def demo_workflow_2():
    """Demo: Customer requesting a refund"""
    print("\n" + "="*60)
    print("DEMO 2: Refund Request")
    print("="*60)
    
    agent = CustomerServiceAgent()
    
    customer_message = "I received my order but it's not what I expected. I want a refund. My order is #ORD-67890"
    
    response = agent.process(customer_message, source="email")
    
    print(f"\nCustomer: {customer_message}")
    print(f"\nAgent Response ({response.confidence:.0%} confidence):")
    print(response.response_text[:500] + "...")
    print(f"\nActions to take: {len(response.actions)}")
    for action in response.actions:
        print(f"  • {action.action_type} ({action.confidence:.0%})")


def demo_workflow_3():
    """Demo: Angry customer with damaged item"""
    print("\n" + "="*60)
    print("DEMO 3: Urgent - Damaged Item (Escalation)")
    print("="*60)
    
    agent = CustomerServiceAgent()
    
    customer_message = "This is unacceptable! The item arrived completely broken! I've had terrible experience with your company. I want a full refund NOW!"
    
    response = agent.process(customer_message, source="email")
    
    print(f"\nCustomer: {customer_message}")
    print(f"\nAgent Response ({response.confidence:.0%} confidence):")
    print(response.response_text[:500] + "...")
    print(f"\nActions to take: {len(response.actions)}")
    for action in response.actions:
        print(f"  • {action.action_type} ({action.confidence:.0%})")
        if action.action_type == "escalate_to_human":
            print(f"    ⚠️  ESCALATED TO HUMAN AGENT")


if __name__ == "__main__":
    # Run demos
    demo_workflow_1()
    demo_workflow_2()
    demo_workflow_3()
    
    print("\n" + "="*60)
    print("✅ Customer Service Agent POC Complete")
    print("="*60)
