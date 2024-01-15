import {
  DataTag,
  DefinedInitialDataOptions,
  UndefinedInitialDataOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { FetchError } from "ofetch";
import { FetchQueryKey } from "./utils";

export function fetchQueryOptions<
  TQueryFnData = unknown,
  TError = FetchError<TQueryFnData>,
  TData = TQueryFnData,
  TQueryKey extends FetchQueryKey = FetchQueryKey,
>(
  options: UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
): UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey> & {
  queryKey: DataTag<TQueryKey, TData>;
};

export function fetchQueryOptions<
  TQueryFnData = unknown,
  TError = FetchError<TQueryFnData>,
  TData = TQueryFnData,
  TQueryKey extends FetchQueryKey = FetchQueryKey,
>(
  options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
): DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey> & {
  queryKey: DataTag<TQueryKey, TData>;
};

export function fetchQueryOptions<
  TQueryFnData = unknown,
  TError = FetchError<TQueryFnData>,
  TData = TQueryFnData,
  TQueryKey extends FetchQueryKey = FetchQueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
  queryKey: DataTag<TQueryKey, TData>;
};

export function fetchQueryOptions(options: unknown) {
  return options;
}
