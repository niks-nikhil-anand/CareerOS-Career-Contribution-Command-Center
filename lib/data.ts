/* ============================================================
   CareerOS — demo data (seed). Mirrors the prototype's data.jsx.
   In a later step this is replaced by a real data layer (Prisma).
   ============================================================ */
import type {
  ActivityItem,
  Coach,
  Company,
  Contact,
  Issue,
  Job,
  Repo,
  SocialItem,
  Watcher,
} from "./types";

export const COMPANIES: Record<string, Company> = {
  TechCorp: { color: "#3B82F6", loc: "Berlin, DE" },
  Nimbus: { color: "#22D3EE", loc: "Munich, DE" },
  Voltaic: { color: "#F59E0B", loc: "Hamburg, DE" },
  Meridian: { color: "#8B5CF6", loc: "Remote · EU" },
  Hearth: { color: "#10B981", loc: "Berlin, DE" },
  Northwind: { color: "#64748B", loc: "Cologne, DE" },
  Lumen: { color: "#A855F7", loc: "Remote · DE" },
  Orbital: { color: "#3B82F6", loc: "Frankfurt, DE" },
  Kettle: { color: "#EF4444", loc: "Leipzig, DE" },
};

const BASE_JOBS: Job[] = [
  { id: "j1", title: "Senior Software Engineer", company: "TechCorp", loc: "Berlin, DE", remote: "Hybrid", type: "Full-time", salary: "€85k–110k", posted: "2h ago", source: "LinkedIn", score: 94, status: "saved", tailored: true,
    rationale: "Strong React + TypeScript overlap; your fintech experience maps to their payments team. Missing: Kubernetes (mentioned 3×).",
    matched: ["React", "TypeScript", "Node.js", "GraphQL", "CI/CD"], missing: ["Kubernetes", "Go"],
    desc: "We're looking for a Senior Software Engineer to join our payments platform team. You'll design and ship resilient services handling millions of transactions, mentor engineers, and partner with product on the roadmap." },
  { id: "j2", title: "Frontend Engineer (React)", company: "Nimbus", loc: "Munich, DE", remote: "Remote", type: "Full-time", salary: "€70k–90k", posted: "5h ago", source: "Indeed", score: 88, status: "applied", tailored: true,
    rationale: "Excellent React/design-system fit. Their stack matches yours almost exactly.",
    matched: ["React", "TypeScript", "Design Systems", "Testing"], missing: ["Vue"],
    desc: "Join our platform team building the component library used across all Nimbus products." },
  { id: "j3", title: "Full-Stack Engineer", company: "Voltaic", loc: "Hamburg, DE", remote: "On-site", type: "Full-time", salary: "€75k–95k", posted: "1d ago", source: "LinkedIn", score: 81, status: "interview", tailored: true,
    rationale: "Good full-stack signal. Energy-sector domain is new but adjacent.",
    matched: ["React", "Node.js", "PostgreSQL"], missing: ["Rust", "IoT"],
    desc: "Build the software backbone of the renewable energy transition." },
  { id: "j4", title: "Platform Engineer", company: "Meridian", loc: "Remote · EU", remote: "Remote", type: "Full-time", salary: "€90k–120k", posted: "1d ago", source: "Glassdoor", score: 72, status: "saved", tailored: false,
    rationale: "Infra-heavy role. Your app experience is strong but they want deep K8s/Terraform.",
    matched: ["Node.js", "CI/CD", "AWS"], missing: ["Kubernetes", "Terraform", "Go"],
    desc: "Own the developer platform that 200 engineers ship on every day." },
  { id: "j5", title: "Software Engineer, Growth", company: "Hearth", loc: "Berlin, DE", remote: "Hybrid", type: "Full-time", salary: "€68k–88k", posted: "2d ago", source: "RSS", score: 84, status: "saved", tailored: false,
    rationale: "Product-minded engineering with experimentation — matches your A/B testing work.",
    matched: ["React", "TypeScript", "Experimentation", "SQL"], missing: ["Python"],
    desc: "Help millions of households find a better energy plan." },
  { id: "j6", title: "Senior Frontend Engineer", company: "Lumen", loc: "Remote · DE", remote: "Remote", type: "Full-time", salary: "€80k–100k", posted: "2d ago", source: "LinkedIn", score: 79, status: "applied", tailored: false,
    rationale: "Strong frontend match; they value accessibility work — highlight your a11y contributions.",
    matched: ["React", "Accessibility", "CSS", "TypeScript"], missing: ["WebGL"],
    desc: "Craft the interface for our AI writing tools." },
  { id: "j7", title: "Backend Engineer (Node)", company: "Orbital", loc: "Frankfurt, DE", remote: "Hybrid", type: "Full-time", salary: "€72k–92k", posted: "3d ago", source: "Indeed", score: 68, status: "saved", tailored: false,
    rationale: "Backend-leaning. You'd be stretching toward more services work.",
    matched: ["Node.js", "PostgreSQL", "REST"], missing: ["Kafka", "Go"],
    desc: "Scale the trading infrastructure behind Orbital's exchange." },
  { id: "j8", title: "Engineering Manager", company: "Northwind", loc: "Cologne, DE", remote: "Hybrid", type: "Full-time", salary: "€100k–130k", posted: "3d ago", source: "LinkedIn", score: 54, status: "rejected", tailored: false,
    rationale: "Management role — limited direct people-management history on your resume.",
    matched: ["Mentoring", "React"], missing: ["People Management", "Hiring", "Budgeting"],
    desc: "Lead a team of 7 building logistics software." },
  { id: "j9", title: "Frontend Engineer", company: "Kettle", loc: "Leipzig, DE", remote: "On-site", type: "Contract", salary: "€60/hr", posted: "4d ago", source: "RSS", score: 76, status: "offer", tailored: true,
    rationale: "Clean React match for a 6-month contract. Strong rate.",
    matched: ["React", "TypeScript", "Tailwind"], missing: [],
    desc: "6-month contract rebuilding the Kettle customer dashboard." },
];

