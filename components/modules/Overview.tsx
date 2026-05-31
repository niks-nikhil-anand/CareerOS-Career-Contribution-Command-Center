"use client";
/* ============================================================
   CareerOS — Overview / Home (bento dashboard)
   ============================================================ */
import { type ReactNode, useState } from "react";
import { ACTIVITY, COACH, JOBS } from "@/lib/data";
import type { ActivityItem } from "@/lib/types";
import { Badge, Btn, Card, CompanyTile, Icon, MatchRing, ProgressBar, Seg } from "../ui";
import { AreaChart, Funnel, Sparkline } from "../charts";
import { AiTag, Page, PageHead, SectionTitle } from "../layout";
import { useShell } from "../shell";

function GlanceCard({
  label, value, sub, icon, accent, children, onClick,
}: {
  label: string; value: string; sub?: string; icon: string; accent: string; children?: ReactNode; onClick?: () => void;
}) {
  return (
    <Card hover={!!onClick} onClick={onClick} pad={18} style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 124 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}>
          <Icon name={icon} size={17} />
        </span>
        {sub && <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{sub}</span>}
      </div>
      <div>
        <div className="tabular" style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-1px", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 5 }}>{label}</div>
      </div>
      {children}
    </Card>
  );
}

function ActivityTimeline() {
  const toneColor: Record<string, string> = { primary: "var(--primary)", ai: "var(--violet)", cyan: "var(--cyan)", success: "var(--success)", violet: "var(--violet)" };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {ACTIVITY.map((a: ActivityItem, i) => (
        <div key={a.id} style={{ display: "flex", gap: 13, paddingBottom: i < ACTIVITY.length - 1 ? 16 : 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{
              width: 30, height: 30, borderRadius: 8, flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
              background: `color-mix(in srgb, ${toneColor[a.tone]} 15%, transparent)`, color: toneColor[a.tone],
              border: a.type === "ai" ? "1px solid rgba(var(--violet-rgb),0.3)" : "none",
            }}>
              <Icon name={a.icon} size={15} />
            </span>
            {i < ACTIVITY.length - 1 && <span style={{ width: 1.5, flex: 1, background: "var(--border)", marginTop: 4, minHeight: 16 }} />}
          </div>
          <div style={{ flex: 1, paddingTop: 2 }}>
            <div className="row gap-2" style={{ flexWrap: "wrap" }}>
              <span style={{ fontSize: 13.5, fontWeight: 500 }}>{a.text}</span>
              {a.type === "ai" && <AiTag small label="AI" />}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>{a.detail}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-faint)", marginTop: 3 }}>{a.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightHero({ onNav }: { onNav: (r: string) => void }) {
  return (
    <Card pad={0} style={{ overflow: "hidden", border: "1px solid rgba(var(--amber-rgb),0.25)" }}>
      <div style={{ padding: 20, background: "linear-gradient(120deg, rgba(245,158,11,0.12), rgba(139,92,246,0.07) 70%, transparent)" }}>
        <div className="row gap-2" style={{ marginBottom: 12 }}>
          <AiTag small label="Weekly insight" />
        </div>
        <h3 style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.4px", lineHeight: 1.25, marginBottom: 8 }}>
          Your match rate climbed <span style={{ color: "var(--success)" }}>+20%</span> after tailoring resumes
        </h3>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.55, marginBottom: 16, maxWidth: 520 }}>{COACH.insightBody}</p>
        <div className="row gap-3" style={{ flexWrap: "wrap" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Match rate trend</div>
            <div style={{ width: 220 }}><AreaChart data={COACH.matchTrend} height={56} color="var(--amber)" /></div>
          </div>
          <div style={{ flex: 1 }} />
          <Btn kind="accentSoft" iconRight="arrow-right" onClick={() => onNav("coach")} style={{ "--accent": "var(--amber)", "--accent-rgb": "var(--amber-rgb)", alignSelf: "flex-end" }}>Open Career Coach</Btn>
        </div>
      </div>
    </Card>
  );
}

function ResumeCard() {
  return (
    <Card pad={18}>
      <SectionTitle icon="file-text" action={<Btn kind="ghost" size="sm" icon="reload">Replace</Btn>}>Base resume</SectionTitle>
      <div className="row gap-3" style={{ alignItems: "center" }}>
        <div style={{ width: 46, height: 58, borderRadius: 7, background: "var(--elevated)", border: "1px solid var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", position: "relative" }}>
          <Icon name="file-text" size={20} style={{ color: "var(--text-faint)" }} />
          <span style={{ position: "absolute", bottom: -7, right: -7, width: 20, height: 20, borderRadius: 999, background: "var(--success)", border: "2px solid var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="check" size={11} style={{ color: "#fff" }} />
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Alex_Morgan_SWE.pdf</div>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>Uploaded 12 Mar · 2 pages · parsed</div>
          <div className="row gap-2" style={{ marginTop: 8 }}>
            <Btn kind="secondary" size="sm" icon="eye">Preview</Btn>
            <Btn kind="ghost" size="sm" icon="download">Download</Btn>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function Overview() {
  const { scanning, runScan, nav } = useShell();
  const [layout, setLayout] = useState("bento");
  const funnelStages = [
    { label: "Saved", value: 14, color: "var(--text-faint)" },
    { label: "Applied", value: 6, color: "var(--primary)" },
    { label: "Interview", value: 2, color: "var(--violet)" },
    { label: "Offer", value: 1, color: "var(--success)" },
  ];

  const glance = (
    <>
      <GlanceCard label="Jobs found today" value="7" sub="Germany watcher" icon="target" accent="var(--primary)" onClick={() => nav("jobs")}>
        <div className="row gap-1" style={{ color: "var(--success)", fontSize: 12 }}><Icon name="arrow-up" size={12} />3 strong matches</div>
      </GlanceCard>
      <GlanceCard label="Issues in progress" value="1" sub="of 6 matched" icon="git-branch" accent="var(--violet)" onClick={() => nav("opensource")}>
        <ProgressBar value={40} tone="violet" />
      </GlanceCard>
      <GlanceCard label="Follow-ups due" value="2" sub="outreach" icon="at-sign" accent="var(--emerald)" onClick={() => nav("outreach")}>
        <Badge tone="warning" size="sm" dot>1 overdue</Badge>
      </GlanceCard>
      <GlanceCard label="Social opportunities" value="4" sub="new" icon="globe" accent="var(--cyan)" onClick={() => nav("social")}>
        <div className="row gap-1" style={{ fontSize: 12, color: "var(--text-muted)" }}>Twitter · LinkedIn · IG</div>
      </GlanceCard>
    </>
  );

  const pipelineCard = (
    <Card pad={18}>
      <SectionTitle icon="bar-chart" action={<Btn kind="ghost" size="sm" iconRight="arrow-right" onClick={() => nav("jobs")}>Tracker</Btn>}>Applications by stage</SectionTitle>
      <Funnel stages={funnelStages} />
    </Card>
  );

  const topMatch = JOBS[0];
  const topMatchCard = (
    <Card pad={18} hover onClick={() => nav("jobs")}>
      <SectionTitle icon="star">Top match today</SectionTitle>
      <div className="row gap-3" style={{ alignItems: "center" }}>
        <MatchRing score={topMatch.score} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row gap-2"><CompanyTile name={topMatch.company} size={26} /><span style={{ fontSize: 14, fontWeight: 600 }}>{topMatch.title}</span></div>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 4 }}>{topMatch.company} · {topMatch.loc}</div>
        </div>
        <Badge tone="violet" icon="wand">Tailored</Badge>
      </div>
    </Card>
  );

  const weekCard = (
    <Card pad={18}>
      <SectionTitle icon="zap">This week</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {COACH.stats.map((s) => (
          <div key={s.label} className="row gap-2" style={{ justifyContent: "space-between" }}>
            <div><div className="tabular" style={{ fontSize: 22, fontWeight: 600 }}>{s.value}</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.label}</div></div>
            <Sparkline data={s.spark} width={50} height={20} color={`var(--${s.tone === "success" ? "success" : s.tone})`} />
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <Page>
      <PageHead
        eyebrow="Tuesday, 30 May 2026"
        title="Good morning, Alex"
        sub="Your search is running. Here's what moved while you were away."
        actions={
          <>
            <div style={{ display: "inline-flex" }}>
              <Seg size="sm" value={layout} onChange={setLayout} options={[{ value: "bento", label: "Bento", icon: "grid" }, { value: "column", label: "Columns", icon: "list" }, { value: "feed", label: "Feed", icon: "activity" }]} />
            </div>
            <Btn kind="primary" icon="search" onClick={runScan} loading={scanning}>{scanning ? "Scanning" : "Scan now"}</Btn>
          </>
        }
      />

      {layout === "bento" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ gridColumn: "span 4", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>{glance}</div>
          <div style={{ gridColumn: "span 2" }}><InsightHero onNav={nav} /></div>
          <div style={{ gridColumn: "span 2", gridRow: "span 2" }}>
            <Card pad={18} style={{ height: "100%" }}>
              <SectionTitle icon="activity" sub="automated + AI">Recent activity</SectionTitle>
              <ActivityTimeline />
            </Card>
          </div>
          <div style={{ gridColumn: "span 2" }}>{topMatchCard}</div>
          <div style={{ gridColumn: "span 2" }}>{pipelineCard}</div>
          <div style={{ gridColumn: "span 2" }}>{weekCard}</div>
          <div style={{ gridColumn: "span 2" }}><ResumeCard /></div>
        </div>
      )}

      {layout === "column" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 16 }}>{glance}</div>
          <div style={{ display: "grid", gap: 16 }}>{topMatchCard}{pipelineCard}<ResumeCard /></div>
          <div style={{ display: "grid", gap: 16 }}>
            <InsightHero onNav={nav} />
            <Card pad={18}><SectionTitle icon="activity">Recent activity</SectionTitle><ActivityTimeline /></Card>
          </div>
        </div>
      )}

      {layout === "feed" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 22, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 16 }}>
            <InsightHero onNav={nav} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>{glance}</div>
            {topMatchCard}
            {pipelineCard}
          </div>
          <div style={{ display: "grid", gap: 16 }}>
            <Card pad={18}><SectionTitle icon="activity">Activity</SectionTitle><ActivityTimeline /></Card>
            <ResumeCard />
          </div>
        </div>
      )}
    </Page>
  );
}
