---
description: Initialize a new session by reading the Memory Core and validating against the codebase
---

# Session Start

Run this workflow at the start of every new conversation about the project.

// turbo-all

## 1. Read the Constitution

Read the supreme directive first — it governs all behavior.

// turbo
```
cat .agents/rules/studio-constitution.md
```

## 2. Read Permanent Rules

Read all git-tracked project knowledge files.

// turbo
```
cat .agents/rules/architecture.md
```

// turbo
```
cat .agents/rules/design-system.md
```

// turbo
```
cat .agents/rules/code-conventions.md
```

// turbo
```
cat .agents/rules/approved-dependencies.md
```

// turbo
```
cat .agents/rules/checklists.md
```

## 3. Read Volatile State

Read session-specific operational documents (gitignored).

// turbo
```
cat .studio/project-state.md 2>/dev/null || echo "No project-state.md — initialize .studio/ first"
```

// turbo
```
cat .studio/data-dictionary.md 2>/dev/null || echo "No data-dictionary.md — initialize .studio/ first"
```

// turbo
```
cat .studio/stakeholder-board.md 2>/dev/null || echo "No stakeholder-board.md — initialize .studio/ first"
```

// turbo
```
cat .studio/qa-reports.md 2>/dev/null || echo "No qa-reports.md — initialize .studio/ first"
```

## 4. Check for Active PRDs

// turbo
```
ls -la .studio/prds/ 2>/dev/null || echo "No active PRDs"
```

## 5. Validate Against Codebase

Compare what the rules say should exist against what actually exists.

// turbo
```
if [ -f package.json ]; then
  echo "=== package.json exists ==="
  cat package.json | head -30
else
  echo "=== No package.json yet (project not scaffolded) ==="
fi
```

// turbo
```
if [ -d src ]; then
  echo "=== src/ structure ==="
  find src -type f -name "*.ts" -o -name "*.tsx" | head -50
else
  echo "=== No src/ directory yet (project not scaffolded) ==="
fi
```

## 6. Resume or Await

Based on project-state.md:
- If there is **active work**, provide a brief status update and continue the pipeline.
- If there are **open items** on the stakeholder board, remind the CEO.
- If there is **no active work**, respond: *"Studio initialized. CEO, what is our next vision statement?"*
