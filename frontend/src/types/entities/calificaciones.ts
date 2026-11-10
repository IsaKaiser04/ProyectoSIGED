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

/** Sección de la rúbrica de actividades del año (Tareas, Lecciones...). */
export interface MatrizSeccion {
  id: number;
  nombre: string;
  /** Fracción 0–1 dentro de la nota del periodo. */
  peso: number;
  orden: number;
}

export interface MatrizActividad {
  id: number;
  nombre: string;
  descripcion: string;
  seccion_id: number;
  fecha_entrega: string | null;
}

export interface MatrizPeriodo {
  id: number;
  orden: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  /** true cuando hoy > fecha_fin (lo decide el backend con su zona horaria). */
  cerrado: boolean;
  /** Ordenadas por sección y fecha de entrega. */
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
  /** Clave: id de periodo y luego id de sección (solo secciones con actividades). */
  promedios_seccion: Record<string, Record<string, MatrizPromedio>>;
  /** Actividades del año sin nota. Mientras haya, el año no está completo. */
  notas_pendientes: number;
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
  /** Rúbrica del año lectivo: la misma para todos los periodos y grados. */
  rubrica: { configurada: boolean; secciones: MatrizSeccion[] };
  anio_cerrado: boolean;
  periodos: MatrizPeriodo[];
  estudiantes: MatrizEstudiante[];
}

/** Cuerpo de POST/PATCH de actividades del docente. No lleva periodo: lo asigna el backend. */
export interface ActividadDocentePayload {
  nombre: string;
  descripcion?: string;
  fecha_entrega: string;
  /** id de la sección de la rúbrica. */
  evaluacion_categoria: number;
}

export interface ActividadDocente {
  id: number;
  nombre: string;
  descripcion: string;
  fecha_entrega: string;
  evaluacion_categoria: number;
  periodo_academico: number;
  distributivo_asignatura: number;
}

// ─── Rúbrica de actividades (Autoridad / Secretaría) ───────────────────────
// Contrato: apps/calificaciones/services/rubrica_service.py

export interface SeccionRubrica {
  id: number;
  nombre: string;
  /** Fracción 0–1. */
  peso: number;
  orden: number;
  /** Con actividades no se puede quitar. */
  tiene_actividades: boolean;
}

export interface RubricaActividades {
  anio_lectivo: { id: number; nombre: string };
  configurada: boolean;
  /** false en cuanto un periodo del año cerró: solo se puede renombrar y reordenar. */
  estructura_editable: boolean;
  secciones: SeccionRubrica[];
}

export interface SeccionRubricaPayload {
  /** Sin id = sección nueva. */
  id?: number | null;
  nombre: string;
  peso: number;
  orden: number;
}

export interface RubricaActividadesPayload {
  anio_lectivo: number;
  secciones: SeccionRubricaPayload[];
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

// ─── Reporte de notas (GET docente/reporte-notas/ y reporte-notas/) ─────────
export interface SemanaAvance {
  actual: number;
  total: number;
}

export interface NivelReporte {
  nivel: string;
  cantidad: number;
  porcentaje: number;
}

export interface FilaReporteNotas {
  distributivo_asignatura_id: number;
  asignatura: string | null;
  grado: { id: number | null; nombre: string | null };
  paralelo: string | null;
  docente: string | null;
  estudiantes: number;
  /** Actividades con fecha de entrega hasta hoy. */
  actividades: number;
  con_nota: number;
  promedio: number | null;
  cualitativa: string;
  distribucion: NivelReporte[];
  notas_pendientes: number;
}

export interface ReporteNotas {
  anio_lectivo: { id: number; nombre: string } | null;
  fecha: string;
  semana_anio: SemanaAvance | null;
  periodo_actual: { id: number; nombre: string; semana: SemanaAvance } | null;
  niveles: string[];
  rubrica_configurada: boolean;
  asignaturas: FilaReporteNotas[];
  totales: { asignaturas: number; estudiantes: number; notas_pendientes: number };
}
