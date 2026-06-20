export interface ClaseEstado {
  PROGRAMADO: string;
  EN_CURSO: string;
  FINALIZADO: string;
  CANCELADO: string;
}

export interface AsistenciaTipo {
  ASISTENCIA: string;
  INASISTENCIA: string;
  JUSTIFICADO: string;
  ATRASADO: string;
}

export interface IncidenciaTipo {
  COMPORTAMIENTO: string;
  ACADEMICO: string;
  ASISTENCIAL: string;
}

export interface JustificacionEstado {
  PENDIENTE: string;
  APROBADA: string;
  RECHAZADA: string;
}

export interface Clase {
  id: number;
  tema: string;
  descripcion: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  estado_display?: string;
  distributivo_asignatura_id: number;
  horario_id?: number;
  distributivo_evaluacion_id?: number;
  creado_por?: number;
  fecha_creacion?: string;
  fecha_modificacion?: string;
  total_asistencias?: number;
  total_inasistencias?: number;
}

export interface ClaseDetail extends Clase {
  asistencias: Asistencia[];
}

export interface Asistencia {
  id: number;
  tipo: string;
  tipo_display?: string;
  observacion: string;
  notificar: boolean;
  clase_id: number;
  matricula_id: number;
  registrado_por?: number;
  registrado_por_nombre?: string;
  fecha_registro: string;
  fecha_modificacion?: string;
  tiene_incidencia?: boolean;
  tiene_justificacion?: boolean;
}

export interface Incidencia {
  id: number;
  asunto: string;
  detalle: string;
  archivo?: string;
  archivo_url?: string;
  tipo: string;
  tipo_display?: string;
  estado: string;
  notificar: boolean;
  asistencia?: number;
  matricula?: number;
  incidencia_calificacion_id?: number;
  registrado_por?: number;
  registrado_por_nombre?: string;
  fecha_registro: string;
  fecha_modificacion?: string;
}

export interface Justificacion {
  id: number;
  estado: string;
  estado_display?: string;
  motivo: string;
  archivo?: string;
  observacion_secretaria: string;
  asistencia: number;
  estudiante_info?: {
    matricula_id: number;
    estudiante_nombre: string;
  };
  clase_info?: {
    clase_id: number;
    tema: string;
    fecha: string;
  };
  solicitado_por?: number;
  resuelto_por?: number;
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

export interface ResumenSemanaClase {
  clase_id: number;
  tema: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  total_alumnos: number;
  presentes: number;
  ausentes: number;
  pendiente_registro: boolean;
}

export interface ResumenSemana {
  semana: string;
  total_clases: number;
  clases_pendientes: number;
  clases_registradas: number;
  clases: ResumenSemanaClase[];
}

export interface EstadisticasClase {
  ASISTENCIA: number;
  INASISTENCIA: number;
  JUSTIFICADO: number;
  ATRASADO: number;
  total: number;
}
