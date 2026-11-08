// Supletorio anual por estudiante. Solo se acepta con todos los periodos cerrados
// y nota final bajo la mínima; el backend devuelve la fila con el estado final.
import { apiPut, buildModulePath } from "../../../services/apiClient";
import type { SupletorioPayload, SupletorioRegistrado } from "../../../types/entities";

const C = (ep: string) => buildModulePath("calificaciones", ep);

export const supletoriosApi = {
  registrar: (distributivoAsignaturaId: number, payload: SupletorioPayload) =>
    apiPut<SupletorioPayload, SupletorioRegistrado>(
      C(`docente/asignaturas/${distributivoAsignaturaId}/supletorio`),
      payload
    ),
};
