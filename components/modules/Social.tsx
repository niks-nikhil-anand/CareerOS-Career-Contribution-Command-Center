"use client";
/* ============================================================
   CareerOS — Social Media Opportunity Scanner (feed)
   ============================================================ */
import { useState } from "react";
import { SOCIAL } from "@/lib/data";
import type { SocialItem, SocialPlatform } from "@/lib/types";
import { Avatar, Badge, Btn, Card, Chip, Icon } from "../ui";
import { AiTag, Page, PageHead, Toolbar } from "../layout";
import { SlideHeader, SlideOver, toast } from "../overlays";

const PLATFORM: Record<SocialPlatform, { tone: "cyan" | "primary" | "violet"; icon: string; color: string }> = {
  Twitter: { tone: "cyan", icon: "message-square", color: "var(--cyan)" },
  LinkedIn: { tone: "primary", icon: "users", color: "var(--primary)" },
  Instagram: { tone: "violet", icon: "globe", color: "var(--violet)" },
};

function ReplyComposer({ item, onClose }: { item: SocialItem; onClose: () => void }) {
  const [draft, setDraft] = useState(item.reply);
  const [generating, setGenerating] = useState(false);
  function regen() {
    setGenerating(true);
    toast({ title: "Drafting reply", tone: "ai", loading: true });
    setTimeout(() => { setGenerating(false); toast({ title: "Reply ready", tone: "ai", icon: "wand" }); }, 1600);
  }
  const p = PLATFORM[item.platform];
  return (
    <SlideOver open={!!item} onClose={onClose} width={540} accent="cyan">
      <SlideHeader title={`Reply to ${item.author}`} sub={`${item.platform} · ${item.handle}`} onClose={onClose} accentIcon={p.icon} />
      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ padding: 14, borderRadius: 12, background: "var(--elevated)", border: "1px solid var(--border)" }}>
          <div className="row gap-2" style={{ marginBottom: 8 }}>
            <Avatar name={item.author} size={30} />
            <div style={{ flex: 1 }}><div className="row gap-1" style={{ fontSize: 13, fontWeight: 600 }}>{item.author}{item.verified && <Icon name="check-circle-fill" size={13} style={{ color: "var(--cyan)" }} />}</div><div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{item.handle} · {item.time}</div></div>
            <Badge tone={p.tone} size="sm" icon={p.icon}>{item.platform}</Badge>
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--text)" }}>{item.text}</p>
        </div>
        <div>
          <div className="row gap-2" style={{ justifyContent: "space-between", marginBottom: 9 }}>
            <AiTag label="AI-drafted reply" /><Btn kind="ghost" size="sm" icon="reload" onClick={regen} loading={generating}>Regenerate</Btn>
          </div>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={8}
            style={{ width: "100%", resize: "vertical", padding: 14, borderRadius: 10, background: "var(--elevated)", border: "1px solid var(--border-strong)", color: "var(--text)", fontSize: 13.5, lineHeight: 1.6, fontFamily: "var(--font)", outline: "none" }} />
          <div className="row gap-2" style={{ marginTop: 8, justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{draft.length} chars{item.platform === "Twitter" ? " · 280 limit" : ""}</span>
            <Chip tone="cyan" icon="target">Detected: &quot;{item.keyword}&quot;</Chip>
          </div>
        </div>
      </div>
      <div style={{ padding: 16, borderTop: "1px solid var(--border)", display: "flex", gap: 10, flex: "none" }}>
        <Btn kind="secondary" icon="clock">Schedule</Btn>
        <Btn kind="primary" full icon="external-link" onClick={() => { toast({ title: `Opening ${item.platform}`, body: "Reply copied to clipboard", tone: "success" }); }} style={{ "--accent": "var(--cyan)" }}>Open {item.platform} &amp; reply</Btn>
      </div>
    </SlideOver>
  );
}

function FeedCard({ item, onReply }: { item: SocialItem; onReply: (i: SocialItem) => void }) {
  const p = PLATFORM[item.platform];
  return (
    <Card hover pad={16}>
      <div className="row gap-2" style={{ marginBottom: 11, alignItems: "flex-start" }}>
        <Avatar name={item.author} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row gap-1" style={{ fontSize: 14, fontWeight: 600 }}>{item.author}{item.verified && <Icon name="check-circle-fill" size={13} style={{ color: p.color }} />}</div>
          <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{item.handle} · {item.time}</div>
        </div>
        <Badge tone={p.tone} size="sm" icon={p.icon}>{item.platform}</Badge>
      </div>
      <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--text)", marginBottom: 13 }}>{item.text}</p>
      <div className="row gap-2" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <Chip tone="cyan" icon="target">&quot;{item.keyword}&quot;</Chip>
        <Btn kind="accentSoft" size="sm" icon="wand" onClick={() => onReply(item)} style={{ "--accent": "var(--cyan)", "--accent-rgb": "var(--cyan-rgb)" }}>Suggest reply / DM</Btn>
      </div>
    </Card>
  );
}

export function Social() {
  const [open, setOpen] = useState<SocialItem | null>(null);
  const [filter, setFilter] = useState("All");
  const platforms = ["All", "Twitter", "LinkedIn", "Instagram"];
  const shown = filter === "All" ? SOCIAL : SOCIAL.filter((s) => s.platform === filter);

  return (
    <Page max={1100}>
      <PageHead title="Social Feed" sub="Hiring signals detected across your connected social accounts, with AI replies ready to go."
        actions={<Btn kind="secondary" icon="plus">Add profile</Btn>} />

      <Toolbar style={{ justifyContent: "space-between" }}>
        <div className="row gap-2" style={{ flexWrap: "wrap" }}>
          {platforms.map((p) => <Chip key={p} active={filter === p} onClick={() => setFilter(p)} icon={p !== "All" ? PLATFORM[p as SocialPlatform].icon : undefined}>{p}</Chip>)}
        </div>
        <div className="row gap-2">
          {(Object.entries(PLATFORM) as [string, { color: string }][]).map(([name]) => (
            <div key={name} className="row gap-1" style={{ fontSize: 12, color: "var(--text-muted)" }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: name === "Instagram" ? "var(--text-faint)" : "var(--success)" }} />{name}
            </div>
          ))}
        </div>
      </Toolbar>

      <div style={{ columnWidth: 360, columnGap: 16 }}>
        {shown.map((s) => <div key={s.id} style={{ breakInside: "avoid", marginBottom: 16 }}><FeedCard item={s} onReply={setOpen} /></div>)}
      </div>

      {open && <ReplyComposer item={open} onClose={() => setOpen(null)} />}
    </Page>
  );
}
