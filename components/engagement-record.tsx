"use client";

import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { engagements } from "@/src/domain/fixtures";
import { calculatePortfolioHealth } from "@/src/domain/health";
import { toHealthInput } from "@/src/domain/fixtures";

export function EngagementRecord({ id }: { id: string }) {
  const engagement = engagements.find((item) => item.id === id);
  if (!engagement) notFound();
  const health = calculatePortfolioHealth(toHealthInput(engagement));
  return <AppShell><article className="mx-auto max-w-5xl"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-teal-700">Integrated engagement record</p><h1 className="mt-2 text-3xl font-semibold">{engagement.name}</h1><p className="mt-2 text-slate-600">{engagement.account}</p></div><StatusBadge state={health.state} /></div><section className="mt-6 grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">Commitment → scope → estimate</h2><p className="mt-3 text-sm leading-6 text-slate-600">{engagement.commitments[0]?.promisedOutcome}<br />Scope {engagement.scopeVersion}<br />Estimate {engagement.financial.currency} {engagement.financial.approvedEstimate.toLocaleString("en-CA")}</p></div><div className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">Staffing → WIP → risk</h2><p className="mt-3 text-sm leading-6 text-slate-600">{engagement.staffing[0]?.approvedHours}h approved / {engagement.staffing[0]?.requiredHours}h required<br />{engagement.workItems[0]?.title}: {engagement.workItems[0]?.state}<br />Exposure {engagement.risks[0] ? engagement.risks[0].probability * engagement.risks[0].impact : 0}</p></div><div className="rounded-xl border border-slate-200 bg-white p-5 md:col-span-2"><h2 className="font-semibold">Evidence chain</h2><ol className="mt-4 grid gap-3 sm:grid-cols-4">{["scope", "financial", "staffing", "risk"].map((stage, index) => <li key={stage} className="rounded-lg bg-slate-50 p-3"><span className="text-xs font-bold text-slate-500">0{index + 1}</span><p className="mt-2 text-sm font-semibold capitalize">{stage}</p><p className="mt-1 text-xs text-slate-500">Revision preserved</p></li>)}</ol></div></section></article></AppShell>;
}
