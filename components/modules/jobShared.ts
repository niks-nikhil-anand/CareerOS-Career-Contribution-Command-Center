/* Shared Jobs/Tracker constants */
import type { JobSource, JobStatus } from "@/lib/types";

type Tone = "neutral" | "primary" | "violet" | "cyan" | "emerald" | "amber" | "success" | "warning" | "danger";

export const STATUS_META: Record<JobStatus, { label: string; tone: Tone }> = {
  saved: { label: "Saved", tone: "neutral" },
  applied: { label: "Applied", tone: "primary" },
  interview: { label: "Interview", tone: "violet" },
  offer: { label: "Offer", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

export const SOURCE_TONE: Record<JobSource, Tone> = {
  LinkedIn: "primary",
  Indeed: "violet",
  Glassdoor: "emerald",
  RSS: "amber",
};
