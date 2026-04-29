import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { reconcileDocsApi } from "@/functions/api/reconcileDocsApi";
import { DocumentKind, type DocumentUploadSummary } from "@/types/api";

interface Props {
  onCreated: () => Promise<void>;
  uploads: DocumentUploadSummary[];
}

function parseCommaSeparated(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function TemplateCreateForm({ onCreated, uploads }: Props) {
  const [name, setName] = useState("");
  const [parserKey, setParserKey] = useState("template");
  const [skipRows, setSkipRows] = useState(0);
  const [datePatterns, setDatePatterns] = useState("dd/MM/yyyy,yyyy-MM-dd");
  const [descriptionHints, setDescriptionHints] = useState("description,narration,remark");
  const [amountHints, setAmountHints] = useState("amount,debit,credit");
  const [sourceUploadId, setSourceUploadId] = useState("");
  const [advancedJson, setAdvancedJson] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [documentKind, setDocumentKind] = useState<DocumentKind>(DocumentKind.StatementPdf);
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const sampleUploads = useMemo(
    () => uploads.filter((upload) => upload.documentKind === DocumentKind.StatementPdf || upload.documentKind === DocumentKind.Spreadsheet),
    [uploads]
  );

  const generatedConfiguration = useMemo(
    () => ({
      sourceUploadId: sourceUploadId || undefined,
      skipRows,
      datePatterns: parseCommaSeparated(datePatterns),
      descriptionColumnHints: parseCommaSeparated(descriptionHints),
      amountColumnHints: parseCommaSeparated(amountHints)
    }),
    [amountHints, datePatterns, descriptionHints, skipRows, sourceUploadId]
  );

  const configurationJson = showAdvanced && advancedJson.trim() ? advancedJson : JSON.stringify(generatedConfiguration, null, 2);

  async function applySampleUpload(uploadId: string) {
    setSourceUploadId(uploadId);
    const selected = sampleUploads.find((upload) => upload.id === uploadId);

    if (!selected) {
      return;
    }

    if (!name.trim()) {
      const withoutExt = selected.originalFileName.replace(/\.[^.]+$/, "");
      setName(`${withoutExt} template`);
    }

    setDocumentKind(selected.documentKind === DocumentKind.Spreadsheet ? DocumentKind.Spreadsheet : DocumentKind.StatementPdf);

    setIsSuggesting(true);
    setMessage("");
    const suggestion = await reconcileDocsApi.suggestTemplate({ uploadId });
    setIsSuggesting(false);

    if (suggestion.error || !suggestion.data) {
      setMessage(suggestion.problem?.title ?? suggestion.error?.message ?? "Failed to generate template suggestions.");
      return;
    }

    const data = suggestion.data;
    setName(data.nameSuggestion || `${selected.originalFileName.replace(/\.[^.]+$/, "")} template`);
    setDocumentKind(data.documentKind);
    setParserKey(data.parserKey || "template");
    setSkipRows(data.skipRows);
    setDatePatterns(data.datePatterns.join(","));
    setDescriptionHints(data.descriptionColumnHints.join(","));
    setAmountHints(data.amountColumnHints.join(","));
    setAdvancedJson(data.suggestedConfigurationJson);
    setMessage("Template suggestions loaded from sample file.");
  }

  async function handleCreate() {
    if (!name.trim()) {
      setMessage("Template name is required.");
      return;
    }

    try {
      JSON.parse(configurationJson);
    } catch {
      setMessage("Configuration JSON is invalid.");
      return;
    }

    setBusy(true);
    setMessage("");

    const result = await reconcileDocsApi.createTemplate({
      name,
      documentKind,
      parserKey,
      configurationJson,
      isActive
    });

    setBusy(false);

    if (result.error) {
      setMessage(result.problem?.title ?? result.error.message);
      return;
    }

    setMessage("Template created.");
    setName("");
    setSourceUploadId("");
    setSkipRows(0);
    setDatePatterns("dd/MM/yyyy,yyyy-MM-dd");
    setDescriptionHints("description,narration,remark");
    setAmountHints("amount,debit,credit");
    setAdvancedJson("");
    await onCreated();
  }

  return (
    <Card>
      <CardTitle>Create template</CardTitle>
      <CardBody>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-sand-100/80">Start from uploaded file (optional)</span>
          <Select value={sourceUploadId} onChange={(event) => void applySampleUpload(event.target.value)}>
            <option value="">Select sample upload</option>
            {sampleUploads.map((upload) => (
              <option key={upload.id} value={upload.id}>
                {upload.originalFileName}
              </option>
            ))}
          </Select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-sand-100/80">Template name</span>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Bank statement template" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-sand-100/80">Document kind</span>
          <Select value={documentKind} onChange={(event) => setDocumentKind(Number(event.target.value) as DocumentKind)}>
            <option value={DocumentKind.StatementPdf}>Statement PDF</option>
            <option value={DocumentKind.Spreadsheet}>Spreadsheet</option>
          </Select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-sand-100/80">Parser key</span>
          <Input value={parserKey} onChange={(event) => setParserKey(event.target.value)} placeholder="template" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-sand-100/80">Skip rows</span>
          <Input
            type="number"
            min={0}
            value={String(skipRows)}
            onChange={(event) => setSkipRows(Math.max(0, Number(event.target.value || 0)))}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-sand-100/80">Date patterns (comma-separated)</span>
          <Input value={datePatterns} onChange={(event) => setDatePatterns(event.target.value)} placeholder="dd/MM/yyyy,yyyy-MM-dd" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-sand-100/80">Description column hints</span>
          <Input value={descriptionHints} onChange={(event) => setDescriptionHints(event.target.value)} placeholder="description,narration,remark" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-sand-100/80">Amount column hints</span>
          <Input value={amountHints} onChange={(event) => setAmountHints(event.target.value)} placeholder="amount,debit,credit" />
        </label>
        <label className="flex items-center gap-3 text-sm text-sand-100/80">
          <input type="checkbox" checked={showAdvanced} onChange={(event) => setShowAdvanced(event.target.checked)} />
          Advanced JSON mode
        </label>
        {showAdvanced ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-sand-100/80">Configuration JSON</span>
            <textarea
              value={advancedJson}
              onChange={(event) => setAdvancedJson(event.target.value)}
              className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-sand-100 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/30"
            />
          </label>
        ) : (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-sand-100/80">Generated configuration preview</span>
            <textarea
              value={configurationJson}
              readOnly
              className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-sand-100/80 outline-none"
            />
          </label>
        )}
        <p className="text-xs text-sand-100/60">Tip: choose a sample uploaded PDF/spreadsheet to prefill fields using backend suggestions.</p>
        {isSuggesting ? <p className="text-xs text-cyan-300">Analyzing sample file...</p> : null}
        <label className="flex items-center gap-3 text-sm text-sand-100/80">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          Active
        </label>
        <Button type="button" onClick={handleCreate} disabled={busy || isSuggesting}>
          Create template
        </Button>
        {message ? <p className="text-sm text-cyan-300">{message}</p> : null}
      </CardBody>
    </Card>
  );
}