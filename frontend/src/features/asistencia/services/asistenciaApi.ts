import { apiPost, getApiBaseUrl, getAuthToken } from "../../../services/apiClient";

export type TipoAsistencia = "Asistencia" | "Inasistencia" | "Justificado" | "Atrasado";

export interface AsignaturaDocente {
  distributivo_asignatura_id: number;
  asignatura: string;
  grado: string;
  paralelo: string;
  paralelo_id: number;
  anio_lectivo: string;
  anio_lectivo_id: number | null;
  docente: string;
}

export interface CeldaAsistencia {
  asistencia_id: number;
  tipo: TipoAsistencia;
  observacion: string;
  notificar: boolean;
}

export interface HorarioMatriz {
  id: number;
  hora_inicio: string;
  hora_fin: string;
  tipo: string;
  clase_id: number | null;
  tema: string;
  descripcion: string;
}

export interface EstudianteMatriz {
  matricula_id: number;
  estudiante_id: number;
  estudiante_nombre: string;
  identificacion: string;
  asistencias: Record<string, CeldaAsistencia | null>;
}

export interface MatrizAsistencia {
  fecha: string;
  dia_semana: string;
  es_futura: boolean;
  periodo_academico: { id: number; nombre: string } | null;
  distributivo_asignatura_id: number;
  asignatura: string;
  paralelo: string;
  horarios: HorarioMatriz[];
  estudiantes: EstudianteMatriz[];
}

export interface AsignaturaEstudiante {
  distributivo_asignatura_id: number;
  asignatura: string;
  docente: string;
  resumen: Record<TipoAsistencia, number>;
  total: number;
  porcentaje_asistencia: number | null;
  registros: {
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    tema: string;
    periodo_academico: string | null;
    tipo: TipoAsistencia;
    observacion: string;
  }[];
}

const BASE = "/asistencia/asistencias";

/** GET que devuelve el mensaje de error del backend (apiGet no lo expone). */
async function getConError<T>(path: string): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error || body?.detail || `Error ${response.status} consultando la asistencia`);
  }
  return body as T;
}

function mensajeDeError(err: any): string {
  return err?.data?.error || err?.data?.detail || err?.message || "No se pudo completar la acción";
}

async function postConError<T>(path: string, data: unknown): Promise<T> {
  try {
    return await apiPost<unknown, T>(path, data);
  } catch (err) {
    throw new Error(mensajeDeError(err));
  }
}

/** Asignaturas del distributivo del docente que inició sesión. */
export function obtenerMisAsignaturas() {
  return getConError<AsignaturaDocente[]>(`${BASE}/mis-asignaturas/`);
}

export function obtenerMatrizAsistencia(distributivoAsignaturaId: number, fecha: string) {
  return getConError<MatrizAsistencia>(
    `${BASE}/matriz/?distributivo_asignatura_id=${distributivoAsignaturaId}&fecha=${fecha}`
  );
}

export function marcarAsistencia(data: {
  distributivo_asignatura_id: number;
  fecha: string;
  horario_id: number;
  matricula_id: number;
  tipo: TipoAsistencia;
  observacion?: string;
  notificar?: boolean;
}) {
  return postConError<CeldaAsistencia>(`${BASE}/marcar/`, data);
}

export function marcarTodosPresentes(data: {
  distributivo_asignatura_id: number;
  fecha: string;
  horario_id: number;
}) {
  return postConError<{ clase_id: number; registrados: number }>(`${BASE}/marcar-todos/`, data);
}

export function registrarClase(data: {
  distributivo_asignatura_id: number;
  fecha: string;
  horario_id: number;
  tema: string;
  descripcion?: string;
}) {
  return postConError<{ clase_id: number; tema: string; descripcion: string; periodo_academico: string | null }>(
    `${BASE}/registrar-clase/`,
    data
  );
}

/** Asistencias del estudiante que inició sesión (US-046). */
export function obtenerMisAsistencias() {
  return getConError<{ matricula_id: number | null; asignaturas: AsignaturaEstudiante[] }>(
    `${BASE}/mis-asistencias/`
  );
}
