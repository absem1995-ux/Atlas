#!/usr/bin/env python3

"""
OrchestrAI Marketing Agent
Handles content creation, social posting, email campaigns, lead qualification
"""

from agent_framework import OrchestrAIAgent, AgentConfig, AgentType, Perception, Action
from typing import Dict, List, Any
from datetime import datetime, timedelta

class MarketingAgent(OrchestrAIAgent):
    """Specialized agent for marketing operations"""
    
    def __init__(self):
        config = AgentConfig(
            id="mkt-prod-001",
            name="Marketing Agent",
            agent_type=AgentType.MARKETING,
            system_prompt="""You are an expert marketing agent for a growth-focused company.

Your responsibilities:
1. Generate engaging social media content
2. Create email marketing campaigns
3. Qualify and nurture leads
4. Manage ad campaigns and optimization
5. Monitor and respond to engagement
6. Track and analyze marketing metrics
7. Plan content calendars

Key capabilities:
- Multi-platform content adaptation (LinkedIn, Twitter, Instagram, TikTok)
- Email copywriting and sequencing
- Lead scoring and qualification
- A/B test recommendations
- Competitor analysis
- Campaign performance analysis
- Content calendar planning
- Hashtag and keyword strategy

When responding:
1. Understand the marketing goal
2. Tailor content for each platform
3. Include data-driven recommendations
4. Suggest optimal posting times
5. Provide alternative approaches
6. Track campaign performance metrics""",
            integrations={
                "linkedin": True,
                "twitter": True,
                "instagram": True,
                "tiktok": False,
                "facebook": False,
                "email_platform": True,
                "google_ads": True,
                "crm": True,
                "analytics": True
            },
            rules=[
                "Always provide 3 content variations for A/B testing",
                "Schedule posts at optimal engagement times (9am, 12pm, 6pm)",
                "Include relevant hashtags (5-10 per post)",
                "Keep LinkedIn posts 3-5 sentences",
                "Keep Twitter posts under 240 characters",
                "Instagram captions should be 100-200 characters",
                "Email subject lines must be under 50 characters",
                "Qualify leads with budget/timeline/fit score",
                "Respond to comments within 2 hours",
                "Track engagement metrics for optimization"
            ]
        )
        
        super().__init__(config)
        
        # Marketing-specific data
        self.platform_guidelines = self._load_platform_guidelines()
        self.content_calendar = self._load_content_calendar()
        self.lead_scoring_model = self._load_lead_scoring_model()
        self.performance_targets = self._load_performance_targets()
    
    def _load_platform_guidelines(self) -> Dict[str, Dict[str, Any]]:
        """Load platform-specific content guidelines"""
        return {
            "linkedin": {
                "max_chars": 3000,
                "optimal_length": "3-5 sentences",
                "tone": "professional, thought-leader",
                "hashtags": "3-5",
                "best_times": ["9am", "12pm", "6pm"]
            },
            "twitter": {
                "max_chars": 280,
                "optimal_length": "tweet (under 240)",
                "tone": "conversational, quick insight",
                "hashtags": "1-3",
                "best_times": ["9am", "5pm", "8pm"]
            },
            "instagram": {
                "max_chars": 2200,
                "optimal_length": "100-200 char caption",
                "tone": "visual storytelling",
                "hashtags": "10-30",
                "best_times": ["10am", "2pm", "7pm"]
            },
            "email": {
                "subject_max": 50,
                "preview_text": "50-100 chars",
                "body_optimal": "500-800 words",
                "tone": "personal, benefit-focused",
                "cta_count": "1-2",
                "best_send_time": "Tuesday-Thursday, 10am-2pm"
            }
        }
    
    def _load_content_calendar(self) -> Dict[str, List[str]]:
        """Load content themes for content calendar"""
        return {
            "monday": ["motivation", "week_preview", "wins"],
            "tuesday": ["tips_and_tricks", "industry_news", "education"],
            "wednesday": ["deep_dive", "case_study", "thought_leadership"],
            "thursday": ["community", "Q&A", "engagement"],
            "friday": ["wins_and_results", "week_recap", "celebration"],
            "weekdays": ["product_updates", "customer_stories", "behind_the_scenes"],
            "evergreen": ["how_to", "best_practices", "tools_and_resources"]
        }
    
    def _load_lead_scoring_model(self) -> Dict[str, Dict[str, int]]:
        """Load lead scoring criteria"""
        return {
            "budget": {
                "high": 25,
                "medium": 15,
                "low": 5
            },
            "timeline": {
                "immediate": 30,
                "next_month": 20,
                "next_quarter": 10,
                "no_timeline": 0
            },
            "fit": {
                "perfect": 25,
                "good": 15,
                "possible": 5
            },
            "engagement": {
                "high": 20,
                "medium": 10,
                "low": 0
            }
        }
    
    def _load_performance_targets(self) -> Dict[str, float]:
        """Load performance targets"""
        return {
            "email_open_rate": 0.35,
            "email_click_rate": 0.05,
            "social_engagement_rate": 0.03,
            "conversion_rate": 0.02,
            "lead_qualify_rate": 0.30
        }
    
    def perceive(self, input_text: str, source: str = "email") -> Perception:
        """Specialized perception for marketing tasks"""
        
        perception = super().perceive(input_text, source)
        
        # Enhance with marketing-specific context
        perception.context.update({
            "marketing_task": self.classify_marketing_task(input_text),
            "target_audience": self.identify_audience(input_text),
            "urgency_for_marketing": self.assess_marketing_urgency(input_text),
            "platforms_involved": self.identify_platforms(input_text),
            "requires_ab_test": "test" in input_text.lower() or "variation" in input_text.lower(),
            "campaign_stage": self.identify_campaign_stage(input_text)
        })
        
        return perception
    
    def classify_marketing_task(self, text: str) -> str:
        """Classify type of marketing task"""
        text_lower = text.lower()
        
        task_map = {
            "content_creation": ["write", "create", "post", "content", "article", "copy"],
            "campaign": ["campaign", "launch", "promote", "advertise"],
            "lead_gen": ["lead", "qualify", "prospect", "email"],
            "email": ["email", "newsletter", "sequence", "mailout"],
            "social": ["social", "linkedin", "twitter", "instagram", "post"],
            "analytics": ["metric", "performance", "data", "analysis", "report"],
            "general": []
        }
        
        for task_type, keywords in task_map.items():
            if any(kw in text_lower for kw in keywords):
                return task_type
        
        return "general"
    
    def identify_audience(self, text: str) -> str:
        """Identify target audience from text"""
        audience_map = {
            "b2b": ["business", "companies", "enterprise", "saas"],
            "b2c": ["consumers", "customers", "retail"],
            "internal": ["team", "employees", "internal"],
            "specific": ["ceo", "manager", "developer"]
        }
        
        text_lower = text.lower()
        
        for audience, keywords in audience_map.items():
            if any(kw in text_lower for kw in keywords):
                return audience
        
        return "general"
    
    def assess_marketing_urgency(self, text: str) -> str:
        """Assess urgency for marketing tasks"""
        if "urgent" in text.lower() or "asap" in text.lower():
            return "urgent"
        elif "launch" in text.lower() or "deploy" in text.lower():
            return "high"
        else:
            return "normal"
    
    def identify_platforms(self, text: str) -> List[str]:
        """Identify which platforms are involved"""
        platforms = []
        platform_keywords = {
            "linkedin": ["linkedin"],
            "twitter": ["twitter", "x"],
            "instagram": ["instagram"],
            "email": ["email", "newsletter"]
        }
        
        text_lower = text.lower()
        
        for platform, keywords in platform_keywords.items():
            if any(kw in text_lower for kw in keywords):
                platforms.append(platform)
        
        return platforms if platforms else ["all_platforms"]
    
    def identify_campaign_stage(self, text: str) -> str:
        """Identify campaign stage"""
        text_lower = text.lower()
        
        if "awareness" in text_lower or "top of funnel" in text_lower:
            return "awareness"
        elif "consideration" in text_lower or "evaluation" in text_lower:
            return "consideration"
        elif "conversion" in text_lower or "close" in text_lower:
            return "conversion"
        else:
            return "awareness"
    
    def determine_intent(self, text: str) -> str:
        """Override to add marketing-specific intents"""
        task = self.classify_marketing_task(text)
        
        intent_map = {
            "content_creation": "generate_content",
            "campaign": "launch_campaign",
            "lead_gen": "qualify_leads",
            "email": "create_email_campaign",
            "social": "manage_social",
            "analytics": "analyze_performance",
            "general": "marketing_support"
        }
        
        return intent_map.get(task, "marketing_support")
    
    def extract_actions(self, reasoning: str, perception: Perception) -> List[Action]:
        """Extract marketing-specific actions"""
        
        actions = []
        reasoning_lower = reasoning.lower()
        
        # Marketing-specific action mapping
        marketing_actions = {
            "write": ("generate_content", 0.85, "content_system"),
            "post": ("schedule_post", 0.9, "social_platform"),
            "email": ("create_email", 0.9, "email_platform"),
            "campaign": ("launch_campaign", 0.85, "marketing_automation"),
            "qualify": ("score_leads", 0.95, "crm"),
            "analyze": ("generate_report", 0.8, "analytics"),
            "test": ("create_ab_test", 0.75, "testing_platform"),
            "optimize": ("recommend_optimization", 0.7, "analytics"),
            "respond": ("monitor_engagement", 0.85, "social_platform")
        }
        
        for keyword, (action_type, confidence, target) in marketing_actions.items():
            if keyword in reasoning_lower:
                action = Action(
                    action_type=action_type,
                    target=target,
                    payload={
                        "marketing_task": perception.context.get("marketing_task"),
                        "audience": perception.context.get("target_audience"),
                        "platforms": perception.context.get("platforms_involved"),
                        "reasoning": reasoning
                    },
                    confidence=confidence,
                    reason=f"Detected '{keyword}' in reasoning for {perception.intent}"
                )
                actions.append(action)
        
        # Add platform-specific content variations
        if perception.context.get("requires_ab_test"):
            actions.append(Action(
                action_type="generate_variations",
                target="content_system",
                payload={
                    "variations_needed": 3,
                    "platforms": perception.context.get("platforms_involved")
                },
                confidence=0.9,
                reason="A/B testing requested"
            ))
        
        return actions


