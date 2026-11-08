// Servicios de las páginas de calificaciones y aula virtual del estudiante.
// Mismas rutas que usaban antes desde el archivo de endpoints estático (eliminado); ahora
// se construyen con el cliente base, como en features/planificacion.
//
// Pendiente de backend: /calificaciones/entregas/ no existe todavía, y los
// filtros anio_lectivo_id / asignatura_id de calificaciones y asignatura-evaluacion
// no están en sus filterset_fields, así que el backend los ignora.
import { apiGet, buildModulePath } from "../../../services/apiClient";
import type {
  ActividadEstudiante,
  AnoLectivo,
  Asignatura,
  Calificacion,
  EntregaEstudiante,
} from "../../../types/entities";

const C = (ep: string) => buildModulePath("calificaciones", ep);
const P = (ep: string) => buildModulePath("planificacion", ep);

export function listAnosLectivosEstudiante(signal?: AbortSignal) {
  return apiGet<AnoLectivo[]>(P("anios-lectivos"), { signal });
}

export function listAsignaturasEstudiante(anoLectivoId: number, signal?: AbortSignal) {
  return apiGet<Asignatura[]>(`${P("asignaturas-ofertadas")}?anio_lectivo_id=${anoLectivoId}`, { signal });
}

export function getCalificacionesEstudiante(anoLectivoId: number, asignaturaId: number, signal?: AbortSignal) {
  return apiGet<Calificacion>(
    `${C("calificaciones")}?anio_lectivo_id=${anoLectivoId}&asignatura_id=${asignaturaId}`,
    { signal }
  );
}

export function getActividadesEstudiante(anoLectivoId: number, asignaturaId: number, signal?: AbortSignal) {
  return apiGet<ActividadEstudiante[]>(
    `${C("asignatura-evaluacion")}?anio_lectivo_id=${anoLectivoId}&asignatura_id=${asignaturaId}`,
    { signal }
  );
}

export function getEntregasEstudiante(actividadId: number, signal?: AbortSignal) {
  return apiGet<EntregaEstudiante[]>(`${C("entregas")}?actividad_id=${actividadId}`, { signal });
}
