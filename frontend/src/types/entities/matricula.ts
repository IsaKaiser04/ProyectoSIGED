export interface Matricula {
  id: number;
  codigo_unico: string | null;
  estado: string;
  estado_display?: string;
  estudiante_id: number;
  estudiante_nombre?: string;
  paralelo_id: number;
  anio_lectivo_id: number;
  representante_id: number;
  secretaria_id: number | null;
  matricula_periodo: number | null;
  institucion_id: number | null;
  exceder_cupo_autorizado?: boolean;
  tiene_discapacidad: boolean;
  tipo_discapacidad: string | null;
  grado_discapacidad: string | null;
  observaciones?: string;
  promedio_anual: number | null;
  fecha_registro: string;
  requisitos_count?: number;
  creado_por?: number;
  legalizada_por?: number;
  created_at?: string;
  updated_at?: string;
  asp_nombres: string;
  asp_apellidos: string;
  asp_fecha_nacimiento: string | null;
  asp_correo_personal: string;
}

export interface MatriculaPeriodo {
  id: number;
  nombre: string;
  tipo: string;
  tipo_display?: string;
  fecha_inicio: string;
  fecha_fin: string;
  institucion_id: number | null;
  institucion_nombre?: string;
  educacion_nivel_id: number | null;
  educacion_nivel_nombre?: string;
  anio_lectivo_id: number | null;
  anio_lectivo_nombre?: string;
}

export interface MatriculaRequisito {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  tipo_display?: string;
  es_obligatorio: boolean;
  periodo_id: number | null;
  periodo_nombre?: string;
  institucion_id: number | null;
  institucion_nombre?: string;
  educacion_nivel_id: number | null;
  educacion_nivel_nombre?: string;
}

export interface Requisito {
  id: number;
  archivo?: string;
  observacion: string;
  estado: string;
  estado_display?: string;
  matricula: number;
  matricula_requisito: number | MatriculaRequisito;
  revisado_por?: number;
  fecha_revision?: string;
}

export interface Retiro {
  id: number;
  fecha: string;
  motivo: string;
  matricula: number;
}
