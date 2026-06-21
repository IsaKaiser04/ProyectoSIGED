import { apiDelete, apiGet, apiPatch, apiPost } from "../../services/apiClient";
import type { AdaptacionCurricular, AdaptacionCurricularEvidencia, AdaptacionCurricularPlanificacion, ApiListResponse, CatalogItem } from "./types";

function unwrapList<T>(response: ApiListResponse<T>): T[] {
  return Array.isArray(response) ? response : response.results ?? [];
}

export const catalogosDece = {
  matriculas: () => apiGet<ApiListResponse<CatalogItem>>("/matricula/matriculas/").then(unwrapList),
  distributivoAsignaturas: () => apiGet<ApiListResponse<CatalogItem>>("/distributivos/distributivos-asignaturas/").then(unwrapList),
};

export type AdaptacionPayload = Pick<AdaptacionCurricular, "matricula" | "discapacidad_tipo" | "discapacidad_grado" | "necesidad_educativa">;

export async function fetchAdaptaciones() {
  return unwrapList(await apiGet<ApiListResponse<AdaptacionCurricular>>("/dece/adaptaciones-curriculares/"));
}
export async function createAdaptacion(payload: AdaptacionPayload) {
  return apiPost<AdaptacionPayload, AdaptacionCurricular>("/dece/adaptaciones-curriculares/", payload);
}
export async function updateAdaptacion(id: number, payload: AdaptacionPayload) {
  return apiPatch<AdaptacionPayload, AdaptacionCurricular>(`/dece/adaptaciones-curriculares/${id}/`, payload);
}
export async function deleteAdaptacion(id: number) {
  return apiDelete(`/dece/adaptaciones-curriculares/${id}/`);
}

export async function fetchEvidencias() {
  return unwrapList(await apiGet<ApiListResponse<AdaptacionCurricularEvidencia>>("/dece/adaptaciones-evidencias/"));
}
export async function createEvidencia(body: FormData) {
  return apiPost<FormData, AdaptacionCurricularEvidencia>("/dece/adaptaciones-evidencias/", body);
}
export async function updateEvidencia(id: number, body: FormData) {
  return apiPatch<FormData, AdaptacionCurricularEvidencia>(`/dece/adaptaciones-evidencias/${id}/`, body);
}
export async function deleteEvidencia(id: number) {
  return apiDelete(`/dece/adaptaciones-evidencias/${id}/`);
}

export async function fetchPlanificacionesDece() {
  return unwrapList(await apiGet<ApiListResponse<AdaptacionCurricularPlanificacion>>("/dece/adaptaciones-planificaciones/"));
}
export async function createPlanificacionDece(body: FormData) {
  return apiPost<FormData, AdaptacionCurricularPlanificacion>("/dece/adaptaciones-planificaciones/", body);
}
export async function updatePlanificacionDece(id: number, body: FormData) {
  return apiPatch<FormData, AdaptacionCurricularPlanificacion>(`/dece/adaptaciones-planificaciones/${id}/`, body);
}
export async function deletePlanificacionDece(id: number) {
  return apiDelete(`/dece/adaptaciones-planificaciones/${id}/`);
}