const EXTRA_TITLES = ["React Developer", "TypeScript Engineer", "UI Engineer", "Software Engineer II", "Web Platform Engineer", "Product Engineer", "Frontend Developer", "Fullstack Developer", "Senior Web Engineer", "JavaScript Engineer", "Staff Engineer"];
const EXTRA_COS = ["Nimbus", "Voltaic", "Meridian", "Hearth", "Orbital", "Lumen", "Kettle", "TechCorp"];
const EXTRA_SCORES = [73, 62, 58, 81, 66, 70, 55, 77, 64, 69, 60];
const EXTRA_SOURCES = ["LinkedIn", "Indeed", "Glassdoor", "RSS"] as const;
const EXTRA_REMOTE = ["Remote", "Hybrid", "On-site"] as const;

function buildJobs(): Job[] {
  const jobs = [...BASE_JOBS];
  for (let i = 0; i < 11; i++) {
    const c = EXTRA_COS[i % EXTRA_COS.length];
    jobs.push({
      id: `jx${i}`, title: EXTRA_TITLES[i], company: c, loc: COMPANIES[c].loc,
      remote: EXTRA_REMOTE[i % 3], type: "Full-time", salary: "€65k–95k", posted: `${i + 4}d ago`,
      source: EXTRA_SOURCES[i % 4], score: EXTRA_SCORES[i], status: "saved", tailored: false,
      rationale: "Solid keyword overlap; tailor your resume to lift this score.",
      matched: ["React", "TypeScript"], missing: ["Docker"],
      desc: "Build great software with a small, focused team.",
    });
  }
  return jobs;
}

export const JOBS: Job[] = buildJobs();

export const WATCHERS: Watcher[] = [
  { id: "w1", name: "Software Engineer · Germany", countries: ["Germany"], keywords: ["Software Engineer", "React", "TypeScript"], types: ["Full-time", "Contract"], platforms: ["LinkedIn", "Indeed", "Glassdoor", "RSS"], interval: "Every 6 hours", nextRun: "in 2h 14m", lastFound: 7, active: true, total: 142 },
  { id: "w2", name: "Remote Frontend · EU", countries: ["Germany", "Netherlands", "Portugal"], keywords: ["Frontend", "React"], types: ["Full-time"], platforms: ["LinkedIn", "RSS"], interval: "Every 12 hours", nextRun: "in 7h 02m", lastFound: 3, active: true, total: 64 },
  { id: "w3", name: "Staff / Senior · DACH", countries: ["Germany", "Austria", "Switzerland"], keywords: ["Staff Engineer", "Senior Engineer"], types: ["Full-time"], platforms: ["LinkedIn"], interval: "Daily", nextRun: "Paused", lastFound: 0, active: false, total: 21 },
];

