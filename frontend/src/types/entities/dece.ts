export type ApiListResponse<T> = T[] | { results: T[] };

export type DiscapacidadTipo = 'VISUAL' | 'AUDITIVA' | 'FISICA' | 'INTELECTUAL' | 'LENGUAJE' | 'PSICOSOCIAL' | 'MULTIPLE';
export type DiscapacidadGrado = 'RANGO_0_4' | 'RANGO_5_24' | 'RANGO_25_49' | 'RANGO_50_74' | 'RANGO_75_95' | 'RANGO_96_100';
export type AdaptacionEstado = 'BORRADOR' | 'ENVIADO' | 'NO_APROBADO' | 'APROBADO';

export type CatalogItem = {
  id: number;
  nombre?: string;
  nombres?: string;
  apellidos?: string;
  codigo?: string;
  asignatura_ofertada_nombre?: string | null;
  distributivo_nombre?: string | null;
  estudiante?: number | string | null;
  estudiante_nombre?: string | null;
  [key: string]: unknown;
};

export type AdaptacionCurricular = {
  id: number;
  matricula?: number | null;
  matricula_nombre?: string | null;
  matricula_referencia?: string | null;
  discapacidad_tipo: DiscapacidadTipo;
  discapacidad_grado: DiscapacidadGrado;
  necesidad_educativa: string;
  created_at?: string;
  updated_at?: string;
};

export type AdaptacionCurricularPlanificacion = {
  id: number;
  adaptacion_curricular: number;
  adaptacion_nombre?: string | null;
  distributivo_asignatura?: number | null;
  distributivo_asignatura_nombre?: string | null;
  distributivo_asignatura_referencia?: string | null;
  archivo?: string | null;
  comentario: string;
  estado: AdaptacionEstado;
  created_at?: string;
  updated_at?: string;
};

export type AdaptacionCurricularEvidencia = {
  id: number;
  adaptacion_curricular: number;
  adaptacion_nombre?: string | null;
  archivo?: string | null;
  descripcion: string;
  created_at?: string;
  updated_at?: string;
};
