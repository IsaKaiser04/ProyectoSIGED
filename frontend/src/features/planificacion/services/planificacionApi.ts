import { apiGet, apiPost, apiPatch } from "../../../services/apiClient";

export async function obtenerAniosLectivos() {
  return apiGet<any[]>("/planificacion/anios-lectivos/");
}

export async function crearAnioLectivo(data: any) {
  return apiPost("/planificacion/anios-lectivos/", data);
}

export async function obtenerParalelos() {
  return apiGet<any[]>("/planificacion/paralelos/");
}

export async function crearParalelo(data: any) {
  return apiPost("/planificacion/paralelos/", data);
}

export async function actualizarParalelo(id: number, data: any) {
  return apiPatch(`/planificacion/paralelos/${id}/`, data);
}
