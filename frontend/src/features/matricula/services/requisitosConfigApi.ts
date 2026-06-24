import { apiGet, apiPost, apiPatch, apiDelete } from "../../../services/apiClient";
import type { MatriculaRequisito } from "../../../types/entities/matricula";

const BASE = "/matricula/requisitos-config";

export async function obtenerRequisitosConfig(): Promise<MatriculaRequisito[]> {
  return apiGet<MatriculaRequisito[]>(`${BASE}/`);
}

export async function obtenerRequisitoConfig(id: number): Promise<MatriculaRequisito> {
  return apiGet<MatriculaRequisito>(`${BASE}/${id}/`);
}

export async function crearRequisitoConfig(data: Partial<MatriculaRequisito>): Promise<MatriculaRequisito> {
  return apiPost<Partial<MatriculaRequisito>, MatriculaRequisito>(`${BASE}/`, data);
}

export async function actualizarRequisitoConfig(id: number, data: Partial<MatriculaRequisito>): Promise<MatriculaRequisito> {
  return apiPatch<Partial<MatriculaRequisito>, MatriculaRequisito>(`${BASE}/${id}/`, data);
}

export async function eliminarRequisitoConfig(id: number): Promise<void> {
  return apiDelete<void>(`${BASE}/${id}/`);
}
