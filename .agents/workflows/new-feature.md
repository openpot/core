---
description: Full pipeline from CEO vision statement to merged code — Plan, Design, Security, Build, QA, CI
---

# New Feature Pipeline

Follow this workflow sequentially when the CEO provides a vision statement. Each stage has explicit pass/fail criteria. Do not proceed to the next stage until the current one passes.

---

## Stage 1: Plan (PRD)
> **Required Persona:** Load `/.agents/team/product-manager.md` before executing.

**Goal:** Translate the vision statement into a structured PRD.

1. Copy the template from `.agents/templates/prd-template.md` to `.studio/prds/<feature-name>.md`.
2. Fill in ALL required sections (see the template for details).
3. Update `.studio/data-dictionary.md` FIRST if new schemas are needed.
4. Reference `/.product/design-system.md` tokens only for UI specification.
5. Decompose into vertical slices if the feature is large.
6. Present the PRD to the CEO for approval before proceeding.

**Pass criteria:**
- [ ] All PRD sections are complete
- [ ] Data models registered in `.studio/data-dictionary.md` if new
- [ ] Acceptance criteria are testable (no vague language)
- [ ] Slices are independent and shippable

**If the feature is ambiguous:** Write questions to `.studio/stakeholder-board.md` in multiple-choice format and notify the CEO.

---

## Stage 2: Design Review
> **Required Persona:** Load `/.agents/team/ux-designer.md` before executing.

**Goal:** Verify the UI specification is complete, accessible, and uses design system tokens.

1. Ensure the PRD contains tokenized values or complete design specs.
2. Run through the **Design Checklist** in `.agents/rules/checklists.md` (§1). Every item must pass.
3. Update `/.studio/execution-state.md`:
   - Set `ux = PASS`
   - Set `ux_accessibility = PASS`
   *(DO NOT PROCEED to Stage 3 until these guards are PASS).*

**If a token doesn't exist:** Add it to `/.product/design-system.md` first, then use it. Never use arbitrary values.

---

## Stage 3: Security & Architecture Audit
> **Required Persona:** Load `/.agents/team/security-engineer.md` before executing.

**Goal:** Verify zero-knowledge compliance before any code is written.

Run the `/security-audit` workflow, then verify against the **Security Checklist** in `.agents/rules/checklists.md` (§2). All 14 items must pass.

**If a ZK rule is violated:** The design must be changed. Do not proceed to Build.

---

## Stage 4: Build
> **Required Persona:** Load `/.agents/team/full-stack-developer.md` before executing.

**Goal:** Implement the feature according to the approved PRD.

1. Create a feature branch: `git checkout -b feat/<feature-name>`
2. Follow `.agents/rules/code-conventions.md` for all code
3. Write tests alongside implementation (co-located)
4. Update `.studio/data-dictionary.md` if schemas changed
5. Run through the **Dev Self-Review Checklist** in `.agents/rules/checklists.md` (§3).
6. Update `/.studio/execution-state.md`:
   - Set `code = PASS`
   - Set `pre_review_qa = PASS`
   *(DO NOT PROCEED to Stage 5 until these guards are PASS).*

---

## Stage 5: Code Review
> **Required Persona:** Load `/.agents/team/senior-reviewer.md` before executing.

**Goal:** Audit code structure without falling into infinite iteration loops.

1. Review the code against `/.agents/rules/architecture.md` and `code-conventions.md`.
2. Provide feedback. You have a **maximum of 2 rounds** to demand changes.
3. On the second review, if minor issues persist, approve with a "nit" or fix it yourself. Do not bounce it back.
4. Issue final Approval.

---

## Stage 6: QA & Documentation
> **Required Persona:** Load `/.agents/team/qa-engineer.md` before executing.

**Goal:** Verify the Definition of Done is fully met.

Run through the **QA Checklist** in `.agents/rules/checklists.md` (§4), plus the **Offline Checklist** (§6) and **Accessibility Checklist** (§7).

// turbo
```
pnpm tsc --noEmit
```

// turbo
```
pnpm eslint . --max-warnings=0
```

// turbo
```
pnpm vitest run --coverage
```

**If a check fails:** Follow the `/circuit-breaker` workflow.

---

## Stage 7: CI Wait & Gate
> **Required Persona:** Load `/.agents/team/qa-engineer.md` before executing.

**Goal:** Verify the CI pipeline passes on the remote.

1. Commit using Conventional Commits: `feat(<scope>): <description>`
2. Push the feature branch
3. Verify GitHub Actions passes: Lint → Typecheck → Test → Build

// turbo
```
git status
```

Run through the **CI Checklist** in `.agents/rules/checklists.md` (§5).

---

## Stage 8: Merge & Save State
> **Required Persona:** Load `/.agents/team/product-manager.md` before executing.

**Goal:** Merge to main, update state, notify CEO.

1. Squash merge the feature branch to `main`
2. Update `.studio/project-state.md` — mark the feature as complete
3. Update `.agents/rules/architecture.md` if any architectural decisions were made
4. Bump version in `package.json` if warranted
5. Update PRD status to `Complete`
6. Notify the CEO: *"CEO, [feature name] is complete. Here's the summary: ..."*
