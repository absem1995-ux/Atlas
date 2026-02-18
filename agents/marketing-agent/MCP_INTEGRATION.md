# MCP Integration — Marketing Agent

**Status:** Ready for MCP Server Integration  
**Aligned with:** Anthropic's Model Context Protocol Standard

---

## What This Means

The Marketing Agent now explicitly references **three MCP servers** that can be integrated for enhanced functionality:

1. **Postiz MCP** — Real-time posting status + analytics
2. **Email MCP** — Report delivery to inboxes
3. **Slack MCP** — Team notifications (optional)

Each skill can use these MCPs to perform its work more efficiently.

---

## MCP Servers

### 1. Postiz MCP (Core)

**Purpose:** Multi-platform content posting and real-time analytics

**Tools Available:**
- `post_to_platform` — Post to TikTok, Instagram, YouTube, etc.
- `get_analytics` — Fetch real-time metrics (views, engagement, clicks)
- `schedule_post` — Schedule posts for specific times
- `list_scheduled_posts` — See what's queued
- `check_posting_status` — Verify if a post succeeded

**Used by Skills:**
- `atlas-schedule` — Posts content to Postiz
- `marketing-collect` — Fetches analytics from Postiz
- `marketing-analyze` — Queries performance data

**Setup:**
```bash
# Install Postiz MCP server locally
npm install @postiz/mcp-server

# Run in background
node_modules/.bin/postiz-mcp-server &

# Environment variable
export POSTIZ_API_KEY=your_key_here
```

**Example Usage (in skill):**
```javascript
// Atlas-schedule skill uses Postiz MCP to post
const postResult = await mcp.tools.post_to_platform({
  platform: 'tiktok',
  content: imageBuffer,
  scheduledTime: '2026-02-19T07:30:00Z',
  caption: 'Your caption here'
});
```

### 2. Email MCP (Optional)

**Purpose:** Send reports and notifications via email

**Tools Available:**
- `send_email` — Send single email
- `schedule_email` — Schedule email for later
- `email_with_attachment` — Send with files

**Used by Skills:**
- `marketing-report` — Sends daily digest emails
- `marketing-analyze` — Can send recommendations via email

**Setup:**
```bash
# Install Email MCP server
npm install @mcp-servers/email

# Environment variables
export EMAIL_PROVIDER=gmail          # or outlook, smtp
export EMAIL_ADDRESS=your@email.com
export EMAIL_PASSWORD=app_password   # use app password, not main password
```

**Example Usage:**
```javascript
// Marketing-report skill sends email
const reportResult = await mcp.tools.send_email({
  to: 'team@company.com',
  subject: 'Weekly Marketing Report — Week of Feb 18',
  body: reportHtml,
  attachments: [analyticsFile]
});
```

### 3. Slack MCP (Optional)

**Purpose:** Notify team of marketing progress

**Tools Available:**
- `send_message` — Direct message to user
- `post_to_channel` — Post in a channel
- `send_thread_reply` — Reply in a thread

**Used by Skills:**
- `marketing-report` — Posts digest to Slack channel
- `marketing-analyze` — Alerts on top performers

**Setup:**
```bash
# Install Slack MCP server
npm install @mcp-servers/slack

# Environment variable (Slack app token)
export SLACK_BOT_TOKEN=xoxb-...
```

**Example Usage:**
```javascript
// Marketing-report skill posts to Slack
const slackResult = await mcp.tools.post_to_channel({
  channel: '#marketing',
  text: 'Weekly report is ready! Top hook: "I spent 10 hours on X..."',
  blocks: [reportVisualization]
});
```

---

## How Skills Use MCPs

### Current Workflow (Before MCP)

```
Skill → API wrapper → External service
Example: marketing-collect → custom API code → Postiz API
```

### Optimized Workflow (With MCP)

```
Skill → MCP Server → External service
Example: marketing-collect → Postiz MCP → Postiz API
```

**Benefit:** Skills don't implement API logic. MCPs handle authentication, retries, error handling.

---

## Integration Roadmap

### Phase 1 (Now) — Documentation
- ✅ Identified MCPs in skill-graph.json
- ✅ Documented MCP tools available
- ✅ Showed how skills will use them

### Phase 2 (Week 2) — Build MCP Adapters
- [ ] Create `mcp-client.js` wrapper
- [ ] Implement Postiz MCP connection
- [ ] Test with real API calls
- [ ] Add Email + Slack MCP support

