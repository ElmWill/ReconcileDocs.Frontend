import type { DashboardSummary, DocumentUploadSummary, ReconcileRunSummary } from "@/types/api";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Table } from "@/components/ui/table";

interface Props {
  summary?: DashboardSummary | null;
  uploads?: DocumentUploadSummary[] | null;
  runs?: ReconcileRunSummary[] | null;
  isLoading?: boolean;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function DashboardView({ summary, uploads, runs, isLoading }: Props) {
  const cards = [
    { label: "Uploaded files", value: summary?.uploadedDocuments ?? null },
    { label: "Reconcile runs", value: summary?.reconcileRuns ?? null },
    { label: "Successful runs", value: summary?.successfulRuns ?? null },
    { label: "Failed runs", value: summary?.failedRuns ?? null }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label} className="min-h-[88px] flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{isLoading ? "…" : card.value ?? "—"}</p>
          </Card>
        ))}
      </section>

      <section className="space-y-6">
        <Card>
          <CardTitle>Recent uploads</CardTitle>
          <CardBody>
            <div className="overflow-x-auto">
              <Table className="min-w-[720px] table-auto">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-[0.22em] text-slate-500">
                    <th className="py-2 pr-4 text-slate-900">File</th>
                    <th className="py-2 pr-4 text-slate-900">Size</th>
                    <th className="py-2 pr-4 text-slate-900">Reconcile</th>
                    <th className="py-2 pl-6 text-slate-900">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {(uploads ?? []).map((upload) => (
                    <tr key={upload.id} className="border-b last:border-b-0 align-top">
                      <td className="py-3 pr-4 font-medium text-slate-800 break-words">{upload.originalFileName}</td>
                      <td className="py-3 pr-4 whitespace-nowrap text-slate-600">{Math.round(upload.sizeBytes / 1024)} KB</td>
                      <td className="py-3 pr-4 text-slate-600">
                        <span className={`inline-flex max-w-full items-center gap-2 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${upload.isUsedInReconcile ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          <span aria-hidden="true">{upload.isUsedInReconcile ? "✓" : "○"}</span>
                          {upload.isUsedInReconcile ? "Used" : "Not used"}
                        </span>
                      </td>
                      <td className="py-3 pl-6 text-slate-600 whitespace-nowrap">{formatDate(upload.uploadedAtUtc)}</td>
                    </tr>
                  ))}
                  {!(uploads?.length) && (
                    <tr>
                      <td className="py-4 text-slate-500" colSpan={4}>
                        No uploads yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardTitle>Recent reconcile runs</CardTitle>
          <CardBody>
            <Table>
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.22em] text-sand-100/60">
                  <th className="py-2 pr-3 text-slate-900">Parser</th>
                  <th className="py-2 pr-3 text-slate-900">Matched</th>
                  <th className="py-2 pr-3 text-slate-900">Unmatched</th>
                  <th className="py-2 pr-3 text-slate-900">Started</th>
                </tr>
              </thead>
              <tbody>
                {(runs ?? []).map((run) => (
                  <tr key={run.id} className="border-b last:border-b-0">
                    <td className="py-3 pr-3 font-medium text-slate-800">{run.parserName}</td>
                    <td className="py-3 pr-3 text-slate-600">{run.matchedCount}</td>
                    <td className="py-3 pr-3 text-slate-600">{run.unmatchedCount}</td>
                    <td className="py-3 pr-3 text-slate-600">{formatDate(run.startedAtUtc)}</td>
                  </tr>
                ))}
                {!(runs?.length) && (
                  <tr>
                    <td className="py-4 text-slate-500" colSpan={4}>
                      No reconcile runs yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}