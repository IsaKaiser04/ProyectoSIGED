// frontend/src/features/planificacion/types.ts

// ============ CATÁLOGOS ============
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
}

// ============ PLAN DE ESTUDIO ============
export interface PlanEstudio {
  id: number;
  nombre: string;
  esActivo: boolean;
}

export interface Grado {
  id: number;
  nombre: string;
  planEstudio: number;
  educacionNivel: number;
  educacionSubNivel: number;
  planEstudioNombre?: string;
  nivelNombre?: string;
  subNivelNombre?: string;
}

export interface Asignatura {
  id: number;
  nombre: string;
  periodoPedagogicoSemanaMinimo: number;
  grado: number;
  gradoNombre?: string;
}

// ============ AÑO LECTIVO ============
export interface AnioLectivo {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  esActivo: boolean;
}

export interface PeriodoAcademico {
  id: number;
  orden: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  periodoTipo: 'BIMESTRE' | 'TRIMESTRE' | 'QUIMESTRE';
  anioLectivo: number;
  anioLectivoNombre?: string;
}

// ============ OFERTA ACADÉMICA ============
export interface OfertaAcademica {
  id: number;
  nombre: string;
  anioLectivo: number;
  anioLectivoNombre?: string;
  anioLectivoFechaInicio?: string;
  anioLectivoFechaFin?: string;
  estaActiva?: boolean;
}

export interface GradoOfertado {
  id: number;
  nombre: string;
  ofertaAcademica: number;
  grado: number;
  ofertaNombre?: string;
  gradoNombre?: string;
  nivelNombre?: string;
}

export interface Paralelo {
  id: number;
  nombre: string;
  cuposMaximo: number;
  cuposOcupados: number;
  gradoOfertado: number;
  gradoOfertadoNombre?: string;
  cuposDisponibles?: number;
  porcentajeOcupacion?: number;
}

// ============ DISTRIBUTIVO ============
export interface DistributivoAsignatura {
  id: number;
  docenteId: number;
  docenteNombre?: string;
  asignaturaOfertada: number;
  asignaturaOfertadaNombre?: string;
  gradoOfertadoNombre?: string;
  paraleloNombre?: string;
  anioLectivo: number;
  horasSemana: number;
  diasSemana: string[];
  horaInicio: string;
  horaFin: string;
  esTutor: boolean;
  estado: 'ACTIVO' | 'INACTIVO' | 'PENDIENTE';
}

export interface PlanificacionCurricular {
  id: number;
  distributivoAsignatura: number;
  archivoPdf?: string;
  estado: 'BORRADOR' | 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  fechaSubida?: string;
  fechaAprobacion?: string;
  observaciones?: string;
}