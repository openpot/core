---
description: Bootstrap the .studio/ volatile state directory on a fresh clone
---

# Initialize Studio

Run this workflow when `.studio/` does not exist (fresh clone or first setup). Creates all volatile state files with empty templates.

// turbo-all

## 1. Create the directory structure

```
mkdir -p .studio/prds
```

## 2. Create project-state.md

```
cat > .studio/project-state.md << 'EOF'
# Project State

> **Volatile "You Are Here" map.** Updated after every CI Gate pass.
> Last Updated: $(date +%Y-%m-%d) — Initialized

---

## Current Phase

| Field | Value |
|---|---|
| **Phase** | `0 — Studio Initialization` |
| **Status** | ⏳ In Progress |
| **Branch** | `main` |
| **Constitution Version** | 2.1.0 |

---

## Active Sprint

> _No active sprint. Awaiting first vision statement from CEO._

---

## Blockers

> _None._

---

## Next Actions

1. Run `/session-start` to load rules
2. Receive first vision statement from CEO
EOF
```

## 3. Create data-dictionary.md

```
cat > .studio/data-dictionary.md << 'EOF'
# Data Dictionary

> **The absolute schema truth.** All IndexedDB object stores and API shapes are defined here.
> No data model may be invented in code without first being registered in this document.
> Last Updated: $(date +%Y-%m-%d) — Initialized

---

## IndexedDB Database

| Property | Value |
|---|---|
| **Database Name** | `local-db` |
| **Version** | `1` |

---

## Object Stores

> _No object stores defined yet. Will be populated when the first feature is designed._

---

## API Payloads

> _No API payloads defined yet. All client-side at this stage._

---

## Type Definitions (TypeScript)

> _Will mirror the object stores above. Defined in `src/types/`._
EOF
```

## 4. Create stakeholder-board.md

```
cat > .studio/stakeholder-board.md << 'EOF'
# Stakeholder Board

> **CEO Decision Queue.** All questions requiring CEO input are batched here.
> Format: Multiple Choice or Yes/No with impact analysis.

---

## Open Items

> _No open items._

---

## Resolved Items

> _None yet._
EOF
```

## 5. Create qa-reports.md

```
cat > .studio/qa-reports.md << 'EOF'
# QA Reports

> **Quality Gate failure log.** Circuit Breaker triggers are logged here.
> If a gate fails 3 consecutive times, work halts and CEO intervention is requested.

---

## Reports

> _No QA reports yet. Pipeline has not run._
EOF
```

## 6. Confirm

```
echo "=== .studio/ initialized ===" && find .studio -type f | sort
```
