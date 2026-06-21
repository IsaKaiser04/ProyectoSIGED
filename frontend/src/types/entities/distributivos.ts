export type ApiListResponse<T> = T[] | { results: T[] };

export type HorarioTipo = 'CLASE' | 'COMPLEMENTARIA';
export type DiasSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES';
export type PlanificacionEstado = 'BORRADOR' | 'POR_APROBAR' | 'APROBADO';

export type CatalogItem = {
  id: number;
  nombre?: string;
  nombres?: string;
  apellidos?: string;
  identificacion?: string;
  correo_institucional?: string;
  codigo_amie?: string;
  fechaInicio?: string;
  fechaFin?: string;
  esActivo?: boolean;
  [key: string]: unknown;
};

export type Distributivo = {
  id: number;
  anio_lectivo?: number | null;
  anio_lectivo_nombre?: string | null;
  anio_lectivo_referencia?: string | null;
  docente?: number | null;
  docente_nombre?: string | null;
  docente_referencia?: string | null;
  observacion?: string;
  created_at?: string;
  updated_at?: string;
};

export type DistributivoAsignatura = {
  id: number;
  distributivo?: number | null;
  distributivo_nombre?: string | null;
  asignatura_ofertada?: number | null;
  asignatura_ofertada_nombre?: string | null;
  asignatura_ofertada_referencia?: string | null;
  observacion?: string;
  created_at?: string;
  updated_at?: string;
};

export type JornadaHora = {
  id: number;
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
  institucion?: number | null;
  institucion_nombre?: string | null;
  institucion_educativa_referencia?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Horario = {
  id: number;
  distributivo?: number | null;
  distributivo_nombre?: string | null;
  distributivo_asignatura?: number | null;
  asignatura_nombre?: string | null;
  jornada_hora?: number | null;
  jornada_nombre?: string | null;
  hora_inicio: string;
  hora_fin: string;
  observacion?: string;
  tipo_horario: HorarioTipo;
  dia_semana: DiasSemana;
  created_at?: string;
  updated_at?: string;
};

export type PlanificacionCurricular = {
  id: number;
  distributivo_asignatura?: number | null;
  asignatura_nombre?: string | null;
  archivo_pdf?: string | null;
  observacion?: string;
  estado: PlanificacionEstado;
  created_at?: string;
  updated_at?: string;
};

export type PlanificacionCurricularHistorial = {
  id: number;
  planificacion_curricular: number;
  planificacion_nombre?: string | null;
  fecha?: string;
  estado_anterior: PlanificacionEstado;
  estado_actual: PlanificacionEstado;
  observacion?: string;
};
