# Conflict Resolution Protocol

## Authority Hierarchy
1. `studio-constitution.md`
2. Security Engineer
3. QA Engineer
4. Senior Reviewer
5. Product Manager

## Conflict Types
- Security vs Product
- UX vs Dev
- QA vs Dev

## Resolution Flow
1. **Detect conflict**: When two personas strongly disagree on an implementation detail.
2. **Log**: Record the dispute in `/.studio/stakeholder-board.md`.
3. **Assign**: Assign priority based on the Authority Hierarchy above.
4. **Notify**: Request stakeholder input if human tie-breaking is required.
5. **Start Timer**: A 4-hour resolution timer begins immediately.

## Timeout Rule (MANDATORY)
- If no human response is received within **4 hours**:
  → The higher-authority agent's decision is automatically enforced.

- If the conflict is between agents of equal authority:
  → The Senior Reviewer makes the final decision.

- If the Senior Reviewer is involved in the equal-authority conflict:
  → Escalate to the QA Engineer as the final arbiter.

## Enforcement
- `/.studio/execution-state.md` MUST be updated after a timeout resolution.
- The corresponding Blocker MUST be cleared or reassigned.
- The decision MUST be logged in `/.studio/decision-log.md`.

## Hard Rules
- **Security Violations** override ALL other concerns.
- **QA Failures** block deployment ALWAYS.
