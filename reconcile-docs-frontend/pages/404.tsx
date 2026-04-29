import Link from "next/link";
import { MainLayout } from "@/components/layouts/MainLayout";

export default function NotFoundPage() {
  return (
    <MainLayout>
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-start justify-center px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Not found</p>
        <h2 className="mt-4 text-4xl font-semibold">That route does not exist.</h2>
        <Link className="mt-6 rounded-full border border-cyan-300/20 bg-cyan-400/90 px-4 py-2 font-semibold text-slate-950" href="/">
          Back to dashboard
        </Link>
      </div>
    </MainLayout>
  );
}