/**
 * Atlas Mock Data
 * Realistic test data for all scripts in mock mode
 */

const mockConfig = {
  business: {
    name: "OpenClaw",
    description: "AI-powered workflow automation",
    audience: "Developers, entrepreneurs, automation enthusiasts",
    positioning: "Set-it-and-forget-it automation",
    website: "https://openclaw.ai",
    callToAction: "Join the Discord"
  },
  imageGeneration: {
    provider: "openai",
    model: "gpt-image-1.5",
    apiKey: "${OPENAI_API_KEY}",
    defaultResolution: "1024x1024"
  },
  postiz: {
    apiKey: "${POSTIZ_API_KEY}",
    workspace: "openclaw-test",
    integrationIds: {
      tiktok: "int_tiktok_test",
      instagram: "int_instagram_test",
      youtube: "int_youtube_test",
      linkedin: "int_linkedin_test",
      reddit: "int_reddit_test",
      facebook: "int_facebook_test"
    }
  },
  platforms: {
    tiktok: {
      enabled: true,
      username: "@openclaw",
      postingSchedule: ["07:30", "16:30", "21:00"],
      privacyLevel: "SELF_ONLY"
    },
    instagram: {
      enabled: true,
      username: "openclaw",
      postingSchedule: ["09:00", "18:00"]
    },
    youtube: {
      enabled: true,
      channelId: "UC_test",
      postingSchedule: ["12:00"]
    },
    linkedin: {
      enabled: true,
      postingSchedule: ["09:00", "14:00"]
    },
    reddit: { enabled: false },
    facebook: { enabled: false }
  }
};

const mockStrategy = {
  campaign: {
    name: "OpenClaw Launch",
    theme: "Workflow automation wins"
  },
  hooks: {
    narratives: [
      {
        id: "narrative_001",
        hook: "I spent 10 hours a week on repetitive tasks. Then I built this...",
        pattern: "Problem → Solution → Result",
        status: "testing"
      }
    ],
    tutorials: [
      {
        id: "tutorial_001",
        hook: "3 ways to automate your email management",
        steps: 3,
        status: "testing"
      }
    ],
    showcases: [
      {
        id: "showcase_001",
        hook: "Building a multi-agent system in 100 lines of code",
        status: "testing"
      }
    ]
  },
  contentCalendar: {
    postingFrequency: {
      tiktok: 3,
      instagram: 2,
      youtube: 1,
      linkedin: 2
    }
  }
};

const mockPost = {
  postId: "atlas_post_mock_001",
  hookId: "narrative_001",
  hookText: "I spent 10 hours a week on repetitive tasks. Then I built this...",
  createdAt: new Date().toISOString(),
  slides: [
    {
      slideNumber: 1,
      text: "10 hours per week → wasted on repetitive tasks",
      duration: 4
    },
    {
      slideNumber: 2,
      text: "Built an automation agent to handle it",
      duration: 3
    },
    {
      slideNumber: 3,
      text: "Now: 0 hours manually. Automated.",
      duration: 3
    }
  ],
  cta: "Join our Discord: discord.gg/clawd",
  platforms: ["tiktok", "instagram", "youtube", "linkedin"]
};

const mockAnalytics = {
  date: new Date().toISOString().split('T')[0],
  platform: "tiktok",
  posts: [
    {
      postId: "tiktok_post_001",
      hookId: "narrative_001",
      metrics: {
        views: 15420,
        likes: 823,
        comments: 156,
        shares: 42,
        completionRate: 0.78,
        engagement: 0.067
      },
      performance: "above_average"
    }
  ],
  platformStats: {
    totalViews: 187650,
    totalEngagement: 12456,
    avgEngagementRate: 0.065
  },
  insights: [
    "Narrative hooks outperforming tutorials 3.2x",
    "Best time: 7:30 AM UTC (42% higher views)",
    "Completion rate strong at 78%"
  ]
};

const mockPostizDraft = {
  success: true,
  draftId: `draft_mock_${Date.now()}`,
  platforms: ["tiktok", "instagram"],
  scheduledFor: new Date(Date.now() + 86400000).toISOString(),
  status: "scheduled",
  message: "[MOCK] Draft scheduled successfully"
};

const mockPlatformMetrics = {
  tiktok: {
    views: 15420,
    likes: 823,
    comments: 156,
    shares: 42,
    completionRate: 0.78
  },
  instagram: {
    reach: 8340,
    impressions: 12500,
    likes: 634,
    comments: 89,
    saves: 156,
    shares: 12
  },
  youtube: {
    views: 3200,
    avgDuration: 145,
    likes: 156,
    comments: 34,
    ctr: 0.032
  },
  linkedin: {
    impressions: 2340,
    clicks: 67,
    engagement: 34,
    followers: 23
  }
};

const mockHookPerformance = {
  narrative_001: {
    tests: 3,
    avgViews: 12100,
    avgEngagement: 0.067,
    status: "proven"
  },
  tutorial_001: {
    tests: 2,
    avgViews: 4200,
    avgEngagement: 0.089,
    status: "testing"
  },
  showcase_001: {
    tests: 3,
    avgViews: 9800,
    avgEngagement: 0.071,
    status: "testing"
  }
};

const mockDailyReport = {
  date: new Date().toISOString().split('T')[0],
  totalViews: 156420,
  avgEngagement: 0.082,
  topPerformers: [
    {
      postId: "tiktok_post_001",
      hook: "narrative_001",
      views: 48300,
      engagement: 0.12
    }
  ],
  underperformers: [
    {
      postId: "linkedin_post_001",
      hook: "tutorial_001",
      views: 850,
      engagement: 0.012
    }
  ],
  insights: [
    "Narratives outperforming tutorials 3.2x",
    "TikTok 7:30am slot strong; 9pm weaker",
    "Completion rates strong at 75%+"
  ],
  recommendations: [
    "Double down on narrative hooks",
    "Shift TikTok 9pm post to 2pm",
    "Skip tutorial format next week"
  ]
};

module.exports = {
  mockConfig,
  mockStrategy,
  mockPost,
  mockAnalytics,
  mockPostizDraft,
  mockPlatformMetrics,
  mockHookPerformance,
  mockDailyReport
};
