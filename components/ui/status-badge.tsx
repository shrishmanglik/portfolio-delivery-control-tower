import type { HealthState } from "@/src/domain/types";
import { cn } from "@/src/lib/cn";

const variants: Record<HealthState, string> = { green: "border-teal-200 bg-teal-50 text-teal-800", watch: "border-amber-200 bg-amber-50 text-amber-800", "at-risk": "border-red-200 bg-red-50 text-red-800", unknown: "border-violet-200 bg-violet-50 text-violet-800" };

export function StatusBadge({ state, className }: { state: HealthState; className?: string }) {
  const label = state === "at-risk" ? "At risk" : state.charAt(0).toUpperCase() + state.slice(1);
  return <span className={cn("inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-bold", variants[state], className)}>{label}</span>;
}
