# CareerOS — Implementation Plan

Stack locked in for this plan: **Next.js/React dashboard, PostgreSQL + pgvector, Redis + BullMQ, Vertex AI (Gemini) as the sole model provider for v1, AWS S3 for storage, Docker/docker-compose for orchestration.**

Two companion files ship with this plan: `prisma/schema.prisma` and `docker-compose.yml` (plus `.env.example`). They're referenced throughout, not decorative — build against them directly.

---

## 0. Reality check before you build any of this

Stress-testing the original spec before treating it as a build target, because two parts of it will not survive contact with reality as written.

**LinkedIn and Wellfound have no public job-search API.** The spec's `LINKEDIN_COOKIE` env var implies session-cookie scraping. That's a ToS violation on both sides, it's the single most likely way to get the account that owns the cookie banned, and LinkedIn actively fingerprints and blocks this pattern — expect it to break every few weeks regardless of how well it's built. Greenhouse, Lever, and Ashby *do* have stable public job-board APIs (`boards-api.greenhouse.io`, `api.lever.co/v0/postings`, Ashby's public job API) — those three sources are safe to hit hourly. RemoteOK and WeWorkRemotely have RSS/JSON feeds. LinkedIn and Wellfound should be treated as a "best effort, may break, run it through a residential-proxy scraping service if you want it at all, and expect to disable it" tier — not load-bearing for the product. Recommendation: build the pipeline provider-agnostic (which the spec already does via `JobSource`), ship with Greenhouse/Lever/Ashby/YC/RemoteOK/WeWorkRemotely/GitHub Careers as the reliable tier, and gate LinkedIn/Wellfound behind a feature flag you can kill without redeploying.

**Hourly scanning across 9 sources plus hourly-to-continuous AI workers for match scoring, resume tailoring, cover letters, outreach drafting, open-source ranking, and social monitoring is a real, ongoing Vertex AI bill for a single-user tool** — this is not a one-time cost. There's no cap anywhere in the original spec. This plan adds a `DAILY_AI_SPEND_CAP_USD` guardrail and per-worker token budgets (below) — build the cap in from day one, not as a v2 add-on, because the failure mode without it is a worker stuck in a retry loop burning tokens overnight with nobody watching.

**Automated outreach and "automatic application submission" (listed as a future enhancement) are also reputational risk for the user, not just an engineering problem.** Drafting is fine; the schema below hardwires an `approvedByUser` gate on every outbound `Message` so nothing leaves the system without a human clicking send — keep that gate even under time pressure to ship the outreach worker faster.

**"Full audit trail" is good instinct but the original spec doesn't specify retention or a UI for it.** `WorkflowRun` / `WorkerAttempt` / `AIUsage` tables will grow fast at hourly cadence (roughly 9 sources × 24/day × dedup overhead, plus a row per AI call). Plan a retention/archival job from the start (e.g., collapse `WorkerAttempt` rows older than 90 days into daily rollups) rather than discovering the table is unqueryable in six months.

None of this blocks building the system — it means: build the reliable-source pipeline first, put the spend cap in the schema and the worker loop from day one, and treat LinkedIn/Wellfound and auto-apply as explicitly best-effort/manual-gated rather than core promises.

---

## 1. Repo structure

Monorepo (Turborepo or plain npm workspaces — either works; Turborepo pays off once you have 9 worker entrypoints sharing code):

```
careeros/
├── apps/
│   └── web/                 # Next.js 16 App Router dashboard + API routes
├── packages/
│   ├── db/                  # Prisma schema + generated client (prisma/schema.prisma lives here)
│   ├── foundry/              # Foundry Intelligence: provider abstraction, prompts, guardrails
│   ├── workers/               # 9 worker entrypoints + BullMQ queue definitions
│   │   ├── src/queues.ts     # queue name constants + BullMQ Queue instances
│   │   ├── src/scheduler.ts  # registers repeatable (cron) jobs on boot
│   │   ├── src/jobs/          # job-discovery worker
│   │   ├── src/analysis/
│   │   ├── src/resume/
│   │   ├── src/cover-letter/
│   │   ├── src/outreach/
│   │   ├── src/opensource/
│   │   ├── src/social/
│   │   ├── src/coach/
│   │   └── src/notifications/
│   ├── storage/              # S3 client wrapper (upload, signed URLs, key naming)
│   └── shared/                # types, zod schemas, logging (Winston), constants
├── prisma/schema.prisma       # (or packages/db/prisma — pick one, referenced here at repo root)
├── docker-compose.yml
├── Dockerfile.web
├── Dockerfile.worker
└── .env.example
```

Why one repo: workers and the dashboard both need the Prisma client, the Foundry client, and shared Zod schemas for structured AI output. Splitting repos now just means publishing an internal package for no benefit at single-user scale.

---

## 2. Database layer

`prisma/schema.prisma` (shipped alongside this plan) implements every entity from the original spec: `UserProfile`, `Company`, `JobListing`, `JobAnalysis`, `ResumeVersion`, `CoverLetter`, `Recruiter`, `Conversation` (+ `Message` for individual thread items, added because "Conversation" alone can't represent a back-and-forth thread), `ContributionOpportunity`, `PullRequest`, `SocialSignal` (added — the spec describes Stage 7 and a Social Feed dashboard module but never names its table), `CareerInsight`, `SkillGap`, `InterviewPrep`, `WorkflowRun`, `WorkerAttempt`, `AIUsage`.

Notable decisions baked into the schema:

- **pgvector, not a separate vector DB.** The spec calls for "PostgreSQL Full Text + Vector Search" — that means the `vector` extension inside the same Postgres instance, not Pinecone/Weaviate. `docker-compose.yml` uses the `pgvector/pgvector:pg16` image specifically because the stock `postgres` image does not ship the extension — this is the single most common setup mistake for this stack.
- **Dedup via `dedupeHash`** (hash of normalized title + company + description) with a unique constraint, plus a self-relation (`originalListingId`) so reposts are linked rather than silently dropped — the spec asks for repost *detection*, which implies keeping the relationship, not just filtering.
- **`approvedByUser` boolean on `Message`** — the human-in-the-loop gate discussed above. No worker sets this to `true`; only a dashboard action does.
- **`AIUsage` and `WorkerAttempt` are populated by Foundry and the queue wrapper respectively**, not by individual workers — see Sections 3–4. This keeps cost/audit tracking consistent instead of relying on 9 separate workers to remember to log it.

Migrations: `npx prisma migrate dev` locally, `npx prisma migrate deploy` in the `migrate` one-shot container (already wired in `docker-compose.yml` under the `tools` profile) — run it explicitly before starting workers on a fresh environment, don't rely on workers to self-migrate.

---

## 3. Foundry Intelligence (Vertex-only v1)

Foundry is the one internal package every worker imports instead of calling an AI SDK directly. Building it as an abstraction now — even though only Vertex is wired up — is what makes the spec's "provider-agnostic" claim true later without a rewrite.

```
packages/foundry/
├── src/
│   ├── provider.ts        # interface: complete(), embed(), stream()
│   ├── providers/
│   │   └── vertex.ts       # only implementation in v1
│   ├── prompts/             # versioned prompt templates per worker, e.g. match-scoring.v1.ts
│   ├── schemas/             # Zod schemas for every structured output (JobAnalysis, ResumeVersion metadata, etc.)
│   ├── guardrails.ts       # output validation, retry-with-repair, profanity/PII checks on outreach drafts
│   ├── cost-tracker.ts      # writes AIUsage rows, enforces DAILY_AI_SPEND_CAP_USD
│   └── client.ts            # public entrypoint: foundry.run(workerName, promptId, input, schema)
```

**Provider interface** — every call goes through the same shape regardless of provider:

```ts
interface AIProviderAdapter {
  complete(input: { model: string; prompt: string; schema?: ZodSchema }): Promise<{ text: string; structured?: unknown; usage: TokenUsage }>;
  embed(input: { model: string; text: string }): Promise<number[]>;
}
```

`vertex.ts` implements this against Vertex AI's Gemini models (`gemini-2.5-pro` for reasoning-heavy tasks like match analysis and resume tailoring, `gemini-2.5-flash` for cheap/high-volume tasks like dedup classification and social-signal triage, `text-embedding-005` for the `JobListing.embedding` / `UserProfile.embedding` vectors). Structured output uses Vertex's native JSON-schema-constrained generation rather than asking the model to "return JSON" in free text — that's what makes `JobAnalysis.rawModelOutput` reliably parseable.

**Retry/guardrail flow inside `client.ts`:**
1. Call provider with schema.
2. Validate against Zod schema → on failure, retry once with the validation error appended to the prompt ("repair" pattern), then fail the `WorkerAttempt` if it still doesn't validate.
3. Exponential backoff on 429/5xx from Vertex (BullMQ's built-in backoff handles the queue-level retry; Foundry handles the in-call retry).
4. On every call (success or failure), write an `AIUsage` row with token counts and estimated cost. Before making the call, check today's summed `costUsd` against `DAILY_AI_SPEND_CAP_USD` — if exceeded, throw a `SpendCapExceeded` error that the worker catches and reschedules for the next day rather than silently blocking.

**Adding a second provider later** means writing one more file in `providers/`, registering it in a provider map keyed by `FOUNDRY_PROVIDER`, and nothing in the 9 workers changes — they only ever call `foundry.run(...)`.

---

## 4. Queue & worker architecture

Nine BullMQ queues, one Redis instance, one container per queue (see `docker-compose.yml` — `worker-jobs`, `worker-analysis`, `worker-resume`, `worker-cover`, `worker-outreach`, `worker-opensource`, `worker-social`, `worker-coach`, `worker-notifications`), plus a `scheduler` container that registers BullMQ **repeatable jobs** (its cron equivalent) on boot instead of relying on OS cron — this keeps schedule state in Redis where BullMQ's dashboard tooling (Bull Board / Taskforce) can see it.

Standard worker wrapper (write this once in `packages/workers/src/lib/runWorker.ts`, every worker uses it):

```ts
async function runWorker(job: Job, handler: () => Promise<void>) {
  const run = await db.workflowRun.create({ data: { workflowType, status: 'RUNNING', triggeredBy: job.opts.repeat ? 'cron' : 'manual', startedAt: new Date() } });
  const attempt = await db.workerAttempt.create({ data: { workflowRunId: run.id, workerName, attemptNumber: job.attemptsMade + 1, status: 'RUNNING', startedAt: new Date() } });
  try {
    await handler();
    await db.workerAttempt.update({ where: { id: attempt.id }, data: { status: 'SUCCESS', finishedAt: new Date() } });
    await db.workflowRun.update({ where: { id: run.id }, data: { status: 'SUCCESS', completedAt: new Date() } });
  } catch (err) {
    await db.workerAttempt.update({ where: { id: attempt.id }, data: { status: 'FAILED', errorMessage: String(err), finishedAt: new Date() } });
    throw err; // let BullMQ's backoff/retry handle it; after maxAttempts it lands in the dead-letter queue
  }
}
```

BullMQ config per queue: `attempts: 5`, `backoff: { type: 'exponential', delay: 5000 }`, and a dead-letter queue per stage (BullMQ doesn't have DLQ built in — implement via a `failed` event listener that moves the job payload into a `<queue>-dead` queue after `attempts` exhausted). The dashboard's "manual retry" button re-enqueues from the dead queue.

**Queue-to-queue cascading** (the spec's "Push Next Queue" step): each worker, on success, enqueues the next stage's job with the relevant ID — e.g. `worker-analysis` on a `MATCHED` verdict pushes `{ jobListingId }` onto `resumeQueue`. On a rejection verdict, it stops the chain and just updates `JobListing.status = REJECTED_BY_AI`. This is plain application code, not a BullMQ feature — don't over-engineer a generic pipeline DSL for 9 fixed stages.

---

## 5. Per-worker implementation notes

| Worker | Trigger | External calls | Vertex model | Writes |
|---|---|---|---|---|
| Job Discovery | hourly cron | Greenhouse/Lever/Ashby JSON APIs, YC/RemoteOK/WWR feeds, GitHub Careers API; LinkedIn/Wellfound behind feature flag | none (no AI needed for scraping/normalizing) | `Company`, `JobListing` (status `DISCOVERED`) |
| AI Match | on new `JobListing` | none | `gemini-2.5-pro` (reasoning), `text-embedding-005` (pre-filter via cosine similarity before the expensive call — don't send every listing to Gemini, embed-and-threshold first) | `JobAnalysis`, updates `JobListing.status` |
| Resume Tailoring | on `MATCHED` | S3 (read master resume, write PDF/DOCX) | `gemini-2.5-pro` | `ResumeVersion` |
| Cover Letter | on `ResumeVersion` created | S3 | `gemini-2.5-flash` (lower-stakes generation, 4 variants) | `CoverLetter` |
| Outreach | on cover letter ready, or manual trigger | LinkedIn/GitHub public profile lookup, company site | `gemini-2.5-flash` for drafting | `Recruiter`, `Conversation`, `Message` (draft only, `approvedByUser=false`) |
| Open Source | daily cron | GitHub Trending/Search API, "good first issue" label search | `gemini-2.5-pro` for solution plans | `ContributionOpportunity` |
| Social Signal | every 30 min (configurable, see `.env.example`) | GitHub, Reddit, Dev.to public APIs; X/LinkedIn only if a paid API or existing connector is available — public scraping of X is unreliable post-API-lockdown | `gemini-2.5-flash` for classification | `SocialSignal` |
| Career Coach | weekly cron (Monday 08:00) | aggregates internal data only | `gemini-2.5-pro` | `CareerInsight`, `SkillGap` |
| Notifications | on any terminal event | Resend/SMTP | none | (no DB writes beyond a sent-log if you want one) |

The embed-and-threshold step called out for AI Match matters in practice: without it, every discovered listing gets a full Gemini call, which is most of the ongoing cost. Compute `UserProfile.embedding` once (recompute on profile edit), compute `JobListing.embedding` at discovery time, and only send listings above a cosine-similarity threshold (tune empirically, start around 0.55–0.6) to the expensive structured-analysis call. This is the single highest-leverage cost control in the whole system.

---

## 6. Storage layout (S3)

Bucket: `STORAGE_BUCKET` (see `.e n .example`). Key structure:

```
resumes/master/{userProfileId}.pdf
resumes/versions/{resumeVersionId}/resume.pdf
resumes/versions/{resumeVersionId}/resume.docx
cover-letters/{coverLetterId}.pdf
artifacts/interview-prep/{interviewPrepId}.json
```

Use signed URLs (short-lived, generated on dashboard request) for anything served to the browser — don't make the bucket public. `packages/storage` wraps the AWS SDK v3 S3 client; workers never construct S3 keys inline, they call `storage.putResume(...)` etc. so the key convention lives in one place.

---

## 7. Auth & security

BetterAuth for the dashboard (single-user, but still worth real auth rather than a hardcoded bypass — this will eventually sit on a public-ish URL if deployed to a VPS). Secrets (Vertex service account JSON, AWS keys, GitHub token, LinkedIn cookie if used) live in `.env` / a mounted secrets file, never in the Postgres DB in plaintext beyond what `AIUsage`/`WorkerAttempt` need to reference (they store no secrets, only metadata).

---

## 8. Docker & deployment

`docker-compose.yml` (shipped) covers local/single-VPS deployment: Postgres (pgvector image), Redis, the Next.js `app`, a one-shot `migrate` service (`--profile tools`), the `scheduler`, and all 9 worker containers. `Dockerfile.web` and `Dockerfile.worker` aren't included here since they're standard multi-stage Node Dockerfiles (`node:20-slim` build stage → `npm ci && npm run build`, runtime stage copies `node_modules` + `.next`/`dist`), but the layout above assumes their existence at repo root.

For actual production (as opposed to a single VPS running docker-compose): this architecture maps cleanly onto ECS Fargate or a small Kubernetes cluster later — each worker service becomes its own task definition/deployment — but don't build that now. Single-VPS docker-compose is the right call at single-user scale; migrating to ECS is a config change, not a rewrite, as long as the 12-factor boundaries (env-based config, stateless workers, everything in Postgres/Redis/S3) are respected, which this plan already does.

---

## 9. Build order

"Full system" doesn't mean "write all 9 workers simultaneously" — code has to land in an order where each piece is testable against something real:

1. Repo scaffold, `docker-compose up` with just Postgres/Redis running, Prisma schema + first migration.
2. `packages/foundry` against Vertex AI — get one real structured call working end-to-end (e.g. a throwaway "summarize this job description" call) before wiring it into any worker.
3. Job Discovery worker against Greenhouse/Lever/Ashby only (the reliable tier) — confirm dedup and normalization work before adding fragile sources.
4. AI Match worker (embedding prefilter + Gemini call) — this is the first place Foundry's guardrails/retry get exercised for real.
5. Resume Tailoring + Cover Letter — first S3 read/write path.
6. Dashboard: Jobs module + Overview, reading from the four models above — get a usable end-to-end loop (discover → match → tailor → view) before building anything else. This is the real MVP checkpoint even inside a "full plan," because everything after this point is easier to validate against a working core.
7. Outreach worker + CRM dashboard module (with the approval gate wired from the start).
8. Open Source worker + dashboard module.
9. Social Signal worker + Social Feed dashboard module.
10. Career Coach worker + Career Coach dashboard module.
11. Notifications, Settings (AI provider config, scan frequency, connected accounts), audit-trail views (`WorkflowRun`/`WorkerAttempt`/`AIUsage` as a debug/ops page).
12. Retention/archival job for audit tables; cost dashboard widget reading `AIUsage`.

---

## 10. Observability & error handling

Winston for structured logging (JSON in production, pretty-print in dev) — one logger instance per worker, tagged with `workerName` and `workflowRunId` so logs correlate with the `WorkflowRun`/`WorkerAttempt` audit trail. Quality gates per the original spec, concretely:

- Duplicate jobs: `dedupeHash` unique constraint (DB-level, not just application-level dedup logic — catches races between concurrent discovery runs).
- Resume/cover letter validation: Zod schema on Foundry's structured output plus a deterministic ATS-keyword-coverage check (not AI-judged) before marking a `ResumeVersion` ready.
- Email quality: guardrails.ts checks for placeholder text (`{{`, `[Company]` literal strings left unfilled), length bounds, before a `Message` is even shown to the user for approval.
- Worker retries: BullMQ `attempts`/`backoff` as described in Section 4.
- Dead-letter queues + manual retry: dashboard reads the `<queue>-dead` queues and re-enqueues on click.

---

## 11. Cost model (rough, for planning not billing)

At hourly discovery across the reliable-source tier plus embed-prefiltered match scoring, expect the dominant costs to be: Vertex AI tokens (bounded by `DAILY_AI_SPEND_CAP_USD`, tune per actual Gemini pricing at deploy time — check current rates, they change), S3 storage (trivial — resumes/cover letters are small files, this is cents/month), and a small always-on Postgres+Redis VPS (the only genuinely fixed cost). The spend cap is the only number that matters operationally; set it conservatively at first and raise it once you've watched a week of real `AIUsage` data.

---

## Files delivered with this plan

- `prisma/schema.prisma` — full data model
- `docker-compose.yml` — Postgres (pgvector), Redis, app, scheduler, 9 worker services, dev tools
- `.env.example` — every config var referenced above
 