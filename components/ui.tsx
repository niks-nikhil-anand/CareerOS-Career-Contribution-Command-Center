"use client";
/* ============================================================
   CareerOS — shared UI primitives
   ============================================================ */
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";

type Tone =
  | "neutral" | "primary" | "violet" | "cyan" | "emerald"
  | "amber" | "success" | "warning" | "danger" | "accent";

/* ---------- Icon (inline Flight Icon SVG, recolored via currentColor) ---------- */
const _iconCache: Record<string, string> = {};

export function Icon({
  name, size = 16, color, style, className = "",
}: {
  name: string; size?: number; color?: string; style?: CSSProperties; className?: string;
}) {
  const [svg, setSvg] = useState<string | null>(_iconCache[name] || null);
  useEffect(() => {
    if (_iconCache[name]) {
      // hydrate from the in-memory cache when the icon name changes
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSvg(_iconCache[name]);
      return;
    }
    let alive = true;
    fetch(`/icons/${name}-16.svg`)
      .then((r) => r.text())
      .then((t) => {
        const clean = t.replace(/\swidth="16"/, "").replace(/\sheight="16"/, "");
        _iconCache[name] = clean;
        if (alive) setSvg(clean);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [name]);
  return (
    <span
      data-cos-icon
      className={`cos-icon ${className}`}
      role="img"
      aria-hidden="true"
      style={{ display: "inline-flex", width: size, height: size, flex: "none", color: color || "currentColor", ...style }}
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}

/* ---------- Logo / mark ---------- */
export function Mark({ size = 28 }: { size?: number }) {
  const id = "cosgrad";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ flex: "none" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="0.55" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" fill={`url(#${id})`} />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" fill="black" fillOpacity="0.12" />
      <path d="M16 6.5 L22 22 L16 18.2 L10 22 Z" fill="white" fillOpacity="0.96" />
      <path d="M16 6.5 L16 18.2 L10 22 Z" fill="white" fillOpacity="0.62" />
    </svg>
  );
}

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="row gap-2" style={{ alignItems: "center" }}>
      <Mark size={28} />
      {!collapsed && (
        <span style={{ fontWeight: 600, fontSize: 17, letterSpacing: "-0.3px", color: "var(--text)" }}>
          Career<span style={{ color: "var(--text-faint)", fontWeight: 600 }}>OS</span>
        </span>
      )}
    </div>
  );
}

/* ---------- Button ---------- */
type BtnKind = "primary" | "secondary" | "ghost" | "subtle" | "danger" | "accentSoft";
export function Btn({
  children, kind = "secondary", size = "md", icon, iconRight, onClick, disabled, loading, full, style, title, type = "button",
}: {
  children?: ReactNode; kind?: BtnKind; size?: "sm" | "md" | "lg"; icon?: string; iconRight?: string;
  onClick?: () => void; disabled?: boolean; loading?: boolean; full?: boolean; style?: CSSProperties; title?: string;
  type?: "button" | "submit";
}) {
  const [h, fs, pad] = size === "sm" ? [30, 13, "0 11px"] : size === "lg" ? [42, 15, "0 18px"] : [36, 14, "0 14px"];
  const kinds: Record<BtnKind, CSSProperties> = {
    primary: { background: "var(--accent)", color: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.25)" },
    secondary: { background: "var(--elevated)", color: "var(--text)", border: "1px solid var(--border-strong)" },
    ghost: { background: "transparent", color: "var(--text-muted)" },
    subtle: { background: "var(--fill-neutral)", color: "var(--text)" },
    danger: { background: "var(--fill-danger)", color: "var(--danger)", border: "1px solid rgba(var(--danger-rgb),0.3)" },
    accentSoft: { background: "rgba(var(--accent-rgb),0.14)", color: "var(--accent)", border: "1px solid rgba(var(--accent-rgb),0.25)" },
  };
  return (
    <button
      type={type} onClick={onClick} disabled={disabled || loading} title={title}
      className="cos-btn" data-kind={kind}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
        height: h, padding: pad, width: full ? "100%" : undefined,
        borderRadius: 9, fontSize: fs, fontWeight: 500, border: "1px solid transparent",
        cursor: disabled || loading ? "not-allowed" : "pointer", whiteSpace: "nowrap",
        transition: "background-color 120ms var(--ease), border-color 120ms, transform 90ms, box-shadow 120ms",
        opacity: disabled ? 0.5 : 1, ...kinds[kind], ...style,
      }}
    >
      {loading ? <Icon name="loading" size={15} className="spin" /> : icon ? <Icon name={icon} size={15} /> : null}
      {children}
      {iconRight && !loading && <Icon name={iconRight} size={15} />}
    </button>
  );
}

