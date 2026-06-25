export type ApiListResponse<T> = T[] | { results: T[] };

export type CatalogItem = {
  id: number;
  nombre?: string;
  nombres?: string;
  apellidos?: string;
  estado?: string;
  asignatura_ofertada_nombre?: string;
};

export type AdaptacionCurricular = {
  id: number;
  matricula: number;
  matricula_nombre?: string;
  discapacidad_tipo: string;
  discapacidad_grado: string;
  necesidad_educativa: string;
  created_at: string;
  updated_at: string;
};

export type AdaptacionCurricularEvidencia = {
  id: number;
  adaptacion_curricular: number;
  adaptacion_nombre?: string;
  archivo: string | null;
  descripcion: string;
  created_at: string;
  updated_at: string;
};

export type AdaptacionCurricularPlanificacion = {
  id: number;
  adaptacion_curricular: number;
  adaptacion_nombre?: string;
  distributivo_asignatura: number;
  distributivo_asignatura_nombre?: string;
  archivo: string | null;
  comentario: string;
  estado: string;
  created_at: string;
  updated_at: string;
};