export const REPOS: Repo[] = [
  { id: "r1", name: "facebook/react", desc: "The library for web and native user interfaces", stars: "228k", lang: "JavaScript", openIssues: 3, color: "#22D3EE" },
  { id: "r2", name: "vercel/next.js", desc: "The React framework", stars: "126k", lang: "TypeScript", openIssues: 2, color: "#8B5CF6" },
  { id: "r3", name: "tailwindlabs/headlessui", desc: "Unstyled, accessible UI components", stars: "26k", lang: "TypeScript", openIssues: 1, color: "#10B981" },
];

export const ISSUES: Issue[] = [
  { id: "i1", repo: "facebook/react", title: "Fix navbar accessibility — focus trap escapes on Esc", labels: ["good first issue", "a11y"], score: 92, est: "~1.5 hrs", level: "first-timer", working: false,
    body: "The navigation menu's focus trap doesn't release when pressing Escape, leaving keyboard users stuck. We should restore focus to the trigger and close the menu.",
    plan: ["Locate the focus-trap hook in `src/components/Nav/useFocusTrap.ts`", "Add an Escape keydown listener that calls `onClose()` and returns focus to the trigger ref", "Add a test in `useFocusTrap.test.tsx` covering Esc + focus return", "Run `yarn test` and verify the a11y suite passes"], files: ["src/components/Nav/useFocusTrap.ts", "src/components/Nav/Nav.tsx", "useFocusTrap.test.tsx"] },
  { id: "i2", repo: "facebook/react", title: "Docs: clarify useEffect cleanup ordering", labels: ["good first issue", "documentation"], score: 78, est: "~45 min", level: "first-timer", working: true,
    body: "The effects docs don't clearly explain cleanup runs before the next effect. Add an example.",
    plan: ["Open `docs/reference/react/useEffect.md`", "Add a 'Cleanup timing' subsection with a runnable example", "Cross-link from the Synchronizing with Effects guide"], files: ["docs/reference/react/useEffect.md"], progress: 40 },
  { id: "i3", repo: "facebook/react", title: "Add aria-live to error boundary fallback", labels: ["help wanted", "a11y"], score: 71, est: "~2 hrs", level: "intermediate", working: false,
    body: "Screen readers don't announce when an error boundary renders its fallback. Add a polite live region.",
    plan: ["Wrap the default fallback in a `role=alert` container", "Ensure it doesn't double-announce on re-render", "Add Storybook a11y check"], files: ["src/ErrorBoundary.tsx"] },
  { id: "i4", repo: "vercel/next.js", title: "Improve TypeScript error for invalid metadata export", labels: ["good first issue", "TypeScript"], score: 64, est: "~3 hrs", level: "intermediate", working: false,
    body: "Invalid `metadata` exports produce a confusing error. Improve the diagnostic message.",
    plan: ["Find the metadata validation in `packages/next/src/build`", "Map the error to a friendlier message with a docs link"], files: ["packages/next/src/build/metadata.ts"] },
  { id: "i5", repo: "vercel/next.js", title: "Flaky test in app-router redirect suite", labels: ["help wanted", "tests"], score: 58, est: "~2.5 hrs", level: "intermediate", working: false,
    body: "A redirect test intermittently fails in CI due to a timing race.",
    plan: ["Reproduce with `--repeat 50`", "Replace fixed timeout with explicit wait-for"], files: ["test/e2e/app-dir/redirect.test.ts"] },
  { id: "i6", repo: "tailwindlabs/headlessui", title: "Combobox: announce result count to screen readers", labels: ["good first issue", "a11y"], score: 69, est: "~1.5 hrs", level: "first-timer", working: false,
    body: "Add an aria-live region announcing how many options match the query.",
    plan: ["Add a visually-hidden live region to Combobox", "Update count on filter change"], files: ["src/components/combobox/combobox.tsx"] },
];

