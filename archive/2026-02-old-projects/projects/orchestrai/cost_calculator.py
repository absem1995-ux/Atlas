#!/usr/bin/env python3

"""
OrchestrAI - Cost Calculator & Transparency Engine

Calculates actual costs, margins, and ROI for transparency dashboard.
All costs are calculated and displayed to customer.
"""

from dataclasses import dataclass
from typing import Dict, List, Tuple
from datetime import datetime, timedelta
import json

@dataclass
class TierConfig:
    """Pricing tier configuration"""
    name: str
    monthly_price: float
    included_requests: int
    overage_cost_per_request: float
    integrations_included: int
    features: List[str]

@dataclass
class ActualCosts:
    """Actual costs to OrchestrAI"""
    claude_api: float
    hosting: float
    database: float
    integrations: float
    support: float
    infrastructure_overhead: float
    
    @property
    def total(self) -> float:
        return (self.claude_api + self.hosting + self.database + 
                self.integrations + self.support + self.infrastructure_overhead)

@dataclass
class CustomerMetrics:
    """Customer usage metrics"""
    customer_id: str
    tier: str
    requests_used: int
    integrations_active: int
    days_in_month: int
    satisfaction_score: float = 0.0


class CostCalculator:
    """Calculate costs, margins, and ROI"""
    
    def __init__(self):
        self.tiers = self._load_tiers()
        self.api_costs = self._load_api_costs()
        self.customer_savings = self._load_savings_baseline()
    
    def _load_tiers(self) -> Dict[str, TierConfig]:
        """Load pricing tiers"""
        return {
            "starter": TierConfig(
                name="Starter",
                monthly_price=700.0,
                included_requests=1000,
                overage_cost_per_request=0.01,
                integrations_included=3,
                features=[
                    "1 Agent",
                    "Up to 1,000 requests/month",
                    "All integrations included",
                    "Email support",
                    "Basic analytics"
                ]
            ),
            "growth": TierConfig(
                name="Growth",
                monthly_price=1500.0,
                included_requests=10000,
                overage_cost_per_request=0.01,
                integrations_included=12,
                features=[
                    "2-3 Agents",
                    "Up to 10,000 requests/month",
                    "Advanced integrations",
                    "Priority support (24/7)",
                    "Advanced analytics",
                    "Custom rules & workflows"
                ]
            ),
            "enterprise": TierConfig(
                name="Enterprise",
                monthly_price=5000.0,
                included_requests=100000,
                overage_cost_per_request=0.005,
                integrations_included=99,
                features=[
                    "Unlimited agents",
                    "Unlimited requests",
                    "White-label option",
                    "Dedicated support",
                    "Custom integrations",
                    "SLA guarantee"
                ]
            )
        }
    
    def _load_api_costs(self) -> Dict[str, float]:
        """Load actual API costs (public pricing)"""
        return {
            "claude_input_per_1m": 3.0,      # $3 per 1M input tokens
            "claude_output_per_1m": 15.0,    # $15 per 1M output tokens
            "avg_input_tokens_per_request": 500,
            "avg_output_tokens_per_request": 300,
            "hosting_per_month": 5.0,        # AWS/GCP base
            "database_per_month": 2.0,       # Managed DB
            "integration_overhead": 2.0,     # Various integrations
        }
    
    def _load_savings_baseline(self) -> Dict[str, Dict[str, float]]:
        """Load baseline manual labor costs"""
        return {
            "customer_service": {
                "staff_cost_per_month": 5000,  # 1 FTE at $60K/year
                "hours_saved_per_month": 160,  # 40 hours/week
                "cost_per_hour": 31.25
            },
            "virtual_assistant": {
                "staff_cost_per_month": 4000,  # Executive assistant cost
                "hours_saved_per_month": 60,   # 15 hours/week
                "cost_per_hour": 66.67
            },
            "marketing": {
                "staff_cost_per_month": 3500,  # Marketer cost (partial)
                "hours_saved_per_month": 80,   # 20 hours/week
                "cost_per_hour": 43.75
            }
        }
    
    def calculate_claude_api_cost(self, requests: int) -> float:
        """Calculate Claude API cost for N requests"""
        input_tokens = requests * self.api_costs["avg_input_tokens_per_request"]
        output_tokens = requests * self.api_costs["avg_output_tokens_per_request"]
        
        input_cost = (input_tokens / 1_000_000) * self.api_costs["claude_input_per_1m"]
        output_cost = (output_tokens / 1_000_000) * self.api_costs["claude_output_per_1m"]
        
        return input_cost + output_cost
    
    def calculate_actual_costs(self, metrics: CustomerMetrics) -> ActualCosts:
        """Calculate actual cost to serve this customer"""
        
        # Claude API cost (with volume discount if heavy user)
        claude_cost = self.calculate_claude_api_cost(metrics.requests_used)
        
        # Apply volume discount if heavy usage (rough estimate)
        if metrics.requests_used > 5000:
            claude_cost *= 0.75  # 25% discount for heavy users (our Anthropic deal)
        
        # Hosting scales slightly with requests but not linearly
        hosting = self.api_costs["hosting_per_month"]
        if metrics.requests_used > 5000:
            hosting = 8.0  # Slightly higher for heavy usage
        
        # Database cost (mostly fixed, scales slowly)
        database = self.api_costs["database_per_month"]
        
        # Integration overhead (scales with # of integrations)
        integration_cost = self.api_costs["integration_overhead"] * (metrics.integrations_active / 3)
        
        # Support cost (estimated: $50/month per customer baseline)
        support_cost = 50.0
        
        # Infrastructure overhead (allocated: $30/month per customer baseline)
        overhead = 30.0
        
        return ActualCosts(
            claude_api=claude_cost,
            hosting=hosting,
            database=database,
            integrations=integration_cost,
            support=support_cost,
            infrastructure_overhead=overhead
        )
    
    def calculate_margin(self, tier: str, metrics: CustomerMetrics) -> Dict[str, float]:
        """Calculate margin for customer"""
        
        tier_config = self.tiers[tier.lower()]
        revenue = tier_config.monthly_price
        
        # Calculate actual costs
        costs = self.calculate_actual_costs(metrics)
        total_cost = costs.total
        
        # Calculate margin
        gross_profit = revenue - costs.claude_api - costs.hosting - costs.database - costs.integrations
        gross_margin_pct = (gross_profit / revenue * 100) if revenue > 0 else 0
        
        net_profit = revenue - total_cost
        net_margin_pct = (net_profit / revenue * 100) if revenue > 0 else 0
        
        return {
            "revenue": revenue,
            "total_cost": total_cost,
            "gross_profit": gross_profit,
            "gross_margin_pct": gross_margin_pct,
            "net_profit": net_profit,
            "net_margin_pct": net_margin_pct,
            "breakdown": {
                "claude": costs.claude_api,
                "hosting": costs.hosting,
                "database": costs.database,
                "integrations": costs.integrations,
                "support": costs.support,
                "overhead": costs.infrastructure_overhead
            }
        }
    
    def calculate_customer_roi(self, agent_type: str, monthly_requests: int) -> Dict[str, float]:
        """Calculate ROI for customer vs manual labor"""
        
        baseline = self.customer_savings.get(agent_type, self.customer_savings["customer_service"])
        
        # Estimate hours saved based on requests
        # Average: 1 request = 15 minutes of work (if done manually)
        estimated_hours_saved = (monthly_requests * 15) / 60
        
        # Value of hours saved
        hourly_rate = baseline["cost_per_hour"]
        value_saved = estimated_hours_saved * hourly_rate
        
        # For Starter tier, actual cost to customer
        monthly_cost = 700.0
        
        # Net ROI
        net_roi = value_saved - monthly_cost
        roi_pct = (net_roi / monthly_cost * 100) if monthly_cost > 0 else 0
        payback_days = (monthly_cost / (value_saved / 30)) if value_saved > 0 else 999
        
        return {
            "estimated_hours_saved": estimated_hours_saved,
            "hourly_rate": hourly_rate,
            "value_of_work_automated": value_saved,
            "monthly_cost": monthly_cost,
            "net_monthly_roi": net_roi,
            "roi_percentage": roi_pct,
            "payback_period_days": min(payback_days, 30),  # Cap at 30 days
            "annual_savings": net_roi * 12
        }
    
    def get_upgrade_recommendation(self, metrics: CustomerMetrics) -> Tuple[str, str, float]:
        """Recommend tier upgrade if approaching limits"""
        
        current_tier = self.tiers[metrics.tier.lower()]
        usage_pct = (metrics.requests_used / current_tier.included_requests) * 100
        
        if usage_pct < 70:
            return (metrics.tier, "No upgrade needed", 0.0)
        
        elif usage_pct < 100:
            # Recommend next tier
            if metrics.tier.lower() == "starter":
                next_tier = "growth"
            elif metrics.tier.lower() == "growth":
                next_tier = "enterprise"
            else:
                return (metrics.tier, "Maximum tier", 0.0)
            
            next_config = self.tiers[next_tier]
            savings = current_tier.monthly_price - next_config.monthly_price  # This will be negative
            
            return (next_tier, f"Upgrade to {next_config.name} to get {next_config.included_requests} requests/month", 
                   next_config.monthly_price)
        
        else:
            # Already at limit, must upgrade
            if metrics.tier.lower() == "starter":
                next_tier = "growth"
            elif metrics.tier.lower() == "growth":
                next_tier = "enterprise"
            else:
                return (metrics.tier, "Contact sales for custom pricing", 0.0)
            
            next_config = self.tiers[next_tier]
            return (next_tier, f"URGENT: Upgrade to {next_config.name}", next_config.monthly_price)
    
    def get_tier_comparison(self) -> Dict[str, Dict]:
        """Get comparison of all tiers"""
        
        comparison = {}
        for tier_key, tier in self.tiers.items():
            comparison[tier_key] = {
                "name": tier.name,
                "price": tier.monthly_price,
                "included_requests": tier.included_requests,
                "features": tier.features,
                "best_for": self._get_tier_description(tier_key)
            }
        
        return comparison
    
    def _get_tier_description(self, tier: str) -> str:
        """Get description of best fit for tier"""
        descriptions = {
            "starter": "Small businesses, single agent, testing",
            "growth": "Growing companies, 2-3 agents, scaling",
            "enterprise": "Large organizations, unlimited scale, custom needs"
        }
        return descriptions.get(tier, "Custom tier")
    
    def generate_transparency_report(self, metrics: CustomerMetrics, agent_type: str) -> Dict:
        """Generate full transparency report for customer dashboard"""
        
        costs = self.calculate_actual_costs(metrics)
        margin = self.calculate_margin(metrics.tier, metrics)
        roi = self.calculate_customer_roi(agent_type, metrics.requests_used)
        upgrade_rec = self.get_upgrade_recommendation(metrics)
        
        return {
            "timestamp": datetime.now().isoformat(),
            "customer_id": metrics.customer_id,
            "current_tier": metrics.tier,
            "monthly_price": self.tiers[metrics.tier.lower()].monthly_price,
            
            "usage": {
                "requests_used": metrics.requests_used,
                "requests_included": self.tiers[metrics.tier.lower()].included_requests,
                "usage_percentage": (metrics.requests_used / self.tiers[metrics.tier.lower()].included_requests) * 100,
                "integrations_active": metrics.integrations_active,
            },
            
            "cost_breakdown": {
                "claude_api": round(costs.claude_api, 2),
                "hosting": round(costs.hosting, 2),
                "database": round(costs.database, 2),
                "integrations": round(costs.integrations, 2),
                "support": round(costs.support, 2),
                "infrastructure_overhead": round(costs.infrastructure_overhead, 2),
                "total_cost_to_us": round(costs.total, 2),
            },
            
            "margin_analysis": {
                "your_monthly_payment": round(margin["revenue"], 2),
                "our_cost_to_serve_you": round(margin["total_cost"], 2),
                "our_gross_margin": f"{margin['gross_margin_pct']:.1f}%",
                "our_net_margin": f"{margin['net_margin_pct']:.1f}%",
                "breakdown": margin["breakdown"]
            },
            
            "your_roi": {
                "hours_automated_per_month": round(roi["estimated_hours_saved"], 1),
                "value_of_work_automated": f"${roi['value_of_work_automated']:.2f}",
                "your_monthly_cost": f"${roi['monthly_cost']:.2f}",
                "net_monthly_savings": f"${roi['net_monthly_roi']:.2f}",
                "roi_percentage": f"{roi['roi_percentage']:.0f}%",
                "payback_period": f"{roi['payback_period_days']:.0f} days",
                "annual_savings": f"${roi['annual_savings']:.2f}"
            },
            
            "upgrade_recommendation": {
                "current_tier": upgrade_rec[0],
                "recommendation": upgrade_rec[1],
                "upgrade_price": upgrade_rec[2],
                "action": "Upgrade Now" if "URGENT" in upgrade_rec[1] else "Consider Upgrade"
            },
            
            "transparency_message": (
                "💚 Transparency is our policy. You see exactly what we pay to serve you. "
                "We make good money (85% margin), you save way more. Win-win."
            )
        }


