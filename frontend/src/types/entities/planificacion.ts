// frontend/src/features/planificacion/types.ts

// frontend/src/types/entities/planificacion.ts (o src/features/planificacion/types.ts)

// ============ CATÁLOGOS ============
export interface PlanEstudio {
  id: number;
  nombre: string;
  esActivo: boolean;
  institucion: number;
}

export interface EducacionNivel {
  id: number;
  nombre: string;
  codigo?: string;
}

export interface EducacionSubNivel {
  id: number;
  nombre: string;
  codigo?: string;
}

export interface Asignatura {
  id: number;
  nombre: string;
  periodoPedagogicoSemanaMinimo: number;
  grado: number;
}

export interface Grado {
  id: number;
  nombre: string;
  planEstudio: number;       // FK id: 3
  educacionNivel: number;    // FK id: 1
  educacionSubNivel: number; // FK id: 3
  asignaturas?: Asignatura[];
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

export interface PeriodoAcademico {
  id: number;
  orden: string;
  nombre: string;
  fechaInicio: string; // Formato YYYY-MM-DD para inputs de tipo date
  fechaFin: string;    // Formato YYYY-MM-DD
  periodoTipo: PeriodoTipo;
  periodoTipoDisplay: string; // 💡 Agregado: Viene del 'get_periodoTipo_display' del backend
  anioLectivo: number;        // FK (ID del año lectivo al que pertenece)
}
export type PeriodoTipo = 'BIMESTRE' | 'TRIMESTRE' | 'QUIMESTRE';

export interface AnioLectivo {
  id: number;
  nombre: string;
  fechaInicio: string; // Formato YYYY-MM-DD
  fechaFin: string;    // Formato YYYY-MM-DD
  esActivo: boolean;
  institucion: number; // 💡 Corrección Crítica: El ID de la institución obligatorio para el POST/PUT
  
  // 💡 Relaciones Inversas (Anidadas): Permite renderizar sub-tablas o contadores en el Frontend sin hacer fetches extra
  periodosAcademicos?: PeriodoAcademico[]; 
}

// ============ OFERTA ACADÉMICA ============

export interface AsignaturaOfertada {
  id: number;
  nombre: string;
  gradoOfertado: number; // FK id hacia GradoOfertado
  asignatura: number;    // FK id hacia Asignatura (Base)
}

export interface GradoOfertado {
  id: number;
  nombre: string;
  ofertaAcademica: number; // FK id hacia OfertaAcademica
  grado: number;           // FK id hacia Grado (Base)
  
  // 💡 Relación Inversa (Anidada): Mapea directamente con 'asignaturas_ofertadas' del backend
  asignaturasOfertadas?: AsignaturaOfertada[];
}

export interface OfertaAcademica {
  id: number;
  nombre: string;
  anioLectivo: number; // FK id hacia AnioLectivo (Relación OneToOne)
  
  // 💡 Relación Inversa (Anidada): Mapea directamente con 'grados_ofertados' del backend
  gradosOfertados?: GradoOfertado[];
}