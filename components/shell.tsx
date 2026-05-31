"use client";
/* ============================================================
   CareerOS — App shell: theme, SideNav, TopBar, router glue
   ============================================================ */
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, type ReactNode, useContext, useEffect, useState } from "react";
import { Icon, IconBtn, Logo } from "./ui";
import { ToastHost, toast } from "./overlays";
import { Onboarding } from "./modules/Onboarding";

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  accent: string;
  rgb: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: "dashboard", accent: "primary", rgb: "var(--primary-rgb)" },
  { id: "jobs", label: "Jobs", icon: "target", accent: "primary", rgb: "var(--primary-rgb)" },
  { id: "opensource", label: "Open Source", icon: "git-branch", accent: "violet", rgb: "var(--violet-rgb)" },
  { id: "outreach", label: "Outreach", icon: "at-sign", accent: "emerald", rgb: "var(--emerald-rgb)" },
  { id: "social", label: "Social Feed", icon: "globe", accent: "cyan", rgb: "var(--cyan-rgb)" },
  { id: "coach", label: "Career Coach", icon: "zap", accent: "amber", rgb: "var(--amber-rgb)" },
];

const ACCENT_BY_ROUTE: Record<string, [string, string]> = {
  overview: ["primary", "var(--primary-rgb)"],
  jobs: ["primary", "var(--primary-rgb)"],
  opensource: ["violet", "var(--violet-rgb)"],
  outreach: ["emerald", "var(--emerald-rgb)"],
  social: ["cyan", "var(--cyan-rgb)"],
  coach: ["amber", "var(--amber-rgb)"],
  settings: ["primary", "var(--primary-rgb)"],
};

export const PAGE_TITLES: Record<string, string> = {
  overview: "Overview", jobs: "Jobs", opensource: "Open Source",
  outreach: "Outreach", social: "Social Feed", coach: "Career Coach", settings: "Settings",
};

const NAV_COUNTS: Record<string, number> = { jobs: 20, opensource: 6, outreach: 5, social: 4 };

/* ---------- Shared shell context (scan state etc.) ---------- */
interface ShellCtx {
  scanning: boolean;
  nextScan: string;
  runScan: () => void;
  theme: string;
  toggleTheme: () => void;
  nav: (route: string) => void;
}
const ShellContext = createContext<ShellCtx | null>(null);
export function useShell(): ShellCtx {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside <AppShell>");
  return ctx;
}

