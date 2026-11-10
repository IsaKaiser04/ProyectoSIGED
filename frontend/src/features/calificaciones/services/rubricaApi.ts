// Rúbrica de actividades del año lectivo (Autoridad / Secretaría).
// El backend valida que el año sea de la institución del usuario.
import { apiGet, apiPost, apiPut, buildModulePath } from "../../../services/apiClient";
import type { RubricaActividades, RubricaActividadesPayload } from "../../../types/entities";

const C = (ep: string) => buildModulePath("calificaciones", ep);

export const rubricaApi = {
  obtener: (anioLectivoId: number, signal?: AbortSignal) =>
    apiGet<RubricaActividades>(`${C("rubrica-actividades")}?anio_lectivo=${anioLectivoId}`, { signal }),
  guardar: (payload: RubricaActividadesPayload) =>
    apiPut<RubricaActividadesPayload, RubricaActividades>(C("rubrica-actividades"), payload),
  copiar: (anioLectivoId: number, anioOrigenId: number) =>
    apiPost<{ anio_lectivo: number; anio_origen: number }, RubricaActividades>(
      C("rubrica-actividades/copiar"),
      { anio_lectivo: anioLectivoId, anio_origen: anioOrigenId }
    ),
};
