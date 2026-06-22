export type PeriodoTipo = "BIMESTRE" | "TRIMESTRE" | "QUIMESTRE";
export type AnioLectivoEstado = "BORRADOR" | "ACTIVO" | "CERRADO";
export type Jornada = "MATUTINA" | "VESPERTINA" | "NOCTURNA";

export interface EducacionNivel {
  id: number;
  nombre: string;
  codigo: string;
  periodoPedagogicoMinutos: number;
  periodoPedagogicoSemanaMinimo: number;
}

export interface EducacionSubNivel {
  id: number;
  nombre: string;
  codigo: string;
  periodoPedagogicoSemanaMinimo: number;
  nivel: number;
}

export interface PeriodoAcademico {
  id: number;
  orden: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  periodoTipo: PeriodoTipo;
  periodoTipoDisplay: string;
  anioLectivo: number;
}

export interface AnioLectivo {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: AnioLectivoEstado;
  periodosAcademicos: PeriodoAcademico[];
}

export interface PlanEstudio {
  id: number;
  nombre: string;
  esActivo: boolean;
  descripcion: string;
  duracionAnios: number;
  institucion: number | null;
  grados: PlanGrado[];
}

export interface PlanGrado {
  id: number;
  nombre: string;
  planEstudio: number;
  educacionNivel: number;
  educacionSubNivel: number;
  institucion: number | null;
  asignaturas: PlanAsignatura[];
}

export interface PlanAsignatura {
  id: number;
  nombre: string;
  periodoPedagogicoSemanaMinimo: number;
  grado: number;
}

export interface OfertaAcademica {
  id: number;
  nombre: string;
  anioLectivo: number;
  gradosOfertados: GradoOfertado[];
}

export interface GradoOfertado {
  id: number;
  nombre: string;
  ofertaAcademica: number;
  grado: number;
  grado_id: number;
  grado_nombre: string;
  asignaturasOfertadas: AsignaturaOfertada[];
}

export interface AsignaturaOfertada {
  id: number;
  nombre: string;
  gradoOfertado: number;
  asignatura: number;
}

export interface PlanParalelo {
  id: number;
  nombre: string;
  cuposMaximo: number;
  cuposOcupados: number;
  cuposDisponibles: number;
  jornada: Jornada;
  gradoOfertado: number;
  gradoOfertadoNombre: string;
  gradoOfertadoGradoNombre: string;
  docenteTutor: number | null;
}
