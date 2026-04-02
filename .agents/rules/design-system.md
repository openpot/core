# Openpot — Design System

> The UI constitution. All visual decisions reference this document.
> No arbitrary values in code — use tokens defined here.
> Last Updated: 2026-04-01 — Initial Draft

---

## 1. Design Philosophy

- **Dark-first**: Dark mode is the primary palette. Light mode is the secondary variant.
- **Organic warmth**: Inspired by earth tones and botanical aesthetics — greens, ambers, warm neutrals.
- **Calm confidence**: The UI should feel trustworthy, private, and unhurried.
- **Content-forward**: Minimize chrome, maximize the user's data and actions.
- **Offline-aware**: Every UI state must account for offline: loading, stale data, pending sync, error.

---

## 2. Color Palette

### 2.1 Semantic Colors

All colors are defined as CSS custom properties on `:root` and `.dark` / `.light` selectors.

```css
/* --- Core Brand --- */
--color-primary:          hsl(152, 52%, 42%);    /* Forest green — trust, nature */
--color-primary-hover:    hsl(152, 52%, 36%);
--color-primary-subtle:   hsl(152, 40%, 92%);    /* Light mode tint */

--color-accent:           hsl(38, 85%, 55%);     /* Warm amber — energy, warmth */
--color-accent-hover:     hsl(38, 85%, 48%);

/* --- Neutral Scale (Dark Mode Primary) --- */
--color-bg-base:          hsl(220, 16%, 8%);     /* App background */
--color-bg-raised:        hsl(220, 14%, 12%);    /* Cards, panels */
--color-bg-overlay:       hsl(220, 14%, 16%);    /* Modals, dropdowns */
--color-bg-subtle:        hsl(220, 12%, 20%);    /* Hover states */

--color-border:           hsl(220, 10%, 22%);    /* Default borders */
--color-border-subtle:    hsl(220, 8%, 16%);     /* Subtle dividers */

/* --- Text --- */
--color-text-primary:     hsl(220, 10%, 94%);    /* Primary text */
--color-text-secondary:   hsl(220, 8%, 62%);     /* Secondary / muted text */
--color-text-tertiary:    hsl(220, 6%, 44%);     /* Disabled / placeholder */
--color-text-inverse:     hsl(220, 16%, 8%);     /* Text on primary buttons */

/* --- Feedback --- */
--color-success:          hsl(152, 60%, 42%);    /* Success states */
--color-warning:          hsl(38, 90%, 50%);     /* Warning states */
--color-error:            hsl(0, 72%, 56%);      /* Error states */
--color-info:             hsl(210, 70%, 55%);    /* Info states */

/* --- Sync Status (unique to Openpot) --- */
--color-sync-pending:     hsl(38, 90%, 50%);     /* Amber — waiting to sync */
--color-sync-synced:      hsl(152, 60%, 42%);    /* Green — synced */
--color-sync-error:       hsl(0, 72%, 56%);      /* Red — sync failed */
--color-sync-offline:     hsl(220, 8%, 44%);     /* Gray — offline, queued */
```

### 2.2 Light Mode Overrides

```css
.light {
  --color-bg-base:        hsl(40, 20%, 97%);
  --color-bg-raised:      hsl(0, 0%, 100%);
  --color-bg-overlay:     hsl(0, 0%, 100%);
  --color-bg-subtle:      hsl(40, 12%, 93%);
  --color-border:         hsl(40, 10%, 85%);
  --color-border-subtle:  hsl(40, 8%, 90%);
  --color-text-primary:   hsl(220, 16%, 12%);
  --color-text-secondary: hsl(220, 8%, 42%);
  --color-text-tertiary:  hsl(220, 6%, 60%);
}
```

---

## 3. Typography

### 3.1 Font Stack

