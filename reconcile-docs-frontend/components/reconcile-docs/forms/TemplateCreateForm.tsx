import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { reconcileDocsApi } from "@/functions/api/reconcileDocsApi";
import { DocumentKind } from "@/types/api";

interface Props {
  onCreated: () => Promise<void>;
}

export function TemplateCreateForm({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [parserKey, setParserKey] = useState("template");
  const [configurationJson, setConfigurationJson] = useState("{}");
  const [documentKind, setDocumentKind] = useState<DocumentKind>(DocumentKind.StatementPdf);
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      setMessage("Template name is required.");
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
    setConfigurationJson("{}");
    await onCreated();
  }

  return (
    <Card>
      <CardTitle>Create template</CardTitle>
      <CardBody>
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
          <span className="text-sm font-medium text-sand-100/80">Configuration JSON</span>
          <textarea
            value={configurationJson}
            onChange={(event) => setConfigurationJson(event.target.value)}
            className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-sand-100 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/30"
          />
        </label>
        <label className="flex items-center gap-3 text-sm text-sand-100/80">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          Active
        </label>
        <Button type="button" onClick={handleCreate} disabled={busy}>
          Create template
        </Button>
        {message ? <p className="text-sm text-cyan-300">{message}</p> : null}
      </CardBody>
    </Card>
  );
}