"use client";
/* ============================================================
   CareerOS — Onboarding + Login (PIN)
   ============================================================ */
import { useState } from "react";
import { Btn, Chip, Icon, Logo } from "../ui";
import { Field, Select } from "../layout";
import { toast } from "../overlays";

export function Onboarding({
  theme, onTheme, onDone,
}: {
  theme: string; onTheme: () => void; onDone: () => void;
}) {
  const [step, setStep] = useState(0); // 0 login, 1 resume, 2 watcher
  const [pin, setPin] = useState(["", "", "", ""]);
  const [uploaded, setUploaded] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [kw, setKw] = useState(["Software Engineer", "React", "TypeScript"]);
  const [kwInput, setKwInput] = useState("");
  const [country, setCountry] = useState("Germany");
  const [interval, setIntervalVal] = useState("Every 6 hours");
  const [platforms, setPlatforms] = useState<Record<string, boolean>>({ LinkedIn: true, Indeed: true, Glassdoor: true, RSS: false });

  const total = 3;
  const progress = step === 0 ? 0 : (step / total) * 100;

  function doUpload() {
    setParsing(true);
    setTimeout(() => {
      setParsing(false);
      setUploaded(true);
      toast({ title: "Resume parsed", body: "12 skills · 3 roles extracted by Foundry Intelligence", tone: "ai" });
    }, 1800);
  }

  return (
    <div data-theme={theme} style={{ height: "100%", display: "flex", background: "var(--bg)", overflow: "hidden" }}>
      {/* left brand panel */}
      <div className="cos-onb-aside" style={{
        width: 380, flex: "none", padding: 40, borderRight: "1px solid var(--border)",
        background: "linear-gradient(160deg, rgba(59,130,246,0.10), rgba(139,92,246,0.07) 50%, rgba(34,211,238,0.05))",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        <Logo />
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.8px", lineHeight: 1.15, marginBottom: 14 }}>
            Run your entire job hunt from <span className="gradient-text">one command center</span>.
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14.5, lineHeight: 1.6, maxWidth: 300 }}>
            Automated scanning, AI-tailored resumes, outreach, open-source contributions and a career coach — working for you around the clock.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 26 }}>
            {([["search", "Scans LinkedIn, Indeed, Glassdoor & RSS"], ["wand", "Tailors your resume to each role"], ["zap", "Coaches your search with weekly insights"]] as const).map(([ic, t]) => (
              <div key={t} className="row gap-2" style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                <span style={{ color: "var(--accent)", display: "flex" }}><Icon name={ic} size={16} /></span>{t}
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-faint)" }}>Self-hosted · single user · your data stays yours</div>
      </div>

      {/* right form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
        <div style={{ width: 420, maxWidth: "100%" }}>
          {step > 0 && (
            <div style={{ marginBottom: 26 }}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                <span className="eyebrow">Step {step} of {total}</span>
                <button onClick={onTheme} style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", fontSize: 12 }}>Toggle theme</button>
              </div>
              <div style={{ height: 4, background: "var(--fill-neutral)", borderRadius: 999 }}>
                <div style={{ width: `${progress}%`, height: "100%", background: "var(--accent)", borderRadius: 999, transition: "width 400ms var(--ease)" }} />
              </div>
            </div>
          )}

          {step === 0 && (
            <div className="rise">
              <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.5px", marginBottom: 6 }}>Welcome back</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: 26 }}>Enter your PIN to unlock CareerOS.</p>
              <div className="row gap-2" style={{ marginBottom: 22 }}>
                {pin.map((d, i) => (
                  <input key={i} value={d} maxLength={1} inputMode="numeric"
                    onChange={(e) => {
                      const n = [...pin];
                      n[i] = e.target.value.replace(/\D/g, "");
                      setPin(n);
                      const parent = e.target.parentElement;
                      if (e.target.value && i < 3 && parent) (parent.children[i + 1] as HTMLInputElement).focus();
                    }}
                    style={{ width: 56, height: 60, textAlign: "center", fontSize: 24, fontWeight: 600, borderRadius: 12, background: "var(--elevated)", border: "1px solid var(--border-strong)", color: "var(--text)", outline: "none", fontFamily: "var(--mono)" }} />
                ))}
              </div>
              <Btn kind="primary" full size="lg" onClick={() => setStep(1)}>Unlock</Btn>
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <span style={{ fontSize: 13, color: "var(--text-faint)", cursor: "pointer" }} onClick={() => setStep(1)}>First time here? Set up CareerOS →</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="rise">
              <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.5px", marginBottom: 6 }}>Upload your base resume</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: 22 }}>Foundry Intelligence reads it to score matches and tailor applications.</p>
              {!uploaded ? (
                <div onClick={!parsing ? doUpload : undefined} style={{
                  border: "2px dashed var(--border-strong)", borderRadius: 14, padding: "38px 24px", textAlign: "center",
                  cursor: parsing ? "default" : "pointer", background: "var(--elevated)",
                }}>
                  {parsing ? (
                    <>
                      <Icon name="wand" size={26} className="breathe" style={{ color: "var(--violet)" }} />
                      <div className="ai-shimmer" style={{ marginTop: 12, fontWeight: 600 }}>Parsing your resume…</div>
                    </>
                  ) : (
                    <>
                      <span style={{ width: 48, height: 48, borderRadius: 12, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(var(--primary-rgb),0.12)", color: "var(--primary)" }}><Icon name="cloud-upload" size={22} /></span>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Drop your resume or click to upload</div>
                      <div style={{ fontSize: 12.5, color: "var(--text-faint)" }}>PDF or DOCX · up to 5 MB</div>
                    </>
                  )}
                </div>
              ) : (
                <div className="row gap-3" style={{ padding: 16, borderRadius: 12, background: "var(--elevated)", border: "1px solid var(--border-strong)" }}>
                  <span style={{ width: 38, height: 38, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--fill-success)", color: "var(--success)" }}><Icon name="check-circle" size={19} /></span>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>Alex_Morgan_SWE.pdf</div><div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Parsed · 12 skills found</div></div>
                </div>
              )}
              <div className="row gap-2" style={{ marginTop: 24, justifyContent: "space-between" }}>
                <Btn kind="ghost" onClick={() => setStep(0)}>Back</Btn>
                <Btn kind="primary" iconRight="arrow-right" disabled={!uploaded} onClick={() => setStep(2)}>Continue</Btn>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="rise">
              <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.5px", marginBottom: 6 }}>Create your first watcher</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: 22 }}>We&apos;ll scan for matching jobs on a schedule and alert you.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <Field label="Keywords"><div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 8, borderRadius: 8, background: "var(--elevated)", border: "1px solid var(--border-strong)", minHeight: 44 }}>
                  {kw.map((k) => <Chip key={k} tone="primary" onRemove={() => setKw(kw.filter((x) => x !== k))}>{k}</Chip>)}
                  <input value={kwInput} onChange={(e) => setKwInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && kwInput.trim()) { setKw([...kw, kwInput.trim()]); setKwInput(""); } }}
                    placeholder="Add keyword…" style={{ flex: 1, minWidth: 100, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 14, fontFamily: "var(--font)" }} />
                </div></Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Country"><Select value={country} onChange={setCountry} options={["Germany", "Netherlands", "Austria", "Switzerland", "Remote · EU"]} /></Field>
                  <Field label="Scan interval"><Select value={interval} onChange={setIntervalVal} options={["Every 3 hours", "Every 6 hours", "Every 12 hours", "Daily"]} /></Field>
                </div>
                <Field label="Platforms">
                  <div className="row gap-2" style={{ flexWrap: "wrap" }}>
                    {Object.keys(platforms).map((p) => (
                      <Chip key={p} active={platforms[p]} onClick={() => setPlatforms({ ...platforms, [p]: !platforms[p] })} icon={platforms[p] ? "check" : undefined}>{p}</Chip>
                    ))}
                  </div>
                </Field>
              </div>
              <div className="row gap-2" style={{ marginTop: 24, justifyContent: "space-between" }}>
                <Btn kind="ghost" onClick={() => setStep(1)}>Back</Btn>
                <Btn kind="primary" icon="check" onClick={() => { toast({ title: "You're all set", body: "First scan is running now", tone: "success" }); onDone(); }}>Finish setup</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
