export type TipoCalculo = "SIMPLE" | "PONDERADO" | "SUPLETORIO";
export type TipoTrimestre = "PRIMERO" | "SEGUNDO" | "TERCERO";
export type EstadoCalificacion = "APROBADO" | "REPROBADO" | "SUPLETORIO";
export type EstadoEntrega = "ENTREGADO" | "PENDIENTE" | "ATRASADO";
export type EquivalenciaCualitativa =
  | "Excelente"
  | "Muy Bueno"
  | "Bueno"
  | "Regular"
  | "Insuficiente";

// Tipos existentes
export type EvaluacionCategoria = {
  id: number;
  nombre: string;
  nota_minima: number;
  nota_maxima: number;
  periodoAcademico_id: number;
  tipo_calculo: TipoCalculo;
  padre: number | null;
  subcategorias: EvaluacionCategoria[];
};

export type EvaluacionCategoriaPayload = {
  nombre: string;
  nota_minima: number;
  nota_maxima: number;
  periodoAcademico_id: number;
  tipo_calculo: TipoCalculo;
  padre: number | null;
};

export const tipoCalculoOptions: Array<{ value: TipoCalculo; label: string }> = [
  { value: "SIMPLE", label: "Simple" },
  { value: "PONDERADO", label: "Ponderado" },
  { value: "SUPLETORIO", label: "Supletorio" }
];

// ===========================================
// NUEVOS TIPOS PARA CALIFICACIONES DOCENTE
// ===========================================

// Año Lectivo
export interface AnoLectivo {
  id: number;
  nombre: string;
  estado: "ACTIVO" | "INACTIVO";
}

// Grado/Nivel
export interface Grado {
  id: number;
  nombre: string;
  nombre_largo: string;
  nivel_id: number;
}

// Paralelo
export interface Paralelo {
  id: number;
  nombre: string; // A, B, C
  grado_id: number;
}

// Asignatura
export interface Asignatura {
  id: number;
  nombre: string;
  codigo?: string;
}

// Estudiante
export interface Estudiante {
  id: number;
  persona_id: number;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  matricula_id: number;
}

// Curso completo (grado + paralelo)
export interface Curso {
  id: number;
  grado: Grado;
  paralelo: Paralelo;
}

// Calificación por estudiante
export interface Calificacion {
  id: number;
  estudiante_id: number;
  anolectivo_id: number;
  curso_id: number;
  asignatura_id: number;

  // Primer Trimestre
  primer_trimestre_ef: number | null; // Evaluación Formativa
  primer_trimestre_es: number | null; // Evaluación Sumativa
  primer_trimestre_total: number | null;

  // Segundo Trimestre
  segundo_trimestre_ef: number | null;
  segundo_trimestre_es: number | null;
  segundo_trimestre_total: number | null;

  // Tercer Trimestre
  tercer_trimestre_ef: number | null;
  tercer_trimestre_es: number | null;
  tercer_trimestre_total: number | null;

  // Promedio Final
  promedio_final: number | null;
  equivalencia_cualitativa: EquivalenciaCualitativa | null;

  // Supletorio y Estado
  supletorio: number | null;
  estado_final: EstadoCalificacion | null;
}

// CalificacionPayload para crear/actualizar
export interface CalificacionPayload {
  estudiante_id: number;
  anolectivo_id: number;
  curso_id: number;
  asignatura_id: number;
  primer_trimestre_ef?: number | null;
  primer_trimestre_es?: number | null;
  segundo_trimestre_ef?: number | null;
  segundo_trimestre_es?: number | null;
  tercer_trimestre_ef?: number | null;
  tercer_trimestre_es?: number | null;
  supletorio?: number | null;
}

// Actividad del Aula Virtual
export interface Actividad {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: "TAREA" | "EXAMEN" | "TRABAJO" | "PARTICIPACION";
  fecha_limite: string | null; // ISO date
  puntaje_maximo: number;
  curso_id: number;
  asignatura_id: number;
  estado: "BORRADOR" | "PUBLICADA" | "CERRADA";
}

export interface ActividadPayload {
  nombre: string;
  descripcion?: string;
  tipo: Actividad["tipo"];
  fecha_limite?: string | null;
  puntaje_maximo: number;
  curso_id: number;
  asignatura_id: number;
  estado?: Actividad["estado"];
}

// Entrega de actividad por estudiante
export interface Entrega {
  id: number;
  actividad_id: number;
  estudiante_id: number;
  archivo_url?: string;
  observaciones?: string;
  estado_entrega: EstadoEntrega;
  fecha_entrega?: string;
}

// Calificación de actividad
export interface CalificacionActividad {
  id: number;
  entrega_id: number;
  actividad_id: number;
  estudiante_id: number;
  nota: number | null;
  retroalimentacion: string | null;
}

export interface CalificacionActividadPayload {
  entrega_id: number;
  actividad_id: number;
  estudiante_id: number;
  nota?: number | null;
  retroalimentacion?: string | null;
}

// Filtros para la vista de calificaciones
export interface FiltrosCalificaciones {
  anoLectivoId: number | null;
  cursoId: number | null; // grado + paralelo
  asignaturaId: number | null;
}

// Helper para calcular equivalencia cualitativa
export function calcularEquivalenciaCualitativa(
  promedio: number | null
): EquivalenciaCualitativa | null {
  if (promedio === null) return null;
  if (promedio >= 10) return "Excelente";
  if (promedio >= 9) return "Muy Bueno";
  if (promedio >= 8) return "Bueno";
  if (promedio >= 7) return "Regular";
  return "Insuficiente";
}

// Helper para calcular estado final
export function calcularEstadoFinal(
  promedio: number | null,
  supletorio: number | null
): EstadoCalificacion | null {
  if (promedio === null && supletorio === null) return null;
  const minima = 7;

  if (promedio !== null && promedio >= minima) return "APROBADO";
  if (supletorio !== null && supletorio >= minima) return "SUPLETORIO";
  return "REPROBADO";
}

// Helper para calcular promedio trimestral
export function calcularTotalTrimestre(ef: number | null, es: number | null): number | null {
  if (ef === null && es === null) return null;
  const efVal = ef ?? 0;
  const esVal = es ?? 0;
  return Math.round(((efVal + esVal) / 2) * 100) / 100;
}

// Helper para calcular promedio final
export function calcularPromedioFinal(
  t1: number | null,
  t2: number | null,
  t3: number | null
): number | null {
  const vals = [t1, t2, t3].filter((v) => v !== null) as number[];
  if (vals.length === 0) return null;
  const sum = vals.reduce((a, b) => a + b, 0);
  return Math.round((sum / vals.length) * 100) / 100;
}
