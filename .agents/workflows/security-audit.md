---
description: Run a full security audit against the codebase for ZK rule compliance
---

# Security Audit

Run this workflow to audit the current codebase for zero-knowledge rule compliance.

## 1. Scan for Network Calls

// turbo
```
echo "=== Scanning for fetch/XHR calls ===" && grep -rn "fetch(" src/ --include="*.ts" --include="*.tsx" || echo "No fetch calls found" && echo "" && grep -rn "XMLHttpRequest" src/ --include="*.ts" --include="*.tsx" || echo "No XHR calls found"
```

Review each result — does it transmit user data? Anonymous aggregated counters are OK. Any PII = **ZK-1 violation**.

## 2. Scan for localStorage Usage

// turbo
```
echo "=== Scanning for localStorage ===" && grep -rn "localStorage" src/ --include="*.ts" --include="*.tsx" || echo "No localStorage found — good"
```

Any result = **violation**. All structured data must use IndexedDB.

## 3. Scan for External Resources

// turbo
```
echo "=== Scanning for external URLs ===" && grep -rn "https\?://" src/ public/ --include="*.ts" --include="*.tsx" --include="*.html" --include="*.css" | grep -v "node_modules" | grep -v ".git" || echo "No external URLs found"
```

Review each result:
- CDN font links = **ZK-5 violation**
- External script tags = **ZK-5 violation**
- Third-party analytics = **ZK-5 violation**
- Self-referencing URLs (e.g., API routes to own domain) = OK if no user data

## 4. Scan for Dangerous Patterns

// turbo
```
echo "=== Scanning for eval/Function ===" && grep -rn "eval(" src/ --include="*.ts" --include="*.tsx" || echo "No eval found" && echo "" && grep -rn "new Function(" src/ --include="*.ts" --include="*.tsx" || echo "No Function constructor found"
```

Any result = **violation**. No dynamic code execution.

## 5. Verify Crypto Usage

// turbo
```
echo "=== Scanning for crypto imports ===" && grep -rn "crypto" src/ --include="*.ts" --include="*.tsx" | grep -v "window.crypto" | grep -v "crypto.subtle" | grep -v "// " || echo "All crypto references use Web Crypto API"
```

All crypto must use `window.crypto.subtle`. Any external crypto library = **ZK violation + dependency guardrail violation**.

## 6. Check CryptoKey Extractability

// turbo
```
echo "=== Scanning for extractable key generation ===" && grep -rn "extractable" src/ --include="*.ts" --include="*.tsx" || echo "No explicit extractable flag found — check generateKey calls manually"
```

All `generateKey` calls must have `extractable: false`.

## 7. Check Dependencies

// turbo
```
echo "=== Current dependencies ===" && if [ -f package.json ]; then cat package.json | grep -A 50 '"dependencies"' | head -50; else echo "No package.json"; fi
```

Cross-reference with `.agents/rules/approved-dependencies.md`. Any package not in the ledger = **unapproved dependency**.

## 8. Check CSP Headers

// turbo
```
echo "=== Scanning for CSP configuration ===" && grep -rn "Content-Security-Policy" src/ next.config.* --include="*.ts" --include="*.tsx" --include="*.mjs" 2>/dev/null || echo "No CSP configuration found — needs to be added"
```

## 9. Audit Summary

After running all scans, produce a summary:

```
Security Audit Summary — [DATE]
─────────────────────────────────
✅ / ❌  ZK-1: No PII transmitted
✅ / ❌  ZK-2: No server accounts
✅ / ❌  ZK-3: Non-extractable keys
✅ / ❌  ZK-4: k-anonymity (if applicable)
✅ / ❌  ZK-5: No 3rd-party tracking
✅ / ❌  ZK-6: AGPL-compatible deps
✅ / ❌  ZK-7: No behavior-leaking APIs
✅ / ❌  ZK-8: User data control

PASS / FAIL
```

If any item fails, document the exact violation and do not proceed past the Security stage in the `/new-feature` workflow.
