"use client";
/* ============================================================
   CareerOS — Jobs (Results · Watchers · Tracker)
   ============================================================ */
import { useMemo, useState } from "react";
import { JOBS, WATCHERS } from "@/lib/data";
import type { Job, JobStatus, Watcher } from "@/lib/types";
import { Badge, Btn, Card, Chip, CompanyTile, Icon, IconBtn, MatchRing, Seg, Switch } from "../ui";
import { AiTag, Field, Input, Page, PageHead, Select, Toolbar } from "../layout";
import { Modal, SlideHeader, SlideOver, toast } from "../overlays";
import { SOURCE_TONE, STATUS_META } from "./jobShared";
import { Tracker } from "./Tracker";

/* ---------- Job result card (3 treatments) ---------- */
function JobCard({
  job, onOpen, treatment, idx,
}: {
  job: Job; onOpen: (j: Job) => void; treatment: string; idx: number;
}) {
  if (treatment === "compact") {
    return (
      <div onClick={() => onOpen(job)} className="cos-row-hover" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
        <MatchRing score={job.score} size={38} stroke={3.5} delay={idx * 25} />
        <CompanyTile name={job.company} size={30} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row gap-2"><span style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.title}</span>{job.tailored && <Icon name="wand" size={13} style={{ color: "var(--violet)" }} />}</div>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{job.company} · {job.loc}</div>
        </div>
        <span style={{ fontSize: 12.5, color: "var(--text-faint)", whiteSpace: "nowrap" }}>{job.posted}</span>
        <Badge tone={STATUS_META[job.status].tone} size="sm">{STATUS_META[job.status].label}</Badge>
      </div>
    );
  }
  return (
    <Card hover pad={treatment === "rich" ? 0 : 16} onClick={() => onOpen(job)} style={{ overflow: "hidden" }}>
      {treatment === "rich" && (
        <div style={{ height: 4, background: `linear-gradient(90deg, ${job.score >= 80 ? "var(--success)" : job.score >= 60 ? "var(--amber)" : "var(--danger)"}, transparent)` }} />
      )}
      <div style={{ padding: treatment === "rich" ? 16 : 0 }}>
        <div className="row gap-3" style={{ alignItems: "flex-start", marginBottom: 12 }}>
          <MatchRing score={job.score} size={46} delay={idx * 30} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="row gap-2" style={{ flexWrap: "wrap" }}>
              <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.2px" }}>{job.title}</span>
              {job.tailored && <Badge tone="violet" size="sm" icon="wand">Tailored</Badge>}
            </div>
            <div className="row gap-2" style={{ marginTop: 4, color: "var(--text-muted)", fontSize: 13 }}>
              <CompanyTile name={job.company} size={20} /><span>{job.company}</span>
              <span style={{ color: "var(--text-faint)" }}>·</span><span>{job.loc}</span>
            </div>
          </div>
          <IconBtn name="star" size={30} iconSize={15} title="Save" />
        </div>
        {treatment === "rich" && (
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 12, display: "flex", gap: 6 }}>
            <Icon name="wand" size={13} style={{ color: "var(--violet)", flex: "none", marginTop: 2 }} />
            <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{job.rationale}</span>
          </div>
        )}
        <div className="row gap-2" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <div className="row gap-2">
            <Badge tone="neutral" size="sm">{job.remote}</Badge>
            <Badge tone={SOURCE_TONE[job.source]} size="sm" dot>{job.source}</Badge>
          </div>
          <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{job.posted}</span>
        </div>
      </div>
    </Card>
  );
}

