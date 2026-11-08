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

// ═══════════════════════════════════════════════════════════════════════════
// Módulo docente de calificaciones (matriz por periodo, reporte anual).
// Contrato: apps/calificaciones/services/matriz_service.py y
// apps/calificaciones/views/docente_escritura_view.py. Lo de arriba es legacy
// y lo siguen usando las páginas de estudiante y el aula virtual.
// ═══════════════════════════════════════════════════════════════════════════

/** El backend solo acepta estos dos para actividades (SUPLETORIO es otro modelo). */
export type TipoCalculoActividad = "SIMPLE" | "PONDERADO";

/** Estado anual que devuelve PromedioService.estado_final. */
export type EstadoFinalAsignatura = "EN_CURSO" | "APROBADO" | "SUPLETORIO" | "REPROBADO";

/** Tarjeta de GET /calificaciones/distributivo/docente/ (MisAsignaturasDocenteView). */
export interface AsignaturaDocente {
  id: number; // id de DistributivoAsignatura
  asignatura: { nombre: string };
  grado: { nombre: string | null; nivel: string | null };
  paralelo: { nombre: string | null };
  anio_lectivo: { id: number; nombre: string } | null;
  institucion: { nombre: string } | null;
  cantidad_estudiantes: number;
}

export interface AsignaturasDocenteResponse {
  distributivos: AsignaturaDocente[];
  total: number;
}

export interface MatrizActividad {
  id: number;
  nombre: string;
  descripcion: string;
  tipo_calculo: TipoCalculoActividad;
  fecha_entrega: string | null;
  /** Fracción 0–1. null si la actividad es simple. */
  peso: number | null;
}

export interface MatrizPeriodo {
  id: number;
  orden: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  /** true cuando hoy > fecha_fin (lo decide el backend con su zona horaria). */
  cerrado: boolean;
  tipo_calculo: TipoCalculoActividad | null;
  /** Mensaje del backend si los pesos no suman 100 % o hay tipos mezclados. */
  error_configuracion: string | null;
  actividades: MatrizActividad[];
}

export interface MatrizNota {
  calificacion_id: number;
  valor: number;
  cualitativa: string;
}

export interface MatrizPromedio {
  valor: number | null;
  cualitativa: string;
}

export interface MatrizEstudiante {
  matricula_id: number;
  estudiante_id: number;
  nombres: string;
  apellidos: string;
  identificacion: string;
  /** Clave: id de actividad (string). */
  notas: Record<string, MatrizNota>;
  /** Clave: id de periodo (string). */
  promedios_periodo: Record<string, MatrizPromedio>;
  nota_final: number | null;
  cualitativa_final: string;
  nota_final_completa: boolean;
  supletorio_habilitado: boolean;
  supletorio: number | null;
  estado_final: EstadoFinalAsignatura;
}

export interface MatrizCalificaciones {
  asignatura: {
    id: number;
    nombre: string | null;
    grado: string | null;
    paralelo: string | null;
    anio_lectivo: { id: number; nombre: string } | null;
  };
  nota_minima_aprobacion: number;
  anio_cerrado: boolean;
  periodos: MatrizPeriodo[];
  estudiantes: MatrizEstudiante[];
}

/** Cuerpo de POST/PATCH de actividades del docente. No lleva periodo: lo asigna el backend. */
export interface ActividadDocentePayload {
  nombre: string;
  descripcion?: string;
  fecha_entrega: string;
  tipo_calculo: TipoCalculoActividad;
  /** Fracción 0–1; null para simples. */
  peso: number | null;
}

export interface ActividadDocente {
  id: number;
  nombre: string;
  descripcion: string;
  fecha_entrega: string;
  tipo_calculo: TipoCalculoActividad;
  peso: number | null;
  periodo_academico: number;
  distributivo_asignatura: number;
}

export interface NotaPayload {
  matricula: number;
  valor: number;
  observacion?: string;
}

export interface NotaRegistrada {
  calificacion_id: number;
  actividad_id: number;
  matricula_id: number;
  valor: number;
  cualitativa: string;
  fila: MatrizEstudiante;
}

export interface SupletorioPayload {
  matricula: number;
  valor: number;
  observacion?: string;
}

export interface SupletorioRegistrado {
  fila: MatrizEstudiante;
}
