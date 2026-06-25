import { apiGet, apiPost, apiPatch, apiDelete } from "../../../services/apiClient";

export async function obtenerHorarios() {
  return apiGet<any[]>("/distributivos/horarios/");
}

export async function crearHorario(data: any) {
  return apiPost("/distributivos/horarios/", data);
}

export async function actualizarHorario(id: number, data: any) {
  return apiPatch(`/distributivos/horarios/${id}/`, data);
}

export async function eliminarHorario(id: number) {
  return apiDelete(`/distributivos/horarios/${id}/`);
}

export async function horariosPorDistributivo(distributivoId: number) {
  return apiGet<any[]>(`/distributivos/horarios/por_distributivo/?distributivo_id=${distributivoId}`);
}

export async function horariosPorAsignatura(distributivoAsignaturaId: number) {
  return apiGet<any[]>(`/distributivos/horarios/por_distributivo_asignatura/?distributivo_asignatura_id=${distributivoAsignaturaId}`);
}
