# Test Results — Reddit Pain-Point Harvester

**Run:** 2026-02-20T02:03:11Z

| Test | Status | Details |
|------|--------|---------|
| Config valid JSON | ✅ PASS | agent-config.json parses correctly |
| Skill-map valid JSON | ✅ PASS | skill-map.json parses correctly |
| All skill dirs exist | ✅ PASS | 8/8 skill directories present |
| All run.sh exist | ✅ PASS | 8/8 run scripts present |
| No plaintext secrets | ✅ PASS | All credentials use agent-vault |
| Rate limiting | ✅ PASS | Max 10 requests/min |
| Outreach approval gate | ✅ PASS | require_approval_for_outreach=true |
| Post age limit | ✅ PASS | Max 48h posts |
| Log directory | ✅ PASS | logs/ exists |
| Memory directory | ✅ PASS | memory/ exists |

## Summary
- **Passed:** 10
- **Failed:** 0
- **Total:** 10

## Notes
- Live Reddit fetch test requires network access (run reddit-reader manually)
- Postiz integration test requires configured credentials
- End-to-end pipeline test: run orchestrator.sh
