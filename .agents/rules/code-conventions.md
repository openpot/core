# Openpot — Code Conventions

> Binding code style and pattern rules for all Openpot source code.
> Referenced by `studio-constitution.md` (Definition of Done, §9).
> Last Updated: 2026-04-02

---

## 1. Language & Tooling

| Tool | Config File | Purpose |
|---|---|---|
| TypeScript 5.x | `tsconfig.json` | `strict: true`, no `any` |
| ESLint | `eslint.config.mjs` | Flat config, Next.js plugin |
| Prettier | `.prettierrc` | Formatting |
| Vitest | `vitest.config.ts` | Unit + component tests |
| pnpm | `pnpm-lock.yaml` | Package manager |

---

## 2. File & Folder Naming

| Type | Convention | Example |
|---|---|---|
| **Directories** | `kebab-case` | `src/lib/crypto/` |
| **React Components** | `PascalCase.tsx` | `SessionCard.tsx` |
| **Component Tests** | `PascalCase.test.tsx` | `SessionCard.test.tsx` |
| **Hooks** | `use-kebab-case.ts` | `use-session-timer.ts` |
| **Hook Tests** | `use-kebab-case.test.ts` | `use-session-timer.test.ts` |
| **Utilities / Libs** | `kebab-case.ts` | `format-duration.ts` |
| **Types** | `kebab-case.ts` | `session.ts` (in `src/types/`) |
| **Workers** | `kebab-case.worker.ts` | `sync.worker.ts` |
| **Constants** | `kebab-case.ts` | `defaults.ts` |
| **Pages (App Router)** | `page.tsx` in route dir | `src/app/sessions/page.tsx` |
| **Layouts** | `layout.tsx` in route dir | `src/app/layout.tsx` |

---

## 3. Import Ordering

Imports are organized in groups, separated by blank lines. ESLint enforces this.

```typescript
// 1. React / Next.js
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// 2. External libraries (if approved)
import { render, screen } from '@testing-library/react';

// 3. Internal aliases (absolute paths via @/)
import { Button } from '@/components/ui/button';
import { useSessionTimer } from '@/hooks/use-session-timer';

// 4. Relative imports (same feature/module)
import { formatDuration } from './format-duration';
import type { Session } from './types';

// 5. Type-only imports (always last, always explicit)
import type { SessionStatus } from '@/types/session';
```

---

## 4. TypeScript Rules

### 4.1 Strict Mode
- `strict: true` in `tsconfig.json` — non-negotiable.
- `noUncheckedIndexedAccess: true` — array/object access returns `T | undefined`.

### 4.2 No `any`
- Use `unknown` + type narrowing instead of `any`.
- The only exception is typing third-party library overrides (rare, must be commented).

### 4.3 Type Exports
- Always use `export type` for type-only exports.
- Always use `import type` for type-only imports.

### 4.4 Enums
- **Do not use TypeScript enums.** Use `as const` objects + derived types:

```typescript
export const SESSION_STATUS = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
} as const;

export type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];
```

### 4.5 Nullability
- Prefer `undefined` over `null` for optional values.
- Use `null` only when an explicit "empty" state is semantically meaningful (e.g., "no selection" vs "not yet loaded").

---

## 5. React Component Patterns

### 5.1 Component Structure

```typescript
// SessionCard.tsx

import type { Session } from '@/types/session';

// --- Types ---
interface SessionCardProps {
  session: Session;
  onDelete?: (id: string) => void;
}

// --- Component ---
export function SessionCard({ session, onDelete }: SessionCardProps) {
  // 1. Hooks (state, refs, context, custom hooks)
  // 2. Derived state / computations
  // 3. Event handlers
  // 4. Effects
  // 5. Render

  return (
    <article className="session-card" aria-label={`Session from ${session.date}`}>
      {/* ... */}
    </article>
  );
}
```

### 5.2 Rules
- **Named exports only** — no default exports (except App Router pages, which require them).
- **Function declarations** — `export function Component()` not `export const Component = () =>`.
- **Props interface** — always a named interface, not inline type.
- **No barrel exports** — import directly from the file, not from `index.ts` re-exports.
- **Co-located tests** — `ComponentName.test.tsx` next to `ComponentName.tsx`.
- **`"use client"` directive** — required at the top of any UI component that interacts with `IndexedDB`, `Web Worker`, or local state hooks.