# ============================================================================
# Demo Workflows
# ============================================================================

def demo_workflow_1():
    """Demo: Generate social media content"""
    print("\n" + "="*60)
    print("DEMO 1: Social Media Content Generation")
    print("="*60)
    
    agent = MarketingAgent()
    
    user_message = "Create 3 LinkedIn posts about our new product launch. Make them engaging and professional. Include relevant statistics."
    
    response = agent.process(user_message, source="slack")
    
    print(f"\nUser: {user_message}")
    print(f"\nAgent Response ({response.confidence:.0%} confidence):")
    print(response.response_text[:500] + "...")
    print(f"\nActions: {len(response.actions)}")
    for action in response.actions:
        print(f"  • {action.action_type} ({action.confidence:.0%})")


def demo_workflow_2():
    """Demo: Lead qualification"""
    print("\n" + "="*60)
    print("DEMO 2: Lead Qualification & Nurturing")
    print("="*60)
    
    agent = MarketingAgent()
    
    user_message = "We have 15 new leads from our webinar. Need to qualify them and set up nurture sequences. Some mentioned immediate budget, others are exploring."
    
    response = agent.process(user_message, source="email")
    
    print(f"\nUser: {user_message}")
    print(f"\nAgent Response ({response.confidence:.0%} confidence):")
    print(response.response_text[:500] + "...")
    print(f"\nActions: {len(response.actions)}")
    for action in response.actions:
        print(f"  • {action.action_type} ({action.confidence:.0%})")


def demo_workflow_3():
    """Demo: Email campaign with A/B testing"""
    print("\n" + "="*60)
    print("DEMO 3: Email Campaign + A/B Test")
    print("="*60)
    
    agent = MarketingAgent()
    
    user_message = "Create an email campaign for our new Q1 features. Create 3 subject line variations for testing. Target both C-suite and developers."
    
    response = agent.process(user_message, source="email")
    
    print(f"\nUser: {user_message}")
    print(f"\nAgent Response ({response.confidence:.0%} confidence):")
    print(response.response_text[:500] + "...")
    print(f"\nActions: {len(response.actions)}")
    for action in response.actions:
        print(f"  • {action.action_type} ({action.confidence:.0%})")
        if action.action_type == "generate_variations":
            print(f"    📊 A/B TESTING: {action.payload.get('variations_needed')} variations")


if __name__ == "__main__":
    # Run demos
    demo_workflow_1()
    demo_workflow_2()
    demo_workflow_3()
    
    print("\n" + "="*60)
    print("✅ Marketing Agent POC Complete")
    print("="*60)
