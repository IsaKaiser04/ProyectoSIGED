import { apiGet, apiPost, apiPatch, apiDelete } from "../../../services/apiClient";

// ==========================================
// TIPOS
// ==========================================

export type ClaseEstado = 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';
export type AsistenciaTipo = 'ASISTENCIA' | 'INASISTENCIA' | 'JUSTIFICADO' | 'ATRASADO';
export type IncidenciaTipo = 'COMPORTAMIENTO' | 'ACADEMICO' | 'ASISTENCIAL';
export type JustificacionEstado = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface Clase {
  id: number;
  tema: string;
  descripcion: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: ClaseEstado;
  estado_display: string;
  distributivo_asignatura_id: number;
  total_asistencias?: number;
  total_inasistencias?: number;
}

export interface ClaseDetail extends Clase {
  asistencias: Asistencia[];
}

export interface Asistencia {
  id: number;
  tipo: AsistenciaTipo;
  tipo_display: string;
  observacion: string;
  notificar: boolean;
  clase_id: number;
  matricula_id: number;
  registrado_por_nombre?: string;
  fecha_registro: string;
  tiene_incidencia: boolean;
  tiene_justificacion: boolean;
}

export interface AsistenciaMasivaPayload {
  clase_id: number;
  notificar: boolean;
  asistencias: {
    matricula_id: number;
    tipo: AsistenciaTipo;
    observacion: string;
  }[];
}

export interface Incidencia {
  id: number;
  asunto: string;
  detalle: string;
  archivo?: string;
  archivo_url?: string;
  tipo: IncidenciaTipo;
  tipo_display: string;
  estado: string;
  notificar: boolean;
  asistencia?: number;
  matricula?: number;
  registrado_por_nombre?: string;
  fecha_registro: string;
}

export interface Justificacion {
  id: number;
  estado: JustificacionEstado;
  estado_display: string;
  motivo: string;
  archivo?: string;
  observacion_secretaria: string;
  asistencia: number;
  estudiante_info: {
    matricula_id: number;
    estudiante_nombre: string;
  };
  clase_info: {
    clase_id: number;
    tema: string;
    fecha: string;
  };
  solicitado_por?: number;
  fecha_solicitud: string;
  fecha_resolucion?: string;
}

export interface KPIParalelo {
  total_registros: number;
  porcentaje_asistencia: number;
  total_asistencia: number;
  total_inasistencia: number;
  total_justificado: number;
  total_atrasado: number;
  periodo: string;
}

export interface TendenciaSemanal {
  semana: string;
  total: number;
  presentes: number;
  ausentes: number;
  porcentaje: number;
}

export interface AlumnoRiesgo {
  matricula_id: number;
  total_faltas: number;
  total_clases: number;
  porcentaje_inasistencia: number;
  en_riesgo: boolean;
}

export interface ResumenSemana {
  semana: string;
  total_clases: number;
  clases_pendientes: number;
  clases_registradas: number;
  clases: {
    clase_id: number;
    tema: string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    estado: ClaseEstado;
    total_alumnos: number;
    presentes: number;
    ausentes: number;
    pendiente_registro: boolean;
  }[];
}

export interface EstadisticasClase {
  ASISTENCIA: number;
  INASISTENCIA: number;
  JUSTIFICADO: number;
  ATRASADO: number;
  total: number;
}

// ==========================================
// HELPER PARA FORMDATA (archivos)
// ==========================================

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

async function apiPostFormData<TResponse>(path: string, formData: FormData): Promise<TResponse> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(`Error ${response.status} en ${path}`) as any;
    error.data = errorData;
    throw error;
  }
  return response.json() as Promise<TResponse>;
}

// ==========================================
// CLASES
// ==========================================

export const claseApi = {
  listar: (distributivoId?: number, estado?: string) =>
    apiGet<Clase[]>(`/asistencia/clases/?distributivo_id=${distributivoId || ''}&estado=${estado || ''}`),

  obtener: (id: number) =>
    apiGet<ClaseDetail>(`/asistencia/clases/${id}/`),

  crear: (data: Partial<Clase>) =>
    apiPost<Clase>('/asistencia/clases/', data),

  actualizar: (id: number, data: Partial<Clase>) =>
    apiPatch<Clase>(`/asistencia/clases/${id}/`, data),

  iniciar: (id: number) =>
    apiPost<Clase>(`/asistencia/clases/${id}/iniciar/`, {}),

  finalizar: (id: number) =>
    apiPost<Clase>(`/asistencia/clases/${id}/finalizar/`, {}),

  cancelar: (id: number) =>
    apiPost<Clase>(`/asistencia/clases/${id}/cancelar/`, {}),

  obtenerSemana: (distributivoId: number, fecha?: string) =>
    apiGet<Clase[]>(`/asistencia/clases/semana/?distributivo_id=${distributivoId}&fecha=${fecha || ''}`),

  obtenerAsistencias: (id: number) =>
    apiGet<ClaseDetail>(`/asistencia/clases/${id}/asistencias/`),
};

// ==========================================
// ASISTENCIAS
// ==========================================

