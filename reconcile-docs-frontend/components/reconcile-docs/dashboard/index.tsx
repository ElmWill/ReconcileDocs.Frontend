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
    { label: "Uploaded files", value: summary?.uploadedDocuments ?? 0 },
    { label: "Reconcile runs", value: summary?.reconcileRuns ?? 0 },
    { label: "Active templates", value: summary?.activeTemplates ?? 0 },
    { label: "Successful runs", value: summary?.successfulRuns ?? 0 },
    { label: "Failed runs", value: summary?.failedRuns ?? 0 }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label}>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">{card.label}</p>
            <p className="mt-3 text-4xl font-semibold text-sand-100">{isLoading ? "…" : card.value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardTitle>Recent uploads</CardTitle>
          <CardBody>
            <Table>
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.22em] text-sand-100/60">
                  <th className="py-2 pr-3">File</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Size</th>
                  <th className="py-2 pr-3">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {(uploads ?? []).map((upload) => (
                  <tr key={upload.id} className="border-b border-white/5 last:border-b-0">
                    <td className="py-3 pr-3 font-medium text-sand-100">{upload.originalFileName}</td>
                    <td className="py-3 pr-3 text-sand-100/70">{upload.contentType}</td>
                    <td className="py-3 pr-3 text-sand-100/70">{Math.round(upload.sizeBytes / 1024)} KB</td>
                    <td className="py-3 pr-3 text-sand-100/70">{formatDate(upload.uploadedAtUtc)}</td>
                  </tr>
                ))}
                {!(uploads?.length) && (
                  <tr>
                    <td className="py-4 text-sand-100/50" colSpan={4}>
                      No uploads yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardTitle>Recent reconcile runs</CardTitle>
          <CardBody>
            <Table>
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.22em] text-sand-100/60">
                  <th className="py-2 pr-3">Parser</th>
                  <th className="py-2 pr-3">Matched</th>
                  <th className="py-2 pr-3">Unmatched</th>
                  <th className="py-2 pr-3">Started</th>
                </tr>
              </thead>
              <tbody>
                {(runs ?? []).map((run) => (
                  <tr key={run.id} className="border-b border-white/5 last:border-b-0">
                    <td className="py-3 pr-3 font-medium text-sand-100">{run.parserName}</td>
                    <td className="py-3 pr-3 text-sand-100/70">{run.matchedCount}</td>
                    <td className="py-3 pr-3 text-sand-100/70">{run.unmatchedCount}</td>
                    <td className="py-3 pr-3 text-sand-100/70">{formatDate(run.startedAtUtc)}</td>
                  </tr>
                ))}
                {!(runs?.length) && (
                  <tr>
                    <td className="py-4 text-sand-100/50" colSpan={4}>
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