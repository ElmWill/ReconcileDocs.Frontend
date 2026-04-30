import type { PropsWithChildren } from "react";
import { PageContainer } from "@/components/layouts/PageContainer";

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <header className="bg-white/80 shadow-sm">
        <PageContainer>
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <h1 className="text-lg font-semibold">Reconcile Docs</h1>
              <p className="text-sm text-slate-500">Upload Excel and PDFs to reconcile quickly</p>
            </div>
            <nav className="flex gap-4 items-center">
              <a className="text-sm text-slate-600 hover:text-slate-900" href="#">Dashboard</a>
              <a className="text-sm text-slate-600 hover:text-slate-900" href="#upload">Upload</a>
            </nav>
          </div>
        </PageContainer>
      </header>
      <main className="py-10">{children}</main>
    </div>
  );
}