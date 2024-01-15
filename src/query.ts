import {
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  type QueryClient,
  UndefinedInitialDataOptions,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import type { FetchError } from "ofetch";
import { useMemo } from "react";
import { useFetchQueryDefaults } from "./context";
import { FetchQueryKey } from "./utils";

export type UseFetchQueryOptions<
  TQueryFnData = unknown,
  TData = TQueryFnData,
  TError = FetchError<TQueryFnData>,
  TQueryKey extends FetchQueryKey = FetchQueryKey,
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>;

/** Same as `UseFetchQueryOptions` but without a required `queryKey` */
export type FetchQueryOptions<
  TQueryFnData = unknown,
  TData = TQueryFnData,
  TError = FetchError<TQueryFnData>,
  TQueryKey extends FetchQueryKey = FetchQueryKey,
> = Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, "queryKey">;

export function useFetchQuery<
  TQueryFnData = unknown,
  TError = FetchError<TQueryFnData>,
  TData = TQueryFnData,
  TQueryKey extends FetchQueryKey = FetchQueryKey,
>(
  options: UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
): UseQueryResult<TData, TError>;

export function useFetchQuery<
  TQueryFnData = unknown,
  TError = FetchError<TQueryFnData>,
  TData = TQueryFnData,
  TQueryKey extends FetchQueryKey = FetchQueryKey,
>(
  options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError>;

export function useFetchQuery<
  TQueryFnData = unknown,
  TError = FetchError<TQueryFnData>,
  TData = TQueryFnData,
  TQueryKey extends FetchQueryKey = FetchQueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
): UseQueryResult<TData, TError>;

export function useFetchQuery<
  TQueryFnData = unknown,
  TError = FetchError<TQueryFnData>,
  TData = TQueryFnData,
  TQueryKey extends FetchQueryKey = FetchQueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
) {
  const { queryFn } = useFetchQueryDefaults(queryClient);
  const fullOptions = useMemo(
    () => ({ queryFn, ...options }),
    [options, queryFn],
  );
  return useQuery(fullOptions, queryClient);
}
