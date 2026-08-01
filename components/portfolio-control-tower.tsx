"use client";

import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock3, Download, RefreshCw, Search, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { buildPortfolioRows } from "@/src/services/portfolio-service";
import { useControlTowerStore } from "@/src/store/control-tower-store";
import type { HealthState } from "@/src/domain/types";
import { buildSyntheticExport } from "@/src/services/export";

const money = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
const shortDate = new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" });

export function PortfolioControlTower() {
  const { engagements, selectedEngagementId, selectEngagement, validateSyntheticSnapshot, refreshState, refreshError, resetDemo } = useControlTowerStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<HealthState | "all">("all");
  const [attentionFilter, setAttentionFilter] = useState<"unsupported" | "staffing" | "variance" | "decisions" | null>(null);
  const [sort, setSort] = useState<"risk" | "decision" | "variance" | "staffing">("risk");
  const rows = useMemo(() => buildPortfolioRows(engagements), [engagements]);
  const selected = rows.find((row) => row.engagement.id === selectedEngagementId) ?? rows[0];
  const visibleRows = rows.filter(({ engagement, health }) => {
    const attentionMatch = attentionFilter === null ||
      (attentionFilter === "unsupported" && engagement.commitments.some((item) => !item.supportedPlan)) ||
      (attentionFilter === "staffing" && engagement.staffing.some((item) => item.approvedHours / item.requiredHours < 0.75)) ||
      (attentionFilter === "variance" && Math.abs(health.forecastVariance) / Math.max(1, engagement.financial.approvedEstimate + engagement.financial.approvedChanges) >= 0.05) ||
      (attentionFilter === "decisions" && engagement.risks.some((item) => item.state === "escalated"));
    return attentionMatch && (filter === "all" || health.state === filter) && `${engagement.account} ${engagement.name} ${engagement.owner}`.toLowerCase().includes(query.toLowerCase());
  }).sort((a, b) => {
    if (sort === "staffing") return (a.health.staffingConfidence ?? -1) - (b.health.staffingConfidence ?? -1);
    if (sort === "variance") return Math.abs(b.health.forecastVariance) - Math.abs(a.health.forecastVariance);
    if (sort === "decision") return new Date(a.engagement.risks[0]?.dueAt ?? "9999-12-31").getTime() - new Date(b.engagement.risks[0]?.dueAt ?? "9999-12-31").getTime();
    return b.health.riskExposure - a.health.riskExposure;
  });

  const exportPortfolio = () => {
    const payload = buildSyntheticExport(engagements);
    const blobUrl = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "portfolio-control-tower-synthetic-export.json";
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  const counters = [
    { key: "unsupported" as const, label: "Unsupported commitments", value: engagements.flatMap((item) => item.commitments).filter((item) => !item.supportedPlan).length, icon: Clock3, tone: "text-amber-700" },
    { key: "staffing" as const, label: "Critical staffing conflicts", value: engagements.flatMap((item) => item.staffing).filter((item) => item.approvedHours / item.requiredHours < 0.75).length, icon: Users, tone: "text-red-700" },
    { key: "variance" as const, label: "Unresolved forecast variance", value: engagements.filter((item) => Math.abs(item.financial.forecast - item.financial.approvedEstimate - item.financial.approvedChanges) / (item.financial.approvedEstimate + item.financial.approvedChanges) >= 0.05).length, icon: AlertTriangle, tone: "text-red-700" },
    { key: "decisions" as const, label: "Escalated decisions", value: engagements.flatMap((item) => item.risks).filter((item) => item.state === "escalated").length, icon: ArrowUpRight, tone: "text-amber-700" },
  ];

  const inspector = selected ? <div data-testid="evidence-inspector"><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Evidence inspector</p><div className="mt-3 flex items-center justify-between gap-2"><h2 className="text-lg font-semibold">{selected.engagement.name}</h2><StatusBadge state={selected.health.state} /></div><p className="mt-2 text-sm leading-6 text-slate-600">{selected.engagement.objective}</p><dl className="mt-5 space-y-4 text-sm"><div><dt className="font-semibold text-slate-500">Scope revision</dt><dd className="mt-1">{selected.engagement.scopeVersion}</dd></div><div><dt className="font-semibold text-slate-500">Financial source</dt><dd className="mt-1">{selected.engagement.financial.sourceId}<br /><span className="text-slate-500">{selected.engagement.sourceAgeDays} days old · {selected.engagement.financial.validatedAt ? "validated" : "not validated"}</span></dd></div><div><dt className="font-semibold text-slate-500">Deterministic reasons</dt><dd className="mt-2 space-y-2">{selected.health.reasons.map((reason) => <div key={reason.code} className="rounded-md border border-slate-200 bg-slate-50 p-3"><p className="font-semibold">{reason.code.replaceAll("_", " ")}</p><p className="mt-1 text-xs leading-5 text-slate-600">{reason.message}</p><p className="mt-1 text-xs font-medium text-slate-500">Evidence: {reason.evidence}</p></div>)}</dd></div><div><dt className="font-semibold text-slate-500">Human authority</dt><dd className="mt-1">Portfolio director for tradeoffs; Finance partner for financial validation.</dd></div></dl><Button asChild className="mt-5 w-full" variant="secondary"><Link href={`/engagements/${selected.engagement.id}`}>Open integrated record</Link></Button></div> : undefined;

  return <AppShell inspector={inspector}><div className="mx-auto max-w-[1500px]">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Portfolio operating review</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">What changed, and what needs authority?</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Health is calculated from accepted source facts. Missing, stale, contradictory, or unvalidated critical data produces UNKNOWN—never green.</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={exportPortfolio}><Download size={17} aria-hidden="true" />Export synthetic proof</Button><Button variant="secondary" onClick={resetDemo}>Reset synthetic demo</Button><Button variant="operational" data-testid="validate-snapshot" disabled={refreshState === "loading"} onClick={() => void validateSyntheticSnapshot()}><RefreshCw aria-hidden="true" className={refreshState === "loading" ? "animate-spin" : ""} size={17} />{refreshState === "loading" ? "Validating…" : "Validate latest snapshot"}</Button></div></div>

    {refreshState === "complete" && <div className="mt-4 flex items-start gap-3 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900" role="status"><CheckCircle2 className="mt-0.5 shrink-0" size={18} /><div><strong>Mock finance snapshot accepted.</strong> Health was recalculated; prior UNKNOWN states now show the actual threshold result.</div></div>}
    {refreshError && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900" role="alert">{refreshError}</div>}

    <section aria-label="Operating counters" className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{counters.map(({ key, label, value, icon: Icon, tone }) => <button key={label} aria-pressed={attentionFilter === key} className={`min-h-28 rounded-xl border bg-white p-4 text-left shadow-sm transition-colors hover:border-slate-400 ${attentionFilter === key ? "border-slate-900 ring-2 ring-slate-200" : "border-slate-200"}`} onClick={() => { setAttentionFilter(attentionFilter === key ? null : key); setQuery(""); }}><div className="flex items-start justify-between"><Icon className={tone} size={19} aria-hidden="true" /><span className="text-2xl font-semibold tabular-nums">{value}</span></div><p className="mt-5 text-sm font-medium text-slate-600">{label}</p></button>)}</section>

    <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between"><div className="relative min-w-0 flex-1 md:max-w-md"><Search className="pointer-events-none absolute left-3 top-3 text-slate-400" size={18} aria-hidden="true" /><label className="sr-only" htmlFor="portfolio-search">Search portfolio</label><input id="portfolio-search" value={query} onChange={(event) => { setQuery(event.target.value); setAttentionFilter(null); }} placeholder="Search accounts, engagements, owners" className="min-h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-sm" /></div><div className="flex flex-wrap items-center gap-2"><label className="text-xs font-bold text-slate-600" htmlFor="sort-portfolio">Sort</label><select id="sort-portfolio" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold"><option value="risk">Risk exposure</option><option value="decision">Decision due</option><option value="variance">Forecast variance</option><option value="staffing">Staffing confidence</option></select><div className="flex flex-wrap gap-2" aria-label="Filter by health">{(["all", "unknown", "at-risk", "watch", "green"] as const).map((state) => <button key={state} aria-pressed={filter === state} onClick={() => { setFilter(state); setAttentionFilter(null); }} className={`min-h-11 rounded-md border px-3 text-xs font-bold capitalize ${filter === state ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700"}`}>{state === "at-risk" ? "At risk" : state}</button>)}</div></div></div><div className="max-w-full overflow-x-auto"><table className="data-table"><caption className="sr-only">Portfolio engagements with deterministic operating health</caption><thead><tr><th>Account / engagement</th><th>Health</th><th>Next commitment</th><th>WIP pressure</th><th>Staffing</th><th>Forecast variance</th><th>High risks</th><th>Decision due</th><th>Owner</th></tr></thead><tbody>{visibleRows.map(({ engagement, health }) => { const staffing = health.staffingConfidence === null ? "Unknown" : `${Math.round(health.staffingConfidence * 100)}%`; const due = engagement.risks[0]?.dueAt; return <tr key={engagement.id} tabIndex={0} aria-selected={engagement.id === selectedEngagementId} onClick={() => selectEngagement(engagement.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectEngagement(engagement.id); } }}><td><p className="font-semibold">{engagement.account}</p><p className="mt-1 text-xs text-slate-500">{engagement.name}</p></td><td><StatusBadge state={health.state} /></td><td><p className="font-medium">{engagement.nextCommitment}</p><p className="mt-1 text-xs text-slate-500">{shortDate.format(new Date(engagement.targetEnd))}</p></td><td><span className="font-semibold tabular-nums">{health.schedulePressure}</span><span className="ml-1 text-xs text-slate-500">points</span></td><td><span className={health.staffingConfidence !== null && health.staffingConfidence < 0.75 ? "font-semibold text-red-700" : "font-semibold"}>{staffing}</span></td><td><span className={Math.abs(health.forecastVariance) > 0 ? "font-semibold text-red-700" : "font-semibold"}>{money.format(health.forecastVariance)}</span><p className="mt-1 text-xs text-slate-500">{engagement.financial.varianceReason}</p></td><td><span className="font-semibold">{engagement.risks.filter((risk) => risk.probability * risk.impact >= 12).length}</span></td><td>{due ? shortDate.format(new Date(due)) : "—"}</td><td>{engagement.owner}</td></tr>; })}</tbody></table>{visibleRows.length === 0 && <div className="p-10 text-center"><p className="font-semibold">No records match this view.</p><p className="mt-2 text-sm text-slate-500">Clear the search or change the health filter.</p></div>}</div></section>
  </div></AppShell>;
}
