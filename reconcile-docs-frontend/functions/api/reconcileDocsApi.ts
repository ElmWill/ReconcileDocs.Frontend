import { BackendApiUrl } from "@/functions/BackendApiUrl";
import { buildJsonRequestInit, tryFetchJson } from "@/functions/tryFetchJson";
import type {
  ApiProblem,
  CreateTemplatePayload,
  DashboardSummary,
  DocumentUploadSummary,
  ReconcileRunSummary,
  SuggestTemplatePayload,
  SuggestTemplateResult,
  StartReconcileResult,
  UploadDocumentResult
} from "@/types/api";

async function sendRequest<T>(url: string, method: string, body?: unknown) {
  return tryFetchJson<T>(url, buildJsonRequestInit(method, body));
}

export const reconcileDocsApi = {
  async getDashboardSummary() {
    return sendRequest<DashboardSummary>(BackendApiUrl.dashboardSummary, "GET");
  },
  async getRecentUploads(take = 20) {
    return sendRequest<DocumentUploadSummary[]>(BackendApiUrl.dashboardUploads(take), "GET");
  },
  async getRecentRuns(take = 20) {
    return sendRequest<ReconcileRunSummary[]>(BackendApiUrl.dashboardRuns(take), "GET");
  },
  async uploadSpreadsheet(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return sendRequest<UploadDocumentResult>(BackendApiUrl.uploadSpreadsheet, "POST", formData);
  },
  async uploadStatement(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return sendRequest<UploadDocumentResult>(BackendApiUrl.uploadStatement, "POST", formData);
  },
  async startReconcile(payload: { spreadsheetUploadId: string; statementUploadId: string }) {
    return sendRequest<StartReconcileResult>(BackendApiUrl.startReconcile, "POST", payload);
  },
  async createTemplate(payload: CreateTemplatePayload) {
    return sendRequest<{ templateDefinitionId: string }>(BackendApiUrl.createTemplate, "POST", payload);
  },
  async suggestTemplate(payload: SuggestTemplatePayload) {
    return sendRequest<SuggestTemplateResult>(BackendApiUrl.suggestTemplate, "POST", payload);
  }
};

export type ReconcileDocsApiProblem = ApiProblem;