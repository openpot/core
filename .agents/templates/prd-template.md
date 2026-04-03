# PRD Template

> Copy this template when starting a new feature.
> Save as: `/.studio/prds/<feature-name>.md`
> All sections are required unless marked (optional).

---

# PRD: [Feature Name]

**Author:** AI Agent
**Date:** YYYY-MM-DD
**Status:** Draft | In Design | In Security Review | Approved | In Build | In QA | Complete
**Branch:** `feat/<feature-name>`
**Slice:** N of M (if part of a multi-slice feature)

---

## 1. User Story

> As a [type of user],
> I want to [action/goal],
> so that [benefit/outcome].

---

## 2. Background & Context

_Brief explanation of why this feature matters. Reference the CEO's vision statement._

---

## 3. Acceptance Criteria

_Must be testable. Use Given/When/Then format._

```
AC-1: [Title]
  Given: [precondition]
  When:  [action]
  Then:  [expected result]

AC-2: [Title]
  Given: [precondition]
  When:  [action]
  Then:  [expected result]
```

---

## 4. Data Models

_Reference and/or update `/.studio/data-dictionary.md`. List all object stores, fields, and types touched by this feature._

### New Models
_(If any — define in `/.studio/data-dictionary.md` first)_

### Modified Models
_(If any — document the changes)_

---

## 5. Security & Privacy Review

_ZK rule compliance check. Must pass before proceeding to Build stage._

| ZK Rule | Compliant? | Notes |
|---|---|---|
| ZK-1 (No PII transmitted) | ✅ / ❌ | _explanation_ |
| ZK-2 (No server accounts) | ✅ / ❌ | _explanation_ |
| ZK-3 (Non-extractable keys) | ✅ / ❌ / N/A | _explanation_ |
| ZK-4 (k-anonymity) | ✅ / ❌ / N/A | _explanation_ |
| ZK-5 (No 3rd-party tracking) | ✅ / ❌ | _explanation_ |
| ZK-6 (AGPL-compatible deps) | ✅ / ❌ | _explanation_ |
| ZK-7 (No behavior-leaking API calls) | ✅ / ❌ | _explanation_ |
| ZK-8 (User data control) | ✅ / ❌ | _explanation_ |

**Security Review:** ☐ Pass / ☐ Fail (reason: ___)

---

## 6. UI Specification

_Describe the interface at wireframe level. Reference `/.agents/rules/design-system.md` tokens._

### 6.1 Components Involved

| Component | New/Existing | Description |
|---|---|---|
| `ComponentName` | New / Existing | _what it does_ |

### 6.2 States

| State | Description | Visual |
|---|---|---|
| Empty | No data yet | _description_ |
| Loading | Fetching from IndexedDB | _description_ |
| Populated | Data displayed | _description_ |
| Error | Something failed | _description_ |
| Offline | Device is offline | _description_ |

### 6.3 Responsive Behavior

| Breakpoint | Layout Change |
|---|---|
| Mobile (< 768px) | _description_ |
| Tablet (768px - 1024px) | _description_ |
| Desktop (> 1024px) | _description_ |

### 6.4 Accessibility Notes

_Specific ARIA labels, keyboard interactions, screen reader considerations._

---

## 7. Offline Behavior

_How does this feature work without a network connection?_

- **Data reads:** _(IndexedDB → UI, always available)_
- **Data writes:** _(Write to IndexedDB immediately, queue for sync)_
- **Sync on reconnect:** _(What happens when network returns?)_
- **Conflict resolution:** _(LWW with ULID tie-breaking)_

---

## 8. Test Scenarios

_Tests will be written against these scenarios during the QA stage._

| # | Scenario | Type | Priority |
|---|---|---|---|
| T-1 | _description_ | Unit / Component / Integration | P0 / P1 / P2 |
| T-2 | _description_ | Unit / Component / Integration | P0 / P1 / P2 |

---

## 9. Slice Breakdown (if multi-slice)

| Slice | Scope | Depends On | DoD |
|---|---|---|---|
| 1 | _what's included_ | — | _criteria_ |
| 2 | _what's included_ | Slice 1 | _criteria_ |

---

## 10. Open Questions (optional)

_Questions that need CEO input → move to `/.studio/stakeholder-board.md`_

---

## 11. Decision Log (optional)

_Record key decisions made during design/build._

| Date | Decision | Rationale | Decided By |
|---|---|---|---|
| YYYY-MM-DD | _what was decided_ | _why_ | AI / CEO |
