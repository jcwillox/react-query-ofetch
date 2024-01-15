import { DataTag, QueryFunctionContext } from "@tanstack/react-query";
import { $Fetch, FetchOptions, ofetch } from "ofetch";
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

/** Adapter between the react-query fn and ofetch */
export function fetchQueryFn<T = any>(
  {
    queryKey: [url, options = {}],
    signal,
    pageParam,
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
  return ofetch_<T>(url, { signal, retry: false, ...options });
}

/** Returns a `mutationFn` with variables bound to the request body, this the default behaviour. */
export function fetchMutateFn<T = any>(
  mutationKey: FetchQueryKey,
  fetchQueryFn_ = fetchQueryFn,
) {
  return async <TVariables = FetchQueryFetchOptions>(variables: TVariables) => {
    return await fetchQueryFn_<T>({
      // merge in variables with default options
      queryKey: [mutationKey[0], { ...mutationKey[1], ...variables }] as const,
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
