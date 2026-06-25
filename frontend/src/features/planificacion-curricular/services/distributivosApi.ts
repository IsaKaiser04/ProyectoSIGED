import { apiGet, apiPost, apiPatch, apiDelete } from "../../../services/apiClient";

export async function obtenerDistributivos() {
  return apiGet<any[]>("/distributivos/distributivos/");
}

export async function obtenerDistributivo(id: number) {
  return apiGet<any>(`/distributivos/distributivos/${id}/`);
}

export async function crearDistributivo(data: any) {
  return apiPost("/distributivos/distributivos/", data);
}

export async function actualizarDistributivo(id: number, data: any) {
  return apiPatch(`/distributivos/distributivos/${id}/`, data);
}

export async function eliminarDistributivo(id: number) {
  return apiDelete(`/distributivos/distributivos/${id}/`);
}

export async function distributivosPorAnioLectivo(anioLectivoId: number) {
  return apiGet<any[]>(`/distributivos/distributivos/por_anio_lectivo/?anio_lectivo_id=${anioLectivoId}`);
}

export async function distributivosPorDocente(docenteId: number) {
  return apiGet<any[]>(`/distributivos/distributivos/por_docente/?docente_id=${docenteId}`);
}

export async function obtenerAsignaturasDistributivo(distributivoId: number) {
  return apiGet<any[]>(`/distributivos/distributivos-asignaturas/por_distributivo/?distributivo_id=${distributivoId}`);
}

export async function crearAsignaturaDistributivo(data: any) {
  return apiPost("/distributivos/distributivos-asignaturas/", data);
}

export async function eliminarAsignaturaDistributivo(id: number) {
  return apiDelete(`/distributivos/distributivos-asignaturas/${id}/`);
}
