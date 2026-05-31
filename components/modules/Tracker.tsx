"use client";
/* ============================================================
   CareerOS — Application Tracker (Kanban + table)
   ============================================================ */
import { type DragEvent, useState } from "react";
import type { Job, JobStatus } from "@/lib/types";
import { Badge, CompanyTile, MatchRing, Seg } from "../ui";
import { Card } from "../ui";
import { toast } from "../overlays";
import { STATUS_META } from "./jobShared";

const COLUMNS: { key: JobStatus; label: string; color: string }[] = [
  { key: "saved", label: "Saved", color: "var(--text-faint)" },
  { key: "applied", label: "Applied", color: "var(--primary)" },
  { key: "interview", label: "Interview", color: "var(--violet)" },
  { key: "offer", label: "Offer", color: "var(--success)" },
  { key: "rejected", label: "Rejected", color: "var(--danger)" },
];

function KanbanCard({
  job, onOpen, density, onDragStart, dragging,
}: {
  job: Job; onOpen: (j: Job) => void; density: string;
  onDragStart: (e: DragEvent, j: Job) => void; dragging: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, job)}
      onClick={() => onOpen(job)}
      className="cos-kanban-card"
      style={{
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 11,
        padding: density === "compact" ? "10px 12px" : 13, cursor: "grab", opacity: dragging ? 0.4 : 1,
        transition: "border-color 120ms, box-shadow 120ms, transform 120ms", display: "flex", flexDirection: "column",
        gap: density === "compact" ? 7 : 9,
      }}
    >
      <div className="row gap-2" style={{ alignItems: "flex-start" }}>
        <CompanyTile name={job.company} size={density === "compact" ? 24 : 30} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{job.title}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{job.company}</div>
        </div>
        {density !== "compact" && <MatchRing score={job.score} size={34} stroke={3} />}
      </div>
      {density !== "compact" && (
        <div className="row gap-2" style={{ justifyContent: "space-between" }}>
          <div className="row gap-1">{job.tailored && <Badge tone="violet" size="sm" icon="wand">Tailored</Badge>}</div>
          <span style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{job.posted}</span>
        </div>
      )}
      {density === "compact" && (
        <div className="row gap-2" style={{ justifyContent: "space-between" }}>
          <span className="tabular" style={{ fontSize: 12, fontWeight: 600, color: job.score >= 80 ? "var(--success)" : job.score >= 60 ? "var(--amber)" : "var(--danger)" }}>{job.score}%</span>
          <span style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{job.posted}</span>
        </div>
      )}
    </div>
  );
}

export function Tracker({
  jobs, setStatus, onOpen,
}: {
  jobs: Job[]; setStatus: (id: string, status: JobStatus) => void; onOpen: (j: Job) => void;
}) {
  const [view, setView] = useState("board");
  const [density, setDensity] = useState("comfortable");
  const [dragJob, setDragJob] = useState<Job | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  function onDragStart(e: DragEvent, job: Job) {
    setDragJob(job);
    e.dataTransfer.effectAllowed = "move";
  }
  function onDrop(colKey: JobStatus) {
    if (dragJob && dragJob.status !== colKey) {
      setStatus(dragJob.id, colKey);
      toast({ title: `Moved to ${STATUS_META[colKey].label}`, body: dragJob.title, tone: "success" });
    }
    setDragJob(null);
    setOverCol(null);
  }

  if (view === "table") {
    return (
      <>
        <div className="row gap-2" style={{ justifyContent: "flex-end", marginBottom: 14 }}>
          <Seg size="sm" value={view} onChange={setView} options={[{ value: "board", label: "Board", icon: "grid" }, { value: "table", label: "Table", icon: "list" }]} />
        </div>
        <Card pad={0} style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Role", "Company", "Match", "Status", "Updated"].map((h) => <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11.5, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {[...jobs].sort((a, b) => b.score - a.score).map((j) => (
                <tr key={j.id} onClick={() => onOpen(j)} className="cos-row-hover" style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                  <td style={{ padding: "11px 16px", fontWeight: 500 }}>{j.title}</td>
                  <td style={{ padding: "11px 16px", color: "var(--text-muted)" }}><div className="row gap-2"><CompanyTile name={j.company} size={22} />{j.company}</div></td>
                  <td style={{ padding: "11px 16px" }}><span className="tabular" style={{ fontWeight: 600, color: j.score >= 80 ? "var(--success)" : j.score >= 60 ? "var(--amber)" : "var(--danger)" }}>{j.score}%</span></td>
                  <td style={{ padding: "11px 16px" }}><Badge tone={STATUS_META[j.status].tone} size="sm">{STATUS_META[j.status].label}</Badge></td>
                  <td style={{ padding: "11px 16px", color: "var(--text-faint)" }}>{j.posted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="row gap-2" style={{ justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Drag cards between columns to update status.</span>
        <div className="row gap-2">
          <Seg size="sm" value={density} onChange={setDensity} options={[{ value: "comfortable", label: "Comfortable" }, { value: "compact", label: "Compact" }]} />
          <Seg size="sm" value={view} onChange={setView} options={[{ value: "board", label: "Board", icon: "grid" }, { value: "table", label: "Table", icon: "list" }]} />
        </div>
      </div>
      <div className="cos-kanban" style={{ display: "grid", gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(220px, 1fr))`, gap: 14, alignItems: "start", overflowX: "auto", paddingBottom: 8 }}>
        {COLUMNS.map((col) => {
          const items = jobs.filter((j) => j.status === col.key);
          return (
            <div key={col.key}
              onDragOver={(e) => { e.preventDefault(); setOverCol(col.key); }}
              onDragLeave={() => setOverCol((c) => (c === col.key ? null : c))}
              onDrop={() => onDrop(col.key)}
              style={{
                background: overCol === col.key ? "rgba(var(--accent-rgb),0.06)" : "var(--fill-neutral)",
                border: `1px solid ${overCol === col.key ? "rgba(var(--accent-rgb),0.4)" : "var(--border)"}`,
                borderRadius: 14, padding: 12, transition: "background-color 120ms, border-color 120ms", minHeight: 120,
              }}>
              <div className="row gap-2" style={{ justifyContent: "space-between", marginBottom: 12, padding: "2px 4px" }}>
                <div className="row gap-2"><span style={{ width: 8, height: 8, borderRadius: 999, background: col.color }} /><span style={{ fontSize: 13, fontWeight: 600 }}>{col.label}</span></div>
                <span className="tabular" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-faint)", background: "var(--surface)", borderRadius: 999, padding: "1px 8px" }}>{items.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {items.map((j) => <KanbanCard key={j.id} job={j} onOpen={onOpen} density={density} onDragStart={onDragStart} dragging={!!dragJob && dragJob.id === j.id} />)}
                {items.length === 0 && (
                  <div style={{ textAlign: "center", padding: "20px 8px", fontSize: 12.5, color: "var(--text-faint)", border: "1px dashed var(--border)", borderRadius: 10 }}>
                    {col.key === "saved" ? "Drop jobs here to save" : `Nothing in ${col.label.toLowerCase()}`}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