export const CONTACTS: Contact[] = [
  { id: "c1", name: "Jane Doe", title: "HR Manager", company: "TechCorp", email: "jane@techcorp.com", verify: "verified", linkedin: true, status: "drafted", template: "job inquiry",
    draft: "Hi Jane,\n\nI came across the Senior Software Engineer role on TechCorp's payments team and was genuinely excited — I've spent the last three years building resilient transaction services in fintech, and the problem space maps closely to my work.\n\nI'd love to learn more about what the team is prioritizing this quarter. Would you be open to a short call?\n\nBest,\nAlex",
    history: [{ t: "Drafted by Foundry Intelligence", date: "Today, 09:14", tone: "ai" }] },
  { id: "c2", name: "Marcus Reinhardt", title: "Engineering Manager", company: "TechCorp", email: "m.reinhardt@techcorp.com", verify: "risky", linkedin: true, status: "sent", template: "networking",
    draft: "Hi Marcus,\n\nI'm exploring senior engineering roles in Berlin and admire how TechCorp's payments team approaches reliability...",
    history: [{ t: "Drafted by Foundry Intelligence", date: "2 days ago" }, { t: "Sent via SMTP", date: "2 days ago", tone: "info" }] },
  { id: "c3", name: "Sofia Almeida", title: "CTO & Co-founder", company: "Nimbus", email: "sofia@nimbus.io", verify: "verified", linkedin: true, status: "replied", template: "informational",
    draft: "Hi Sofia,\n\nYour talk on design systems at React Summit stuck with me...",
    history: [{ t: "Sent via SMTP", date: "5 days ago", tone: "info" }, { t: "Replied — 'Happy to chat next week!'", date: "3 days ago", tone: "success" }] },
  { id: "c4", name: "Tomáš Novák", title: "Founder", company: "Meridian", email: "tomas@meridian.dev", verify: "unknown", linkedin: false, status: "drafted", template: "job inquiry",
    draft: "Hi Tomáš,\n\nI noticed Meridian is scaling the platform team...",
    history: [{ t: "Drafted by Foundry Intelligence", date: "Today, 11:02", tone: "ai" }] },
  { id: "c5", name: "Lena Vogt", title: "Talent Partner", company: "Hearth", email: "lena.vogt@hearth.energy", verify: "verified", linkedin: true, status: "followed-up", template: "job inquiry",
    draft: "Hi Lena, following up on my note from last week...",
    history: [{ t: "Sent via SMTP", date: "8 days ago", tone: "info" }, { t: "Follow-up sent", date: "Yesterday", tone: "info" }] },
];

export const SOCIAL: SocialItem[] = [
  { id: "s1", platform: "Twitter", author: "@dev_priya", handle: "Priya · CTO @ StackForge", time: "18m ago", keyword: "Looking for", verified: true,
    text: "We just closed our seed round and I'm looking for a senior React dev to be employee #4. Remote-friendly (EU timezones). Equity + competitive salary. DMs open 🚀",
    reply: "Hi Priya — congrats on the raise! Employee #4 at a seed-stage team is exactly the kind of ownership I'm after. I've spent 3 years on React/TS platforms (most recently a payments dashboard used by 40k businesses). Would love to hear what you're building — open to a quick call this week?" },
  { id: "s2", platform: "LinkedIn", author: "Daniel Brandt", handle: "Hiring · Eng Lead at Voltaic", time: "1h ago", keyword: "hiring", verified: false,
    text: "Voltaic is hiring 2 full-stack engineers in Hamburg to work on grid-balancing software. If you care about the energy transition and like hard real-time problems, let's talk.",
    reply: "Hi Daniel — the grid-balancing problem is fascinating, and the real-time constraint is exactly the kind of challenge I enjoy. I've built event-driven Node services handling high-throughput data..." },
  { id: "s3", platform: "Twitter", author: "@nimbus_sofia", handle: "Sofia · CTO @ Nimbus", time: "3h ago", keyword: "we're hiring", verified: true,
    text: "We're hiring frontend engineers who love design systems. If you've ever rage-quit a badly-documented component library, come fix ours (it's pretty good though). 😄",
    reply: "Hi Sofia — I've both rage-quit AND maintained component libraries, so I bring balance. I lead the design-system guild at my current company..." },
  { id: "s4", platform: "Instagram", author: "berlinstartups", handle: "Berlin Startups", time: "6h ago", keyword: "open roles", verified: false,
    text: "📢 5 Berlin startups with open engineering roles this week — swipe for the list. Tag someone who's job hunting!",
    reply: "Thanks for sharing this roundup! Could you point me to the React-focused roles in the list? Happy to apply directly." },
];

