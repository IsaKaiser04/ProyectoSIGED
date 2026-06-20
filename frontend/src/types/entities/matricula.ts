export interface Matricula {
  id: number;
  codigo_unico: string | null;
  estado: string;
  estado_display?: string;
  estudiante_id: number;
  paralelo_id: number;
  representante_id: number;
  secretaria_id: number | null;
  matricula_periodo: number;
  tiene_discapacidad: boolean;
  tipo_discapacidad: string | null;
  grado_discapacidad: string | null;
  fecha_registro: string;
  promedio_anual: number | null;
}
