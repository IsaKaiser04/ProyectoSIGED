import { apiGet, apiPost, apiUpload, apiUploadPatch } from "../../../services/apiClient";
import type { DistributivoAsignaturaConPca, PlanificacionCurricularHistorial } from "../../../types/entities/distributivo";

export async function obtenerMisAsignaturas(): Promise<DistributivoAsignaturaConPca[]> {
  return apiGet<DistributivoAsignaturaConPca[]>("/distributivos/distributivos-asignaturas/mis_asignaturas/");
}

export async function crearPlanificacionConArchivo(
  distributivoAsignaturaId: number,
  archivoPdf: File,
  observacion: string
) {
  const fd = new FormData();
  fd.append("distributivo_asignatura", String(distributivoAsignaturaId));
  fd.append("archivo_pdf", archivoPdf);
  fd.append("observacion", observacion);
  fd.append("estado", "BORRADOR");
  return apiUpload<any>("/distributivos/planificaciones/", fd);
}

export async function actualizarPlanificacionConArchivo(
  planificacionId: number,
  archivoPdf: File,
  observacion: string
) {
  const fd = new FormData();
  fd.append("archivo_pdf", archivoPdf);
  fd.append("observacion", observacion);
  return apiUploadPatch<any>(`/distributivos/planificaciones/${planificacionId}/`, fd);
}

export async function enviarARevision(planificacionId: number, observacion?: string) {
  return apiPost(`/distributivos/planificaciones/${planificacionId}/enviar_aprobacion/`, {
    observacion: observacion || ""
  });
}

export async function obtenerHistorial(planificacionId: number): Promise<PlanificacionCurricularHistorial[]> {
  return apiGet<PlanificacionCurricularHistorial[]>(
    `/distributivos/planificaciones-historial/por_planificacion/?planificacion_id=${planificacionId}`
  );
}
