export interface AnioLectivo {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

export interface Curso {
  id: number;
  nombre: string;
  gradoOfertado: number;
  paralelo: number;
  jornada: string;
}

export interface Trimestre {
  ef: number;
  es: number;
}

export interface Calificacion {
  id: number;
  valor: number;
  observacion: string;
  fecha_registro: string;
  fecha_actualizacion: string;
  asignatura_evaluacion: number;
  matricula: number;
  promedio_categoria: number;
  estudiante_nombre: string;
  evaluacion_nombre?: string;
  primer_trimestre?: Trimestre;
  segundo_trimestre?: Trimestre;
  tercer_trimestre?: Trimestre;
  supletorio?: number;
  estado?: string;
}

export interface CalificacionPayload {
  valor: number;
  observacion?: string;
  asignatura_evaluacion: number;
  matricula: number;
  promedio_categoria?: number;
}

export interface Actividad {
  id: number;
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  distributivo_asignatura: number;
  periodo_academico: number;
}

export interface ActividadPayload {
  nombre: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  activo?: boolean;
  distributivo_asignatura: number;
  periodo_academico?: number;
}

export interface Entrega {
  id: number;
  matricula: number;
  estudiante_nombre: string;
  fecha_entrega: string;
  estado: string;
  archivo?: string;
}

export interface CalificacionActividad {
  id: number;
  valor: number;
  observacion: string;
  entrega: number;
}

export interface CalificacionActividadPayload {
  valor: number;
  observacion?: string;
  entrega: number;
}

export interface Estudiante {
  id: number;
  nombres: string;
  apellidos: string;
  identificacion: string;
}

export interface FiltrosCalificaciones {
  anioLectivoId?: number;
  cursoId?: number;
  asignaturaId?: number;
}

export interface ActividadEstudiante {
  id: number;
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  nota?: number;
}

export interface EntregaEstudiante {
  id: number;
  actividad: number;
  fecha_entrega: string;
  estado: string;
  archivo?: string;
  calificacion?: number;
  retroalimentacion?: string;
}

export interface EvaluacionCategoria {
  id: number;
  nombre: string;
  nota_minima: number;
  nota_maxima: number;
  periodoAcademico_id: number;
  tipo_calculo: string;
  padre: number | null;
  subcategorias: EvaluacionCategoria[];
}

export interface EvaluacionCategoriaPayload {
  nombre: string;
  nota_minima: number;
  nota_maxima: number;
  periodoAcademico_id: number;
  tipo_calculo?: string;
  padre?: number | null;
}
