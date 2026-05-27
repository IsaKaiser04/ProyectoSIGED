const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

type RequestOptions = {
  signal?: AbortSignal;
  headers?: HeadersInit;
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
