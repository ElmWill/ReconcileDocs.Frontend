import { useMemo } from "react";
import { useFetchWithAccessToken } from "@/functions/useFetchWithAccessToken";

export function useSwrFetcherWithAccessToken() {
  const { fetchGET } = useFetchWithAccessToken();

  return useMemo(() => {
    return async <T,>(url: string) => {
      const response = await fetchGET<T>(url);
      if (response.error) {
        throw response.error;
      }

      return response.data as T;
    };
  }, [fetchGET]);
}