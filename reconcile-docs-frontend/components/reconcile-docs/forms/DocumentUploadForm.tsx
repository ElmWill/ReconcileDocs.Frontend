import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { reconcileDocsApi } from "@/functions/api/reconcileDocsApi";
import { DocumentKind } from "@/types/api";

interface Props {
  onUploaded: () => Promise<void>;
}

interface UploadState {
  spreadsheet?: File | null;
  statement?: File | null;
}

export function DocumentUploadForm({ onUploaded }: Props) {
  const [files, setFiles] = useState<UploadState>({});
  const [message, setMessage] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const hasFiles = useMemo(() => Boolean(files.spreadsheet || files.statement), [files]);

  async function handleUpload(kind: DocumentKind) {
    const file = kind === DocumentKind.Spreadsheet ? files.spreadsheet : files.statement;

    if (!file) {
      setMessage(kind === DocumentKind.Spreadsheet ? "Choose an Excel file first." : "Choose a PDF file first.");
      return;
    }

    setBusy(true);
    setMessage("");

    const result =
      kind === DocumentKind.Spreadsheet ? await reconcileDocsApi.uploadSpreadsheet(file) : await reconcileDocsApi.uploadStatement(file);

    setBusy(false);

    if (result.error) {
      setMessage(result.problem?.title ?? result.error.message);
      return;
    }

    setMessage(`${file.name} uploaded successfully.`);
    await onUploaded();
  }

  return (
    <Card>
      <CardTitle>Upload source files</CardTitle>
      <CardBody>
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-sand-100/80">Excel file</span>
            <Input type="file" accept=".xlsx,.xls" onChange={(event) => setFiles((current) => ({ ...current, spreadsheet: event.target.files?.[0] ?? null }))} />
          </label>
          <Button type="button" onClick={() => handleUpload(DocumentKind.Spreadsheet)} disabled={busy || !hasFiles}>
            Upload spreadsheet
          </Button>
        </div>

        <div className="space-y-4 border-t border-white/10 pt-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-sand-100/80">PDF statement</span>
            <Input type="file" accept=".pdf" onChange={(event) => setFiles((current) => ({ ...current, statement: event.target.files?.[0] ?? null }))} />
          </label>
          <Button type="button" onClick={() => handleUpload(DocumentKind.StatementPdf)} disabled={busy || !hasFiles}>
            Upload statement
          </Button>
        </div>

        {message ? <p className="text-sm text-cyan-300">{message}</p> : null}
      </CardBody>
    </Card>
  );
}