// Reporte de notas por asignatura y paralelo (solo lectura).
// El docente ve su distributivo; Autoridad y Secretaría, toda la institución.
import { apiGet, buildModulePath } from "../../../services/apiClient";
import type { ReporteNotas } from "../../../types/entities";

const C = (ep: string) => buildModulePath("calificaciones", ep);

export type AlcanceReporte = "docente" | "institucion";

export const reporteNotasApi = {
  obtener: (alcance: AlcanceReporte, signal?: AbortSignal) =>
    apiGet<ReporteNotas>(C(alcance === "docente" ? "docente/reporte-notas" : "reporte-notas"), { signal }),
};
