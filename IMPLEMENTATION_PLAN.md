# CareerOS — Implementation Plan

This document is the step-by-step plan to turn the design prototype in
[`public/prototype/`](public/prototype/) into a working Next.js
application.

> ⚠️ **Before writing any code**, read the relevant guide in
> `node_modules/next/dist/docs/`. This project runs **Next.js 16.2.6 +
> React 19 + Tailwind v4**, which has breaking changes vs. older versions.
> See [AGENTS.md](AGENTS.md).

---

## 1. What the prototype is

A self-hosted, **single-user** "command center" that automates a job
hunt. The AI layer is branded **Foundry Intelligence**. It is currently a
static, browser-rendered React 18 prototype (UMD + Babel, no build), with
all components hung on `window` and all data mocked.

### Modules (from the prototype)

| # | Module | Prototype file | Core capability |
|---|--------|----------------|-----------------|
| 1 | Onboarding / Login | `Onboarding.jsx` | PIN unlock, resume upload + parse, first watcher |
| 2 | Overview | `Overview.jsx` | Bento dashboard: glance cards, activity, insight, funnel |
| 3 | Jobs | `Jobs.jsx`, `Tracker.jsx` | Results, Watchers, Tracker (kanban + table) |
| 4 | Open Source | `OpenSource.jsx` | Monitored repos, ranked good-first-issues, AI plan |
| 5 | Outreach | `Outreach.jsx` | Contact finder, AI emails, mini-CRM, SMTP send |
| 6 | Social Feed | `Social.jsx` | Hiring-signal scanner + AI reply composer |
| 7 | Career Coach | `Coach.jsx` | Insights, skill gaps, nudges, interview prep |
| 8 | Settings | `Settings.jsx` | General, scans, connections, AI provider + keys |

### Shared infrastructure (from the prototype)

| Concern | Prototype file | Notes |
|---------|----------------|-------|
| UI primitives | `ui.jsx` | Icon, Logo, Btn, Badge, Chip, Card, Seg, Switch, Avatar… |
| Charts | `charts.jsx` | Sparkline, AreaChart, BarChart, MatchRing, Funnel |
| Overlays | `overlays.jsx` | SlideOver, Modal, ToastHost, ConfirmDialog, Tooltip |
| Layout | `layout.jsx` | Page, PageHead, SectionTitle, AiTag, Field, Input, Select |
| Shell | `SideNav.jsx`, `TopBar.jsx`, `App.jsx` | Nav, top bar, router |
| Styling | `careeros.css`, `app.css` | Design tokens (CSS vars), light/dark themes |
| Mock data | `data.jsx` | JOBS, WATCHERS, REPOS, ISSUES, CONTACTS, SOCIAL, COACH, ACTIVITY |
| Icons | `assets/icons/*.svg` | ~110 inline 16px SVG icons |

---

## 2. Target architecture

- **App Router** (`app/`), React Server Components by default; client
  components (`"use client"`) only where state/interactivity is needed.
- **Design tokens** ported from `careeros.css` into `app/globals.css`
  (Tailwind v4 `@theme`), so the existing look is preserved.
- **Data layer**: Prisma + SQLite (self-hosted, single-user friendly).
  Server Actions for mutations; route handlers (`app/api/*`) for
  webhooks/cron and AI streaming.
- **AI layer** ("Foundry Intelligence"): a provider-agnostic adapter
  (Claude / OpenAI / local) used for resume tailoring, match scoring,
  email/reply drafting, issue plans, and coaching insights. Default to the
  latest Claude model.
- **Background work**: scheduled scanners (job boards, GitHub, social)
  behind a queue/cron; for v1 a manual "Scan now" + cron route is enough.

```
app/
  layout.tsx                # root shell (theme, fonts)
  (auth)/unlock/page.tsx    # PIN gate
  onboarding/page.tsx
  (app)/
    layout.tsx              # SideNav + TopBar shell
    overview/page.tsx
    jobs/page.tsx
    opensource/page.tsx
    outreach/page.tsx
    social/page.tsx
    coach/page.tsx
    settings/page.tsx
  api/
    scan/route.ts           # trigger / cron
    ai/route.ts             # streaming AI endpoint
components/  ui/ charts/ overlays/ layout/ shell/
lib/        db, ai, scanners, auth, types
prisma/     schema.prisma
```

---

## 3. Step-wise plan

Each step is independently shippable and ends with a runnable app.

### Step 0 — Groundwork
1. Read `node_modules/next/dist/docs/` for App Router, Server Actions,
   route handlers, and metadata APIs.
2. Confirm scripts: `npm run dev`, `build`, `lint`.
3. Decide persistence (recommend Prisma + SQLite) and add deps.
4. **Done when:** `npm run dev` serves the boilerplate cleanly.

### Step 1 — Design system & tokens
1. Port CSS variables/themes from `careeros.css` + `app.css` into
   `app/globals.css` using Tailwind v4 `@theme`.
2. Wire `data-theme` (dark/light) on `<html>` with a theme toggle that
   persists to `localStorage`.
3. Move `assets/icons/*.svg` to `public/icons/`; build an `<Icon>`
   component (inline SVG, `currentColor`).
4. **Done when:** a sandbox page renders correct fonts, colors, and icons
   in both themes.

