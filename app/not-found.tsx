import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f9fd] px-6 text-center text-navy-950">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-card">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-electric-700">404</p>
        <h1 className="mt-3 text-3xl font-black text-black">Page not found</h1>
        <p className="mt-3 text-slate-600">This Voice Flex page is not available.</p>
        <Link
          href="/"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-electric-600 px-6 font-black text-white shadow-blue hover:bg-electric-700"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
