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
  const [uploadingAction, setUploadingAction] = useState<"spreadsheet" | "statement" | "reconcile" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pdfPassword, setPdfPassword] = useState<string>("");
  const [reconcileRunId, setReconcileRunId] = useState<string | null>(null);
  const [progressPoll, setProgressPoll] = useState<boolean>(false);
  const [lastProgressData, setLastProgressData] = useState<ReconcileProgressResult | null>(null);
  const [selectedSpreadsheetUploadId, setSelectedSpreadsheetUploadId] = useState<string | null>(null);
  const [selectedStatementUploadId, setSelectedStatementUploadId] = useState<string | null>(null);
  const [pendingSpreadsheetFile, setPendingSpreadsheetFile] = useState<File | null>(null);
  const [pendingStatementFile, setPendingStatementFile] = useState<File | null>(null);
  const [excelDropActive, setExcelDropActive] = useState(false);
  const [pdfDropActive, setPdfDropActive] = useState(false);
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
        if (data.status === 0) return 2000; // queued: keep polling until the worker starts
        if (data.status === 1) return 2000; // running: 2s
        return 0; // complete/failed: stop polling
      },
      dedupingInterval: 2000,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  useEffect(() => {
    if (progressData) {
      setLastProgressData(progressData);
    }
  }, [progressData]);

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

  function handleExcelSelection(file?: File | null) {
    if (!file) return;
    setPendingSpreadsheetFile(file);
    setMessage(`Selected Excel: ${file.name}`);
  }

  function handlePdfSelection(file?: File | null) {
    if (!file) return;
    setPendingStatementFile(file);
    setMessage(`Selected PDF: ${file.name}`);
  }

  function handleDropEvent(event: React.DragEvent<HTMLDivElement>, accept: string, onFile: (file?: File | null) => void, setActive: (value: boolean) => void) {
    event.preventDefault();
    event.stopPropagation();
    setActive(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    if (!file) return;
    if (!accept.split(",").some((type) => file.name.toLowerCase().endsWith(type.replace(".", "").trim().toLowerCase()))) {
      return;
    }
    void onFile(file);
  }

  async function uploadPendingSpreadsheet() {
    if (!pendingSpreadsheetFile) {
      setMessage("Choose an Excel file first.");
      return;
    }

    setUploading(true);
    setUploadingAction("spreadsheet");
    setMessage(null);
    const res = await reconcileDocsApi.uploadSpreadsheet(pendingSpreadsheetFile);
    setUploading(false);
    setUploadingAction(null);

    if (res.error) {
      setMessage(res.problem?.title ?? res.error.message);
      return;
    }

    setMessage(`${pendingSpreadsheetFile.name} uploaded`);
    setSelectedSpreadsheetUploadId(res.data?.documentUploadId ?? null);
    setPendingSpreadsheetFile(null);
    await refreshAll();
  }

  async function uploadPendingStatement() {
    if (!pendingStatementFile) {
      setMessage("Choose a PDF file first.");
      return;
    }

    setUploading(true);
    setUploadingAction("statement");
    setMessage(null);
    const res = await reconcileDocsApi.uploadStatement(pendingStatementFile, pdfPassword || undefined);
    setUploading(false);
    setUploadingAction(null);

    if (res.error) {
      setMessage(res.problem?.title ?? res.error.message);
      return;
    }

    setMessage(`${pendingStatementFile.name} uploaded`);
    setSelectedStatementUploadId(res.data?.documentUploadId ?? null);
    setPendingStatementFile(null);
    await refreshAll();
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
    setUploadingAction("reconcile");
    setMessage("Starting reconciliation...");
    const result = await reconcileDocsApi.startReconcileAsync({ spreadsheetUploadId: spreadsheetUpload.id, statementUploadId: statementUpload.id });
    setUploading(false);
    setUploadingAction(null);
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
          <Card className="border-dashed border-2 border-slate-200/60 bg-white/60">
            <CardBody
              className={`min-h-56 flex flex-col items-center justify-center text-center transition-colors ${excelDropActive ? "border-emerald-400 bg-emerald-50/70" : ""}`}
              onDragEnter={(e) => {
                e.preventDefault();
                setExcelDropActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setExcelDropActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setExcelDropActive(false);
              }}
              onDrop={(e) => handleDropEvent(e, ".xlsx,.xls", handleExcelSelection, setExcelDropActive)}
            >
              <div className="flex flex-col items-center gap-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-slate-400">
                  <path d="M12 3v6M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-slate-700 text-lg font-medium">Upload Excel File</p>
                <p className="text-base text-slate-600">Drop an Excel file here, or click to browse.</p>

                <input ref={excelInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => handleExcelSelection(e.target.files?.[0] ?? null)} />
                <p className="text-sm text-slate-500">{pendingSpreadsheetFile ? `Ready to upload: ${pendingSpreadsheetFile.name}` : "No Excel file selected yet."}</p>
                <button type="button" onClick={() => excelInputRef.current?.click()} className="mt-3 px-5 py-2 rounded-md border border-dashed border-slate-300 text-slate-700 hover:border-emerald-400 hover:text-emerald-700">
                  Select Excel file
                </button>
                <button type="button" onClick={uploadPendingSpreadsheet} disabled={!pendingSpreadsheetFile || uploading || progressPoll} className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50" aria-busy={uploadingAction === "spreadsheet"}>
                  {uploadingAction === "spreadsheet" && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
                  {uploadingAction === "spreadsheet" ? "Uploading..." : "Upload Excel"}
                </button>
              </div>
            </CardBody>
          </Card>

          <div>
            <Card className="border-dashed border-2 border-slate-200/60 bg-white/60">
              <CardBody
                className={`min-h-56 flex flex-col items-center justify-center text-center transition-colors ${pdfDropActive ? "border-emerald-400 bg-emerald-50/70" : ""}`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setPdfDropActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setPdfDropActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setPdfDropActive(false);
                }}
                onDrop={(e) => handleDropEvent(e, ".pdf", handlePdfSelection, setPdfDropActive)}
              >
                <div className="flex flex-col items-center gap-3">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-slate-400">
                    <path d="M12 3v6M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-slate-700 text-lg font-medium">Upload PDF Document</p>
                  <p className="text-base text-slate-600">Select a PDF first, then upload it when you are ready to parse.</p>

                  <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handlePdfSelection(e.target.files?.[0] ?? null)} />
                  <p className="text-sm text-slate-500">{pendingStatementFile ? `Ready to upload: ${pendingStatementFile.name}` : "No PDF file selected yet."}</p>
                  <button type="button" onClick={() => pdfInputRef.current?.click()} className="mt-3 px-5 py-2 rounded-md border border-dashed border-slate-300 text-slate-700 hover:border-emerald-400 hover:text-emerald-700">Select PDF file</button>

                  <div className="w-full max-w-md text-left">
                    <label className="block text-sm font-medium text-slate-700 mb-1">PDF Password (if encrypted)</label>
                    <input
                      type="password"
                      value={pdfPassword}
                      onChange={(e) => setPdfPassword(e.target.value)}
                      placeholder="Leave empty if PDF is not password-protected"
                      className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button type="button" onClick={uploadPendingStatement} disabled={!pendingStatementFile || uploading || progressPoll} className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50" aria-busy={uploadingAction === "statement"}>
                    {uploadingAction === "statement" && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
                    {uploadingAction === "statement" ? "Uploading..." : "Upload PDF"}
                  </button>
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
              </ul>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Select Uploaded Excel
                  </label>
                  <select
                    value={selectedSpreadsheetUploadId ?? ""}
                    onChange={(e) => setSelectedSpreadsheetUploadId(e.target.value || null)}
                    className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white focus:outline-none focus:border-emerald-500"
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
                    className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white focus:outline-none focus:border-emerald-500"
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
                  <p className="text-sm text-slate-500">PDF password is used during upload.</p>
                </div>
                <Button onClick={handleAnalyze} disabled={!spreadsheetUpload || !statementUpload || uploading || progressPoll} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" aria-busy={uploadingAction === "reconcile"}>
                  {uploadingAction === "reconcile" ? "Reconciling..." : progressPoll ? "Reconciling..." : "Reconcile"}
                </Button>
                {message ? <p className="mt-2 text-base text-slate-700">{message}</p> : null}
                {(progressPoll || lastProgressData) && (progressData ?? lastProgressData) && (
                  <div className="mt-3 p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="text-sm font-medium text-slate-700 mb-2">Progress</div>
                    <div className="space-y-1 text-sm text-slate-600">
                      {(() => {
                        const activeProgress = progressData ?? lastProgressData;
                        if (!activeProgress) return null;
                        return (
                          <>
                            <div>Status: {activeProgress.status === 0 ? "Queued" : activeProgress.status === 1 ? "Running" : activeProgress.status === 2 ? "Complete" : (activeProgress.matchedCount + activeProgress.unmatchedCount) > 0 ? "Complete with warnings" : "Failed"}</div>
                            <div>Matched: {activeProgress.matchedCount}</div>
                            <div>Unmatched: {activeProgress.unmatchedCount}</div>
                            {activeProgress.errorMessage && <div className="text-red-600">Error: {activeProgress.errorMessage}</div>}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {reconcileRunId && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <ReconcileResults
                      key={reconcileRunId}
                      runId={reconcileRunId}
                      matchedCount={(progressData ?? lastProgressData)?.matchedCount ?? 0}
                      unmatchedCount={(progressData ?? lastProgressData)?.unmatchedCount ?? 0}
                    />
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* <section id="bulk" className="grid gap-6">
        <BulkUploadCard
          spreadsheetUploadId={selectedSpreadsheetUploadId}
          onUploadComplete={refreshAll}
          onBulkReconcileStart={refreshAll}
        />
      </section> */}

    </div>
  );
}

