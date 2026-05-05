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
  getMatchedData: (runId: string, pageNumber?: number, pageSize?: number) => {
    const params = new URLSearchParams();
    if (pageNumber) params.append('pageNumber', pageNumber.toString());
    if (pageSize) params.append('pageSize', pageSize.toString());
    return `${baseUrl}/api/documents/reconcile/${runId}/matched-data${params.toString() ? '?' + params.toString() : ''}`;
  },
  getReconcileMatches: (runId: string, pageNumber?: number, pageSize?: number, matchedOnly?: boolean) => {
    const params = new URLSearchParams();
    if (pageNumber) params.append('pageNumber', pageNumber.toString());
    if (pageSize) params.append('pageSize', pageSize.toString());
    if (matchedOnly !== undefined) params.append('matchedOnly', matchedOnly.toString());
    return `${baseUrl}/api/documents/reconcile/${runId}/matches${params.toString() ? '?' + params.toString() : ''}`;
  },
  bulkReconcile: `${baseUrl}/api/documents/reconcile/bulk`,
  createTemplate: `${baseUrl}/api/templates`,
  suggestTemplate: `${baseUrl}/api/templates/suggest`
};