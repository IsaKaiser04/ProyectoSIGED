// Servicios API para calificaciones del docente
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "../../../services/apiClient";
import { apiEndpoints } from "../../../services/apiEndpoints";
import type {
  AnoLectivo,
  Curso,
  Asignatura,
  Estudiante,
  Calificacion,
  CalificacionPayload,
  Actividad,
  ActividadPayload,
  Entrega,
  CalificacionActividad,
  CalificacionActividadPayload
} from "../../../types/entities";

// --- AÑOS LECTIVOS ---
export function listAnosLectivos(signal?: AbortSignal) {
  return apiGet<AnoLectivo[]>(apiEndpoints.calificaciones.anosLectivos.collection, {
    signal
  });
}

export function getAnoLectivoActivo(signal?: AbortSignal) {
  return apiGet<AnoLectivo>(`${apiEndpoints.calificaciones.anosLectivos.collection}activo/`, {
    signal
  });
}

// --- CURSOS (Grado + Paralelo) ---
export function listCursosPorAnoLectivo(anoLectivoId: number, signal?: AbortSignal) {
  return apiGet<Curso[]>(apiEndpoints.calificaciones.cursos.byAnoLectivo(anoLectivoId), {
    signal
  });
}

// --- ASIGNATURAS ---
export function listAsignaturasPorCurso(cursoId: number, signal?: AbortSignal) {
  return apiGet<Asignatura[]>(apiEndpoints.calificaciones.asignaturas.byCurso(cursoId), {
    signal
  });
}

// --- ESTUDIANTES ---
export function listEstudiantesPorAnoYCurso(
  anoLectivoId: number,
  cursoId: number,
  signal?: AbortSignal
) {
  return apiGet<Estudiante[]>(
    apiEndpoints.calificaciones.estudiantes.byAnoAndCurso(anoLectivoId, cursoId),
    { signal }
  );
}

// --- LIBRO DE CALIFICACIONES ---
export function getLibroCalificaciones(
  anoLectivoId: number,
  cursoId: number,
  asignaturaId: number,
  signal?: AbortSignal
) {
  return apiGet<Calificacion[]>(
    apiEndpoints.calificaciones.libroCalificaciones.byFilters(
      anoLectivoId,
      cursoId,
      asignaturaId
    ),
    { signal }
  );
}

export function updateCalificacion(
  id: number,
  payload: Partial<CalificacionPayload>
) {
  return apiPatch<Partial<CalificacionPayload>, Calificacion>(
    apiEndpoints.calificaciones.libroCalificaciones.detail(id),
    payload
  );
}

export function createCalificacion(payload: CalificacionPayload) {
  return apiPost<CalificacionPayload, Calificacion>(
    apiEndpoints.calificaciones.libroCalificaciones.collection,
    payload
  );
}

// --- ACTIVIDADES (Aula Virtual) ---
export function listActividadesPorCursoYAsignatura(
  cursoId: number,
  asignaturaId: number,
  signal?: AbortSignal
) {
  return apiGet<Actividad[]>(
    apiEndpoints.calificaciones.actividades.byCursoAsignatura(cursoId, asignaturaId),
    { signal }
  );
}

export function createActividad(payload: ActividadPayload) {
  return apiPost<ActividadPayload, Actividad>(
    apiEndpoints.calificaciones.actividades.collection,
    payload
  );
}

export function updateActividad(id: number, payload: Partial<ActividadPayload>) {
  return apiPatch<Partial<ActividadPayload>, Actividad>(
    apiEndpoints.calificaciones.actividades.detail(id),
    payload
  );
}

export function deleteActividad(id: number) {
  return apiDelete(apiEndpoints.calificaciones.actividades.detail(id));
}

// --- ENTREGAS ---
export function listEntregasPorActividad(actividadId: number, signal?: AbortSignal) {
  return apiGet<Entrega[]>(
    apiEndpoints.calificaciones.entregas.byActividad(actividadId),
    { signal }
  );
}

// --- CALIFICACIONES DE ACTIVIDAD ---
export function getCalificacionActividad(
  entregaId: number,
  signal?: AbortSignal
) {
  return apiGet<CalificacionActividad | null>(
    apiEndpoints.calificaciones.calificacionesActividad.byEntrega(entregaId),
    { signal }
  );
}

export function saveCalificacionActividad(
  payload: CalificacionActividadPayload
) {
  return apiPost<CalificacionActividadPayload, CalificacionActividad>(
    apiEndpoints.calificaciones.calificacionesActividad.collection,
    payload
  );
}

export function updateCalificacionActividad(
  id: number,
  payload: Partial<CalificacionActividadPayload>
) {
  return apiPatch<Partial<CalificacionActividadPayload>, CalificacionActividad>(
    apiEndpoints.calificaciones.calificacionesActividad.detail(id),
    payload
  );
}