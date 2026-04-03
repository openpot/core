---
description: Debugging protocol when a quality gate fails — structured escalation after 3 failures
---

# Openpot — Circuit Breaker

> **Emergency diagnostic protocol.** Executed when a quality gate fails repeatedly (3+ times) OR when pre-failure indicators trigger an early warning.

---

## 1. Pre-Failure Indicators (Warning State)

If any of the following conditions trigger during development or QA, you MUST halt and switch to a Warning State before a hard failure occurs:
- Test coverage drops by > 10%
- Lint errors are increasing iteration-over-iteration
- Dependency violations detected (Tier 2/3 used without approval)
- Repeated reviewer rejection (2+ rejections demanding the same fix)

**Action:** Halt development, log the warning in `/.studio/execution-state.md`, and notify the CEO. Do not proceed to the next stage.

---

## 2. Trigger Condition (Hard Failure)

Follow this protocol when code fails a quality gate (build, lint, typecheck, test, etc.). **No blind retries.** Every attempt must follow the debugging sequence below.

---

## Failure #1: Diagnose and Fix

1. **Read** — Capture the exact error message and full stack trace
2. **Isolate** — What is the minimum code that triggers this error?
3. **Hypothesize** — State a specific theory: "This fails because ___"
4. **Fix** — Apply a targeted fix that addresses ONLY the hypothesis
5. **Verify** — Re-run the failing check

If it passes → continue the pipeline.
If it fails → proceed to Failure #2.

---

## Failure #2: Step Back and Reconsider

1. **Read** — Is this the same error or a new one?
2. **If same error:** The first hypothesis was wrong. Re-read the PRD, relevant docs, and the surrounding code. Form a NEW hypothesis.
3. **If new error:** The first fix introduced a regression. Revert it and try a different approach.
4. **Document** — Log both failures in `.studio/qa-reports.md`:
   ```
   ## [Feature Name] — [Date]
   ### Failure 1
   - Error: [exact message]
   - Hypothesis: [what I thought]
   - Fix attempted: [what I did]
   - Result: [still failed / new error]
   
   ### Failure 2
   - Error: [exact message]
   - Hypothesis: [what I thought]
   - Fix attempted: [what I did]
   - Result: [still failed / new error]
   ```
5. **Fix** — Apply the revised approach
6. **Verify** — Re-run the failing check

If it passes → continue the pipeline.
If it fails → proceed to Failure #3 (HALT).

---

## Failure #3: HALT (Circuit Breaker Triggered)

**STOP ALL WORK IMMEDIATELY.**

1. Log the full failure chain in `.studio/qa-reports.md`:
   ```
   ### Failure 3 (CIRCUIT BREAKER TRIGGERED)
   - Error: [exact message]
   - Hypothesis: [what I thought]
   - Fix attempted: [what I did]
   - Result: FAILED
   - Why previous fixes didn't work: [analysis]
   ```

2. Post a structured escalation to `.studio/stakeholder-board.md`:
   ```
   ### QB[N]: Circuit Breaker — [Feature Name]
   
   The pipeline has failed 3 consecutive times at the [Gate Name] stage.
   
   **Error:** [exact error]
   **Attempts:** [summary of 3 attempts]
   **Root cause theory:** [best guess]
   
   **Options:**
   A) [Approach 1] — Pro: ___, Con: ___
   B) [Approach 2] — Pro: ___, Con: ___
   C) Abandon this approach entirely and redesign
   
   CEO: Please reply with QB[N]A, QB[N]B, or QB[N]C.
   ```

3. Notify: *"CEO, your board is updated. Circuit breaker triggered on [feature]."*
4. **Wait for CEO response before resuming any work.**

---

## Re-Entry After CEO Response

1. Apply the CEO's direction
2. Re-run from the **earliest affected stage** in the pipeline, not just the failing one
3. All subsequent stages must be re-passed
4. The failure counter resets to 0
