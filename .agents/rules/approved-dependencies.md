# Openpot — Approved Dependencies

> Ledger of all audited and approved npm packages.
> No package may be installed without appearing here first.
> Maintained via the `/add-dependency` workflow.
> Last Updated: 2026-04-01

---

## Pre-Approved (No Audit Required)

These are toolchain/devDependencies that do not ship to production and pose no privacy risk.

| Package | Type | Justification |
|---|---|---|
| `typescript` | devDependency | Language compiler |
| `eslint` | devDependency | Code linting |
| `@eslint/js` | devDependency | ESLint core rules |
| `eslint-config-next` | devDependency | Next.js ESLint rules |
| `prettier` | devDependency | Code formatting |
| `vitest` | devDependency | Test runner |
| `@testing-library/react` | devDependency | Component testing |
| `@testing-library/jest-dom` | devDependency | DOM assertions |
| `jsdom` | devDependency | Browser environment for tests |
| `eslint-plugin-jsx-a11y` | devDependency | Accessibility linting |
| `jest-axe` | devDependency | Automated a11y testing |
| `@axe-core/react` | devDependency | Automated a11y rendering checks |

---

## Audited & Approved (Production)

| Package | Version | License | Telemetry | Bundle Impact | Audited By | Date | Notes |
|---|---|---|---|---|---|---|---|
| `next` | 15.x | MIT | ⚠ Opt-out required | Framework | Security Audit | 2026-04-01 | Disable telemetry: `npx next telemetry disable` |
| `react` | 19.x | MIT | None | Framework | Security Audit | 2026-04-01 | — |
| `react-dom` | 19.x | MIT | None | Framework | Security Audit | 2026-04-01 | — |

> **Next.js Telemetry:** Next.js collects anonymous telemetry by default. This MUST be disabled during project initialization with `npx next telemetry disable`. Verified by CI.

---

## Rejected

| Package | Reason | Date |
|---|---|---|
| _(none yet)_ | — | — |

---

## Audit Checklist Template

When a new dependency is proposed, evaluate:

- [ ] **License:** Is it AGPL-3.0 compatible? (MIT, BSD, ISC, Apache-2.0 = ✅)
- [ ] **Telemetry:** Does it phone home? Check for analytics, error reporting, usage stats.
- [ ] **Supply Chain:** How many transitive dependencies? Any known vulnerabilities (`pnpm audit`)?
- [ ] **Bundle Size:** What's the gzipped production impact? (Use [bundlephobia.com](https://bundlephobia.com))
- [ ] **Maintenance:** Is it actively maintained? Last publish date? Open security issues?
- [ ] **Alternative:** Can this be done with native Web APIs instead?
- [ ] **Necessity:** Does the PRD require this, or is it a convenience?
