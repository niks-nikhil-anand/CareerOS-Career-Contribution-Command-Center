"use client";
/* ============================================================
   CareerOS — Contact Finder & Outreach (mini-CRM)
   ============================================================ */
import { useState } from "react";
import { CONTACTS } from "@/lib/data";
import type { Contact, CrmStatus, VerifyState } from "@/lib/types";
import { Avatar, Badge, Btn, Card, Chip, Icon, IconBtn, Seg, Skel, Switch } from "../ui";
import { AiTag, Input, Page, PageHead, SectionTitle, Toolbar } from "../layout";
import { SlideHeader, SlideOver, toast } from "../overlays";

const VERIFY: Record<VerifyState, { label: string; tone: "success" | "warning" | "neutral"; icon: string }> = {
  verified: { label: "Verified", tone: "success", icon: "check-circle" },
  risky: { label: "Risky", tone: "warning", icon: "alert-triangle" },
  unknown: { label: "Unknown", tone: "neutral", icon: "help" },
};
const CRM_STATUS: Record<CrmStatus, { label: string; tone: "violet" | "primary" | "success" | "cyan" }> = {
  drafted: { label: "Drafted", tone: "violet" }, sent: { label: "Sent", tone: "primary" },
  replied: { label: "Replied", tone: "success" }, "followed-up": { label: "Followed up", tone: "cyan" },
};
const TEMPLATES = ["informational", "job inquiry", "networking"];

function VerifyBadge({ v }: { v: VerifyState }) {
  const m = VERIFY[v];
  return <Badge tone={m.tone} size="sm" icon={m.icon}>{m.label}</Badge>;
}