export function IconBtn({
  name, onClick, size = 34, iconSize = 17, active, title, style, badge,
}: {
  name: string; onClick?: () => void; size?: number; iconSize?: number; active?: boolean;
  title?: string; style?: CSSProperties; badge?: number;
}) {
  return (
    <button
      type="button" onClick={onClick} title={title} aria-label={title}
      className="cos-iconbtn"
      style={{
        position: "relative", width: size, height: size, display: "inline-flex",
        alignItems: "center", justifyContent: "center", borderRadius: 9,
        border: "1px solid transparent", cursor: "pointer",
        background: active ? "var(--fill-neutral)" : "transparent",
        color: active ? "var(--text)" : "var(--text-muted)",
        transition: "background-color 120ms, color 120ms", ...style,
      }}
    >
      <Icon name={name} size={iconSize} />
      {badge != null && (
        <span style={{
          position: "absolute", top: 4, right: 4, minWidth: 15, height: 15, padding: "0 3px",
          borderRadius: 999, background: "var(--danger)", color: "#fff", fontSize: 9.5,
          fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid var(--surface)",
        }}>{badge}</span>
      )}
    </button>
  );
}

/* ---------- Badge ---------- */
export const BADGE_TONES: Record<Tone, [string, string]> = {
  neutral: ["var(--fill-neutral)", "var(--text-muted)"],
  primary: ["var(--fill-primary)", "var(--primary)"],
  violet: ["var(--fill-violet)", "var(--violet)"],
  cyan: ["var(--fill-cyan)", "var(--cyan)"],
  emerald: ["var(--fill-emerald)", "var(--emerald)"],
  amber: ["var(--fill-amber)", "var(--amber)"],
  success: ["var(--fill-success)", "var(--success)"],
  warning: ["var(--fill-warning)", "var(--warning)"],
  danger: ["var(--fill-danger)", "var(--danger)"],
  accent: ["rgba(var(--accent-rgb),0.14)", "var(--accent)"],
};

export function Badge({
  children, tone = "neutral", icon, dot, size = "md", style,
}: {
  children?: ReactNode; tone?: Tone; icon?: string; dot?: boolean; size?: "sm" | "md"; style?: CSSProperties;
}) {
  const [bg, fg] = BADGE_TONES[tone] || BADGE_TONES.neutral;
  const h = size === "sm" ? 19 : 22;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, height: h, padding: dot ? "0 9px 0 7px" : "0 9px",
      borderRadius: 999, fontSize: size === "sm" ? 11 : 12, fontWeight: 500, lineHeight: 1,
      background: bg, color: fg, whiteSpace: "nowrap", ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: fg }} />}
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

