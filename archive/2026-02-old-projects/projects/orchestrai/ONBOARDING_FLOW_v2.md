# OrchestrAI Onboarding v2.0 - 15-Minute Installation

**Target Time:** 15 minutes from download to agents running  
**User Type:** Non-technical preferred  
**Format:** EXE installer with web wizard  
**Result:** Agents live + dashboard accessible

---

## 1. ONBOARDING FLOW (Step-by-Step)

### Step 0: Download (Before flow starts)

**User gets link:**
```
https://download.orchestrai.com/orchestrai-installer.exe
```

**Or:** Click "Download Agents" on dashboard.orchestrai.com

**EXE file:** orchestrai-installer-v2.0.exe (65 MB)
- Includes: Python runtime, agents, all dependencies
- No admin required (installs to user folder)
- Safe to download (signed, virus-scanned)

---

### Step 1: Welcome & Check (1 minute)

```
┌─────────────────────────────────────────┐
│  OrchestrAI Agent Installer             │
│  Welcome to Smart Automation            │
│                                         │
│  This will install OrchestrAI agents   │
│  on your computer and get them running │
│  in 15 minutes.                        │
│                                         │
│  [ System Check Running... ]            │
│  ✓ Windows 10/11 detected              │
│  ✓ 8GB RAM available                   │
│  ✓ 2GB disk space available            │
│  ✓ Internet connection: Fast           │
│                                         │
│  [ Next >]  [ Cancel ]                  │
└─────────────────────────────────────────┘
```

**What happens:**
- Check OS (Windows/Mac/Linux)
- Check RAM (need 2GB minimum)
- Check disk space (need 1GB for agents)
- Check internet (need for registration)
- Check Python (bundled, no install needed)

**If checks fail:**
- Show specific error
- Offer workaround or exit
- Log for support

---

### Step 2: Agent Selection (2 minutes)

```
┌─────────────────────────────────────────┐
│  Select Agents to Install               │
│                                         │
│  Choose which agents you need:          │
│                                         │
│  ☑ Customer Service Agent              │
│    Handles support, returns, refunds   │
│    Integrations: Shopify, Zendesk      │
│                                         │
│  ☐ Virtual Assistant Agent             │
│    Schedules, emails, tasks            │
│    Integrations: Google, Slack         │
│                                         │
│  ☐ Marketing Agent                     │
│    Content, campaigns, leads           │
│    Integrations: LinkedIn, Twitter     │
│                                         │
│  [Select All] [Deselect All]           │
│                                         │
│  [ Next >]  [ Back ]  [ Cancel ]       │
└─────────────────────────────────────────┘
```

**User choices:**
- Check at least 1 agent
- Can select 1, 2, or all 3
- Shows brief description
- Shows which integrations each uses

**User data:**
```python
selected_agents = ["customer_service"]  # or ["all"]
```

---

### Step 3: Integration Selection (2 minutes)

```
┌─────────────────────────────────────────┐
│  Select Integrations                    │
│                                         │
│  For Customer Service Agent:            │
│                                         │
│  ☑ Shopify Store                       │
│    [ Get API Key ]  [ Instructions ]   │
│                                         │
│  ☐ Zendesk Support Tickets            │
│    [ Get API Key ]  [ Instructions ]   │
│                                         │
│  ☐ Gmail Email                         │
│    [ Authenticate ] [ Instructions ]   │
│                                         │
│  ☑ Stripe Payments                     │
│    [ Get API Key ]  [ Instructions ]   │
│                                         │
│  [Next >] shows only selected           │
│                                         │
│  [ Next >]  [ Back ]  [ Cancel ]       │
└─────────────────────────────────────────┘
```

**User chooses:**
- Which integrations to enable
- Each has "Get API Key" button (opens instructions in browser)
- Or "Authenticate" for OAuth (Shopify, Gmail)

**User data:**
```python
selected_integrations = {
    "shopify": {
        "type": "oauth",
        "status": "not_configured"
    },
    "zendesk": {
        "type": "api_key",
        "status": "not_configured"
    }
}
```

---

### Step 4: Configure Credentials (5 minutes)

**For each integration:**

```
┌─────────────────────────────────────────┐
│  Shopify Connection                     │
│                                         │
│  Click to authenticate with Shopify:   │
│                                         │
│  [ Authenticate with Shopify ]          │
│                                         │
│  This will open your browser to        │
│  Shopify where you'll approve access.  │
│                                         │
│  Waiting for authentication...          │
│                                         │
│  [Back]  [Skip]  [Cancel]              │
└─────────────────────────────────────────┘
```

