// Actividades evaluables (AsignaturaEvaluacion).
//
// - `actividadesDocenteApi`: endpoints del registro de notas. El backend asigna el
//   periodo según fecha_entrega y aplica bloqueo por fechas y reglas de pesos.
// - `actividadesEvaApi`: CRUD genérico que sigue usando el aula virtual
//   (features/aula-virtual/hooks/useActividades.ts). Se conserva tal cual.
import { apiDelete, apiGet, apiPatch, apiPost, buildModulePath } from "../../../services/apiClient";
import type {
  Actividad,
  ActividadDocente,
  ActividadDocentePayload,
  ActividadPayload,
} from "../../../types/entities";

const C = (ep: string) => buildModulePath("calificaciones", ep);

export const actividadesDocenteApi = {
  crear: (distributivoAsignaturaId: number, payload: ActividadDocentePayload) =>
    apiPost<ActividadDocentePayload, ActividadDocente>(
      C(`docente/asignaturas/${distributivoAsignaturaId}/actividades`),
      payload
    ),
  actualizar: (actividadId: number, payload: Partial<ActividadDocentePayload>) =>
    apiPatch<ActividadDocentePayload, ActividadDocente>(C(`docente/actividades/${actividadId}`), payload),
  eliminar: (actividadId: number) => apiDelete(C(`docente/actividades/${actividadId}`)),
};

export const actividadesEvaApi = {
  getDistributivosAsignaturas: (signal?: AbortSignal) =>
    apiGet<unknown[]>(buildModulePath("distributivos", "distributivos-asignaturas"), { signal }),
  listarPorDistributivoAsignatura: (distributivoAsignaturaId: number, signal?: AbortSignal) =>
    apiGet<Actividad[]>(`${C("asignatura-evaluacion")}?distributivo_asignatura=${distributivoAsignaturaId}`, {
      signal,
    }),
  crear: (payload: ActividadPayload) => apiPost<ActividadPayload, Actividad>(C("asignatura-evaluacion"), payload),
  actualizar: (id: number, payload: Partial<ActividadPayload>) =>
    apiPatch<ActividadPayload, Actividad>(C(`asignatura-evaluacion/${id}`), payload),
  eliminar: (id: number) => apiDelete(C(`asignatura-evaluacion/${id}`)),
};
