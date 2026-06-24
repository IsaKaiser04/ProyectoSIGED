import { apiGet, apiPost, apiPatch, apiDelete } from "../../../services/apiClient";
import type { MatriculaPeriodo } from "../../../types/entities/matricula";

const BASE = "/matricula/periodos";

export async function obtenerPeriodos(): Promise<MatriculaPeriodo[]> {
  return apiGet<MatriculaPeriodo[]>(`${BASE}/`);
}

export async function obtenerPeriodo(id: number): Promise<MatriculaPeriodo> {
  return apiGet<MatriculaPeriodo>(`${BASE}/${id}/`);
}

export async function crearPeriodo(data: Partial<MatriculaPeriodo>): Promise<MatriculaPeriodo> {
  return apiPost<Partial<MatriculaPeriodo>, MatriculaPeriodo>(`${BASE}/`, data);
}

export async function actualizarPeriodo(id: number, data: Partial<MatriculaPeriodo>): Promise<MatriculaPeriodo> {
  return apiPatch<Partial<MatriculaPeriodo>, MatriculaPeriodo>(`${BASE}/${id}/`, data);
}

export async function eliminarPeriodo(id: number): Promise<void> {
  return apiDelete<void>(`${BASE}/${id}/`);
}
