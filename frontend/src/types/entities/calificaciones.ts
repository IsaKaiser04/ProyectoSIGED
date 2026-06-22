export type TipoCalculo = "SIMPLE" | "PONDERADO" | "SUPLETORIO";

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

export type AnoLectivo = {
  id: number;
  nombre: string;
  codigo: string;
  activo: boolean;
  fecha_inicio: string;
  fecha_fin: string;
};

export type Curso = {
  id: number;
  nombre: string;
  codigo: string;
  grado: string;
  paralelo: string;
};

export type Asignatura = {
  id: number;
  nombre: string;
  codigo: string;
  horas_semanales: number;
};

export type Estudiante = {
  id: number;
  nombres: string;
  apellidos: string;
  cedula: string;
  correo: string;
};

export type Trimestre = {
  ef: number;
  es: number;
};

export type Calificacion = {
  id: number;
  estudiante_id: number;
  libro_id: number;
  primer_trimestre: Trimestre;
  segundo_trimestre: Trimestre;
  tercer_trimestre: Trimestre;
  supletorio: number;
};

export type CalificacionPayload = {
  estudiante_id: number;
  libro_id: number;
  primer_trimestre: Trimestre;
  segundo_trimestre: Trimestre;
  tercer_trimestre: Trimestre;
  supletorio: number;
};

export type Actividad = {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  estado: string;
  fecha_limite: string;
  puntaje_maximo: number;
  curso_id: number;
  asignatura_id: number;
};

export type ActividadPayload = {
  nombre: string;
  descripcion: string;
  tipo: string;
  fecha_limite: string;
  puntaje_maximo: number;
  curso_id: number;
  asignatura_id: number;
};

export type Entrega = {
  id: number;
  actividad_id: number;
  estudiante_id: number;
  estudiante: Estudiante;
  archivo_url: string;
  estado_entrega: string;
  fecha_entrega: string;
};

export type CalificacionActividad = {
  id: number;
  entrega_id: number;
  calificacion: number;
  observacion: string;
};

export type CalificacionActividadPayload = {
  entrega_id: number;
  calificacion: number;
  observacion: string;
};

export type FiltrosCalificaciones = {
  anoLectivoId?: number;
  cursoId?: number;
  asignaturaId?: number;
  estudianteId?: number;
};

// Tipos para estudiante - Aula Virtual
export type ActividadEstudiante = {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  estado: string;
  fecha_limite: string;
  puntaje_maximo: number;
  actividad_id: number;
};

export type EntregaEstudiante = {
  id: number;
  actividad_id: number;
  archivo_url: string | null;
  estado_entrega: string;
  fecha_entrega: string | null;
  calificacion: number | null;
  retroalimentacion: string | null;
};

export function calcularTotalTrimestre(trimestre: Trimestre): number {
  return (trimestre.ef || 0) + (trimestre.es || 0);
}

export function calcularPromedioFinal(cal: Calificacion): number {
  const t1 = calcularTotalTrimestre(cal.primer_trimestre);
  const t2 = calcularTotalTrimestre(cal.segundo_trimestre);
  const t3 = calcularTotalTrimestre(cal.tercer_trimestre);
  return (t1 + t2 + t3) / 3;
}

export function calcularEquivalenciaCualitativa(promedio: number): string {
  if (promedio >= 9) return "Excelente";
  if (promedio >= 8) return "Muy Buena";
  if (promedio >= 7) return "Buena";
  if (promedio >= 5) return "Suficiente";
  return "Insuficiente";
}

export function calcularEstadoFinal(cal: Calificacion): string {
  const promedio = calcularPromedioFinal(cal);
  if (promedio >= 7) return "Aprobado";
  const conSupletorio = (promedio * 3 + (cal.supletorio || 0)) / 4;
  if (conSupletorio >= 7) return "Aprobado";
  return "Reprobado";
}
