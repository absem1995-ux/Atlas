#!/usr/bin/env python3

"""
OrchestrAI Virtual Assistant Agent
Handles scheduling, email management, task coordination, meeting preparation
"""

from agent_framework import OrchestrAIAgent, AgentConfig, AgentType, Perception, Action
from datetime import datetime, timedelta
from typing import Dict, List, Any
import json

class VirtualAssistantAgent(OrchestrAIAgent):
    """Specialized agent for executive/administrative support"""
    
    def __init__(self):
        config = AgentConfig(
            id="vaa-prod-001",
            name="Virtual Assistant Agent",
            agent_type=AgentType.VIRTUAL_ASSISTANT,
            system_prompt="""You are an expert virtual assistant for busy executives.

Your responsibilities:
1. Manage calendar and coordinate meetings
2. Triage and prioritize emails
3. Create and manage tasks
4. Prepare for meetings with research and context
5. Generate reports and summaries
6. Help with travel planning
7. Manage expenses and approvals

Key capabilities:
- Calendar coordination (find optimal meeting times)
- Email triage and smart replies
- Task creation and tracking
- Meeting preparation (pull relevant documents, agenda)
- Report generation and data synthesis
- Time zone aware scheduling
- Context awareness and relationship tracking

When responding:
1. Understand the admin task completely
2. Provide options or recommendations
3. Confirm understanding before executing
4. Proactively suggest related tasks
5. Always maintain confidentiality of sensitive information""",
            integrations={
                "google_calendar": True,
                "outlook_calendar": False,
                "gmail": True,
                "slack": True,
                "asana": True,
                "salesforce": False,
                "google_drive": True,
                "dropbox": False
            },
            rules=[
                "Always check both calendars before scheduling",
                "Find 2-3 time options before proposing",
                "Flag double-bookings immediately",
                "Prioritize meetings by importance (C-suite, revenue, urgent)",
                "Add travel time buffer for meetings",
                "Create detailed agendas for all meetings",
                "Send calendar invites 24 hours before major meetings",
                "Flag emails from VIPs/important contacts",
                "Respond to urgent emails within 30 minutes",
                "Create tasks with clear deadlines and owners"
            ]
        )
        
        super().__init__(config)
        
        # VA-specific data
        self.vip_contacts = self._load_vip_contacts()
        self.meeting_templates = self._load_meeting_templates()
        self.travel_preferences = self._load_travel_preferences()
    
    def _load_vip_contacts(self) -> Dict[str, Dict[str, Any]]:
        """Load VIP contact information"""
        return {
            "ceo": {"name": "CEO", "response_time": "immediate", "priority": "critical"},
            "board": {"name": "Board Members", "response_time": "1hr", "priority": "high"},
            "major_clients": {"name": "Key Clients", "response_time": "2hr", "priority": "high"},
            "team_leads": {"name": "Team Leads", "response_time": "4hr", "priority": "medium"}
        }
    
    def _load_meeting_templates(self) -> Dict[str, Dict[str, str]]:
        """Load meeting preparation templates"""
        return {
            "1_on_1": {
                "duration": "30 min",
                "prep_items": "Last notes, action items, agenda",
                "reminder_before": "15 min"
            },
            "team_meeting": {
                "duration": "1 hour",
                "prep_items": "Agenda, slides, attendee list, last minutes",
                "reminder_before": "30 min"
            },
            "board_meeting": {
                "duration": "2 hours",
                "prep_items": "Agenda, board deck, financial data, risk log",
                "reminder_before": "24 hours"
            },
            "client_call": {
                "duration": "1 hour",
                "prep_items": "Account overview, recent interactions, objectives",
                "reminder_before": "1 hour"
            }
        }
    
    def _load_travel_preferences(self) -> Dict[str, Any]:
        """Load travel preferences"""
        return {
            "preferred_airlines": ["Delta", "United", "Southwest"],
            "seat_preference": "aisle, business/first class",
            "hotel_preference": "luxury, loyalty program: Marriott",
            "car_service": "Uber Black, advance booking",
            "timezone": "US/Eastern"
        }
    
    def perceive(self, input_text: str, source: str = "email") -> Perception:
        """Specialized perception for VA tasks"""
        
        perception = super().perceive(input_text, source)
        
        # Enhance with VA-specific context
        perception.context.update({
            "task_type": self.classify_task(input_text),
            "urgency_from_context": self.assess_urgency_va(input_text),
            "involves_multiple_people": "meeting" in input_text.lower() or "call" in input_text.lower(),
            "requires_external_lookup": self.needs_data_lookup(input_text),
            "vip_involved": self.involves_vip(input_text)
        })
        
        return perception
    
    def classify_task(self, text: str) -> str:
        """Classify the type of admin task"""
        text_lower = text.lower()
        
        task_map = {
            "scheduling": ["schedule", "meeting", "call", "calendar", "time", "when"],
            "email": ["email", "send", "reply", "message", "follow"],
            "task": ["task", "to-do", "reminder", "action item", "deadline"],
            "meeting_prep": ["prepare", "prep", "review", "agenda", "background"],
            "report": ["report", "summary", "analyze", "data", "metric"],
            "travel": ["travel", "flight", "hotel", "trip", "visit"],
            "general": []
        }
        
        for task_type, keywords in task_map.items():
            if any(kw in text_lower for kw in keywords):
                return task_type
        
        return "general"
    
    def assess_urgency_va(self, text: str) -> str:
        """Assess urgency for VA tasks"""
        urgent_indicators = {
            "today": ["today", "asap", "urgent", "immediately", "right now"],
            "this_week": ["this week", "before friday", "soon"],
            "flexible": ["when you get a chance", "eventually", "whenever"]
        }
        
        text_lower = text.lower()
        
        for urgency, indicators in urgent_indicators.items():
            if any(ind in text_lower for ind in indicators):
                return urgency
        
        return "normal"
    
    def needs_data_lookup(self, text: str) -> bool:
        """Check if task requires data lookup"""
        lookup_keywords = ["research", "find", "look up", "background", "data", "metrics", "numbers"]
        return any(kw in text.lower() for kw in lookup_keywords)
    
    def involves_vip(self, text: str) -> bool:
        """Check if task involves important contacts"""
        vip_keywords = list(self.vip_contacts.keys()) + ["ceo", "board", "client", "investor"]
        return any(vip in text.lower() for vip in vip_keywords)
    
    def determine_intent(self, text: str) -> str:
        """Override to add VA-specific intents"""
        task_type = self.classify_task(text)
        
        intent_map = {
            "scheduling": "coordinate_meeting",
            "email": "email_management",
            "task": "task_creation",
            "meeting_prep": "meeting_preparation",
            "report": "generate_report",
            "travel": "arrange_travel",
            "general": "admin_support"
        }
        
        return intent_map.get(task_type, "admin_support")
    
    def extract_actions(self, reasoning: str, perception: Perception) -> List[Action]:
        """Extract VA-specific actions"""
        
        actions = []
        reasoning_lower = reasoning.lower()
        
        # VA-specific action mapping
        va_actions = {
            "schedule": ("schedule_meeting", 0.9, "calendar"),
            "calendar": ("check_availability", 0.95, "calendar"),
            "email": ("send_email", 0.85, "email"),
            "reply": ("draft_reply", 0.8, "email"),
            "task": ("create_task", 0.9, "task_system"),
            "reminder": ("set_reminder", 0.85, "notification"),
            "research": ("lookup_information", 0.75, "knowledge_system"),
            "prepare": ("generate_meeting_prep", 0.85, "doc_system"),
            "travel": ("book_travel", 0.7, "travel_system"),
            "approve": ("escalate_for_approval", 0.95, "approval_workflow")
        }
        
        for keyword, (action_type, confidence, target) in va_actions.items():
            if keyword in reasoning_lower:
                action = Action(
                    action_type=action_type,
                    target=target,
                    payload={
                        "task_type": perception.context.get("task_type"),
                        "reasoning": reasoning,
                        "vip_involved": perception.context.get("vip_involved", False),
                        "urgency": perception.context.get("urgency_from_context")
                    },
                    confidence=confidence,
                    reason=f"Detected '{keyword}' in reasoning for {perception.intent}"
                )
                actions.append(action)
        
        # Auto-create tasks for action items
        if perception.context.get("task_type") == "task":
            actions.append(Action(
                action_type="create_task",
                target="asana",
                payload={
                    "title": f"Task: {perception.raw_input[:50]}...",
                    "priority": "high" if perception.priority == "urgent" else "normal",
                    "due_date": self._calculate_due_date(perception.context.get("urgency_from_context"))
                },
                confidence=0.9,
                reason="Task request detected"
            ))
        
        # VIP priority flag
        if perception.context.get("vip_involved"):
            actions.append(Action(
                action_type="flag_priority",
                target="workflow",
                payload={"reason": "VIP contact involved"},
                confidence=0.95,
                reason="VIP priority flagging"
            ))
        
        return actions
    
    def _calculate_due_date(self, urgency: str) -> str:
        """Calculate due date based on urgency"""
        now = datetime.now()
        
        if urgency == "today":
            due = now + timedelta(hours=4)
        elif urgency == "this_week":
            due = now + timedelta(days=3)
        else:
            due = now + timedelta(days=7)
        
        return due.isoformat()