function ContactDetail({ contact, onClose, onStatus }: { contact: Contact; onClose: () => void; onStatus: (id: string, status: CrmStatus) => void }) {
  const [template, setTemplate] = useState(contact.template);
  const [draft, setDraft] = useState(contact.draft);
  const [generating, setGenerating] = useState(false);
  const [sent, setSent] = useState(contact.status !== "drafted");

  function regen(t: string) {
    setTemplate(t);
    setGenerating(true);
    toast({ title: `Drafting ${t} email`, tone: "ai", loading: true });
    setTimeout(() => { setGenerating(false); toast({ title: "Draft ready", tone: "ai", icon: "wand" }); }, 1700);
  }
  function send() {
    setSent(true);
    onStatus(contact.id, "sent");
    toast({ title: "Email sent", body: `Delivered to ${contact.email} via SMTP`, tone: "success", icon: "at-sign" });
  }

  return (
    <SlideOver open={!!contact} onClose={onClose} width={560} accent="emerald">
      <SlideHeader title={contact.name} sub={`${contact.title} · ${contact.company}`} onClose={onClose}
        badge={<VerifyBadge v={contact.verify} />} />
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flex: "none" }}>
        <Avatar name={contact.name} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row gap-2" style={{ fontSize: 13, color: "var(--text-muted)" }}><Icon name="at-sign" size={14} /><span className="mono" style={{ fontSize: 12.5 }}>{contact.email}</span></div>
          <div className="row gap-2" style={{ marginTop: 5 }}>
            {contact.linkedin && <Chip tone="primary" icon="link">LinkedIn</Chip>}
            <Badge tone={CRM_STATUS[contact.status].tone} size="sm">{CRM_STATUS[contact.status].label}</Badge>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div className="row gap-2" style={{ justifyContent: "space-between", marginBottom: 9 }}>
            <AiTag label="AI-drafted email" /><span style={{ fontSize: 12, color: "var(--text-faint)" }}>Template</span>
          </div>
          <div className="row gap-2" style={{ marginBottom: 12, flexWrap: "wrap" }}>
            {TEMPLATES.map((t) => <Chip key={t} active={template === t} onClick={() => regen(t)}>{t}</Chip>)}
          </div>
          <div style={{ position: "relative" }}>
            {generating && <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "var(--elevated)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}><span className="ai-shimmer" style={{ fontWeight: 600 }}>Foundry Intelligence is writing…</span></div>}
            <input value={`Re: ${contact.company} — quick hello`} readOnly style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: "8px 8px 0 0", background: "var(--elevated)", border: "1px solid var(--border-strong)", borderBottom: "none", color: "var(--text-muted)", fontSize: 13, outline: "none", fontFamily: "var(--font)" }} />
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={12}
              style={{ width: "100%", resize: "vertical", padding: 14, borderRadius: "0 0 10px 10px", background: "var(--elevated)", border: "1px solid var(--border-strong)", color: "var(--text)", fontSize: 13.5, lineHeight: 1.6, fontFamily: "var(--font)", outline: "none" }} />
          </div>
        </div>

        <div className="row gap-2" style={{ padding: 12, borderRadius: 10, background: "var(--fill-warning)", border: "1px solid rgba(var(--warning-rgb),0.25)" }}>
          <Icon name="clock" size={16} style={{ color: "var(--warning)" }} />
          <span style={{ fontSize: 13, color: "var(--text)", flex: 1 }}>Remind me to follow up in <b>3 days</b> if no reply</span>
          <Switch size="sm" checked={true} onChange={() => {}} />
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Communication history</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {contact.history.map((h, i) => (
              <div key={i} className="row gap-2" style={{ alignItems: "flex-start", paddingBottom: i < contact.history.length - 1 ? 12 : 0 }}>
                <div className="col" style={{ alignItems: "center" }}>
                  <span style={{ width: 24, height: 24, borderRadius: 999, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: h.tone === "ai" ? "rgba(var(--violet-rgb),0.16)" : h.tone === "success" ? "var(--fill-success)" : "var(--fill-primary)", color: h.tone === "ai" ? "var(--violet)" : h.tone === "success" ? "var(--success)" : "var(--primary)" }}>
                    <Icon name={h.tone === "ai" ? "wand" : h.tone === "success" ? "check" : "at-sign"} size={12} />
                  </span>
                  {i < contact.history.length - 1 && <span style={{ width: 1.5, flex: 1, background: "var(--border)", minHeight: 14, marginTop: 3 }} />}
                </div>
                <div style={{ paddingTop: 2 }}><div style={{ fontSize: 13 }}>{h.t}</div><div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{h.date}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: 16, borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center", flex: "none" }}>
        {sent ? <div className="row gap-2" style={{ flex: 1, fontSize: 13, color: "var(--success)" }}><Icon name="check-circle" size={16} />Sent via SMTP</div>
          : <span style={{ flex: 1, fontSize: 12.5, color: "var(--text-faint)" }}>SMTP: smtp.gmail.com · ready</span>}
        <Btn kind="secondary" icon="duplicate">Copy</Btn>
        <Btn kind="primary" icon="arrow-right" onClick={send} style={{ "--accent": "var(--emerald)" }}>Send email</Btn>
      </div>
    </SlideOver>
  );
}

function SearchPanel({ onPick }: { onPick: (c: Contact) => void }) {
  const [q, setQ] = useState("techcorp.com");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Contact[]>(CONTACTS.filter((c) => c.company === "TechCorp"));

  function run() {
    setSearching(true);
    setResults([]);
    setTimeout(() => { setSearching(false); setResults(CONTACTS.filter((c) => c.company === "TechCorp")); }, 1400);
  }

  return (
    <Card pad={18}>
      <SectionTitle icon="search">Find contacts</SectionTitle>
      <div className="row gap-2" style={{ marginBottom: 16 }}>
        <Input value={q} onChange={setQ} placeholder="Company name or domain" icon="org" style={{ flex: 1 }} />
        <Btn kind="primary" icon="search" onClick={run} loading={searching} style={{ "--accent": "var(--emerald)" }}>Search</Btn>
      </div>
      {searching ? (
        <div style={{ display: "grid", gap: 10 }}>{[1, 2, 3].map((i) => <div key={i} className="row gap-3" style={{ padding: 12 }}><Skel w={36} h={36} r={999} /><div style={{ flex: 1 }}><Skel w="40%" h={13} /><div style={{ height: 6 }} /><Skel w="60%" h={11} /></div></div>)}</div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {results.map((c) => (
            <div key={c.id} className="cos-row-hover" onClick={() => onPick(c)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 10, cursor: "pointer", border: "1px solid var(--border)" }}>
              <Avatar name={c.name} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row gap-2"><span style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</span><Badge tone="emerald" size="sm">{c.title}</Badge></div>
                <div className="row gap-2" style={{ marginTop: 3, fontSize: 12.5, color: "var(--text-muted)" }}><span className="mono" style={{ fontSize: 12 }}>{c.email}</span></div>
              </div>
              <VerifyBadge v={c.verify} />
              <IconBtn name="arrow-right" size={30} iconSize={15} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function Outreach() {
  const [contacts, setContacts] = useState<Contact[]>(CONTACTS);
  const [open, setOpen] = useState<Contact | null>(null);
  const [tab, setTab] = useState("find");
  const [statusFilter, setStatusFilter] = useState("All");

  function setStatus(id: string, status: CrmStatus) {
    setContacts((arr) => arr.map((c) => (c.id === id ? { ...c, status } : c)));
    setOpen((o) => (o && o.id === id ? { ...o, status } : o));
  }

  const filtered = statusFilter === "All" ? contacts : contacts.filter((c) => CRM_STATUS[c.status].label === statusFilter);

  return (
    <Page>
      <PageHead title="Outreach" sub="Find the right people, draft personalized emails, and never miss a follow-up."
        actions={<Btn kind="secondary" icon="plus">Add contact</Btn>} />

      <div style={{ marginBottom: 18 }}>
        <Seg value={tab} onChange={setTab} options={[{ value: "find", label: "Find contacts", icon: "search" }, { value: "crm", label: "CRM", icon: "users" }]} />
      </div>

      {tab === "find" && <SearchPanel onPick={setOpen} />}

      {tab === "crm" && (
        <>
          <Toolbar>
            {["All", "Drafted", "Sent", "Replied", "Followed up"].map((s) => <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{s}</Chip>)}
          </Toolbar>
          <Card pad={0} style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Contact", "Company", "Email", "Verify", "Status", "Last activity"].map((h) => <th key={h} style={{ textAlign: "left", padding: "11px 16px", fontSize: 11, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} onClick={() => setOpen(c)} className="cos-row-hover" style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                    <td style={{ padding: "10px 16px" }}><div className="row gap-2"><Avatar name={c.name} size={28} /><div><div style={{ fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: 12, color: "var(--text-faint)" }}>{c.title}</div></div></div></td>
                    <td style={{ padding: "10px 16px", color: "var(--text-muted)" }}>{c.company}</td>
                    <td style={{ padding: "10px 16px" }}><span className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.email}</span></td>
                    <td style={{ padding: "10px 16px" }}><VerifyBadge v={c.verify} /></td>
                    <td style={{ padding: "10px 16px" }}><Badge tone={CRM_STATUS[c.status].tone} size="sm">{CRM_STATUS[c.status].label}</Badge></td>
                    <td style={{ padding: "10px 16px", color: "var(--text-faint)" }}>{c.history[c.history.length - 1].date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {open && <ContactDetail contact={open} onClose={() => setOpen(null)} onStatus={setStatus} />}
    </Page>
  );
}
