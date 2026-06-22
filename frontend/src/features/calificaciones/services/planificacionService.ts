import { apiGet, buildModulePath } from "../../../services/apiClient";
import type {
  AnioLectivo,
  PeriodoAcademico,
  GradoOfertado,
  PlanParalelo,
  AsignaturaOfertada
} from "../../../types/entities/planificacion";

const moduleBase = "planificacion" as const;

export function listAniosLectivos(signal?: AbortSignal) {
  return apiGet<AnioLectivo[]>(buildModulePath(moduleBase, "anios-lectivos"), {
    signal
  });
}

export function listAniosLectivosActivos(signal?: AbortSignal) {
  return apiGet<AnioLectivo[]>(
    `${buildModulePath(moduleBase, "anios-lectivos")}activos/`,
    { signal }
  );
}

export function getPeriodosPorAnioLectivo(
  anioLectivoId: number,
  signal?: AbortSignal
) {
  return apiGet<PeriodoAcademico[]>(
    `${buildModulePath(moduleBase, "anios-lectivos")}${anioLectivoId}/periodos/`,
    { signal }
  );
}

export function listGradosOfertados(
  anioLectivoId?: number,
  signal?: AbortSignal
) {
  const base = buildModulePath(moduleBase, "grados-ofertados");
  const path = anioLectivoId ? `${base}?anio_lectivo_id=${anioLectivoId}` : base;
  return apiGet<GradoOfertado[]>(path, { signal });
}

export function listParalelos(
  gradoOfertadoId?: number,
  signal?: AbortSignal
) {
  const base = buildModulePath(moduleBase, "paralelos");
  const path = gradoOfertadoId
    ? `${base}?grado_ofertado_id=${gradoOfertadoId}`
    : base;
  return apiGet<PlanParalelo[]>(path, { signal });
}

export function listAsignaturasOfertadas(signal?: AbortSignal) {
  return apiGet<AsignaturaOfertada[]>(
    buildModulePath(moduleBase, "asignaturas-ofertadas"),
    { signal }
  );
}


