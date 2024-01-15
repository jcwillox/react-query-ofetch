import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { ReactNode, createContext, useContext, useMemo } from "react";
import { fetchMutateFn, fetchQueryFn } from "./utils";

type FetchQueryDefaults = {
  queryFn?: typeof fetchQueryFn;
  mutationFn?: typeof fetchMutateFn;
  /** Inherit queryFn and mutationFn from the query client defaults */
  inherit?: boolean;
};

const FetchQueryContext = createContext<FetchQueryDefaults>({});

interface ProviderProps extends FetchQueryDefaults {
  children: ReactNode;
}

export const FetchQueryProvider = ({ children, ...options }: ProviderProps) => (
  <FetchQueryContext.Provider value={options}>
    {children}
  </FetchQueryContext.Provider>
);

export const useFetchQueryDefaults = (queryClient?: QueryClient) => {
  const { queryFn, mutationFn, inherit } = useContext(FetchQueryContext);
  const client = useQueryClient(queryClient);
  return useMemo(() => {
    const opts = client?.getDefaultOptions();
    return {
      queryFn:
        (inherit && (opts?.queries?.queryFn as typeof fetchQueryFn)) ||
        queryFn ||
        fetchQueryFn,
      mutationFn:
        (inherit &&
          (opts?.mutations?.mutationFn as unknown as typeof fetchMutateFn)) ||
        mutationFn ||
        fetchMutateFn,
    };
  }, [inherit, mutationFn, client, queryFn]);
};
