import useSWR from "swr";
import { DashboardView } from "@/components/reconcile-docs/dashboard";
import { DocumentUploadForm } from "@/components/reconcile-docs/forms/DocumentUploadForm";
import { ReconcileForm } from "@/components/reconcile-docs/forms/ReconcileForm";
import { TemplateCreateForm } from "@/components/reconcile-docs/forms/TemplateCreateForm";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { BackendApiUrl } from "@/functions/BackendApiUrl";
import { reconcileDocsApi } from "@/functions/api/reconcileDocsApi";
import { useSwrFetcherWithAccessToken } from "@/functions/useSwrFetcherWithAccessToken";
import type { DashboardSummary, DocumentUploadSummary, ReconcileRunSummary } from "@/types/api";

export function ReconcileDocsApp() {
  const fetcher = useSwrFetcherWithAccessToken();
  const summary = useSWR<DashboardSummary>(BackendApiUrl.dashboardSummary, fetcher);
  const uploads = useSWR<DocumentUploadSummary[]>(BackendApiUrl.dashboardUploads(20), fetcher);
  const runs = useSWR<ReconcileRunSummary[]>(BackendApiUrl.dashboardRuns(20), fetcher);

  async function refreshAll() {
    await Promise.all([summary.mutate(), uploads.mutate(), runs.mutate()]);
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden">
          <CardBody className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Operations cockpit</p>
              <h2 className="text-4xl font-semibold tracking-tight text-sand-100">Upload statements, reconcile rows, inspect the results.</h2>
              <p className="max-w-2xl text-sm leading-6 text-sand-100/70">
                This frontend talks only to the gateway proxy, which forwards requests to the .NET backend for uploads, template creation,
                reconciliation runs, and dashboard reads.
              </p>
            </div>

            <DashboardView summary={summary.data} uploads={uploads.data} runs={runs.data} isLoading={summary.isLoading || uploads.isLoading || runs.isLoading} />
          </CardBody>
        </Card>

        <div className="space-y-6">
          <DocumentUploadForm onUploaded={refreshAll} />
          <ReconcileForm uploads={uploads.data ?? []} onReconciled={refreshAll} />
          <TemplateCreateForm onCreated={refreshAll} />
        </div>
      </section>

      <Card>
        <CardTitle>Backend endpoints wired</CardTitle>
        <CardBody>
          <ul className="grid gap-3 text-sm text-sand-100/75 sm:grid-cols-2 xl:grid-cols-3">
            <li>POST /api/documents/spreadsheet</li>
            <li>POST /api/documents/statement</li>
            <li>POST /api/documents/reconcile</li>
            <li>GET /api/dashboard/summary</li>
            <li>GET /api/dashboard/uploads</li>
            <li>GET /api/dashboard/runs</li>
            <li>POST /api/templates</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}