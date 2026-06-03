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
  isUsedInReconcile: boolean;
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

export interface BulkUploadFileInfo {
  fileName: string;
  fileHash: string;
  isDuplicate: boolean;
  duplicateOf: string | null;
  detectedPeriod: string | null;
  documentUploadId: string;
}

export interface BulkUploadStatementsResult {
  uploadedFiles: BulkUploadFileInfo[];
  duplicateHashes: string[];
  groupsByPeriod: Record<string, BulkUploadFileInfo[]>;
}

export interface BulkReconcileResult {
  enqueuedRunIds: string[];
  totalEnqueued: number;
}

export interface LoginResult {
  userId: string;
  username: string;
  role: string;
  accessToken: string;
  expiresAtUtc: string;
}

export interface CreateUserResult {
  id: string;
  username: string;
  role: string;
  createdAtUtc: string;
}

export interface ReconcileMatchDto {
  id: string;
  spreadsheetRowNumber: number;
  statementRowNumber: number;
  description: string;
  amount: number;
  isMatched: boolean;
  spreadsheetDescription: string | null;
  spreadsheetAmount: number | null;
  spreadsheetTransactionDate: string | null;
  statementDescription: string | null;
  statementAmount: number;
  statementTransactionDate: string | null;
}

export interface GetReconcileMatchesResult {
  matches: ReconcileMatchDto[];
  total: number;
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