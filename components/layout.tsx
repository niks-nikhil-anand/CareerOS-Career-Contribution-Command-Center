"use client";
/* ============================================================
   CareerOS — page layout helpers
   ============================================================ */
import { type CSSProperties, type ReactNode } from "react";
import { Icon } from "./ui";

export function Page({ children, max = 1280, pad = true }: { children: ReactNode; max?: number; pad?: boolean }) {
  return (
    <div style={{ maxWidth: max, margin: "0 auto", padding: pad ? "24px 28px 64px" : 0 }}>{children}</div>
  );
}

export function PageHead({
  title, sub, actions, eyebrow,
}: {
  title: string; sub?: string; actions?: ReactNode; eyebrow?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
      <div>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
        <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.5px" }}>{title}</h2>
        {sub && <p style={{ color: "var(--text-muted)", marginTop: 5, fontSize: 14, maxWidth: 560 }}>{sub}</p>}
      </div>
      {actions && <div className="row gap-2" style={{ flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

export function SectionTitle({
  children, sub, action, icon,
}: {
  children: ReactNode; sub?: string; action?: ReactNode; icon?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
      <div className="row gap-2" style={{ alignItems: "center" }}>
        {icon && <span style={{ color: "var(--accent)", display: "flex" }}><Icon name={icon} size={17} /></span>}
        <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.2px" }}>{children}</h3>
        {sub && <span style={{ color: "var(--text-faint)", fontSize: 13 }}>{sub}</span>}
      </div>
      {action}
    </div>
  );
}

/* AI label — the consistent "this came from AI" marker */
export function AiTag({ label = "Foundry Intelligence", small }: { label?: string; small?: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, height: small ? 19 : 22, padding: "0 9px",
      borderRadius: 999, fontSize: small ? 11 : 12, fontWeight: 500,
      background: "rgba(var(--violet-rgb),0.13)", color: "var(--violet)",
    }}>
      <Icon name="wand" size={small ? 11 : 12} />{label}
    </span>
  );
}

/* Filter / toolbar bar */
export function Toolbar({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="row gap-2" style={{ flexWrap: "wrap", marginBottom: 16, ...style }}>{children}</div>
  );
}

/* labeled field for forms */
export function Field({
  label, hint, children, required,
}: {
  label: string; hint?: string; children: ReactNode; required?: boolean;
}) {
  return (
    <label style={{ display: "block" }}>
      <div className="row gap-2" style={{ marginBottom: 6, justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{label}{required && <span style={{ color: "var(--danger)" }}> *</span>}</span>
        {hint && <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{hint}</span>}
      </div>
      {children}
    </label>
  );
}

export function Input({
  value, onChange, placeholder, icon, type = "text", style,
}: {
  value: string; onChange?: (v: string) => void; placeholder?: string; icon?: string;
  type?: string; style?: CSSProperties;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 12px", borderRadius: "var(--r-input)", background: "var(--elevated)", border: "1px solid var(--border-strong)", ...style }}>
      {icon && <Icon name={icon} size={15} style={{ color: "var(--text-faint)" }} />}
      <input type={type} value={value} onChange={(e) => onChange && onChange(e.target.value)} placeholder={placeholder}
        style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 14, fontFamily: "var(--font)" }} />
    </div>
  );
}

export function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{
        appearance: "none", height: 38, padding: "0 32px 0 12px", borderRadius: "var(--r-input)",
        background: "var(--elevated)", border: "1px solid var(--border-strong)", color: "var(--text)",
        fontSize: 13.5, fontFamily: "var(--font)", cursor: "pointer",
      }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-faint)", display: "flex" }}>
        <Icon name="chevron-down" size={15} />
      </span>
    </div>
  );
}
