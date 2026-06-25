import { apiGet, apiPost, apiPatch, apiDelete } from "../../../services/apiClient";

export async function obtenerJornadas() {
  return apiGet<any[]>("/distributivos/jornadas/");
}

export async function obtenerJornada(id: number) {
  return apiGet<any>(`/distributivos/jornadas/${id}/`);
}

export async function crearJornada(data: any) {
  return apiPost("/distributivos/jornadas/", data);
}

export async function actualizarJornada(id: number, data: any) {
  return apiPatch(`/distributivos/jornadas/${id}/`, data);
}

export async function eliminarJornada(id: number) {
  return apiDelete(`/distributivos/jornadas/${id}/`);
}

export async function jornadasPorInstitucion(institucionId: number) {
  return apiGet<any[]>(`/distributivos/jornadas/por_institucion/?institucion_id=${institucionId}`);
}
