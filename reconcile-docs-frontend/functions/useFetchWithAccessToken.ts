import { useCallback } from "react";
import { tryFetchJson, buildJsonRequestInit } from "@/functions/tryFetchJson";
import type { FetchOutcome } from "@/types/api";

export function useFetchWithAccessToken() {
  const fetchJson = useCallback(async <T,>(method: string, url: string, body?: unknown): Promise<FetchOutcome<T>> => {
    return tryFetchJson<T>(url, buildJsonRequestInit(method, body));
  }, []);

  return {
    fetchGET: <T,>(url: string) => fetchJson<T>("GET", url),
    fetchPOST: <T,>(url: string, body?: unknown) => fetchJson<T>("POST", url, body),
    fetchPUT: <T,>(url: string, body?: unknown) => fetchJson<T>("PUT", url, body),
    fetchDELETE: <T,>(url: string, body?: unknown) => fetchJson<T>("DELETE", url, body)
  };
}