# AI Studio — Architecture Standard

> This document is the **permanent technical truth**. All implementation decisions derive from here.
> Updated: 2026-04-02 — Studio Constitution v2.1

---

## 2. Core Tech Stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 15.x | Full-stack usage. Server Route Handlers support background sync proof-of-work. |
| **UI Library** | React | 19.x | Component model, ecosystem |
| **Styling** | Tailwind CSS | v4 | Utility-first, purge-safe, design token integration |
| **Language** | TypeScript | 5.x | Strict mode, full type safety |
| **Runtime** | Node.js | 22 LTS | Stable, long-term support |
| **Package Manager** | pnpm | latest | Deterministic installs, disk-efficient |
| **Test Runner** | Vitest | latest | Fast, ESM-native, TypeScript-first |
| **Test Utils** | Testing Library | latest | Accessible-by-default component testing |
| **Linter** | ESLint (flat config) | 9.x | Code quality enforcement |
| **Formatter** | Prettier | latest | Consistent formatting |

> See `approved-dependencies.md` (in `.agents/rules/`) for the full audited dependency ledger.

---

## 3. Local-First Architecture

### 3.1 Design Principle

> **"The server never knows who you are or what you did."**

All user data lives exclusively on the client device. The server, if contacted at all, receives only **anonymous, aggregated counters** — never PII, session details, or device fingerprints.

### 3.2 Client-Side Storage

| Store | Technology | Purpose |
|---|---|---|
| **Session Queue** | IndexedDB (native API) | Durable, structured storage for session logs |
| **Settings / Preferences** | IndexedDB | Theme, units, locale |
| **Crypto Keys** | IndexedDB (non-extractable CryptoKey objects) | ECDSA P-256 keypairs for Proof-of-Witness |
| **Sync Queue** | IndexedDB (`pendingSyncQueue` table) | Offline write queue with status tracking |

> **No localStorage.** All structured data uses IndexedDB. See `code-conventions.md` (in `.agents/rules/`) for the security rationale.

### 3.3 Background Processing

| Component | Technology | Purpose |
|---|---|---|
| **Sync Worker** | Web Worker (dedicated) | Offload queue processing from main thread |
| **Service Worker** | Next.js PWA / Workbox | Offline caching, asset pre-caching |

### 3.4 Offline Queue Logic

```
1. User creates/edits a session
   → Written to IndexedDB IMMEDIATELY (optimistic UI)
   → UI reflects the change BEFORE sync

2. Entry enqueued in `pendingSyncQueue` with status `PENDING`
   → Timestamped with ULID (client-generated)

3. Web Worker monitors network state
   → Online: flushes queue (oldest first)
   → Offline: no-op, entries remain `PENDING`

4. Sync result:
   → Success: status → `SYNCED`, remove from queue
   → Failure: status stays `PENDING`, exponential backoff
   → Retry cap: 5 attempts, then status → `FAILED`

5. Conflict resolution:
   → Last-Write-Wins (LWW) with ULID timestamp as tiebreaker
   → Client always wins in a tie (local-first principle)
```

### 3.5 Data Flow Diagram

```
┌──────────────────────────────────────────────────┐
│                    CLIENT                         │
│                                                   │
│  ┌───────────┐     ┌──────────────┐              │
│  │  React UI │────▶│  IndexedDB   │              │
│  │(Optimistic│◀────│  (Sessions,  │              │
│  │    UI)    │     │   Settings,  │              │
│  └───────────┘     │   Keys,     │              │
│                    │   SyncQueue) │              │
│                    └──────┬───────┘              │
│                           │                      │
│                    ┌──────▼───────┐              │
│                    │  Web Worker  │              │
│                    │  (Sync)      │──── network ────▶  [Next.js Route Handlers (/api/...)]
│                    └──────────────┘              │
│                                                   │
│                    ┌──────────────┐              │
│                    │Service Worker│              │
│                    │  (Cache)     │              │
│                    └──────────────┘              │
└──────────────────────────────────────────────────┘
```

---

## 4. Zero-Knowledge Rules

> Canonical list in `studio-constitution.md §10`. Reproduced here for developer reference.

| # | Rule |
|---|---|
| **ZK-1** | No PII (name, email, phone, IP, device fingerprint) is ever transmitted |
| **ZK-2** | No server-side user accounts, authentication, or session tokens |
| **ZK-3** | Cryptographic keys are client-generated and `non-extractable` |
| **ZK-4** | Aggregated metrics use k-anonymity (k ≥ 5) before server submission |
| **ZK-5** | No third-party analytics, tracking pixels, CDN fonts, or telemetry |
| **ZK-6** | All dependencies are AGPL-3.0 compatible with zero telemetry |
| **ZK-7** | No external API calls that could leak user behavior patterns |
| **ZK-8** | All data-at-rest is under user's sole control (deletable, exportable) |

---

## 5. Cryptography

