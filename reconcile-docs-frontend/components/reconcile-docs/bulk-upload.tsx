import { useRef, useState } from "react";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { reconcileDocsApi } from "@/functions/api/reconcileDocsApi";
import type { BulkUploadStatementsResult, BulkUploadFileInfo } from "@/types/api";

interface BulkUploadProps {
  spreadsheetUploadId: string | null;
  onUploadComplete: () => void;
  onBulkReconcileStart: () => void;
}

export function BulkUploadCard({ spreadsheetUploadId, onUploadComplete, onBulkReconcileStart }: BulkUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkUploadStatementsResult | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [pdfPassword, setPdfPassword] = useState<string>("");

  async function handleBulkUpload(files?: FileList | null) {
    if (!files || files.length === 0) return;
    if (!spreadsheetUploadId) {
      setMessage("Upload Excel file first");
      return;
    }

    setUploading(true);
    setMessage(null);
    setBulkResult(null);

    const filesArray = Array.from(files);
    const result = await reconcileDocsApi.bulkUploadStatements(filesArray, spreadsheetUploadId);

    setUploading(false);

    if (result.error) {
      setMessage(result.problem?.title ?? result.error.message);
    } else if (result.data) {
      setBulkResult(result.data);
      setMessage(`Uploaded ${result.data.uploadedFiles.length} files. ${result.data.duplicateHashes.length} duplicates detected.`);
      onUploadComplete();
    }
  }

  async function handleBulkReconcile() {
    if (!bulkResult || !selectedPeriod || !spreadsheetUploadId) {
      setMessage("Select a period first");
      return;
    }

    const group = bulkResult.groupsByPeriod[selectedPeriod];
    const statementUploadIds = group.filter((f) => !f.isDuplicate).map((f) => f.documentUploadId);

    if (statementUploadIds.length === 0) {
      setMessage("No non-duplicate files in this group");
      return;
    }

    setUploading(true);
    const result = await reconcileDocsApi.bulkReconcile({
      spreadsheetUploadId,
      statementUploadIds,
      password: pdfPassword || undefined
    });
    setUploading(false);

    if (result.error) {
      setMessage(result.problem?.title ?? result.error.message);
    } else if (result.data) {
      setMessage(`✓ Enqueued ${result.data.totalEnqueued} reconciliation jobs`);
      onBulkReconcileStart();
      setBulkResult(null);
      setSelectedPeriod(null);
    }
  }

  return (
    <Card>
      <CardTitle>Bulk / Monthly Imports</CardTitle>
      <CardBody className="space-y-4">
        <p className="text-base text-slate-700">
          Upload multiple PDF statements. Duplicates are automatically detected by file hash and grouped by detected period.
        </p>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={(e) => handleBulkUpload(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Select PDFs
          </button>
        </div>

        {bulkResult && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-slate-700">Groups by Period</div>

            {Object.entries(bulkResult.groupsByPeriod).map(([period, files]) => {
              const nonDupCount = files.filter((f) => !f.isDuplicate).length;
              const dupCount = files.filter((f) => f.isDuplicate).length;
              return (
                <div
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`p-3 rounded border cursor-pointer transition ${
                    selectedPeriod === period ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="font-medium text-slate-800">{period}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {nonDupCount} new file{nonDupCount !== 1 ? "s" : ""} {dupCount > 0 && `· ${dupCount} duplicate${dupCount !== 1 ? "s" : ""}`}
                  </div>
                  <div className="mt-2 space-y-1">
                    {files.map((f) => (
                      <div key={f.fileName} className="text-xs text-slate-500">
                        <span className={f.isDuplicate ? "line-through" : ""}>{f.fileName}</span>
                        {f.isDuplicate && <span className="ml-2 text-orange-600 font-medium">(duplicate)</span>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  PDF Password (if encrypted)
                </label>
                <input
                  type="password"
                  value={pdfPassword}
                  onChange={(e) => setPdfPassword(e.target.value)}
                  placeholder="Leave empty if PDFs are not password-protected"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <Button
                onClick={handleBulkReconcile}
                disabled={!selectedPeriod || uploading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {uploading ? "Processing..." : `Reconcile ${selectedPeriod ? selectedPeriod : "Group"}`}
              </Button>
            </div>
          </div>
        )}

        {message && <p className="text-base text-slate-700">{message}</p>}
      </CardBody>
    </Card>
  );
}
