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
      <section id="upload" className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="overflow-hidden">
          <CardBody className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">Dashboard</h2>
              <p className="text-sm text-sand-100/70">Upload statements, run reconciliation, and review results.</p>
            </div>

            <DashboardView summary={summary.data} uploads={uploads.data} runs={runs.data} isLoading={summary.isLoading || uploads.isLoading || runs.isLoading} />
          </CardBody>
        </Card>

        <div className="space-y-4">
          <DocumentUploadForm onUploaded={refreshAll} />
          <ReconcileForm uploads={uploads.data ?? []} onReconciled={refreshAll} />
          <TemplateCreateForm onCreated={refreshAll} uploads={uploads.data ?? []} />
        </div>
      </section>
    </div>
  );
}