# ============================================================================
# Demo Workflows
# ============================================================================

def demo_workflow_1():
    """Demo: Schedule a meeting"""
    print("\n" + "="*60)
    print("DEMO 1: Meeting Scheduling")
    print("="*60)
    
    agent = VirtualAssistantAgent()
    
    user_message = "Can you schedule a 30-minute call with John and Sarah for next week? Let me know what times work."
    
    response = agent.process(user_message, source="slack")
    
    print(f"\nUser: {user_message}")
    print(f"\nAgent Response ({response.confidence:.0%} confidence):")
    print(response.response_text[:500] + "...")
    print(f"\nActions to take: {len(response.actions)}")
    for action in response.actions:
        print(f"  • {action.action_type} ({action.confidence:.0%})")


def demo_workflow_2():
    """Demo: Prepare for board meeting"""
    print("\n" + "="*60)
    print("DEMO 2: Meeting Preparation")
    print("="*60)
    
    agent = VirtualAssistantAgent()
    
    user_message = "I have a board meeting at 10am tomorrow. Can you prepare everything I need? Please pull the latest financials and last meeting notes."
    
    response = agent.process(user_message, source="email")
    
    print(f"\nUser: {user_message}")
    print(f"\nAgent Response ({response.confidence:.0%} confidence):")
    print(response.response_text[:500] + "...")
    print(f"\nActions: {len(response.actions)}")
    for action in response.actions:
        print(f"  • {action.action_type} ({action.confidence:.0%})")


def demo_workflow_3():
    """Demo: Email triage and task creation"""
    print("\n" + "="*60)
    print("DEMO 3: Email Triage + Task Creation")
    print("="*60)
    
    agent = VirtualAssistantAgent()
    
    user_message = "I need to follow up with the CEO about the Q1 budget approval. Also, I need to send a travel request for my NY trip next month."
    
    response = agent.process(user_message, source="email")
    
    print(f"\nUser: {user_message}")
    print(f"\nAgent Response ({response.confidence:.0%} confidence):")
    print(response.response_text[:500] + "...")
    print(f"\nActions: {len(response.actions)}")
    for action in response.actions:
        print(f"  • {action.action_type} ({action.confidence:.0%})")
        if action.action_type == "flag_priority":
            print(f"    🚩 VIP PRIORITY")


if __name__ == "__main__":
    # Run demos
    demo_workflow_1()
    demo_workflow_2()
    demo_workflow_3()
    
    print("\n" + "="*60)
    print("✅ Virtual Assistant Agent POC Complete")
    print("="*60)