/* ---------- Card ---------- */
export function Card({
  children, style, pad = 18, hover, onClick, accent, className = "",
}: {
  children?: ReactNode; style?: CSSProperties; pad?: number; hover?: boolean;
  onClick?: () => void; accent?: string; className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`cos-card ${className}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--r-card)", padding: pad, position: "relative",
        transition: "transform 140ms var(--ease), border-color 140ms, box-shadow 140ms",
        cursor: onClick ? "pointer" : undefined,
        transform: hover && hovered ? "translateY(-2px)" : "none",
        borderColor: hover && hovered ? "var(--border-strong)" : "var(--border)",
        boxShadow: hover && hovered ? "var(--shadow-md)" : "none",
        ...style,
      }}
    >
      {accent && <span style={{ position: "absolute", left: 0, top: 14, bottom: 14, width: 3, borderRadius: 3, background: accent }} />}
      {children}
    </div>
  );
}

/* ---------- Switch / Toggle ---------- */
export function Switch({
  checked, onChange, size = "md", disabled,
}: {
  checked: boolean; onChange: (v: boolean) => void; size?: "sm" | "md"; disabled?: boolean;
}) {
  const w = size === "sm" ? 32 : 40, h = size === "sm" ? 18 : 22, k = h - 4;
  return (
    <button
      type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: w, height: h, borderRadius: 999, border: "none", padding: 2, cursor: disabled ? "not-allowed" : "pointer",
        background: checked ? "var(--accent)" : "var(--border-strong)", position: "relative",
        transition: "background-color 160ms var(--ease)", opacity: disabled ? 0.5 : 1, flex: "none",
      }}
    >
      <span style={{
        display: "block", width: k, height: k, borderRadius: 999, background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
        transform: checked ? `translateX(${w - h}px)` : "translateX(0)",
        transition: "transform 180ms var(--ease)",
      }} />
    </button>
  );
}

/* ---------- Chip (keyword / filter) ---------- */
export function Chip({
  children, onRemove, tone = "neutral", icon, active, onClick,
}: {
  children?: ReactNode; onRemove?: () => void; tone?: Tone; icon?: string; active?: boolean; onClick?: () => void;
}) {
  const [bg, fg] = BADGE_TONES[tone] || BADGE_TONES.neutral;
  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, height: 28, padding: "0 10px",
        borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: onClick ? "pointer" : "default",
        background: active ? "rgba(var(--accent-rgb),0.16)" : bg,
        color: active ? "var(--accent)" : fg,
        border: `1px solid ${active ? "rgba(var(--accent-rgb),0.3)" : "transparent"}`,
        transition: "background-color 120ms",
      }}
    >
      {icon && <Icon name={icon} size={13} />}
      {children}
      {onRemove && (
        <span onClick={(e) => { e.stopPropagation(); onRemove(); }} style={{ display: "inline-flex", cursor: "pointer", opacity: 0.7 }}>
          <Icon name="x" size={12} />
        </span>
      )}
    </span>
  );
}

/* ---------- Avatar ---------- */
export function Avatar({ name, size = 32, color, src }: { name: string; size?: number; color?: string; src?: string }) {
  const initials = (name || "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const palette = ["#3B82F6", "#8B5CF6", "#22D3EE", "#10B981", "#F59E0B", "#EF4444"];
  const c = color || palette[(name || "").charCodeAt(0) % palette.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: 999, flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 600, color: "#fff", overflow: "hidden",
      background: src ? "none" : `linear-gradient(135deg, ${c}, ${c}bb)`,
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
    </div>
  );
}

/* ---------- Company logo tile (monogram) ---------- */
export function CompanyTile({ name, size = 38, color }: { name: string; size?: number; color?: string }) {
  const palette: Record<string, string> = { TechCorp: "#3B82F6", Nimbus: "#22D3EE", Voltaic: "#F59E0B", Meridian: "#8B5CF6", Hearth: "#10B981", Kettle: "#EF4444", Northwind: "#64748B", Lumen: "#8B5CF6", Orbital: "#3B82F6" };
  const c = color || palette[name] || "#52525B";
  return (
    <div style={{
      width: size, height: size, borderRadius: 10, flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.42, fontWeight: 700, color: c, letterSpacing: "-0.5px",
      background: `color-mix(in srgb, ${c} 16%, var(--elevated))`, border: `1px solid color-mix(in srgb, ${c} 28%, transparent)`,
    }}>
      {(name || "?")[0]}
    </div>
  );
}

/* ---------- Segmented control ---------- */
export type SegOption = string | { value: string; label?: string; icon?: string };
export function Seg({
  options, value, onChange, size = "md",
}: {
  options: SegOption[]; value: string; onChange: (v: string) => void; size?: "sm" | "md";
}) {
  const h = size === "sm" ? 30 : 34;
  return (
    <div style={{ display: "inline-flex", padding: 3, gap: 2, background: "var(--fill-neutral)", borderRadius: 10, border: "1px solid var(--border)" }}>
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.value;
        const label = typeof o === "string" ? o : o.label;
        const ic = typeof o === "object" ? o.icon : null;
        const on = v === value;
        return (
          <button key={v} type="button" onClick={() => onChange(v)} title={label}
            style={{
              height: h - 6, padding: ic && !label ? "0 8px" : "0 12px", borderRadius: 7, border: "none", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500,
              background: on ? "var(--elevated)" : "transparent",
              color: on ? "var(--text)" : "var(--text-muted)",
              boxShadow: on ? "var(--shadow-sm)" : "none", transition: "all 120ms",
            }}>
            {ic && <Icon name={ic} size={14} />}{label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Progress bar ---------- */
export function ProgressBar({ value, tone = "accent", height = 6 }: { value: number; tone?: string; height?: number }) {
  const color = tone === "accent" ? "var(--accent)" : `var(--${tone})`;
  return (
    <div style={{ height, borderRadius: 999, background: "var(--fill-neutral)", overflow: "hidden", width: "100%" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 999, transition: "width 600ms var(--ease)" }} />
    </div>
  );
}

/* ---------- Match-score ring (animated) ---------- */
export function MatchRing({
  score, size = 46, stroke = 4, showLabel = true, delay = 0,
}: {
  score: number; size?: number; stroke?: number; showLabel?: boolean; delay?: number;
}) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 60 + delay);
    return () => clearTimeout(t);
  }, [score, delay]);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? "var(--success)" : score >= 60 ? "var(--amber)" : score >= 40 ? "#F97316" : "var(--danger)";
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--fill-neutral)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - (animated / 100) * circ}
          style={{ transition: "stroke-dashoffset 900ms var(--ease)" }}
        />
      </svg>
      {showLabel && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.3, fontWeight: 600, color: "var(--text)", fontVariantNumeric: "tabular-nums",
        }}>{score}</div>
      )}
    </div>
  );
}

/* ---------- Tooltip (lightweight) ---------- */
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 7px)", left: "50%", transform: "translateX(-50%)",
          background: "var(--elevated-2)", color: "var(--text)", border: "1px solid var(--border-strong)",
          padding: "5px 9px", borderRadius: 7, fontSize: 12, whiteSpace: "nowrap", zIndex: 1000,
          boxShadow: "var(--shadow-md)", pointerEvents: "none",
        }}>{label}</span>
      )}
    </span>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({ icon, title, body, action }: { icon: string; title: string; body: string; action?: ReactNode }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 24px", maxWidth: 420, margin: "0 auto" }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(var(--accent-rgb),0.12)", color: "var(--accent)",
      }}>
        <Icon name={icon} size={26} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{title}</h3>
      <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginBottom: action ? 18 : 0, lineHeight: 1.5 }}>{body}</p>
      {action}
    </div>
  );
}

/* ---------- Skeleton line ---------- */
export function Skel({ w = "100%", h = 12, r = 6, style }: { w?: number | string; h?: number | string; r?: number; style?: CSSProperties }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}
