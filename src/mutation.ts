import {
  QueryClient,
  UseMutationOptions,
  UseMutationResult,
  useMutation,
} from "@tanstack/react-query";
import type { FetchError } from "ofetch";
import { useMemo } from "react";
import { useFetchQueryDefaults } from "./context";
import {
  FetchQueryFetchOptions,
  FetchQueryFunctionContext,
  FetchQueryKey,
} from "./utils";

export type FetchMutationHelpers<TData = unknown> = {
  mutationKey: FetchQueryKey;
  mutationFn: (variables: FetchQueryFetchOptions) => Promise<TData>;
  queryFn: (ctx: FetchQueryFunctionContext) => Promise<TData>;
};

export type FetchMutationFunction<TData = unknown, TVariables = unknown> = (
  variables: TVariables,
  helpers: FetchMutationHelpers<TData>,
) => Promise<TData>;

export type UseFetchMutationOptions<
  TData = unknown,
  TVariables = FetchQueryFetchOptions,
  TError = FetchError<TData>,
  TContext = unknown,
> = Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  "mutationKey" | "mutationFn"
> & {
  mutationKey: FetchQueryKey;
  mutationFn?: FetchMutationFunction<TData, TVariables>;
};

export function useFetchMutation<
  TData = unknown,
  TVariables = FetchQueryFetchOptions["body"],
  TError = FetchError<TData>,
  TContext = unknown,
>(
  options: UseFetchMutationOptions<TData, TVariables, TError, TContext>,
  queryClient?: QueryClient,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { mutationFn, queryFn } = useFetchQueryDefaults(queryClient);
  const fullOptions = useMemo(() => {
    // default method to post
    const [url, fetchOptions = {}] = options.mutationKey;
    fetchOptions.method ??= "POST";
    // bind mutation fn to key and inherited query fn
    const boundMutationFn = mutationFn([url, fetchOptions], queryFn);
    return {
      ...options,
      mutationFn: (variables: TVariables) => {
        return options.mutationFn
          ? options.mutationFn(variables, {
              mutationKey: [url, fetchOptions],
              mutationFn: boundMutationFn,
              queryFn,
            })
          : boundMutationFn({ body: variables });
      },
      mutationKey: [url, fetchOptions],
    };
  }, [mutationFn, options, queryFn]);
  return useMutation<TData, TError, TVariables, TContext>(
    fullOptions,
    queryClient,
  );
}
