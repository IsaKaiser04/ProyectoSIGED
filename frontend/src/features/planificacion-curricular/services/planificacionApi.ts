import { apiGet, apiPost, apiPatch, apiDelete, apiUpload, apiUploadPatch } from "../../../services/apiClient";

export async function obtenerPlanificaciones() {
  return apiGet<any[]>("/distributivos/planificaciones/");
}

export async function obtenerPlanificacion(id: number) {
  return apiGet<any>(`/distributivos/planificaciones/${id}/`);
}

export async function crearPlanificacion(data: any) {
  if (data instanceof FormData) {
    return apiUpload<any>("/distributivos/planificaciones/", data);
  }
  return apiPost("/distributivos/planificaciones/", data);
}

export async function actualizarPlanificacion(id: number, data: any) {
  if (data instanceof FormData) {
    return apiUploadPatch<any>(`/distributivos/planificaciones/${id}/`, data);
  }
  return apiPatch(`/distributivos/planificaciones/${id}/`, data);
}

export async function eliminarPlanificacion(id: number) {
  return apiDelete(`/distributivos/planificaciones/${id}/`);
}

export async function enviarAprobacion(id: number, observacion?: string) {
  return apiPost(`/distributivos/planificaciones/${id}/enviar_aprobacion/`, { observacion: observacion || "" });
}

export async function aprobarPlanificacion(id: number, observacion?: string) {
  return apiPost(`/distributivos/planificaciones/${id}/aprobar/`, { observacion: observacion || "" });
}

export async function historialPlanificacion(planificacionId: number) {
  return apiGet<any[]>(`/distributivos/planificaciones-historial/por_planificacion/?planificacion_id=${planificacionId}`);
}
