# Openpot — Quality Checklists

> All quality gate checklists in one place.
> Referenced by the `/new-feature` workflow and `studio-constitution.md §9`.
> Last Updated: 2026-04-02

---

## 1. Design Checklist

Run during the **Design** stage of the pipeline.

- [ ] Uses only `design-system.md` tokens (colors, spacing, typography)
- [ ] Responsive across breakpoints: mobile (360px), tablet (768px), desktop (1280px)
- [ ] Dark mode supported via CSS custom properties
- [ ] Interactive elements have visible focus states
- [ ] Touch targets are ≥ 44×44px on mobile
- [ ] Loading/empty/error states are designed for every data-dependent view
- [ ] Optimistic UI: actions feel instant, sync happens in background
- [ ] Animations respect `prefers-reduced-motion`

---

## 2. Security Checklist (14 items)

Run during the **Security** stage of the pipeline. Also available as the `/security-audit` workflow for automated scanning.

- [ ] No `fetch()` / `XMLHttpRequest` calls transmitting user data
- [ ] No `localStorage` usage (IndexedDB only)
- [ ] No external script tags, CDN references, or remote font loading
- [ ] No Google Fonts, Adobe Fonts, or any font CDN (self-host all fonts)
- [ ] All crypto uses `window.crypto.subtle` exclusively
- [ ] CryptoKey objects use `extractable: false`
- [ ] No `eval()`, `Function()`, or dynamic code execution
- [ ] No `console.log` of sensitive data in production builds
- [ ] CSP headers block inline scripts and external origins
- [ ] Service Worker scope is properly restricted
- [ ] No telemetry, analytics, or error reporting to external services
- [ ] All dependencies in `approved-dependencies.md` with audit trail
- [ ] No IP address or User-Agent logging on any server endpoint
- [ ] Data export and delete functionality exists for all user data

---

## 3. Dev Self-Review Checklist

Run after **Build**, before passing to QA.

- [ ] TypeScript compiles with zero errors (`tsc --noEmit`)
- [ ] No `any` types (use `unknown` + type guards)
- [ ] All exported functions have JSDoc comments
- [ ] Error states are handled (no unhandled promise rejections)
- [ ] Code follows `code-conventions.md`
- [ ] Tests written for all new functions and components
- [ ] `data-dictionary.md` updated if schema changed

---

## 4. QA Checklist

Run during the **QA** stage. This is the final gate before CI.

- [ ] All acceptance criteria from PRD verified with tests
- [ ] `tsc --noEmit` passes (zero errors)
- [ ] `eslint . --max-warnings=0` passes
- [ ] `vitest run` passes (all tests green)
- [ ] Coverage ≥ 80% statements
- [ ] Feature works with DevTools "Offline" mode enabled
- [ ] Automated accessibility tests pass (`jest-axe` and `eslint-plugin-jsx-a11y`)
- [ ] No console errors or warnings in browser
- [ ] Optimistic UI verified: UI updates before sync completes
- [ ] All edge cases from PRD test scenarios covered
- [ ] Performance budgets met (Constitution §18)

---

## 5. CI Checklist

Run during the **CI** stage. Verifies the GitHub Actions pipeline.

- [ ] GitHub Actions workflow runs successfully
- [ ] Lint step passes
- [ ] Typecheck step passes
- [ ] All tests pass in CI environment
- [ ] Build completes without errors
- [ ] Bundle size is within budgets (Constitution §18)
- [ ] No new dependency warnings or vulnerabilities in `pnpm audit`

---

## 6. Offline Checklist

Run as part of QA to verify local-first behavior.

- [ ] App loads without any network connection
- [ ] All CRUD operations work while offline
- [ ] Data persists across page reloads while offline
- [ ] Sync queue populates with PENDING entries while offline
- [ ] When network returns, queue flushes automatically
- [ ] UI shows correct sync status indicators (pending/synced/error/offline)
- [ ] No errors thrown when offline (no unhandled fetch rejections)

---

## 7. Accessibility Checklist

Run as part of QA to verify WCAG 2.1 AA compliance. Checks are a mix of automated (`eslint-plugin-jsx-a11y` + `jest-axe`) and manual validation.

- [ ] Automated `axe-core` tests pass (via `jest-axe` in Vitest)
- [ ] ESLint `jsx-a11y` rules pass without warnings
- [ ] All interactive elements are keyboard-navigable (Tab, Enter, Escape)
- [ ] Visible focus indicators on all interactive elements
- [ ] Logical heading hierarchy (single h1, proper nesting)
- [ ] All images have meaningful `alt` text (or `alt=""` if decorative)
- [ ] All icons have `aria-label` or are `aria-hidden="true"` if decorative
- [ ] Color contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- [ ] `prefers-reduced-motion` is respected (no animations for users who disable them)
- [ ] Form inputs have visible labels (not just placeholder text)
- [ ] Error messages are associated with their input via `aria-describedby`
