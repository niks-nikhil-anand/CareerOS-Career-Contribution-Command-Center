"use client";
/* ============================================================
   CareerOS — Open Source Contribution Manager
   ============================================================ */
import { useMemo, useState } from "react";
import { ISSUES, REPOS } from "@/lib/data";
import type { Issue, Repo } from "@/lib/types";
import { Badge, Btn, Card, Chip, EmptyState, Icon, MatchRing, ProgressBar, Switch } from "../ui";
import { AiTag, Page, PageHead, SectionTitle, Select } from "../layout";
import { SlideHeader, SlideOver, toast } from "../overlays";

const LABEL_TONE: Record<string, "success" | "violet" | "cyan" | "amber" | "primary" | "neutral"> = {
  "good first issue": "success", "help wanted": "violet", a11y: "cyan", documentation: "amber", TypeScript: "primary", tests: "neutral",
};

function RepoCard({ repo }: { repo: Repo }) {
  return (
    <Card pad={16}>
      <div className="row gap-2" style={{ marginBottom: 10, alignItems: "flex-start" }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: `color-mix(in srgb, ${repo.color} 16%, transparent)`, color: repo.color }}><Icon name="git-branch" size={17} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row gap-1" style={{ fontSize: 14, fontWeight: 600 }}><span className="mono" style={{ fontSize: 13 }}>{repo.name}</span><Icon name="external-link" size={12} style={{ color: "var(--text-faint)" }} /></div>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{repo.desc}</div>
        </div>
      </div>
      <div className="row gap-3" style={{ fontSize: 12.5, color: "var(--text-faint)" }}>
        <span className="row gap-1"><Icon name="star" size={13} />{repo.stars}</span>
        <span className="row gap-1"><span style={{ width: 8, height: 8, borderRadius: 999, background: repo.color }} />{repo.lang}</span>
        <span className="row gap-1"><Icon name="alert-circle" size={13} />{repo.openIssues} matched</span>
      </div>
    </Card>
  );
}

function IssueCard({ issue, onOpen }: { issue: Issue; onOpen: (i: Issue) => void }) {
  return (
    <Card hover pad={16} onClick={() => onOpen(issue)}>
      <div className="row gap-3" style={{ alignItems: "flex-start" }}>
        <MatchRing score={issue.score} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row gap-2" style={{ flexWrap: "wrap", marginBottom: 5 }}>
            <span style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.3 }}>{issue.title}</span>
            {issue.working && <Badge tone="violet" size="sm" dot>Working on it</Badge>}
          </div>
          <div className="row gap-2" style={{ marginBottom: 9, fontSize: 12.5, color: "var(--text-muted)" }}><span className="mono">{issue.repo}</span></div>
          <div className="row gap-2" style={{ flexWrap: "wrap", justifyContent: "space-between" }}>
            <div className="row gap-1" style={{ flexWrap: "wrap" }}>
              {issue.labels.map((l) => <Chip key={l} tone={LABEL_TONE[l] || "neutral"}>{l}</Chip>)}
            </div>
            <Badge tone="amber" icon="clock">{issue.est} · {issue.level}</Badge>
          </div>
          {issue.working && issue.progress != null && <div style={{ marginTop: 12 }}><ProgressBar value={issue.progress} tone="violet" /></div>}
        </div>
      </div>
    </Card>
  );
}

