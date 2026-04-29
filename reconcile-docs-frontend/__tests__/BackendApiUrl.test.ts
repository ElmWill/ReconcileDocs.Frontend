import { describe, expect, it } from "vitest";
import { BackendApiUrl } from "@/functions/BackendApiUrl";

describe("BackendApiUrl", () => {
  it("builds the dashboard summary url", () => {
    expect(BackendApiUrl.dashboardSummary).toBe("/api/gateway/api/dashboard/summary");
  });

  it("builds a paged uploads url", () => {
    expect(BackendApiUrl.dashboardUploads(15)).toBe("/api/gateway/api/dashboard/uploads?take=15");
  });
});