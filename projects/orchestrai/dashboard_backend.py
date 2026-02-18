#!/usr/bin/env python3

"""
OrchestrAI - Dashboard Backend API

FastAPI backend for the cost transparency dashboard.
Serves metrics, costs, and usage data to the frontend.
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import json
from cost_calculator import CostCalculator, CustomerMetrics

# ============================================================================
# FastAPI Setup
# ============================================================================

app = FastAPI(
    title="OrchestrAI Dashboard API",
    description="Cost transparency and metrics API",
    version="1.0.0"
)

# Enable CORS for dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize cost calculator
calc = CostCalculator()

# ============================================================================
# Data Models
# ============================================================================

class UsageMetrics(BaseModel):
    """Customer usage metrics"""
    requests_used: int
    integrations_active: int
    satisfaction_score: float = 0.0

class SubscriptionInfo(BaseModel):
    """Subscription information"""
    customer_id: str
    tier: str
    agent_type: str
    start_date: str
    integrations: list

class DashboardRequest(BaseModel):
    """Request for dashboard data"""
    customer_id: str
    tier: str
    agent_type: str
    requests_used: int
    integrations_active: int

# ============================================================================
# Mock Database (Replace with real DB)
# ============================================================================

# In production, this would be a real database
MOCK_CUSTOMERS = {
    "cust-001": {
        "customer_id": "cust-001",
        "company": "ShopExample Inc",
        "tier": "starter",
        "agent_type": "customer_service",
        "requests_this_month": 342,
        "integrations_active": ["shopify", "zendesk", "gmail"],
        "created_date": (datetime.now() - timedelta(days=15)).isoformat(),
        "monthly_requests_limit": 1000
    },
    "cust-002": {
        "customer_id": "cust-002",
        "company": "SaaS Startup Co",
        "tier": "growth",
        "agent_type": "virtual_assistant",
        "requests_this_month": 4200,
        "integrations_active": ["google_calendar", "gmail", "slack", "asana"],
        "created_date": (datetime.now() - timedelta(days=30)).isoformat(),
        "monthly_requests_limit": 10000
    }
}

# ============================================================================
# Authentication (Simple API Key for demo)
# ============================================================================

def verify_api_key(api_key: Optional[str] = None) -> str:
    """Verify API key (simplified for demo)"""
    if not api_key:
        raise HTTPException(status_code=401, detail="API key required")
    # In production, validate against DB
    return api_key

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "OrchestrAI Dashboard API"
    }

@app.get("/api/v1/dashboard/{customer_id}")
async def get_dashboard(customer_id: str, api_key: Optional[str] = None):
    """Get complete dashboard data for a customer"""
    
    # Verify API key
    verify_api_key(api_key)
    
    # Get customer
    if customer_id not in MOCK_CUSTOMERS:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer = MOCK_CUSTOMERS[customer_id]
    
    # Create metrics
    metrics = CustomerMetrics(
        customer_id=customer_id,
        tier=customer["tier"],
        requests_used=customer["requests_this_month"],
        integrations_active=len(customer["integrations_active"]),
        days_in_month=datetime.now().day
    )
    
    # Generate report
    report = calc.generate_transparency_report(metrics, customer["agent_type"])
    
    return {
        "customer": {
            "id": customer_id,
            "company": customer.get("company"),
            "tier": customer["tier"],
            "agent_type": customer["agent_type"]
        },
        "report": report,
        "integrations": customer["integrations_active"]
    }

@app.get("/api/v1/costs/{customer_id}")
async def get_costs_breakdown(customer_id: str, api_key: Optional[str] = None):
    """Get detailed cost breakdown"""
    
    verify_api_key(api_key)
    
    if customer_id not in MOCK_CUSTOMERS:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer = MOCK_CUSTOMERS[customer_id]
    
    metrics = CustomerMetrics(
        customer_id=customer_id,
        tier=customer["tier"],
        requests_used=customer["requests_this_month"],
        integrations_active=len(customer["integrations_active"]),
        days_in_month=datetime.now().day
    )
    
    costs = calc.calculate_actual_costs(metrics)
    margin = calc.calculate_margin(customer["tier"], metrics)
    
    return {
        "customer_id": customer_id,
        "costs": {
            "claude_api": round(costs.claude_api, 2),
            "hosting": round(costs.hosting, 2),
            "database": round(costs.database, 2),
            "integrations": round(costs.integrations, 2),
            "support": round(costs.support, 2),
            "infrastructure_overhead": round(costs.infrastructure_overhead, 2),
            "total": round(costs.total, 2)
        },
        "margin": {
            "revenue": round(margin["revenue"], 2),
            "total_cost": round(margin["total_cost"], 2),
            "gross_profit": round(margin["gross_profit"], 2),
            "gross_margin_pct": round(margin["gross_margin_pct"], 1),
            "net_profit": round(margin["net_profit"], 2),
            "net_margin_pct": round(margin["net_margin_pct"], 1)
        }
    }

@app.get("/api/v1/roi/{customer_id}")
async def get_roi_analysis(customer_id: str, api_key: Optional[str] = None):
    """Get ROI analysis for customer"""
    
    verify_api_key(api_key)
    
    if customer_id not in MOCK_CUSTOMERS:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer = MOCK_CUSTOMERS[customer_id]
    
    roi = calc.calculate_customer_roi(
        customer["agent_type"],
        customer["requests_this_month"]
    )
    
    return {
        "customer_id": customer_id,
        "agent_type": customer["agent_type"],
        "roi": {
            "hours_saved_per_month": round(roi["estimated_hours_saved"], 1),
            "value_of_work_automated": round(roi["value_of_work_automated"], 2),
            "monthly_cost": round(roi["monthly_cost"], 2),
            "net_monthly_roi": round(roi["net_monthly_roi"], 2),
            "roi_percentage": round(roi["roi_percentage"], 1),
            "payback_period_days": round(roi["payback_period_days"], 1),
            "annual_savings": round(roi["annual_savings"], 2)
        }
    }

@app.get("/api/v1/usage/{customer_id}")
async def get_usage_metrics(customer_id: str, api_key: Optional[str] = None):
    """Get usage metrics"""
    
    verify_api_key(api_key)
    
    if customer_id not in MOCK_CUSTOMERS:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer = MOCK_CUSTOMERS[customer_id]
    tier = calc.tiers[customer["tier"].lower()]
    
    usage_pct = (customer["requests_this_month"] / tier.included_requests) * 100
    
    return {
        "customer_id": customer_id,
        "tier": customer["tier"],
        "requests_used": customer["requests_this_month"],
        "requests_included": tier.included_requests,
        "usage_percentage": round(usage_pct, 1),
        "remaining_requests": max(0, tier.included_requests - customer["requests_this_month"]),
        "integrations_active": len(customer["integrations_active"]),
        "integrations_available": tier.integrations_included
    }

@app.get("/api/v1/tiers")
async def get_tier_comparison(api_key: Optional[str] = None):
    """Get tier comparison"""
    
    verify_api_key(api_key)
    
    return calc.get_tier_comparison()

@app.post("/api/v1/upgrade-recommendation/{customer_id}")
async def get_upgrade_recommendation(customer_id: str, api_key: Optional[str] = None):
    """Get upgrade recommendation"""
    
    verify_api_key(api_key)
    
    if customer_id not in MOCK_CUSTOMERS:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer = MOCK_CUSTOMERS[customer_id]
    
    metrics = CustomerMetrics(
        customer_id=customer_id,
        tier=customer["tier"],
        requests_used=customer["requests_this_month"],
        integrations_active=len(customer["integrations_active"]),
        days_in_month=datetime.now().day
    )
    
    recommended_tier, message, price = calc.get_upgrade_recommendation(metrics)
    
    return {
        "customer_id": customer_id,
        "current_tier": customer["tier"],
        "recommended_tier": recommended_tier,
        "message": message,
        "upgrade_price": price,
        "urgency": "high" if "URGENT" in message else "low"
    }

@app.get("/api/v1/invoice/{customer_id}")
async def get_invoice_preview(customer_id: str, api_key: Optional[str] = None):
    """Get invoice preview"""
    
    verify_api_key(api_key)
    
    if customer_id not in MOCK_CUSTOMERS:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer = MOCK_CUSTOMERS[customer_id]
    tier = calc.tiers[customer["tier"].lower()]
    
    return {
        "customer_id": customer_id,
        "invoice_date": datetime.now().isoformat(),
        "period": "February 2026",
        "line_items": [
            {
                "description": f"{tier.name} Plan",
                "details": f"Includes up to {tier.included_requests:,} requests/month",
                "amount": tier.monthly_price
            }
        ],
        "subtotal": tier.monthly_price,
        "tax": 0,
        "total": tier.monthly_price,
        "note": "No API overages - all costs included"
    }

# ============================================================================
# Admin Endpoints (For testing)
# ============================================================================

@app.get("/api/v1/admin/mock-customers")
async def list_mock_customers():
    """List all mock customers (admin only)"""
    return {
        "customers": [
            {
                "id": cid,
                "company": c.get("company"),
                "tier": c["tier"],
                "agent_type": c["agent_type"],
                "requests": c["requests_this_month"]
            }
            for cid, c in MOCK_CUSTOMERS.items()
        ]
    }

@app.post("/api/v1/admin/simulate-usage/{customer_id}")
async def simulate_usage(customer_id: str, requests: int):
    """Simulate usage (admin - for testing)"""
    if customer_id not in MOCK_CUSTOMERS:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    MOCK_CUSTOMERS[customer_id]["requests_this_month"] = requests
    
    return {
        "customer_id": customer_id,
        "new_requests": requests,
        "status": "simulated"
    }

# ============================================================================
# Startup Events
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Startup event"""
    print("🚀 OrchestrAI Dashboard API starting...")
    print(f"📊 Loaded {len(MOCK_CUSTOMERS)} mock customers")
    print("🔧 Cost calculator ready")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event"""
    print("🛑 OrchestrAI Dashboard API shutting down")

# ============================================================================
# Run Server
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*70)
    print("OrchestrAI Dashboard API")
    print("="*70)
    print("\nStarting server...")
    print("📍 http://localhost:8001")
    print("\n📚 API Docs: http://localhost:8001/docs")
    print("🧪 Admin Panel: http://localhost:8001/admin")
    print("\n✅ Ready to serve transparency reports")
    print("="*70 + "\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
