import Link from "next/link";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center p-6"><section className="max-w-md text-center"><p className="text-sm font-bold text-teal-700">404</p><h1 className="mt-2 text-3xl font-semibold">Record not found</h1><p className="mt-3 text-slate-600">The requested record is not present in the accepted synthetic snapshot.</p><Link className="mt-5 inline-flex min-h-11 items-center rounded-md bg-slate-900 px-4 text-white" href="/portfolio">Return to portfolio</Link></section></main>;
}
