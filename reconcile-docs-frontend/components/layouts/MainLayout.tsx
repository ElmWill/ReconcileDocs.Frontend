import type { PropsWithChildren } from "react";
import { PageContainer } from "@/components/layouts/PageContainer";

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto w-full px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Reconcile Docs</h1>
              <p className="text-sm text-slate-500">Upload Excel and PDFs to reconcile quickly</p>
            </div>
            <nav className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm">
              <a className="rounded-full px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900" href="#">Dashboard</a>
              <a className="rounded-full px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900" href="#upload">Upload</a>
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}