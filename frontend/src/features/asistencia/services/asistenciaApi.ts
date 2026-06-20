import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const BASE = `${API_BASE_URL}/asistencia`;

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
// HELPERS
// ==========================================

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
// CLASES
// ==========================================

export const claseApi = {
  listar: (distributivoId?: number, estado?: string) =>
    api.get<Clase[]>('/clases/', {
      params: { distributivo_id: distributivoId, estado },
    }),

  obtener: (id: number) =>
    api.get<ClaseDetail>(`/clases/${id}/`),

  crear: (data: Partial<Clase>) =>
    api.post<Clase>('/clases/', data),

  actualizar: (id: number, data: Partial<Clase>) =>
    api.patch<Clase>(`/clases/${id}/`, data),

  iniciar: (id: number) =>
    api.post<Clase>(`/clases/${id}/iniciar/`),

  finalizar: (id: number) =>
    api.post<Clase>(`/clases/${id}/finalizar/`),

  cancelar: (id: number) =>
    api.post<Clase>(`/clases/${id}/cancelar/`),

  obtenerSemana: (distributivoId: number, fecha?: string) =>
    api.get<Clase[]>('/clases/semana/', {
      params: { distributivo_id: distributivoId, fecha },
    }),

  obtenerAsistencias: (id: number) =>
    api.get<ClaseDetail>(`/clases/${id}/asistencias/`),
};

// ==========================================
// ASISTENCIAS
// ==========================================

export const asistenciaApi = {
  porClase: (claseId: number) =>
    api.get<Asistencia[]>('/asistencias/por_clase/', {
      params: { clase_id: claseId },
    }),

  porMatricula: (matriculaId: number) =>
    api.get<Asistencia[]>('/asistencias/por_matricula/', {
      params: { matricula_id: matriculaId },
    }),

  porPeriodo: (matriculaId: number, fechaInicio: string, fechaFin: string) =>
    api.get<Asistencia[]>('/asistencias/por_periodo/', {
      params: {
        matricula_id: matriculaId,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      },
    }),

  registrarMasiva: (data: AsistenciaMasivaPayload) =>
    api.post<{ mensaje: string; total: number; asistencias: Asistencia[] }>(
      '/asistencias/masiva/',
      data
    ),

  actualizarTipo: (id: number, data: { tipo: AsistenciaTipo; observacion?: string; notificar?: boolean }) =>
    api.patch<Asistencia>(`/asistencias/${id}/`, data),

  estadisticasClase: (claseId: number) =>
    api.get<EstadisticasClase>('/asistencias/estadisticas_clase/', {
      params: { clase_id: claseId },
    }),

  pendientes: (distributivoId: number, fecha: string) =>
    api.get<Clase[]>('/asistencias/pendientes/', {
      params: { distributivo_id: distributivoId, fecha },
    }),

  incidencias: (asistenciaId: number) =>
    api.get<Incidencia[]>(`/asistencias/${asistenciaId}/incidencias/`),
};

// ==========================================
// INCIDENCIAS
// ==========================================

export const incidenciaApi = {
  listar: (matriculaId?: number, tipo?: string) =>
    api.get<Incidencia[]>('/incidencias/', {
      params: { matricula_id: matriculaId, tipo },
    }),

  obtener: (id: number) =>
    api.get<Incidencia>(`/incidencias/${id}/`),

  crear: (data: FormData) =>
    api.post<Incidencia>('/incidencias/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  actualizar: (id: number, data: Partial<Incidencia>) =>
    api.patch<Incidencia>(`/incidencias/${id}/`, data),

  pendientes: () =>
    api.get<Incidencia[]>('/incidencias/pendientes/'),

  porAsistencia: (asistenciaId: number) =>
    api.get<Incidencia[]>('/incidencias/por_asistencia/', {
      params: { asistencia_id: asistenciaId },
    }),

  porPeriodo: (matriculaId: number, fechaInicio: string, fechaFin: string) =>
    api.get<Incidencia[]>('/incidencias/por_periodo/', {
      params: {
        matricula_id: matriculaId,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      },
    }),
};

// ==========================================
// JUSTIFICACIONES
// ==========================================

export const justificacionApi = {
  listar: (matriculaId?: number) =>
    api.get<Justificacion[]>('/justificaciones/', {
      params: { matricula_id: matriculaId },
    }),

  obtener: (id: number) =>
    api.get<Justificacion>(`/justificaciones/${id}/`),

  crear: (data: FormData) =>
    api.post<Justificacion>('/justificaciones/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  pendientes: () =>
    api.get<Justificacion[]>('/justificaciones/pendientes/'),

  aprobar: (id: number, observacion?: string) =>
    api.post<Justificacion>(`/justificaciones/${id}/aprobar/`, {
      observacion_secretaria: observacion || '',
    }),

  rechazar: (id: number, observacion: string) =>
    api.post<Justificacion>(`/justificaciones/${id}/rechazar/`, {
      observacion_secretaria: observacion,
    }),
};

// ==========================================
// ESTADÍSTICAS / DASHBOARD
// ==========================================

export const estadisticaApi = {
  kpiParalelo: (distributivoId: number, fechaInicio?: string, fechaFin?: string) =>
    api.get<KPIParalelo>('/estadisticas/kpi_paralelo/', {
      params: {
        distributivo_id: distributivoId,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      },
    }),

  tendenciaSemanal: (distributivoId: number, semanas?: number) =>
    api.get<TendenciaSemanal[]>('/estadisticas/tendencia_semanal/', {
      params: { distributivo_id: distributivoId, semanas },
    }),

  alumnosRiesgo: (distributivoId: number, umbral?: number) =>
    api.get<AlumnoRiesgo[]>('/estadisticas/alumnos_riesgo/', {
      params: { distributivo_id: distributivoId, umbral },
    }),

  resumenSemanal: (distributivoId: number, fecha?: string) =>
    api.get<ResumenSemana>('/estadisticas/resumen_semanal/', {
      params: { distributivo_id: distributivoId, fecha },
    }),
};

export default {
  clase: claseApi,
  asistencia: asistenciaApi,
  incidencia: incidenciaApi,
  justificacion: justificacionApi,
  estadistica: estadisticaApi,
};
