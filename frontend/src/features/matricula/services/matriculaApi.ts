import { apiGet, apiPost, apiPatch, apiUpload } from "../../../services/apiClient";
import type { Matricula } from "../../../types/entities/matricula";

export async function obtenerMatriculas() {
  return apiGet<Matricula[]>("/matricula/matriculas/");
}

export async function crearMatricula(data: any) {
  return apiPost("/matricula/matriculas/", data);
}

export async function crearMatriculaConRequisitos(formData: FormData): Promise<any> {
  return apiUpload("/matricula/matriculas/registro-completo/", formData);
}

export async function legalizarMatricula(id: number, data?: any): Promise<any> {
  return apiPost(`/matricula/matriculas/${id}/legalizar/`, data || {});
}

export async function anularMatricula(id: number, motivo: string) {
  return apiPost(`/matricula/matriculas/${id}/anular/`, { motivo });
}

export async function rechazarMatricula(id: number, observacion: string) {
  return apiPatch(`/matricula/matriculas/${id}/`, { estado: "Rechazada", observacion });
}

export async function obtenerPeriodosMatricula() {
  return apiGet<any[]>("/matricula/periodos/");
}

export async function obtenerRequisitos(matriculaId: number) {
  return apiGet<any[]>(`/matricula/matriculas/${matriculaId}/requisitos/`);
}

export async function validarRequisito(requisitoId: number) {
  return apiPost(`/matricula/requisitos/${requisitoId}/validar/`, {});
}

export async function rechazarRequisito(requisitoId: number, observacion: string) {
  return apiPost(`/matricula/requisitos/${requisitoId}/rechazar/`, { observacion });
}
