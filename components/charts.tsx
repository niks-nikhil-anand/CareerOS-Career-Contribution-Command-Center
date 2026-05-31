"use client";
/* ============================================================
   CareerOS — charts (hand-built SVG, theme-aware)
   ============================================================ */
import { type ReactNode, useId, useState } from "react";

/* ---------- Area / line chart ---------- */
export function AreaChart({
  data, height = 140, color = "var(--accent)", labels, showDots, valueFmt = (v) => String(v),
}: {
  data: number[]; height?: number; color?: string; labels?: string[]; showDots?: boolean;
  valueFmt?: (v: number) => string;
}) {
  const id = useId().replace(/:/g, "");
  const w = 100, h = 100;
  const max = Math.max(...data) * 1.12 || 1;
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((d, i) => [(i / (data.length - 1)) * w, h - ((d - min) / range) * h]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div style={{ width: "100%" }}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" width="100%" height={height} style={{ overflow: "visible", display: "block" }}
        onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="0" y1={h * g} x2={w} y2={h * g} stroke="var(--border)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        ))}
        <path d={area} fill={`url(#area-${id})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {showDots && pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill="var(--surface)" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        ))}
        {pts.map((p, i) => (
          <rect key={i} x={p[0] - (w / data.length) / 2} y="0" width={w / data.length} height={h} fill="transparent"
            onMouseEnter={() => setHover(i)} style={{ cursor: "pointer" }} />
        ))}
        {hover != null && (
          <line x1={pts[hover][0]} y1="0" x2={pts[hover][0]} y2={h} stroke={color} strokeWidth="1" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" opacity="0.6" />
        )}
      </svg>
      {labels && (
        <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
          {labels.map((l, i) => <span key={i} style={{ fontSize: 11, color: "var(--text-faint)" }}>{l}</span>)}
        </div>
      )}
      {hover != null && labels && (
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
          <strong style={{ color: "var(--text)" }}>{valueFmt(data[hover])}</strong> · {labels[hover]}
        </div>
      )}
    </div>
  );
}

/* ---------- Bar chart ---------- */
export function BarChart({
  data, height = 140, color = "var(--accent)", labels,
}: {
  data: number[]; height?: number; color?: string; labels?: string[];
}) {
  const max = Math.max(...data) || 1;
  return (
    <div>
      <div className="row" style={{ alignItems: "flex-end", gap: 8, height }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
            <div className="cos-bar" style={{
              height: `${(d / max) * 100}%`, background: color, borderRadius: "5px 5px 2px 2px",
              opacity: 0.9, transition: "height 700ms var(--ease)", minHeight: 3,
            }} />
          </div>
        ))}
      </div>
      {labels && (
        <div className="row" style={{ gap: 8, marginTop: 8 }}>
          {labels.map((l, i) => <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 10.5, color: "var(--text-faint)" }}>{l}</span>)}
        </div>
      )}
    </div>
  );
}

/* ---------- Sparkline ---------- */
export function Sparkline({
  data, width = 80, height = 28, color = "var(--accent)",
}: {
  data: number[]; width?: number; height?: number; color?: string;
}) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - ((d - min) / range) * height}`).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * height} r="2.2" fill={color} />
    </svg>
  );
}

/* ---------- Mini funnel (stages) ---------- */
export function Funnel({ stages }: { stages: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...stages.map((s) => s.value)) || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {stages.map((s) => (
        <div key={s.label} className="row gap-3">
          <div style={{ width: 74, fontSize: 12.5, color: "var(--text-muted)", flex: "none" }}>{s.label}</div>
          <div style={{ flex: 1, height: 22, background: "var(--fill-neutral)", borderRadius: 6, overflow: "hidden", position: "relative" }}>
            <div style={{ width: `${(s.value / max) * 100}%`, height: "100%", background: s.color, borderRadius: 6, transition: "width 700ms var(--ease)", minWidth: s.value ? 22 : 0 }} />
          </div>
          <div className="tabular" style={{ width: 24, textAlign: "right", fontSize: 13, fontWeight: 600 }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Donut ---------- */
export function Donut({
  segments, size = 110, stroke = 14, center,
}: {
  segments: { value: number; color: string }[]; size?: number; stroke?: number; center?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  // precompute each segment's length + cumulative offset (no render-time mutation)
  const arcs = segments.reduce<{ len: number; offset: number; color: string }[]>((acc, s) => {
    const len = (s.value / total) * circ;
    const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].len : 0;
    acc.push({ len, offset, color: s.color });
    return acc;
  }, []);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--fill-neutral)" strokeWidth={stroke} />
        {arcs.map((a, i) => (
          <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={a.color} strokeWidth={stroke}
            strokeDasharray={`${a.len} ${circ - a.len}`} strokeDashoffset={-a.offset}
            style={{ transition: "stroke-dasharray 800ms var(--ease)" }} />
        ))}
      </svg>
      {center && <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>{center}</div>}
    </div>
  );
}
