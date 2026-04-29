import { render, screen } from "@testing-library/react";
import { DashboardView } from "@/components/reconcile-docs/dashboard";

describe("DashboardView", () => {
  it("renders the provided dashboard data", () => {
    render(
      <DashboardView
        summary={{ uploadedDocuments: 4, reconcileRuns: 2, activeTemplates: 1, successfulRuns: 1, failedRuns: 1 }}
        uploads={[
          {
            id: "upload-1",
            documentKind: 1,
            originalFileName: "statement.xlsx",
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            sizeBytes: 1024,
            uploadedAtUtc: "2026-04-29T12:00:00Z",
            reconcileStatus: 0
          }
        ]}
        runs={[
          {
            id: "run-1",
            spreadsheetUploadId: "upload-1",
            statementUploadId: "upload-2",
            parserName: "template",
            matchedCount: 8,
            unmatchedCount: 1,
            errorCount: 0,
            status: 1,
            startedAtUtc: "2026-04-29T12:15:00Z",
            completedAtUtc: null
          }
        ]}
      />
    );

    expect(screen.getByText("Uploaded files")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("statement.xlsx")).toBeInTheDocument();
    expect(screen.getByText("template")).toBeInTheDocument();
  });
});