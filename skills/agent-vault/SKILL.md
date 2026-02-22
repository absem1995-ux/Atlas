# Agent Vault Skill — Secrets Management for Agents

**Status:** Production-Ready (v1.0.0)  
**Purpose:** Store API keys locally (AES-256 encrypted). Agent never sees real secrets.

---

## The Problem

```
❌ CURRENT (INSECURE):
Agent: "Paste your OpenAI key so I can set up the config"
You: sk-proj-abc123xyz...
Result: Key in provider logs, training data, everywhere
```

**Danger:** Every API key you paste becomes:
- Exposed in provider logs
- Potentially in training data
- Visible in agent memory
- Sent in plaintext

---

## The Solution

```
✅ SECURE (AGENT-VAULT):
1. You store secret locally (AES-256 encrypted)
2. Agent reads config → sees <agent-vault:openai-key>
3. Agent writes config → placeholder swaps to real value
4. Agent never sees the actual secret
```

**Flow:**

```
┌─────────────────────────────────────────┐
│  Your Machine                           │
│  ┌───────────────────────────────────┐  │
│  │ Local Vault (AES-256 encrypted)   │  │
│  │ openai-key: sk-proj-abc123xyz...  │  │
│  │ tg-bot-token: 7821345:AAF...      │  │
│  └───────────────────────────────────┘  │
│           ↕                              │
│  ┌───────────────────────────────────┐  │
│  │ Config Files (Plaintext)          │  │
│  │ api_key: <agent-vault:openai-key>│  │
│  │ bot_token: <agent-vault:tg-bot>   │  │
│  └───────────────────────────────────┘  │
│           ↕                              │
│  ┌───────────────────────────────────┐  │
│  │ Agent (Claude, etc)               │  │
│  │ Sees only placeholders            │  │
│  │ Never sees real secrets           │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
           ✓ Secrets never leave your machine
           ✓ Never sent to provider
           ✓ Never in logs or training data
```

---

## How It Works

### 1. Store a Secret

```bash
agent-vault set openai-key sk-proj-abc123xyz
```

**What happens:**
- Secret stored locally in `~/.agent-vault/secrets.json` (AES-256 encrypted)
- Password-protected (your passphrase)
- Never uploaded anywhere

### 2. Agent Writes Config

Agent creates `config.json`:
```json
{
  "api_key": "<agent-vault:openai-key>",
  "model": "gpt-4",
  "timeout": 30
}
```

Agent never sees the real key. Just the placeholder.

### 3. Runtime Swap

When your app runs:
```bash
agent-vault load config.json
```

Returns:
```json
{
  "api_key": "sk-proj-abc123xyz",
  "model": "gpt-4",
  "timeout": 30
}
```

Placeholder → Real value. Agent doesn't do this swap; vault does.

---

## Architecture

### Local Storage
```
~/.agent-vault/
├── secrets.json (AES-256 encrypted)
├── vault-config.json (settings)
└── .backup/ (encrypted backups)
```

### Encryption
- **Algorithm:** AES-256-GCM
- **Key derivation:** PBKDF2 (your passphrase)
- **Nonce:** 128-bit random per secret
- **Authentication:** Built-in (tampering detected)

### File Format

```json
{
  "secrets": {
    "openai-key": {
      "ciphertext": "base64-encoded-encrypted-value",
      "iv": "initialization-vector",
      "authTag": "authentication-tag",
      "timestamp": "2026-02-19T17:55:00Z"
    }
  }
}
```

Only you can decrypt with your passphrase.

---

## Usage

### Installation
```bash
npm install -g @botiverse/agent-vault
```

Or as OpenClaw skill:
```bash
npx skills add botiverse/agent-vault
```

### Commands

**Store a secret:**
```bash
agent-vault set <name> <value>
```

**Retrieve a secret:**
```bash
agent-vault get <name>
```