### 5.3 Hooks
- Custom hooks go in `src/hooks/`.
- Hook names always start with `use`.
- Each hook in its own file: `use-session-timer.ts`.
- Return objects (not arrays) for hooks with 3+ return values.

---

## 6. Error Handling

### 6.1 Async Functions
- Always use try/catch with specific error handling.
- Never let a Promise rejection go unhandled.

```typescript
async function saveSession(session: Session): Promise<Result<void>> {
  try {
    await db.sessions.put(session);
    return { ok: true, value: undefined };
  } catch (error) {
    console.error('[saveSession] IndexedDB write failed:', error);
    return { ok: false, error: 'Failed to save session' };
  }
}
```

### 6.2 Result Type Pattern
For operations that can fail, prefer a Result type over thrown exceptions:

```typescript
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };
```

### 6.3 Error Boundaries
- Wrap route-level components in React Error Boundaries.
- Error boundaries show a user-friendly message, not a stack trace.

---

## 7. State Management

- **No external state libraries** (no Redux, Zustand, Jotai, etc.).
- Use React built-in primitives: `useState`, `useReducer`, `useContext`.
- For complex shared state, use `useReducer` + Context.
- For server/async state: custom hooks wrapping IndexedDB reads.

---

## 8. Styling Rules (Tailwind v4)

Tailwind v4 uses a **CSS-first configuration** — no `tailwind.config.ts` needed.

### 8.1 Setup

Design tokens are defined directly in CSS using the `@theme` directive in `globals.css`:

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Map design-system.md tokens to Tailwind */
  --color-primary: hsl(152, 52%, 42%);
  --color-primary-hover: hsl(152, 52%, 36%);
  --color-accent: hsl(38, 85%, 55%);
  --color-bg-base: hsl(220, 16%, 8%);
  --color-bg-raised: hsl(220, 14%, 12%);
  /* ... all tokens from design-system.md */

  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}
```

### 8.2 Usage Rules

- Use Tailwind utility classes in JSX.
- **No `@apply`** — Tailwind v4 discourages it. Use utility classes directly or extract to React components.
- **No arbitrary values** in classes (e.g., no `w-[137px]`). If a token doesn't exist, add it to `@theme` first.
- All design tokens must come from `design-system.md` — define them in `@theme`, then use as utilities.
- Dark mode via the `dark:` variant (Tailwind v4 uses `prefers-color-scheme` by default, or override with a selector strategy if manual toggle is needed).

### 8.3 No `tailwind.config.ts`

Tailwind v4 does **not** use a JS/TS config file. All configuration happens in CSS:
- `@theme` — define tokens
- `@import "tailwindcss"` — load the framework
- `@source` — configure content paths (if needed beyond auto-detection)

---

## 9. Documentation

### 9.1 JSDoc
- All exported functions must have JSDoc comments.
- Include `@param` and `@returns` for functions with non-obvious signatures.
- Include `@example` for utility functions.

```typescript
/**
 * Formats a duration in milliseconds to a human-readable string.
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted string like "2h 15m" or "45s"
 *
 * @example
 * formatDuration(7500000) // "2h 5m"
 * formatDuration(45000)   // "45s"
 */
export function formatDuration(ms: number): string {
  // ...
}
```

### 9.2 Comments
- Explain **why**, not **what**.
- Use `// TODO:` for known improvements (must include a task reference).
- Use `// HACK:` for workarounds (must explain why and when it can be removed).
- Never commit `// FIXME:` — fix it or file it.

---

## 10. Git Commit Messages

Follow Conventional Commits:

```
<type>(<scope>): <short description>

[optional body — explain WHY, not WHAT]

[optional footer — breaking changes, references]
```

**Types:** `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`, `perf`, `ci`

**Scope:** feature area in kebab-case (e.g., `session-timer`, `offline-queue`, `crypto`)

**Examples:**
```
feat(session-timer): add pause/resume functionality
fix(offline-queue): prevent duplicate sync on reconnect
chore(deps): update vitest to 3.1.0
test(crypto): add keygen edge case coverage
```

---

## 11. Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Always use `@/` aliases for imports outside the current directory. Use relative imports (`./`) only within the same feature directory.
