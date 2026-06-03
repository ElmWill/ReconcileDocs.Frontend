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
  UploadDocumentResult,
  ReconcileProgressResult,
  BulkUploadStatementsResult,
  BulkReconcileResult,
  GetReconcileMatchesResult,
  LoginResult,
  CreateUserResult
} from "@/types/api";

async function sendRequest<T>(url: string, method: string, body?: unknown) {
  return tryFetchJson<T>(url, buildJsonRequestInit(method, body));
}

export const reconcileDocsApi = {
  async login(payload: { username: string; password: string }) {
    return sendRequest<LoginResult>(`${BackendApiUrl.authLogin}`, "POST", payload);
  },
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
  async uploadStatement(file: File, password?: string) {
    const formData = new FormData();
    formData.append("file", file);
    if (password) {
      formData.append("password", password);
    }
    return sendRequest<UploadDocumentResult>(BackendApiUrl.uploadStatement, "POST", formData);
  },
  async startReconcile(payload: { spreadsheetUploadId: string; statementUploadId: string; password?: string }) {
    return sendRequest<StartReconcileResult>(BackendApiUrl.startReconcile, "POST", payload);
  },
  async startReconcileAsync(payload: { spreadsheetUploadId: string; statementUploadId: string; password?: string }) {
    return sendRequest<StartReconcileResult>(BackendApiUrl.startReconcileAsync, "POST", payload);
  },
  async getReconcileProgress(runId: string) {
    return sendRequest<ReconcileProgressResult>(BackendApiUrl.getReconcileProgress(runId), "GET");
  },
  async getMatchedData(runId: string, pageNumber?: number, pageSize?: number) {
    return sendRequest<GetReconcileMatchesResult>(BackendApiUrl.getMatchedData(runId, pageNumber, pageSize), "GET");
  },
  async getReconcileMatches(runId: string, pageNumber?: number, pageSize?: number, matchedOnly?: boolean) {
    return sendRequest<GetReconcileMatchesResult>(BackendApiUrl.getReconcileMatches(runId, pageNumber, pageSize, matchedOnly), "GET");
  },
  async bulkUploadStatements(files: File[], spreadsheetUploadId: string, password?: string) {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    formData.append("spreadsheetUploadId", spreadsheetUploadId);
    if (password) {
      formData.append("password", password);
    }
    return sendRequest<BulkUploadStatementsResult>(BackendApiUrl.bulkUploadStatements, "POST", formData);
  },
  async bulkReconcile(payload: { spreadsheetUploadId: string; statementUploadIds: string[]; password?: string }) {
    return sendRequest<BulkReconcileResult>(BackendApiUrl.bulkReconcile, "POST", payload);
  },
  async createTemplate(payload: CreateTemplatePayload) {
    return sendRequest<{ templateDefinitionId: string }>(BackendApiUrl.createTemplate, "POST", payload);
  },
  async suggestTemplate(payload: SuggestTemplatePayload) {
    return sendRequest<SuggestTemplateResult>(BackendApiUrl.suggestTemplate, "POST", payload);
  },
  async createUser(payload: { username: string; password: string; role: string }) {
    return sendRequest<CreateUserResult>(BackendApiUrl.createUser, "POST", payload);
  }
};

export type ReconcileDocsApiProblem = ApiProblem;