/* ---------- keyword highlighter ---------- */
function KeywordText({ text, keywords }: { text: string; keywords: string[] }) {
  const parts = useMemo(() => {
    if (!keywords.length) return [text];
    const re = new RegExp(`(${keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    return text.split(re);
  }, [text, keywords]);
  return (
    <>
      {parts.map((p, i) =>
        keywords.some((k) => k.toLowerCase() === p.toLowerCase()) ? (
          <mark key={i} style={{ background: "rgba(var(--violet-rgb),0.22)", color: "var(--violet)", borderRadius: 4, padding: "0 3px", fontWeight: 600 }}>{p}</mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

/* ---------- Job detail slide-over ---------- */
function JobDetail({
  job, onClose, onStatus,
}: {
  job: Job; onClose: () => void; onStatus: (id: string, status: JobStatus) => void;
}) {
  const [tab, setTab] = useState("overview");
  const [generating, setGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState(`Dear ${job.company} hiring team,\n\nI'm excited to apply for the ${job.title} role. Over the past three years I've built resilient, high-throughput services in React and TypeScript — most recently a payments dashboard used by 40,000 businesses across Europe.\n\nYour focus on reliability and developer experience strongly aligns with how I work, and I'd welcome the chance to contribute to ${job.company}'s team.\n\nBest regards,\nAlex Morgan`);
  const [showHighlights, setShowHighlights] = useState(true);

  function regen() {
    setGenerating(true);
    toast({ title: "Regenerating cover letter", tone: "ai", loading: true });
    setTimeout(() => { setGenerating(false); toast({ title: "Cover letter updated", tone: "ai", icon: "wand" }); }, 1900);
  }

  const tabs = [{ value: "overview", label: "Overview" }, { value: "cover", label: "Cover letter" }, { value: "resume", label: "Tailored resume" }];

  return (
    <SlideOver open={!!job} onClose={onClose} width={560}>
      <SlideHeader title={job.title} sub={`${job.company} · ${job.loc} · ${job.salary}`} onClose={onClose}
        accentIcon="target" badge={<Badge tone={STATUS_META[job.status].tone} size="sm">{STATUS_META[job.status].label}</Badge>} />

      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 14, flex: "none" }}>
        <MatchRing score={job.score} size={56} />
        <div style={{ flex: 1 }}>
          <div className="row gap-2" style={{ marginBottom: 4 }}><span style={{ fontSize: 13, fontWeight: 600 }}>{job.score}% match</span><AiTag small label="AI" /></div>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.45 }}>{job.rationale}</div>
        </div>
      </div>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", flex: "none" }}>
        <div className="row gap-2" style={{ justifyContent: "space-between" }}>
          <span style={{ fontSize: 12.5, color: "var(--text-faint)" }}>Application status</span>
          <div style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
            {(Object.entries(STATUS_META) as [JobStatus, { label: string }][]).filter(([k]) => k !== "rejected").map(([k, v]) => (
              <button key={k} onClick={() => onStatus(job.id, k)} style={{
                height: 28, padding: "0 11px", borderRadius: 8, border: "1px solid", cursor: "pointer", fontSize: 12.5, fontWeight: 500,
                borderColor: job.status === k ? "var(--accent)" : "var(--border-strong)",
                background: job.status === k ? "rgba(var(--accent-rgb),0.14)" : "transparent",
                color: job.status === k ? "var(--accent)" : "var(--text-muted)",
              }}>{v.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 20px 0", flex: "none" }}><Seg size="sm" value={tab} onChange={setTab} options={tabs} /></div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {tab === "overview" && (
          <div className="rise" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="row gap-2" style={{ flexWrap: "wrap" }}>
              <Badge tone="neutral">{job.type}</Badge><Badge tone="neutral">{job.remote}</Badge>
              <Badge tone={SOURCE_TONE[job.source]} dot>{job.source}</Badge><Badge tone="neutral">{job.posted}</Badge>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Keyword fit</div>
              <div className="row gap-2" style={{ flexWrap: "wrap", marginBottom: 8 }}>
                {job.matched.map((m) => <Chip key={m} tone="success" icon="check">{m}</Chip>)}
                {job.missing.map((m) => <Chip key={m} tone="danger" icon="minus">{m}</Chip>)}
              </div>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Role description</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--text-muted)" }}>{job.desc} You&apos;ll collaborate across product, design, and platform teams, own features end-to-end, and help shape engineering culture as the team scales.</p>
            </div>
            <Btn kind="secondary" icon="external-link" full>View original posting on {job.source}</Btn>
          </div>
        )}

        {tab === "cover" && (
          <div className="rise" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="row gap-2" style={{ justifyContent: "space-between" }}>
              <AiTag label="AI-drafted cover letter" /><Btn kind="ghost" size="sm" icon="reload" onClick={regen} loading={generating}>Regenerate</Btn>
            </div>
            <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={16}
              style={{ width: "100%", resize: "vertical", padding: 14, borderRadius: 10, background: "var(--elevated)", border: "1px solid var(--border-strong)", color: "var(--text)", fontSize: 13.5, lineHeight: 1.6, fontFamily: "var(--font)", outline: "none" }} />
            <div className="row gap-2">
              <Btn kind="primary" icon="check">Save</Btn>
              <Btn kind="secondary" icon="duplicate">Copy</Btn>
              <Btn kind="ghost" icon="download">Download .pdf</Btn>
            </div>
          </div>
        )}

        {tab === "resume" && (
          <div className="rise" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="row gap-2" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <AiTag label="ATS-tailored resume" />
              <div className="row gap-2"><span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Highlights</span><Switch size="sm" checked={showHighlights} onChange={setShowHighlights} /></div>
            </div>
            <div style={{ padding: 16, borderRadius: 10, background: "var(--elevated)", border: "1px solid var(--border-strong)", fontSize: 13, lineHeight: 1.65, color: "var(--text-muted)" }}>
              <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>Alex Morgan</div>
              <div style={{ fontSize: 12, marginBottom: 12 }}>Senior Software Engineer · Berlin</div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Summary</div>
              <p style={{ marginBottom: 12 }}>
                <KeywordText text={`Senior engineer with 6 years building ${job.matched.join(", ")} applications at scale. Shipped resilient services and design systems used by thousands of businesses.`} keywords={showHighlights ? job.matched : []} />
              </p>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Experience</div>
              <p><KeywordText text={`Led frontend platform work in React and TypeScript, introduced CI/CD pipelines, and improved GraphQL performance by 40%.`} keywords={showHighlights ? job.matched : []} /></p>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: "rgba(var(--violet-rgb),0.08)", border: "1px solid rgba(var(--violet-rgb),0.2)", fontSize: 12.5, color: "var(--text-muted)" }}>
              <span style={{ color: "var(--violet)", fontWeight: 600 }}>{job.matched.length} keywords</span> from the job description were woven into your resume to lift ATS ranking.
            </div>
            <div className="row gap-2"><Btn kind="primary" icon="download">Download tailored resume</Btn><Btn kind="secondary" icon="eye">Preview</Btn></div>
          </div>
        )}
      </div>

      <div style={{ padding: 16, borderTop: "1px solid var(--border)", display: "flex", gap: 10, flex: "none" }}>
        <Btn kind="primary" full icon="external-link" onClick={() => { onStatus(job.id, "applied"); toast({ title: "Marked as applied", body: `${job.title} → Applied`, tone: "success" }); }}>Apply &amp; mark applied</Btn>
      </div>
    </SlideOver>
  );
}

/* ---------- Watchers ---------- */
function WatcherCard({ w, onScan, onToggle }: { w: Watcher; onScan: (w: Watcher) => void; onToggle: (id: string) => void }) {
  return (
    <Card pad={18}>
      <div className="row gap-2" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <div className="row gap-2">
          <span className={w.active ? "live-pulse" : ""} style={{ width: 9, height: 9, borderRadius: 999, background: w.active ? "var(--success)" : "var(--text-faint)", "--accent-rgb": "var(--success-rgb)" }} />
          <span style={{ fontSize: 15, fontWeight: 600 }}>{w.name}</span>
        </div>
        <Switch size="sm" checked={w.active} onChange={() => onToggle(w.id)} />
      </div>
      <div className="row gap-2" style={{ flexWrap: "wrap", marginBottom: 12 }}>
        {w.keywords.map((k) => <Chip key={k} tone="primary">{k}</Chip>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12.5, marginBottom: 14 }}>
        <div><div style={{ color: "var(--text-faint)" }}>Countries</div><div style={{ color: "var(--text)", fontWeight: 500 }}>{w.countries.join(", ")}</div></div>
        <div><div style={{ color: "var(--text-faint)" }}>Interval</div><div style={{ color: "var(--text)", fontWeight: 500 }}>{w.interval}</div></div>
        <div><div style={{ color: "var(--text-faint)" }}>Platforms</div><div className="row gap-1" style={{ flexWrap: "wrap" }}>{w.platforms.map((p) => <Badge key={p} tone={SOURCE_TONE[p]} size="sm">{p}</Badge>)}</div></div>
        <div><div style={{ color: "var(--text-faint)" }}>Next run</div><div style={{ color: w.active ? "var(--primary)" : "var(--text-faint)", fontWeight: 500 }}>{w.nextRun}</div></div>
      </div>
      <div className="row gap-2" style={{ justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}><b style={{ color: "var(--text)" }}>{w.total}</b> total · <b style={{ color: "var(--success)" }}>{w.lastFound}</b> last scan</span>
        <Btn kind="secondary" size="sm" icon="search" onClick={() => onScan(w)}>Scan now</Btn>
      </div>
    </Card>
  );
}

function CreateWatcher({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState("");
  const [kw, setKw] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState("");
  const [countries, setCountries] = useState(["Germany"]);
  const [interval, setIntervalVal] = useState("Every 6 hours");
  const [platforms, setPlatforms] = useState<Record<string, boolean>>({ LinkedIn: true, Indeed: true, Glassdoor: false, RSS: false });
  const [types, setTypes] = useState<Record<string, boolean>>({ "Full-time": true, Contract: false, "Part-time": false });
  return (
    <Modal open={open} onClose={onClose} width={560}>
      <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: 17, fontWeight: 600 }}>Create job watcher</h3><IconBtn name="x" onClick={onClose} title="Close" />
      </div>
      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18, maxHeight: "60vh", overflowY: "auto" }}>
        <Field label="Watcher name"><Input value={name} onChange={setName} placeholder="e.g. Senior React · Germany" icon="target" /></Field>
        <Field label="Keywords" hint="Press Enter to add"><div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 8, borderRadius: 8, background: "var(--elevated)", border: "1px solid var(--border-strong)", minHeight: 44 }}>
          {kw.map((k) => <Chip key={k} tone="primary" onRemove={() => setKw(kw.filter((x) => x !== k))}>{k}</Chip>)}
          <input value={kwInput} onChange={(e) => setKwInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && kwInput.trim()) { setKw([...kw, kwInput.trim()]); setKwInput(""); } }} placeholder="Add keyword…" style={{ flex: 1, minWidth: 120, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 14, fontFamily: "var(--font)" }} />
        </div></Field>
        <Field label="Countries">
          <div className="row gap-2" style={{ flexWrap: "wrap" }}>
            {["Germany", "Netherlands", "Austria", "Switzerland", "Remote · EU"].map((c) => (
              <Chip key={c} active={countries.includes(c)} onClick={() => setCountries(countries.includes(c) ? countries.filter((x) => x !== c) : [...countries, c])} icon="map-pin">{c}</Chip>
            ))}
          </div>
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Job types"><div className="row gap-2" style={{ flexWrap: "wrap" }}>{Object.keys(types).map((t) => <Chip key={t} active={types[t]} onClick={() => setTypes({ ...types, [t]: !types[t] })}>{t}</Chip>)}</div></Field>
          <Field label="Scan interval"><Select value={interval} onChange={setIntervalVal} options={["Every 3 hours", "Every 6 hours", "Every 12 hours", "Daily"]} /></Field>
        </div>
        <Field label="Platforms"><div className="row gap-2" style={{ flexWrap: "wrap" }}>{Object.keys(platforms).map((p) => <Chip key={p} active={platforms[p]} onClick={() => setPlatforms({ ...platforms, [p]: !platforms[p] })} icon={platforms[p] ? "check" : undefined}>{p}</Chip>)}</div></Field>
      </div>
      <div style={{ padding: "16px 22px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn kind="ghost" onClick={onClose}>Cancel</Btn>
        <Btn kind="primary" icon="plus" onClick={() => { onCreate(name || "New watcher"); onClose(); toast({ title: "Watcher created", body: "First scan starting now…", tone: "success" }); }}>Create &amp; scan</Btn>
      </div>
    </Modal>
  );
}

/* ---------- Jobs page ---------- */
export function Jobs() {
  const [tab, setTab] = useState("results");
  const [jobs, setJobs] = useState<Job[]>(JOBS);
  const [watchers, setWatchers] = useState<Watcher[]>(WATCHERS);
  const [open, setOpen] = useState<Job | null>(null);
  const [treatment, setTreatment] = useState("rich");
  const [createOpen, setCreateOpen] = useState(false);
  const [sortMatch, setSortMatch] = useState(true);
  const [filterSource, setFilterSource] = useState("All sources");
  const [scanningId, setScanningId] = useState<string | null>(null);

  const shown = useMemo(() => {
    let arr = [...jobs];
    if (filterSource !== "All sources") arr = arr.filter((j) => j.source === filterSource);
    if (sortMatch) arr.sort((a, b) => b.score - a.score);
    return arr;
  }, [jobs, sortMatch, filterSource]);

  function setStatus(id: string, status: JobStatus) {
    setJobs((arr) => arr.map((j) => (j.id === id ? { ...j, status } : j)));
    setOpen((o) => (o && o.id === id ? { ...o, status } : o));
  }
  function scanWatcher(w: Watcher) {
    setScanningId(w.id);
    toast({ title: `Scanning ${w.name}`, tone: "info", loading: true });
    setTimeout(() => { setScanningId(null); toast({ title: "Scan complete", body: "2 new jobs found", tone: "success" }); }, 2400);
  }
  function toggleWatcher(id: string) {
    setWatchers((arr) => arr.map((w) => (w.id === id ? { ...w, active: !w.active, nextRun: !w.active ? "in 6h 00m" : "Paused" } : w)));
  }

  return (
    <Page>
      <PageHead title="Jobs" sub="Automated scanning, AI match scores, and your full application pipeline."
        actions={tab === "watchers"
          ? <Btn kind="primary" icon="plus" onClick={() => setCreateOpen(true)}>New watcher</Btn>
          : tab === "results" ? <Btn kind="secondary" icon="search">Scan all now</Btn> : undefined} />

      <div style={{ marginBottom: 18 }}>
        <Seg value={tab} onChange={setTab} options={[
          { value: "results", label: "Results", icon: "list" },
          { value: "watchers", label: "Watchers", icon: "target" },
          { value: "tracker", label: "Tracker", icon: "grid" },
        ]} />
      </div>

      {tab === "results" && (
        <>
          <Toolbar>
            <div className="row gap-2" style={{ background: "var(--fill-neutral)", borderRadius: 8, padding: "0 10px", height: 38, border: "1px solid var(--border)" }}>
              <Icon name="search" size={15} style={{ color: "var(--text-faint)" }} />
              <input placeholder={`Filter ${shown.length} jobs…`} style={{ background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 13.5, width: 180, fontFamily: "var(--font)" }} />
            </div>
            <Select value={filterSource} onChange={setFilterSource} options={["All sources", "LinkedIn", "Indeed", "Glassdoor", "RSS"]} />
            <Chip active={sortMatch} onClick={() => setSortMatch(!sortMatch)} icon="sort-desc">Match %</Chip>
            <div style={{ flex: 1 }} />
            <Seg size="sm" value={treatment} onChange={setTreatment} options={[{ value: "rich", label: "Rich", icon: "grid" }, { value: "card", label: "Card" }, { value: "compact", label: "List", icon: "list" }]} />
          </Toolbar>
          {treatment === "compact" ? (
            <Card pad={0} style={{ overflow: "hidden" }}>{shown.map((j, i) => <JobCard key={j.id} job={j} idx={i} onOpen={setOpen} treatment="compact" />)}</Card>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {shown.map((j, i) => <JobCard key={j.id} job={j} idx={i} onOpen={setOpen} treatment={treatment} />)}
            </div>
          )}
        </>
      )}

      {tab === "watchers" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 16 }}>
          {watchers.map((w) => <WatcherCard key={w.id} w={{ ...w, active: scanningId === w.id ? true : w.active }} onScan={scanWatcher} onToggle={toggleWatcher} />)}
          <button onClick={() => setCreateOpen(true)} style={{ border: "2px dashed var(--border-strong)", borderRadius: 14, background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 200, fontSize: 14, fontWeight: 500 }}>
            <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--fill-primary)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="plus" size={20} /></span>
            New job watcher
          </button>
        </div>
      )}

      {tab === "tracker" && <Tracker onOpen={setOpen} jobs={jobs} setStatus={setStatus} />}

      {open && <JobDetail job={open} onClose={() => setOpen(null)} onStatus={setStatus} />}
      <CreateWatcher open={createOpen} onClose={() => setCreateOpen(false)} onCreate={(n) => setWatchers([{ id: "w" + Date.now(), name: n, countries: ["Germany"], keywords: ["React"], types: ["Full-time"], platforms: ["LinkedIn"], interval: "Every 6 hours", nextRun: "in 6h", lastFound: 0, active: true, total: 0 }, ...watchers])} />
    </Page>
  );
}
