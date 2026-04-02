---
description: Propose, audit, and approve or reject a new npm dependency
---

# Add Dependency

Follow this workflow when any new npm package needs to be added to the project.

## 1. Check Pre-Approved List

Read `.agents/rules/approved-dependencies.md` — if the package is in the Pre-Approved list, install it without further audit.

// turbo
```
cat .agents/rules/approved-dependencies.md
```

## 2. Check if a Native Alternative Exists

Before proposing any dependency, answer these questions:
- Can this be done with **native Web APIs** (fetch, Intl, Web Crypto, ResizeObserver, IntersectionObserver, etc.)?
- Can this be done with **built-in React APIs** (useState, useReducer, useContext, useSyncExternalStore)?
- Can this be done with **Next.js built-in features** (Image, Font, Metadata, Route Handlers)?

If yes to any → **do not add the dependency**. Use the native approach.

## 3. Audit the Package

If a dependency is genuinely needed, evaluate:

- [ ] **License:** Is it AGPL-3.0 compatible? (MIT, BSD, ISC, Apache-2.0 = ✅)
- [ ] **Telemetry:** Does it phone home? Check source for analytics, error reporting, usage stats
- [ ] **Supply Chain:** How many transitive dependencies? Run `pnpm why <package>` after install
- [ ] **Bundle Size:** What's the gzipped production impact? Check bundlephobia.com
- [ ] **Maintenance:** Is it actively maintained? Last publish date? Open security issues?
- [ ] **Necessity:** Does the PRD require this, or is it a convenience?

## 4. Record the Decision

### If Approved

Add to the **Audited & Approved** table in `.agents/rules/approved-dependencies.md`:

```
| `package-name` | X.x | LICENSE | None/⚠ | Size | Security Audit | DATE | Notes |
```

Then install:
```
pnpm add <package-name>
```

### If Rejected

Add to the **Rejected** table in `.agents/rules/approved-dependencies.md`:

```
| `package-name` | Reason for rejection | DATE |
```

Then find and implement the native alternative.

### If Uncertain

Post to `.studio/stakeholder-board.md` with:
- Package name and purpose
- License concern
- Native alternative (if any)
- CEO decision needed: Approve / Reject

Notify: *"CEO, your board is updated."*
