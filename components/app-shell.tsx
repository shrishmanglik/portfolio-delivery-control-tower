"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BriefcaseBusiness, ClipboardCheck, FileSearch, Gauge, GraduationCap, Landmark, Menu, ShieldAlert, Users } from "lucide-react";
import type { ReactNode } from "react";
import { SYNTHETIC_NOTICE } from "@/src/domain/fixtures";
import { cn } from "@/src/lib/cn";
import { useControlTowerStore } from "@/src/store/control-tower-store";

const navigation = [
  { href: "/portfolio", label: "Portfolio", icon: Gauge },
  { href: "/work", label: "Work", icon: BriefcaseBusiness },
  { href: "/resources", label: "Resources", icon: Users },
  { href: "/financials", label: "Financials", icon: Landmark },
  { href: "/risks", label: "Risks", icon: ShieldAlert },
  { href: "/reviews", label: "Reviews", icon: ClipboardCheck },
  { href: "/post-mortems", label: "Learning", icon: GraduationCap },
  { href: "/proof", label: "Proof", icon: FileSearch },
];

const mobileNavigation = navigation.filter((item) => ["Portfolio", "Work", "Risks", "Reviews"].includes(item.label));

export function AppShell({ children, inspector }: { children: ReactNode; inspector?: ReactNode }) {
  const pathname = usePathname();
  const snapshotValidated = useControlTowerStore((state) => state.engagements.every((engagement) => Boolean(engagement.financial.validatedAt)));
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[224px_minmax(0,1fr)_320px]">
      <aside className="desktop-rail sticky top-0 h-screen border-r border-slate-200 bg-slate-950 px-4 py-5 text-white">
        <div className="flex items-center gap-3 px-2">
          <div className="grid size-10 place-items-center rounded-lg bg-teal-600"><BarChart3 aria-hidden="true" size={21} /></div>
          <div><p className="text-sm font-bold">Delivery Tower</p><p className="text-xs text-slate-400">Evidence-bound demo</p></div>
        </div>
        <nav aria-label="Primary" className="mt-8 space-y-1">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white", active && "bg-slate-800 text-white")}><Icon size={18} aria-hidden="true" />{label}</Link>;
          })}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-lg border border-slate-700 bg-slate-900 p-3 text-xs leading-5 text-slate-300"><span className="font-bold text-teal-300">Synthetic mode</span><br />No external systems connected.</div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-7">
          <div className="flex min-w-0 items-center gap-3"><Menu className="lg:hidden" size={20} aria-hidden="true" /><div className="min-w-0"><p className="truncate text-sm font-semibold">Synthetic healthcare communications portfolio</p><p className="truncate text-xs text-slate-500">Reporting period · August 2026 · CAD</p></div></div>
          <div className="ml-4 flex items-center gap-2"><span className={cn("hidden rounded-full border px-3 py-1.5 text-xs font-bold sm:inline", snapshotValidated ? "border-teal-200 bg-teal-50 text-teal-800" : "border-violet-200 bg-violet-50 text-violet-800")}>Source status · {snapshotValidated ? "validated" : "unvalidated"}</span><Link href="/proof" className="grid min-h-11 min-w-11 place-items-center rounded-md border border-slate-300" aria-label="Open evidence proof"><FileSearch size={18} /></Link></div>
        </header>
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-900 lg:px-7">{SYNTHETIC_NOTICE}</div>
        <main className="app-main min-w-0 p-4 lg:p-7">{children}</main>
      </div>

      <aside className="desktop-inspector sticky top-0 h-screen overflow-y-auto border-l border-slate-200 bg-white p-5">{inspector ?? <div><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Evidence inspector</p><p className="mt-3 text-sm leading-6 text-slate-600">Select a record to inspect source, revision, deterministic reasons, owner, and required human authority.</p></div>}</aside>

      <nav aria-label="Mobile primary" className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-30 grid-cols-4 border-t border-slate-200 bg-white p-1.5 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
        {mobileNavigation.map(({ href, label, icon: Icon }) => { const active = pathname === href; return <Link key={href} href={href} className={cn("flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-[0.68rem] font-semibold text-slate-600", active && "bg-teal-50 text-teal-800")}><Icon size={18} aria-hidden="true" />{label}</Link>; })}
      </nav>
    </div>
  );
}
