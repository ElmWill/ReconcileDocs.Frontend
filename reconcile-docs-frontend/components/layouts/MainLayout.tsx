import type { PropsWithChildren } from "react";
import { PageContainer } from "@/components/layouts/PageContainer";

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(0,184,255,0.18),transparent_34%),linear-gradient(180deg,#07111e_0%,#050b14_100%)] text-sand-100">
      <header className="border-b border-white/10 bg-slate-950/40 backdrop-blur-xl">
        <PageContainer>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Reconcile Docs</p>
              <h1 className="mt-1 text-xl font-semibold">Document reconciliation dashboard</h1>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-sand-100/70">
              Backend proxy: /api/gateway
            </div>
          </div>
        </PageContainer>
      </header>
      <main>{children}</main>
    </div>
  );
}