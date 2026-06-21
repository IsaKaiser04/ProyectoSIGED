import { apiDelete, apiGet, apiPatch, apiPost } from "../../services/apiClient";
import type {
  ApiListResponse,
  CatalogItem,
  Distributivo,
  DistributivoAsignatura,
  Horario,
  JornadaHora,
  PlanificacionCurricular,
  PlanificacionCurricularHistorial,
} from "./types";

function unwrapList<T>(response: ApiListResponse<T>): T[] {
  return Array.isArray(response) ? response : response.results ?? [];
}

export const catalogosDistributivos = {
  docentes: () => apiGet<ApiListResponse<CatalogItem>>("/actoresAcademicos/docentes/").then(unwrapList),
  instituciones: () => apiGet<ApiListResponse<CatalogItem>>("/institucion/instituciones/").then(unwrapList),
  aniosLectivos: () => apiGet<ApiListResponse<CatalogItem>>("/planificacion/anios-lectivos/").then(unwrapList),
  asignaturasOfertadas: () => apiGet<ApiListResponse<CatalogItem>>("/planificacion/asignaturas-ofertadas/").then(unwrapList),
};

export type DistributivoPayload = Pick<Distributivo, "anio_lectivo" | "docente" | "observacion">;
export type DistributivoAsignaturaPayload = Pick<DistributivoAsignatura, "distributivo" | "asignatura_ofertada" | "observacion">;
export type JornadaHoraPayload = Pick<JornadaHora, "nombre" | "hora_inicio" | "hora_fin" | "institucion">;
export type HorarioPayload = Pick<Horario, "distributivo" | "distributivo_asignatura" | "jornada_hora" | "hora_inicio" | "hora_fin" | "observacion" | "tipo_horario" | "dia_semana">;

export async function fetchDistributivos() {
  return unwrapList(await apiGet<ApiListResponse<Distributivo>>("/distributivos/distributivos/"));
}
export async function createDistributivo(payload: DistributivoPayload) {
  return apiPost<DistributivoPayload, Distributivo>("/distributivos/distributivos/", payload);
}
export async function updateDistributivo(id: number, payload: DistributivoPayload) {
  return apiPatch<DistributivoPayload, Distributivo>(`/distributivos/distributivos/${id}/`, payload);
}
export async function deleteDistributivo(id: number) {
  return apiDelete(`/distributivos/distributivos/${id}/`);
}

export async function fetchDistributivoAsignaturas() {
  return unwrapList(await apiGet<ApiListResponse<DistributivoAsignatura>>("/distributivos/distributivos-asignaturas/"));
}
export async function createDistributivoAsignatura(payload: DistributivoAsignaturaPayload) {
  return apiPost<DistributivoAsignaturaPayload, DistributivoAsignatura>("/distributivos/distributivos-asignaturas/", payload);
}
export async function updateDistributivoAsignatura(id: number, payload: DistributivoAsignaturaPayload) {
  return apiPatch<DistributivoAsignaturaPayload, DistributivoAsignatura>(`/distributivos/distributivos-asignaturas/${id}/`, payload);
}
export async function deleteDistributivoAsignatura(id: number) {
  return apiDelete(`/distributivos/distributivos-asignaturas/${id}/`);
}

export async function fetchJornadas() {
  return unwrapList(await apiGet<ApiListResponse<JornadaHora>>("/distributivos/jornadas/"));
}
export async function createJornadaHora(payload: JornadaHoraPayload) {
  return apiPost<JornadaHoraPayload, JornadaHora>("/distributivos/jornadas/", payload);
}
export async function updateJornadaHora(id: number, payload: JornadaHoraPayload) {
  return apiPatch<JornadaHoraPayload, JornadaHora>(`/distributivos/jornadas/${id}/`, payload);
}
export async function deleteJornadaHora(id: number) {
  return apiDelete(`/distributivos/jornadas/${id}/`);
}

export async function fetchHorarios() {
  return unwrapList(await apiGet<ApiListResponse<Horario>>("/distributivos/horarios/"));
}
export async function createHorario(payload: HorarioPayload) {
  return apiPost<HorarioPayload, Horario>("/distributivos/horarios/", payload);
}
export async function updateHorario(id: number, payload: HorarioPayload) {
  return apiPatch<HorarioPayload, Horario>(`/distributivos/horarios/${id}/`, payload);
}
export async function deleteHorario(id: number) {
  return apiDelete(`/distributivos/horarios/${id}/`);
}

export async function fetchPlanificaciones() {
  return unwrapList(await apiGet<ApiListResponse<PlanificacionCurricular>>("/distributivos/planificaciones/"));
}
export async function createPlanificacionCurricular(body: FormData) {
  return apiPost<FormData, PlanificacionCurricular>("/distributivos/planificaciones/", body);
}
export async function updatePlanificacionCurricular(id: number, body: FormData) {
  return apiPatch<FormData, PlanificacionCurricular>(`/distributivos/planificaciones/${id}/`, body);
}
export async function deletePlanificacionCurricular(id: number) {
  return apiDelete(`/distributivos/planificaciones/${id}/`);
}

export async function fetchHistorialPlanificaciones() {
  return unwrapList(await apiGet<ApiListResponse<PlanificacionCurricularHistorial>>("/distributivos/planificaciones-historial/"));
}
