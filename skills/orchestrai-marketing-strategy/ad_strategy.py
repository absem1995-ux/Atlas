#!/usr/bin/env python3

"""
OrchestrAI Marketing & Ad Strategy Skill

Research advertising platforms, identify communities, generate ad copy.
"""

import json
from typing import Dict, List, Any
from dataclasses import dataclass

@dataclass
class Platform:
    name: str
    type: str  # "social", "forum", "community", "paid"
    reach: str  # "small", "medium", "large"
    cost: str  # "free", "low", "medium", "high"
    time_to_results: str  # "days", "weeks", "months"
    best_for: List[str]
    rules: List[str]
    estimated_ctr: float  # Click-through rate
    estimated_cpc: float  # Cost per click (if paid)
    effort: str  # "low", "medium", "high"

@dataclass
class AdCopy:
    platform: str
    headline: str
    body: str
    cta: str
    variations: List[Dict[str, str]]

class AdStrategySkill:
    """Marketing and advertising strategy"""
    
    def __init__(self):
        self.product = "OrchestrAI"
        self.tagline = "Deploy AI agents for your business in 15 minutes"
        self.value_prop = "Automate customer service, admin, or marketing without hiring"
    
    def research_platforms(self) -> List[Platform]:
        """Research best advertising platforms for OrchestrAI"""
        
        platforms = [
            # ===== FREE COMMUNITIES =====
            Platform(
                name="Reddit - r/SaaS",
                type="community",
                reach="medium",
                cost="free",
                time_to_results="immediate",
                best_for=["awareness", "community_building", "feedback"],
                rules=["No spam", "Authentic engagement", "Must provide value"],
                estimated_ctr=0.12,
                estimated_cpc=0,
                effort="medium"
            ),
            Platform(
                name="Reddit - r/Entrepreneur",
                type="community",
                reach="large",
                cost="free",
                time_to_results="immediate",
                best_for=["founders", "awareness", "conversion"],
                rules=["No self-promotion posts", "Can comment/engage"],
                estimated_ctr=0.08,
                estimated_cpc=0,
                effort="high"
            ),
            Platform(
                name="Reddit - r/Automation",
                type="community",
                reach="medium",
                cost="free",
                time_to_results="immediate",
                best_for=["product_fit", "early_adopters"],
                rules=["Topic-focused", "No spam"],
                estimated_ctr=0.15,
                estimated_cpc=0,
                effort="low"
            ),
            Platform(
                name="Reddit - r/Startups",
                type="community",
                reach="large",
                cost="free",
                time_to_results="immediate",
                best_for=["founders", "funding_discussions"],
                rules=["Authentic", "Value-add"],
                estimated_ctr=0.10,
                estimated_cpc=0,
                effort="medium"
            ),
            Platform(
                name="Reddit - r/NoCode",
                type="community",
                reach="medium",
                cost="free",
                time_to_results="immediate",
                best_for=["early_adopters", "product_discovery"],
                rules=["Tool-focused", "Show, don't tell"],
                estimated_ctr=0.18,
                estimated_cpc=0,
                effort="low"
            ),
            Platform(
                name="Hacker News",
                type="community",
                reach="large",
                cost="free",
                time_to_results="immediate",
                best_for=["tech_credibility", "engineers", "high_quality_traffic"],
                rules=["Authentic", "No marketing speak"],
                estimated_ctr=0.20,
                estimated_cpc=0,
                effort="high"
            ),
            Platform(
                name="Product Hunt",
                type="community",
                reach="large",
                cost="free",
                time_to_results="days",
                best_for=["launch", "media_coverage", "warm_users"],
                rules=["Maker participation", "Engagement"],
                estimated_ctr=0.25,
                estimated_cpc=0,
                effort="very_high"
            ),
            
            # ===== SOCIAL MEDIA (FREE) =====
            Platform(
                name="LinkedIn - Company Page",
                type="social",
                reach="medium",
                cost="free",
                time_to_results="weeks",
                best_for=["B2B_awareness", "thought_leadership", "recruiting"],
                rules=["Professional", "Consistent posting"],
                estimated_ctr=0.05,
                estimated_cpc=0,
                effort="medium"
            ),
            Platform(
                name="LinkedIn - CEO/Founder Posts",
                type="social",
                reach="large",
                cost="free",
                time_to_results="weeks",
                best_for=["personal_brand", "high_engagement", "network_growth"],
                rules=["Authentic", "Share learnings"],
                estimated_ctr=0.08,
                estimated_cpc=0,
                effort="medium"
            ),
            Platform(
                name="Twitter/X",
                type="social",
                reach="large",
                cost="free",
                time_to_results="weeks",
                best_for=["community", "real_time", "thought_leadership"],
                rules=["Conversational", "Consistent"],
                estimated_ctr=0.03,
                estimated_cpc=0,
                effort="high"
            ),
            
            # ===== PAID ADVERTISING =====
            Platform(
                name="Google Ads - Search",
                type="paid",
                reach="very_large",
                cost="high",
                time_to_results="immediate",
                best_for=["high_intent_buyers", "keywords"],
                rules=["Bidding", "A/B testing"],
                estimated_ctr=0.10,
                estimated_cpc=2.50,
                effort="high"
            ),
            Platform(
                name="LinkedIn Ads",
                type="paid",
                reach="large",
                cost="medium",
                time_to_results="days",
                best_for=["B2B_targeting", "job_titles", "company_size"],
                rules=["Targeting", "Creative testing"],
                estimated_ctr=0.06,
                estimated_cpc=1.50,
                effort="medium"
            ),
            Platform(
                name="Facebook/Instagram Ads",
                type="paid",
                reach="very_large",
                cost="low",
                time_to_results="days",
                best_for=["broad_awareness", "retargeting"],
                rules=["Pixel tracking", "Audience building"],
                estimated_ctr=0.02,
                estimated_cpc=0.30,
                effort="medium"
            ),
            Platform(
                name="Reddit Ads",
                type="paid",
                reach="medium",
                cost="low",
                time_to_results="immediate",
                best_for=["subreddit_targeting", "niche_audiences"],
                rules=["Subreddit selection", "Community respect"],
                estimated_ctr=0.08,
                estimated_cpc=0.50,
                effort="low"
            ),
            
            # ===== COMMUNITIES & FORUMS =====
            Platform(
                name="Indie Hackers",
                type="community",
                reach="small",
                cost="free",
                time_to_results="days",
                best_for=["founder_audience", "early_adopters", "feedback"],
                rules=["Genuine participation", "Share learnings"],
                estimated_ctr=0.20,
                estimated_cpc=0,
                effort="medium"
            ),
            Platform(
                name="Y Combinator Startup School",
                type="community",
                reach="small",
                cost="free",
                time_to_results="weeks",
                best_for=["founder_network", "credibility", "partnerships"],
                rules=["Value-driven", "Authentic"],
                estimated_ctr=0.15,
                estimated_cpc=0,
                effort="high"
            ),
            Platform(
                name="Slack Communities (NoCode, SaaS, etc)",
                type="community",
                reach="small",
                cost="free",
                time_to_results="days",
                best_for=["niche_audiences", "direct_feedback", "word_of_mouth"],
                rules=["No spam", "Help others"],
                estimated_ctr=0.25,
                estimated_cpc=0,
                effort="high"
            ),
        ]
        
        return platforms
    
    def rank_platforms(self) -> List[Dict[str, Any]]:
        """Rank platforms by effectiveness for OrchestrAI"""
        
        platforms = self.research_platforms()
        
        # Score each platform
        scored = []
        for p in platforms:
            # Score = (CTR * 100) + (reach_multiplier) - (effort_multiplier)
            reach_mult = {"small": 1, "medium": 2, "large": 3, "very_large": 4}.get(p.reach, 1)
            effort_mult = {"low": 0, "medium": 2, "high": 4, "very_high": 6}.get(p.effort, 2)
            
            score = (p.estimated_ctr * 100) + reach_mult + (20 if p.cost == "free" else 0) - effort_mult
            
            scored.append({
                "rank": None,  # Will be set after sorting
                "name": p.name,
                "type": p.type,
                "reach": p.reach,
                "cost": p.cost,
                "score": score,
                "ctr": p.estimated_ctr,
                "effort": p.effort,
                "best_for": p.best_for
            })
        
        # Sort by score
        scored = sorted(scored, key=lambda x: x["score"], reverse=True)
        for i, item in enumerate(scored, 1):
            item["rank"] = i
        
        return scored
    
    def get_reddit_strategy(self) -> Dict[str, Any]:
        """Get detailed Reddit strategy"""
        
        top_subreddits = [
            {
                "subreddit": "r/SaaS",
                "subscribers": 450000,
                "engagement_rate": 0.08,
                "posting_strategy": "Share learnings, case studies, ask for feedback",
                "examples": [
                    "Show the problem you solved",
                    "Share your journey/mistakes",
                    "Ask community for feedback"
                ]
            },
            {
                "subreddit": "r/Entrepreneur",
                "subscribers": 1200000,
                "engagement_rate": 0.05,
                "posting_strategy": "Answer questions, help others, subtle mentions in comments",
                "examples": [
                    "Someone asks: 'How do you handle customer service?' → Explain your approach",
                    "Comment on posts about automation",
                    "Share lessons learned"
                ]
            },
            {
                "subreddit": "r/Automation",
                "subscribers": 180000,
                "engagement_rate": 0.12,
                "posting_strategy": "Direct fit - show automation examples, tips",
                "examples": [
                    "How we automated customer support with AI",
                    "5 manual tasks we eliminated",
                    "Workflow showcase"
                ]
            },
            {
                "subreddit": "r/NoCode",
                "subscribers": 200000,
                "engagement_rate": 0.15,
                "posting_strategy": "Tool showcase, tutorial, workflow demonstration",
                "examples": [
                    "Deploy an AI agent without code",
                    "Video walkthrough",
                    "Before/after automation"
                ]
            },
            {
                "subreddit": "r/Startups",
                "subscribers": 1000000,
                "engagement_rate": 0.06,
                "posting_strategy": "Lessons learned, advice, story-telling",
                "examples": [
                    "We built an AI agent platform - here's what we learned",
                    "Answer questions about automation",
                    "Share metrics/growth"
                ]
            },
            {
                "subreddit": "r/ecommerce",
                "subscribers": 350000,
                "engagement_rate": 0.09,
                "posting_strategy": "Focus on customer service automation",
                "examples": [
                    "How we reduced support costs by 50%",
                    "Customer service automation tips",
                    "Answer questions about support"
                ]
            }
        ]
        
        return {
            "strategy": "Build community authority first, then subtle mentions",
            "timeline": "4-8 weeks to meaningful engagement",
            "effort": "1-2 hours/day for consistent engagement",
            "expected_results": "5-10 signups per 500 comments",
            "subreddits": top_subreddits
        }
    
    def get_ad_copy_templates(self) -> Dict[str, AdCopy]:
        """Generate platform-specific ad copy"""
        
        templates = {
            "reddit_problem_focus": AdCopy(
                platform="Reddit",
                headline="Stop hiring for repetitive tasks",
                body="""Your customer service team spends 80% of time answering the same questions.
                
OrchestrAI deploys AI agents that handle your most repetitive work. 
- Customer Service Agent: 24/7 support without hiring
- Virtual Assistant: Free up 15 hours/week for executives
- Marketing Agent: 3x content output, same team

15-minute setup. 50% cost reduction. Real ROI in first week.

Not another tool - it's an automated employee.""",
                cta="See the demo → [link]",
                variations=[
                    {
                        "angle": "pain",
                        "headline": "Your team is drowning in repetitive work"
                    },
                    {
                        "angle": "solution",
                        "headline": "What if your support team worked 24/7 for $700/month?"
                    },
                    {
                        "angle": "proof",
                        "headline": "E-commerce companies are cutting support costs by 50%"
                    }
                ]
            ),
            
            "twitter_thread": AdCopy(
                platform="Twitter",
                headline="Thread: We built an AI workforce",
                body="""1/ Your team is drowning in repetitive work.

Customer service reps spend 80% of time answering FAQs.
Executives waste hours on scheduling.
Marketers create the same content types over and over.

2/ What if you could automate all of that?

We built OrchestrAI - AI agents that handle your most repetitive tasks.

3/ Customer Service Agent
- Answers 70% of support tickets automatically
- Processes returns, refunds, order tracking
- 24/7 availability
- 50% cost reduction
- ROI in first week

4/ Virtual Assistant Agent  
- Schedules meetings (checks calendars, finds time)
- Manages email
- Creates tasks
- Preps meeting briefs
- Frees up 15 hours/week for executives

5/ Marketing Agent
- Generates social media content
- Schedules posts (adapted per platform)
- Qualifies leads
- 3x output, same team size

6/ The best part?
15-minute setup. No code needed. Transparent costs.
$700-2,200/month depending on agents.

7/ We're looking for 10 early customers to help us refine.
If you're interested in 50% off first 3 months:
[link]

Hit reply or DM us.""",
                cta="Early access link",
                variations=[]
            ),
            
            "linkedin_post": AdCopy(
                platform="LinkedIn",
                headline="We built an AI workforce so you don't have to hire one",
                body="""Most companies spend 15-20% of revenue on tasks that machines can do better:

🔵 Customer Service Reps answering the same 10 questions daily
🔵 Executives drowning in scheduling/email
🔵 Marketers creating similar content over and over

What if you could automate all of it?

We built OrchestrAI - managed AI agents that integrate with your existing tools.

In 15 minutes:
✅ Deploy an AI agent
✅ Connect your integrations
✅ Go live

Results:
📊 50% reduction in support costs
📊 15 hours/week freed for executives  
📊 3x content output (same team)

$700-2,200/month. Transparent daily costs. Real ROI.

We're looking for 10 early customers. Early bird gets 50% off year 1.

[DM for access or reply below]

#AI #Automation #SaaS #Founder""",
                cta="DM for early access",
                variations=[]
            ),
            
            "google_search_ad": AdCopy(
                platform="Google Ads",
                headline="AI Agents for Your Business | OrchestrAI",
                body="Deploy customer service, admin, or marketing AI in 15 min. 50% cost reduction. Transparent pricing.",
                cta="Start Free Trial",
                variations=[]
            ),
            
            "product_hunt_launch": AdCopy(
                platform="Product Hunt",
                headline="OrchestrAI - Deploy AI agents for customer service, admin, or marketing",
                body="""Stop hiring for repetitive work.

We built OrchestrAI to let you deploy AI agents that:
✅ Handle customer service 24/7
✅ Manage executive admin tasks  
✅ Generate marketing content at scale

All in 15 minutes. Transparent costs. Real ROI.

🎯 Customer Service Agent
- 80% of support tickets → automated
- 24/7 availability
- 50% cost reduction
- ROI in first week

🎯 Virtual Assistant Agent
- Schedules meetings, manages email, creates tasks
- Frees 15 hours/week for executives
- Integrates with Google, Slack, Asana

🎯 Marketing Agent
- 3x content output
- Social media automation
- Lead qualification

Pricing: $700-2,200/month
Setup: 15 minutes
Result: Automated employee for your team

We're early - looking for 20 beta customers to help us refine.

First 20 get 50% off year 1.""",
                cta="Get Early Access",
                variations=[]
            )
        }
        
        return templates
    
    def get_paid_advertising_strategy(self) -> Dict[str, Any]:
        """Get paid ads budget allocation"""
        
        return {
            "total_budget": 2000,  # $2K/month test budget
            "allocation": {
                "google_ads": {
                    "budget": 800,
                    "strategy": "Target high-intent keywords",
                    "keywords": [
                        "AI customer service",
                        "AI automation platform",
                        "Customer service automation",
                        "AI scheduling assistant",
                        "Marketing automation AI"
                    ],
                    "expected_cpc": 2.50,
                    "expected_daily_clicks": 10,
                    "expected_monthly_signups": 15
                },
                "linkedin_ads": {
                    "budget": 600,
                    "strategy": "Target founders, CTOs, Operations managers",
                    "targeting": [
                        "Job titles: Founder, CEO, CTO, Operations Manager",
                        "Company size: 10-500 employees",
                        "Industry: SaaS, E-commerce, Tech"
                    ],
                    "expected_cpc": 1.50,
                    "expected_daily_clicks": 8,
                    "expected_monthly_signups": 12
                },
                "reddit_ads": {
                    "budget": 300,
                    "strategy": "Target niche subreddits",
                    "subreddits": [
                        "r/SaaS",
                        "r/Entrepreneur",
                        "r/Automation",
                        "r/NoCode"
                    ],
                    "expected_cpc": 0.50,
                    "expected_daily_clicks": 12,
                    "expected_monthly_signups": 18
                },
                "facebook_remarketing": {
                    "budget": 300,
                    "strategy": "Retarget website visitors",
                    "expected_cpc": 0.30,
                    "expected_monthly_signups": 10
                }
            },
            "total_expected_monthly_signups": 55,
            "expected_cac": 36,  # Cost to acquire customer
            "expected_ltv": 18800,  # 24-month value
            "roi_months": 0.5  # Payback in half a month
        }
    
    def get_recommendations(self) -> Dict[str, Any]:
        """Get complete ad strategy recommendations"""
        
        return {
            "immediate_actions": [
                "Start posting on Reddit communities (r/SaaS, r/Automation, r/NoCode)",
                "Create Twitter thread about the problem",
                "Post on LinkedIn as founder",
                "Join Indie Hackers and engage",
                "Launch on Product Hunt"
            ],
            
            "week_1_2": [
                "Build email list (landing page on orchestrai.com)",
                "Create YouTube demo video (5-10 min)",
                "Write case study template",
                "Set up Google Analytics",
                "Start paid ads ($2K/month test budget)"
            ],
            
            "week_3_4": [
                "A/B test ad copy",
                "Optimize landing page based on traffic",
                "Get first 5 customer case studies",
                "Double down on what's working",
                "Scale winning channels"
            ],
            
            "channels_ranked": self.rank_platforms()[:10],
            
            "reddit_strategy": self.get_reddit_strategy(),
            
            "ad_copy": self.get_ad_copy_templates(),
            
            "paid_budget": self.get_paid_advertising_strategy(),
            
            "success_metrics": {
                "goal_signups_month_1": 20,
                "goal_signups_month_2": 50,
                "goal_customers_month_1": 3,
                "goal_customers_month_2": 8,
                "target_cac": 50,
                "target_conversion_rate": 0.05
            }
        }

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    skill = AdStrategySkill()
    recommendations = skill.get_recommendations()
    print(json.dumps(recommendations, indent=2, default=str))
