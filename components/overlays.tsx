"use client";
/* ============================================================
   CareerOS — overlays: Toasts, SlideOver, Modal, Confirm
   ============================================================ */
import { type ReactNode, useEffect, useState } from "react";
import { Btn, Icon, IconBtn } from "./ui";

export interface ToastDetail {
  title: string;
  body?: string;
  tone?: "success" | "danger" | "warning" | "info" | "ai";
  icon?: string;
  loading?: boolean;
  duration?: number;
}

interface ToastItem extends ToastDetail {
  id: number;
}

let _toastSeq = 0;

/** Fire a toast from anywhere on the client. */
export function toast(detail: ToastDetail) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cos-toast", { detail }));
  }
}

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      const id = ++_toastSeq;
      setToasts((arr) => [...arr, { id, ...detail }]);
      setTimeout(() => setToasts((arr) => arr.filter((x) => x.id !== id)), detail.duration || 3800);
    };
    window.addEventListener("cos-toast", handler);
    return () => window.removeEventListener("cos-toast", handler);
  }, []);
  const dismiss = (id: number) => setToasts((arr) => arr.filter((x) => x.id !== id));
  const toneColor: Record<string, string> = {
    success: "var(--success)", danger: "var(--danger)", warning: "var(--warning)", info: "var(--primary)", ai: "var(--violet)",
  };
  return (
    <div aria-live="polite" style={{ position: "fixed", right: 20, bottom: 20, zIndex: 4000, display: "flex", flexDirection: "column", gap: 10, width: 340, maxWidth: "calc(100vw - 40px)" }}>
      {toasts.map((t) => (
        <div key={t.id} className="rise" style={{
          display: "flex", gap: 11, alignItems: "flex-start", padding: "13px 14px",
          background: "var(--glass)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--glass-border)", borderRadius: 12, boxShadow: "var(--shadow-lg)",
        }}>
          <span style={{
            width: 30, height: 30, borderRadius: 8, flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
            background: `color-mix(in srgb, ${toneColor[t.tone || "info"]} 16%, transparent)`, color: toneColor[t.tone || "info"],
          }}>
            {t.tone === "ai" ? <Icon name="wand" size={16} /> : t.loading ? <Icon name="loading" size={16} className="spin" /> : <Icon name={t.icon || "check-circle"} size={16} />}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{t.title}</div>
            {t.body && <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.45 }}>{t.body}</div>}
          </div>
          <button onClick={() => dismiss(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: 2, display: "flex" }}>
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------- SlideOver (right drawer / mobile full sheet) ---------- */
export function SlideOver({
  open, onClose, children, width = 520, accent,
}: {
  open: boolean; onClose: () => void; children: ReactNode; width?: number; accent?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) {
      window.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 3000 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "var(--scrim)", animation: "cos-fade 180ms ease both", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }} />
      <div
        className="cos-slideover"
        style={{
          position: "absolute", top: 0, right: 0, bottom: 0, width, maxWidth: "100vw",
          background: "var(--surface)", borderLeft: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)", animation: "cos-slide-in 240ms var(--ease) both",
          display: "flex", flexDirection: "column",
          ...(accent ? { "--accent": `var(--${accent})` } : {}),
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function SlideHeader({
  title, sub, onClose, badge, accentIcon,
}: {
  title: string; sub?: string; onClose: () => void; badge?: ReactNode; accentIcon?: string;
}) {
  return (
    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: 12, flex: "none" }}>
      {accentIcon && (
        <span style={{ width: 36, height: 36, borderRadius: 9, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(var(--accent-rgb),0.14)", color: "var(--accent)" }}>
          <Icon name={accentIcon} size={18} />
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row gap-2" style={{ flexWrap: "wrap" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.2px" }}>{title}</h3>
          {badge}
        </div>
        {sub && <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 3 }}>{sub}</div>}
      </div>
      <IconBtn name="x" onClick={onClose} title="Close" />
    </div>
  );
}

/* ---------- Modal ---------- */
export function Modal({
  open, onClose, children, width = 560,
}: {
  open: boolean; onClose: () => void; children: ReactNode; width?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) {
      window.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 3100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "var(--scrim)", animation: "cos-fade 160ms ease both", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }} />
      <div className="rise" style={{
        position: "relative", width, maxWidth: "100%", maxHeight: "90vh", overflow: "auto",
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "var(--shadow-lg)",
      }}>
        {children}
      </div>
    </div>
  );
}

/* ---------- Confirm dialog ---------- */
export function ConfirmDialog({
  open, onClose, onConfirm, title, body, confirmLabel = "Confirm", danger,
}: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; body: string;
  confirmLabel?: string; danger?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} width={420}>
      <div style={{ padding: 22 }}>
        <div className="row gap-3" style={{ alignItems: "flex-start", marginBottom: 14 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: danger ? "var(--fill-danger)" : "var(--fill-warning)", color: danger ? "var(--danger)" : "var(--warning)" }}>
            <Icon name="alert-triangle" size={19} />
          </span>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 5 }}>{title}</h3>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{body}</p>
          </div>
        </div>
        <div className="row gap-2" style={{ justifyContent: "flex-end" }}>
          <Btn kind="ghost" onClick={onClose}>Cancel</Btn>
          <Btn kind={danger ? "danger" : "primary"} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Btn>
        </div>
      </div>
    </Modal>
  );
}
