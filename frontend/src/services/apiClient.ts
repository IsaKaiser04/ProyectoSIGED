// Este código define un cliente API genérico para interactuar con un backend RESTful en una aplicación frontend.
// Proporciona funciones para realizar solicitudes GET, POST, PUT, PATCH y DELETE, y maneja la construcción de rutas y el manejo de errores.
import { BackendModule } from "../types/module";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

type RequestOptions = {
  signal?: AbortSignal;
  headers?: HeadersInit;
};

/**
 * Utilidad para construir la ruta base de un módulo con su barra inclinada correspondiente.
 * Ej: buildModulePath("ubicacion", "paises") -> "/ubicacion/paises/"
 */
export const buildModulePath = (module: BackendModule, endpoint: string): string => {
  return `/${module}/${endpoint}/`;
};

// --- FUNCIÓN GET ---
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

// --- FUNCIÓN POST ---
export async function apiPost<TBody, TResponse>(
  path: string,
  body: TBody,
  options: RequestOptions = {}
): Promise<TResponse> {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Accept: "application/json",
      ...options.headers
    },
    body: isFormData ? body : JSON.stringify(body),
    signal: options.signal
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(`Error ${response.status} registrando en ${path}`) as any;
    error.data = errorData;
    throw error;
  }

  return response.json() as Promise<TResponse>;
}

// --- NUEVA FUNCIÓN PUT (Actualización Completa) ---
export async function apiPut<TBody, TResponse>(
  path: string,
  body: TBody,
  options: RequestOptions = {}
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers
    },
    body: JSON.stringify(body),
    signal: options.signal
  });

  if (!response.ok) {
    // Capturamos errores de validación (ej. Django REST Framework 400 Bad Request)
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(`Error ${response.status} reemplazando en ${path}`) as any;
    error.data = errorData;
    throw error;
  }

  return response.json() as Promise<TResponse>;
}

// --- NUEVA FUNCIÓN PATCH (Actualización Parcial) ---
export async function apiPatch<TBody, TResponse>(
  path: string,
  body: Partial<TBody> | FormData,
  options: RequestOptions = {}
): Promise<TResponse> {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Accept: "application/json",
      ...options.headers
    },
    body: isFormData ? body : JSON.stringify(body),
    signal: options.signal
  });

  if (!response.ok) {
    // Capturamos errores de validación
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(`Error ${response.status} modificando en ${path}`) as any;
    error.data = errorData;
    throw error;
  }

  return response.json() as Promise<TResponse>;
}

// --- FUNCIÓN DELETE ---
export async function apiDelete<TResponse = void>(
  path: string,
  options: RequestOptions = {}
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: {
      ...options.headers
    },
    signal: options.signal
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status} eliminando en ${path}`);
  }

  if (response.status === 204) {
    return {} as TResponse;
  }

  return response.json() as Promise<TResponse>;
}