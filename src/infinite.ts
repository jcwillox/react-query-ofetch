import {
  DefinedInitialDataInfiniteOptions,
  DefinedUseInfiniteQueryResult,
  InfiniteData,
  QueryClient,
  UndefinedInitialDataInfiniteOptions,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useInfiniteQuery,
} from "@tanstack/react-query";
import type { FetchError } from "ofetch";
import { useMemo } from "react";
import { useFetchQueryDefaults } from "./context";
import { FetchQueryKey } from "./utils";

export type UseFetchInfiniteQueryOptions<
  TQueryFnData = unknown,
  TData = InfiniteData<TQueryFnData>,
  TError = FetchError<TQueryFnData>,
  TQueryData = TQueryFnData,
  TQueryKey extends FetchQueryKey = FetchQueryKey,
  TPageParam = unknown,
> = UseInfiniteQueryOptions<
  TQueryFnData,
  TError,
  TData,
  TQueryData,
  TQueryKey,
  TPageParam
>;

export type FetchInfiniteQueryOptions<
  TQueryFnData = unknown,
  TData = InfiniteData<TQueryFnData>,
  TError = FetchError<TQueryFnData>,
  TQueryData = TQueryFnData,
  TQueryKey extends FetchQueryKey = FetchQueryKey,
  TPageParam = unknown,
> = Omit<
  UseInfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey,
    TPageParam
  >,
  "queryKey"
>;

export function useFetchInfiniteQuery<
  TQueryFnData,
  TData = InfiniteData<TQueryFnData>,
  TError = FetchError<TQueryFnData>,
  TQueryKey extends FetchQueryKey = FetchQueryKey,
  TPageParam = unknown,
>(
  options: UndefinedInitialDataInfiniteOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey,
    TPageParam
  >,
  queryClient?: QueryClient,
): UseInfiniteQueryResult<TData, TError>;

export function useFetchInfiniteQuery<
  TQueryFnData,
  TData = InfiniteData<TQueryFnData>,
  TError = FetchError<TQueryFnData>,
  TQueryKey extends FetchQueryKey = FetchQueryKey,
  TPageParam = unknown,
>(
  options: DefinedInitialDataInfiniteOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey,
    TPageParam
  >,
  queryClient?: QueryClient,
): DefinedUseInfiniteQueryResult<TData, TError>;

export function useFetchInfiniteQuery<
  TQueryFnData,
  TData = InfiniteData<TQueryFnData>,
  TError = FetchError<TQueryFnData>,
  TQueryKey extends FetchQueryKey = FetchQueryKey,
  TPageParam = unknown,
>(
  options: UseInfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryFnData,
    TQueryKey,
    TPageParam
  >,
  queryClient?: QueryClient,
): UseInfiniteQueryResult<TData, TError>;

export function useFetchInfiniteQuery<
  TQueryFnData,
  TData = InfiniteData<TQueryFnData>,
  TError = FetchError<TQueryFnData>,
  TQueryKey extends FetchQueryKey = FetchQueryKey,
  TPageParam = unknown,
>(
  options: UseInfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryFnData,
    TQueryKey,
    TPageParam
  >,
  queryClient?: QueryClient,
) {
  const { queryFn } = useFetchQueryDefaults(queryClient);
  const fullOptions = useMemo(
    () => ({ queryFn, ...options }),
    [options, queryFn],
  );
  return useInfiniteQuery(fullOptions, queryClient);
}
