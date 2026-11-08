// Asignaturas del distributivo del docente autenticado.
// El backend identifica al docente por el token; no se envía su id.
import { apiGet, buildModulePath } from "../../../services/apiClient";
import type { AsignaturasDocenteResponse } from "../../../types/entities";

const C = (ep: string) => buildModulePath("calificaciones", ep);

export const distributivoDocenteApi = {
  getMisAsignaturas: (anioLectivoId?: number, signal?: AbortSignal) => {
    const base = C("distributivo/docente");
    const path = anioLectivoId ? `${base}?anio_lectivo=${anioLectivoId}` : base;
    return apiGet<AsignaturasDocenteResponse>(path, { signal });
  },
};
