import { AppSettings } from "@/functions/AppSettings";

const baseUrl = AppSettings.backendProxyBase;

export const BackendApiUrl = {
  dashboardSummary: `${baseUrl}/api/dashboard/summary`,
  dashboardUploads: (take = 20) => `${baseUrl}/api/dashboard/uploads?take=${take}`,
  dashboardRuns: (take = 20) => `${baseUrl}/api/dashboard/runs?take=${take}`,
  uploadSpreadsheet: `${baseUrl}/api/documents/spreadsheet`,
  uploadStatement: `${baseUrl}/api/documents/statement`,
  bulkUploadStatements: `${baseUrl}/api/documents/bulk-statements`,
  startReconcile: `${baseUrl}/api/documents/reconcile`,
  startReconcileAsync: `${baseUrl}/api/documents/reconcile-async`,
  getReconcileProgress: (runId: string) => `${baseUrl}/api/documents/reconcile/${runId}/progress`,
  bulkReconcile: `${baseUrl}/api/documents/reconcile/bulk`,
  createTemplate: `${baseUrl}/api/templates`,
  suggestTemplate: `${baseUrl}/api/templates/suggest`
};