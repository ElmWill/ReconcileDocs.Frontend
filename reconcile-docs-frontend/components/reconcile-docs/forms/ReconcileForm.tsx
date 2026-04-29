import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { reconcileDocsApi } from "@/functions/api/reconcileDocsApi";
import type { DocumentUploadSummary } from "@/types/api";

interface Props {
  uploads: DocumentUploadSummary[];
  onReconciled: () => Promise<void>;
}

export function ReconcileForm({ uploads, onReconciled }: Props) {
  const spreadsheetUploads = useMemo(() => uploads.filter((upload) => upload.contentType.includes("sheet") || upload.documentKind === 1), [uploads]);
  const statementUploads = useMemo(() => uploads.filter((upload) => upload.contentType.includes("pdf") || upload.documentKind === 2), [uploads]);
  const [spreadsheetUploadId, setSpreadsheetUploadId] = useState<string>("");
  const [statementUploadId, setStatementUploadId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function handleReconcile() {
    if (!spreadsheetUploadId || !statementUploadId) {
      setMessage("Pick both a spreadsheet and a statement.");
      return;
    }

    setBusy(true);
    setMessage("");

    const result = await reconcileDocsApi.startReconcile({ spreadsheetUploadId, statementUploadId });

    setBusy(false);

    if (result.error) {
      setMessage(result.problem?.title ?? result.error.message);
      return;
    }

    setMessage(`Reconciled with ${result.data?.parserName ?? "parser"}.`);
    await onReconciled();
  }

  return (
    <Card>
      <CardTitle>Run reconciliation</CardTitle>
      <CardBody>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-sand-100/80">Spreadsheet source</span>
          <Select value={spreadsheetUploadId} onChange={(event) => setSpreadsheetUploadId(event.target.value)}>
            <option value="">Select spreadsheet</option>
            {spreadsheetUploads.map((upload) => (
              <option key={upload.id} value={upload.id}>
                {upload.originalFileName}
              </option>
            ))}
          </Select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-sand-100/80">Statement source</span>
          <Select value={statementUploadId} onChange={(event) => setStatementUploadId(event.target.value)}>
            <option value="">Select statement</option>
            {statementUploads.map((upload) => (
              <option key={upload.id} value={upload.id}>
                {upload.originalFileName}
              </option>
            ))}
          </Select>
        </label>

        <Button type="button" onClick={handleReconcile} disabled={busy || !uploads.length}>
          Start reconcile
        </Button>
        {message ? <p className="text-sm text-cyan-300">{message}</p> : null}
      </CardBody>
    </Card>
  );
}