/* ---------- SideNav ---------- */
function SideNav({
  route, onNav, collapsed, counts,
}: {
  route: string; onNav: (r: string) => void; collapsed: boolean; counts: Record<string, number>;
}) {
  return (
    <aside style={{
      width: collapsed ? "var(--nav-w-collapsed)" : "var(--nav-w)", flex: "none",
      background: "var(--surface)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", transition: "width 200ms var(--ease)", height: "100%",
    }}>
      <div style={{ height: "var(--topbar-h)", display: "flex", alignItems: "center", padding: "0 18px", borderBottom: "1px solid var(--border)", justifyContent: "space-between" }}>
        <Logo collapsed={collapsed} />
      </div>

      <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
        {!collapsed && <div className="eyebrow" style={{ padding: "8px 10px 6px" }}>Workspace</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item) => {
            const active = route === item.id;
            const count = counts[item.id];
            return (
              <button key={item.id} onClick={() => onNav(item.id)} title={item.label} className="cos-navitem"
                style={{
                  position: "relative", display: "flex", alignItems: "center", gap: 11,
                  height: 40, padding: collapsed ? 0 : "0 11px", justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 9, border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                  background: active ? `rgba(${item.accent === "primary" ? "var(--primary-rgb)" : `var(--${item.accent}-rgb)`},0.13)` : "transparent",
                  color: active ? `var(--${item.accent})` : "var(--text-muted)",
                  fontSize: 14, fontWeight: active ? 600 : 500, transition: "background-color 120ms, color 120ms",
                }}>
                {active && <span style={{ position: "absolute", left: -12, top: 9, bottom: 9, width: 3, borderRadius: "0 3px 3px 0", background: `var(--${item.accent})` }} />}
                <Icon name={item.icon} size={18} style={{ flex: "none" }} />
                {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!collapsed && count > 0 && (
                  <span className="tabular" style={{ fontSize: 11.5, fontWeight: 600, padding: "1px 7px", borderRadius: 999, background: active ? `rgba(var(--${item.accent}-rgb),0.18)` : "var(--fill-neutral)", color: active ? `var(--${item.accent})` : "var(--text-faint)" }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div style={{ padding: 12, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 2 }}>
        <button onClick={() => onNav("settings")} title="Settings" className="cos-navitem"
          style={{
            display: "flex", alignItems: "center", gap: 11, height: 40, padding: collapsed ? 0 : "0 11px", justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: 9, border: "none", cursor: "pointer", width: "100%",
            background: route === "settings" ? "var(--fill-neutral)" : "transparent",
            color: route === "settings" ? "var(--text)" : "var(--text-muted)", fontSize: 14, fontWeight: 500,
          }}>
          <Icon name="settings" size={18} />{!collapsed && <span>Settings</span>}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "8px 0" : "8px 10px", justifyContent: collapsed ? "center" : "flex-start" }}>
          <div style={{ width: 30, height: 30, borderRadius: 999, background: "linear-gradient(135deg,#3B82F6,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: 12, flex: "none" }}>AM</div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Alex Morgan</div>
              <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>Job search · 2026</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ---------- Notifications menu ---------- */
function NotifMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const items = [
    { icon: "search", tone: "var(--primary)", title: "Scan complete · Germany", body: "7 new jobs, 1 strong match at TechCorp", time: "2h" },
    { icon: "wand", tone: "var(--violet)", title: "Resume tailored for TechCorp", body: "Match lifted 71% → 94%", time: "2h" },
    { icon: "globe", tone: "var(--cyan)", title: "New social opportunity", body: "@dev_priya is looking for a React dev", time: "18m" },
  ];
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1500 }} />
      <div className="rise" style={{
        position: "absolute", top: "calc(100% + 8px)", right: 0, width: 340, zIndex: 1600,
        background: "var(--elevated)", border: "1px solid var(--border)", borderRadius: 14, boxShadow: "var(--shadow-lg)", overflow: "hidden",
      }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
          <span style={{ fontSize: 12, color: "var(--primary)", cursor: "pointer" }}>Mark all read</span>
        </div>
        {items.map((it, i) => (
          <div key={i} style={{ display: "flex", gap: 11, padding: "12px 16px", borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer" }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: `color-mix(in srgb, ${it.tone} 16%, transparent)`, color: it.tone }}>
              <Icon name={it.icon} size={15} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{it.title}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{it.body}</div>
            </div>
            <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{it.time}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- TopBar ---------- */
function TopBar({
  route, theme, onTheme, onToggleNav, scanning, onScanNow, nextScan, onMobileNav,
}: {
  route: string; theme: string; onTheme: () => void; onToggleNav: () => void;
  scanning: boolean; onScanNow: () => void; nextScan: string; onMobileNav: () => void;
}) {
  const [notif, setNotif] = useState(false);
  const [search, setSearch] = useState("");
  return (
    <header style={{
      height: "var(--topbar-h)", flex: "none", display: "flex", alignItems: "center", gap: 14,
      padding: "0 20px", borderBottom: "1px solid var(--border)", background: "var(--glass)",
      backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", position: "sticky", top: 0, zIndex: 900,
    }}>
      <button className="cos-mobile-only" onClick={onMobileNav} style={{ display: "none", background: "none", border: "none", color: "var(--text)", cursor: "pointer" }}>
        <Icon name="menu" size={20} />
      </button>
      <IconBtn name="menu" onClick={onToggleNav} title="Toggle sidebar" style={{ marginLeft: -6 }} />
      <h1 style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.3px", minWidth: 0, whiteSpace: "nowrap" }}>{PAGE_TITLES[route]}</h1>

      <div className="cos-search" style={{
        marginLeft: 8, flex: 1, maxWidth: 440, height: 38, display: "flex", alignItems: "center", gap: 9,
        padding: "0 12px", borderRadius: 10, background: "var(--fill-neutral)", border: "1px solid var(--border)",
      }}>
        <Icon name="search" size={16} style={{ color: "var(--text-faint)" }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs, contacts, issues…"
          style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 13.5, fontFamily: "var(--font)" }} />
        <kbd style={{ fontSize: 11, color: "var(--text-faint)", border: "1px solid var(--border-strong)", borderRadius: 5, padding: "1px 6px", fontFamily: "var(--mono)" }}>⌘K</kbd>
      </div>

      <div style={{ flex: 1 }} className="cos-desktop-spacer" />

      <button onClick={onScanNow} title="Run all scans now"
        style={{
          display: "flex", alignItems: "center", gap: 8, height: 38, padding: "0 13px", borderRadius: 10, cursor: "pointer",
          border: `1px solid ${scanning ? "rgba(var(--primary-rgb),0.4)" : "var(--border)"}`,
          background: scanning ? "rgba(var(--primary-rgb),0.1)" : "var(--fill-neutral)", color: scanning ? "var(--primary)" : "var(--text-muted)",
          transition: "all 160ms",
        }}>
        <span className={scanning ? "live-pulse" : ""} style={{ width: 8, height: 8, borderRadius: 999, background: scanning ? "var(--primary)" : "var(--success)", "--accent-rgb": "var(--primary-rgb)" }} />
        <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>{scanning ? "Scanning…" : `Next scan ${nextScan}`}</span>
      </button>

      <div style={{ position: "relative" }}>
        <IconBtn name="bell" onClick={() => setNotif((v) => !v)} title="Notifications" badge={3} active={notif} />
        <NotifMenu open={notif} onClose={() => setNotif(false)} />
      </div>

      <button onClick={onTheme} title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} aria-label="Toggle theme"
        style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid transparent", background: "transparent", color: "var(--text-muted)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        {theme === "dark" ? (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
        )}
      </button>
    </header>
  );
}

/* ---------- AppShell ---------- */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const route = (pathname?.split("/")[1] || "overview") as string;

  const [theme, setTheme] = useState("dark");
  const [collapsed, setCollapsed] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [nextScan, setNextScan] = useState("in 2h 14m");
  const [booted, setBooted] = useState<boolean | null>(null);
  const [mobileNav, setMobileNav] = useState(false);

  // hydrate persisted prefs on mount (client-only: localStorage)
  useEffect(() => {
    const t = localStorage.getItem("cos-theme") || "dark";
    /* eslint-disable react-hooks/set-state-in-effect */
    setTheme(t);
    setBooted(localStorage.getItem("cos-booted") === "1");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cos-theme", theme);
  }, [theme]);

  // close the mobile nav drawer whenever the route changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMobileNav(false); }, [pathname]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const nav = useCallback((r: string) => router.push(`/${r}`), [router]);

  const runScan = useCallback(() => {
    if (scanning) return;
    setScanning(true);
    toast({ title: "Scan started", body: "Checking LinkedIn, Indeed, Glassdoor & RSS…", tone: "info", icon: "search", loading: true });
    setTimeout(() => {
      setScanning(false);
      setNextScan("in 5h 59m");
      toast({ title: "Scan complete", body: "4 new jobs found · 1 strong match at TechCorp", tone: "success", icon: "check-circle" });
    }, 3200);
  }, [scanning]);

  const [accent, rgb] = ACCENT_BY_ROUTE[route] || ACCENT_BY_ROUTE.overview;

  // wait for boot status before deciding what to render (avoids flash)
  if (booted === null) return null;

  if (!booted) {
    return (
      <>
        <Onboarding theme={theme} onTheme={toggleTheme} onDone={() => { localStorage.setItem("cos-booted", "1"); setBooted(true); router.push("/overview"); }} />
        <ToastHost />
      </>
    );
  }

  const ctx: ShellCtx = { scanning, nextScan, runScan, theme, toggleTheme, nav };

  return (
    <ShellContext.Provider value={ctx}>
      <div style={{ display: "flex", height: "100%", overflow: "hidden", "--accent": `var(--${accent})`, "--accent-rgb": rgb }}>
        <div className="cos-sidenav-wrap" data-mobile-open={mobileNav}>
          <SideNav route={route} onNav={nav} collapsed={collapsed} counts={NAV_COUNTS} />
        </div>
        {mobileNav && <div className="cos-nav-scrim" onClick={() => setMobileNav(false)} />}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100%" }}>
          <TopBar route={route} theme={theme} onTheme={toggleTheme} onToggleNav={() => setCollapsed((c) => !c)} onMobileNav={() => setMobileNav(true)}
            scanning={scanning} onScanNow={runScan} nextScan={nextScan} />
          <main key={route} className="cos-main" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
            {children}
          </main>
          <nav className="cos-tabbar">
            {NAV_ITEMS.slice(0, 5).map((it) => (
              <button key={it.id} onClick={() => nav(it.id)} style={{
                flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 0",
                color: route === it.id ? `var(--${it.accent})` : "var(--text-faint)",
              }}>
                <Icon name={it.icon} size={20} />
                <span style={{ fontSize: 10, fontWeight: 500 }}>{it.label.split(" ")[0]}</span>
              </button>
            ))}
          </nav>
        </div>

        <ToastHost />
      </div>
    </ShellContext.Provider>
  );
}
