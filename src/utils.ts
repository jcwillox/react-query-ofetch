import { DataTag, QueryFunctionContext } from "@tanstack/react-query";
import deepmerge from "deepmerge";
import isPlainObject from "is-plain-obj";
import { $Fetch, FetchError, FetchOptions, ofetch } from "ofetch";
import type { $URL } from "ufo";
import { FetchMutationFunction, FetchMutationHelpers } from "@/mutation.ts";

interface ResponseMap {
  blob: Blob;
  text: string;
  arrayBuffer: ArrayBuffer;
  stream: ReadableStream<Uint8Array>;
}

type ResponseType = keyof ResponseMap | "json";

export type FetchQueryFetchOptions<R extends ResponseType = "json"> =
  FetchOptions<R> & { path?: Record<string, unknown> };

export type FetchQueryKey<R extends ResponseType = "json"> =
  | readonly [string | URL | $URL]
  | readonly [string | URL | $URL, FetchQueryFetchOptions<R>];

export type FetchQueryFunctionContext<
  TQueryKey extends FetchQueryKey = FetchQueryKey,
  TPageParam = unknown,
> = Partial<Omit<QueryFunctionContext<TQueryKey, TPageParam>, "queryKey">> &
  Pick<QueryFunctionContext<TQueryKey, TPageParam>, "queryKey">;

const retryStatusCodes = new Set([
  408, // Request Timeout
  409, // Conflict
  425, // Too Early
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
]);

function replacePathParams(
  url: string | URL | $URL,
  path?: Record<string, unknown>,
): string {
  url = url.toString();
  if (!path) return url;
  for (const [key, value] of Object.entries(path)) {
    url = url.replaceAll(`{${key}}`, String(value));
  }
  return url;
}

/** Slice a query key array while preserving the data tag information */
export function sliceKey<T = unknown, TData = unknown>(
  queryKey: DataTag<ReadonlyArray<T>, TData>,
  start?: number,
  end?: number,
) {
  return queryKey.slice(start, end) as DataTag<T[], TData>;
}

/**
 * A function that returns true if a fetch error should be retried.
 *
 * @returns undefined if the error is not a fetch error otherwise a boolean
 */
export function shouldRetryFetch(error: Error): boolean | undefined {
  if (error instanceof FetchError) {
    return !!(error.status && retryStatusCodes.has(error.status));
  }
}

/** A custom retry function for react query to intelligently handle fetch errors */
export function fetchRetryFn(failureCount: number, error: Error): boolean {
  if (shouldRetryFetch(error) === false) return false;
  return failureCount < 3;
}

/** Adapter between the react-query fn and ofetch */
export function fetchQueryFn<T = any>(
  {
    queryKey: [url, options = {}],
    signal,
    pageParam,
    meta,
  }: FetchQueryFunctionContext,
  ofetch_: $Fetch = ofetch,
) {
  // runtime validation as we cant ensure it will be called with the right types
  if (!url) throw new Error(`Query key is missing url: "${url}, ${options}"`);
  if (options && typeof options !== "object")
    throw new Error(`Query options is not an object: "${url}, ${options}"`);
  url = replacePathParams(url, options.path);
  if (typeof pageParam === "number")
    options = { ...options, query: { ...options.query, page: pageParam } };
  return ofetch_<T>(url, {
    signal,
    // let react query handle refetching
    retry: false,
    ...options,
    // forcefully merge in queryMeta to options
    ...({ queryMeta: meta } as any),
  });
}

/** Returns a `mutationFn` with variables bound to the request body, this the default behaviour. */
export function fetchMutateFn<T = any>(
  mutationKey: FetchQueryKey,
  fetchQueryFn_ = fetchQueryFn,
) {
  return async <TVariables = FetchQueryFetchOptions>(variables: TVariables) => {
    return await fetchQueryFn_<T>({
      // merge in variables with default options
      queryKey: [
        mutationKey[0],
        deepmerge(mutationKey[1] ?? {}, variables ?? {}, {
          arrayMerge: (_, b) => b,
          isMergeableObject: isPlainObject,
        }),
      ] as const,
    });
  };
}

/** Returns a `mutationFn` with variables bound to a given path param */
export function fetchMutatePathFn<
  TData = unknown,
  TVariables extends string = string,
>(param: string): FetchMutationFunction<TData, TVariables> {
  return (variables, { mutationFn }) =>
    mutationFn({ path: { [param]: variables } });
}

/** Returns a `mutationFn` with variables bound to the fetch options */
export function fetchMutateOptionsFn<
  TData = unknown,
  TVariables extends FetchQueryFetchOptions = FetchQueryFetchOptions,
>(variables: TVariables, { mutationFn }: FetchMutationHelpers<TData>) {
  return mutationFn(variables);
}

/** Returns a `mutationFn` with files as variables converted to form data and bound to the request body */
export function fetchMutateFilesFn<
  TData = unknown,
  TVariables extends File | File[] = File | File[],
>(variables: TVariables, { mutationFn }: FetchMutationHelpers<TData>) {
  const formData = new FormData();
  for (const file of Array.isArray(variables) ? variables : [variables]) {
    formData.append(file.name, file);
  }
  return mutationFn({ body: formData });
}