### Step 2 — Shared UI primitives → React/TS components
1. Convert `ui.jsx` → `components/ui/*` (Btn, Badge, Chip, Card, Seg,
   Switch, Avatar, IconBtn, EmptyState, Skeleton…), typed with props.
2. Convert `charts.jsx` → `components/charts/*` (Sparkline, AreaChart,
   BarChart, MatchRing, Funnel).
3. Convert `overlays.jsx` → `components/overlays/*` (SlideOver, Modal,
   ToastHost + `toast()`, ConfirmDialog, Tooltip). Mark client where needed.
4. Convert `layout.jsx` → `components/layout/*` (Page, PageHead,
   SectionTitle, AiTag, Field, Input, Select, Toolbar).
5. **Done when:** a component gallery route renders every primitive.

### Step 3 — App shell & routing
1. Build `SideNav`, `TopBar`, mobile tab bar/scrim from `App.jsx`,
   `SideNav.jsx`, `TopBar.jsx`.
2. Replace the `window`-based router with App Router routes + the
   per-route accent system (`ACCENT_BY_ROUTE`).
3. Implement `(app)/layout.tsx` wrapping all module pages.
4. **Done when:** navigating between empty module pages works with correct
   active states and accents.

### Step 4 — Data layer & seed
1. Define Prisma models: `User`/profile, `Resume`, `Job`, `Watcher`,
   `Repo`, `Issue`, `Contact`, `Outreach`, `SocialSignal`, `Activity`,
   `CoachStat`. Mirror the shapes in `data.jsx`.
2. Seed the DB from the prototype's mock data so screens have content.
3. Add typed data-access helpers in `lib/`.
4. **Done when:** module pages can read real (seeded) data via server
   components.

### Step 5 — Onboarding & auth (PIN)
1. Build PIN unlock + first-run flow (`Onboarding.jsx`): set/verify a
   4-digit PIN (hashed), resume upload, first watcher.
2. Gate the app behind the PIN (middleware/session cookie).
3. Resume upload → store file + parsed skills (stub parser first).
4. **Done when:** first run walks setup → app; return visits hit the PIN.

### Step 6 — Jobs module (the core)
1. Results: 3 card treatments (rich/card/compact), source filter, match
   sort, search.
2. Watchers: list, create modal, toggle active, "scan now".
3. Tracker: kanban (drag-and-drop status) + table view.
4. Job detail SlideOver: overview/keyword fit, cover letter, tailored
   resume tabs; status control; "apply & mark applied".
5. Persist status changes via Server Actions.
6. **Done when:** a job can move through the full pipeline and persist.

### Step 7 — Remaining modules
Port each, wiring to the data layer and AI stubs:
1. **Overview** — bento/column/feed layouts, glance cards, funnel, insight.
2. **Open Source** — repos, ranked issues, AI plan, progress notes,
   "working on it" toggle.
3. **Outreach** — contact finder, template-based AI drafts, CRM table,
   follow-up reminders, send (SMTP).
4. **Social Feed** — signal cards, AI reply composer, platform filters.
5. **Career Coach** — stats, charts, skill gaps, nudges, interview prep +
   voice recorder.
6. **Settings** — general, scans, connections, AI provider + key
   management.
7. **Done when:** every nav item is fully interactive against real data.

### Step 8 — AI layer ("Foundry Intelligence")
1. Build `lib/ai` provider adapter (Claude default; OpenAI/local optional),
   reading provider + key from Settings. **Use prompt caching.**
2. Implement: match scoring + rationale, resume tailoring, cover letters,
   outreach/reply drafting, issue solution plans, weekly coaching insight.
3. Stream long generations via `app/api/ai/route.ts`.
4. **Done when:** "Regenerate"/"Tailor"/"Draft" buttons hit real AI.

### Step 9 — Scanners & automation
1. Job-board scanners (LinkedIn/Indeed/Glassdoor/RSS) — start with RSS +
   stubs behind a common interface.
2. GitHub issue scanner (good-first-issues) and social signal scanner.
3. Schedule via `app/api/scan/route.ts` + cron; manual "Scan now" enqueues.
4. Notifications + activity timeline fed by real scan events.
5. **Done when:** a scheduled scan ingests new jobs and raises activity.

### Step 10 — Polish & ship
1. Loading/empty/error states, optimistic UI, toasts.
2. Responsive + a11y pass (keyboard, focus traps, aria).
3. SEO/metadata, favicon, manifest.
4. Self-host docs (env, DB, cron) + production build.
5. **Done when:** `npm run build` passes and the app is deployable.

---

## 4. Sequencing & dependencies

```
Step 0 → 1 → 2 → 3 → 4 ──┬─→ 5 (auth)
                         ├─→ 6 (jobs) ─→ 7 (modules) ─→ 8 (AI) ─→ 9 (scanners) ─→ 10
```

Steps 1–4 are foundational and largely sequential. Module work (6–7) can
parallelize once the data layer (4) lands. AI (8) and scanners (9) can
proceed in parallel once their target modules exist.

## 5. Open questions to confirm before building

- Persistence: Prisma + SQLite (recommended) vs. another store?
- Auth: PIN-only (matches prototype) vs. full accounts?
- AI default provider/model and where keys live (env vs. encrypted DB)?
- Which scan sources are in scope for v1 (RSS only vs. scraped boards)?
- Single-user only, or multi-tenant later?
