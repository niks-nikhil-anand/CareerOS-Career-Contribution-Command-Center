# CareerOS

A self-hosted, single-user **command center for your job hunt**. CareerOS
automates the busywork of a job search — scanning boards, scoring matches,
tailoring resumes, drafting outreach, surfacing open-source contributions,
and coaching your search — all behind an AI layer called **Foundry
Intelligence**.

> **Status:** the Next.js app is scaffolded — all 8 modules are built as
> typed React components on the App Router, styled with the ported design
> system, and wired to a seeded mock-data layer (UI is fully interactive;
> real persistence, AI, and scanners are the remaining steps). The original
> interactive **design prototype** lives in [`public/prototype/`](public/prototype/),
> and the full build plan is in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

## Modules

- **Overview** — a bento dashboard of everything that moved while you were away.
- **Jobs** — automated watchers, AI match scores, and a full application
  pipeline (results, kanban tracker, tailored resumes & cover letters).
- **Open Source** — monitored repos with good-first-issues ranked by fit,
  plus AI-proposed solution plans.
- **Outreach** — find contacts, draft personalized emails, and track every
  conversation in a mini-CRM.
- **Social Feed** — hiring signals detected across your social accounts,
  with AI replies ready to go.
- **Career Coach** — weekly insights, skill-gap analysis, networking
  nudges, and interview prep.
- **Settings** — scans, connected accounts, and your AI provider + keys.

## Tech stack

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS v4** + TypeScript

> ⚠️ This is **not** the Next.js you may know — APIs and conventions differ
> from older versions. Read the relevant guide in
> `node_modules/next/dist/docs/` before writing code. See [AGENTS.md](AGENTS.md).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Preview the prototype

The prototype is a standalone, build-free React 18 app (UMD + Babel). Serve
it as static files and open `CareerOS.html`:

```bash
cd public/prototype && python3 -m http.server 8080
# then open http://localhost:8080/CareerOS.html
```

## Repository layout

```
app/                     Next.js App Router — root layout + one route per module
components/              Typed React components
  ui.tsx                   primitives (Btn, Badge, Card, Chip, MatchRing, …)
  charts.tsx               SVG charts (AreaChart, Sparkline, Funnel, Donut)
  overlays.tsx             SlideOver, Modal, ConfirmDialog, ToastHost + toast()
  layout.tsx               Page, PageHead, SectionTitle, AiTag, Field, Input…
  shell.tsx                AppShell (theme, SideNav, TopBar, router glue)
  modules/                 the 8 feature modules
lib/                     types.ts (domain types) + data.ts (seeded mock data)
public/prototype/        Interactive design prototype (source of truth for UI)
public/icons/            ~110 inline SVG icons used by <Icon>
IMPLEMENTATION_PLAN.md   Step-by-step plan to build the prototype into the app
AGENTS.md                Project conventions for AI agents / contributors
```

## Roadmap

The build is sequenced into 11 steps (design tokens → UI primitives → app
shell → data layer → onboarding → modules → AI → scanners → polish). See
[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for the full breakdown.