### Phase 3 (Week 3) — Integrate into Skills
- [ ] Update marketing-collect to use Postiz MCP
- [ ] Update atlas-schedule to use Postiz MCP
- [ ] Update marketing-report to use Email MCP
- [ ] Add optional Slack notifications

### Phase 4 (Week 4) — Production
- [ ] Full end-to-end testing
- [ ] Security validation
- [ ] Deploy with MCP support
- [ ] Documentation complete

---

## Example: Full Workflow with MCPs

```
User: "Generate and schedule 3 posts"

Agent Plan:
  1. atlas-generate
     → Uses OpenAI API directly (no MCP needed)
     → Output: 3 images + captions
  
  2. atlas-adapt-tiktok, atlas-adapt-instagram (parallel)
     → Uses local libraries (no MCP needed)
     → Output: platform-specific formats
  
  3. atlas-schedule
     → Uses Postiz MCP → schedules to platforms
     → MCP handles auth, retries, status checks
  
  4. marketing-collect (automatic nightly)
     → Uses Postiz MCP → fetches analytics
     → MCP handles API auth, data aggregation
  
  5. marketing-analyze
     → Uses collected data (local analysis)
     → No MCP needed
  
  6. marketing-report
     → Uses Email MCP → sends digest
     → Uses Slack MCP → posts to channel
     → MCPs handle delivery

Result: Posts scheduled, team notified, analytics collected — all automated
```

---

## Why MCPs Matter for Marketing Agent

1. **Standardization** — Same MCP server works with any AI tool (Claude, ChatGPT, Cursor, etc.)
2. **Reduced Code** — Skills don't implement API logic, MCPs do
3. **Security** — Centralized credential management
4. **Reliability** — Built-in retries, error handling, rate limiting
5. **Future-Proof** — When Anthropic upgrades MCP, skills work automatically

---

## For Developers: Building MCP Clients

If you want to use MCPs in the Marketing Agent:

```javascript
// mcp-client.js
const { Client } = require('@modelcontextprotocol/sdk/client');

class MCPClient {
  constructor(serverName, token) {
    this.serverName = serverName;
    this.client = new Client({
      name: 'marketing-agent',
      version: '1.0.0'
    });
    this.token = token;
  }

  async connect() {
    // Connect to MCP server
    await this.client.connect({
      server: this.serverName,
      auth: { token: this.token }
    });
  }

  async call(toolName, args) {
    // Call MCP tool
    return await this.client.tools.call(toolName, args);
  }
}

// Usage in skill
const postizMCP = new MCPClient('postiz', process.env.POSTIZ_API_KEY);
await postizMCP.connect();
const result = await postizMCP.call('post_to_platform', {...});
```

---

## Security Considerations

### Credential Management
- **Do NOT** commit MCP credentials to GitHub
- Use environment variables (`.env` file)
- Rotate API keys regularly
- Each MCP server gets its own token

### Permission Scoping
- Postiz MCP: Read + Write (needed for posting)
- Email MCP: Write-only (needs send permission)
- Slack MCP: Read + Write (for posting to channels)

### Audit Trail
- MCPs log all API calls
- Enable audit logging in production
- Monitor for unauthorized access

---

## Current Status

✅ **MCPs documented in skill-graph.json**  
✅ **MCP tool requirements specified**  
✅ **Integration roadmap created**  
⏳ **MCP adapter implementation** (Week 2)  
⏳ **Skill integration** (Week 3)  
⏳ **Production deployment** (Week 4)

---

## When MCPs Are Ready

When MCPs are integrated, the workflow becomes:

```bash
# Instead of managing APIs directly
POSTIZ_API_KEY=... EMAIL_PROVIDER=... node agents/marketing-orchestrator.js --run

# Agent handles everything:
# - Posts to Postiz (via MCP)
# - Fetches analytics (via MCP)
# - Sends emails (via MCP)
# - Posts to Slack (via MCP)
# All without custom API code
```

---

## Reference

- **MCP Spec:** https://modelcontextprotocol.io/
- **Anthropic MCP:** https://docs.anthropic.com/mcp/
- **Open Source Servers:** https://github.com/modelcontextprotocol/servers

---

**Marketing Agent is MCP-ready. MCPs are the next upgrade.**