function IssueDetail({ issue, onClose, onToggleWorking }: { issue: Issue; onClose: () => void; onToggleWorking: (id: string) => void }) {
  const [note, setNote] = useState("");
  const [log, setLog] = useState<{ t: string; date: string }[]>(issue.working ? [{ t: "Started working — set up local fork", date: "Yesterday" }] : []);
  const [generating, setGenerating] = useState(false);

  function regenPlan() {
    setGenerating(true);
    toast({ title: "Re-analysing issue", tone: "ai", loading: true });
    setTimeout(() => { setGenerating(false); toast({ title: "Solution plan updated", tone: "ai", icon: "wand" }); }, 1900);
  }

  return (
    <SlideOver open={!!issue} onClose={onClose} width={560} accent="violet">
      <SlideHeader title={issue.title} sub={issue.repo} onClose={onClose} accentIcon="git-branch"
        badge={<Badge tone="amber" icon="clock">{issue.est}</Badge>} />
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 14, flex: "none" }}>
        <MatchRing score={issue.score} size={52} />
        <div style={{ flex: 1 }}>
          <div className="row gap-2"><span style={{ fontSize: 13, fontWeight: 600 }}>{issue.score}% fit</span><AiTag small label="AI" /></div>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>Estimated {issue.est} for a {issue.level}</div>
        </div>
        <div className="row gap-2"><span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Working on it</span><Switch checked={issue.working} onChange={() => onToggleWorking(issue.id)} /></div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="row gap-1" style={{ flexWrap: "wrap" }}>{issue.labels.map((l) => <Chip key={l} tone={LABEL_TONE[l] || "neutral"}>{l}</Chip>)}</div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Issue</div>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6 }}>{issue.body}</p>
        </div>

        <div style={{ borderRadius: 12, border: "1px solid rgba(var(--violet-rgb),0.25)", overflow: "hidden" }}>
          <div className="row gap-2" style={{ justifyContent: "space-between", padding: "11px 14px", background: "rgba(var(--violet-rgb),0.08)" }}>
            <AiTag label="AI-proposed approach" />
            <Btn kind="ghost" size="sm" icon="reload" onClick={regenPlan} loading={generating}>Re-analyse</Btn>
          </div>
          <div style={{ padding: 14 }}>
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {issue.plan.map((step, i) => (
                <li key={i} className="row gap-2" style={{ alignItems: "flex-start" }}>
                  <span style={{ width: 20, height: 20, borderRadius: 999, flex: "none", background: "rgba(var(--violet-rgb),0.16)", color: "var(--violet)", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                  <span style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{step}</span>
                </li>
              ))}
            </ol>
            <div style={{ marginTop: 14 }}>
              <div className="eyebrow" style={{ marginBottom: 7 }}>Files to modify</div>
              <div className="row gap-1" style={{ flexWrap: "wrap" }}>{issue.files.map((f) => <span key={f} className="mono" style={{ fontSize: 12, padding: "3px 8px", borderRadius: 6, background: "var(--elevated)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>{f}</span>)}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Progress notes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
            {log.length === 0 && <div style={{ fontSize: 13, color: "var(--text-faint)" }}>No notes yet. Toggle &quot;Working on it&quot; and log your progress.</div>}
            {log.map((l, i) => (
              <div key={i} className="row gap-2" style={{ alignItems: "flex-start", fontSize: 13 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--violet)", marginTop: 6, flex: "none" }} />
                <div><div style={{ color: "var(--text)" }}>{l.t}</div><div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{l.date}</div></div>
              </div>
            ))}
          </div>
          <div className="row gap-2">
            <input value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && note.trim()) { setLog([{ t: note, date: "Just now" }, ...log]); setNote(""); } }}
              placeholder="Add a progress note…" style={{ flex: 1, height: 38, padding: "0 12px", borderRadius: 8, background: "var(--elevated)", border: "1px solid var(--border-strong)", color: "var(--text)", fontSize: 13.5, outline: "none", fontFamily: "var(--font)" }} />
            <Btn kind="secondary" icon="plus" onClick={() => { if (note.trim()) { setLog([{ t: note, date: "Just now" }, ...log]); setNote(""); } }}>Add</Btn>
          </div>
        </div>
      </div>

      <div style={{ padding: 16, borderTop: "1px solid var(--border)", display: "flex", gap: 10, flex: "none" }}>
        <Btn kind="primary" full icon="external-link" style={{ "--accent": "var(--violet)" }}>Open on GitHub</Btn>
      </div>
    </SlideOver>
  );
}

export function OpenSource() {
  const [connected, setConnected] = useState(true);
  const [issues, setIssues] = useState<Issue[]>(ISSUES);
  const [open, setOpen] = useState<Issue | null>(null);
  const [filter, setFilter] = useState("All labels");
  const [addUrl, setAddUrl] = useState("");

  function toggleWorking(id: string) {
    setIssues((arr) => arr.map((i) => (i.id === id ? { ...i, working: !i.working, progress: !i.working ? (i.progress || 10) : i.progress } : i)));
    setOpen((o) => (o && o.id === id ? { ...o, working: !o.working } : o));
    toast({ title: "Updated", body: "Issue tracking changed", tone: "success" });
  }

  const shown = useMemo(() => {
    let arr = [...issues].sort((a, b) => b.score - a.score);
    if (filter !== "All labels") arr = arr.filter((i) => i.labels.includes(filter));
    return arr;
  }, [issues, filter]);

  if (!connected) {
    return (
      <Page>
        <PageHead title="Open Source" />
        <Card pad={0}><EmptyState icon="git-branch" title="Connect your GitHub" body="CareerOS monitors repos you care about and surfaces good-first-issues ranked by how well they fit your profile."
          action={<Btn kind="primary" icon="git-branch" onClick={() => setConnected(true)}>Connect GitHub</Btn>} /></Card>
      </Page>
    );
  }

  return (
    <Page>
      <PageHead title="Open Source" sub="Build your portfolio with contributions ranked by fit and effort."
        actions={<div className="row gap-2" style={{ background: "var(--fill-neutral)", borderRadius: 8, padding: 4, border: "1px solid var(--border)" }}>
          <input value={addUrl} onChange={(e) => setAddUrl(e.target.value)} placeholder="Add repo by URL…" style={{ height: 30, padding: "0 8px", background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 13, width: 190, fontFamily: "var(--font)" }} />
          <Btn kind="primary" size="sm" icon="plus" onClick={() => { if (addUrl) { toast({ title: "Repo added", body: "Scanning for matching issues…", tone: "success" }); setAddUrl(""); } }}>Add</Btn>
        </div>} />

      <SectionTitle icon="git-branch" sub="3 monitored">Monitored repositories</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 30 }}>
        {REPOS.map((r) => <RepoCard key={r.id} repo={r} />)}
      </div>

      <SectionTitle icon="target" sub={`${shown.length} ranked by fit`} action={<Select value={filter} onChange={setFilter} options={["All labels", "good first issue", "help wanted", "a11y", "documentation"]} />}>Open issues for you</SectionTitle>
      <div style={{ display: "grid", gap: 12 }}>
        {shown.map((i) => <IssueCard key={i.id} issue={i} onOpen={setOpen} />)}
      </div>

      {open && <IssueDetail issue={open} onClose={() => setOpen(null)} onToggleWorking={toggleWorking} />}
    </Page>
  );
}
