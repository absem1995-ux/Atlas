# OrchestrAI Marketing & Ad Strategy Skill

**Purpose:** Research advertising platforms, identify target communities, create ad copy, track placement effectiveness

**Use cases:**
- Find best places to advertise OrchestrAI
- Research Reddit communities (subreddits)
- Identify social media platforms + tactics
- Create platform-specific ad copy
- Track ad performance metrics
- Manage advertising budget allocation

---

## Skill Functions

### 1. Research Advertising Platforms
- Identify best channels for B2B SaaS
- Compare costs, reach, ROI per platform
- Find niche communities
- Analyze competitor advertising

### 2. Reddit Research
- Find relevant subreddits
- Analyze community rules + engagement
- Identify posting opportunities
- Create Reddit-specific copy

### 3. Social Media Strategy
- Platform selection (LinkedIn, Twitter, etc.)
- Audience targeting
- Content calendar
- Engagement tactics

### 4. Ad Copy Generation
- Platform-specific messaging
- A/B test variants
- Call-to-action optimization
- Pain point alignment

### 5. Performance Tracking
- Click-through rates (CTR)
- Conversion rates
- Cost per acquisition (CPA)
- ROI per platform

### 6. Budget Allocation
- Optimal spending per platform
- Test vs scale budget split
- Daily/weekly budget pacing

---

## Usage

```python
from ad_strategy import AdStrategySkill

skill = AdStrategySkill()

# Research advertising platforms
platforms = skill.research_platforms(
    product="OrchestrAI",
    target_market="B2B SaaS founders",
    budget=2000  # Monthly ad budget
)

# Find Reddit communities
subreddits = skill.find_subreddits(
    keywords=["AI", "SaaS", "automation", "founders"],
    min_subscribers=10000,
    engagement_rate_threshold=0.05
)

# Generate ad copy
ad_copy = skill.generate_ad_copy(
    platform="reddit",
    format="post",
    angle="pain_relief"
)

# Get recommendations
recommendations = skill.get_recommendations()
```

---

## Outputs

Returns:
- Platform rankings (best to worst for this product)
- Specific subreddit recommendations
- Ad copy templates
- Budget allocation recommendations
- Expected performance metrics

