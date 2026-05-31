"use client";
/* ============================================================
   CareerOS — Settings
   ============================================================ */
import { type ReactNode, useState } from "react";
import { WATCHERS } from "@/lib/data";
import { Badge, Btn, Card, Icon, IconBtn, Seg, Switch } from "../ui";
import { Field, Page, PageHead, SectionTitle, Select } from "../layout";
import { toast } from "../overlays";
import { useShell } from "../shell";

function Row({
  icon, iconColor, title, sub, right, status,
}: {
  icon?: string; iconColor?: string; title: string; sub?: string; right?: ReactNode; status?: ReactNode;
}) {
  return (
    <div className="row gap-3" style={{ padding: "14px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
      {icon && <span style={{ width: 36, height: 36, borderRadius: 9, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: `color-mix(in srgb, ${iconColor || "var(--text-faint)"} 14%, transparent)`, color: iconColor || "var(--text-muted)" }}><Icon name={icon} size={17} /></span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row gap-2"><span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>{status}</div>
        {sub && <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

export function Settings() {
  const { theme, toggleTheme } = useShell();
  const [tab, setTab] = useState("general");
  const [provider, setProvider] = useState("Claude (Anthropic)");
  const [showKey, setShowKey] = useState(false);
  const tabs = [{ value: "general", label: "General" }, { value: "scans", label: "Scans" }, { value: "accounts", label: "Connections" }, { value: "ai", label: "AI & keys" }];

  return (
    <Page max={920}>
      <PageHead title="Settings" sub="Manage your workspace, scans, connected accounts, and AI provider." />
      <div style={{ marginBottom: 22 }}><Seg value={tab} onChange={setTab} options={tabs} /></div>

      {tab === "general" && (
        <Card pad={20}>
          <SectionTitle icon="settings">Appearance</SectionTitle>
          <Row icon="globe" iconColor="var(--primary)" title="Theme" sub="Choose how CareerOS looks"
            right={<Seg size="sm" value={theme} onChange={(v) => v !== theme && toggleTheme()} options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} />} />
          <Row icon="bell" iconColor="var(--violet)" title="Scan-complete notifications" sub="Notify me when a scan finds new jobs" right={<Switch checked={true} onChange={() => {}} />} />
          <Row icon="zap" iconColor="var(--amber)" title="Weekly career insight email" sub="A Monday digest of your search momentum" right={<Switch checked={true} onChange={() => {}} />} />
          <Row icon="lock" iconColor="var(--emerald)" title="Require PIN on launch" sub="Lock CareerOS behind a 4-digit PIN" right={<Switch checked={false} onChange={() => {}} />} />
        </Card>
      )}

      {tab === "scans" && (
        <Card pad={20}>
          <SectionTitle icon="search" action={<Btn kind="secondary" size="sm" icon="plus">New watcher</Btn>}>Scan schedules</SectionTitle>
          {WATCHERS.map((w) => (
            <Row key={w.id} icon="target" iconColor={w.active ? "var(--success)" : "var(--text-faint)"} title={w.name}
              sub={`${w.interval} · ${w.platforms.join(", ")}`}
              status={<Badge tone={w.active ? "success" : "neutral"} size="sm" dot>{w.active ? "Active" : "Paused"}</Badge>}
              right={<span style={{ fontSize: 12.5, color: "var(--text-faint)" }}>{w.nextRun}</span>} />
          ))}
        </Card>
      )}

      {tab === "accounts" && (
        <div style={{ display: "grid", gap: 16 }}>
          <Card pad={20}>
            <SectionTitle icon="link">Connected accounts</SectionTitle>
            <Row icon="git-branch" iconColor="var(--violet)" title="GitHub" sub="alexmorgan · monitoring 3 repos" status={<Badge tone="success" size="sm" icon="check-circle">Connected</Badge>} right={<Btn kind="ghost" size="sm">Disconnect</Btn>} />
            <Row icon="at-sign" iconColor="var(--emerald)" title="SMTP (email)" sub="smtp.gmail.com · alex@gmail.com" status={<Badge tone="success" size="sm" icon="check-circle">Connected</Badge>} right={<Btn kind="ghost" size="sm">Edit</Btn>} />
            <Row icon="message-square" iconColor="var(--cyan)" title="Twitter / X" sub="@alexmorgan_dev" status={<Badge tone="success" size="sm" icon="check-circle">Connected</Badge>} right={<Btn kind="ghost" size="sm">Disconnect</Btn>} />
            <Row icon="users" iconColor="var(--primary)" title="LinkedIn" sub="Read-only feed access" status={<Badge tone="success" size="sm" icon="check-circle">Connected</Badge>} right={<Btn kind="ghost" size="sm">Disconnect</Btn>} />
            <Row icon="globe" iconColor="var(--text-faint)" title="Instagram" sub="Not connected" status={<Badge tone="neutral" size="sm">Disconnected</Badge>} right={<Btn kind="secondary" size="sm">Connect</Btn>} />
          </Card>
        </div>
      )}

      {tab === "ai" && (
        <Card pad={20}>
          <SectionTitle icon="wand">AI provider</SectionTitle>
          <div style={{ display: "grid", gap: 18, marginTop: 4 }}>
            <Field label="LLM provider" hint="Used for tailoring, drafts & coaching"><Select value={provider} onChange={setProvider} options={["Claude (Anthropic)", "GPT-4o (OpenAI)", "Llama 3 (local)", "Mistral Large"]} /></Field>
            <Field label="API key">
              <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 12px", borderRadius: 8, background: "var(--elevated)", border: "1px solid var(--border-strong)" }}>
                <Icon name="key" size={15} style={{ color: "var(--text-faint)" }} />
                <input type={showKey ? "text" : "password"} defaultValue="sk-ant-api03-x7Kp9MqLz" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 14, fontFamily: "var(--mono)" }} />
                <IconBtn name="eye" size={28} iconSize={15} onClick={() => setShowKey((s) => !s)} title="Toggle visibility" />
                <Badge tone="success" size="sm" icon="check-circle">Valid</Badge>
              </div>
            </Field>
            <div className="row gap-2" style={{ padding: 12, borderRadius: 10, background: "rgba(var(--violet-rgb),0.07)", border: "1px solid rgba(var(--violet-rgb),0.2)" }}>
              <Icon name="info" size={15} style={{ color: "var(--violet)" }} />
              <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Keys are stored encrypted on your self-hosted instance and never leave your server.</span>
            </div>
            <div className="row gap-2"><Btn kind="primary" icon="check" onClick={() => toast({ title: "Settings saved", tone: "success" })}>Save changes</Btn><Btn kind="ghost">Test connection</Btn></div>
          </div>
        </Card>
      )}
    </Page>
  );
}
