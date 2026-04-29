import type { ApiProblem, FetchOutcome } from "@/types/api";

function buildProblem(status: number, title: string, detail?: string): ApiProblem {
  return { status, title, detail };
}

export async function tryFetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<FetchOutcome<T>> {
  try {
    const response = await fetch(input, init);
    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => "");

    if (!response.ok) {
      const title = typeof payload === "object" && payload && "title" in payload ? String((payload as { title?: string }).title ?? "Request failed") : "Request failed";
      const detail = typeof payload === "object" && payload && "detail" in payload ? String((payload as { detail?: string }).detail ?? "") : undefined;
      return {
        data: null,
        error: new Error(title),
        problem: buildProblem(response.status, title, detail)
      };
    }

    return {
      data: (payload as T) ?? null,
      error: null,
      problem: null
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return {
      data: null,
      error: new Error(message),
      problem: buildProblem(0, message)
    };
  }
}

export function buildJsonRequestInit(method: string, body?: unknown): RequestInit {
  if (body instanceof FormData) {
    return { method, body };
  }

  if (body === undefined) {
    return { method };
  }

  return {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  };
}