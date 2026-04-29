import type { PropsWithChildren } from "react";
import { PageContainer } from "@/components/layouts/PageContainer";

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-sand-100">
      <header className="bg-transparent backdrop-blur-sm">
        <PageContainer>
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <h1 className="text-lg font-semibold">Reconcile Docs</h1>
              <p className="text-sm text-sand-100/70">Quickly upload and reconcile statements</p>
            </div>
            <nav className="flex gap-3 items-center">
              <a className="text-sm text-sand-100/70 hover:text-white" href="#">Dashboard</a>
              <a className="text-sm text-sand-100/70 hover:text-white" href="#upload">Upload</a>
            </nav>
          </div>
        </PageContainer>
      </header>
      <main className="py-8">{children}</main>
    </div>
  );
}