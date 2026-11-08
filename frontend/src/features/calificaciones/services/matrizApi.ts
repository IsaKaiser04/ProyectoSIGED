// Matriz de calificaciones de una asignatura: estudiantes, periodos, actividades,
// notas, promedios, nota final y supletorio en una sola respuesta.
import { apiGet, buildModulePath } from "../../../services/apiClient";
import type { MatrizCalificaciones } from "../../../types/entities";

const C = (ep: string) => buildModulePath("calificaciones", ep);

export const matrizApi = {
  getMatriz: (distributivoAsignaturaId: number, signal?: AbortSignal) =>
    apiGet<MatrizCalificaciones>(C(`docente/asignaturas/${distributivoAsignaturaId}/matriz`), { signal }),
};
