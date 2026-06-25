export interface PeriodoAcademico {
  id: number;
  orden: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  periodoTipo: string;
  periodoTipoDisplay: string;
  anioLectivo: number;
}

export interface AnioLectivo {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'BORRADOR' | 'ACTIVO' | 'CERRADO';
  periodosAcademicos: PeriodoAcademico[];
}

export interface AsignaturaOfertada {
  id: number;
  nombre: string;
  gradoOfertado: number;
  asignatura: number;
}

export interface GradoOfertado {
  id: number;
  nombre: string;
  ofertaAcademica: number;
  grado: number;
  asignaturasOfertadas: AsignaturaOfertada[];
}

export interface OfertaAcademica {
  id: number;
  nombre: string;
  anioLectivo: number;
  gradosOfertados: GradoOfertado[];
}

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

export interface PlanEstudio {
  id: number;
  nombre: string;
  esActivo: boolean;
  descripcion: string;
  duracionAnios: number;
  institucion: number | null;
  grados?: any[];
}

export interface Grado {
  id: number;
  nombre: string;
  planEstudio: number;
  educacionNivel: number;
  educacionSubNivel: number;
  institucion: number | null;
  asignaturas?: Asignatura[];
}

export interface Asignatura {
  id: number;
  nombre: string;
  periodoPedagogicoSemanaMinimo: number;
  grado: number;
}

export interface Paralelo {
  id: number;
  nombre: string;
  cuposMaximo: number;
  cuposOcupados: number;
  jornada: 'MATUTINA' | 'VESPERTINA' | 'NOCTURNA' | null;
  gradoOfertado: number;
  docenteTutor: number | null;
  docenteTutorNombre?: string | null;
}
