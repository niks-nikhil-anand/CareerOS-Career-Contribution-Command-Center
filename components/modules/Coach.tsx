"use client";
/* ============================================================
   CareerOS — AI Career Coach
   ============================================================ */
import { useEffect, useRef, useState } from "react";
import { COACH } from "@/lib/data";
import type { CoachStat } from "@/lib/types";
import { Btn, Card, Icon, ProgressBar } from "../ui";
import { AreaChart, Sparkline } from "../charts";
import { AiTag, Page, PageHead, SectionTitle, Select } from "../layout";
import { toast } from "../overlays";

function StatTile({ s }: { s: CoachStat }) {
  return (
    <Card pad={16}>
      <div className="row gap-2" style={{ justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{s.label}</span>
        <Sparkline data={s.spark} color={`var(--${s.tone === "success" ? "success" : s.tone})`} width={56} height={20} />
      </div>
      <div className="tabular" style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.8px" }}>{s.value}</div>
      <div className="row gap-1" style={{ fontSize: 12, color: `var(--${s.tone === "success" ? "success" : s.tone})`, marginTop: 3 }}>
        <Icon name="arrow-up" size={12} />{s.delta}
      </div>
    </Card>
  );
}

function VoiceRecorder() {
  const [state, setState] = useState("idle"); // idle | recording | recorded | playing
  const [secs, setSecs] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state === "recording") {
      timer.current = setInterval(() => setSecs((s) => s + 1), 1000);
    } else if (timer.current) {
      clearInterval(timer.current);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [state]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{ padding: 16, borderRadius: 12, background: "var(--elevated)", border: "1px solid var(--border)" }}>
      <div className="row gap-3" style={{ alignItems: "center" }}>
        <button onClick={() => { if (state === "idle" || state === "recorded") { setSecs(0); setState("recording"); } else if (state === "recording") setState("recorded"); }}
          style={{ width: 52, height: 52, borderRadius: 999, border: "none", cursor: "pointer", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            background: state === "recording" ? "var(--danger)" : "var(--amber)", boxShadow: state === "recording" ? "0 0 0 4px rgba(var(--danger-rgb),0.2)" : "none", transition: "all 160ms" }}
          className={state === "recording" ? "live-pulse" : ""}>
          <Icon name={state === "recording" ? "pause" : "play"} size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <div className="row gap-1" style={{ height: 36, alignItems: "center" }}>
            {Array.from({ length: 40 }).map((_, i) => {
              const active = state === "recording" || state === "recorded" || state === "playing";
              const h = active ? 6 + Math.abs(Math.sin(i * 0.9 + secs)) * 26 : 4;
              return <span key={i} style={{ flex: 1, height: h, borderRadius: 999, background: state === "recording" ? "var(--danger)" : active ? "var(--amber)" : "var(--border-strong)", transition: "height 200ms", opacity: state === "idle" ? 0.5 : 1 }} />;
            })}
          </div>
        </div>
        <span className="tabular mono" style={{ fontSize: 14, color: "var(--text-muted)", width: 48, textAlign: "right" }}>{fmt(secs)}</span>
      </div>
      <div className="row gap-2" style={{ marginTop: 12, justifyContent: "space-between" }}>
        <span style={{ fontSize: 12.5, color: state === "recording" ? "var(--danger)" : "var(--text-faint)" }}>
          {state === "idle" && "Tap to record your answer"}
          {state === "recording" && "● Recording…"}
          {state === "recorded" && "Answer recorded · ready to review"}
        </span>
        {state === "recorded" && (
          <div className="row gap-2">
            <Btn kind="ghost" size="sm" icon="play" onClick={() => { setState("playing"); setTimeout(() => setState("recorded"), 1500); }}>Play</Btn>
            <Btn kind="accentSoft" size="sm" icon="wand" onClick={() => toast({ title: "Analysing your answer", tone: "ai", loading: true })} style={{ "--accent": "var(--amber)", "--accent-rgb": "var(--amber-rgb)" }}>Get feedback</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

export function Coach() {
  const [qIdx, setQIdx] = useState(0);
  const [job, setJob] = useState("TechCorp · Senior Software Engineer");

  return (
    <Page>
      <PageHead title="Career Coach" sub="Weekly insights, skill-gap analysis, and interview prep — powered by Foundry Intelligence." eyebrow="Week of 26 May" />

      <Card pad={0} style={{ overflow: "hidden", marginBottom: 18, border: "1px solid rgba(var(--amber-rgb),0.25)" }}>
        <div style={{ padding: 24, background: "linear-gradient(120deg, rgba(245,158,11,0.13), rgba(139,92,246,0.06) 60%, transparent)" }}>
          <AiTag label="Weekly career insight" />
          <h2 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.6px", lineHeight: 1.2, margin: "12px 0 8px", maxWidth: 640 }}>
            Your match rate climbed <span style={{ color: "var(--success)" }}>+20%</span> after tailoring resumes
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 600 }}>{COACH.insightBody}</p>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {COACH.stats.map((s) => <StatTile key={s.label} s={s} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Card pad={18}><SectionTitle icon="line-chart">Applications over time</SectionTitle><AreaChart data={COACH.appsOverTime} labels={COACH.weekLabels} color="var(--primary)" height={150} showDots valueFmt={(v) => `${v} apps`} /></Card>
        <Card pad={18}><SectionTitle icon="bar-chart">Match-rate trend</SectionTitle><AreaChart data={COACH.matchTrend} labels={COACH.weekLabels} color="var(--success)" height={150} showDots valueFmt={(v) => `${v}%`} /></Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Card pad={18}>
          <SectionTitle icon="target" sub="from 142 job descriptions">Skill gaps</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {COACH.skillGaps.map((g) => (
              <div key={g.skill} className="row gap-3" style={{ alignItems: "center" }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: g.have ? "var(--fill-success)" : "var(--fill-warning)", color: g.have ? "var(--success)" : "var(--warning)" }}>
                  <Icon name={g.have ? "check" : "plus"} size={13} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row gap-2"><span style={{ fontSize: 13.5, fontWeight: 600 }}>{g.skill}</span><span style={{ fontSize: 12, color: "var(--text-faint)" }}>seen {g.seen}×</span></div>
                  {g.resource && <div style={{ fontSize: 12.5, color: "var(--amber)", marginTop: 1 }}>{g.resource}</div>}
                  {g.have && <div style={{ fontSize: 12.5, color: "var(--success)", marginTop: 1 }}>On your resume</div>}
                </div>
                {!g.have && <Btn kind="ghost" size="sm" iconRight="arrow-right">Learn</Btn>}
              </div>
            ))}
          </div>
        </Card>

        <Card pad={18}>
          <SectionTitle icon="zap">Networking nudges</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {COACH.nudges.map((n, i) => (
              <div key={i} className="row gap-3" style={{ alignItems: "flex-start", padding: 12, borderRadius: 10, background: "var(--elevated)", border: "1px solid var(--border)" }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: n.done === n.total ? "var(--fill-success)" : "rgba(var(--amber-rgb),0.14)", color: n.done === n.total ? "var(--success)" : "var(--amber)" }}>
                  <Icon name={n.done === n.total ? "check" : "flag"} size={14} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, lineHeight: 1.4 }}>{n.text}</div>
                  {n.total > 1 && <div style={{ marginTop: 8 }}><ProgressBar value={(n.done / n.total) * 100} tone="amber" height={5} /><div style={{ fontSize: 11.5, color: "var(--text-faint)", marginTop: 4 }}>{n.done} of {n.total} done</div></div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card pad={18}>
        <SectionTitle icon="message-square" action={<Select value={job} onChange={setJob} options={["TechCorp · Senior Software Engineer", "Nimbus · Frontend Engineer", "Voltaic · Full-Stack Engineer"]} />}>Interview prep</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div>
            <div className="row gap-2" style={{ marginBottom: 10 }}><AiTag small label="AI mock questions" /><span style={{ fontSize: 12, color: "var(--text-faint)" }}>from job description</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {COACH.mockQuestions.map((q, i) => (
                <div key={i} onClick={() => setQIdx(i)} style={{ display: "flex", gap: 10, padding: 12, borderRadius: 10, cursor: "pointer", border: `1px solid ${qIdx === i ? "rgba(var(--amber-rgb),0.4)" : "var(--border)"}`, background: qIdx === i ? "rgba(var(--amber-rgb),0.07)" : "transparent" }}>
                  <span style={{ width: 20, height: 20, borderRadius: 999, flex: "none", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", background: qIdx === i ? "var(--amber)" : "var(--fill-neutral)", color: qIdx === i ? "#fff" : "var(--text-faint)" }}>{i + 1}</span>
                  <span style={{ fontSize: 13, lineHeight: 1.45, color: qIdx === i ? "var(--text)" : "var(--text-muted)" }}>{q}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="row gap-2" style={{ marginBottom: 10 }}><span style={{ fontSize: 13, fontWeight: 600 }}>Practice your answer</span></div>
            <div style={{ padding: 14, borderRadius: 10, background: "rgba(var(--amber-rgb),0.06)", border: "1px solid rgba(var(--amber-rgb),0.2)", marginBottom: 14, fontSize: 13.5, lineHeight: 1.5 }}>
              <span style={{ color: "var(--amber)", fontWeight: 600 }}>Q{qIdx + 1}.</span> {COACH.mockQuestions[qIdx]}
            </div>
            <VoiceRecorder />
          </div>
        </div>
      </Card>
    </Page>
  );
}
