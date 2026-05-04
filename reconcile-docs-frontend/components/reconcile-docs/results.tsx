import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { reconcileDocsApi } from "@/functions/api/reconcileDocsApi";
import { useSwrFetcherWithAccessToken } from "@/functions/useSwrFetcherWithAccessToken";
import type { GetReconcileMatchesResult } from "@/types/api";

interface ReconcileResultsProps {
  runId: string | null;
  matchedCount: number;
  unmatchedCount: number;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium"
  }).format(new Date(value));
}

export function ReconcileResults({ runId, matchedCount, unmatchedCount }: ReconcileResultsProps) {
  const fetcher = useSwrFetcherWithAccessToken();
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const [filter, setFilter] = useState<"all" | "matched" | "unmatched">("all");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    if (!runId || (!matchedCount && !unmatchedCount)) {
      return;
    }

    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [runId, matchedCount, unmatchedCount]);

  const matchedOnly = filter === "matched" ? true : filter === "unmatched" ? false : undefined;
  const { data: results } = useSWR<GetReconcileMatchesResult>(
    runId ? () => reconcileDocsApi.getReconcileMatches(runId, pageNumber, pageSize, matchedOnly) : null,
    fetcher
  );

  if (!runId || (!matchedCount && !unmatchedCount)) {
    return null;
  }

  const displayCount = filter === "matched" ? matchedCount : filter === "unmatched" ? unmatchedCount : matchedCount + unmatchedCount;
  const maxPages = Math.ceil((displayCount || 1) / pageSize);
  const previewMatches = results?.matches?.slice(0, 5) ?? [];

  return (
    <div ref={resultsRef} className="mt-6">
      <Card>
        <CardTitle>Reconciliation Results</CardTitle>
        <CardBody className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {previewMatches.map((match) => (
            <div key={match.id} className={`rounded-lg border p-3 ${match.isMatched ? "border-emerald-200 bg-emerald-50/60" : "border-red-200 bg-red-50/60"}`}>
              <div className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-2">
                Statement row #{match.statementRowNumber} {match.isMatched ? "matches" : "does not match"}
              </div>
              <div className="text-sm font-semibold text-slate-800 truncate">{match.statementDescription || match.description || "—"}</div>
              <div className="mt-2 text-xs text-slate-600 space-y-1">
                <div>Statement amount: {match.statementAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div>Spreadsheet row: {match.isMatched ? `#${match.spreadsheetRowNumber}` : "—"}</div>
                <div>Spreadsheet value: {match.spreadsheetDescription || "Not in spreadsheet"}</div>
                <div>Spreadsheet amount: {match.spreadsheetAmount == null ? "—" : match.spreadsheetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          ))}
        </div>

        {previewMatches.length === 0 && results?.matches ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            No rows to preview on this page yet.
          </div>
        ) : null}

        <div className="flex gap-2">
          <button
            onClick={() => { setFilter("all"); setPageNumber(1); }}
            className={`px-3 py-1 text-sm rounded ${filter === "all" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700"}`}
          >
            All ({matchedCount + unmatchedCount})
          </button>
          <button
            onClick={() => { setFilter("matched"); setPageNumber(1); }}
            className={`px-3 py-1 text-sm rounded ${filter === "matched" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700"}`}
          >
            Matched ({matchedCount})
          </button>
          <button
            onClick={() => { setFilter("unmatched"); setPageNumber(1); }}
            className={`px-3 py-1 text-sm rounded ${filter === "unmatched" ? "bg-red-500 text-white" : "bg-slate-200 text-slate-700"}`}
          >
            Unmatched ({unmatchedCount})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-2 text-left font-medium text-slate-700">Statement</th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">Matched Spreadsheet</th>
                <th className="px-4 py-2 text-center font-medium text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {results?.matches && results.matches.length > 0 ? (
                results.matches.map((match) => (
                  <tr key={match.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700 align-top">
                      <div className="text-xs uppercase tracking-[0.12em] text-slate-400 mb-1">Statement row #{match.statementRowNumber}</div>
                      <div className="font-medium truncate max-w-xs">{match.statementDescription || match.description || "—"}</div>
                      <div className="text-xs text-slate-500">Amount: {match.statementAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <div className="text-xs text-slate-500">Date: {formatDate(match.statementTransactionDate)}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 align-top">
                      <div className="text-xs uppercase tracking-[0.12em] text-slate-400 mb-1">
                        {match.isMatched ? `Spreadsheet row #${match.spreadsheetRowNumber}` : "No spreadsheet row matched"}
                      </div>
                      <div className="font-medium truncate max-w-xs">{match.spreadsheetDescription || "Not in spreadsheet"}</div>
                      <div className="text-xs text-slate-500">Amount: {match.spreadsheetAmount == null ? "—" : match.spreadsheetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <div className="text-xs text-slate-500">Date: {formatDate(match.spreadsheetTransactionDate)}</div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="space-y-2">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${match.isMatched ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                          {match.isMatched ? "✓ Matched" : "✗ Unmatched"}
                        </span>
                        <div className="text-xs text-slate-500 max-w-[180px] mx-auto">
                          {match.isMatched
                            ? `Statement row ${match.statementRowNumber} matches spreadsheet row ${match.spreadsheetRowNumber}`
                            : "Statement row has no spreadsheet match"}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No results to display
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

          {maxPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-slate-600">
                Page {pageNumber} of {maxPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber === 1}
                  className="px-3 py-1 text-sm border border-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPageNumber((p) => Math.min(maxPages, p + 1))}
                  disabled={pageNumber === maxPages}
                  className="px-3 py-1 text-sm border border-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
