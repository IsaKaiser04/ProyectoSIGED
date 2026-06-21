export type ApiListResponse<T> = T[] | { results: T[] };

export type CatalogItem = {
  id: number;
  nombre?: string;
  nombres?: string;
  apellidos?: string;
  correo_institucional?: string;
  codigo_amie?: string;
  estado?: string;
};

export type Distributivo = {
  id: number;
  anio_lectivo: number;
  anio_lectivo_nombre?: string;
  docente: number;
  docente_nombre?: string;
  observacion: string;
  created_at: string;
  updated_at: string;
};

export type DistributivoAsignatura = {
  id: number;
  distributivo: number;
  distributivo_nombre?: string;
  asignatura_ofertada: number;
  asignatura_ofertada_nombre?: string;
  observacion: string;
  created_at: string;
  updated_at: string;
};

export type JornadaHora = {
  id: number;
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
  institucion: number | null;
  institucion_nombre?: string;
  created_at: string;
  updated_at: string;
};

export type Horario = {
  id: number;
  distributivo: number;
  distributivo_nombre?: string;
  distributivo_asignatura: number;
  asignatura_nombre?: string;
  jornada_hora: number;
  jornada_nombre?: string;
  hora_inicio: string;
  hora_fin: string;
  observacion: string;
  tipo_horario: string;
  dia_semana: string;
  created_at: string;
  updated_at: string;
};

export type PlanificacionCurricular = {
  id: number;
  distributivo_asignatura: number;
  asignatura_nombre?: string;
  archivo_pdf: string | null;
  observacion: string;
  estado: string;
  created_at: string;
  updated_at: string;
};

export type PlanificacionCurricularHistorial = {
  id: number;
  planificacion_curricular: number;
  fecha: string;
  estado_anterior: string;
  estado_actual: string;
  observacion: string;
};
