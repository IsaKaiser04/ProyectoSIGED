import { apiGet, apiPost } from "../../../services/apiClient";

export async function obtenerMatrizAsistencia(
  distributivoAsignaturaId: number,
  fecha: string
) {
  return apiGet<any>(
    `/asistencia/asistencias/matriz/?distributivo_asignatura_id=${distributivoAsignaturaId}&fecha=${fecha}`
  );
}

export async function marcarAsistencia(data: {
  distributivo_asignatura_id: number;
  fecha: string;
  horario_id?: number;
  matricula_id: number;
  tipo: string;
  observacion?: string;
  notificar?: boolean;
}) {
  return apiPost<any>("/asistencia/asistencias/marcar/", data);
}
