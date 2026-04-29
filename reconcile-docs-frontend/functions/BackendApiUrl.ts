import { AppSettings } from "@/functions/AppSettings";

const baseUrl = AppSettings.backendProxyBase;

export const BackendApiUrl = {
  dashboardSummary: `${baseUrl}/api/dashboard/summary`,
  dashboardUploads: (take = 20) => `${baseUrl}/api/dashboard/uploads?take=${take}`,
  dashboardRuns: (take = 20) => `${baseUrl}/api/dashboard/runs?take=${take}`,
  uploadSpreadsheet: `${baseUrl}/api/documents/spreadsheet`,
  uploadStatement: `${baseUrl}/api/documents/statement`,
  startReconcile: `${baseUrl}/api/documents/reconcile`,
  createTemplate: `${baseUrl}/api/templates`,
  suggestTemplate: `${baseUrl}/api/templates/suggest`
};