**OAuth flow (Shopify, Gmail):**
1. Click "Authenticate"
2. Browser opens to Shopify login
3. User logs in
4. Shopify asks "Allow OrchestrAI?"
5. User clicks "Allow"
6. Browser redirects back to installer
7. Installer confirms "✓ Connected"

**API key flow (Zendesk, Stripe):**

```
┌─────────────────────────────────────────┐
│  Zendesk API Configuration              │
│                                         │
│  Enter your Zendesk credentials:       │
│                                         │
│  Subdomain: [ support________ ]        │
│  Email:     [ admin@company... ]       │
│  API Token: [ **** paste here **** ]   │
│                                         │
│  [ Test Connection ]                    │
│  ✓ Connection successful!               │
│                                         │
│  [ Next >]  [ Back ]  [ Cancel ]       │
└─────────────────────────────────────────┘
```

**API key process:**
1. User goes to Zendesk → API tokens
2. Copies API token
3. Pastes into installer
4. Installer tests connection
5. Shows "✓ Connected" or error

**Error handling:**
- If connection fails: "Double-check your credentials"
- Offer to skip (can configure later)
- Can go back to fix

---

### Step 5: Configuration (2 minutes)

```
┌─────────────────────────────────────────┐
│  Agent Configuration                    │
│                                         │
│  Customer Service Settings:             │
│                                         │
│  Company Name: [ Company Inc______ ]   │
│                                         │
│  Return Window (days): [30]             │
│                                         │
│  Max Refund (no approval): [$100___]   │
│                                         │
│  Max Discount (%): [20]                │
│                                         │
│  Escalation Threshold: [High] ▼        │
│     (When to escalate to human)         │
│                                         │
│  [ Next >]  [ Back ]  [ Cancel ]       │
└─────────────────────────────────────────┘
```

**User configures:**
- Company name (for personalization)
- Business rules (return window, max refund)
- Escalation settings (when to ask human)

**Values saved:**
```json
{
  "company_name": "Acme Inc",
  "agent_settings": {
    "return_window_days": 30,
    "max_refund_no_approval": 100,
    "max_discount_pct": 20,
    "escalation_threshold": "high"
  }
}
```

---

### Step 6: Review & Install (1 minute)

```
┌─────────────────────────────────────────┐
│  Review & Install                       │
│                                         │
│  Ready to install:                      │
│                                         │
│  Agents:                                │
│  • Customer Service Agent               │
│                                         │
│  Integrations:                          │
│  • Shopify (✓ connected)               │
│  • Zendesk (✓ connected)               │
│  • Gmail (not configured)               │
│                                         │
│  Location:                              │
│  C:\Users\[User]\AppData\Roaming\      │
│  OrchestrAI                             │
│                                         │
│  [ Install & Start Agents ]             │
│                                         │
│  This will take 1-2 minutes...          │
│  [ Cancel ]                             │
└─────────────────────────────────────────┘
```

**Installation process:**
1. Create directories
2. Generate encryption key
3. Encrypt credentials
4. Create SQLite database
5. Initialize agents
6. Start local API server

---

### Step 7: Installation Progress (1 minute)

```
┌─────────────────────────────────────────┐
│  Installing...                          │
│                                         │
│  ✓ Creating directory structure         │
│  ✓ Initializing database                │
│  ✓ Encrypting credentials               │
│  ✓ Configuring agents                   │
│  ⟳ Starting local API server...         │
│                                         │
│  This shouldn't take long...            │
│  [ Cancel ]                             │
└─────────────────────────────────────────┘
```

**Behind scenes:**
```python
class Installer:
    def install(self):
        print("✓ Creating directory structure")
        self.create_directories()
        
        print("✓ Initializing database")
        self.init_database()
        
        print("✓ Encrypting credentials")
        self.encrypt_credentials()
        
        print("✓ Configuring agents")
        self.configure_agents()
        
        print("⟳ Starting local API server")
        self.start_api_server()
        
        print("✓ Registering with backend")
        self.register_with_backend()
        
        print("✓ Complete!")
```

---

### Step 8: Success & Launch (1 minute)

