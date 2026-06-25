// Servicios API para calificaciones del estudiante
import { apiGet } from "../../../services/apiClient";
import { apiEndpoints } from "../../../services/apiEndpoints";
import type {
  AnoLectivo,
  Asignatura,
  Calificacion,
  ActividadEstudiante,
  EntregaEstudiante
} from "../../../types/entities";

// --- AÑOS LECTIVOS ---
export function listAnosLectivosEstudiante(signal?: AbortSignal) {
  return apiGet<AnoLectivo[]>(apiEndpoints.calificaciones.anosLectivos.collection, {
    signal
  });
}

// --- ASIGNATURAS ---
export function listAsignaturasEstudiante(anoLectivoId: number, signal?: AbortSignal) {
  return apiGet<Asignatura[]>(
    apiEndpoints.calificaciones.asignaturas.byAnoLectivo(anoLectivoId),
    { signal }
  );
}

// --- CALIFICACIONES OFICIALES ---
export function getCalificacionesEstudiante(
  anoLectivoId: number,
  asignaturaId: number,
  signal?: AbortSignal
) {
  return apiGet<Calificacion>(
    apiEndpoints.calificaciones.libroCalificaciones.byEstudiante(
      anoLectivoId,
      asignaturaId
    ),
    { signal }
  );
}

// --- ACTIVIDADES (AULA VIRTUAL) ---
export function getActividadesEstudiante(
  anoLectivoId: number,
  asignaturaId: number,
  signal?: AbortSignal
) {
  return apiGet<ActividadEstudiante[]>(
    apiEndpoints.calificaciones.actividades.byEstudiante(anoLectivoId, asignaturaId),
    { signal }
  );
}

// --- ENTREGAS ---
export function getEntregasEstudiante(actividadId: number, signal?: AbortSignal) {
  return apiGet<EntregaEstudiante[]>(
    apiEndpoints.calificaciones.entregas.byEstudiante(actividadId),
    { signal }
  );
}