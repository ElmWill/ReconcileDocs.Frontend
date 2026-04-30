export enum DocumentKind {
  Spreadsheet = 1,
  StatementPdf = 2
}

export interface DashboardSummary {
  uploadedDocuments: number;
  reconcileRuns: number;
  activeTemplates: number;
  successfulRuns: number;
  failedRuns: number;
}

export interface DocumentUploadSummary {
  id: string;
  documentKind: number;
  originalFileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAtUtc: string;
  reconcileStatus: number;
}

export interface ReconcileRunSummary {
  id: string;
  spreadsheetUploadId: string;
  statementUploadId: string;
  parserName: string;
  matchedCount: number;
  unmatchedCount: number;
  errorCount: number;
  status: number;
  startedAtUtc: string;
  completedAtUtc: string | null;
}

export interface UploadDocumentResult {
  documentUploadId: string;
  storedFileName: string;
  storagePath: string;
}

export interface StartReconcileResult {
  reconcileRunId: string;
  parserName: string;
  matchedCount: number;
  unmatchedCount: number;
  errorCount: number;
}

export interface ReconcileProgressResult {
  runId: string;
  status: number;
  matchedCount: number;
  unmatchedCount: number;
  errorCount: number;
  startedAtUtc: string;
  completedAtUtc: string | null;
  errorMessage: string | null;
}

export interface CreateTemplatePayload {
  name: string;
  documentKind: DocumentKind;
  parserKey: string;
  configurationJson: string;
  isActive: boolean;
}

export interface SuggestTemplatePayload {
  uploadId: string;
}

export interface SuggestTemplateResult {
  nameSuggestion: string;
  documentKind: DocumentKind;
  parserKey: string;
  skipRows: number;
  datePatterns: string[];
  descriptionColumnHints: string[];
  amountColumnHints: string[];
  suggestedConfigurationJson: string;
}

export interface ApiProblem {
  status: number;
  title: string;
  detail?: string;
}

export interface FetchOutcome<T> {
  data: T | null;
  error: Error | null;
  problem: ApiProblem | null;
}