```css
--font-sans:  'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono:  'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

> **Self-host all fonts.** No CDN loading (ZK-5 compliance). Download WOFF2 files to `/public/fonts/`.

### 3.2 Type Scale

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `--text-xs` | 0.75rem (12px) | 400 | 1.5 | Labels, captions |
| `--text-sm` | 0.875rem (14px) | 400 | 1.5 | Secondary text, metadata |
| `--text-base` | 1rem (16px) | 400 | 1.6 | Body text |
| `--text-lg` | 1.125rem (18px) | 500 | 1.5 | Subheadings |
| `--text-xl` | 1.25rem (20px) | 600 | 1.4 | Section headings |
| `--text-2xl` | 1.5rem (24px) | 700 | 1.3 | Page headings |
| `--text-3xl` | 2rem (32px) | 700 | 1.2 | Hero text |
| `--text-4xl` | 2.5rem (40px) | 800 | 1.1 | Display / splash |

---

## 4. Spacing Scale

A consistent 4px base unit.

| Token | Value |
|---|---|
| `--space-0` | 0 |
| `--space-1` | 0.25rem (4px) |
| `--space-2` | 0.5rem (8px) |
| `--space-3` | 0.75rem (12px) |
| `--space-4` | 1rem (16px) |
| `--space-5` | 1.25rem (20px) |
| `--space-6` | 1.5rem (24px) |
| `--space-8` | 2rem (32px) |
| `--space-10` | 2.5rem (40px) |
| `--space-12` | 3rem (48px) |
| `--space-16` | 4rem (64px) |
| `--space-20` | 5rem (80px) |

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 0.375rem (6px) | Inputs, small elements |
| `--radius-md` | 0.5rem (8px) | Cards, buttons |
| `--radius-lg` | 0.75rem (12px) | Modals, panels |
| `--radius-xl` | 1rem (16px) | Large containers |
| `--radius-full` | 9999px | Avatars, pills, badges |

---

## 6. Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px hsl(0 0% 0% / 0.06)` | Subtle elevation |
| `--shadow-md` | `0 4px 8px hsl(0 0% 0% / 0.1)` | Cards |
| `--shadow-lg` | `0 8px 24px hsl(0 0% 0% / 0.15)` | Modals, floating panels |
| `--shadow-glow` | `0 0 20px hsl(152 52% 42% / 0.2)` | Active / focus glow (brand) |

---

## 7. Responsive Breakpoints

| Token | Value | Target |
|---|---|---|
| `--bp-sm` | 360px | Small phones |
| `--bp-md` | 768px | Tablets |
| `--bp-lg` | 1024px | Small laptops |
| `--bp-xl` | 1280px | Desktops |

**Mobile-first approach:** Base styles target mobile. Use `min-width` media queries to scale up.

---

## 8. Animation & Motion

### 8.1 Timing

| Token | Value | Usage |
|---|---|---|
| `--duration-fast` | 100ms | Hover, focus states |
| `--duration-normal` | 200ms | Transitions, toggles |
| `--duration-slow` | 350ms | Modals, panels, page transitions |

### 8.2 Easing

| Token | Value | Usage |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Elements entering |
| `--ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Elements exiting |
| `--ease-in-out` | `cubic-bezier(0.45, 0, 0.55, 1)` | Continuous motion |

### 8.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Component Patterns

### 9.1 Buttons

| Variant | Background | Text | Border |
|---|---|---|---|
| **Primary** | `--color-primary` | `--color-text-inverse` | none |
| **Secondary** | transparent | `--color-text-primary` | `--color-border` |
| **Ghost** | transparent | `--color-text-secondary` | none |
| **Danger** | `--color-error` | white | none |

All buttons: `--radius-md` border radius, `--space-3` vertical padding, `--space-5` horizontal padding, `--text-sm` font size, `font-weight: 600`.

### 9.2 Cards

- Background: `--color-bg-raised`
- Border: `1px solid --color-border-subtle`
- Border radius: `--radius-lg`
- Padding: `--space-6`
- Shadow: `--shadow-sm` (default), `--shadow-md` on hover

### 9.3 Inputs

- Background: `--color-bg-base`
- Border: `1px solid --color-border`
- Border radius: `--radius-sm`
- Padding: `--space-3 --space-4`
- Focus: `--color-primary` border, `--shadow-glow`

### 9.4 Sync Status Indicator

A small dot or badge showing the sync state of a session entry:
- `PENDING` → pulsing amber dot
- `SYNCED` → static green dot
- `ERROR` → static red dot with tooltip
- `OFFLINE` → gray dot with "Queued" label

---

## 10. Iconography

- **Style:** Outline icons (not filled), 1.5px stroke weight
- **Size tokens:** 16px (inline), 20px (buttons), 24px (navigation), 32px (features)
- **Source:** Self-contained SVG components — no external icon CDN
- **Accessibility:** All icons must have `aria-label` or be marked `aria-hidden="true"` if decorative

---

## 11. Z-Index Scale

| Token | Value | Usage |
|---|---|---|
| `--z-base` | 0 | Default document flow |
| `--z-raised` | 10 | Sticky elements, floating buttons |
| `--z-dropdown` | 100 | Dropdowns, popovers |
| `--z-modal` | 1000 | Modal overlays |
| `--z-toast` | 2000 | Toast notifications |
| `--z-tooltip` | 3000 | Tooltips |