# ============================================================================
# Demo / Testing
# ============================================================================

def demo():
    """Demo the cost calculator"""
    
    calc = CostCalculator()
    
    # Example: Starter tier customer with moderate usage
    metrics = CustomerMetrics(
        customer_id="cust-001",
        tier="starter",
        requests_used=342,
        integrations_active=3,
        days_in_month=17
    )
    
    print("\n" + "="*70)
    print("OrchestrAI - Cost Transparency Report")
    print("="*70)
    
    report = calc.generate_transparency_report(metrics, "customer_service")
    
    print(f"\n📊 USAGE THIS MONTH")
    print(f"  Requests: {report['usage']['requests_used']} / {report['usage']['requests_included']} ({report['usage']['usage_percentage']:.1f}%)")
    print(f"  Integrations: {report['usage']['integrations_active']} active")
    
    print(f"\n💰 WHAT WE PAY TO SERVE YOU (Transparent)")
    for key, value in report['cost_breakdown'].items():
        if key != 'total_cost_to_us':
            print(f"  {key.replace('_', ' ').title()}: ${value}")
    print(f"  ────────────────────")
    print(f"  Total Cost to Serve You: ${report['cost_breakdown']['total_cost_to_us']}")
    
    print(f"\n💵 YOUR PAYMENT & OUR MARGIN")
    print(f"  Your Monthly Payment: ${report['margin_analysis']['your_monthly_payment']}")
    print(f"  Our Cost: ${report['margin_analysis']['our_cost_to_serve_you']}")
    print(f"  Our Margin: {report['margin_analysis']['our_net_margin']}")
    
    print(f"\n🎯 YOUR ROI (What You Save)")
    print(f"  Work Automated: {report['your_roi']['hours_automated_per_month']} hours/month")
    print(f"  Value: {report['your_roi']['value_of_work_automated']}")
    print(f"  Your Cost: {report['your_roi']['your_monthly_cost']}")
    print(f"  Net Savings: {report['your_roi']['net_monthly_savings']}")
    print(f"  Payback Period: {report['your_roi']['payback_period']}")
    print(f"  Annual Savings: {report['your_roi']['annual_savings']}")
    
    print(f"\n⬆️  UPGRADE RECOMMENDATION")
    print(f"  {report['upgrade_recommendation']['recommendation']}")
    
    print(f"\n✨ OUR PROMISE")
    print(f"  {report['transparency_message']}")
    
    print("\n" + "="*70)
    
    # Show tier comparison
    print("\n📋 TIER COMPARISON")
    comparison = calc.get_tier_comparison()
    for tier_key, tier_info in comparison.items():
        print(f"\n{tier_info['name']} - ${tier_info['price']}/month")
        print(f"  Requests: {tier_info['included_requests']}/month")
        print(f"  Best for: {tier_info['best_for']}")


if __name__ == "__main__":
    demo()
