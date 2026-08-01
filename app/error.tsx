"use client";

export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="max-w-lg rounded-xl border border-red-200 bg-white p-7 shadow-sm" role="alert">
        <p className="text-xs font-bold uppercase tracking-widest text-red-700">Last accepted state preserved</p>
        <h1 className="mt-2 text-2xl font-semibold">The workspace could not refresh.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">No partial import was committed. Retry the local operation or inspect the source receipt.</p>
        <button className="mt-5 min-h-11 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white" onClick={reset}>Retry</button>
      </section>
    </main>
  );
}
