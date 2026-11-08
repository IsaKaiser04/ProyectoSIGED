// Años lectivos y periodos (módulo planificacion del backend).
// Los periodos de la asignatura llegan dentro de la matriz; aquí solo se
// resuelve el año activo para filtrar las tarjetas del docente.
import { apiGet, buildModulePath } from "../../../services/apiClient";
import type { AnioLectivo } from "../../../types/entities/planificacion";

const P = (ep: string) => buildModulePath("planificacion", ep);

export const periodosApi = {
  getAniosActivos: (signal?: AbortSignal) =>
    apiGet<AnioLectivo[]>(P("anios-lectivos/activos"), { signal }),
};
