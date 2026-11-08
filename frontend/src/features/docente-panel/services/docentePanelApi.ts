// Capa de datos del panel de inicio del docente. Envuelve al cliente base igual
// que features/planificacion/services/planificacionApi.ts.
//
// Las respuestas de distributivo, actividades, estudiantes, calificaciones y
// asistencia se leen de forma tolerante en el dashboard (campos opcionales),
// por eso se dejan como `any` igual que antes de mover las llamadas aquí.
import { apiGet, buildModulePath } from "../../../services/apiClient";
import type { DistributivoAsignaturaConPca } from "../../../types/entities/distributivo";

type Opciones = { signal?: AbortSignal };

export const docentePanelApi = {
  getMisAsignaturas: ({ signal }: Opciones = {}) =>
    apiGet<DistributivoAsignaturaConPca[]>(
      `${buildModulePath("distributivos", "distributivos-asignaturas")}mis_asignaturas/`,
      { signal }
    ),
  getDistributivo: (id: number, { signal }: Opciones = {}) =>
    apiGet<any>(buildModulePath("distributivos", `distributivos/${id}`), { signal }),
  getActividades: (distributivoAsignaturaId: number, { signal }: Opciones = {}) =>
    apiGet<any[]>(
      `${buildModulePath("calificaciones", "asignatura-evaluacion")}?distributivo_asignatura=${distributivoAsignaturaId}`,
      { signal }
    ),
  getEstudiantesPorParalelo: (paraleloId: number, { signal }: Opciones = {}) =>
    apiGet<any[]>(`${buildModulePath("actoresAcademicos", "estudiantes")}?paralelo_id=${paraleloId}`, { signal }),
  getCalificaciones: (distributivoAsignaturaId: number, { signal }: Opciones = {}) =>
    apiGet<any[]>(
      `${buildModulePath("calificaciones", "calificaciones")}?distributivo_asignatura=${distributivoAsignaturaId}`,
      { signal }
    ),
  getMatrizAsistencia: (distributivoAsignaturaId: number, fecha: string, { signal }: Opciones = {}) =>
    apiGet<any>(
      `${buildModulePath("asistencia", "asistencias/matriz")}?distributivo_asignatura_id=${distributivoAsignaturaId}&fecha=${fecha}`,
      { signal }
    ),
};