export const COACH: Coach = {
  insight: "Your match rate climbed +20% after tailoring resumes",
  insightBody: "Across 15 applications this week, tailored resumes scored an average 84% match vs 64% for your base resume. Keep tailoring — it's working.",
  stats: [
    { label: "Applications this week", value: "15", delta: "+3 vs last week", tone: "success", spark: [4, 6, 5, 8, 7, 10, 12, 15] },
    { label: "Avg match rate", value: "84%", delta: "+20% after tailoring", tone: "success", spark: [60, 62, 64, 68, 72, 78, 81, 84] },
    { label: "Outreach sent", value: "9", delta: "3 replies", tone: "primary", spark: [1, 2, 2, 4, 5, 6, 8, 9] },
    { label: "Issues in progress", value: "1", delta: "1 of 3 started", tone: "violet", spark: [0, 0, 1, 1, 1, 1, 1, 1] },
  ],
  appsOverTime: [4, 6, 5, 8, 7, 10, 12, 15],
  matchTrend: [60, 62, 64, 68, 72, 78, 81, 84],
  weekLabels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "Now"],
  skillGaps: [
    { skill: "Kubernetes", seen: 12, have: false, resource: "KodeKloud CKA path · ~20 hrs" },
    { skill: "Go", seen: 8, have: false, resource: "Tour of Go + Gophercises · ~12 hrs" },
    { skill: "Terraform", seen: 5, have: false, resource: "HashiCorp Learn · ~6 hrs" },
    { skill: "GraphQL", seen: 7, have: true, resource: null },
  ],
  nudges: [
    { text: "Reach out to 3 AI-startup CTOs this week", done: 1, total: 3 },
    { text: "Follow up with Lena Vogt (Hearth) — 8 days since last contact", done: 0, total: 1 },
    { text: "Finish the React docs issue you started", done: 0, total: 1 },
  ],
  mockQuestions: [
    "Walk me through how you'd design a resilient payment-processing service that must not double-charge.",
    "Tell me about a time you improved the accessibility of a product. What changed for users?",
    "How do you decide when to introduce a design system vs. shipping components ad hoc?",
    "Describe a production incident you owned end-to-end.",
  ],
};

export const ACTIVITY: ActivityItem[] = [
  { id: "a1", type: "scan", icon: "search", tone: "primary", text: "Scan complete · Software Engineer · Germany", detail: "7 new jobs found, 1 strong match at TechCorp", time: "2h ago" },
  { id: "a2", type: "ai", icon: "wand", tone: "ai", text: "Tailored resume generated for TechCorp", detail: "Match lifted 71% → 94% · 6 keywords added", time: "2h ago" },
  { id: "a3", type: "ai", icon: "at-sign", tone: "ai", text: "Outreach drafted to Jane Doe (HR, TechCorp)", detail: "Job-inquiry template · ready to send", time: "3h ago" },
  { id: "a4", type: "social", icon: "globe", tone: "cyan", text: "Opportunity detected on Twitter", detail: "@dev_priya: 'looking for a senior React dev'", time: "18m ago" },
  { id: "a5", type: "status", icon: "check-circle", tone: "success", text: "Voltaic moved to Interview", detail: "Phone screen scheduled for Thu 14:00", time: "5h ago" },
  { id: "a6", type: "scan", icon: "git-branch", tone: "violet", text: "GitHub scan · facebook/react", detail: "3 good-first-issues matched your profile", time: "6h ago" },
];
