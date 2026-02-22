# Clawdtalk Skill — Voice & Phone for OpenClaw

**Status:** Research Complete — Ready to Install  
**Purpose:** Give OpenClaw a real phone number for calls and SMS  
**Website:** https://clawdtalk.com

---

## What It Does

Clawdtalk gives your OpenClaw agent a **real phone number** that can:
- **Receive calls** — People call your number, AI answers
- **Make calls** — Agent can call you ("call me in 5 minutes")
- **SMS handling** — Two-way texting from same number
- **Voice commands** — "Roll back prod", "check my calendar", etc.

---

## How It Works

```
[Caller] → [Phone Number] → [Telnyx] → [WebSocket] → [OpenClaw Agent]
              ↓
        [PIN Check] (optional)
```

**Setup:**
1. Install Clawdtalk skill
2. Register at clawdtalk.com
3. Get phone number + PIN (optional)
4. Start WebSocket connection
5. Done — agent can receive/make calls

---

## Security Analysis

### ✅ Security Features

| Feature | Status | Notes |
|---------|--------|-------|
| **PIN Protection** | ✅ Available | Optional, bcrypt hashed |
| **Caller ID Validation** | ✅ Enforced | Server-side verification |
| **WebSocket Connection** | ✅ Outbound only | No public exposure needed |
| **Private by Default** | ✅ Yes | Works behind NAT/firewall |
| **No PhD Required** | ✅ Simple | 5-minute setup |

### ⚠️ Considerations

| Concern | Mitigation |
|---------|------------|
| Phone number public | Use PIN for shared numbers |
| Voice commands could be abused | Require PIN confirmation for sensitive actions |
| Incoming calls could spam | Add call screening in agent config |
| SMS costs money | Set budget limits, monitor usage |

### 🔐 Recommended Configuration

```json
{
  "clawdtalk": {
    "enabled": true,
    "pin_required": true,
    "pin": "SET_STRONG_PIN_HERE",
    "caller_whitelist": ["+1234567890"],  // Your number
    "sensitive_actions_require_pin": true,
    "max_calls_per_day": 50,
    "max_sms_per_day": 100
  }
}
```

---

## Installation

```bash
# Register at clawdtalk.com
# Get your API credentials
# Install skill (if available via skill installer)
```

---

## Use Cases

- **Call agent directly** — "Hey, check production status"
- **Voice commands** — "Roll back to last stable"
- **SMS updates** — Agent texts you alerts
- **Receptionist** — AI answers, routes calls
- **Calendar by voice** — "Move my 3pm to tomorrow"

---

## Privacy Notes

- Calls processed by Telnyx (infrastructure provider)
- Optional PIN protects unauthorized access
- Can use dedicated number (paid) or shared (free)
- WebSocket keeps agent private (not publicly exposed)

---

## Comparison

| Feature | Clawdtalk | Alternatives |
|---------|------------|---------------|
| Setup time | 5 minutes | Hours |
| Cost | Free tier available | $50+/month |
| Latency | <200ms | 500ms+ |
| Integration | Native OpenClaw | Custom needed |
| SMS | ✅ Yes | Extra |

---

## Decision

**Recommendation:** ✅ Safe to install

- Security is reasonable (PIN + Caller ID)
- Benefits outweigh risks for personal/professional use
- Optional PIN protection is strong
- WebSocket model is secure

**Next step:** Register at clawdtalk.com and configure PIN.

---

*Researched: Feb 20, 2026*