export const asistenciaApi = {
  porClase: (claseId: number) =>
    apiGet<Asistencia[]>(`/asistencia/asistencias/por_clase/?clase_id=${claseId}`),

  porMatricula: (matriculaId: number) =>
    apiGet<Asistencia[]>(`/asistencia/asistencias/por_matricula/?matricula_id=${matriculaId}`),

  porPeriodo: (matriculaId: number, fechaInicio: string, fechaFin: string) =>
    apiGet<Asistencia[]>(`/asistencia/asistencias/por_periodo/?matricula_id=${matriculaId}&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`),

  registrarMasiva: (data: AsistenciaMasivaPayload) =>
    apiPost<{ mensaje: string; total: number; asistencias: Asistencia[] }>('/asistencia/asistencias/masiva/', data),

  actualizarTipo: (id: number, data: { tipo: AsistenciaTipo; observacion?: string; notificar?: boolean }) =>
    apiPatch<Asistencia>(`/asistencia/asistencias/${id}/`, data),

  estadisticasClase: (claseId: number) =>
    apiGet<EstadisticasClase>(`/asistencia/asistencias/estadisticas_clase/?clase_id=${claseId}`),

  pendientes: (distributivoId: number, fecha: string) =>
    apiGet<Clase[]>(`/asistencia/asistencias/pendientes/?distributivo_id=${distributivoId}&fecha=${fecha}`),

  incidencias: (asistenciaId: number) =>
    apiGet<Incidencia[]>(`/asistencia/asistencias/${asistenciaId}/incidencias/`),
};

// ==========================================
// INCIDENCIAS
// ==========================================

export const incidenciaApi = {
  listar: (matriculaId?: number, tipo?: string) =>
    apiGet<Incidencia[]>(`/asistencia/incidencias/?matricula_id=${matriculaId || ''}&tipo=${tipo || ''}`),

  obtener: (id: number) =>
    apiGet<Incidencia>(`/asistencia/incidencias/${id}/`),

  crear: (data: FormData) =>
    apiPostFormData<Incidencia>('/asistencia/incidencias/', data),

  actualizar: (id: number, data: Partial<Incidencia>) =>
    apiPatch<Incidencia>(`/asistencia/incidencias/${id}/`, data),

  pendientes: () =>
    apiGet<Incidencia[]>('/asistencia/incidencias/pendientes/'),

  porAsistencia: (asistenciaId: number) =>
    apiGet<Incidencia[]>(`/asistencia/incidencias/por_asistencia/?asistencia_id=${asistenciaId}`),

  porPeriodo: (matriculaId: number, fechaInicio: string, fechaFin: string) =>
    apiGet<Incidencia[]>(`/asistencia/incidencias/por_periodo/?matricula_id=${matriculaId}&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`),
};

// ==========================================
// JUSTIFICACIONES
// ==========================================

export const justificacionApi = {
  listar: (matriculaId?: number) =>
    apiGet<Justificacion[]>(`/asistencia/justificaciones/?matricula_id=${matriculaId || ''}`),

  obtener: (id: number) =>
    apiGet<Justificacion>(`/asistencia/justificaciones/${id}/`),

  crear: (data: FormData) =>
    apiPostFormData<Justificacion>('/asistencia/justificaciones/', data),

  pendientes: () =>
    apiGet<Justificacion[]>('/asistencia/justificaciones/pendientes/'),

  aprobar: (id: number, observacion?: string) =>
    apiPost<Justificacion>(`/asistencia/justificaciones/${id}/aprobar/`, { observacion_secretaria: observacion || '' }),

  rechazar: (id: number, observacion: string) =>
    apiPost<Justificacion>(`/asistencia/justificaciones/${id}/rechazar/`, { observacion_secretaria: observacion }),
};

// ==========================================
// ESTADÍSTICAS / DASHBOARD
// ==========================================

export const estadisticaApi = {
  kpiParalelo: (distributivoId: number, fechaInicio?: string, fechaFin?: string) =>
    apiGet<KPIParalelo>(`/asistencia/estadisticas/kpi_paralelo/?distributivo_id=${distributivoId}&fecha_inicio=${fechaInicio || ''}&fecha_fin=${fechaFin || ''}`),

  tendenciaSemanal: (distributivoId: number, semanas?: number) =>
    apiGet<TendenciaSemanal[]>(`/asistencia/estadisticas/tendencia_semanal/?distributivo_id=${distributivoId}&semanas=${semanas || 4}`),

  alumnosRiesgo: (distributivoId: number, umbral?: number) =>
    apiGet<AlumnoRiesgo[]>(`/asistencia/estadisticas/alumnos_riesgo/?distributivo_id=${distributivoId}&umbral=${umbral || 10}`),

  resumenSemanal: (distributivoId: number, fecha?: string) =>
    apiGet<ResumenSemana>(`/asistencia/estadisticas/resumen_semanal/?distributivo_id=${distributivoId}&fecha=${fecha || ''}`),
};

export default {
  clase: claseApi,
  asistencia: asistenciaApi,
  incidencia: incidenciaApi,
  justificacion: justificacionApi,
  estadistica: estadisticaApi,
};
