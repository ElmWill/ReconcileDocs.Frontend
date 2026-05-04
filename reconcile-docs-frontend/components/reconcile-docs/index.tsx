import { useRef, useState, useEffect } from "react";
import useSWR from "swr";
import { DashboardView } from "@/components/reconcile-docs/dashboard";
import { BulkUploadCard } from "@/components/reconcile-docs/bulk-upload";
import { ReconcileResults } from "@/components/reconcile-docs/results";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackendApiUrl } from "@/functions/BackendApiUrl";
import { reconcileDocsApi } from "@/functions/api/reconcileDocsApi";
import { useSwrFetcherWithAccessToken } from "@/functions/useSwrFetcherWithAccessToken";
import type { DashboardSummary, DocumentUploadSummary, ReconcileRunSummary, ReconcileProgressResult } from "@/types/api";

export function ReconcileDocsApp() {
  const fetcher = useSwrFetcherWithAccessToken();
  const summary = useSWR<DashboardSummary>(BackendApiUrl.dashboardSummary, fetcher);
  const uploads = useSWR<DocumentUploadSummary[]>(BackendApiUrl.dashboardUploads(20), fetcher);
  const runs = useSWR<ReconcileRunSummary[]>(BackendApiUrl.dashboardRuns(20), fetcher);

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pdfPassword, setPdfPassword] = useState<string>("");
  const [reconcileRunId, setReconcileRunId] = useState<string | null>(null);
  const [progressPoll, setProgressPoll] = useState<boolean>(false);
  const [selectedSpreadsheetUploadId, setSelectedSpreadsheetUploadId] = useState<string | null>(null);
  const [selectedStatementUploadId, setSelectedStatementUploadId] = useState<string | null>(null);
  const excelInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  // Poll progress if reconcile is running (adaptive/backoff to reduce DB load)
  const { data: progressData, error: progressError } = useSWR<ReconcileProgressResult>(
    progressPoll && reconcileRunId ? () => BackendApiUrl.getReconcileProgress(reconcileRunId) : null,
    progressPoll && reconcileRunId ? fetcher : null,
    {
      // Adaptive polling: poll faster while running, slower otherwise; zero disables polling
      refreshInterval: (data: ReconcileProgressResult | undefined) => {
        if (!data) return 3000; // initial: 3s
        if (data.status === 1) return 2000; // running: 2s
        return 0; // complete/failed: stop polling
      },
      dedupingInterval: 2000,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  // Stop polling when job completes (status 2 = complete, 3 = failed)
  useEffect(() => {
    if (progressData?.status === 2 || progressData?.status === 3) {
      setProgressPoll(false);
      const hasRows = (progressData.matchedCount + progressData.unmatchedCount) > 0;
      setMessage(
        progressData.status === 2
          ? `Analysis complete. Matched: ${progressData.matchedCount}, Unmatched: ${progressData.unmatchedCount}`
          : hasRows
            ? `Analysis completed with warnings. Matched: ${progressData.matchedCount}, Unmatched: ${progressData.unmatchedCount}`
            : `Analysis failed: ${progressData.errorMessage}`
      );
      refreshAll();
    }
  }, [progressData?.status]);

  // Conservative fallback: if SWR doesn't receive updates for a long period while running, pause polling
  const lastProgressRef = useRef<number>(Date.now());
  useEffect(() => {
    if (!progressPoll || !reconcileRunId) return;
    if (progressData) lastProgressRef.current = Date.now();
    const check = setInterval(() => {
      const age = Date.now() - lastProgressRef.current;
      // if no update for 2 minutes while still marked running, pause polling to avoid hammering the server
      if (progressData?.status === 1 && age > 120_000) {
        setProgressPoll(false);
        setMessage("Pausing progress polling due to inactivity. Refresh to resume monitoring.");
      }
    }, 30_000);
    return () => clearInterval(check);
  }, [progressPoll, reconcileRunId, progressData]);

  async function refreshAll() {
    await Promise.all([summary.mutate(), uploads.mutate(), runs.mutate()]);
  }

  async function handleExcelFile(file?: File | null) {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    const res = await reconcileDocsApi.uploadSpreadsheet(file);
    setUploading(false);
    if (res.error) setMessage(res.problem?.title ?? res.error.message);
    else {
      setMessage(`${file.name} uploaded`);
      setSelectedSpreadsheetUploadId(res.data?.documentUploadId ?? null);
      await refreshAll();
    }
  }

  async function handlePdfFile(file?: File | null) {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    const res = await reconcileDocsApi.uploadStatement(file);
    setUploading(false);
    if (res.error) setMessage(res.problem?.title ?? res.error.message);
    else {
      setMessage(`${file.name} uploaded`);
      setSelectedStatementUploadId(res.data?.documentUploadId ?? null);
      await refreshAll();
    }
  }

  const spreadsheetUploads = (uploads.data ?? [])
    .filter((u) => u.contentType.includes("sheet") || u.documentKind === 1)
    .sort((a, b) => (b.uploadedAtUtc ?? "").localeCompare(a.uploadedAtUtc ?? ""));
  const statementUploads = (uploads.data ?? [])
    .filter((u) => u.contentType.includes("pdf") || u.documentKind === 2)
    .sort((a, b) => (b.uploadedAtUtc ?? "").localeCompare(a.uploadedAtUtc ?? ""));

  useEffect(() => {
    if (!selectedSpreadsheetUploadId && spreadsheetUploads.length > 0) {
      setSelectedSpreadsheetUploadId(spreadsheetUploads[0].id);
    }
  }, [selectedSpreadsheetUploadId, spreadsheetUploads]);

  useEffect(() => {
    if (!selectedStatementUploadId && statementUploads.length > 0) {
      setSelectedStatementUploadId(statementUploads[0].id);
    }
  }, [selectedStatementUploadId, statementUploads]);

  const spreadsheetUpload = spreadsheetUploads.find((u) => u.id === selectedSpreadsheetUploadId) ?? null;
  const statementUpload = statementUploads.find((u) => u.id === selectedStatementUploadId) ?? null;

  async function handleAnalyze() {
    if (!spreadsheetUpload || !statementUpload) {
      setMessage("Upload both files before analyzing.");
      return;
    }

    setUploading(true);
    setMessage("Starting reconciliation...");
    const result = await reconcileDocsApi.startReconcileAsync({ spreadsheetUploadId: spreadsheetUpload.id, statementUploadId: statementUpload.id, password: pdfPassword || undefined });
    setUploading(false);
    if (result.error) {
      setMessage(result.problem?.title ?? result.error.message);
    } else {
      setReconcileRunId(result.data!.reconcileRunId);
      setProgressPoll(true);
      setMessage("Reconciliation enqueued, monitoring progress...");
    }
  }

  return (
    <div className="space-y-8">
      <section id="upload" className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Left column: top Data Monitoring card + big Upload PDF card */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardBody className="space-y-4 relative">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">Data Monitoring</h2>
                    <p className="text-base text-slate-700">Upload an Excel file to populate this grid</p>
                  </div>
                </div>

                <div className="mt-4">
                  <DashboardView summary={summary.data} uploads={uploads.data} runs={runs.data} isLoading={summary.isLoading || uploads.isLoading || runs.isLoading} />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Excel upload moved into its own card for clarity */}
          <Card>
            <CardTitle>Upload Excel</CardTitle>
            <CardBody className="flex items-center justify-between gap-4">
              <div className="text-base text-slate-700">Select an Excel file to populate the monitoring grid.</div>
              <div>
                <input ref={excelInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => handleExcelFile(e.target.files?.[0] ?? null)} />
                <button type="button" onClick={() => excelInputRef.current?.click()} className="px-4 py-2 rounded border border-dashed border-slate-300 text-slate-700">Click or drop Excel</button>
              </div>
            </CardBody>
          </Card>

          <div>
            <Card className="border-dashed border-2 border-slate-200/60 bg-white/60">
              <CardBody className="h-56 flex flex-col items-center justify-center text-center">
                <div className="flex flex-col items-center gap-3">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-slate-400">
                    <path d="M12 3v6M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-slate-700 text-lg font-medium">Upload PDF Document</p>
                  <p className="text-base text-slate-600">Upload an invoice or document to compare against the Excel data</p>

                  <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handlePdfFile(e.target.files?.[0] ?? null)} />
                  <button type="button" onClick={() => pdfInputRef.current?.click()} className="mt-3 px-5 py-2 rounded-md border border-dashed border-slate-300 text-slate-700">Click or drag PDF here</button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Right column: AI Analysis card */}
        <div className="space-y-6">
          <Card>
            <CardBody className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Reconcile</h3>
                <p className="text-base text-slate-700">Run reconciliation between uploaded PDF and Excel</p>
              </div>

              <ul className="space-y-2 text-base text-slate-700">
                <li className={`flex items-center gap-2 ${spreadsheetUpload ? "text-emerald-600" : "text-slate-400"}`}>
                  <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center">{spreadsheetUpload ? "✓" : "○"}</span>
                  Excel data loaded
                </li>
                <li className={`flex items-center gap-2 ${statementUpload ? "text-emerald-600" : "text-slate-400"}`}>
                  <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center">{statementUpload ? "✓" : "○"}</span>
                  PDF uploaded
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center">○</span>
                  Template available
                </li>
              </ul>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Select Uploaded Excel
                  </label>
                  <select
                    value={selectedSpreadsheetUploadId ?? ""}
                    onChange={(e) => setSelectedSpreadsheetUploadId(e.target.value || null)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Choose Excel file</option>
                    {spreadsheetUploads.map((upload) => (
                      <option key={upload.id} value={upload.id}>
                        {upload.originalFileName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Select Uploaded PDF
                  </label>
                  <select
                    value={selectedStatementUploadId ?? ""}
                    onChange={(e) => setSelectedStatementUploadId(e.target.value || null)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Choose PDF file</option>
                    {statementUploads.map((upload) => (
                      <option key={upload.id} value={upload.id}>
                        {upload.originalFileName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    PDF Password (if encrypted)
                  </label>
                  <input
                    type="password"
                    value={pdfPassword}
                    onChange={(e) => setPdfPassword(e.target.value)}
                    placeholder="Leave empty if PDF is not password-protected"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <Button onClick={handleAnalyze} disabled={!spreadsheetUpload || !statementUpload || uploading || progressPoll} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                  {progressPoll ? "Reconciling..." : "Reconcile"}
                </Button>
                {message ? <p className="mt-2 text-base text-slate-700">{message}</p> : null}
                {progressPoll && progressData && (
                  <div className="mt-3 p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="text-sm font-medium text-slate-700 mb-2">Progress</div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div>Status: {progressData.status === 0 ? "Queued" : progressData.status === 1 ? "Running" : progressData.status === 2 ? "Complete" : (progressData.matchedCount + progressData.unmatchedCount) > 0 ? "Complete with warnings" : "Failed"}</div>
                      <div>Matched: {progressData.matchedCount}</div>
                      <div>Unmatched: {progressData.unmatchedCount}</div>
                      {progressData.errorMessage && <div className="text-red-600">Error: {progressData.errorMessage}</div>}
                    </div>
                  </div>
                )}

                {(progressData?.status === 2 || progressData?.status === 3) && reconcileRunId && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <ReconcileResults runId={reconcileRunId} matchedCount={progressData.matchedCount} unmatchedCount={progressData.unmatchedCount} />
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* How it works removed per request */}
        </div>
      </section>

      <section id="bulk" className="grid gap-6">
        <BulkUploadCard
          spreadsheetUploadId={selectedSpreadsheetUploadId}
          onUploadComplete={refreshAll}
          onBulkReconcileStart={refreshAll}
        />
      </section>

    </div>
  );
}

