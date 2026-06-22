const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

type RequestOptions = {
  signal?: AbortSignal;
  headers?: HeadersInit;
};

type JsonRequestOptions = RequestOptions & {
  body?: unknown;
};

export async function apiGet<TResponse>(
  path: string,
  options: RequestOptions = {}
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...options.headers
    },
    signal: options.signal
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status} consultando ${path}`);
  }

  return response.json() as Promise<TResponse>;
}

async function apiJson<TResponse>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  options: JsonRequestOptions = {}
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status} consultando ${path}`);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

export function apiPost<TResponse>(
  path: string,
  body: unknown,
  options: RequestOptions = {}
): Promise<TResponse> {
  return apiJson<TResponse>(path, "POST", { ...options, body });
}

export function apiPut<TResponse>(
  path: string,
  body: unknown,
  options: RequestOptions = {}
): Promise<TResponse> {
  return apiJson<TResponse>(path, "PUT", { ...options, body });
}

export function apiDelete(path: string, options: RequestOptions = {}): Promise<void> {
  return apiJson<void>(path, "DELETE", options);
}