### 5.1 Keypair Generation (Proof-of-Witness)

```
Algorithm:    ECDSA
Curve:        P-256 (secp256r1)
API:          window.crypto.subtle
Key Usage:    ['sign', 'verify']
Extractable:  false
Storage:      IndexedDB (CryptoKey objects)
```

### 5.2 Hashing

```
Algorithm:    SHA-256
API:          window.crypto.subtle.digest
Use cases:    Content hashing for Proof-of-Witness stamps
```

> **No external crypto libraries.** Native Web Crypto API only.

---

## 6. PWA Configuration

| Property | Value |
|---|---|
| **Install Prompt** | Deferred, shown after 2nd visit |
| **Offline Support** | Full — all core features work without network |
| **Cache Strategy** | Stale-While-Revalidate (static), Network-First (API) |
| **Manifest** | `/public/manifest.webmanifest` |
| **Icons** | 192×192, 512×512 (maskable + any) |
| **Theme Color** | `hsl(152, 52%, 42%)` (brand green) |
| **Background Color** | `hsl(220, 16%, 8%)` (dark bg) |

---

## 7. Security Headers

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self';
  connect-src 'self';
  worker-src 'self';
  frame-ancestors 'none';

X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 8. Performance Budgets

> **Canonical list:** See `studio-constitution.md §18` for the binding performance targets.
>
> Summary: Lighthouse Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, FCP < 1.5s, TTI < 3.0s, LCP < 2.5s, JS bundle < 150 KB gzipped.

---

## 9. Git & CI Protocol

| Aspect | Standard |
|---|---|
| **Branching** | Feature branches off `main` (`feat/`, `fix/`, `chore/`, `docs/`) |
| **Branch Naming** | `feat/short-kebab-description` |
| **Commits** | Conventional Commits |
| **Merge Strategy** | Squash merge to `main` |
| **CI Pipeline** | GitHub Actions: Lint → Typecheck → Test → Build |
| **Telemetry Check** | CI verifies `npx next telemetry status` returns "disabled" |

---

## 10. Project Structure

```
project-root/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Lint → Typecheck → Test → Build
├── .agents/                       # AI rules & workflows (git-tracked)
│   ├── rules/
│   │   ├── studio-constitution.md # Supreme directive
│   │   ├── architecture.md        # ← this file
│   │   ├── design-system.md
│   │   ├── code-conventions.md
│   │   ├── checklists.md
│   │   └── approved-dependencies.md
│   ├── templates/
│   │   └── prd-template.md
│   └── workflows/                 # /session-start, /new-feature, etc.
├── .studio/                       # AI volatile state (gitignored)
│   ├── project-state.md
│   ├── data-dictionary.md
│   ├── stakeholder-board.md
│   ├── qa-reports.md
│   └── prds/                      # Active feature PRDs
├── public/
│   ├── manifest.webmanifest
│   ├── fonts/                     # Self-hosted WOFF2 files
│   ├── icons/                     # PWA icons (192, 512)
│   └── sw.js                      # Service Worker
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home page
│   │   ├── globals.css            # Global styles + design tokens
│   │   └── (routes)/              # Feature routes
│   ├── components/
│   │   ├── ui/                    # Primitives (Button, Input, Card)
│   │   └── features/             # Domain components (SessionCard, Timer)
│   ├── lib/
│   │   ├── crypto/                # Web Crypto wrappers
│   │   ├── db/                    # IndexedDB access layer
│   │   ├── sync/                  # Offline queue & sync logic
│   │   └── utils/                 # Shared utilities
│   ├── workers/                   # Web Worker scripts
│   ├── hooks/                     # Custom React hooks
│   ├── types/                     # TypeScript type definitions
│   └── styles/                    # Additional style modules
├── tests/                         # Integration / E2E tests
├── next.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── .env.example                   # Documented env vars (no secrets)
├── eslint.config.mjs              # ESLint flat config
├── .prettierrc
├── .gitignore
├── LICENSE                        # AGPL-3.0
├── NOTICE.md
└── README.md
```

---

## 11. Deployment Roadmap

### Phase 1 — Local Development (Current)

- `pnpm dev` runs the full app at `localhost:3000`
- All features work offline via Service Worker
- CI runs on push via GitHub Actions

### Phase 2 — Hosted Deployment (Future — CEO-triggered)

| Aspect | Plan |
|---|---|
| **Platform** | TBD (Vercel, Coolify, self-hosted — CEO decides) |
| **Environment Vars** | `.env.local` locally, platform secrets in production |
| **Docker** | Optional `Dockerfile` + `docker-compose.yml` for self-hosting |
| **SSL** | Mandatory (required for Service Worker + Web Crypto) |
| **Domain** | TBD |
| **Rollback** | Git revert + redeploy (no database migrations — local-first) |
| **Monitoring** | Privacy-respecting uptime check only (no user analytics) |