```
┌─────────────────────────────────────────┐
│  ✓ Installation Complete!               │
│                                         │
│  Your agents are now running!           │
│                                         │
│  Agent Status:                          │
│  • Customer Service: RUNNING            │
│  • Local API: http://localhost:8765     │
│  • Database: Connected                  │
│                                         │
│  What's next:                           │
│  1. Open your dashboard                 │
│  2. Test with a sample request          │
│  3. Configure advanced settings         │
│                                         │
│  [ Open Dashboard ] [ Close ]           │
│                                         │
│  Your agents are monitoring 24/7        │
│  Questions? Visit: help.orchestrai.com  │
└─────────────────────────────────────────┘
```

**Clicking "Open Dashboard":**
- Browser opens to: `https://dashboard.orchestrai.com/[customer_id]`
- Dashboard shows: agents running, no requests yet, ready to go
- Customer can test by sending a sample request

---

## 2. WHAT IF SOMETHING GOES WRONG?

### Error Scenarios

**Scenario 1: Integration auth fails**
```
❌ Shopify authentication failed

Possible reasons:
• Wrong API key
• API key revoked
• Token expired

[ Retry ] [ Skip for Now ] [ Get Help ]
```

**Scenario 2: Credentials invalid**
```
❌ Zendesk connection failed

Error: "401 Unauthorized"

Options:
[ Double-check credentials ] [ Get Help ] [ Skip ]
```

**Scenario 3: Port 8765 already in use**
```
❌ Can't start local API server

Port 8765 is already in use by another app.

Options:
[ Change Port ] [ Get Help ] [ Exit ]
```

**For each error:**
- Clear explanation
- Possible fixes
- Link to help docs
- Option to skip or retry

---

## 3. UNINSTALLATION

**User wants to uninstall:**

```
1. Delete folder: C:\Users\[User]\AppData\Roaming\OrchestrAI
2. Agents stop automatically
3. All data deleted (GDPR compliant)
4. System returns to normal
```

**Or via installer:**
```
Right-click orchestrai-installer.exe
→ Uninstall
→ Confirms deletion
→ Done
```

---

## 4. POST-INSTALLATION

### First Run Experience

After installation, customer sees dashboard with:

1. **Agents Status**
   - All agents: RUNNING ✓
   - Last synced: Just now
   - Health: Good

2. **Quick Start Guide**
   - "Send your first request"
   - "Configure integrations"
   - "Set up approval workflows"

3. **Sample Request**
   - Pre-filled example request
   - "Try this" button
   - Shows how agent responds

4. **Next Steps**
   - Link to documentation
   - Link to support
   - Link to advanced config

---

## 5. INSTALLATION VERIFICATION

Installer verifies everything works:

```python
def verify_installation():
    checks = {
        "agents_running": check_agents_status(),
        "api_server_responding": check_api_server(),
        "database_accessible": check_database(),
        "integrations_connected": check_integrations(),
        "backend_sync": check_backend_connection(),
    }
    
    if all(checks.values()):
        return "success"
    else:
        failed = [k for k, v in checks.items() if not v]
        show_error(f"Installation failed: {failed}")
        return "failed"
```

**If any check fails:**
- Show specific error
- Offer troubleshooting
- Option to contact support

---

## 6. UNATTENDED INSTALLATION (Optional)

**For technical users or IT departments:**

```bash
orchestrai-installer.exe /quiet /agents=cs,va /config=config.json
```

Options:
```
/quiet          - No UI, silent install
/agents=cs,va   - Install specific agents
/config=FILE    - Use config file (JSON)
/loglevel=debug - Verbose logging
```

Config file:
```json
{
  "company_name": "Acme Inc",
  "agents": ["customer_service", "virtual_assistant"],
  "integrations": {
    "shopify": {
      "api_key": "...",
      "shop_url": "..."
    },
    "zendesk": {
      "subdomain": "...",
      "email": "...",
      "api_token": "..."
    }
  }
}
```

---

## Timeline Summary

```
Download → Run EXE → Welcome (1min)
    ↓
Select Agents (2min) → Select Integrations (2min)
    ↓
Configure Credentials (5min) → Configure Settings (2min)
    ↓
Review (1min) → Install (1min) → Success (1min)
    ↓
Total: ~15 minutes
    ↓
Agents Running + Dashboard Live
```

**Key insight:** Installation is the first experience. Make it smooth and customers know they made the right choice.

Next: Skills needed to support this.
