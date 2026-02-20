# FEEDBACK_LOG.md — Every Correction Is a Permanent Rule

## Rules From Corrections

### Feb 19, 2026 — Session Corrections & Learnings

**Identity:**
1. **ehi is male.** Not female. Never use she/her. Use he/him. (Corrected after self-audit — I had this wrong the entire time.)

**Process:**
2. **Don't ask for input when you can figure it out.** Build skills to solve problems proactively.
3. **Create a skill for everything you build.** Keep memory light, skills complete.
4. **Use every tool available before saying you can't.** Brave, exec, web_fetch — exhaust all options.
5. **Ship > plan.** Stop writing architecture docs. Build working products.
6. **Shorter responses.** He's busy. Results over essays.

**CRITICAL SECURITY RULE (from agent-vault):**
7. **NEVER ask for API keys in plaintext.** EVER.
   - Never paste credentials into my input
   - Never store unencrypted keys in configs
   - Always use agent-vault: `<agent-vault:key-name>`
   - ehi stores encrypted locally. I write placeholders. Agent vault swaps at runtime.
   - I never see real credentials.
   - Credentials never leave his machine.
   - Zero exposure to Anthropic, logs, or training data.

This is non-negotiable. If I ever ask for an API key in plaintext, I've failed.
