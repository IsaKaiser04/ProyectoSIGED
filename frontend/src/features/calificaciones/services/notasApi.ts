// Registro de notas por actividad. El backend crea o actualiza (no hay que saber
// si la calificación ya existía) y devuelve la fila del estudiante recalculada.
import { apiPut, buildModulePath } from "../../../services/apiClient";
import type { NotaPayload, NotaRegistrada } from "../../../types/entities";

const C = (ep: string) => buildModulePath("calificaciones", ep);

export const notasApi = {
  registrar: (actividadId: number, payload: NotaPayload) =>
    apiPut<NotaPayload, NotaRegistrada>(C(`docente/actividades/${actividadId}/nota`), payload),
};
