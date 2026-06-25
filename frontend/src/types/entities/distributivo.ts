export type PlanificacionEstado = 'BORRADOR' | 'POR_APROBAR' | 'APROBADO';

export interface DistributivoAsignaturaConPca {
  id: number;
  distributivo: number;
  distributivo_nombre: string;
  asignatura_ofertada: number;
  asignatura_ofertada_nombre: string;
  grado_nombre: string;
  paralelo: number;
  paralelo_nombre: string;
  observacion: string;
  pca_id: number | null;
  pca_estado: PlanificacionEstado | null;
  pca_estado_display: string | null;
  pca_archivo_url: string | null;
  pca_observacion: string | null;
}

export interface PlanificacionCurricular {
  id: number;
  distributivo_asignatura: number;
  asignatura_nombre: string;
  archivo_pdf: string | null;
  observacion: string;
  estado: PlanificacionEstado;
  estado_display: string;
  created_at?: string;
  updated_at?: string;
  historiales?: PlanificacionCurricularHistorial[];
}

export interface PlanificacionCurricularHistorial {
  id: number;
  planificacion_curricular: number;
  fecha: string;
  estado_anterior: string;
  estado_anterior_display?: string;
  estado_actual: string;
  estado_actual_display?: string;
  observacion: string;
}