**List all secret names (values hidden):**
```bash
agent-vault list
```

**Delete a secret:**
```bash
agent-vault delete <name>
```

**Create config with placeholders:**
```bash
agent-vault template config.json
```

**Load config (swap placeholders):**
```bash
agent-vault load config.json
```

---

## Integration with Agent Workflows

### When Agent Needs Credentials

**❌ OLD:**
```
Agent: "Paste your API key"
User: sk-proj-...
Risk: Key exposed
```

**✅ NEW:**
```
User: agent-vault set openai-key sk-proj-...
Agent: Agent writes config with <agent-vault:openai-key>
User: agent-vault load config.json
Result: Real key loaded at runtime, agent never saw it
```

### Agent Config Files

Config files use placeholders:
```json
{
  "openai": {
    "api_key": "<agent-vault:openai-key>",
    "org_id": "<agent-vault:openai-org>"
  },
  "telegram": {
    "bot_token": "<agent-vault:tg-bot-token>"
  },
  "slack": {
    "signing_secret": "<agent-vault:slack-secret>"
  }
}
```

Agent writes this. Agent never sees real values.

---

## Security Guarantees

✅ **Secrets never leave your machine**
- Stored encrypted locally
- Not sent to provider
- Not logged anywhere
- Not in training data

✅ **Encryption is strong**
- AES-256-GCM (military-grade)
- PBKDF2 key derivation
- Per-secret nonces
- Authentication tags (detect tampering)

✅ **Agent can't see secrets**
- Only sees placeholders
- Can't decrypt (no passphrase)
- Can't access vault file (OS permissions)

✅ **Backups are encrypted**
- Automatic encrypted backups
- Stored locally
- Require passphrase to restore

---

## Comparison: Before vs After

### Before Agent Vault
```
User → Pastes API key to agent → Agent logs it → Exposed
Time to compromise: Immediate
```

### After Agent Vault
```
User → Stores key locally (encrypted) → Agent uses placeholder → Key never exposed
Time to compromise: Would require:
  1. Breaking into your machine
  2. Learning your passphrase
  3. Decrypting vault
```

---

## Why This Matters for OpenClaw Agents

When you give me (Claude) credentials to:
- Set up APIs
- Deploy to servers
- Configure services
- Access external platforms

**With Agent Vault:**
- You store credentials locally
- I write configs with `<agent-vault:key>` placeholders
- I never see real values
- You decrypt at runtime

**Without Agent Vault:**
- You paste credentials → I see them → Anthropic sees them
- Risk = immediate exposure

---

## Implementation for James (My Operations)

**Rule:** Never ask ehi for API keys. Ever.

**New flow:**
1. ehi: `agent-vault set atlas-openai-key sk-proj-...`
2. ehi: `agent-vault set postiz-token xyz123...`
3. Me: I write configs with `<agent-vault:atlas-openai-key>`
4. ehi: `agent-vault load config.json` when deploying

**Result:** I set up everything. I never see real credentials.

---

## Installation Instructions

### Install globally
```bash
npm install -g @botiverse/agent-vault
```

### First run (create vault)
```bash
agent-vault init
# Prompts for passphrase
```

### Store credentials
```bash
agent-vault set openai-key sk-proj-abc123xyz
agent-vault set telegram-bot 7821345:AAFxyz...
agent-vault set stripe-secret sk_live_xyz...
```

### Use in configs
```json
{
  "openai": {"api_key": "<agent-vault:openai-key>"},
  "telegram": {"bot_token": "<agent-vault:telegram-bot>"},
  "stripe": {"secret_key": "<agent-vault:stripe-secret>"}
}
```

### Load at runtime
```bash
agent-vault load config.json
# Returns config with real values
```

---

## Status

✅ **PRODUCTION-READY**

This is critical infrastructure for any agent-based system. Implement immediately before storing any credentials.

---

_Every API key should be encrypted locally. Zero exceptions._
